import requests
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
import uvicorn

app = FastAPI(title="SMARD Market Data Pipeline")

# SMARD backend endpoints
INDEX_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/index_{resolution}.json"
DATA_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/{module_id}_{region}_{resolution}_{timestamp}.json"

def fetch_module_data(module_id: str, start_ts: int, end_ts: int, region: str = "DE", resolution: str = "hour") -> pd.DataFrame:
    """Fetches and stitches time-series chunks for a specific energy module."""
    # 1. Fetch available timestamps (each represents the start of a data chunk)
    index_res = requests.get(INDEX_URL.format(module_id=module_id, region=region, resolution=resolution))
    index_res.raise_for_status()
    timestamps = index_res.json()["timestamps"]
    
    # 2. Identify the chunks that overlap with the requested time window
    valid_ts = []
    for i, ts in enumerate(timestamps):
        if ts <= end_ts:
            # Skip chunks that end entirely before our start_ts
            if i + 1 < len(timestamps) and timestamps[i + 1] <= start_ts:
                continue
            valid_ts.append(ts)
            
    # 3. Fetch the required JSON chunks
    all_data = []
    for ts in valid_ts:
        chunk_url = DATA_URL.format(module_id=module_id, region=region, resolution=resolution, timestamp=ts)
        data_res = requests.get(chunk_url)
        if data_res.status_code == 200:
            series = data_res.json().get("series", [])
            all_data.extend(series)
            
    # 4. Convert to DataFrame and trim to exact requested bounds
    if not all_data:
        return pd.DataFrame()
        
    df = pd.DataFrame(all_data, columns=["timestamp", f"module_{module_id}"])
    df = df[(df["timestamp"] >= start_ts) & (df["timestamp"] <= end_ts)]
    
    # Convert timestamps to a proper datetime index
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    return df.set_index("timestamp")

@app.get("/market-data")
def get_smard_data(
    start: int = Query(..., description="Start timestamp in milliseconds"),
    end: int = Query(..., description="End timestamp in milliseconds"),
    modules: str = Query(..., description="Comma-separated module IDs (e.g., 1004066,1001226)"),
    region: str = "DE",
    resolution: str = "hour"
):
    module_ids = [m.strip() for m in modules.split(",")]
    combined_df = None
    
    try:
        # Fetch and join data for all requested modules (e.g., wind, solar, biomass)
        for mod_id in module_ids:
            df = fetch_module_data(mod_id, start, end, region, resolution)
            if df.empty:
                continue
                
            if combined_df is None:
                combined_df = df
            else:
                # Outer join ensures timestamps align perfectly even if one module drops a frame
                combined_df = combined_df.join(df, how="outer")
        
        if combined_df is None or combined_df.empty:
            return {"data": {}}
            
        # Return cleanly formatted JSON where keys are ISO datetime strings
        combined_df.index = combined_df.index.strftime("%Y-%m-%dT%H:%M:%S")
        
        # Replace NaNs with None for valid JSON serialization
        combined_df = combined_df.where(pd.notnull(combined_df), None)
        return {"data": combined_df.to_dict(orient="index")}
        
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"SMARD API network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=8000)import requests
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
import uvicorn

app = FastAPI(title="SMARD Market Data Pipeline")

# SMARD backend endpoints
INDEX_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/index_{resolution}.json"
DATA_URL = "https://www.smard.de/app/chart_data/{module_id}/{region}/{module_id}_{region}_{resolution}_{timestamp}.json"

def fetch_module_data(module_id: str, start_ts: int, end_ts: int, region: str = "DE", resolution: str = "hour") -> pd.DataFrame:
    """Fetches and stitches time-series chunks for a specific energy module."""
    # 1. Fetch available timestamps (each represents the start of a data chunk)
    index_res = requests.get(INDEX_URL.format(module_id=module_id, region=region, resolution=resolution))
    index_res.raise_for_status()
    timestamps = index_res.json()["timestamps"]
    
    # 2. Identify the chunks that overlap with the requested time window
    valid_ts = []
    for i, ts in enumerate(timestamps):
        if ts <= end_ts:
            # Skip chunks that end entirely before our start_ts
            if i + 1 < len(timestamps) and timestamps[i + 1] <= start_ts:
                continue
            valid_ts.append(ts)
            
    # 3. Fetch the required JSON chunks
    all_data = []
    for ts in valid_ts:
        chunk_url = DATA_URL.format(module_id=module_id, region=region, resolution=resolution, timestamp=ts)
        data_res = requests.get(chunk_url)
        if data_res.status_code == 200:
            series = data_res.json().get("series", [])
            all_data.extend(series)
            
    # 4. Convert to DataFrame and trim to exact requested bounds
    if not all_data:
        return pd.DataFrame()
        
    df = pd.DataFrame(all_data, columns=["timestamp", f"module_{module_id}"])
    df = df[(df["timestamp"] >= start_ts) & (df["timestamp"] <= end_ts)]
    
    # Convert timestamps to a proper datetime index
    df["timestamp"] = pd.to_datetime(df["timestamp"], unit="ms")
    return df.set_index("timestamp")

@app.get("/market-data")
def get_smard_data(
    start: int = Query(..., description="Start timestamp in milliseconds"),
    end: int = Query(..., description="End timestamp in milliseconds"),
    modules: str = Query(..., description="Comma-separated module IDs (e.g., 1004066,1001226)"),
    region: str = "DE",
    resolution: str = "hour"
):
    module_ids = [m.strip() for m in modules.split(",")]
    combined_df = None
    
    try:
        # Fetch and join data for all requested modules (e.g., wind, solar, biomass)
        for mod_id in module_ids:
            df = fetch_module_data(mod_id, start, end, region, resolution)
            if df.empty:
                continue
                
            if combined_df is None:
                combined_df = df
            else:
                # Outer join ensures timestamps align perfectly even if one module drops a frame
                combined_df = combined_df.join(df, how="outer")
        
        if combined_df is None or combined_df.empty:
            return {"data": {}}
            
        # Return cleanly formatted JSON where keys are ISO datetime strings
        combined_df.index = combined_df.index.strftime("%Y-%m-%dT%H:%M:%S")
        
        # Replace NaNs with None for valid JSON serialization
        combined_df = combined_df.where(pd.notnull(combined_df), None)
        return {"data": combined_df.to_dict(orient="index")}
        
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"SMARD API network error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Start the server
    uvicorn.run(app, host="0.0.0.0", port=8000)