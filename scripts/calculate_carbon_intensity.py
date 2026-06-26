import os

import pandas as pd


GENERATION_PATH = "data/raw/actual_generation_2y.csv"
OUTPUT_PATH = "data/processed/hourly_carbon_intensity_2y.csv"

EMISSION_FACTORS = {
    "Biomass": 0,
    "Hydropower": 0,
    "Wind Offshore": 0,
    "Wind Onshore": 0,
    "Photovoltaics": 0,
    "Other Renewables": 0,
    "Brown Coal": 1119,
    "Hard Coal": 860,
    "Natural Gas": 394,
    "Pumped Storage": 0,
    "Other Conventional": 344,
}


def calculate_hourly_carbon_intensity(generation_df):
    generation_columns = list(EMISSION_FACTORS.keys())
    missing_columns = [
        column
        for column in ["timestamp", *generation_columns]
        if column not in generation_df.columns
    ]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    generation_df = generation_df[["timestamp", *generation_columns]].copy()
    generation_df[generation_columns] = generation_df[generation_columns].apply(
        pd.to_numeric, errors="coerce"
    )

    generation_mwh = generation_df[generation_columns].sum(axis=1)
    weighted_emissions = sum(
        generation_df[column] * emission_factor
        for column, emission_factor in EMISSION_FACTORS.items()
    )

    result_df = pd.DataFrame(
        {
            "timestamp": pd.to_datetime(generation_df["timestamp"]),
            "total_generation_mwh": generation_mwh,
            "carbon_intensity_kgco2_per_mwh": weighted_emissions / generation_mwh,
        }
    )

    result_df.loc[
        result_df["total_generation_mwh"] == 0, "carbon_intensity_kgco2_per_mwh"
    ] = pd.NA

    return result_df


def main():
    generation_df = pd.read_csv(GENERATION_PATH)
    result_df = calculate_hourly_carbon_intensity(generation_df)

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    result_df.to_csv(OUTPUT_PATH, index=False)

    print(f"Saved hourly carbon intensity to: {OUTPUT_PATH}")
    print(f"Rows: {len(result_df)}")


if __name__ == "__main__":
    main()
