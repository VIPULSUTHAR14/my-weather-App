'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Sun,
  Compass,
  Eye,
  Gauge,
  Thermometer,
  CloudRain,
  Activity,
  RefreshCw
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
    air_quality: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      'us-epa-index': number;
      'gb-defra-index': number;
    };
  };
}

const QUICK_CITIES = ['Udaipur', 'Tokyo', 'London', 'New York', 'Sydney'];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('Udaipur');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = async (targetCity: string, silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/weather?q=${encodeURIComponent(targetCity)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch weather data');
      }
      const data: WeatherData = await response.json();
      setWeather(data);
      setCity(data.location.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchWeather(city);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery.trim());
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWeather(city, true);
  };

  // Helper to determine background style and colors based on weather condition
  const getThemeStyles = () => {
    if (!weather) return {
      bg: 'from-slate-900 via-slate-800 to-zinc-900',
      card: 'bg-slate-900/40 border-slate-800 text-white',
      accent: 'text-sky-400',
      accentBg: 'bg-sky-500/10',
      badge: 'bg-sky-500/20 text-sky-300'
    };

    const isDay = weather.current.is_day === 1;
    const code = weather.current.condition.code;

    // Night styles override
    if (!isDay) {
      return {
        bg: 'from-zinc-950 via-slate-950 to-indigo-950',
        card: 'bg-slate-900/40 border-slate-800/80 text-slate-100',
        accent: 'text-indigo-400',
        accentBg: 'bg-indigo-500/10',
        badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      };
    }

    // Sunny / Clear
    if (code === 1000) {
      return {
        bg: 'from-amber-500/20 via-orange-600/10 to-yellow-600/5 dark:from-amber-950/40 dark:via-zinc-950 dark:to-orange-950/20',
        card: 'bg-white/80 dark:bg-zinc-900/40 border-orange-500/20 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100',
        accent: 'text-amber-500',
        accentBg: 'bg-amber-500/10',
        badge: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
      };
    }

    // Cloudy / Overcast / Mist
    if ([1003, 1006, 1009, 1030, 1135, 1147].includes(code)) {
      return {
        bg: 'from-blue-100 via-slate-100 to-zinc-200 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-950',
        card: 'bg-white/80 dark:bg-zinc-900/40 border-slate-300/40 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100',
        accent: 'text-blue-500 dark:text-blue-400',
        accentBg: 'bg-blue-500/10',
        badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
      };
    }

    // Rainy / Drizzle
    if ([1063, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)) {
      return {
        bg: 'from-sky-900/20 via-indigo-950/10 to-slate-900 dark:from-sky-950/40 dark:via-zinc-950 dark:to-slate-950',
        card: 'bg-white/80 dark:bg-zinc-900/40 border-sky-500/20 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100',
        accent: 'text-sky-500',
        accentBg: 'bg-sky-500/10',
        badge: 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/30'
      };
    }

    // Snowy / Sleet
    if ([1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258].includes(code)) {
      return {
        bg: 'from-cyan-100 via-indigo-50/50 to-zinc-100 dark:from-cyan-950/30 dark:via-zinc-950 dark:to-slate-950',
        card: 'bg-white/80 dark:bg-zinc-900/40 border-cyan-500/20 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100',
        accent: 'text-cyan-500',
        accentBg: 'bg-cyan-500/10',
        badge: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
      };
    }

    // Thunderstorm
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) {
      return {
        bg: 'from-violet-950/30 via-slate-950 to-zinc-950',
        card: 'bg-zinc-900/40 border-violet-500/20 text-slate-100',
        accent: 'text-violet-400',
        accentBg: 'bg-violet-500/10',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
      };
    }

    // Default Fallback
    return {
      bg: 'from-blue-500/10 via-indigo-600/5 to-zinc-900/5 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-950',
      card: 'bg-white/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100',
      accent: 'text-blue-500',
      accentBg: 'bg-blue-500/10',
      badge: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
    };
  };

  const theme = getThemeStyles();

  // Get AQI Description
  const getAQIDetails = (epaIndex: number) => {
    switch (epaIndex) {
      case 1:
        return { label: 'Good', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', desc: 'Air quality is satisfactory, and air pollution poses little or no risk.' };
      case 2:
        return { label: 'Moderate', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30', desc: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.' };
      case 3:
        return { label: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30', desc: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' };
      case 4:
        return { label: 'Unhealthy', color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30', desc: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.' };
      case 5:
        return { label: 'Very Unhealthy', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30', desc: 'Health alert: The risk of health effects is increased for everyone.' };
      case 6:
        return { label: 'Hazardous', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30', desc: 'Health warning of emergency conditions: The entire population is more likely to be affected.' };
      default:
        return { label: 'Unknown', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', desc: 'No AQI details available.' };
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} transition-all duration-700 ease-in-out pb-12`}>
      <header className="max-w-7xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${theme.accentBg} ${theme.accent}`}>
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Skyline Weather</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time weather & air quality insights</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
            <input
              type="text"
              placeholder="Search city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
              id="city-search-input"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1 py-1 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
              id="search-btn"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/65 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 disabled:opacity-50 transition-all"
              title="Refresh"
              id="refresh-btn"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-0.5">
              <button
                onClick={() => setIsFahrenheit(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${!isFahrenheit ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                id="celsius-toggle-btn"
              >
                °C
              </button>
              <button
                onClick={() => setIsFahrenheit(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isFahrenheit ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                id="fahrenheit-toggle-btn"
              >
                °F
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
          {QUICK_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setSearchQuery('');
                fetchWeather(c);
              }}
              className={`px-3 py-1.5 text-xs rounded-xl font-medium border transition-all ${city.toLowerCase() === c.toLowerCase() ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/40 dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-white/60 dark:hover:bg-zinc-900/50'}`}
              id={`quick-link-${c.toLowerCase()}`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse" id="loading-skeleton">
            <div className="lg:col-span-1 h-[420px] bg-zinc-200 dark:bg-zinc-800/50 rounded-3xl"></div>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[120px] bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl"></div>
              ))}
              <div className="col-span-full h-[220px] bg-zinc-200 dark:bg-zinc-800/50 rounded-2xl"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl max-w-xl mx-auto text-center shadow-lg" id="error-card">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Failed to load weather data</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
            <button
              onClick={() => fetchWeather(city)}
              className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              id="retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="weather-dashboard">
            {/* Primary Details Panel */}
            <div className={`lg:col-span-1 rounded-3xl border ${theme.card} p-6 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden`} id="primary-weather-card">
              {/* Subtle dynamic bg reflection */}
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-1.5" id="weather-city-name">
                      <MapPin className={`w-5 h-5 ${theme.accent}`} />
                      {weather.location.name}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {weather.location.region}, {weather.location.country}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border tracking-wider ${theme.badge}`}>
                    {weather.current.is_day ? 'Day' : 'Night'}
                  </span>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-6xl font-extrabold tracking-tighter" id="weather-temp-display">
                      {isFahrenheit ? `${Math.round(weather.current.temp_f)}°F` : `${Math.round(weather.current.temp_c)}°C`}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5" />
                      Feels like:{' '}
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                        {isFahrenheit ? `${Math.round(weather.current.feelslike_f)}°F` : `${Math.round(weather.current.feelslike_c)}°C`}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <img
                      src={`https:${weather.current.condition.icon}`}
                      alt={weather.current.condition.text}
                      className="w-20 h-20 object-contain drop-shadow-lg"
                      id="weather-condition-icon"
                    />
                    <span className="text-sm font-semibold tracking-wide text-center" id="weather-condition-text">
                      {weather.current.condition.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/80">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Lat / Lon</span>
                    <span className="text-xs font-semibold mt-1 block">{weather.location.lat.toFixed(2)}° / {weather.location.lon.toFixed(2)}°</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-[10px] text-zinc-400 block uppercase font-bold tracking-wider">Local Time</span>
                    <span className="text-xs font-semibold mt-1 block">
                      {weather.location.localtime.split(' ')[1]}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 mt-4 text-center">
                  Last updated: {weather.current.last_updated}
                </p>
              </div>
            </div>

            {/* Metrics Dashboard */}
            <div className="lg:col-span-2 flex flex-col gap-6" id="metrics-grid">
              {/* Detailed Metrics List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Wind Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="wind-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <Wind className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Wind</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-bold">
                        {weather.current.wind_kph} <span className="text-xs font-normal text-zinc-500">kph</span>
                      </span>
                      <span className="text-xs text-zinc-400 font-semibold uppercase ml-1 flex items-center gap-0.5">
                        <Compass className="w-3.5 h-3.5 inline animate-spin-slow" />
                        {weather.current.wind_dir}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">Gusts up to {weather.current.gust_kph} kph</span>
                  </div>
                </div>

                {/* Humidity Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="humidity-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Humidity</span>
                    <span className="text-lg font-bold mt-1 block">{weather.current.humidity}%</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">Cloud cover: {weather.current.cloud}%</span>
                  </div>
                </div>

                {/* UV Index Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="uv-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">UV Index</span>
                    <span className="text-lg font-bold mt-1 block">{weather.current.uv}</span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      {weather.current.uv <= 2 ? 'Low Risk' : weather.current.uv <= 5 ? 'Moderate' : weather.current.uv <= 7 ? 'High' : 'Very High'}
                    </span>
                  </div>
                </div>

                {/* Pressure Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="pressure-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <Gauge className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Pressure</span>
                    <span className="text-lg font-bold mt-1 block">
                      {weather.current.pressure_mb} <span className="text-xs font-normal text-zinc-500">mb</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">({weather.current.pressure_in.toFixed(1)} inHg)</span>
                  </div>
                </div>

                {/* Visibility Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="visibility-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Visibility</span>
                    <span className="text-lg font-bold mt-1 block">
                      {weather.current.vis_km} <span className="text-xs font-normal text-zinc-500">km</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">({weather.current.vis_miles} miles)</span>
                  </div>
                </div>

                {/* Precipitation Card */}
                <div className={`p-5 rounded-2xl border ${theme.card} shadow-md flex items-center gap-4`} id="precip-metric-card">
                  <div className={`p-3 rounded-xl ${theme.accentBg} ${theme.accent}`}>
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-zinc-400 block font-semibold uppercase tracking-wider">Precipitation</span>
                    <span className="text-lg font-bold mt-1 block">
                      {weather.current.precip_mm} <span className="text-xs font-normal text-zinc-500">mm</span>
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">({weather.current.precip_in.toFixed(2)} inches)</span>
                  </div>
                </div>
              </div>

              {/* Air Quality Index Card */}
              <div className={`p-6 rounded-3xl border ${theme.card} shadow-lg`} id="aqi-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200/50 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Air Quality Index (AQI)</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Health warning level & atmospheric details</p>
                    </div>
                  </div>

                  {/* EPA index tag */}
                  <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${getAQIDetails(weather.current.air_quality['us-epa-index']).color}`}>
                    EPA Class: {getAQIDetails(weather.current.air_quality['us-epa-index']).label}
                  </span>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 my-4 leading-relaxed">
                  {getAQIDetails(weather.current.air_quality['us-epa-index']).desc}
                </p>

                {/* AQI Pollutants grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">PM 2.5</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{weather.current.air_quality.pm2_5.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400">µg/m³</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">PM 10</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{weather.current.air_quality.pm10.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400">µg/m³</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">O₃ (Ozone)</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{weather.current.air_quality.o3.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400">µg/m³</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">NO₂ (Nitrogen)</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{weather.current.air_quality.no2.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400">µg/m³</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">SO₂ (Sulfur)</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{weather.current.air_quality.so2.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400">µg/m³</span>
                  </div>
                  <div className="bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/60 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">CO (Carbon)</span>
                    <span className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{(weather.current.air_quality.co / 1000).toFixed(2)}</span>
                    <span className="text-[9px] text-zinc-400">mg/m³</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="max-w-7xl mx-auto px-4 mt-12 text-center text-xs text-zinc-500/80 dark:text-zinc-400/60">
        <p>© 2026 Skyline Weather. Weather API endpoints powered by <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">WeatherAPI</a>.</p>
      </footer>
    </div>
  );
}
