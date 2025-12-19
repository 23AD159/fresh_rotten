from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
import numpy as np
import os
import threading
from datetime import datetime, timezone
from itertools import cycle

# optional sklearn
try:
    from sklearn.ensemble import RandomForestRegressor
    from sklearn.preprocessing import StandardScaler
    SKLEARN_AVAILABLE = True
except Exception:
    SKLEARN_AVAILABLE = False

# optional pymongo
try:
    from pymongo import MongoClient
    PYMONGO_AVAILABLE = True
except Exception:
    PYMONGO_AVAILABLE = False

APP_PORT = int(os.environ.get("PRICE_SERVICE_PORT", "5002"))

# Remove the app creation here - will be passed from main app
# app = Flask(__name__)

# CORS configuration moved to main app

BASE_DIR = os.path.dirname(__file__)

# Ensure generated folder exists
GENERATED_DIR = os.path.join(BASE_DIR, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)
GENERATED_CSV_PATH = os.path.join(GENERATED_DIR, "market_dataset.csv")

# MongoDB setup
MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/")
WEATHER_COLLECTION = None

if PYMONGO_AVAILABLE:
    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.server_info()
        mongo_db = mongo_client.get_database("farmfresh")
        WEATHER_COLLECTION = mongo_db.get_collection("weather_snapshots")
        print("✅ Connected to MongoDB for weather snapshots")
    except Exception as e:
        WEATHER_COLLECTION = None
        print("⚠️ MongoDB not available for weather persistence:", e)
else:
    print("⚠️ pymongo not installed - MongoDB persistence disabled")

CITIES_CONFIG = {
    "Coimbatore": (11.0168, 76.9558),
    "Pollachi": (10.6686, 77.0064),
    "Tiruppur": (11.1085, 77.3411),
    "Erode": (11.3410, 77.7172),
    "Salem": (11.6643, 78.1460),
    "Madurai": (9.9252, 78.1198),
    "Karur": (10.9603, 78.0766),
    "Dindigul": (10.3676, 77.9800),
    "Nilgiris": (11.4000, 76.7000),
    "Udumalpet": (10.9450, 77.2800)
}

WEATHER_CACHE = {}
LAST_DATASET_REFRESH = None
DATASET_LOCK = threading.Lock()
MODEL = None
SCALER = None
MODEL_FEATURES = ["temperature_c", "rain_chance_pct", "humidity_pct", "wind_speed_kph", "demand_index", "supply_index"]


def get_available_cities():
    """Return the canonical ordered list of supported cities"""
    return list(CITIES_CONFIG.keys())


def get_weather_for_city(city):
    """Return weather for a single city from cache or live fetch"""
    if city not in CITIES_CONFIG:
        return None
    cached = WEATHER_CACHE.get(city)
    if cached:
        return cached
    lat, lon = CITIES_CONFIG[city]
    fresh = fetch_weather(lat, lon)
    if fresh:
        WEATHER_CACHE[city] = fresh
    return WEATHER_CACHE.get(city)


def get_dataset_status():
    """Summarize dataset refresh timing for the UI"""
    return {
        "available_locations": get_available_cities(),
        "last_refreshed": LAST_DATASET_REFRESH.isoformat() if LAST_DATASET_REFRESH else None,
        "generated_csv": os.path.basename(GENERATED_CSV_PATH),
        "model_ready": MODEL is not None
    }


def get_utc_now():
    """Get current UTC time using timezone-aware datetime (fixes deprecation warning)"""
    return datetime.now(timezone.utc)


def weather_quality_index(temp, rain_chance, humidity, wind_speed):
    """Calculate weather quality index (0-100)"""
    score = 100.0
    if temp is not None:
        if temp < 10 or temp > 35:
            score -= 20
        elif temp < 15 or temp > 30:
            score -= 10
    if rain_chance is not None:
        score -= (rain_chance / 100.0) * 15
    if humidity is not None:
        if 40 <= humidity <= 70:
            score += 10
        elif humidity > 80 or humidity < 30:
            score -= 10
    if wind_speed is not None:
        if wind_speed > 20:
            score -= 15
        elif wind_speed > 10:
            score -= 5
    return max(0, min(100, score))


def fetch_weather(lat, lon):
    """Fetch weather from Open-Meteo API"""
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}&current_weather=true"
        f"&hourly=relative_humidity_2m,precipitation_probability,wind_speed_10m"
        f"&timezone=UTC"
    )
    try:
        r = requests.get(url, timeout=6)
        r.raise_for_status()
        data = r.json()
        current = data.get("current_weather", {}) or {}
        hourly = data.get("hourly", {}) or {}
        temp = current.get("temperature")
        wind = current.get("wind_speed", 0)
        rain = 0
        humidity = 50
        if hourly:
            pp = hourly.get("precipitation_probability", [])
            hum = hourly.get("relative_humidity_2m", [])
            winds = hourly.get("wind_speed_10m", [])
            if isinstance(pp, list) and pp:
                rain = float(pp[0])
            if isinstance(hum, list) and hum:
                humidity = float(hum[0])
            if isinstance(winds, list) and winds:
                wind = float(winds[0])
        quality = weather_quality_index(temp, rain, humidity, wind)
        return {
            "temperature_c": float(temp) if temp is not None else None,
            "rain_chance_pct": float(rain),
            "humidity_pct": float(humidity),
            "wind_speed_kph": float(wind),
            "weather_quality_index": float(quality),
            "timestamp": get_utc_now().isoformat()
        }
    except Exception as e:
        print("Weather fetch error:", e)
        return None


def generate_daily_dataset():
    """Generate daily dataset snapshot and save to CSV + MongoDB"""
    rows = []
    for city, (lat, lon) in CITIES_CONFIG.items():
        w = fetch_weather(lat, lon)
        if not w:
            continue
        WEATHER_CACHE[city] = w
        for crop in ["Tomato", "Carrot", "Potato", "Onion", "Capsicum"]:
            base_price = np.random.uniform(20, 60)
            demand_index = np.random.uniform(0.5, 1.5)
            supply_index = np.random.uniform(0.5, 1.5)
            rows.append({
                "date": get_utc_now().date().isoformat(),
                "city": city,
                "crop": crop,
                **w,
                "base_price": base_price,
                "demand_index": demand_index,
                "supply_index": supply_index,
                "estimated_price": base_price * (w["weather_quality_index"] / 100.0)
            })
    df = pd.DataFrame(rows)

    # Save CSV
    try:
        df.to_csv(GENERATED_CSV_PATH, index=False)
        print(f"✅ Dataset saved to {GENERATED_CSV_PATH}")
    except Exception as e:
        print("Failed to write generated CSV:", e)

    # Persist to MongoDB
    if WEATHER_COLLECTION is not None:
        try:
            if not df.empty:
                doc = {
                    "date": get_utc_now().date().isoformat(),
                    "generated_at": get_utc_now().isoformat(),
                    "cities": []
                }
                for city in sorted(WEATHER_CACHE.keys()):
                    entry = WEATHER_CACHE[city].copy()
                    entry["city"] = city
                    doc["cities"].append(entry)
                WEATHER_COLLECTION.update_one(
                    {"date": doc["date"]},
                    {"$set": doc},
                    upsert=True
                )
                print(f"✅ Snapshot persisted to MongoDB for date {doc['date']}")
        except Exception as e:
            print("Failed to persist snapshot to MongoDB:", e)

    return df


def get_weather_snapshot():
    """Return snapshot of all cities' weather + dataset metadata"""
    refresh_dataset_if_needed()
    locations = []
    for city in sorted(CITIES_CONFIG.keys()):
        w = WEATHER_CACHE.get(city)
        if not w:
            lat, lon = CITIES_CONFIG[city]
            w = fetch_weather(lat, lon)
            if w:
                WEATHER_CACHE[city] = w
        locations.append({"city": city, "weather": WEATHER_CACHE.get(city)})
    
    dataset_meta = {
        "last_refreshed": LAST_DATASET_REFRESH.isoformat() if LAST_DATASET_REFRESH else None,
        "generated_csv": os.path.basename(GENERATED_CSV_PATH),
        "model_available": MODEL is not None
    }
    
    return {
        "locations": locations,
        "available_locations": list(CITIES_CONFIG.keys()),
        "generated_at": get_utc_now().isoformat(),
        "dataset_meta": dataset_meta,
        "base_market": "Coimbatore"
    }


def train_model_from_df(df):
    """Train ML model from dataset"""
    global MODEL, SCALER
    if not SKLEARN_AVAILABLE or df is None or df.empty:
        MODEL = None
        return
    try:
        cols = [c for c in MODEL_FEATURES if c in df.columns]
        if len(cols) < 3:
            MODEL = None
            return
        target = "estimated_price" if "estimated_price" in df.columns else "base_price"
        dfc = df.dropna(subset=cols + [target])
        if len(dfc) < 10:
            MODEL = None
            return
        X = dfc[cols].astype(float)
        y = dfc[target].astype(float)
        SCALER = StandardScaler()
        Xs = SCALER.fit_transform(X)
        MODEL = RandomForestRegressor(n_estimators=50, random_state=42)
        MODEL.fit(Xs, y)
        print("✅ Trained price model on", len(dfc), "rows")
    except Exception as e:
        print("Model training failed:", e)
        MODEL = None


def refresh_dataset_if_needed(force=False):
    """Refresh dataset if 24 hours have passed or force=True"""
    global LAST_DATASET_REFRESH
    with DATASET_LOCK:
        now = get_utc_now()
        if force or LAST_DATASET_REFRESH is None or (now - LAST_DATASET_REFRESH).total_seconds() > 24*3600:
            df = generate_daily_dataset()
            train_model_from_df(df)
            LAST_DATASET_REFRESH = now
            return True
    return False


def predict_price(crop, city, buyer_qty=1.0, seller_qty=5.0):
    """Predict price based on weather and demand/supply"""
    refresh_dataset_if_needed()
    if city not in WEATHER_CACHE and city in CITIES_CONFIG:
        lat, lon = CITIES_CONFIG[city]
        w = fetch_weather(lat, lon)
        if w:
            WEATHER_CACHE[city] = w
    weather = WEATHER_CACHE.get(city, {})
    features = []
    for f in MODEL_FEATURES:
        if f == "demand_index":
            features.append(min(2.0, buyer_qty / 10.0))
        elif f == "supply_index":
            features.append(min(2.0, seller_qty / 20.0))
        else:
            features.append(weather.get(f, 0.0))
    base = 40.0
    if MODEL is not None and SCALER is not None:
        try:
            arr = np.array(features).reshape(1, -1)
            arrs = SCALER.transform(arr)
            base = float(MODEL.predict(arrs)[0])
        except Exception as e:
            print("Prediction error:", e)
    quality = weather.get("weather_quality_index", 50.0)
    multiplier = quality / 50.0
    predicted = round(base * multiplier, 2)
    return {
        "crop": crop,
        "city": city,
        "base_price": round(base, 2),
        "predicted_price": predicted,
        "multiplier": round(multiplier, 3),
        "weather_quality_index": quality,
        "weather": weather,
        "buyer_qty": buyer_qty,
        "seller_qty": seller_qty,
        "timestamp": get_utc_now().isoformat()
    }


# API Endpoints - moved to register_price_service_routes function


def _midnight_scheduler():
    """Background thread: refresh dataset at midnight daily"""
    print("🕐 Starting midnight scheduler for daily dataset refresh")
    while True:
        now = datetime.now()
        next_midnight = (now + pd.Timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
        wait_sec = (next_midnight - now).total_seconds()
        try:
            threading.Event().wait(wait_sec)
        except Exception:
            pass
        try:
            print(f"🔄 Midnight refresh triggered at {get_utc_now().isoformat()}")
            refresh_dataset_if_needed(force=True)
        except Exception as e:
            print("❌ Error during scheduled refresh:", e)


def start_scheduler_thread():
    """Start background scheduler thread"""
    t = threading.Thread(target=_midnight_scheduler, daemon=True, name="price_daily_scheduler")
    t.start()


def register_price_service_routes(app_to_register):
    """Register all price service routes with the main Flask app"""
    # API Endpoints
    @app_to_register.route("/price_service", methods=["GET"])
    def root():
        return jsonify({"service": "price_service", "status": "running", "port": APP_PORT}), 200

    @app_to_register.route("/cities", methods=["GET"])
    def route_cities():
        return jsonify(get_available_cities()), 200

    @app_to_register.route("/weather/<city>", methods=["GET"])
    def route_weather_city(city):
        try:
            weather = get_weather_for_city(city)
            if weather:
                return jsonify(weather), 200
            return jsonify({"error": f"Weather data not available for {city}"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app_to_register.route("/predict_price", methods=["GET", "POST"])
    def route_predict_price():
        try:
            if request.method == "POST":
                data = request.json
            else:
                data = request.args

            crop = data.get("crop")
            city = data.get("city", "Coimbatore")
            buyer = float(data.get("buyer_qty", 1.0))
            seller = float(data.get("seller_qty", 5.0))

            if not crop:
                return jsonify({"error": "crop parameter required"}), 400

            return jsonify(predict_price(crop, city, buyer, seller)), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app_to_register.route("/weather_snapshot", methods=["GET"])
    def route_weather_snapshot():
        try:
            snapshot = get_weather_snapshot()
            return jsonify(snapshot), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app_to_register.route("/dataset_status", methods=["GET"])
    def route_dataset_status():
        try:
            status = get_dataset_status()
            return jsonify(status), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500


# Removed standalone execution - now integrated into main app