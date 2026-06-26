import json
import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


PREDICTIONS_PATH = "outputs/carbon_intensity_xgboost_predictions.csv"
METRICS_PATH = "outputs/carbon_intensity_xgboost_evaluation_metrics.json"
PLOT_PATH = "outputs/carbon_intensity_xgboost_timeseries.png"

TIMESTAMP_COLUMN = "timestamp"
TARGET_COLUMN = "carbon_intensity(t+1)"
PREDICTION_COLUMN = "prediction"
PLOT_DAYS = 14


predictions_df = pd.read_csv(PREDICTIONS_PATH)
predictions_df[TIMESTAMP_COLUMN] = pd.to_datetime(predictions_df[TIMESTAMP_COLUMN])
predictions_df = predictions_df.sort_values(TIMESTAMP_COLUMN).reset_index(drop=True)

if TARGET_COLUMN not in predictions_df.columns:
    raise ValueError(f"Missing target column: {TARGET_COLUMN}")

if PREDICTION_COLUMN not in predictions_df.columns:
    raise ValueError(f"Missing prediction column: {PREDICTION_COLUMN}")

actual = predictions_df[TARGET_COLUMN]
predicted = predictions_df[PREDICTION_COLUMN]

metrics = {
    "target": TARGET_COLUMN,
    "unit": "kgCO2/MWh",
    "prediction_column": PREDICTION_COLUMN,
    "rows": int(len(predictions_df)),
    "start_time": str(predictions_df[TIMESTAMP_COLUMN].min()),
    "end_time": str(predictions_df[TIMESTAMP_COLUMN].max()),
    "mae": float(mean_absolute_error(actual, predicted)),
    "rmse": float(mean_squared_error(actual, predicted) ** 0.5),
    "r2": float(r2_score(actual, predicted)),
}

plot_start = predictions_df[TIMESTAMP_COLUMN].max() - pd.Timedelta(days=PLOT_DAYS)
plot_df = predictions_df[predictions_df[TIMESTAMP_COLUMN] >= plot_start].copy()

os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)

plt.figure(figsize=(14, 6))
plt.plot(
    plot_df[TIMESTAMP_COLUMN],
    plot_df[TARGET_COLUMN],
    label="Actual carbon intensity",
    linewidth=1.8,
)
plt.plot(
    plot_df[TIMESTAMP_COLUMN],
    plot_df[PREDICTION_COLUMN],
    label="Predicted carbon intensity",
    linewidth=1.8,
    linestyle="--",
)
plt.title(f"XGBoost Carbon Intensity Prediction - Last {PLOT_DAYS} Test Days")
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

with open(METRICS_PATH, "w") as metrics_file:
    json.dump(metrics, metrics_file, indent=2)

print(f"Saved evaluation metrics to: {METRICS_PATH}")
print(f"Saved time-series plot to: {PLOT_PATH}")
print(f"MAE: {metrics['mae']:.3f}")
print(f"RMSE: {metrics['rmse']:.3f}")
print(f"R2: {metrics['r2']:.3f}")
