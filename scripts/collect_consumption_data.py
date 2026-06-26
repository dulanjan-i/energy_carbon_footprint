import os
import requests
import pandas as pd
from datetime import datetime, timedelta

# Configuration
# Stripped the '100' frontend prefix to use the raw backend filter IDs
MODULES = [410]
REGION = "DE"
RESOLUTION = "hour"
OUTPUT_PATH = "data/raw/total_consumption_2y.csv"

INDEX_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/index_{resolution}.json"
DATA_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/{module_id}_{region}_{resolution}_{timestamp}.json"

# Calculate timestamps (2 years back from today)
end_date = datetime.utcnow()
start_date = end_date - timedelta(days=2*365)

# Convert to milliseconds for SMARD API
start_ts = int(start_date.timestamp() * 1000)
end_ts = int(end_date.timestamp() * 1000)

print(f"🚀 Initializing SMARD pull from {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}...")

def fetch_module(module_id):
    print(f"  ↳ Fetching module {module_id}...")
    try:
        # Get index list of chunks
        idx_res = requests.get(INDEX_URL.format(module_id=module_id, region=REGION, resolution=RESOLUTION))
        idx_res.raise_for_status()
        timestamps = idx_res.json()["timestamps"]
        
        # Filter chunks overlapping our window
        valid_ts = []
        for i, ts in enumerate(timestamps):
            if ts <= end_ts:
                if i + 1 < len(timestamps) and timestamps[i + 1] <= start_ts:
                    continue
                valid_ts.append(ts)
        
        # Fetch and combine the actual JSON blocks
        all_data = []
        for ts in valid_ts:
            chunk_url = DATA_URL.format(module_id=module_id, region=REGION, resolution=RESOLUTION, timestamp=ts)
            data_res = requests.get(chunk_url)
            if data_res.status_code == 200:
                all_data.extend(data_res.json().get("series", []))
        
        if not all_data:
            return pd.DataFrame()
            
        df = pd.DataFrame(all_data, columns=["timestamp", f"mod_{module_id}"])
        df = df[(df["timestamp"] >= start_ts) & (df["timestamp"] <= end_ts)]
        df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
        return df.set_index("timestamp")
        
    except Exception as e:
        print(f"  ❌ Error loading module {module_id}: {e}")
        return pd.DataFrame()

# Loop through and stitch every electricity generation module 
combined_df = None
for mod in MODULES:
    df = fetch_module(mod)
    if df.empty:
        continue
    if combined_df is None:
        combined_df = df
    else:
        combined_df = combined_df.join(df, how="outer")

if combined_df is not None and not combined_df.empty:
    # Ensure folder structure exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    
    # Sort and save cleanly
    combined_df.sort_index(inplace=True)
    combined_df.to_csv(OUTPUT_PATH)
    print(f"\n✅ Success! Saved {len(combined_df)} rows of multi-variable hourly data to: {OUTPUT_PATH}")
else:
    print("\n❌ Data aggregation failed or turned up empty.")