from pathlib import Path

import pandas as pd


INPUT_FILE = Path("data/processed/trips/game_trips.parquet")
OUTPUT_DIR = Path("data/processed/aggregates")


def load_trips():
    print(f"Loading {INPUT_FILE}...")

    df = pd.read_parquet(INPUT_FILE)

    print(f"Loaded {len(df):,} trips.")

    return df


def prepare_zone_data(df):
    """
    Convert trip-level data into zone-level data.

    Pre-game:
        origin zone -> attention zone

        The relevant zone is the pickup/origin zone.

    Post-game:
        attention zone -> destination zone

        The relevant zone is the dropoff/destination zone.
    """

    result = df.copy()

    # Pre-game trips are represented by their pickup/origin zone.
    result["zone"] = result["pickup_zone"]

    post_mask = result["period"] == "post-game"

    # Post-game trips are represented by their dropoff/destination zone.
    result.loc[post_mask, "zone"] = result.loc[
        post_mask,
        "dropoff_zone"
    ]

    return result


def aggregate_game_zones(df):
    """
    Aggregate trips by individual game, period, taxi type,
    attention zone, and relevant origin/destination zone.

    Pre-game:
        pickup zone -> attention zone

        Aggregates by pickup zone.

    Post-game:
        attention zone -> dropoff zone

        Aggregates by dropoff zone.
    """

    grouped = (
        df.groupby(
            [
                "game_id",
                "game",
                "series",
                "home",
                "opponent",
                "period",
                "taxi_type",
                "attention_zone",
                "zone",
            ],
            as_index=False
        )
        .size()
        .rename(columns={"size": "trip_count"})
    )

    return grouped


def aggregate_series_zones(df):
    """
    Aggregate individual games into playoff series.

    Attention zones are preserved so the frontend can filter
    the map by monitored location.
    """

    grouped = (
        df.groupby(
            [
                "series",
                "home",
                "period",
                "taxi_type",
                "attention_zone",
                "zone",
            ],
            as_index=False
        )
        .size()
        .rename(columns={"size": "trip_count"})
    )

    return grouped


def aggregate_playoffs_zones(df):
    """
    Aggregate the entire playoff run.

    Attention zones are preserved so the frontend can filter
    the map by monitored location.
    """

    grouped = (
        df.groupby(
            [
                "period",
                "home",
                "taxi_type",
                "attention_zone",
                "zone",
            ],
            as_index=False
        )
        .size()
        .rename(columns={"size": "trip_count"})
    )

    return grouped


def save_data(df, filename):
    """
    Save an aggregate DataFrame as compressed Parquet.
    """

    path = OUTPUT_DIR / filename

    df.to_parquet(
        path,
        engine="pyarrow",
        compression="zstd",
        index=False
    )

    print(f"Saved {len(df):,} rows → {path}")


def print_summary(name, df):
    print("\n" + "=" * 80)
    print(name)
    print("=" * 80)

    print(f"Rows: {len(df):,}")
    print(f"Total trips represented: {df['trip_count'].sum():,}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ---------------------------------------------------------
    # LOAD
    # ---------------------------------------------------------

    trips = load_trips()

    print("\nSERIES DISTRIBUTION")
    print(trips["series"].value_counts(dropna=False))

    print("\nSERIES × GAME")
    print(
        trips.groupby(["series", "game_id"])
        .size()
        .to_string()
    )

    print(
        trips[
            [
                "game_id",
                "game",
                "series",
                "home",
                "opponent",
            ]
        ]
        .drop_duplicates()
        .sort_values(["series", "game_id"])
        .to_string(index=False)
    )

    print("\nATTENTION ZONE DISTRIBUTION")

    print(
        trips[
            [
                "game_id",
                "game",
                "series",
                "period",
                "attention_zone",
            ]
        ]
        .drop_duplicates()
        .sort_values(
            [
                "game_id",
                "period",
                "attention_zone",
            ]
        )
        .to_string(index=False)
    )

    # ---------------------------------------------------------
    # PREPARE ZONE DATA
    # ---------------------------------------------------------

    zone_trips = prepare_zone_data(trips)

    # ---------------------------------------------------------
    # GAME LEVEL
    # ---------------------------------------------------------

    game_zones = aggregate_game_zones(zone_trips)

    print_summary("GAME ZONE DATA", game_zones)

    save_data(
        game_zones,
        "game_zone_stats.parquet"
    )

    # ---------------------------------------------------------
    # SERIES LEVEL
    # ---------------------------------------------------------

    series_zones = aggregate_series_zones(zone_trips)

    print("\nSERIES TOTALS AFTER AGGREGATION")

    print(
        series_zones
        .groupby("series")["trip_count"]
        .sum()
        .to_string()
    )

    print_summary("SERIES ZONE DATA", series_zones)

    save_data(
        series_zones,
        "series_zone_stats.parquet"
    )

    # ---------------------------------------------------------
    # PLAYOFF LEVEL
    # ---------------------------------------------------------

    playoff_zones = aggregate_playoffs_zones(zone_trips)

    print_summary("PLAYOFF ZONE DATA", playoff_zones)

    save_data(
        playoff_zones,
        "playoffs_zone_stats.parquet"
    )

    # ---------------------------------------------------------
    # FINAL SUMMARY
    # ---------------------------------------------------------

    print("\n" + "=" * 80)
    print("AGGREGATION COMPLETE")
    print("=" * 80)

    print("\nOutput directory:")
    print(OUTPUT_DIR)

    print("\nFiles created:")

    for file in sorted(OUTPUT_DIR.glob("*.parquet")):
        print(f"  {file.name}")


if __name__ == "__main__":
    main()