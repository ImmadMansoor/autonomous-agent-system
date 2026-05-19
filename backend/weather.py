import json
import os
import time
import urllib.parse
import urllib.request

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
DEFAULT_LATITUDE = float(os.environ.get("RESTAURANT_LATITUDE", "33.6844"))
DEFAULT_LONGITUDE = float(os.environ.get("RESTAURANT_LONGITUDE", "73.0479"))
DEFAULT_LOCATION = os.environ.get("RESTAURANT_LOCATION", "Islamabad cafe area")
WEATHER_TIMEOUT_SECONDS = float(os.environ.get("WEATHER_TIMEOUT_SECONDS", "4"))

_cache = {"key": None, "expires_at": 0, "value": None}


def weather_label(code):
    labels = {
        0: "clear",
        1: "mainly clear",
        2: "partly cloudy",
        3: "overcast",
        45: "fog",
        48: "depositing rime fog",
        51: "light drizzle",
        53: "moderate drizzle",
        55: "dense drizzle",
        61: "slight rain",
        63: "moderate rain",
        65: "heavy rain",
        71: "slight snow",
        73: "moderate snow",
        75: "heavy snow",
        80: "rain showers",
        81: "moderate rain showers",
        82: "violent rain showers",
        95: "thunderstorm",
    }
    return labels.get(int(code or 0), "unknown")


def risk_flags(current, daily):
    temp = current.get("temperature_2m")
    apparent = current.get("apparent_temperature")
    wind = current.get("wind_speed_10m")
    precipitation = current.get("precipitation") or 0
    rain_probability = (daily.get("precipitation_probability_max") or [0])[0] if daily else 0
    risks = []
    heat_value = max(value for value in [temp, apparent] if value is not None) if temp is not None or apparent is not None else None

    if heat_value is not None and heat_value >= 40:
        risks.append("extreme_heat")
    elif heat_value is not None and heat_value >= 35:
        risks.append("heat")
    if precipitation > 0 or rain_probability >= 50:
        risks.append("rain")
    if wind is not None and wind >= 30:
        risks.append("wind")
    return risks


def fetch_weather_context(latitude=None, longitude=None, location_name=None):
    latitude = float(latitude or DEFAULT_LATITUDE)
    longitude = float(longitude or DEFAULT_LONGITUDE)
    location_name = location_name or DEFAULT_LOCATION
    cache_key = f"{latitude:.4f}:{longitude:.4f}"
    now = time.time()

    if _cache["key"] == cache_key and _cache["expires_at"] > now:
        return _cache["value"]

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,precipitation_probability_max",
        "forecast_days": 1,
        "timezone": "auto",
    }
    url = f"{OPEN_METEO_URL}?{urllib.parse.urlencode(params)}"

    try:
        with urllib.request.urlopen(url, timeout=WEATHER_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        return {
            "available": False,
            "source": "open-meteo",
            "location": location_name,
            "summary": f"Live weather unavailable ({type(exc).__name__}).",
            "risks": [],
        }

    current = payload.get("current") or {}
    daily = payload.get("daily") or {}
    risks = risk_flags(current, daily)
    temp = current.get("temperature_2m")
    apparent = current.get("apparent_temperature")
    humidity = current.get("relative_humidity_2m")
    wind = current.get("wind_speed_10m")
    condition = weather_label(current.get("weather_code"))
    max_temp = (daily.get("temperature_2m_max") or [None])[0]
    rain_probability = (daily.get("precipitation_probability_max") or [None])[0]

    summary_parts = [
        f"{location_name}: {condition}",
        f"current {temp}C" if temp is not None else None,
        f"feels {apparent}C" if apparent is not None else None,
        f"humidity {humidity}%" if humidity is not None else None,
        f"wind {wind} km/h" if wind is not None else None,
        f"today max {max_temp}C" if max_temp is not None else None,
        f"rain chance {rain_probability}%" if rain_probability is not None else None,
    ]
    value = {
        "available": True,
        "source": "open-meteo",
        "location": location_name,
        "latitude": latitude,
        "longitude": longitude,
        "summary": "; ".join(filter(None, summary_parts)),
        "risks": risks,
        "current": current,
        "daily": daily,
    }
    _cache.update({"key": cache_key, "expires_at": now + 600, "value": value})
    return value
