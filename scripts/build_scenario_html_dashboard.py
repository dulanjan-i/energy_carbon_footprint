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
      background:
        radial-gradient(circle at top left, #dbeafe 0, transparent 28%),
        linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }}

    main {{
      max-width: 1180px;
      margin: 32px auto;
      padding: 0 20px;
    }}

    h1 {{
      margin: 0 0 10px;
      font-size: 42px;
      letter-spacing: -0.04em;
    }}

    .subtitle {{
      margin: 0 0 28px;
      color: var(--muted);
      font-size: 16px;
    }}

    .hero {{
      background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #16a34a 100%);
      color: white;
      border-radius: 26px;
      padding: 30px;
      margin-bottom: 22px;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.22);
    }}

    .hero .subtitle {{
      color: #dbeafe;
      margin-bottom: 0;
      max-width: 760px;
    }}

    .eyebrow {{
      margin: 0 0 10px;
      color: #bfdbfe;
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }}

    .section-title {{
      margin: 24px 0 12px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }}

    .grid {{
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
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

    .input-card {{
      min-height: 132px;
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

    .highlight-card {{
      border: 0;
      background:
        linear-gradient(white, white) padding-box,
        linear-gradient(135deg, var(--blue), var(--green)) border-box;
      border: 1px solid transparent;
    }}

    .impact-grid {{
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 12px;
    }}

    .impact-stat {{
      background: #f8fafc;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
    }}

    .impact-label {{
      margin: 0 0 8px;
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }}

    .impact-value {{
      font-size: 26px;
      font-weight: 850;
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

    #recommendationText {{
      color: var(--muted);
      line-height: 1.5;
    }}

    .note {{
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
      margin-top: 14px;
    }}

    .impact-note {{
      font-size: 16px;
    }}

    @media (max-width: 820px) {{
      .grid, .result, .impact-grid {{
        grid-template-columns: 1fr;
      }}

      h1 {{
        font-size: 32px;
      }}
    }}
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Energy decision support</p>
      <h1>Find a better hour to use electricity</h1>
    </section>

    <p class="section-title">1. Household and schedule inputs</p>
    <section class="grid">
      <div class="card input-card">
        <label for="annualConsumption">Annual electricity consumption</label>
        <input id="annualConsumption" type="number" min="1" step="1" value="3500" />
        <p class="note">kWh/year</p>
      </div>

      <div class="card input-card">
        <label for="selectedDate">Pick date</label>
        <select id="selectedDate"></select>
        <p class="note">Dates are shown in English.</p>
      </div>

      <div class="card input-card">
        <label for="selectedHour">Pick hour</label>
        <select id="selectedHour"></select>
        <p class="note">Hour-only selection, no minutes.</p>
      </div>

      <div class="card input-card">
        <label for="direction">Flexibility direction</label>
        <select id="direction">
          <option value="both" selected>Earlier & later (±)</option>
          <option value="earlier">Earlier only (-)</option>
          <option value="later">Later only (+)</option>
        </select>
        <p class="note">Reflects what the household can realistically change.</p>
      </div>

      <div class="card input-card">
        <label for="timeWindow">Search window</label>
        <select id="timeWindow">
          <option value="1">1 hour</option>
          <option value="2" selected>2 hours</option>
          <option value="4">4 hours</option>
          <option value="6">6 hours</option>
          <option value="8">8 hours</option>
          <option value="12">12 hours</option>
        </select>
        <p class="note">Bigger windows give more savings, but require more flexibility.</p>
      </div>

      <div class="card input-card">
        <label for="priority">Priority scale</label>
        <input id="priority" type="range" min="0" max="100" step="1" value="50" />
        <div class="scale-row">
          <span>💰 Cost Priority</span>
          <span>🌱 Carbon Priority</span>
        </div>
      </div>
    </section>

    <p class="section-title">2. Personalized recommendation</p>
    <section class="result">
      <div class="card highlight-card">
        <span class="pill" id="strategyLabel">Balanced recommendation</span>
        <h2>Recommended Time</h2>
        <div class="big" id="recommendedTime"></div>
        <p id="recommendationText"></p>
      </div>

      <div class="card highlight-card">
        <h2>Estimated Annual Impact</h2>
        <div class="impact-grid">
          <div class="impact-stat">
            <p class="impact-label">Cost change</p>
            <div class="impact-value" id="costChange"></div>
          </div>
          <div class="impact-stat">
            <p class="impact-label">CO₂ change</p>
            <div class="impact-value" id="carbonChange"></div>
          </div>
        </div>
        <p class="note impact-note">
          Estimated using forecast electricity prices and carbon intensity for the selected recommendation.
        </p>
      </div>
    </section>

    <p class="section-title">3. Forecast comparison</p>
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
            <td>Forecast wholesale price</td>
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
    const selectedDate = document.getElementById("selectedDate");
    const selectedHour = document.getElementById("selectedHour");
    const direction = document.getElementById("direction");
    const timeWindow = document.getElementById("timeWindow");
    const annualConsumption = document.getElementById("annualConsumption");
    const priority = document.getElementById("priority");
    const flexibleRatio = 0.50;
    const retailAdderEurPerKwh = 0.22;

    const defaultOption = forecast.findIndex((row) => row.timestamp.endsWith("18:00"));
    const defaultIndex = defaultOption >= 0 ? defaultOption : 0;
    const availableDates = [...new Set(forecast.map((row) => row.timestamp.slice(0, 10)))];

    availableDates.forEach((dateText) => {{
      const option = document.createElement("option");
      option.value = dateText;
      option.textContent = new Date(`${{dateText}}T12:00`).toLocaleDateString("en-US", {{
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }});
      selectedDate.appendChild(option);
    }});

    selectedDate.value = forecast[defaultIndex].timestamp.slice(0, 10);

    function populateHourOptions() {{
      const existingHour = selectedHour.value;
      selectedHour.innerHTML = "";
      forecast
        .filter((row) => row.timestamp.startsWith(selectedDate.value))
        .forEach((row) => {{
          const hourText = row.timestamp.slice(11, 13);
          const option = document.createElement("option");
          option.value = hourText;
          option.textContent = `${{hourText}}:00`;
          selectedHour.appendChild(option);
        }});

      const defaultHour = forecast[defaultIndex].timestamp.slice(11, 13);
      if ([...selectedHour.options].some((option) => option.value === existingHour)) {{
        selectedHour.value = existingHour;
      }} else if ([...selectedHour.options].some((option) => option.value === defaultHour)) {{
        selectedHour.value = defaultHour;
      }} else if (selectedHour.options.length > 0) {{
        selectedHour.selectedIndex = 0;
      }}
    }}

    populateHourOptions();

    function formatEuro(value) {{
      return new Intl.NumberFormat("en-US", {{
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }}).format(value);
    }}

    function normalize(value, min, max) {{
      if (max === min) return 0;
      return (value - min) / (max - min);
    }}

    function estimatedRetailPriceEurPerKwh(wholesalePriceEurPerMwh) {{
      return Math.max(0, wholesalePriceEurPerMwh / 1000 + retailAdderEurPerKwh);
    }}

    function timestampDate(timestamp) {{
      return timestamp.slice(0, 10);
    }}

    function timestampHour(timestamp) {{
      return timestamp.slice(11);
    }}

    function formatDateShort(dateText) {{
      return new Date(`${{dateText}}T12:00`).toLocaleDateString("en-US", {{
        weekday: "short",
        month: "short",
        day: "numeric",
      }});
    }}

    function formatTimeWithDate(timestamp) {{
      return `${{formatDateShort(timestampDate(timestamp))}}, ${{timestampHour(timestamp)}}`;
    }}

    function formatRecommendedTime(currentTimestamp, recommendedTimestamp) {{
      if (timestampDate(currentTimestamp) === timestampDate(recommendedTimestamp)) {{
        return timestampHour(recommendedTimestamp);
      }}
      return `${{timestampHour(recommendedTimestamp)}} · ${{formatDateShort(timestampDate(recommendedTimestamp))}}`;
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

    function selectedForecastIndex() {{
      const selectedTimestamp = `${{selectedDate.value}} ${{selectedHour.value}}:00`;
      const index = forecast.findIndex((row) => row.timestamp === selectedTimestamp);
      return index >= 0 ? index : 0;
    }}

    function candidateIndexes(selectedIndex, searchWindowHours, selectedDirection) {{
      const indexes = [];
      let startIndex = selectedIndex;
      let endIndex = selectedIndex;

      if (selectedDirection === "earlier") {{
        startIndex = Math.max(0, selectedIndex - searchWindowHours);
      }} else if (selectedDirection === "later") {{
        endIndex = Math.min(forecast.length - 1, selectedIndex + searchWindowHours);
      }} else {{
        startIndex = Math.max(0, selectedIndex - searchWindowHours);
        endIndex = Math.min(forecast.length - 1, selectedIndex + searchWindowHours);
      }}

      for (let index = startIndex; index <= endIndex; index += 1) {{
        indexes.push(index);
      }}
      return indexes;
    }}

    function directionLabel(selectedDirection) {{
      if (selectedDirection === "earlier") return "-";
      if (selectedDirection === "later") return "+";
      return "±";
    }}

    function updateDashboard() {{
      const selectedIndex = selectedForecastIndex();
      const current = forecast[selectedIndex];
      const totalAnnualEnergy = Number(annualConsumption.value);
      const flexibleAnnualEnergy = totalAnnualEnergy * flexibleRatio;
      const searchWindowHours = Number(timeWindow.value);
      const carbonPriority = Number(priority.value) / 100;
      const costPriority = 1 - carbonPriority;
      const selectedDirection = direction.value;
      const candidates = candidateIndexes(
        selectedIndex,
        searchWindowHours,
        selectedDirection
      ).map((index) => forecast[index]);

      const candidatesWithImpact = candidates.map((candidate) => {{
        const currentCost =
          flexibleAnnualEnergy * estimatedRetailPriceEurPerKwh(current.price);
        const candidateCost =
          flexibleAnnualEnergy * estimatedRetailPriceEurPerKwh(candidate.price);
        const costSaving = currentCost - candidateCost;
        const currentCarbonKg = flexibleAnnualEnergy * current.carbon / 1000;
        const candidateCarbonKg = flexibleAnnualEnergy * candidate.carbon / 1000;
        const carbonReductionKg = currentCarbonKg - candidateCarbonKg;
        return {{
          ...candidate,
          costSaving,
          carbonReductionKg,
        }};
      }});

      const candidatePrices = candidatesWithImpact.map((candidate) => candidate.price);
      const candidateCarbons = candidatesWithImpact.map((candidate) => candidate.carbon);
      const minPriceWindow = Math.min(...candidatePrices);
      const maxPriceWindow = Math.max(...candidatePrices);
      const minCarbonWindow = Math.min(...candidateCarbons);
      const maxCarbonWindow = Math.max(...candidateCarbons);

      let best = candidatesWithImpact[0];
      let bestUtility = -Infinity;
      candidatesWithImpact.forEach((candidate) => {{
        const priceNorm = normalize(candidate.price, minPriceWindow, maxPriceWindow);
        const carbonNorm = normalize(candidate.carbon, minCarbonWindow, maxCarbonWindow);
        const utility =
          costPriority * (1 - priceNorm)
          + carbonPriority * (1 - carbonNorm);
        if (utility > bestUtility) {{
          bestUtility = utility;
          best = candidate;
        }}
      }});

      const costSavings = best.costSaving;

      const carbonReductionTonnes = best.carbonReductionKg / 1000;

      let strategy = "Balanced recommendation";
      if (carbonPriority === 0) strategy = "Cost-only recommendation";
      if (carbonPriority === 1) strategy = "Carbon-only recommendation";

      document.getElementById("strategyLabel").textContent = strategy;
      document.getElementById("recommendedTime").textContent =
        formatRecommendedTime(current.timestamp, best.timestamp);
      document.getElementById("recommendationText").textContent =
        `Move flexible electricity use from ${{formatTimeWithDate(current.timestamp)}} ` +
        `to ${{formatTimeWithDate(best.timestamp)}}. ` +
        `Search rule: ${{directionLabel(selectedDirection)}}${{searchWindowHours}} hours. ` +
        `This recommendation best matches your cost and carbon preference.`;

      const costChange = document.getElementById("costChange");
      costChange.textContent = signedEuro(costSavings);
      costChange.className = cssClassForSavings(costSavings);

      const carbonChange = document.getElementById("carbonChange");
      carbonChange.textContent = signedCarbon(carbonReductionTonnes);
      carbonChange.className = cssClassForSavings(carbonReductionTonnes);

      document.getElementById("currentTimeCell").textContent = formatTimeWithDate(current.timestamp);
      document.getElementById("recommendedTimeCell").textContent = formatTimeWithDate(best.timestamp);
      document.getElementById("currentPriceCell").textContent = `${{current.price.toFixed(2)}} €/MWh`;
      document.getElementById("recommendedPriceCell").textContent = `${{best.price.toFixed(2)}} €/MWh`;
      document.getElementById("currentCarbonCell").textContent = `${{current.carbon.toFixed(2)}} kgCO₂/MWh`;
      document.getElementById("recommendedCarbonCell").textContent = `${{best.carbon.toFixed(2)}} kgCO₂/MWh`;
    }}

    selectedDate.addEventListener("change", () => {{
      populateHourOptions();
      updateDashboard();
    }});
    selectedHour.addEventListener("change", updateDashboard);
    direction.addEventListener("change", updateDashboard);
    timeWindow.addEventListener("change", updateDashboard);
    annualConsumption.addEventListener("input", updateDashboard);
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
