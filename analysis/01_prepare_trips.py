from pathlib import Path
import json

import pandas as pd
import pyarrow.parquet as pq


RAW_DIR = Path("data/raw")
GAMES_FILE = Path("data/reference/games.json")
OUTPUT_FILE = Path("data/processed/trips/game_trips.parquet")

MSG_ZONE = 186
RADIO_CITY_ZONE = 161
CENTRAL_PARK_ZONE = 43
BROOKLYN_BOWL_ZONE = 255
BRYANT_PARK_ZONE = 164

BATCH_SIZE = 250_000
TIMEZONE = "America/New_York"

TAXI_CONFIG = {
    "yellow": {
        "directory": RAW_DIR / "yellow",
        "pickup_col": "tpep_pickup_datetime",
        "dropoff_col": "tpep_dropoff_datetime",
        "pickup_zone_col": "PULocationID",
        "dropoff_zone_col": "DOLocationID",
        "passenger_count_col": "passenger_count",
    },
    "green": {
        "directory": RAW_DIR / "green",
        "pickup_col": "lpep_pickup_datetime",
        "dropoff_col": "lpep_dropoff_datetime",
        "pickup_zone_col": "PULocationID",
        "dropoff_zone_col": "DOLocationID",
        "passenger_count_col": "passenger_count",
    },
    "fhvhv": {
        "directory": RAW_DIR / "fhv",
        "pickup_col": "pickup_datetime",
        "dropoff_col": "dropoff_datetime",
        "pickup_zone_col": "PULocationID",
        "dropoff_zone_col": "DOLocationID",
    },
}


def load_games():
    with open(GAMES_FILE, "r", encoding="utf-8") as file:
        games = json.load(file)

    for game in games:
        game["game_id"] = game["id"]

        tipoff = pd.Timestamp(game["tipoff"]).tz_convert(TIMEZONE)

        game_end = tipoff + pd.Timedelta(minutes=game["duration"])

        game["tipoff"] = tipoff
        game["game_end"] = game_end

        # Pregame: tipoff - 2 hours <= pickup < tipoff
        game["pre_start"] = tipoff - pd.Timedelta(hours=2)
        game["pre_end"] = tipoff

        # Postgame: game_end <= pickup < game_end + 3 hours
        game["post_start"] = game_end
        game["post_end"] = game_end + pd.Timedelta(hours=3)

    return games


def get_attention_zones(game):
    """
    Return the TLC zones that should be monitored for a specific game.

    Every game monitors MSG.

    Game ID 14:
        MSG + Radio City

    Finals:
        MSG + Central Park

        Game ID 17 additionally monitors:
            Bryant Park + Brooklyn Bowl

        Game ID 18 additionally monitors:
            Brooklyn Bowl

        Game ID 19 additionally monitors:
            Radio City
    """

    zones = {MSG_ZONE}

    game_id = game["game_id"]

    # Game 14 is the final game of the Eastern Conference Finals.
    if game_id == 14:
        zones.add(RADIO_CITY_ZONE)

    # Additional attention zones for the NBA Finals.
    if game["series"] == "finals":
        zones.add(CENTRAL_PARK_ZONE)

        if game_id == 17:
            zones.add(BRYANT_PARK_ZONE)
            zones.add(BROOKLYN_BOWL_ZONE)

        elif game_id == 18:
            zones.add(BROOKLYN_BOWL_ZONE)

        elif game_id == 19:
            zones.add(RADIO_CITY_ZONE)

    return zones


def build_windows(games):
    windows = []

    for game in games:
        base = {
            "game_id": game["game_id"],
            "game": game["game"],
            "series": game["series"],
            "home": game["home"],
            "opponent": game["opponent"],
            "attention_zones": get_attention_zones(game),
        }

        windows.append({
            **base,
            "period": "pre-game",
            "start": game["pre_start"],
            "end": game["pre_end"],
        })

        windows.append({
            **base,
            "period": "post-game",
            "start": game["post_start"],
            "end": game["post_end"],
        })

    return windows


def assign_game_periods(df, windows):
    results = []

    for window in windows:
        time_mask = (
            (df["pickup_datetime"] >= window["start"])
            & (df["pickup_datetime"] < window["end"])
        )

        period_df = df.loc[time_mask].copy()

        if period_df.empty:
            continue

        attention_zones = window["attention_zones"]

        if window["period"] == "pre-game":
            period_df = period_df[
                period_df["dropoff_zone"].isin(attention_zones)
            ]

            if period_df.empty:
                continue

            period_df["attention_zone"] = period_df["dropoff_zone"]

        else:
            period_df = period_df[
                period_df["pickup_zone"].isin(attention_zones)
            ]

            if period_df.empty:
                continue

            period_df["attention_zone"] = period_df["pickup_zone"]

        period_df["game_id"] = window["game_id"]
        period_df["game"] = window["game"]
        period_df["series"] = window["series"]
        period_df["home"] = window["home"]
        period_df["opponent"] = window["opponent"]
        period_df["period"] = window["period"]

        results.append(period_df)

    if not results:
        return pd.DataFrame()

    return pd.concat(results, ignore_index=True)


def process_file(path, taxi_type, config, windows):
    print(f"\nProcessing {path}")

    parquet_file = pq.ParquetFile(path)

    columns = [
        config["pickup_col"],
        config["dropoff_col"],
        config["pickup_zone_col"],
        config["dropoff_zone_col"],
    ]

    if "passenger_count_col" in config:
        columns.append(config["passenger_count_col"])

    output_chunks = []

    for batch_number, batch in enumerate(
        parquet_file.iter_batches(
            batch_size=BATCH_SIZE,
            columns=columns
        ),
        start=1
    ):
        df = batch.to_pandas()

        rename_columns = {
            config["pickup_col"]: "pickup_datetime",
            config["dropoff_col"]: "dropoff_datetime",
            config["pickup_zone_col"]: "pickup_zone",
            config["dropoff_zone_col"]: "dropoff_zone",
        }

        if "passenger_count_col" in config:
            rename_columns[
                config["passenger_count_col"]
            ] = "passenger_count"

        df = df.rename(columns=rename_columns)

        df = df[
            ~df["pickup_zone"].isin([264, 265])
            & ~df["dropoff_zone"].isin([264, 265])
        ]

        if taxi_type in ["yellow", "green"]:
            df = df[df["passenger_count"] > 0]

        if df.empty:
            continue

        df["pickup_datetime"] = (
            pd.to_datetime(df["pickup_datetime"])
            .dt.tz_localize(TIMEZONE)
        )

        df["dropoff_datetime"] = (
            pd.to_datetime(df["dropoff_datetime"])
            .dt.tz_localize(TIMEZONE)
        )

        relevant = assign_game_periods(df, windows)

        if not relevant.empty:
            relevant["taxi_type"] = taxi_type

            relevant = relevant[
                [
                    "game_id",
                    "game",
                    "series",
                    "home",
                    "opponent",
                    "period",
                    "attention_zone",
                    "taxi_type",
                    "pickup_datetime",
                    "dropoff_datetime",
                    "pickup_zone",
                    "dropoff_zone",
                ]
            ]

            output_chunks.append(relevant)

        if batch_number % 10 == 0:
            print(f"  Processed batch {batch_number}")

    if not output_chunks:
        return pd.DataFrame()

    return pd.concat(output_chunks, ignore_index=True)


def main():
    games = load_games()
    windows = build_windows(games)

    print(f"Loaded {len(games)} games.")
    print(f"Created {len(windows)} game periods.")

    print("\nGAME ATTENTION ZONES")

    for game in games:
        zones = sorted(get_attention_zones(game))

        print(
            f"  ID {game['game_id']} "
            f"(Game {game['game']}, {game['series']}): "
            f"{zones}"
        )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    all_trips = []

    for taxi_type, config in TAXI_CONFIG.items():
        files = sorted(config["directory"].glob("*.parquet"))

        if not files:
            print(f"\nNo files found for {taxi_type}")
            continue

        for file in files:
            trips = process_file(
                file,
                taxi_type,
                config,
                windows
            )

            if not trips.empty:
                all_trips.append(trips)
                print(f"  Relevant trips: {len(trips):,}")

    if not all_trips:
        raise RuntimeError("No relevant trips were found.")

    result = pd.concat(all_trips, ignore_index=True)

    result = result.sort_values(
        [
            "game_id",
            "period",
            "taxi_type",
            "pickup_datetime",
        ]
    ).reset_index(drop=True)

    print("\n" + "=" * 80)
    print("FINAL RESULT")
    print("=" * 80)

    print(f"Relevant trips: {len(result):,}")
    print(f"Games: {result['game_id'].nunique()}")
    print(f"Taxi types: {result['taxi_type'].unique().tolist()}")

    print("\nTrips by taxi type:")
    print(result["taxi_type"].value_counts())

    print("\nTrips by period:")
    print(result["period"].value_counts())

    print("\nTrips by game:")
    print(result.groupby(["game_id", "game", "period"]).size())

    print("\nTrips by attention zone:")
    print(
        result.groupby(
            [
                "game_id",
                "game",
                "period",
                "attention_zone",
            ]
        ).size()
    )

    result.to_parquet(
        OUTPUT_FILE,
        engine="pyarrow",
        compression="zstd",
        index=False
    )

    print(f"\nSaved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()