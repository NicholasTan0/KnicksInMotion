from pathlib import Path
import pyarrow.parquet as pq


RAW_DIR = Path("data/raw")

DATASETS = {
    "yellow": RAW_DIR / "yellow",
    "green": RAW_DIR / "green",
    "fhvhv": RAW_DIR / "fhv",
}


def inspect_file(path):
    print("\n" + "=" * 80)
    print(f"FILE: {path}")
    print("=" * 80)

    parquet_file = pq.ParquetFile(path)

    print(f"Rows: {parquet_file.metadata.num_rows}")
    print(f"Columns: {parquet_file.schema_arrow.names}")

    print("\nSchema:")
    print(parquet_file.schema_arrow)

    print("\nSample:")
    table = parquet_file.read_row_groups(
        list(range(min(1, parquet_file.num_row_groups)))
    )

    print(table.to_pandas().head(5).to_string(index=False))


def main():
    for dataset_name, directory in DATASETS.items():
        print("\n\n")
        print("#" * 80)
        print(f"# {dataset_name.upper()}")
        print("#" * 80)

        if not directory.exists():
            print(f"Directory does not exist: {directory}")
            continue

        files = sorted(directory.glob("*.parquet"))

        if not files:
            print(f"No Parquet files found in {directory}")
            continue

        print(f"Found {len(files)} files.")

        for file in files:
            inspect_file(file)


if __name__ == "__main__":
    main()