import json
import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from xgboost import XGBRegressor


DATASET_PATH = "data/processed/price_model_dataset_2y.csv"
MODEL_PATH = "models/price_xgboost.json"
METRICS_PATH = "outputs/price_xgboost_metrics.json"
OUTPUT_PATH = "outputs/price_xgboost_next_week_forecast.csv"
PLOT_PATH = "outputs/price_xgboost_next_week_forecast.png"

TIMESTAMP_COLUMN = "timestamp"
TARGET_COLUMN = "price(€/MWh)"
FORECAST_HOURS = 24 * 7
SEASONAL_LAG_HOURS = 24 * 7
PAST_PLOT_HOURS = 24 * 7


# Load the processed training dataset. The last timestamp in this file is the
# starting point for the next-week forecast.
dataset_df = pd.read_csv(DATASET_PATH)
dataset_df[TIMESTAMP_COLUMN] = pd.to_datetime(dataset_df[TIMESTAMP_COLUMN])
dataset_df = dataset_df.sort_values(TIMESTAMP_COLUMN).reset_index(drop=True)

# Reuse the exact feature order saved during model training. XGBoost expects
# prediction data to have the same columns and order as training data.
with open(METRICS_PATH) as metrics_file:
    metrics = json.load(metrics_file)

feature_columns = metrics["features"]
energy_columns = [
    "consumption(t)",
    "wind_onshore(t)",
    "wind_offshore(t)",
    "solar(t)",
    "hydro(t)",
    "biomass(t)",
    "coal(t)",
    "gas(t)",
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

# Store historical prices by timestamp so lag features can be looked up quickly.
# During forecasting, predicted prices are added back into this dictionary.
last_timestamp = dataset_df[TIMESTAMP_COLUMN].max()
price_history = dict(zip(dataset_df[TIMESTAMP_COLUMN], dataset_df[TARGET_COLUMN]))

# Future consumption and generation are not available in the raw data. For each
# future hour, use the same hour from the previous week as a simple assumption.
energy_history = dataset_df.set_index(TIMESTAMP_COLUMN)[energy_columns]
forecast_rows = []

# Predict one hour at a time for 168 hours. This is recursive forecasting:
# each predicted price becomes part of the price history for later lag features.
for step in range(FORECAST_HOURS):
    feature_timestamp = last_timestamp + pd.Timedelta(hours=step)
    target_timestamp = feature_timestamp + pd.Timedelta(hours=1)
    seasonal_timestamp = feature_timestamp - pd.Timedelta(hours=SEASONAL_LAG_HOURS)

    if seasonal_timestamp not in energy_history.index:
        raise ValueError(f"Missing seasonal energy data for: {seasonal_timestamp}")

    # Calendar features are known for the future target hour.
    # Price lag features come from observed prices first, then recursive forecasts.
    feature_row = {
        "hour(t+1)": target_timestamp.hour,
        "day_of_week(t+1)": target_timestamp.dayofweek,
        "month(t+1)": target_timestamp.month,
        "is_weekend(t+1)": int(target_timestamp.dayofweek >= 5),
        "price(t)": price_history[feature_timestamp],
        "price_lag_1": price_history[feature_timestamp - pd.Timedelta(hours=1)],
        "price_lag_24": price_history[feature_timestamp - pd.Timedelta(hours=24)],
        "price_lag_168": price_history[
            feature_timestamp - pd.Timedelta(hours=SEASONAL_LAG_HOURS)
        ],
    }

    for column in energy_columns:
        feature_row[column] = energy_history.loc[seasonal_timestamp, column]

    # Predict the target hour price and save it so the next forecast step can
    # use it as price(t), price_lag_1, or another lag if needed.
    prediction = float(model.predict(pd.DataFrame([feature_row])[feature_columns])[0])
    price_history[target_timestamp] = prediction

    forecast_rows.append(
        {
            "timestamp": target_timestamp,
            "predicted_price(€/MWh)": prediction,
            "feature_timestamp": feature_timestamp,
            "energy_assumption": "same_hour_previous_week",
        }
    )

forecast_df = pd.DataFrame(forecast_rows)

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
forecast_df.to_csv(OUTPUT_PATH, index=False)

# Plot one week of observed prices together with one week of forecast prices.
# Hourly points are kept, but the x-axis labels show dates only for readability.
plt.figure(figsize=(14, 6))
past_plot_df = dataset_df.tail(PAST_PLOT_HOURS)
plt.plot(
    past_plot_df[TIMESTAMP_COLUMN],
    past_plot_df[TARGET_COLUMN],
    label="Past actual price",
    linewidth=1.8,
)
plt.plot(
    forecast_df[TIMESTAMP_COLUMN],
    forecast_df["predicted_price(€/MWh)"],
    label="Future predicted price",
    linewidth=1.8,
    marker="o",
    markersize=3,
)
plt.axvline(last_timestamp, color="#444444", linestyle=":", linewidth=1.5)
plt.title("XGBoost Price Forecast - Past Week and Next Week")
plt.xlabel("Timestamp")
plt.ylabel("Price (€/MWh)")
plt.gca().xaxis.set_major_locator(mdates.DayLocator())
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter("%m-%d"))
plt.xticks(rotation=45, ha="right")
plt.legend()
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(PLOT_PATH, dpi=160)
plt.close()

print(f"Saved next-week price forecast to: {OUTPUT_PATH}")
print(f"Saved next-week forecast plot to: {PLOT_PATH}")
print(f"Rows: {len(forecast_df)}")
print(f"Start: {forecast_df[TIMESTAMP_COLUMN].min()}")
print(f"End: {forecast_df[TIMESTAMP_COLUMN].max()}")
