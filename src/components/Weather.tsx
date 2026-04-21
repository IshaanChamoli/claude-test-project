"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface WeatherData {
  current: { temperature: number; weatherCode: number };
  daily: {
    date: string[];
    tempMax: number[];
    tempMin: number[];
    weatherCode: number[];
  };
  location: string;
  fetchedAt: number;
}

interface GeoResult {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

const CACHE_KEY = "dashboard-weather";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function weatherIcon(code: number) {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 77) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 86) return "🌨️";
  return "⛈️";
}

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 65) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
}

function dayName(dateStr: string, index: number) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getCached(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: WeatherData = JSON.parse(raw);
    if (Date.now() - data.fetchedAt > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(data: WeatherData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // storage full — ignore
  }
}

async function fetchWeather(
  lat: number,
  lon: number,
  locationName: string
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather API request failed");
  const json = await res.json();

  return {
    current: {
      temperature: Math.round(json.current.temperature_2m),
      weatherCode: json.current.weather_code,
    },
    daily: {
      date: json.daily.time,
      tempMax: json.daily.temperature_2m_max.map((t: number) => Math.round(t)),
      tempMin: json.daily.temperature_2m_min.map((t: number) => Math.round(t)),
      weatherCode: json.daily.weather_code,
    },
    location: locationName,
    fetchedAt: Date.now(),
  };
}

async function searchCity(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`
  );
  if (!res.ok) return [];
  const json = await res.json();
  if (!json.results) return [];
  return json.results.map((r: { name: string; country: string; latitude: number; longitude: number }) => ({
    name: r.name,
    country: r.country,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(1)},${lon.toFixed(1)}&count=1&language=en`
    );
    if (res.ok) {
      const json = await res.json();
      if (json.results?.[0]) {
        return `${json.results[0].name}, ${json.results[0].country}`;
      }
    }
  } catch {
    // fall through
  }
  return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
}

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadWeather = useCallback(async (lat: number, lon: number, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const locationName = name ?? (await reverseGeocode(lat, lon));
      const data = await fetchWeather(lat, lon, locationName);
      setWeather(data);
      setCache(data);
    } catch {
      setError("Could not fetch weather data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setWeather(cached);
      setLoading(false);
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Geolocation denied — default to New York
          loadWeather(40.71, -74.01, "New York, US");
        },
        { timeout: 10000 }
      );
    } else {
      loadWeather(40.71, -74.01, "New York, US");
    }
  }, [loadWeather]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchCity(searchQuery);
      setSearchResults(results);
      setSearching(false);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  const selectCity = (city: GeoResult) => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    loadWeather(city.latitude, city.longitude, `${city.name}, ${city.country}`);
  };

  return (
    <div className="glass glass-glow animate-fade-up delay-1 rounded-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <p className="text-muted text-xs font-semibold uppercase tracking-widest">
            Weather
          </p>
        </div>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (!showSearch) setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="text-muted hover:text-foreground transition-colors text-xs font-medium tracking-wide"
          aria-label="Search city"
        >
          {weather?.location ?? "Search"}
          <svg className="ml-1 inline-block h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* City search */}
      {showSearch && (
        <div className="mb-5">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city..."
            className="input-glow w-full rounded-lg border border-card-border bg-card px-4 py-2 text-sm outline-none placeholder:text-muted/40 transition-all"
          />
          {searching && (
            <p className="text-muted mt-2 text-xs">Searching...</p>
          )}
          {searchResults.length > 0 && (
            <ul className="mt-2 space-y-1">
              {searchResults.map((city, i) => (
                <li key={i}>
                  <button
                    onClick={() => selectCity(city)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-card-hover transition-colors"
                  >
                    {city.name}, {city.country}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && !weather && (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
        </div>
      )}

      {/* Error state */}
      {error && !weather && (
        <div className="py-6 text-center">
          <p className="text-muted text-sm">{error}</p>
          <button
            onClick={() => loadWeather(40.71, -74.01, "New York, US")}
            className="text-accent mt-2 text-xs hover:underline"
          >
            Try with default location
          </button>
        </div>
      )}

      {/* Current weather */}
      {weather && (
        <>
          <div className="mb-5 flex items-center gap-4">
            <span className="text-5xl leading-none">
              {weatherIcon(weather.current.weatherCode)}
            </span>
            <div>
              <p className="text-gradient text-4xl font-bold tracking-tight">
                {weather.current.temperature}°C
              </p>
              <p className="text-muted text-sm">
                {weatherLabel(weather.current.weatherCode)}
              </p>
            </div>
          </div>

          {/* Forecast */}
          <div className="grid grid-cols-5 gap-2">
            {weather.daily.date.slice(0, 5).map((date, i) => (
              <div
                key={date}
                className="rounded-xl bg-card p-3 text-center transition-colors hover:bg-card-hover"
              >
                <p className="text-muted mb-1 text-[10px] font-semibold uppercase tracking-wider">
                  {dayName(date, i)}
                </p>
                <p className="mb-1 text-lg leading-none">
                  {weatherIcon(weather.daily.weatherCode[i])}
                </p>
                <p className="text-xs font-medium">
                  {weather.daily.tempMax[i]}°
                </p>
                <p className="text-muted/60 text-[10px]">
                  {weather.daily.tempMin[i]}°
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
