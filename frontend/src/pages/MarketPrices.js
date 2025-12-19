import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "./MarketPrices.css";
import { getCityList } from "../config/citiesConfig";

const PRICE_SERVICE_PORT = process.env.REACT_APP_PRICE_SERVICE_PORT || 5000;
const MARKET_SERVICE_ROOT = `http://localhost:${PRICE_SERVICE_PORT}`;
const PREDICT_PRICE_ENDPOINT = `${MARKET_SERVICE_ROOT}/predict_price`;
const WEATHER_SNAPSHOT_ENDPOINT = `${MARKET_SERVICE_ROOT}/weather_snapshot`;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes for weather-based updates
const CITY_LIST = getCityList();

const TrendBadge = ({ trend, delta }) => {
  if (!trend) return null;
  const arrow = trend === "rising" ? "📈" : trend === "falling" ? "📉" : "⏸️";
  return (
    <span className={`trend-badge trend-badge--${trend}`}>
      {arrow} {trend.charAt(0).toUpperCase() + trend.slice(1)}
      {typeof delta === "number" ? ` (${delta > 0 ? "+" : ""}${delta.toFixed(2)})` : ""}
    </span>
  );
};

const MarketPrices = () => {
  const [location, setLocation] = useState(CITY_LIST[0]);
  const [availableLocations, setAvailableLocations] = useState(CITY_LIST);
  const [buyerQty, setBuyerQty] = useState(1);
  const [sellerQty, setSellerQty] = useState(7);
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [datasetMeta, setDatasetMeta] = useState(null);
  const [weatherSnapshot, setWeatherSnapshot] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [snapshotError, setSnapshotError] = useState(null);

  const fetchMarketSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch prices for all crops in the selected location
      const crops = ["Tomato", "Carrot", "Potato", "Onion", "Capsicum"];
      const pricePromises = crops.map(crop =>
        axios.post(PREDICT_PRICE_ENDPOINT, {
          crop,
          city: location,
          buyer_qty: buyerQty,
          seller_qty: sellerQty
        }, { timeout: 10000 })
      );

      const responses = await Promise.all(pricePromises);
      const cityWeather = weatherSnapshot[location] || responses[0]?.data?.weather || null;
      const cropsData = responses.map((res, index) => {
        const diff = res.data.predicted_price - res.data.base_price;
        return {
          crop: crops[index],
          category: "Vegetables",
          price: res.data.predicted_price,
          predicted_price: res.data.predicted_price,
          base_price: res.data.base_price,
          trend: res.data.multiplier > 1 ? "rising" : res.data.multiplier < 1 ? "falling" : "stable",
          delta: diff,
          trend_delta: diff,
          weather_quality_index: res.data.weather_quality_index,
          multiplier: res.data.multiplier,
          weather: cityWeather,
          market: location,
          buyer_total: res.data.predicted_price * buyerQty,
          seller_total: res.data.predicted_price * sellerQty
        };
      });

      // Calculate summary stats
      const summary = {
        crops_tracked: cropsData.length,
        prices_rising: cropsData.filter(c => c.trend === "rising").length,
        prices_falling: cropsData.filter(c => c.trend === "falling").length,
        prices_stable: cropsData.filter(c => c.trend === "stable").length
      };

      setMarketData({
        crops: cropsData,
        summary,
        last_updated: new Date().toISOString(),
        weather_snapshot: weatherSnapshot
      });

      setDatasetMeta(responses[0]?.data?.dataset_meta || null);
      setError("");
    } catch (err) {
      console.error("Market price fetch failed:", err);
      setError("Unable to refresh live prices right now. Please try again in a minute.");
    } finally {
      setIsLoading(false);
    }
  }, [location, buyerQty, sellerQty, weatherSnapshot]);

  useEffect(() => {
    fetchMarketSnapshot();
    const interval = setInterval(fetchMarketSnapshot, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMarketSnapshot]);

  const categories = useMemo(() => {
    const base = ["All Categories"];
    if (!marketData?.crops) return base;
    const unique = Array.from(new Set(marketData.crops.map((item) => item.category)));
    return base.concat(unique);
  }, [marketData]);

  const filteredCrops = useMemo(() => {
    if (!marketData?.crops) return [];
    return marketData.crops.filter((item) => {
      const matchesCategory = categoryFilter === "All Categories" || item.category === categoryFilter;
      const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [marketData, categoryFilter, searchQuery]);

  useEffect(() => {
    let mounted = true;
    const fetchSnapshot = async () => {
      setIsLoadingSnapshot(true);
      setSnapshotError(null);
      try {
        const res = await fetch(WEATHER_SNAPSHOT_ENDPOINT);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        console.log("weather_snapshot response:", json); // debug log
        // normalize available locations
        if (Array.isArray(json.available_locations) && json.available_locations.length > 0) {
          if (mounted) {
            setAvailableLocations(json.available_locations);
            // only set default once if location is empty
            if (!location) setLocation(prev => prev || json.available_locations[0]);
          }
        }
        // build map city -> weather
        const map = {};
        if (Array.isArray(json.locations)) {
          json.locations.forEach(l => {
            const cityName = l?.city;
            const weather = l?.weather ?? null;
            if (cityName) map[cityName] = weather;
          });
        }
        if (mounted) {
          setWeatherSnapshot(map);
          setLastUpdated(json.dataset_meta?.last_refreshed ?? json.generated_at ?? new Date().toISOString());
        }
      } catch (err) {
        console.error("Failed to load weather snapshot:", err);
        if (mounted) setSnapshotError(err.message || "Network error");
      } finally {
        if (mounted) setIsLoadingSnapshot(false);
      }
    };

    fetchSnapshot();
    const t = setInterval(fetchSnapshot, 60 * 1000); // refresh during dev
    return () => { mounted = false; clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentWeather = location ? (weatherSnapshot[location] || null) : null;

  const lastUpdatedDate = marketData?.last_updated ? new Date(marketData.last_updated) : null;
  const primaryWeather = marketData?.weather_snapshot?.[location] || {};
  const qualityIndex = primaryWeather?.weather_quality_index;

  return (
    <div className="market-page">
      <section className="market-hero">
        <div>
          <p className="hero-kicker">Live crop prices from Tamil Nadu dynamic markets</p>
          <h1>Real-Time Market Prices</h1>
          <p className="hero-subtitle">
            Prices auto-adjust every minute using live weather signals and our ML-based demand engine,
            so both buyers and sellers see the same trusted rate.
          </p>
        </div>
        <div className="hero-weather">
          <p className="hero-weather__title">{location}</p>
          <h3>{primaryWeather?.temperature_c != null ? `${primaryWeather.temperature_c.toFixed(1)}°C` : "—"}</h3>
          <span>Rain chance {primaryWeather?.rain_chance_pct != null ? `${primaryWeather.rain_chance_pct.toFixed(0)}%` : "—"}</span>
          <span>Weather quality {qualityIndex != null ? `${qualityIndex.toFixed(0)}/100` : "—"}</span>
        </div>
      </section>

      <section className="market-stats">
        <div className="stat-card">
          <p className="stat-label">Crops Tracked</p>
          <h2>{marketData?.summary?.crops_tracked ?? "—"}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Prices Rising</p>
          <h2>{marketData?.summary?.prices_rising ?? "—"}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Prices Falling</p>
          <h2>{marketData?.summary?.prices_falling ?? "—"}</h2>
        </div>
        <div className="stat-card">
          <p className="stat-label">Prices Stable</p>
          <h2>{marketData?.summary?.prices_stable ?? "—"}</h2>
        </div>
      </section>

      <section className="market-toolbar">
        <div className="toolbar-inputs">
          <label>
            Market Location
            <select value={location} onChange={(e) => setLocation(e.target.value)}>
              {(availableLocations.length ? availableLocations : CITY_LIST).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </label>
          <label>
            Buyer Qty (kg)
            <input type="number" min="1" value={buyerQty} onChange={(e) => setBuyerQty(Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <label>
            Seller Qty (kg)
            <input type="number" min="1" value={sellerQty} onChange={(e) => setSellerQty(Math.max(1, Number(e.target.value) || 1))} />
          </label>
          <label>
            Category Filter
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <label>
            Search Crops
            <input type="search" placeholder="Search by crop..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </label>
        </div>
        <div className="toolbar-actions">
          <button className="refresh-btn" onClick={fetchMarketSnapshot} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh Prices"}
          </button>
          <p className="last-updated">
            Last updated: {lastUpdatedDate ? lastUpdatedDate.toLocaleString() : "—"}
          </p>
          {datasetMeta?.last_refreshed && (
            <p className="last-updated dataset-meta">
              Dataset sync: {new Date(datasetMeta.last_refreshed).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {error && <div className="market-alert">{error}</div>}

      <section className="market-table-card">
        <header>
          <div>
            <h3>Current Market Prices</h3>
            <p>Source: Tamil Nadu APMC markets · Weather-aware ML pricing</p>
          </div>
        </header>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Category</th>
                <th>Predicted Price (₹/kg)</th>
                <th>Trend</th>
                <th>Market</th>
                <th>Buyer Total</th>
                <th>Seller Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrops.map((item) => (
                <tr key={item.crop}>
                  <td className="crop-cell">
                    <span>{item.crop}</span>
                    <small>
                      Weather: {item.weather?.temperature_c != null ? `${item.weather.temperature_c.toFixed(1)}°C` : "—"} · Rain {item.weather?.rain_chance_pct != null ? `${item.weather.rain_chance_pct.toFixed(0)}%` : "—"} · Quality{" "}
                      {item.weather_quality_index != null ? `${item.weather_quality_index.toFixed(0)}/100` : "—"}
                    </small>
                  </td>
                  <td>{item.category}</td>
                  <td>₹{item.predicted_price.toFixed(2)}</td>
                  <td><TrendBadge trend={item.trend} delta={item.trend_delta} /></td>
                  <td>{item.market}</td>
                  <td>₹{item.buyer_total.toFixed(2)}</td>
                  <td>₹{item.seller_total.toFixed(2)}</td>
                </tr>
              ))}
              {!filteredCrops.length && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No crops match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="nearby-markets-card">
        <h4>Nearby Markets Monitored (10 km radius)</h4>
        <div className="market-chip-list">
          {(marketData?.nearby_markets || []).map((market) => (
            <span key={market} className="market-chip">{market}</span>
          ))}
        </div>
      </section>

      <div>
        {/* location selector (use your existing style) */}
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          {availableLocations.map(city => <option key={city} value={city}>{city}</option>)}
        </select>

        <div>
          {isLoadingSnapshot && <div>Loading weather snapshot...</div>}
          {snapshotError && <div style={{ color: "red" }}>Unable to fetch snapshot: {snapshotError}</div>}
          {!isLoadingSnapshot && !snapshotError && currentWeather && (
            <div>
              <h4>Current Weather - {location}</h4>
              <p>Temp: {currentWeather.temperature_c ?? "—"} °C</p>
              <p>Humidity: {currentWeather.humidity_pct ?? "—"} %</p>
              <p>Rain chance: {currentWeather.rain_chance_pct ?? "—"} %</p>
              <p>Wind speed: {currentWeather.wind_speed_kph ?? "—"} kph</p>
              <p>Weather quality: {currentWeather.weather_quality_index ?? "—"}</p>
              <p className="small text-muted">Last updated: {new Date(lastUpdated).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* debug: show raw snapshot map (remove after fix) */}
      <div className="mt-3">
        <details>
          <summary className="small">Debug: raw snapshot (click to expand)</summary>
          <pre style={{ maxHeight: 300, overflow: "auto" }}>{JSON.stringify(weatherSnapshot, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default MarketPrices;
