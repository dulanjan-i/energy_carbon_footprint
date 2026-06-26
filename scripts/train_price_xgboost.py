import json
import os

import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor


DATASET_PATH = "data/processed/price_model_dataset_2y.csv"
MODEL_PATH = "models/price_xgboost.json"
METRICS_PATH = "outputs/price_xgboost_metrics.json"
PREDICTIONS_PATH = "outputs/price_xgboost_predictions.csv"

TARGET_COLUMN = "price(€/MWh)"
TIMESTAMP_COLUMN = "timestamp"
TEST_SIZE = 0.25


dataset_df = pd.read_csv(DATASET_PATH)
dataset_df[TIMESTAMP_COLUMN] = pd.to_datetime(dataset_df[TIMESTAMP_COLUMN])
dataset_df = dataset_df.sort_values(TIMESTAMP_COLUMN).reset_index(drop=True)

if TARGET_COLUMN not in dataset_df.columns:
    raise ValueError(f"Missing target column: {TARGET_COLUMN}")

split_index = int(len(dataset_df) * (1 - TEST_SIZE))
train_df = dataset_df.iloc[:split_index].copy()
test_df = dataset_df.iloc[split_index:].copy()

feature_columns = [
    column
    for column in dataset_df.columns
    if column not in [TIMESTAMP_COLUMN, TARGET_COLUMN]
]

x_train = train_df[feature_columns]
y_train = train_df[TARGET_COLUMN]
x_test = test_df[feature_columns]
y_test = test_df[TARGET_COLUMN]

model = XGBRegressor(
    objective="reg:squarederror",
    n_estimators=800,
    learning_rate=0.03,
    max_depth=5,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    n_jobs=-1,
)
model.fit(x_train, y_train)

predictions = model.predict(x_test)
metrics = {
    "target": TARGET_COLUMN,
    "rows": int(len(dataset_df)),
    "train_rows": int(len(train_df)),
    "test_rows": int(len(test_df)),
    "mae": float(mean_absolute_error(y_test, predictions)),
    "rmse": float(mean_squared_error(y_test, predictions) ** 0.5),
    "r2": float(r2_score(y_test, predictions)),
    "features": feature_columns,
}

predictions_df = test_df[[TIMESTAMP_COLUMN, TARGET_COLUMN]].copy()
predictions_df["prediction"] = predictions
predictions_df["error"] = predictions_df[TARGET_COLUMN] - predictions_df["prediction"]

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
os.makedirs(os.path.dirname(METRICS_PATH), exist_ok=True)

model.save_model(MODEL_PATH)
predictions_df.to_csv(PREDICTIONS_PATH, index=False)
with open(METRICS_PATH, "w") as metrics_file:
    json.dump(metrics, metrics_file, indent=2)

print(f"Saved model to: {MODEL_PATH}")
print(f"Saved metrics to: {METRICS_PATH}")
print(f"Saved predictions to: {PREDICTIONS_PATH}")
print(f"MAE: {metrics['mae']:.3f}")
print(f"RMSE: {metrics['rmse']:.3f}")
print(f"R2: {metrics['r2']:.3f}")
