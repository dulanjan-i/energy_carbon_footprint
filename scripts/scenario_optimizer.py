import argparse
import os

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import pandas as pd


PRICE_FORECAST_PATH = "outputs/price_xgboost_next_week_forecast.csv"
CARBON_FORECAST_PATH = "outputs/carbon_intensity_xgboost_next_week_forecast.csv"

RECOMMENDATIONS_PATH = "outputs/scenario_daily_recommendations.csv"
SUMMARY_PATH = "outputs/scenario_impact_summary.csv"
IMPACT_PLOT_PATH = "outputs/scenario_impact_cards.png"
DAILY_TABLE_CSV_PATH = "outputs/scenario_daily_schedule_table.csv"
INCENTIVE_CARDS_PATH = "outputs/scenario_incentive_cards.png"
INCENTIVE_CARDS_CSV_PATH = "outputs/scenario_incentive_cards.csv"

PRICE_COLUMN = "predicted_price(€/MWh)"
CARBON_COLUMN = "predicted_carbon_intensity_kgco2_per_mwh"
KWH_PER_MWH = 1000
KG_PER_TONNE = 1000
WEEKS_PER_YEAR = 52
MIN_RETAIL_PRICE_EUR_PER_MWH = 0

DEFAULT_CURRENT_HOUR = 18
DEFAULT_FLEXIBLE_ENERGY_KWH_PER_DAY = 10
DEFAULT_COST_WINDOW_HOURS = 2
DEFAULT_ECO_WINDOW_HOURS = 2
ADOPTION_LEVELS = [0.25, 0.50, 1.00]

parser = argparse.ArgumentParser(
    description="Create daily flexible-use recommendations from price and carbon forecasts."
)
parser.add_argument(
    "--current-hour",
    type=int,
    default=DEFAULT_CURRENT_HOUR,
    help="Normal usage hour in 24-hour format, e.g. 18 for 18:00.",
)
parser.add_argument(
    "--energy-kwh",
    type=float,
    default=DEFAULT_FLEXIBLE_ENERGY_KWH_PER_DAY,
    help="Flexible electricity demand per day in kWh.",
)
parser.add_argument(
    "--cost-window",
    type=int,
    default=DEFAULT_COST_WINDOW_HOURS,
    help="Allowed shift window in hours for Cost Saver.",
)
parser.add_argument(
    "--eco-window",
    type=int,
    default=DEFAULT_ECO_WINDOW_HOURS,
    help="Allowed shift window in hours for Eco Saver.",
)
parser.add_argument(
    "--interactive",
    action="store_true",
    help="Prompt for normal usage time and daily flexible energy.",
)
args = parser.parse_args()

if args.interactive:
    current_hour_input = input(
        f"Normal usage hour [0-23, default {DEFAULT_CURRENT_HOUR}]: "
    ).strip()
    energy_input = input(
        f"Flexible energy per day in kWh [default {DEFAULT_FLEXIBLE_ENERGY_KWH_PER_DAY}]: "
    ).strip()

    if current_hour_input:
        args.current_hour = int(current_hour_input)
    if energy_input:
        args.energy_kwh = float(energy_input)

if not 0 <= args.current_hour <= 23:
    raise ValueError("--current-hour must be between 0 and 23")

if args.energy_kwh <= 0:
    raise ValueError("--energy-kwh must be greater than 0")

CURRENT_HOUR = args.current_hour
FLEXIBLE_ENERGY_KWH_PER_DAY = args.energy_kwh

SCENARIOS = {
    "Business as Usual": None,
    "Cost Saver": {
        "price_weight": 1.0,
        "carbon_weight": 0.0,
        "search_window_hours": args.cost_window,
        "comfort_penalty": 0.0,
    },
    "Eco Saver": {
        "price_weight": 0.0,
        "carbon_weight": 1.0,
        "search_window_hours": args.eco_window,
        "comfort_penalty": 0.0,
    },
}


price_df = pd.read_csv(PRICE_FORECAST_PATH)
carbon_df = pd.read_csv(CARBON_FORECAST_PATH)

price_df["timestamp"] = pd.to_datetime(price_df["timestamp"])
carbon_df["timestamp"] = pd.to_datetime(carbon_df["timestamp"])

forecast_df = price_df[["timestamp", PRICE_COLUMN]].merge(
    carbon_df[["timestamp", CARBON_COLUMN]],
    on="timestamp",
    how="inner",
)
forecast_df = forecast_df.sort_values("timestamp").reset_index(drop=True)
forecast_df["date"] = forecast_df["timestamp"].dt.date
forecast_df["hour"] = forecast_df["timestamp"].dt.hour

price_range = forecast_df[PRICE_COLUMN].max() - forecast_df[PRICE_COLUMN].min()
carbon_range = forecast_df[CARBON_COLUMN].max() - forecast_df[CARBON_COLUMN].min()

forecast_df["normalized_price"] = (
    (forecast_df[PRICE_COLUMN] - forecast_df[PRICE_COLUMN].min()) / price_range
)
forecast_df["normalized_carbon"] = (
    (forecast_df[CARBON_COLUMN] - forecast_df[CARBON_COLUMN].min()) / carbon_range
)

recommendation_rows = []

for _, baseline_row in forecast_df.iterrows():
    for scenario, weights in SCENARIOS.items():
        if scenario == "Business as Usual":
            selected_row = baseline_row
            score = pd.NA
            search_window = 0
        else:
            search_window = weights["search_window_hours"]
            lower_timestamp = baseline_row["timestamp"] - pd.Timedelta(
                hours=search_window
            )
            upper_timestamp = baseline_row["timestamp"] + pd.Timedelta(
                hours=search_window
            )
            window_df = forecast_df[
                (forecast_df["timestamp"] >= lower_timestamp)
                & (forecast_df["timestamp"] <= upper_timestamp)
            ].copy()

            if window_df.empty:
                continue

            hour_distance = (
                window_df["timestamp"] - baseline_row["timestamp"]
            ).abs() / pd.Timedelta(hours=1)
            normalized_distance = hour_distance / search_window
            window_df["scenario_score"] = (
                weights["price_weight"] * window_df["normalized_price"]
                + weights["carbon_weight"] * window_df["normalized_carbon"]
                + weights["comfort_penalty"] * normalized_distance
            )
            selected_row = window_df.loc[window_df["scenario_score"].idxmin()]
            score = selected_row["scenario_score"]

        baseline_effective_price = max(
            baseline_row[PRICE_COLUMN], MIN_RETAIL_PRICE_EUR_PER_MWH
        )
        recommended_effective_price = max(
            selected_row[PRICE_COLUMN], MIN_RETAIL_PRICE_EUR_PER_MWH
        )
        baseline_cost = FLEXIBLE_ENERGY_KWH_PER_DAY * baseline_effective_price / KWH_PER_MWH
        recommended_cost = (
            FLEXIBLE_ENERGY_KWH_PER_DAY * recommended_effective_price / KWH_PER_MWH
        )
        baseline_carbon = FLEXIBLE_ENERGY_KWH_PER_DAY * baseline_row[CARBON_COLUMN] / KWH_PER_MWH
        recommended_carbon = (
            FLEXIBLE_ENERGY_KWH_PER_DAY * selected_row[CARBON_COLUMN] / KWH_PER_MWH
        )

        recommendation_rows.append(
            {
                "date": baseline_row["date"],
                "scenario": scenario,
                "current_timestamp": baseline_row["timestamp"],
                "recommended_timestamp": selected_row["timestamp"],
                "current_hour": int(baseline_row["hour"]),
                "recommended_hour": int(selected_row["hour"]),
                "flexible_energy_kwh": FLEXIBLE_ENERGY_KWH_PER_DAY,
                "search_window_hours": search_window,
                "current_price(€/MWh)": baseline_row[PRICE_COLUMN],
                "recommended_price(€/MWh)": selected_row[PRICE_COLUMN],
                "current_carbon_kgco2_per_mwh": baseline_row[CARBON_COLUMN],
                "recommended_carbon_kgco2_per_mwh": selected_row[CARBON_COLUMN],
                "current_cost_eur": baseline_cost,
                "recommended_cost_eur": recommended_cost,
                "current_carbon_kgco2": baseline_carbon,
                "recommended_carbon_kgco2": recommended_carbon,
                "cost_savings_eur": baseline_cost - recommended_cost,
                "carbon_reduction_kgco2": baseline_carbon - recommended_carbon,
                "score": score,
            }
        )

recommendations_df = pd.DataFrame(recommendation_rows)

weekly_summary_df = (
    recommendations_df.groupby("scenario", as_index=False)
    .agg(
        weekly_cost_eur=("recommended_cost_eur", "sum"),
        weekly_carbon_kgco2=("recommended_carbon_kgco2", "sum"),
        weekly_cost_savings_eur=("cost_savings_eur", "sum"),
        weekly_carbon_reduction_kgco2=("carbon_reduction_kgco2", "sum"),
        recommendations=("recommended_timestamp", "count"),
    )
    .sort_values("scenario")
)

baseline = weekly_summary_df[
    weekly_summary_df["scenario"] == "Business as Usual"
].iloc[0]

impact_rows = []
for _, row in weekly_summary_df.iterrows():
    for adoption in ADOPTION_LEVELS:
        if row["scenario"] == "Business as Usual":
            adoption = 1.0

        weekly_cost = baseline["weekly_cost_eur"] - adoption * row["weekly_cost_savings_eur"]
        weekly_carbon = (
            baseline["weekly_carbon_kgco2"]
            - adoption * row["weekly_carbon_reduction_kgco2"]
        )

        impact_rows.append(
            {
                "scenario": row["scenario"],
                "adoption_rate": adoption,
                "weekly_cost_eur": weekly_cost,
                "weekly_carbon_kgco2": weekly_carbon,
                "annual_cost_eur": weekly_cost * WEEKS_PER_YEAR,
                "annual_carbon_kgco2": weekly_carbon * WEEKS_PER_YEAR,
                "annual_carbon_tco2": weekly_carbon * WEEKS_PER_YEAR / KG_PER_TONNE,
                "annual_cost_savings_eur": (
                    adoption * row["weekly_cost_savings_eur"] * WEEKS_PER_YEAR
                ),
                "annual_carbon_reduction_kgco2": (
                    adoption * row["weekly_carbon_reduction_kgco2"] * WEEKS_PER_YEAR
                ),
                "annual_carbon_reduction_tco2": (
                    adoption
                    * row["weekly_carbon_reduction_kgco2"]
                    * WEEKS_PER_YEAR
                    / KG_PER_TONNE
                ),
                "recommendations_per_week": row["recommendations"],
            }
        )

        if row["scenario"] == "Business as Usual":
            break

summary_df = pd.DataFrame(impact_rows)

summary_100_df = summary_df[summary_df["adoption_rate"] == 1.0].copy()
recommendation_mode_df = (
    recommendations_df.groupby("scenario")["recommended_hour"]
    .agg(lambda hours: int(hours.mode().iloc[0]))
    .reset_index()
)
dashboard_df = summary_100_df.merge(recommendation_mode_df, on="scenario", how="left")
dashboard_df["scenario_label"] = dashboard_df["scenario"].replace(
    {"Business as Usual": "Current"}
)
dashboard_df["recommended_time"] = dashboard_df["recommended_hour"].map(
    lambda hour: f"{hour:02d}:00"
)
dashboard_df["annual_cost"] = dashboard_df["annual_cost_eur"].map(
    lambda value: f"€{value:,.0f}"
)
dashboard_df["annual_co2"] = dashboard_df["annual_carbon_tco2"].map(
    lambda value: f"{value:,.2f} t"
)
dashboard_df["savings"] = dashboard_df.apply(
    lambda row: "–"
    if row["scenario"] == "Business as Usual"
    else (
        f"€{row['annual_cost_savings_eur']:,.0f}"
        if row["scenario"] == "Cost Saver"
        else (
            f"{row['annual_carbon_reduction_tco2']:,.2f} t CO₂"
            if row["scenario"] == "Eco Saver"
            else ""
        )
    ),
    axis=1,
)
dashboard_order = ["Current", "Cost Saver", "Eco Saver"]
dashboard_df["sort_order"] = dashboard_df["scenario_label"].map(
    {label: index for index, label in enumerate(dashboard_order)}
)
dashboard_df = dashboard_df.sort_values("sort_order")
dashboard_table_df = dashboard_df[
    ["scenario_label", "recommended_time", "annual_cost", "annual_co2", "savings"]
].rename(
    columns={
        "scenario_label": "Scenario",
        "recommended_time": "Most Frequent Time",
        "annual_cost": "Annual Cost",
        "annual_co2": "Annual CO₂",
        "savings": "Savings",
    }
)

incentive_rows = []
for _, row in dashboard_df.iterrows():
    if row["scenario"] == "Business as Usual":
        continue

    if row["scenario"] == "Cost Saver":
        main_incentive = f"Save €{row['annual_cost_savings_eur']:,.0f}/year"
        why_it_matters = (
            f"Also avoids {row['annual_carbon_reduction_tco2']:.2f} t CO₂/year"
        )
    elif row["scenario"] == "Eco Saver":
        main_incentive = (
            f"Cut {row['annual_carbon_reduction_tco2']:.2f} t CO₂/year"
        )
        if row["annual_cost_savings_eur"] >= 0:
            why_it_matters = f"Also saves €{row['annual_cost_savings_eur']:,.0f}/year"
        else:
            why_it_matters = (
                f"Costs €{abs(row['annual_cost_savings_eur']):,.0f}/year more"
            )
    incentive_rows.append(
        {
            "Plan": row["scenario_label"],
            "Recommended Shift": "Every hour → best nearby hour",
            "Main Incentive": main_incentive,
            "Annual Cost": row["annual_cost"],
            "Annual CO₂": row["annual_co2"],
            "Why It Matters": why_it_matters,
        }
    )

incentive_cards_df = pd.DataFrame(incentive_rows)

daily_schedule_df = recommendations_df[
    recommendations_df["scenario"].isin(
        ["Business as Usual", "Cost Saver", "Eco Saver"]
    )
].copy()
daily_schedule_df["scenario_label"] = daily_schedule_df["scenario"].replace(
    {"Business as Usual": "Current"}
)
daily_schedule_df["recommended_time"] = daily_schedule_df["recommended_hour"].map(
    lambda hour: f"{hour:02d}:00"
)
daily_schedule_df["current_time"] = daily_schedule_df["current_hour"].map(
    lambda hour: f"{hour:02d}:00"
)
daily_schedule_table_df = daily_schedule_df.pivot_table(
    index=["date", "current_timestamp", "current_time"],
    columns="scenario_label",
    values="recommended_time",
    aggfunc="first",
).reset_index()
daily_schedule_table_df = daily_schedule_table_df.rename(
    columns={
        "date": "Date",
        "current_timestamp": "Current Timestamp",
        "current_time": "Current Time",
    }
)
daily_schedule_table_df = daily_schedule_table_df[
    ["Date", "Current Timestamp", "Current Time", "Cost Saver", "Eco Saver"]
]

os.makedirs(os.path.dirname(RECOMMENDATIONS_PATH), exist_ok=True)
recommendations_df.to_csv(RECOMMENDATIONS_PATH, index=False)
summary_df.to_csv(SUMMARY_PATH, index=False)
incentive_cards_df.to_csv(INCENTIVE_CARDS_CSV_PATH, index=False)
daily_schedule_table_df.to_csv(DAILY_TABLE_CSV_PATH, index=False)

scenario_colors = {
    "Business as Usual": "#64748B",
    "Cost Saver": "#2563EB",
    "Eco Saver": "#16A34A",
}

impact_plot_df = summary_df[summary_df["adoption_rate"] == 1.0].copy()
impact_plot_df = impact_plot_df.merge(
    dashboard_df[["scenario", "recommended_time"]],
    on="scenario",
    how="left",
)
impact_plot_df = impact_plot_df.sort_values("scenario")

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
cost_bars = axes[0].bar(
    impact_plot_df["scenario"],
    impact_plot_df["annual_cost_eur"],
    color=[scenario_colors.get(s, "#94A3B8") for s in impact_plot_df["scenario"]],
)
axes[0].set_title("Annual Cost by Scenario")
axes[0].set_ylabel("Annual Cost (€)")
axes[0].tick_params(axis="x", rotation=20)
axes[0].grid(True, axis="y", alpha=0.3)

carbon_bars = axes[1].bar(
    impact_plot_df["scenario"],
    impact_plot_df["annual_carbon_tco2"],
    color=[scenario_colors.get(s, "#94A3B8") for s in impact_plot_df["scenario"]],
)
axes[1].set_title("Annual CO₂ by Scenario")
axes[1].set_ylabel("Annual CO₂ (t)")
axes[1].tick_params(axis="x", rotation=20)
axes[1].grid(True, axis="y", alpha=0.3)

for axis, bars, value_column in [
    (axes[0], cost_bars, "annual_cost_eur"),
    (axes[1], carbon_bars, "annual_carbon_tco2"),
]:
    y_offset = impact_plot_df[value_column].max() * 0.03
    for bar, (_, row) in zip(bars, impact_plot_df.iterrows()):
        time_label = (
            "Current hour"
            if row["scenario"] == "Business as Usual"
            else f"Most frequent time: {row['recommended_time']}"
        )
        axis.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + y_offset,
            time_label,
            ha="center",
            va="bottom",
            fontsize=9,
            fontweight="bold",
        )

plt.tight_layout()
plt.savefig(IMPACT_PLOT_PATH, dpi=160)
plt.close()

fig, axes = plt.subplots(1, len(incentive_cards_df), figsize=(16, 5))
if len(incentive_cards_df) == 1:
    axes = [axes]

card_colors = {
    "Cost Saver": "#DBEAFE",
    "Eco Saver": "#DCFCE7",
}
title_colors = {
    "Cost Saver": "#1D4ED8",
    "Eco Saver": "#15803D",
}

for ax, (_, row) in zip(axes, incentive_cards_df.iterrows()):
    plan = row["Plan"]
    ax.axis("off")
    ax.set_facecolor(card_colors.get(plan, "#F8FAFC"))
    ax.add_patch(
        plt.Rectangle(
            (0, 0),
            1,
            1,
            transform=ax.transAxes,
            facecolor=card_colors.get(plan, "#F8FAFC"),
            edgecolor="#CBD5E1",
            linewidth=1.5,
        )
    )
    ax.text(
        0.06,
        0.88,
        plan,
        fontsize=20,
        fontweight="bold",
        color=title_colors.get(plan, "#111827"),
        transform=ax.transAxes,
    )
    ax.text(
        0.06,
        0.70,
        row["Main Incentive"],
        fontsize=17,
        fontweight="bold",
        transform=ax.transAxes,
        wrap=True,
    )
    ax.text(
        0.06,
        0.52,
        f"Shift: {row['Recommended Shift']}",
        fontsize=14,
        transform=ax.transAxes,
    )
    ax.text(
        0.06,
        0.39,
        f"Annual cost: {row['Annual Cost']}",
        fontsize=13,
        transform=ax.transAxes,
    )
    ax.text(
        0.06,
        0.28,
        f"Annual CO₂: {row['Annual CO₂']}",
        fontsize=13,
        transform=ax.transAxes,
    )
    ax.text(
        0.06,
        0.12,
        row["Why It Matters"],
        fontsize=13,
        transform=ax.transAxes,
        wrap=True,
    )

fig.suptitle(
    "Choose Your Incentive",
    fontsize=24,
    fontweight="bold",
    y=1.03,
)
plt.tight_layout()
plt.savefig(INCENTIVE_CARDS_PATH, dpi=180, bbox_inches="tight")
plt.close()

print(f"Saved daily recommendations to: {RECOMMENDATIONS_PATH}")
print(f"Saved scenario impact summary to: {SUMMARY_PATH}")
print(f"Saved incentive cards CSV to: {INCENTIVE_CARDS_CSV_PATH}")
print(f"Saved daily schedule table CSV to: {DAILY_TABLE_CSV_PATH}")
print(f"Saved impact plot to: {IMPACT_PLOT_PATH}")
print(f"Saved incentive cards to: {INCENTIVE_CARDS_PATH}")
print()
print("Scenario impact cards, 100% adoption:")
print(
    summary_df[summary_df["adoption_rate"] == 1.0][
        [
            "scenario",
            "annual_cost_eur",
            "annual_carbon_tco2",
            "annual_cost_savings_eur",
            "annual_carbon_reduction_tco2",
        ]
    ]
    .round(2)
    .to_string(index=False)
)
print()
print("Example daily recommendations:")
print(
    recommendations_df[
        recommendations_df["scenario"].isin(["Cost Saver", "Eco Saver"])
    ]
    .head(12)[
        [
            "date",
            "scenario",
            "current_hour",
            "recommended_hour",
            "cost_savings_eur",
            "carbon_reduction_kgco2",
        ]
    ]
    .round(3)
    .to_string(index=False)
)
