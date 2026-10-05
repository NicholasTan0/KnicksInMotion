from pathlib import Path
import json

import pandas as pd


ZONE_FILE = Path("data/reference/taxi_zones.geojson")
AGGREGATE_DIR = Path("data/processed/aggregates")
OUTPUT_DIR = Path("data/frontend")


def load_zones():
    print(f"Loading taxi zones from {ZONE_FILE}...")

    with open(ZONE_FILE, "r", encoding="utf-8") as file:
        zones = json.load(file)

    print(f"Loaded {len(zones['features']):,} taxi zones.")

    return zones


def load_aggregates():
    print("\nLoading aggregate data...")

    game = pd.read_parquet(
        AGGREGATE_DIR / "game_zone_stats.parquet"
    )

    series = pd.read_parquet(
        AGGREGATE_DIR / "series_zone_stats.parquet"
    )

    playoffs = pd.read_parquet(
        AGGREGATE_DIR / "playoffs_zone_stats.parquet"
    )

    print(f"Game rows:     {len(game):,}")
    print(f"Series rows:   {len(series):,}")
    print(f"Playoff rows:  {len(playoffs):,}")

    return game, series, playoffs


def clean_value(value):
    """
    Convert pandas/numpy values into normal JSON-compatible values.
    """

    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value


def dataframe_to_records(df):
    """
    Convert a DataFrame into a clean list of dictionaries.
    """

    records = df.to_dict(orient="records")

    return [
        {
            key: clean_value(value)
            for key, value in record.items()
        }
        for record in records
    ]


def create_zone_lookup(zones):
    """
    Create a lookup table for NYC TLC taxi zones.
    """

    lookup = {}

    for feature in zones["features"]:
        properties = feature.get("properties", {})

        zone_id = properties.get("location_id")

        if zone_id is None:
            continue

        zone_id = int(zone_id)

        lookup[zone_id] = {
            "zone_id": zone_id,
            "zone_name": properties.get("zone"),
            "borough": properties.get("borough"),
        }

    return lookup


def export_zone_metadata(zones):
    """
    Export the original GeoJSON as a frontend-ready file.
    """

    output_file = OUTPUT_DIR / "taxi_zones.geojson"

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(
            zones,
            file,
            separators=(",", ":")
        )

    print(f"Saved zone geometry → {output_file}")


def export_statistics(df, filename, zone_lookup):
    """
    Add zone names/boroughs to aggregate data and export as JSON.
    """

    result = df.copy()

    result["zone"] = result["zone"].astype(int)

    result["zone_name"] = result["zone"].map(
        lambda zone_id: zone_lookup.get(zone_id, {}).get("zone_name")
    )

    result["borough"] = result["zone"].map(
        lambda zone_id: zone_lookup.get(zone_id, {}).get("borough")
    )

    result = result.rename(
        columns={
            "zone": "zone_id"
        }
    )

    # Put the important frontend fields first.
    preferred_columns = [
        "game_id",
        "game",
        "series",
        "home",
        "opponent",
        "period",
        "taxi_type",
        "zone_id",
        "zone_name",
        "borough",
        "trip_count",
    ]

    columns = [
        column
        for column in preferred_columns
        if column in result.columns
    ]

    result = result[columns]

    records = dataframe_to_records(result)

    output_file = OUTPUT_DIR / filename

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(
            records,
            file,
            separators=(",", ":")
        )

    print(f"Saved {len(records):,} records → {output_file}")


def export_games():
    """
    Copy games.json into the frontend data directory.

    The frontend can then use the same game metadata as
    the processing pipeline.
    """

    source = Path("data/reference/games.json")
    destination = OUTPUT_DIR / "games.json"

    with open(source, "r", encoding="utf-8") as file:
        games = json.load(file)

    with open(destination, "w", encoding="utf-8") as file:
        json.dump(
            games,
            file,
            separators=(",", ":")
        )

    print(f"Saved game metadata → {destination}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # ---------------------------------------------------------
    # LOAD
    # ---------------------------------------------------------

    zones = load_zones()

    game, series, playoffs = load_aggregates()

    zone_lookup = create_zone_lookup(zones)

    print(f"Zone metadata entries: {len(zone_lookup):,}")

    # ---------------------------------------------------------
    # EXPORT GEOMETRY
    # ---------------------------------------------------------

    export_zone_metadata(zones)

    # ---------------------------------------------------------
    # EXPORT GAME DATA
    # ---------------------------------------------------------

    export_statistics(
        game,
        "game_zone_stats.json",
        zone_lookup
    )

    # ---------------------------------------------------------
    # EXPORT SERIES DATA
    # ---------------------------------------------------------

    export_statistics(
        series,
        "series_zone_stats.json",
        zone_lookup
    )

    # ---------------------------------------------------------
    # EXPORT PLAYOFF DATA
    # ---------------------------------------------------------

    export_statistics(
        playoffs,
        "playoffs_zone_stats.json",
        zone_lookup
    )

    # ---------------------------------------------------------
    # EXPORT GAME METADATA
    # ---------------------------------------------------------

    export_games()

    # ---------------------------------------------------------
    # FINISHED
    # ---------------------------------------------------------

    print("\n" + "=" * 80)
    print("FRONTEND EXPORT COMPLETE")
    print("=" * 80)

    print(f"\nOutput directory: {OUTPUT_DIR}")

    print("\nFiles created:")

    for file in sorted(OUTPUT_DIR.iterdir()):
        print(f"  {file.name}")


if __name__ == "__main__":
    main()