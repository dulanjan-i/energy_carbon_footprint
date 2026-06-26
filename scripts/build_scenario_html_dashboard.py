import json
import os

import pandas as pd


PRICE_FORECAST_PATH = "outputs/price_xgboost_next_week_forecast.csv"
CARBON_FORECAST_PATH = "outputs/carbon_intensity_xgboost_next_week_forecast.csv"
HTML_OUTPUT_PATH = "outputs/scenario_recommendation_dashboard.html"

PRICE_COLUMN = "predicted_price(€/MWh)"
CARBON_COLUMN = "predicted_carbon_intensity_kgco2_per_mwh"
DEFAULT_ANNUAL_KWH = 3650
DEFAULT_SEARCH_WINDOW_HOURS = 2

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

forecast_rows = []
for _, row in forecast_df.iterrows():
    forecast_rows.append(
        {
            "timestamp": row["timestamp"].strftime("%Y-%m-%d %H:%M"),
            "price": round(float(row[PRICE_COLUMN]), 6),
            "carbon": round(float(row[CARBON_COLUMN]), 6),
        }
    )

html = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Energy Scenario Recommendation</title>
  <style>
    :root {{
      --bg: #f8fafc;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #64748b;
      --line: #e2e8f0;
      --blue: #2563eb;
      --green: #16a34a;
      --orange: #ea580c;
    }}

    body {{
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}

    main {{
      max-width: 1080px;
      margin: 40px auto;
      padding: 0 20px;
    }}

    h1 {{
      margin: 0 0 8px;
      font-size: 34px;
    }}

    .subtitle {{
      margin: 0 0 28px;
      color: var(--muted);
      font-size: 16px;
    }}

    .grid {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 18px;
    }}

    .card {{
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 18px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }}

    label {{
      display: block;
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    input, select {{
      width: 100%;
      box-sizing: border-box;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
      font-size: 16px;
      background: #fff;
    }}

    input[type="range"] {{
      padding: 0;
      accent-color: var(--green);
    }}

    .scale-row {{
      display: flex;
      justify-content: space-between;
      margin-top: 8px;
      color: var(--muted);
      font-size: 13px;
    }}

    .result {{
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 18px;
      margin-top: 18px;
    }}

    .big {{
      font-size: 44px;
      font-weight: 800;
      line-height: 1;
      color: var(--green);
      margin: 8px 0 12px;
    }}

    .pill {{
      display: inline-block;
      padding: 6px 10px;
      border-radius: 999px;
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      font-size: 13px;
    }}

    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      font-size: 14px;
    }}

    th, td {{
      padding: 11px 8px;
      border-bottom: 1px solid var(--line);
      text-align: left;
    }}

    th {{
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}

    .positive {{
      color: var(--green);
      font-weight: 700;
    }}

    .negative {{
      color: var(--orange);
      font-weight: 700;
    }}

    .note {{
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
      margin-top: 14px;
    }}

    @media (max-width: 820px) {{
      .grid, .result {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <main>
    <h1>Flexible Energy Recommendation</h1>
    <p class="subtitle">
      Pick a forecast hour, enter annual flexible electricity use, and choose how much you care about cost vs carbon.
    </p>

    <section class="grid">
      <div class="card">
        <label for="annualKwh">Annual flexible electricity</label>
        <input id="annualKwh" type="number" min="1" step="1" value="{DEFAULT_ANNUAL_KWH}" />
        <p class="note">
          Daily flexible energy: <strong id="dailyKwh"></strong> kWh/day
        </p>
      </div>

      <div class="card">
        <label for="selectedTime">Pick current time</label>
        <input id="selectedTime" type="datetime-local" step="3600" />
        <p class="note">The recommendation searches nearby hours in the forecast.</p>
      </div>

      <div class="card">
        <label for="timeWindow">Allowed time window</label>
        <select id="timeWindow">
          <option value="1">±1 hour</option>
          <option value="2" selected>±2 hours</option>
          <option value="3">±3 hours</option>
          <option value="4">±4 hours</option>
          <option value="6">±6 hours</option>
          <option value="8">±8 hours</option>
          <option value="12">±12 hours</option>
        </select>
        <p class="note">Bigger windows give more savings, but require more flexibility.</p>
      </div>

      <div class="card">
        <label for="priority">Priority scale</label>
        <input id="priority" type="range" min="0" max="100" step="1" value="50" />
        <div class="scale-row">
          <span>💰 Cost Priority</span>
          <strong id="priorityLabel">50%</strong>
          <span>🌱 Carbon Priority</span>
        </div>
      </div>
    </section>

    <section class="result">
      <div class="card">
        <span class="pill" id="strategyLabel">Balanced recommendation</span>
        <h2>Recommended Time</h2>
        <div class="big" id="recommendedTime"></div>
        <p id="recommendationText"></p>
        <p class="note">
          The slider uses an aggressive nonlinear curve, so moving away from 50% quickly favors either € savings or CO₂ reduction.
          The highest utility wins.
        </p>
      </div>

      <div class="card">
        <h2>Estimated Annual Impact</h2>
        <table>
          <tbody>
            <tr>
              <th>Cost change</th>
              <td id="costChange"></td>
            </tr>
            <tr>
              <th>CO₂ change</th>
              <td id="carbonChange"></td>
            </tr>
            <tr>
              <th>Current annual cost</th>
              <td id="currentAnnualCost"></td>
            </tr>
            <tr>
              <th>Recommended annual cost</th>
              <td id="recommendedAnnualCost"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <h2>Selected Hour vs Recommended Hour</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Selected Hour</th>
            <th>Recommended Hour</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Time</td>
            <td id="currentTimeCell"></td>
            <td id="recommendedTimeCell"></td>
          </tr>
          <tr>
            <td>Price</td>
            <td id="currentPriceCell"></td>
            <td id="recommendedPriceCell"></td>
          </tr>
          <tr>
            <td>Carbon intensity</td>
            <td id="currentCarbonCell"></td>
            <td id="recommendedCarbonCell"></td>
          </tr>
        </tbody>
      </table>
    </section>
  </main>

  <script>
    const forecast = {json.dumps(forecast_rows)};
    const selectedTime = document.getElementById("selectedTime");
    const timeWindow = document.getElementById("timeWindow");
    const annualKwh = document.getElementById("annualKwh");
    const dailyKwh = document.getElementById("dailyKwh");
    const priority = document.getElementById("priority");
    const priorityLabel = document.getElementById("priorityLabel");
    const sliderAggressiveness = 2.4;

    const defaultOption = forecast.findIndex((row) => row.timestamp.endsWith("18:00"));
    const defaultIndex = defaultOption >= 0 ? defaultOption : 0;
    selectedTime.min = forecast[0].timestamp.replace(" ", "T");
    selectedTime.max = forecast[forecast.length - 1].timestamp.replace(" ", "T");
    selectedTime.value = forecast[defaultIndex].timestamp.replace(" ", "T");

    function normalize(value, min, max) {{
      if (max === min) return 0;
      return (value - min) / (max - min);
    }}

    function formatEuro(value) {{
      return new Intl.NumberFormat("en-US", {{
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }}).format(value);
    }}

    function signedEuro(value) {{
      const formatted = formatEuro(Math.abs(value));
      return value >= 0 ? `Save ${{formatted}}` : `Pay ${{formatted}} more`;
    }}

    function signedCarbon(value) {{
      const absValue = Math.abs(value).toFixed(2);
      return value >= 0 ? `Reduce ${{absValue}} t CO₂` : `Increase ${{absValue}} t CO₂`;
    }}

    function cssClassForSavings(value) {{
      return value >= 0 ? "positive" : "negative";
    }}

    function aggressivePriority(rawPriority) {{
      if (rawPriority <= 0.5) {{
        return 0.5 * Math.pow(rawPriority * 2, sliderAggressiveness);
      }}
      return 1 - 0.5 * Math.pow((1 - rawPriority) * 2, sliderAggressiveness);
    }}

    function selectedInputToTimestamp() {{
      return selectedTime.value.replace("T", " ");
    }}

    function findNearestForecastIndex(timestampText) {{
      const target = new Date(timestampText.replace(" ", "T")).getTime();
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      forecast.forEach((row, index) => {{
        const distance = Math.abs(new Date(row.timestamp.replace(" ", "T")).getTime() - target);
        if (distance < nearestDistance) {{
          nearestDistance = distance;
          nearestIndex = index;
        }}
      }});
      return nearestIndex;
    }}

    function updateDashboard() {{
      const selectedIndex = findNearestForecastIndex(selectedInputToTimestamp());
      selectedTime.value = forecast[selectedIndex].timestamp.replace(" ", "T");
      const current = forecast[selectedIndex];
      const annualEnergy = Number(annualKwh.value);
      const dailyEnergy = annualEnergy / 365;
      const searchWindowHours = Number(timeWindow.value);
      const rawCarbonPriority = Number(priority.value) / 100;
      const carbonPriority = aggressivePriority(rawCarbonPriority);
      const costPriority = 1 - carbonPriority;

      const startIndex = Math.max(0, selectedIndex - searchWindowHours);
      const endIndex = Math.min(forecast.length - 1, selectedIndex + searchWindowHours);
      const candidates = forecast.slice(startIndex, endIndex + 1);

      const candidatesWithImpact = candidates.map((candidate) => {{
        const currentCost = annualEnergy * Math.max(current.price, 0) / 1000;
        const candidateCost = annualEnergy * Math.max(candidate.price, 0) / 1000;
        const costSaving = currentCost - candidateCost;
        const currentCarbon = annualEnergy * current.carbon / 1000 / 1000;
        const candidateCarbon = annualEnergy * candidate.carbon / 1000 / 1000;
        const carbonReduction = currentCarbon - candidateCarbon;
        return {{
          ...candidate,
          costSaving,
          carbonReduction,
        }};
      }});

      const candidateCostSavings = candidatesWithImpact.map((candidate) => candidate.costSaving);
      const carbonReductions = candidatesWithImpact.map((candidate) => candidate.carbonReduction);
      const minCostSaving = Math.min(...candidateCostSavings);
      const maxCostSaving = Math.max(...candidateCostSavings);
      const minCarbonReduction = Math.min(...carbonReductions);
      const maxCarbonReduction = Math.max(...carbonReductions);

      let best = candidatesWithImpact[0];
      let bestUtility = -Infinity;
      candidatesWithImpact.forEach((candidate) => {{
        const costUtility = normalize(candidate.costSaving, minCostSaving, maxCostSaving);
        const carbonUtility = normalize(
          candidate.carbonReduction,
          minCarbonReduction,
          maxCarbonReduction
        );
        const utility = costPriority * costUtility + carbonPriority * carbonUtility;
        if (utility > bestUtility) {{
          bestUtility = utility;
          best = candidate;
        }}
      }});

      const currentAnnualCost = annualEnergy * Math.max(current.price, 0) / 1000;
      const recommendedAnnualCost = annualEnergy * Math.max(best.price, 0) / 1000;
      const costSavings = best.costSaving;

      const currentAnnualCarbonTonnes = annualEnergy * current.carbon / 1000 / 1000;
      const recommendedAnnualCarbonTonnes = annualEnergy * best.carbon / 1000 / 1000;
      const carbonReductionTonnes = best.carbonReduction;

      let strategy = "Balanced recommendation";
      if (carbonPriority === 0) strategy = "Cost-only recommendation";
      if (carbonPriority === 1) strategy = "Carbon-only recommendation";

      dailyKwh.textContent = dailyEnergy.toFixed(2);
      priorityLabel.textContent =
        `${{priority.value}}% slider → ${{Math.round(carbonPriority * 100)}}% effective carbon`;
      document.getElementById("strategyLabel").textContent = strategy;
      document.getElementById("recommendedTime").textContent = best.timestamp.slice(11);
      document.getElementById("recommendationText").textContent =
        `Move from ${{current.timestamp}} to ${{best.timestamp}} within a ±${{searchWindowHours}} hour window. ` +
        `This choice balances ${{Math.round(costPriority * 100)}}% cost savings and ` +
        `${{Math.round(carbonPriority * 100)}}% carbon reduction.`;

      const costChange = document.getElementById("costChange");
      costChange.textContent = signedEuro(costSavings);
      costChange.className = cssClassForSavings(costSavings);

      const carbonChange = document.getElementById("carbonChange");
      carbonChange.textContent = signedCarbon(carbonReductionTonnes);
      carbonChange.className = cssClassForSavings(carbonReductionTonnes);

      document.getElementById("currentAnnualCost").textContent = formatEuro(currentAnnualCost);
      document.getElementById("recommendedAnnualCost").textContent = formatEuro(recommendedAnnualCost);

      document.getElementById("currentTimeCell").textContent = current.timestamp;
      document.getElementById("recommendedTimeCell").textContent = best.timestamp;
      document.getElementById("currentPriceCell").textContent = `${{current.price.toFixed(2)}} €/MWh`;
      document.getElementById("recommendedPriceCell").textContent = `${{best.price.toFixed(2)}} €/MWh`;
      document.getElementById("currentCarbonCell").textContent = `${{current.carbon.toFixed(2)}} kgCO₂/MWh`;
      document.getElementById("recommendedCarbonCell").textContent = `${{best.carbon.toFixed(2)}} kgCO₂/MWh`;
    }}

    selectedTime.addEventListener("change", updateDashboard);
    timeWindow.addEventListener("change", updateDashboard);
    annualKwh.addEventListener("input", updateDashboard);
    priority.addEventListener("input", updateDashboard);
    updateDashboard();
  </script>
</body>
</html>
"""

os.makedirs(os.path.dirname(HTML_OUTPUT_PATH), exist_ok=True)
with open(HTML_OUTPUT_PATH, "w", encoding="utf-8") as file:
    file.write(html)

print(f"Saved scenario HTML dashboard to: {HTML_OUTPUT_PATH}")
