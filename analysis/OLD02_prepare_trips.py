from pathlib import Path
import json

import pandas as pd
import pyarrow.parquet as pq


RAW_DIR = Path("data/raw")
GAMES_FILE = Path("data/reference/games.json")
OUTPUT_FILE = Path("data/processed/trips/game_trips.parquet")

MSG_ZONE = 186
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
        # Generate an internal ID automatically.
        game["game_id"] = f"game-{game['game']}"

        # Convert tipoff to timezone-aware datetime.
        tipoff = pd.Timestamp(game["tipoff"]).tz_convert(TIMEZONE)

        # Calculate the actual end of the game.
        game_end = tipoff + pd.Timedelta(minutes=game["duration"])

        # Store calculated times.
        game["tipoff"] = tipoff
        game["game_end"] = game_end

        # Pre-game:
        # tipoff - 2 hours <= pickup < tipoff
        game["pre_start"] = tipoff - pd.Timedelta(hours=2)
        game["pre_end"] = tipoff

        # Post-game:
        # game_end <= pickup < game_end + 3 hours
        game["post_start"] = game_end
        game["post_end"] = game_end + pd.Timedelta(hours=3)

    return games


def build_windows(games):
    windows = []

    for game in games:
        base = {
            "game_id": game["game_id"],
            "game": game["game"],
            "series": game["series"],
            "home": game["home"],
            "opponent": game["opponent"],
        }

        # ---------------------------------------------------------
        # PRE-GAME
        # ---------------------------------------------------------
        windows.append({
            **base,
            "period": "pre-game",
            "start": game["pre_start"],
            "end": game["pre_end"],
        })

        # ---------------------------------------------------------
        # POST-GAME
        # ---------------------------------------------------------
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
        # Use pickup time for BOTH periods.
        time_mask = (
            (df["pickup_datetime"] >= window["start"])
            & (df["pickup_datetime"] < window["end"])
        )

        period_df = df.loc[time_mask].copy()

        if period_df.empty:
            continue

        if window["period"] == "pre-game":
            # Pre-game:
            # Trips ending at MSG / Penn Station.
            period_df = period_df[
                period_df["dropoff_zone"] == MSG_ZONE
            ]

        else:
            # Post-game:
            # Trips leaving MSG / Penn Station.
            period_df = period_df[
                period_df["pickup_zone"] == MSG_ZONE
            ]

        if period_df.empty:
            continue

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

        # Rename the different taxi dataset schemas
        # into one common schema.
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

        # Remove trips involving unknown TLC zones.
        df = df[
            ~df["pickup_zone"].isin([264, 265])
            & ~df["dropoff_zone"].isin([264, 265])
        ]

        # Remove zero-passenger Yellow/Green trips.
        if taxi_type in ["yellow", "green"]:
            df = df[df["passenger_count"] > 0]

        if df.empty:
            continue

        # TLC timestamps are timezone-naive, so interpret them
        # as New York local time.
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
        ["game", "period", "taxi_type", "pickup_datetime"]
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
    print(result.groupby(["game", "period"]).size())

    result.to_parquet(
        OUTPUT_FILE,
        engine="pyarrow",
        compression="zstd",
        index=False
    )

    print(f"\nSaved to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()