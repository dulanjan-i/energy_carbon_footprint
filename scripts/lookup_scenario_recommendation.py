import argparse
import os

import pandas as pd


SCHEDULE_TABLE_PATH = "outputs/scenario_daily_schedule_table.csv"
RECOMMENDATIONS_PATH = "outputs/scenario_daily_recommendations.csv"
LOOKUP_OUTPUT_PATH = "outputs/scenario_selected_time_recommendation.csv"

parser = argparse.ArgumentParser(
    description="Look up Cost Saver and Eco Saver recommendations for one selected time."
)
parser.add_argument(
    "--time",
    type=str,
    help='Selected timestamp, for example "2026-06-26 18:00".',
)
parser.add_argument(
    "--interactive",
    action="store_true",
    help="Prompt for the selected timestamp.",
)
args = parser.parse_args()

if args.interactive or not args.time:
    args.time = input('Pick a time, for example "2026-06-26 18:00": ').strip()

selected_timestamp = pd.to_datetime(args.time)

schedule_df = pd.read_csv(SCHEDULE_TABLE_PATH)
schedule_df["Current Timestamp"] = pd.to_datetime(schedule_df["Current Timestamp"])

matching_rows = schedule_df[schedule_df["Current Timestamp"] == selected_timestamp]
if matching_rows.empty:
    first_time = schedule_df["Current Timestamp"].min()
    last_time = schedule_df["Current Timestamp"].max()
    raise ValueError(
        f"Time not found. Pick an hourly timestamp between {first_time} and {last_time}."
    )

row = matching_rows.iloc[0]

recommendations_df = pd.read_csv(RECOMMENDATIONS_PATH)
recommendations_df["current_timestamp"] = pd.to_datetime(
    recommendations_df["current_timestamp"]
)
selected_recommendations = recommendations_df[
    recommendations_df["current_timestamp"] == selected_timestamp
]
current_row = selected_recommendations[
    selected_recommendations["scenario"] == "Business as Usual"
].iloc[0]

if row["Cost Saver"] == row["Eco Saver"]:
    recommendation_rows = [
        {
            "Selected Timestamp": row["Current Timestamp"],
            "Selected Time": row["Current Time"],
            "Scenario": "Cost Saver + Eco Saver",
            "Recommended Time": row["Cost Saver"],
            "Forecast Price (€/MWh)": current_row["current_price(€/MWh)"],
            "Forecast Carbon (kgCO₂/MWh)": current_row[
                "current_carbon_kgco2_per_mwh"
            ],
        }
    ]
else:
    recommendation_rows = [
        {
            "Selected Timestamp": row["Current Timestamp"],
            "Selected Time": row["Current Time"],
            "Scenario": "Cost Saver",
            "Recommended Time": row["Cost Saver"],
            "Forecast Price (€/MWh)": current_row["current_price(€/MWh)"],
            "Forecast Carbon (kgCO₂/MWh)": current_row[
                "current_carbon_kgco2_per_mwh"
            ],
        },
        {
            "Selected Timestamp": row["Current Timestamp"],
            "Selected Time": row["Current Time"],
            "Scenario": "Eco Saver",
            "Recommended Time": row["Eco Saver"],
            "Forecast Price (€/MWh)": current_row["current_price(€/MWh)"],
            "Forecast Carbon (kgCO₂/MWh)": current_row[
                "current_carbon_kgco2_per_mwh"
            ],
        },
    ]

lookup_df = pd.DataFrame(
    recommendation_rows
)

os.makedirs(os.path.dirname(LOOKUP_OUTPUT_PATH), exist_ok=True)
lookup_df.to_csv(LOOKUP_OUTPUT_PATH, index=False)

print()
print("Selected time recommendation")
print("----------------------------")
print(f"Selected time: {row['Current Timestamp']}")
print(f"Current price: {current_row['current_price(€/MWh)']:.2f} €/MWh")
print(
    f"Current carbon: {current_row['current_carbon_kgco2_per_mwh']:.2f} kgCO₂/MWh"
)
if row["Cost Saver"] == row["Eco Saver"]:
    print(f"Cost Saver and Eco Saver recommend: {row['Cost Saver']}")
else:
    print(f"Cost Saver recommends: {row['Cost Saver']}")
    print(f"Eco Saver recommends: {row['Eco Saver']}")
print()
print(f"Saved lookup result to: {LOOKUP_OUTPUT_PATH}")
