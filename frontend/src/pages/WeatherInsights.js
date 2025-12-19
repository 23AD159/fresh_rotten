import React, { useState, useEffect } from "react";
import { getCityList } from "../config/citiesConfig";

const PRICE_SERVICE_PORT = process.env.REACT_APP_PRICE_SERVICE_PORT || 5000;
const MARKET_SERVICE_ROOT = `http://localhost:${PRICE_SERVICE_PORT}`;
const WEATHER_SNAPSHOT_ENDPOINT = `${MARKET_SERVICE_ROOT}/weather_snapshot`;

const WeatherInsights = () => {
  const cityList = getCityList();
  const [location, setLocation] = useState(cityList[0] || "Coimbatore");
  const [availableLocations, setAvailableLocations] = useState(cityList);
  const [weatherMap, setWeatherMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeatherSnapshot = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(WEATHER_SNAPSHOT_ENDPOINT, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log("Weather snapshot response:", data);

        if (isMounted) {
          if (Array.isArray(data.available_locations)) {
            setAvailableLocations(data.available_locations);
            if (!location && data.available_locations.length > 0) {
              setLocation(data.available_locations[0]);
            }
          }

          const map = {};
          if (Array.isArray(data.locations)) {
            data.locations.forEach((entry) => {
              if (entry && entry.city && entry.weather) {
                map[entry.city] = entry.weather;
              }
            });
          }
          setWeatherMap(map);

          if (data.dataset_meta?.last_refreshed) {
            setLastUpdated(data.dataset_meta.last_refreshed);
          } else if (data.generated_at) {
            setLastUpdated(data.generated_at);
          }
        }
      } catch (err) {
        console.error("Error fetching weather snapshot:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch weather data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeatherSnapshot();
    const interval = setInterval(fetchWeatherSnapshot, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location]);

  const currentWeather =
    location && weatherMap[location] ? weatherMap[location] : null;

  const formatValue = (value) => {
    if (typeof value === "number") {
      return value.toFixed(1);
    }
    return value || "—";
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingTop: "40px",
      }}
    >
      {/* Header Section */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1
          style={{
            color: "#27a745",
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          🌤️ Weather Insights & Farming Tips
        </h1>
        <p style={{ color: "#6c757d", fontSize: "1rem" }}>
          Real-time weather surveillance for Coimbatore and surrounding agri
          markets.
        </p>
      </div>

      <div className="container">
        {/* Location Selector Card */}
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            marginBottom: "30px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Select Location:
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                }}
              >
                {availableLocations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  color: "#6c757d",
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                Last updated:{" "}
                {lastUpdated ? new Date(lastUpdated).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div
            style={{
              backgroundColor: "#e7f3ff",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              color: "#004085",
              marginBottom: "30px",
            }}
          >
            Loading weather data...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
              color: "#721c24",
              marginBottom: "30px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Current Weather Card with Grid */}
        {!isLoading && !error && currentWeather && (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              marginBottom: "30px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                color: "#27a745",
                marginBottom: "30px",
                fontSize: "1.5rem",
              }}
            >
              Current Weather - {location}
            </h3>

            {/* Weather Grid 2x2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              {/* Temperature */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌡️</div>
                <p
                  style={{
                    color: "#6c757d",
                    margin: "5px 0",
                    fontSize: "0.9rem",
                  }}
                >
                  Temperature
                </p>
                <div
                  style={{
                    borderBottom: "3px solid #27a745",
                    paddingBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  <h5
                    style={{
                      color: "#333",
                      margin: "5px 0",
                      fontSize: "1.3rem",
                    }}
                  >
                    {formatValue(currentWeather.temperature_c)}°C
                  </h5>
                </div>
              </div>

              {/* Humidity */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💧</div>
                <p
                  style={{
                    color: "#6c757d",
                    margin: "5px 0",
                    fontSize: "0.9rem",
                  }}
                >
                  Humidity
                </p>
                <div
                  style={{
                    borderBottom: "3px solid #17a2b8",
                    paddingBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  <h5
                    style={{
                      color: "#333",
                      margin: "5px 0",
                      fontSize: "1.3rem",
                    }}
                  >
                    {formatValue(currentWeather.humidity_pct)}%
                  </h5>
                </div>
              </div>

              {/* Wind Speed */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💨</div>
                <p
                  style={{
                    color: "#6c757d",
                    margin: "5px 0",
                    fontSize: "0.9rem",
                  }}
                >
                  Wind Speed
                </p>
                <div
                  style={{
                    borderBottom: "3px solid #ffc107",
                    paddingBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  <h5
                    style={{
                      color: "#333",
                      margin: "5px 0",
                      fontSize: "1.3rem",
                    }}
                  >
                    {formatValue(currentWeather.wind_speed_kph)} kph
                  </h5>
                </div>
              </div>

              {/* Rain Probability */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🌧️</div>
                <p
                  style={{
                    color: "#6c757d",
                    margin: "5px 0",
                    fontSize: "0.9rem",
                  }}
                >
                  Rain Probability
                </p>
                <div
                  style={{
                    borderBottom: "3px solid #dc3545",
                    paddingBottom: "10px",
                    marginTop: "10px",
                  }}
                >
                  <h5
                    style={{
                      color: "#333",
                      margin: "5px 0",
                      fontSize: "1.3rem",
                    }}
                  >
                    {formatValue(currentWeather.rain_chance_pct)}%
                  </h5>
                </div>
              </div>
            </div>

            {/* Weather Quality Index */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
                textAlign: "center",
                borderLeft: "4px solid #27a745",
              }}
            >
              <strong>Weather Quality Index: </strong>
              <span
                style={{
                  backgroundColor: "#27a745",
                  color: "white",
                  padding: "5px 12px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  marginLeft: "10px",
                }}
              >
                {formatValue(currentWeather.weather_quality_index)}/100
              </span>
            </div>
          </div>
        )}

        {/* Farming Tips Section */}
        {!isLoading && !error && currentWeather && (
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                color: "#27a745",
                marginBottom: "30px",
                fontSize: "1.5rem",
              }}
            >
              📊 Weather Impact Analysis
            </h3>

            {/* 3 Column Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Crop Growth */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                <h6
                  style={{
                    color: "#27a745",
                    marginBottom: "15px",
                    fontSize: "1.1rem",
                  }}
                >
                  🌱 Crop Growth
                </h6>
                <ul
                  style={{
                    paddingLeft: "20px",
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#555",
                    lineHeight: "1.8",
                  }}
                >
                  <li>Optimal temperature range: 20-30°C</li>
                  <li>Ideal humidity: 60-70%</li>
                  <li>Wind protection needed above 15 km/h</li>
                </ul>
              </div>

              {/* Irrigation */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                <h6
                  style={{
                    color: "#17a2b8",
                    marginBottom: "15px",
                    fontSize: "1.1rem",
                  }}
                >
                  💧 Irrigation
                </h6>
                <ul
                  style={{
                    paddingLeft: "20px",
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#555",
                    lineHeight: "1.8",
                  }}
                >
                  <li>Reduce irrigation during rain</li>
                  <li>Increase frequency in high heat</li>
                  <li>Water early mornings for best uptake</li>
                </ul>
              </div>

              {/* Precautions */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                <h6
                  style={{
                    color: "#ffc107",
                    marginBottom: "15px",
                    fontSize: "1.1rem",
                  }}
                >
                  ⚠️ Precautions
                </h6>
                <ul
                  style={{
                    paddingLeft: "20px",
                    margin: 0,
                    fontSize: "0.95rem",
                    color: "#555",
                    lineHeight: "1.8",
                  }}
                >
                  <li>Secure greenhouse covers in high winds</li>
                  <li>Watch for pest spikes after rain</li>
                  <li>Adjust harvest windows on humid days</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherInsights;

