import os

import pandas as pd


CARBON_INTENSITY_PATH = "data/processed/hourly_carbon_intensity_2y.csv"
GENERATION_PATH = "data/raw/actual_generation_2y.csv"
OUTPUT_PATH = "data/processed/carbon_intensity_model_dataset_2y.csv"


def load_carbon_intensity_data():
    carbon_df = pd.read_csv(CARBON_INTENSITY_PATH)
    carbon_df = carbon_df.rename(
        columns={"carbon_intensity_kgco2_per_mwh": "carbon_intensity(t)"}
    )
    carbon_df["timestamp"] = pd.to_datetime(carbon_df["timestamp"])
    carbon_df["carbon_intensity(t)"] = pd.to_numeric(
        carbon_df["carbon_intensity(t)"], errors="coerce"
    )
    return carbon_df[["timestamp", "carbon_intensity(t)"]]


def load_generation_data():
    generation_df = pd.read_csv(GENERATION_PATH)
    generation_df["timestamp"] = pd.to_datetime(generation_df["timestamp"])

    generation_columns = [
        "Biomass",
        "Hydropower",
        "Wind Offshore",
        "Wind Onshore",
        "Photovoltaics",
        "Brown Coal",
        "Hard Coal",
        "Natural Gas",
    ]
    missing_columns = [
        column
        for column in ["timestamp", *generation_columns]
        if column not in generation_df.columns
    ]
    if missing_columns:
        raise ValueError(f"Missing required generation columns: {missing_columns}")

    generation_df[generation_columns] = generation_df[generation_columns].apply(
        pd.to_numeric, errors="coerce"
    )

    model_df = pd.DataFrame(
        {
            "timestamp": generation_df["timestamp"],
            "wind_onshore": generation_df["Wind Onshore"],
            "wind_offshore": generation_df["Wind Offshore"],
            "solar": generation_df["Photovoltaics"],
            "hydro": generation_df["Hydropower"],
            "biomass": generation_df["Biomass"],
            "coal": generation_df["Brown Coal"] + generation_df["Hard Coal"],
            "gas": generation_df["Natural Gas"],
        }
    )
    return model_df


def build_carbon_intensity_model_dataset():
    carbon_df = load_carbon_intensity_data()
    generation_df = load_generation_data()

    dataset_df = carbon_df.merge(generation_df, on="timestamp", how="inner")

    next_timestamp = dataset_df["timestamp"] + pd.Timedelta(hours=1)
    target_df = carbon_df.rename(
        columns={
            "timestamp": "target_timestamp",
            "carbon_intensity(t)": "carbon_intensity(t+1)",
        }
    )
    dataset_df["target_timestamp"] = next_timestamp
    dataset_df = dataset_df.merge(target_df, on="target_timestamp", how="inner")

    dataset_df["hour(t+1)"] = dataset_df["target_timestamp"].dt.hour
    dataset_df["day_of_week(t+1)"] = dataset_df["target_timestamp"].dt.dayofweek
    dataset_df["month(t+1)"] = dataset_df["target_timestamp"].dt.month
    dataset_df["is_weekend(t+1)"] = (
        dataset_df["target_timestamp"].dt.dayofweek >= 5
    ).astype(int)

    dataset_df = dataset_df.sort_values("timestamp")
    dataset_df["carbon_lag_1"] = dataset_df["carbon_intensity(t)"].shift(1)
    dataset_df["carbon_lag_24"] = dataset_df["carbon_intensity(t)"].shift(24)
    dataset_df["carbon_lag_168"] = dataset_df["carbon_intensity(t)"].shift(168)

    column_order = [
        "timestamp",
        "carbon_intensity(t+1)",
        "hour(t+1)",
        "day_of_week(t+1)",
        "month(t+1)",
        "is_weekend(t+1)",
        "carbon_intensity(t)",
        "carbon_lag_1",
        "carbon_lag_24",
        "carbon_lag_168",
        "wind_onshore",
        "wind_offshore",
        "solar",
        "hydro",
        "biomass",
        "coal",
        "gas",
    ]
    dataset_df = dataset_df[column_order]
    return dataset_df.dropna().reset_index(drop=True)


def main():
    dataset_df = build_carbon_intensity_model_dataset()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    dataset_df.to_csv(OUTPUT_PATH, index=False)

    print(f"Saved carbon intensity model dataset to: {OUTPUT_PATH}")
    print(f"Rows: {len(dataset_df)}")
    print(f"Missing values: {int(dataset_df.isna().sum().sum())}")


if __name__ == "__main__":
    main()
