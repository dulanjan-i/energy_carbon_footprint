import os

import pandas as pd


PRICE_PATH = "data/raw/PFC.csv"
CONSUMPTION_PATH = "data/raw/total_consumption_2y.csv"
GENERATION_PATH = "data/raw/actual_generation_2y.csv"
OUTPUT_PATH = "data/processed/price_model_dataset_2y.csv"

PRICE_MWH_COLUMN = "ForwardCurve Index EVH-HPFC Index (€/MWh)"
CONSUMPTION_COLUMN = "mod_410 (MWh)"


def load_price_data():
    price_df = pd.read_csv(PRICE_PATH, sep=";", decimal=",")
    price_df = price_df.rename(
        columns={
            "Name": "timestamp",
            PRICE_MWH_COLUMN: "price_eur_per_mwh",
        }
    )
    price_df["timestamp"] = price_df["timestamp"].str.replace(
        " 2b:", " 02:", regex=False
    )
    price_df["timestamp"] = pd.to_datetime(
        price_df["timestamp"], dayfirst=True, format="mixed"
    )
    price_df["price_eur_per_mwh"] = pd.to_numeric(
        price_df["price_eur_per_mwh"].astype(str).str.replace(",", ".", regex=False),
        errors="coerce",
    )
    price_df["price(t)"] = price_df["price_eur_per_mwh"]
    price_df = price_df[["timestamp", "price(t)"]]
    return price_df.groupby("timestamp", as_index=False).mean()


def load_consumption_data():
    consumption_df = pd.read_csv(CONSUMPTION_PATH)
    consumption_df = consumption_df.rename(
        columns={
            "timestamp": "timestamp",
            CONSUMPTION_COLUMN: "consumption(t)",
        }
    )
    consumption_df["timestamp"] = pd.to_datetime(consumption_df["timestamp"])
    consumption_df["consumption(t)"] = pd.to_numeric(
        consumption_df["consumption(t)"], errors="coerce"
    )
    return consumption_df[["timestamp", "consumption(t)"]]


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
        "Pumped Storage",
        "Other Renewables",
        "Other Conventional",
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
            "wind_onshore(t)": generation_df["Wind Onshore"],
            "wind_offshore(t)": generation_df["Wind Offshore"],
            "solar(t)": generation_df["Photovoltaics"],
            "hydro(t)": generation_df["Hydropower"],
            "biomass(t)": generation_df["Biomass"],
            "coal(t)": generation_df["Brown Coal"] + generation_df["Hard Coal"],
            "gas(t)": generation_df["Natural Gas"],
        }
    )
    return model_df


def build_price_model_dataset():
    price_df = load_price_data()
    consumption_df = load_consumption_data()
    generation_df = load_generation_data()

    dataset_df = price_df.merge(consumption_df, on="timestamp", how="inner")
    dataset_df = dataset_df.merge(generation_df, on="timestamp", how="inner")

    next_timestamp = dataset_df["timestamp"] + pd.Timedelta(hours=1)
    target_df = price_df.rename(
        columns={
            "timestamp": "target_timestamp",
            "price(t)": "price(€/MWh)",
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
    dataset_df["price_lag_1"] = dataset_df["price(t)"].shift(1)
    dataset_df["price_lag_24"] = dataset_df["price(t)"].shift(24)
    dataset_df["price_lag_168"] = dataset_df["price(t)"].shift(168)

    column_order = [
        "timestamp",
        "price(€/MWh)",
        "hour(t+1)",
        "day_of_week(t+1)",
        "month(t+1)",
        "is_weekend(t+1)",
        "price(t)",
        "price_lag_1",
        "price_lag_24",
        "price_lag_168",
        "consumption(t)",
        "wind_onshore(t)",
        "wind_offshore(t)",
        "solar(t)",
        "hydro(t)",
        "biomass(t)",
        "coal(t)",
        "gas(t)",
    ]
    dataset_df = dataset_df[column_order]
    return dataset_df.dropna().reset_index(drop=True)


def main():
    dataset_df = build_price_model_dataset()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    dataset_df.to_csv(OUTPUT_PATH, index=False)

    print(f"Saved Model 1 price dataset to: {OUTPUT_PATH}")
    print(f"Rows: {len(dataset_df)}")
    print(f"Missing values: {int(dataset_df.isna().sum().sum())}")


if __name__ == "__main__":
    main()
