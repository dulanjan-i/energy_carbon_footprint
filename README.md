# Energy Carbon Footprint

This repository contains a full hourly energy forecasting and household decision-support workflow for Germany, plus a React + Node app that visualizes the forecasts and turns them into practical actions.

## Authorship

Full authorship of this application is reserved for:

- Dulanjana Wijenayake
- Tien An Su
- Yi Ting Yang

The project has two connected layers:

1. A Python pipeline that downloads raw SMARD data, computes carbon intensity, builds model datasets, trains XGBoost models, evaluates them, and generates one-week forecasts.
2. A Vite React frontend with a Node/Express backend that reads the forecast artifacts and presents weekly cost, carbon, heating, and scenario guidance to the user.

## What The Project Does

- Forecasts next-hour electricity price.
- Forecasts next-hour grid carbon intensity.
- Builds next-week recursive forecasts for both signals.
- Estimates household weekly cost and emissions from a submitted electricity bill.
- Recommends greener or cheaper time windows for flexible usage.
- Checks district heating availability for Halle postal codes.
- Shows a leaderboard-style progress view and personalized tips.

## Repository Structure

```text
.
├── backend/                    # Node/Express API
├── frontend/                   # React + Vite app
├── models/                     # Saved XGBoost model files
├── outputs/                    # Metrics, predictions, forecasts, plots, scenario outputs
├── scripts/                    # Data prep, training, evaluation, and forecasting scripts
├── download_data.py            # Legacy generation downloader
├── get_smard_data.py           # Legacy FastAPI SMARD helper
├── PIPELINE.md                 # Detailed pipeline notes
├── requirements.txt            # Python dependencies
└── package-lock.json           # Root npm lockfile for the mixed workspace
```

## End-To-End Workflow

### 1. Download raw data

The main data collectors are:

- [scripts/collect_generation_data.py](scripts/collect_generation_data.py)
- [scripts/collect_consumption_data.py](scripts/collect_consumption_data.py)

They pull hourly SMARD data and write:

- [data/raw/actual_generation_2y.csv](data/raw/actual_generation_2y.csv)
- [data/raw/total_consumption_2y.csv](data/raw/total_consumption_2y.csv)

The price source is already stored as [data/raw/PFC.csv](data/raw/PFC.csv).

### 2. Compute hourly carbon intensity

[scripts/calculate_carbon_intensity.py](scripts/calculate_carbon_intensity.py) reads generation by source and writes:

- [data/processed/hourly_carbon_intensity_2y.csv](data/processed/hourly_carbon_intensity_2y.csv)

### 3. Build supervised training tables

Two dataset builders create next-hour prediction tables:

- [scripts/build_price_model_dataset.py](scripts/build_price_model_dataset.py)
- [scripts/build_carbon_intensity_model_dataset.py](scripts/build_carbon_intensity_model_dataset.py)

Outputs:

- [data/processed/price_model_dataset_2y.csv](data/processed/price_model_dataset_2y.csv)
- [data/processed/carbon_intensity_model_dataset_2y.csv](data/processed/carbon_intensity_model_dataset_2y.csv)

### 4. Train the XGBoost models

The training scripts are:

- [scripts/train_price_xgboost.py](scripts/train_price_xgboost.py)
- [scripts/train_carbon_intensity_xgboost.py](scripts/train_carbon_intensity_xgboost.py)

Each script:

- sorts by timestamp,
- uses the first 75% of rows for training,
- uses the last 25% for testing,
- fits an `XGBRegressor`,
- saves the model JSON,
- saves test predictions,
- saves training metrics and the feature list.

### 5. Evaluate the saved predictions

Evaluation scripts:

- [scripts/evaluate_price_xgboost.py](scripts/evaluate_price_xgboost.py)
- [scripts/evaluate_carbon_intensity_xgboost.py](scripts/evaluate_carbon_intensity_xgboost.py)

They recompute MAE, RMSE, and R2 from the saved predictions and create time-series plots in `outputs/`.

### 6. Generate next-week forecasts

Forecast scripts:

- [scripts/predict_price_next_week.py](scripts/predict_price_next_week.py)
- [scripts/predict_carbon_intensity_next_week.py](scripts/predict_carbon_intensity_next_week.py)

Each script recursively predicts 168 hourly steps and saves a forecast CSV plus a plot.

### 7. Build scenario outputs

The scenario tools consume the forecast CSVs:

- [scripts/scenario_optimizer.py](scripts/scenario_optimizer.py)
- [scripts/build_scenario_html_dashboard.py](scripts/build_scenario_html_dashboard.py)

They generate recommendation tables, impact summaries, and dashboard artifacts in `outputs/`.

### 8. Serve the interactive app

The frontend submits user inputs to the Node backend at `/api/calculate`.

- Backend entry point: [backend/server.js](backend/server.js)
- Frontend entry point: [frontend/src/main.jsx](frontend/src/main.jsx)
- Main app shell: [frontend/src/App.jsx](frontend/src/App.jsx)

The backend reads the next-week forecast CSVs, converts wholesale values from per-MWh to per-kWh, calculates weekly baseline cost and carbon from the user bill, and returns chart data plus summary cards.

## Carbon Intensity Logic

The hourly carbon intensity calculation in [scripts/calculate_carbon_intensity.py](scripts/calculate_carbon_intensity.py) uses an emission-factor weighted average:

$$
CI_h = \frac{\sum_s G_{s,h} \cdot EF_s}{\sum_s G_{s,h}}
$$

Where:

- $G_{s,h}$ is generation from source $s$ at hour $h$ in MWh.
- $EF_s$ is the emission factor for source $s$ in kgCO2/MWh.
- $CI_h$ is hourly carbon intensity in kgCO2/MWh.

Emission factors used in the repository:

| Source | Factor (kgCO2/MWh) |
|---|---:|
| Biomass | 0 |
| Hydropower | 0 |
| Wind Offshore | 0 |
| Wind Onshore | 0 |
| Photovoltaics | 0 |
| Other Renewables | 0 |
| Brown Coal | 1119 |
| Hard Coal | 860 |
| Natural Gas | 394 |
| Pumped Storage | 0 |
| Other Conventional | 344 |

The script also guards against zero total generation by leaving the intensity missing for those rows.

## Model Features

### Price model target

- Target: `price(€/MWh)`
- Meaning: next-hour price, `price(t+1)`

### Carbon model target

- Target: `carbon_intensity(t+1)`
- Unit: kgCO2/MWh

### Shared feature pattern

Both datasets use calendar features for `t+1` and lag features from the current and earlier hours.

Lag features are literal shifts:

- `lag_1` = value at `t-1`
- `lag_24` = value at `t-24`
- `lag_168` = value at `t-168`

The price model also uses consumption and generation mix features. The carbon model uses carbon lags and generation mix features.

## Training And Evaluation Metrics

The scripts report the standard regression metrics:

$$
MAE = \frac{1}{n}\sum_{i=1}^{n} |y_i - \hat{y}_i|
$$

$$
RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}
$$

$$
R^2 = 1 - \frac{\sum_{i=1}^{n}(y_i - \hat{y}_i)^2}{\sum_{i=1}^{n}(y_i - \bar{y})^2}
$$

## Forecasting Assumptions

The next-week forecast scripts do not have access to future weather, demand, or generation data. To keep the forecast recursive, they assume:

- calendar features are known from the future timestamp,
- lag features come from observed history and prior model predictions,
- future generation and consumption are approximated using the same hour from the previous week.

This makes the forecast usable, but it is still assumption-based rather than fully exogenous.

## User-Facing App Flow

1. The user opens the React app in `frontend/`.
2. They enter household size, electricity bill, heating bill, and postcode.
3. React sends the form data to `http://localhost:5001/api/calculate`.
4. The Node backend loads the next-week forecast CSVs from `outputs/`.
5. The backend computes weekly cost and carbon from the user's baseline usage.
6. The frontend renders the weekly summary, line chart, smart shift tips, heating check, scenario simulator, and leaderboard.

The overview dashboard is the main backend-driven screen. The simulator, heating, tips, and leaderboard tabs are mostly client-side logic layered on top of the submitted household data.

## Key UI Components

- [frontend/src/components/Graphs.jsx](frontend/src/components/Graphs.jsx) renders the dual-axis price and carbon chart.
- [frontend/src/components/ScenarioSimulator.jsx](frontend/src/components/ScenarioSimulator.jsx) offers a local scenario planner using a fixed forecast snapshot.
- [frontend/src/components/WaermeCheck.jsx](frontend/src/components/WaermeCheck.jsx) checks Halle postal codes against a built-in district heating map.
- [frontend/src/components/SmartTips.jsx](frontend/src/components/SmartTips.jsx) generates household-specific tips from bill size, household size, and postcode zone.
- [frontend/src/components/Leaderboard.jsx](frontend/src/components/Leaderboard.jsx) builds a local green-league style comparison.

## Legacy Or Auxiliary Scripts

These files exist in the repo but are not part of the main app path:

- [download_data.py](download_data.py)
- [get_smard_data.py](get_smard_data.py)

They provide older or standalone SMARD download helpers. The current main workflow is the one under `scripts/`.

## Setup

### Python environment

Install the Python requirements from the repository root:

```bash
pip install -r requirements.txt
```

The Python stack uses:

- pandas
- numpy
- scikit-learn
- xgboost
- matplotlib
- requests
- fastapi and uvicorn for the legacy SMARD helper

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on port `5001` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend uses Vite.

## Full Rebuild Order

Run the full pipeline in this order if you want to recreate every derived artifact from scratch:

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
python3 scripts/scenario_optimizer.py
python3 scripts/build_scenario_html_dashboard.py
```

## Important Output Files

- [outputs/price_xgboost_metrics.json](outputs/price_xgboost_metrics.json)
- [outputs/carbon_intensity_xgboost_metrics.json](outputs/carbon_intensity_xgboost_metrics.json)
- [outputs/price_xgboost_next_week_forecast.csv](outputs/price_xgboost_next_week_forecast.csv)
- [outputs/carbon_intensity_xgboost_next_week_forecast.csv](outputs/carbon_intensity_xgboost_next_week_forecast.csv)
- [outputs/scenario_recommendation_dashboard.html](outputs/scenario_recommendation_dashboard.html)

## Notes And Caveats

- The next-week forecasts are recursive and can accumulate error across the horizon.
- Future consumption and generation are not truly forecasted; they are approximated using the previous week’s same hour.
- The React simulator component uses a built-in forecast snapshot rather than the backend CSVs.
- The root `package.json` is minimal; the meaningful npm apps live in `backend/` and `frontend/`.

## In One Line

This repo turns raw SMARD hourly energy data into carbon intensity forecasts, price forecasts, scenario recommendations, and a polished household-facing dashboard.