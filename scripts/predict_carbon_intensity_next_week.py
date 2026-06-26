import json
import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from xgboost import XGBRegressor


DATASET_PATH = "data/processed/carbon_intensity_model_dataset_2y.csv"
MODEL_PATH = "models/carbon_intensity_xgboost.json"
METRICS_PATH = "outputs/carbon_intensity_xgboost_metrics.json"
OUTPUT_PATH = "outputs/carbon_intensity_xgboost_next_week_forecast.csv"
PLOT_PATH = "outputs/carbon_intensity_xgboost_next_week_forecast.png"

TIMESTAMP_COLUMN = "timestamp"
TARGET_COLUMN = "carbon_intensity(t+1)"
FORECAST_HOURS = 24 * 7
SEASONAL_LAG_HOURS = 24 * 7
PAST_PLOT_HOURS = 24 * 7


# Load the processed carbon dataset. The last timestamp becomes the starting
# point for the next-week forecast.
dataset_df = pd.read_csv(DATASET_PATH)
dataset_df[TIMESTAMP_COLUMN] = pd.to_datetime(dataset_df[TIMESTAMP_COLUMN])
dataset_df = dataset_df.sort_values(TIMESTAMP_COLUMN).reset_index(drop=True)

# Reuse the exact feature order from training so the model receives the same
# input columns in the same order.
with open(METRICS_PATH) as metrics_file:
    metrics = json.load(metrics_file)

feature_columns = metrics["features"]
generation_columns = [
    "wind_onshore",
    "wind_offshore",
    "solar",
    "hydro",
    "biomass",
    "coal",
    "gas",
]

missing_columns = [
    column
    for column in [TIMESTAMP_COLUMN, TARGET_COLUMN, *feature_columns]
    if column not in dataset_df.columns
]
if missing_columns:
    raise ValueError(f"Missing required columns: {missing_columns}")

model = XGBRegressor()
model.load_model(MODEL_PATH)

# Historical carbon values are stored by timestamp. During recursive forecasting,
# each prediction is added here and reused as a future lag.
last_timestamp = dataset_df[TIMESTAMP_COLUMN].max()
carbon_history = dict(zip(dataset_df[TIMESTAMP_COLUMN], dataset_df[TARGET_COLUMN]))

# Future generation is not available. For every future hour, use the same hour
# from the previous week as the generation assumption.
generation_history = dataset_df.set_index(TIMESTAMP_COLUMN)[generation_columns]
forecast_rows = []

# Predict 168 hourly values. Each predicted carbon intensity is fed back into
# later carbon lag features.
for step in range(FORECAST_HOURS):
    feature_timestamp = last_timestamp + pd.Timedelta(hours=step)
    target_timestamp = feature_timestamp + pd.Timedelta(hours=1)
    seasonal_timestamp = feature_timestamp - pd.Timedelta(hours=SEASONAL_LAG_HOURS)

    if seasonal_timestamp not in generation_history.index:
        raise ValueError(f"Missing seasonal generation data for: {seasonal_timestamp}")

    feature_row = {
        "hour(t+1)": target_timestamp.hour,
        "day_of_week(t+1)": target_timestamp.dayofweek,
        "month(t+1)": target_timestamp.month,
        "is_weekend(t+1)": int(target_timestamp.dayofweek >= 5),
        "carbon_intensity(t)": carbon_history[feature_timestamp],
        "carbon_lag_1": carbon_history[feature_timestamp - pd.Timedelta(hours=1)],
        "carbon_lag_24": carbon_history[feature_timestamp - pd.Timedelta(hours=24)],
        "carbon_lag_168": carbon_history[
            feature_timestamp - pd.Timedelta(hours=SEASONAL_LAG_HOURS)
        ],
    }

    for column in generation_columns:
        feature_row[column] = generation_history.loc[seasonal_timestamp, column]

    prediction = float(model.predict(pd.DataFrame([feature_row])[feature_columns])[0])
    carbon_history[target_timestamp] = prediction

    forecast_rows.append(
        {
            "timestamp": target_timestamp,
            "predicted_carbon_intensity_kgco2_per_mwh": prediction,
            "feature_timestamp": feature_timestamp,
            "generation_assumption": "same_hour_previous_week",
        }
    )

forecast_df = pd.DataFrame(forecast_rows)

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
forecast_df.to_csv(OUTPUT_PATH, index=False)

# Plot past actual carbon intensity and future forecast together. Hourly points
# are retained, while the x-axis labels show dates only for readability.
plt.figure(figsize=(14, 6))
past_plot_df = dataset_df.tail(PAST_PLOT_HOURS)
plt.plot(
    past_plot_df[TIMESTAMP_COLUMN],
    past_plot_df[TARGET_COLUMN],
    label="Past actual carbon intensity",
    linewidth=1.8,
)
plt.plot(
    forecast_df[TIMESTAMP_COLUMN],
    forecast_df["predicted_carbon_intensity_kgco2_per_mwh"],
    label="Future predicted carbon intensity",
    linewidth=1.8,
    marker="o",
    markersize=3,
)
plt.axvline(last_timestamp, color="#444444", linestyle=":", linewidth=1.5)
plt.title("XGBoost Carbon Intensity Forecast - Past Week and Next Week")
plt.xlabel("Timestamp")
plt.ylabel("Carbon Intensity (kgCO2/MWh)")
plt.gca().xaxis.set_major_locator(mdates.DayLocator())
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter("%m-%d"))
plt.xticks(rotation=45, ha="right")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(PLOT_PATH, dpi=160)
plt.close()

print(f"Saved next-week carbon intensity forecast to: {OUTPUT_PATH}")
print(f"Saved next-week forecast plot to: {PLOT_PATH}")
print(f"Rows: {len(forecast_df)}")
print(f"Start: {forecast_df[TIMESTAMP_COLUMN].min()}")
print(f"End: {forecast_df[TIMESTAMP_COLUMN].max()}")
