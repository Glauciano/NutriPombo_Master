"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CloudSun,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  Umbrella,
  MapPin,
  Home,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Flag,
} from "lucide-react";

/* ─── types ─── */
interface Competition {
  id: number;
  orderNumber: number | null;
  name: string;
  date: string;
  type: string;
  distance: string | null;
  status: string;
}

interface ForecastDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
  condition: { main: string; description: string; icon: string };
  windSpeedMax: number;
  windDir: string;
}

interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windGusts: number;
  windDeg: number;
  windDir: string;
  clouds: number;
  rain: number;
  precipitation: number;
  description: string;
  icon: string;
  main: string;
  weatherCode: number;
  forecast: ForecastDay[];
}

/* ─── helpers ─── */
function getWeatherIcon(main: string) {
  switch (main) {
    case "Clear": return Sun;
    case "Clouds": return Cloud;
    case "Rain": return CloudRain;
    case "Drizzle": return CloudDrizzle;
    case "Thunderstorm": return CloudLightning;
    case "Snow": return CloudSnow;
    case "Fog": return CloudFog;
    default: return CloudSun;
  }
}

function getWeatherColor(main: string) {
  switch (main) {
    case "Clear": return "text-yellow-400";
    case "Clouds": return "text-slate-300";
    case "Rain": return "text-blue-400";
    case "Drizzle": return "text-cyan-400";
    case "Thunderstorm": return "text-purple-400";
    case "Snow": return "text-white";
    case "Fog": return "text-slate-400";
    default: return "text-amber-400";
  }
}

function flightScore(w: WeatherData): { score: number; label: string; color: string; bg: string } {
  let score = 100;
  if (w.windSpeed > 40) score -= 50;
  else if (w.windSpeed > 25) score -= 30;
  else if (w.windSpeed > 15) score -= 10;
  if (w.humidity > 85) score -= 30;
  else if (w.humidity > 70) score -= 15;
  else if (w.humidity > 60) score -= 5;
  if (w.rain > 2) score -= 40;
  else if (w.rain > 0.5) score -= 20;
  else if (w.rain > 0) score -= 10;
  if (w.temp > 38 || w.temp < 3) score -= 30;
  else if (w.temp > 33 || w.temp < 8) score -= 15;
  if (w.main === "Thunderstorm") score -= 60;
  if (w.main === "Fog") score -= 30;
  score = Math.max(0, Math.min(100, score));

  if (score >= 80) return { score, label: "Ótimas condições", color: "text-emerald-400", bg: "bg-emerald-500" };
  if (score >= 60) return { score, label: "Condições favoráveis", color: "text-green-400", bg: "bg-green-500" };
  if (score >= 40) return { score, label: "Condições moderadas", color: "text-amber-400", bg: "bg-amber-500" };
  if (score >= 20) return { score, label: "Desfavorável", color: "text-orange-400", bg: "bg-orange-500" };
  return { score, label: "Não recomendado", color: "text-red-400", bg: "bg-red-500" };
}

function windAnalysis(windDir: string, windSpeed: number, pombalDir: string) {
  const opposites: Record<string, string[]> = {
    Sul: ["N", "NNE", "NNO", "NE", "NO"],
    Norte: ["S", "SSE", "SSO", "SE", "SO"],
    Leste: ["O", "ONO", "OSO", "NO", "SO"],
    Oeste: ["E", "ENE", "ESE", "NE", "SE"],
  };
  const favorable = (opposites[pombalDir] || []).includes(windDir);
  return {
    favorable,
    label: favorable ? "Favorável" : windSpeed < 8 ? "Neutro" : "Contrário",
    description: favorable
      ? `Vento vem de ${windDir} (${windSpeed}km/h) empurra os pombos em direção ao pombal ✅`
      : windSpeed < 8
        ? `Vento fraco de ${windDir} (${windSpeed}km/h) — impacto mínimo`
        : `Vento vem de ${windDir} (${windSpeed}km/h) em direção oposta ao pombal`,
  };
}

function fmtWeekdayShort(dateStr: string) {
  const dt = new Date(dateStr + "T12:00:00");
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return days[dt.getDay()];
}

function fmtDayMonth(dateStr: string) {
  const dt = new Date(dateStr + "T12:00:00");
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

/* ─── page ─── */
export default function ClimaPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [pombalDir, setPombalDir] = useState("Sul");
  const [viewMode, setViewMode] = useState<"agora" | "7dias" | "provas">("agora");

  const fetchCompetitions = useCallback(async () => {
    const res = await fetch("/api/competitions");
    const data = await res.json();
    setCompetitions(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);

  async function fetchWeather(cityName: string) {
    setWeatherLoading(true);
    setWeatherError(null);
    const cleanCity = cityName.replace(/\s*—.*$/, "").trim();
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cleanCity)}`);
      if (!res.ok) {
        setWeatherError("Cidade não encontrada na API");
        setWeather(null);
      } else {
        const data = await res.json();
        if (data.error) {
          setWeatherError("Cidade não encontrada na API");
          setWeather(null);
        } else {
          setWeather(data);
        }
      }
    } catch {
      setWeatherError("Falha ao buscar dados");
      setWeather(null);
    }
    setWeatherLoading(false);
  }

  function selectCity(name: string) {
    setSelectedCity(name);
    fetchWeather(name);
  }

  useEffect(() => {
    if (competitions.length > 0 && !selectedCity) {
      const next = competitions.find((c) => c.status === "agendada") || competitions[0];
      selectCity(next.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitions]);

  const allCities = [
    { id: "pombal", name: "Pombal (sua base)", isPombal: true, orderNumber: null, status: "" },
    ...competitions.map((c) => ({ id: String(c.id), name: c.name, isPombal: false, orderNumber: c.orderNumber, status: c.status })),
  ];

  const nextUpcoming = competitions.find((c) => c.status === "agendada");

  const WIcon = weather ? getWeatherIcon(weather.main) : Sun;
  const wColor = weather ? getWeatherColor(weather.main) : "text-yellow-400";
  const flight = weather ? flightScore(weather) : null;
  const wind = weather ? windAnalysis(weather.windDir, weather.windSpeed, pombalDir) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/provas" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <CloudSun className="w-6 h-6 text-amber-400" />
          <h1 className="text-2xl font-extrabold text-white">Previsão do Tempo</h1>
        </div>
        <p className="text-sm text-slate-400">Dados reais • Open-Meteo • Atualização ao vivo</p>
      </div>

      {/* ─── City Selector ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Selecionar local</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {allCities.map((city) => {
            const isActive = selectedCity === city.name;
            const isDone = city.status === "realizada";
            const isNext = !city.isPombal && city.name === nextUpcoming?.name;
            return (
              <button
                key={city.id}
                onClick={() => selectCity(city.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-yellow-500 text-[#0b1120]"
                    : isNext
                      ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-400"
                      : isDone
                        ? "bg-[#0b1120] border border-[#2a3a4a] text-slate-500"
                        : "bg-[#0b1120] border border-[#2a3a4a] text-slate-400 hover:border-yellow-500/40 hover:text-white"
                }`}
              >
                {city.isPombal ? "🏠 " : `#${city.orderNumber} `}
                {city.name.replace(/\s*—.*$/, "").replace("Pombal (sua base)", "Pombal")}
                {isDone ? " ✓" : ""}
                {isNext ? " ⚡" : ""}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 shrink-0">Pombal fica ao:</span>
          <select
            value={pombalDir}
            onChange={(e) => setPombalDir(e.target.value)}
            className="px-3 py-1.5 bg-[#0b1120] border border-[#2a3a4a] rounded-lg text-white text-sm focus:ring-2 focus:ring-yellow-500"
          >
            <option value="Norte">Norte</option>
            <option value="Sul">Sul</option>
            <option value="Leste">Leste</option>
            <option value="Oeste">Oeste</option>
          </select>
          <button
            onClick={() => selectedCity && fetchWeather(selectedCity)}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors ml-auto"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 text-white ${weatherLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── View Mode ─── */}
      <div className="flex gap-2 mb-4">
        {([
          { id: "agora" as const, label: "🌤️ Agora" },
          { id: "7dias" as const, label: "📅 7 Dias" },
          { id: "provas" as const, label: "🏁 Provas" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              viewMode === tab.id
                ? "bg-yellow-500 text-[#0b1120]"
                : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content ─── */}
      {weatherLoading ? (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
        </div>
      ) : weatherError ? (
        <div className="bg-[#1a2736] border border-red-500/30 rounded-2xl p-8 text-center">
          <CloudSun className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold mb-1">{weatherError}</p>
          <p className="text-xs text-slate-500">Tente outra cidade ou verifique a conexão</p>
        </div>
      ) : weather && viewMode === "agora" ? (
        <div className="space-y-4">
          {/* Main card */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 uppercase tracking-wider font-semibold">
              <MapPin className="w-3 h-3" /> {weather.city} — há 0 min
            </div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <WIcon className={`w-16 h-16 ${wColor} mb-2`} />
                <p className={`text-lg font-bold ${wColor} capitalize`}>{weather.description}</p>
              </div>
              <div className="text-right">
                <p className="text-7xl font-black text-white leading-none">{weather.temp}°</p>
                <p className="text-xs text-slate-400 mt-1">{weather.tempMin}° / {weather.tempMax}°</p>
              </div>
            </div>
            {/* Flight Score */}
            {flight && (
              <div className={`rounded-xl p-3.5 ${flight.bg}/10 border border-current/20 ${flight.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-bold">{flight.label}</span>
                  </div>
                  <span className="text-xl font-black">{flight.score}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-full rounded-full ${flight.bg} transition-all duration-700`} style={{ width: `${flight.score}%` }} />
                </div>
                <p className="text-[10px] mt-2 opacity-70">Score de condições para provas de pombos</p>
              </div>
            )}
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
              <Droplets className="w-5 h-5 text-blue-400 mb-1" />
              <p className="text-[10px] text-slate-500 uppercase">Umidade</p>
              <p className="text-2xl font-black text-white">{weather.humidity}%</p>
            </div>
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
              <Umbrella className="w-5 h-5 text-cyan-400 mb-1" />
              <p className="text-[10px] text-slate-500 uppercase">Chuva</p>
              <p className="text-2xl font-black text-white">{weather.rain.toFixed(1)}mm <span className="text-sm text-slate-500">({weather.clouds}%)</span></p>
            </div>
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
              <Wind className="w-5 h-5 text-teal-400 mb-1" />
              <p className="text-[10px] text-slate-500 uppercase">Vento</p>
              <p className="text-2xl font-black text-white">{weather.windSpeed}<span className="text-sm text-slate-400">km/h</span></p>
            </div>
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
              <Compass className="w-5 h-5 text-violet-400 mb-1" />
              <p className="text-[10px] text-slate-500 uppercase">Direção</p>
              <p className="text-2xl font-black text-white">{weather.windDir}</p>
            </div>
          </div>

          {/* Wind Analysis */}
          {wind && (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Análise do Vento para Prova</span>
              </div>
              <div className={`rounded-xl p-4 border-l-4 mb-4 ${
                wind.favorable ? "border-l-emerald-500 bg-emerald-500/10" : wind.label === "Neutro" ? "border-l-blue-500 bg-blue-500/10" : "border-l-amber-500 bg-amber-500/10"
              }`}>
                <p className={`text-lg font-black mb-1 ${
                  wind.favorable ? "text-emerald-400" : wind.label === "Neutro" ? "text-blue-400" : "text-amber-400"
                }`}>
                  {wind.favorable ? "✅" : wind.label === "Neutro" ? "💨" : "⚠️"} {wind.label}
                </p>
                <p className="text-sm text-slate-300">{wind.description}</p>
              </div>
              <div className="flex items-center justify-between bg-[#0b1120] rounded-xl p-4">
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Vento vem de</p>
                  <Wind className="w-7 h-7 text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-400">{weather.windDir}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 mx-2" />
                <div className="text-center flex-1">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Pombal ao</p>
                  <Home className="w-7 h-7 text-emerald-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-emerald-400">{pombalDir}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feed recommendation */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🌾</span>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Alimentação Recomendada</span>
            </div>
            <div className="bg-[#0b1120] rounded-xl p-4">
              <p className="text-sm text-slate-300">
                {weather.temp > 30
                  ? "🥵 Calor intenso: Mistura leve + muitos eletrólitos. Reduzir girassol 50%. Priorizar hidratação."
                  : weather.temp > 25
                    ? "☀️ Clima quente: Mistura padrão com eletrólitos na água. Manter hidratação constante."
                    : weather.temp < 12
                      ? "🥶 Frio: Aumentar girassol e sementes oleaginosas. Mistura energética. Água morna."
                      : "✅ Condições ideais: Mistura padrão de competição. Protocolo normal."}
              </p>
            </div>
          </div>
        </div>
      ) : weather && viewMode === "7dias" ? (
        /* ─── 7-Day Forecast ─── */
        <div className="space-y-3">
          {weather.forecast.map((day, idx) => {
            const DayIcon = getWeatherIcon(day.condition.main);
            const dayColor = getWeatherColor(day.condition.main);
            const isToday = idx === 0;
            return (
              <div key={day.date} className={`bg-[#1a2736] border rounded-xl p-4 flex items-center gap-4 ${
                isToday ? "border-yellow-500/40" : "border-[#2a3a4a]"
              }`}>
                <div className="w-14 text-center shrink-0">
                  <p className={`text-xs font-bold ${isToday ? "text-yellow-400" : "text-slate-400"}`}>
                    {isToday ? "Hoje" : fmtWeekdayShort(day.date)}
                  </p>
                  <p className="text-[10px] text-slate-600">{fmtDayMonth(day.date)}</p>
                </div>
                <DayIcon className={`w-8 h-8 ${dayColor} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold capitalize ${dayColor}`}>{day.condition.description}</p>
                  <p className="text-xs text-slate-500">{day.windDir} {day.windSpeedMax}km/h</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-white">{day.tempMax}°</p>
                  <p className="text-xs text-slate-500">{day.tempMin}°</p>
                </div>
                {day.precipitation > 0 && (
                  <div className="text-right shrink-0">
                    <Droplets className="w-3 h-3 text-blue-400 inline mr-0.5" />
                    <span className="text-xs text-blue-400 font-semibold">{day.precipitation.toFixed(1)}mm</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : weather && viewMode === "provas" ? (
        /* ─── Provas upcoming weather ─── */
        <div className="space-y-3">
          {competitions.filter((c) => c.status === "agendada").map((c) => {
            const isSelected = selectedCity === c.name;
            return (
              <button
                key={c.id}
                onClick={() => { selectCity(c.name); setViewMode("agora"); }}
                className={`w-full text-left bg-[#1a2736] border rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-[#1e2f40] ${
                  isSelected ? "border-yellow-500/40" : "border-[#2a3a4a]"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm font-black text-yellow-400 shrink-0">
                  {c.orderNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.distance ? `${Math.round(parseFloat(c.distance))}km` : "—"} •{" "}
                    {new Date(typeof c.date === "string" ? c.date + "T12:00:00" : c.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-12 text-center">
          <CloudSun className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Selecione uma cidade para ver o clima</p>
        </div>
      )}
    </div>
  );
}
