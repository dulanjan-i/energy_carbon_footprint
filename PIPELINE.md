# Energy Price and Carbon Intensity Forecasting Pipeline

## Purpose

This repository builds two hourly electricity forecasting pipelines for Germany:

1. **Price forecasting**
   - Predicts next-hour electricity price.
   - Target: `price(€/MWh)`.

2. **Carbon intensity forecasting**
   - Predicts next-hour carbon intensity.
   - Target: `carbon_intensity(t+1)`.
   - Unit: `kgCO2/MWh`.

The branch includes raw data collection, feature engineering, XGBoost training,
model evaluation, and next-week recursive forecasting.

---

## Pipeline Architecture

```text
Raw data
  ├── data/raw/PFC.csv
  ├── data/raw/actual_generation_2y.csv
  └── data/raw/total_consumption_2y.csv

Processing
  ├── scripts/calculate_carbon_intensity.py
  ├── scripts/build_price_model_dataset.py
  └── scripts/build_carbon_intensity_model_dataset.py

Training
  ├── scripts/train_price_xgboost.py
  └── scripts/train_carbon_intensity_xgboost.py

Evaluation
  ├── scripts/evaluate_price_xgboost.py
  └── scripts/evaluate_carbon_intensity_xgboost.py

Inference
  ├── scripts/predict_price_next_week.py
  └── scripts/predict_carbon_intensity_next_week.py

Artifacts
  ├── data/processed/
  ├── models/
  └── outputs/
```

---

## Directory Map

| Path | Role |
|---|---|
| `data/raw/` | Source data downloaded or imported before modeling. |
| `data/processed/` | Model-ready datasets and calculated carbon intensity. |
| `scripts/` | Data, training, evaluation, and inference scripts. |
| `models/` | Saved XGBoost model files. |
| `outputs/` | Metrics, predictions, forecasts, and plots. |
| `requirements.txt` | Python dependencies. |

---

## Raw Data

### `data/raw/PFC.csv`

Electricity price source.

| Field | Meaning |
|---|---|
| `Name` | Hourly timestamp. |
| `ForwardCurve Index EVH-HPFC Index (€/MWh)` | Electricity price in `€/MWh`. |

Processing notes:

- The file uses `;` as separator.
- Decimal values use comma notation.
- DST strings such as `2b:00` are normalized to `02:00`.
- Duplicate local timestamps are averaged.

---

### `data/raw/actual_generation_2y.csv`

Hourly generation source data in `MWh`.

Main columns:

```text
Biomass
Hydropower
Wind Offshore
Wind Onshore
Photovoltaics
Other Renewables
Brown Coal
Hard Coal
Natural Gas
Pumped Storage
Other Conventional
```

Nuclear was removed from this branch.

---

### `data/raw/total_consumption_2y.csv`

Hourly electricity consumption in `MWh`.

Main column:

```text
mod_410 (MWh)
```

This becomes `consumption(t)` in the price model dataset.

---

## Data Collection Scripts

### `scripts/collect_generation_data.py`

Downloads hourly generation data from SMARD.

Output:

```text
data/raw/actual_generation_2y.csv
```

Current generation modules:

| Source | SMARD module |
|---|---:|
| Biomass | `4066` |
| Hydropower | `1226` |
| Wind Offshore | `1225` |
| Wind Onshore | `4067` |
| Photovoltaics | `4068` |
| Other Renewables | `1228` |
| Brown Coal | `1223` |
| Hard Coal | `4069` |
| Natural Gas | `4071` |
| Pumped Storage | `4070` |
| Other Conventional | `1227` |

---

### `scripts/collect_consumption_data.py`

Downloads hourly total consumption data from SMARD.

Output:

```text
data/raw/total_consumption_2y.csv
```

SMARD module:

```text
410
```

---

## Carbon Intensity Calculation

### `scripts/calculate_carbon_intensity.py`

Calculates hourly carbon intensity from generation by source.

Input:

```text
data/raw/actual_generation_2y.csv
```

Output:

```text
data/processed/hourly_carbon_intensity_2y.csv
```

Output schema:

```text
timestamp
total_generation_mwh
carbon_intensity_kgco2_per_mwh
```

Emission factors:

| Source | Emission factor |
|---|---:|
| Biomass | `0` |
| Hydropower | `0` |
| Wind Offshore | `0` |
| Wind Onshore | `0` |
| Photovoltaics | `0` |
| Other Renewables | `0` |
| Brown Coal | `1119` |
| Hard Coal | `860` |
| Natural Gas | `394` |
| Pumped Storage | `0` |
| Other Conventional | `344` |

Formula:

```text
carbon_intensity_kgco2_per_mwh
= sum(generation_mwh_by_source * emission_factor)
  / total_generation_mwh
```

Unit note:

```text
gCO2/kWh = kgCO2/MWh
```

The numeric value is unchanged by this unit conversion.

---

## Processed Datasets

### Price Model Dataset

Builder:

```text
scripts/build_price_model_dataset.py
```

Output:

```text
data/processed/price_model_dataset_2y.csv
```

Target:

```text
price(€/MWh)
```

Target meaning:

```text
price at t+1
```

Feature schema:

| Column | Meaning | Unit |
|---|---|---|
| `timestamp` | Current timestamp `t`. | datetime |
| `price(€/MWh)` | Target: next-hour price. | `€/MWh` |
| `hour(t+1)` | Hour of next timestamp. | integer |
| `day_of_week(t+1)` | Day of week of next timestamp. | integer |
| `month(t+1)` | Month of next timestamp. | integer |
| `is_weekend(t+1)` | Weekend flag for next timestamp. | `0/1` |
| `price(t)` | Current price. | `€/MWh` |
| `price_lag_1` | Price one hour before `t`. | `€/MWh` |
| `price_lag_24` | Price one day before `t`. | `€/MWh` |
| `price_lag_168` | Price one week before `t`. | `€/MWh` |
| `consumption(t)` | Current consumption. | `MWh` |
| `wind_onshore(t)` | Current onshore wind generation. | `MWh` |
| `wind_offshore(t)` | Current offshore wind generation. | `MWh` |
| `solar(t)` | Current photovoltaic generation. | `MWh` |
| `hydro(t)` | Current hydropower generation. | `MWh` |
| `biomass(t)` | Current biomass generation. | `MWh` |
| `coal(t)` | Brown coal plus hard coal generation. | `MWh` |
| `gas(t)` | Current natural gas generation. | `MWh` |

---

### Carbon Intensity Model Dataset

Builder:

```text
scripts/build_carbon_intensity_model_dataset.py
```

Output:

```text
data/processed/carbon_intensity_model_dataset_2y.csv
```

Target:

```text
carbon_intensity(t+1)
```

Target unit:

```text
kgCO2/MWh
```

Feature schema:

| Column | Meaning | Unit |
|---|---|---|
| `timestamp` | Current timestamp `t`. | datetime |
| `carbon_intensity(t+1)` | Target: next-hour carbon intensity. | `kgCO2/MWh` |
| `hour(t+1)` | Hour of next timestamp. | integer |
| `day_of_week(t+1)` | Day of week of next timestamp. | integer |
| `month(t+1)` | Month of next timestamp. | integer |
| `is_weekend(t+1)` | Weekend flag for next timestamp. | `0/1` |
| `carbon_intensity(t)` | Current carbon intensity. | `kgCO2/MWh` |
| `carbon_lag_1` | Carbon intensity one hour before `t`. | `kgCO2/MWh` |
| `carbon_lag_24` | Carbon intensity one day before `t`. | `kgCO2/MWh` |
| `carbon_lag_168` | Carbon intensity one week before `t`. | `kgCO2/MWh` |
| `wind_onshore` | Current onshore wind generation. | `MWh` |
| `wind_offshore` | Current offshore wind generation. | `MWh` |
| `solar` | Current photovoltaic generation. | `MWh` |
| `hydro` | Current hydropower generation. | `MWh` |
| `biomass` | Current biomass generation. | `MWh` |
| `coal` | Brown coal plus hard coal generation. | `MWh` |
| `gas` | Current natural gas generation. | `MWh` |

---

## Training Scripts

Both model training scripts use a time-based split:

```text
First 75% of rows = training set
Last 25% of rows = test set
```

This avoids random shuffling and respects the time-series structure.

---

### `scripts/train_price_xgboost.py`

Trains the electricity price model.

Training source:

```text
data/processed/price_model_dataset_2y.csv
```

Target:

```text
price(€/MWh)
```

Saved artifacts:

| Artifact | Path |
|---|---|
| Model | `models/price_xgboost.json` |
| Metrics | `outputs/price_xgboost_metrics.json` |
| Test predictions | `outputs/price_xgboost_predictions.csv` |

Model type:

```text
XGBRegressor
```

Model parameters:

```text
objective = reg:squarederror
n_estimators = 800
learning_rate = 0.03
max_depth = 5
subsample = 0.9
colsample_bytree = 0.9
random_state = 42
n_jobs = -1
```

Current test performance:

| Metric | Value |
|---|---:|
| MAE | `8.443 €/MWh` |
| RMSE | `12.147 €/MWh` |
| R² | `0.935` |

---

### `scripts/train_carbon_intensity_xgboost.py`

Trains the carbon intensity model.

Training source:

```text
data/processed/carbon_intensity_model_dataset_2y.csv
```

Target:

```text
carbon_intensity(t+1)
```

Saved artifacts:

| Artifact | Path |
|---|---|
| Model | `models/carbon_intensity_xgboost.json` |
| Metrics | `outputs/carbon_intensity_xgboost_metrics.json` |
| Test predictions | `outputs/carbon_intensity_xgboost_predictions.csv` |

Model type:

```text
XGBRegressor
```

Current test performance:

| Metric | Value |
|---|---:|
| MAE | `8.942 kgCO2/MWh` |
| RMSE | `11.998 kgCO2/MWh` |
| R² | `0.992` |

---

## Evaluation Scripts

### `scripts/evaluate_price_xgboost.py`

Evaluates saved price model test predictions.

Input:

```text
outputs/price_xgboost_predictions.csv
```

Outputs:

```text
outputs/price_xgboost_evaluation_metrics.json
outputs/price_xgboost_future_timeseries.png
```

Plot behavior:

- Actual vs predicted price.
- Last 14 days of the test period.
- Unit: `€/MWh`.

---

### `scripts/evaluate_carbon_intensity_xgboost.py`

Evaluates saved carbon intensity model test predictions.

Input:

```text
outputs/carbon_intensity_xgboost_predictions.csv
```

Outputs:

```text
outputs/carbon_intensity_xgboost_evaluation_metrics.json
outputs/carbon_intensity_xgboost_timeseries.png
```

Plot behavior:

- Actual vs predicted carbon intensity.
- Last 14 days of the test period.
- Unit: `kgCO2/MWh`.

---

## Inference Scripts

Inference scripts forecast one week ahead using trained models.

Important constraint:

```text
Future generation and consumption are not available in this branch.
```

Therefore both next-week inference scripts use this future feature assumption:

```text
same_hour_previous_week
```

This means a future hour uses energy features from the same hour one week earlier.

---

### `scripts/predict_price_next_week.py`

Predicts next-week electricity price.

Inference sources:

```text
models/price_xgboost.json
outputs/price_xgboost_metrics.json
data/processed/price_model_dataset_2y.csv
```

Outputs:

```text
outputs/price_xgboost_next_week_forecast.csv
outputs/price_xgboost_next_week_forecast.png
```

Current forecast range:

```text
2026-06-26 08:00:00
to
2026-07-03 07:00:00
```

Forecast horizon:

```text
168 hourly predictions
```

Forecast mechanics:

1. Load trained price model.
2. Load feature order from `outputs/price_xgboost_metrics.json`.
3. Start from the last timestamp in `price_model_dataset_2y.csv`.
4. Build one row of future features.
5. Predict the next hour.
6. Add the prediction back into price history.
7. Use the recursive price history for later lag features.
8. Repeat for 168 hours.

Future feature assumptions:

| Feature type | Method |
|---|---|
| Calendar features | Known directly from future timestamp. |
| Price lag features | Recursive predictions after observed history ends. |
| Consumption | Same hour from previous week. |
| Generation | Same hour from previous week. |

Plot:

- Past 7 days of actual price.
- Next 7 days of predicted price.
- Dotted vertical line marks forecast start.
- X-axis labels show dates only.

---

### `scripts/predict_carbon_intensity_next_week.py`

Predicts next-week carbon intensity.

Inference sources:

```text
models/carbon_intensity_xgboost.json
outputs/carbon_intensity_xgboost_metrics.json
data/processed/carbon_intensity_model_dataset_2y.csv
```

Outputs:

```text
outputs/carbon_intensity_xgboost_next_week_forecast.csv
outputs/carbon_intensity_xgboost_next_week_forecast.png
```

Current forecast range:

```text
2026-06-26 07:00:00
to
2026-07-03 06:00:00
```

Forecast horizon:

```text
168 hourly predictions
```

Forecast mechanics:

1. Load trained carbon intensity model.
2. Load feature order from `outputs/carbon_intensity_xgboost_metrics.json`.
3. Start from the last timestamp in `carbon_intensity_model_dataset_2y.csv`.
4. Build one row of future features.
5. Predict the next hour.
6. Add the prediction back into carbon history.
7. Use the recursive carbon history for later lag features.
8. Repeat for 168 hours.

Future feature assumptions:

| Feature type | Method |
|---|---|
| Calendar features | Known directly from future timestamp. |
| Carbon lag features | Recursive predictions after observed history ends. |
| Generation | Same hour from previous week. |

Plot:

- Past 7 days of actual carbon intensity.
- Next 7 days of predicted carbon intensity.
- Dotted vertical line marks forecast start.
- X-axis labels show dates only.

---

## End-to-End Run Order

Use this order to rebuild the full branch from raw data to final forecasts.

```bash
python3 scripts/collect_generation_data.py
python3 scripts/collect_consumption_data.py

python3 scripts/calculate_carbon_intensity.py

python3 scripts/build_price_model_dataset.py
python3 scripts/build_carbon_intensity_model_dataset.py

python3 scripts/train_price_xgboost.py
python3 scripts/train_carbon_intensity_xgboost.py

MPLCONFIGDIR=/tmp/energy_carbon_mpl python3 scripts/evaluate_price_xgboost.py
MPLCONFIGDIR=/tmp/energy_carbon_mpl python3 scripts/evaluate_carbon_intensity_xgboost.py

MPLCONFIGDIR=/tmp/energy_carbon_mpl python3 scripts/predict_price_next_week.py
MPLCONFIGDIR=/tmp/energy_carbon_mpl python3 scripts/predict_carbon_intensity_next_week.py
```

---

## Training Sources

| Model | Training CSV | Target |
|---|---|---|
| Price model | `data/processed/price_model_dataset_2y.csv` | `price(€/MWh)` |
| Carbon intensity model | `data/processed/carbon_intensity_model_dataset_2y.csv` | `carbon_intensity(t+1)` |

---

## Inference Sources

| Model | Model file | Feature contract | Latest processed source |
|---|---|---|---|
| Price | `models/price_xgboost.json` | `outputs/price_xgboost_metrics.json` | `data/processed/price_model_dataset_2y.csv` |
| Carbon intensity | `models/carbon_intensity_xgboost.json` | `outputs/carbon_intensity_xgboost_metrics.json` | `data/processed/carbon_intensity_model_dataset_2y.csv` |

The metrics JSON files are used during inference because they store the exact
feature order used during training.

---

## Model Interpretation

### Price model

The price model is a reasonable short-term baseline.

Strengths:

- Uses recent price, daily lag, and weekly lag.
- Uses demand through `consumption(t)`.
- Uses generation mix by source.
- Handles nonlinear relationships through XGBoost.

Limitations:

- Future consumption and generation are not true forecasts.
- Recursive price prediction can accumulate error over the week.
- Large price spikes are difficult to predict exactly.

---

### Carbon intensity model

The carbon intensity model is strong because carbon intensity is closely linked
to generation mix.

Strengths:

- Uses generation source features directly.
- Uses carbon lag features.
- Test performance is high.

Limitations:

- Future generation is assumed from the previous week.
- Forecast quality will drop if actual wind, solar, coal, or gas differs sharply
  from the previous-week assumption.

---

## LLM-Oriented Summary

This branch implements two supervised time-series regression systems:

```text
price(t+1) = f(calendar(t+1), price_lags(t), consumption(t), generation_mix(t))

carbon_intensity(t+1)
  = f(calendar(t+1), carbon_lags(t), generation_mix(t))
```

Both systems use:

- hourly data,
- time-based train/test split,
- XGBoost regression,
- saved feature contracts in metrics JSON,
- recursive next-week inference,
- previous-week energy assumptions for unavailable future features.

The repository is organized so that:

- `build_*_dataset.py` creates supervised learning tables,
- `train_*_xgboost.py` trains models,
- `evaluate_*_xgboost.py` evaluates test predictions,
- `predict_*_next_week.py` performs recursive future inference.

---

## Known Caveats

1. `data/`, `models/`, and `outputs/` can become large.
2. Next-week forecasts are assumption-based, not fully exogenous forecasts.
3. Better future forecasts require external future features:
   - load forecast,
   - weather forecast,
   - wind forecast,
   - solar forecast,
   - plant outage data,
   - market forward data.
4. `.DS_Store` files should not be committed.
5. `venv/` should not be committed.

---

## Branch Outcome

This branch turns the project into a complete forecasting workflow with:

- raw data collectors,
- carbon intensity calculation,
- two model-ready datasets,
- price XGBoost model,
- carbon intensity XGBoost model,
- evaluation metrics,
- actual-vs-predicted plots,
- next-week price forecast,
- next-week carbon intensity forecast.

