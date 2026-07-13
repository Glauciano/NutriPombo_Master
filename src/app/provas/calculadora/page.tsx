"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, Clock, MapPin, ArrowRightLeft, RotateCcw, Timer, Trophy, Star, TrendingUp, TrendingDown, XCircle, Award, ChevronDown, ChevronUp } from "lucide-react";

/* ────────── Classification Table ────────── */
const classifications = [
  { min: 1400, max: 9999, label: "Excepcional", color: "text-yellow-400", bg: "bg-yellow-500", emoji: "🏆" },
  { min: 1300, max: 1399, label: "Excelente", color: "text-emerald-400", bg: "bg-emerald-500", emoji: "✅" },
  { min: 1200, max: 1299, label: "Muito Boa", color: "text-green-400", bg: "bg-green-500", emoji: "✅" },
  { min: 1100, max: 1199, label: "Boa", color: "text-blue-400", bg: "bg-blue-500", emoji: "✅" },
  { min: 1000, max: 1099, label: "Regular", color: "text-amber-400", bg: "bg-amber-500", emoji: "⚠️" },
  { min: 900, max: 999, label: "Abaixo da média", color: "text-orange-400", bg: "bg-orange-500", emoji: "⚠️" },
  { min: 0, max: 899, label: "Muito baixa", color: "text-red-400", bg: "bg-red-500", emoji: "❌" },
];

function classify(mPerMin: number) {
  for (const c of classifications) {
    if (mPerMin >= c.min) return c;
  }
  return classifications[classifications.length - 1];
}

function mpmToKmh(mpm: number) {
  return (mpm * 60) / 1000;
}

/* ────────── Page ────────── */
export default function CalculadoraVelocidadePage() {
  const [mode, setMode] = useState<"speed" | "time" | "distance">("speed");

  // Speed mode: distance + time -> speed
  const [distance, setDistance] = useState("300");
  const [releaseTime, setReleaseTime] = useState("07:00");
  const [arrivalTime, setArrivalTime] = useState("09:45");

  // Time mode: distance + speed -> time
  const [distTime, setDistTime] = useState("");
  const [speedForTime, setSpeedForTime] = useState("");

  // Distance mode: speed + time -> distance
  const [speedForDist, setSpeedForDist] = useState("");
  const [hoursForDist, setHoursForDist] = useState("");
  const [minsForDist, setMinsForDist] = useState("");

  // Results
  const [result, setResult] = useState<{
    mPerMin: number;
    kmh: number;
    totalMinutes: number;
    distKm: number;
  } | null>(null);

  // Converter
  const [convMpm, setConvMpm] = useState("1200");
  const [convKmh, setConvKmh] = useState("72");
  const [convDir, setConvDir] = useState<"mpm_to_kmh" | "kmh_to_mpm">("mpm_to_kmh");

  function calcSpeed() {
    const dist = parseFloat(distance);
    if (!dist) return;
    const [rh, rm] = releaseTime.split(":").map(Number);
    const [ah, am] = arrivalTime.split(":").map(Number);
    let totalMin = (ah * 60 + am) - (rh * 60 + rm);
    if (totalMin <= 0) totalMin += 24 * 60;
    const mPerMin = (dist * 1000) / totalMin;
    const kmh = mpmToKmh(mPerMin);
    setResult({ mPerMin, kmh, totalMinutes: totalMin, distKm: dist });
  }

  function calcTime() {
    const dist = parseFloat(distTime);
    const spd = parseFloat(speedForTime);
    if (!dist || !spd) return;
    const totalMin = (dist * 1000) / spd;
    const kmh = mpmToKmh(spd);
    setResult({ mPerMin: spd, kmh, totalMinutes: totalMin, distKm: dist });
  }

  function calcDist() {
    const spd = parseFloat(speedForDist);
    const h = parseFloat(hoursForDist) || 0;
    const m = parseFloat(minsForDist) || 0;
    const totalMin = h * 60 + m;
    if (!spd || totalMin <= 0) return;
    const distKm = (spd * totalMin) / 1000;
    const kmh = mpmToKmh(spd);
    setResult({ mPerMin: spd, kmh, totalMinutes: totalMin, distKm });
  }

  function handleCalc() {
    if (mode === "speed") calcSpeed();
    else if (mode === "time") calcTime();
    else calcDist();
  }

  function resetAll() {
    setResult(null);
    setDistance("300");
    setReleaseTime("07:00");
    setArrivalTime("09:45");
    setDistTime("");
    setSpeedForTime("");
    setSpeedForDist("");
    setHoursForDist("");
    setMinsForDist("");
  }

  function formatTime(totalMin: number) {
    const h = Math.floor(totalMin / 60);
    const m = Math.floor(totalMin % 60);
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }

  function handleConvert() {
    if (convDir === "mpm_to_kmh") {
      const v = parseFloat(convMpm);
      if (v) setConvKmh(mpmToKmh(v).toFixed(1));
    } else {
      const v = parseFloat(convKmh);
      if (v) setConvMpm(((v * 1000) / 60).toFixed(1));
    }
  }

  function swapConv() {
    setConvDir((d) => (d === "mpm_to_kmh" ? "kmh_to_mpm" : "mpm_to_kmh"));
  }

  const cls = result ? classify(result.mPerMin) : null;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/provas" className="px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors">
          ← Voltar
        </Link>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-6 h-6 text-yellow-400" />
        <h1 className="text-2xl font-extrabold text-white">Calculadora de Velocidade</h1>
      </div>
      <p className="text-sm text-slate-400 mb-6">Calcule velocidade, tempo ou distância da prova</p>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("speed"); setResult(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            mode === "speed"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          Calcular Velocidade
        </button>
        <button
          onClick={() => { setMode("time"); setResult(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            mode === "time"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
          Calcular Tempo
        </button>
        <button
          onClick={() => { setMode("distance"); setResult(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            mode === "distance"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Calcular Distância
        </button>
      </div>

      {/* ─── Speed Mode ─── */}
      {mode === "speed" && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Velocidade = Distância ÷ Tempo de voo
            </span>
          </div>

          {/* Distance */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Distância da prova (km)
            </label>
            <input
              type="number"
              step="0.01"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full px-4 py-4 bg-white text-[#0b1120] text-2xl font-black text-center rounded-xl border-0 focus:ring-2 focus:ring-yellow-500"
              placeholder="300"
            />
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" />
                Hora da soltura
              </label>
              <input
                type="time"
                value={releaseTime}
                onChange={(e) => setReleaseTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold rounded-xl border border-[#2a3a4a] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5" />
                Hora da chegada
              </label>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold rounded-xl border border-[#2a3a4a] focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="mt-5">
              <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 font-semibold">
                    Tempo de voo: <span className="text-white font-bold">{formatTime(result.totalMinutes)}</span> ({Math.round(result.totalMinutes)} min)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a2736] rounded-xl p-4 text-center border border-[#2a3a4a]">
                    <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mb-1">m/min</p>
                    <p className="text-4xl font-black text-white">{result.mPerMin.toFixed(3).replace(".", ",")}</p>
                    <p className="text-[10px] text-slate-500 mt-1">metros por minuto</p>
                  </div>
                  <div className="bg-[#1a2736] rounded-xl p-4 text-center border border-[#2a3a4a]">
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider mb-1">km/h</p>
                    <p className="text-4xl font-black text-white">{result.kmh.toFixed(1).replace(".", ",")}</p>
                    <p className="text-[10px] text-slate-500 mt-1">quilômetros por hora</p>
                  </div>
                </div>
                {cls && (
                  <div className="text-center mt-4">
                    <span className={`text-lg font-black ${cls.color}`}>
                      {cls.emoji} {cls.label}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleCalc}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-bold text-sm transition-colors"
          >
            Calcular Velocidade
          </button>
        </div>
      )}

      {/* ─── Time Mode ─── */}
      {mode === "time" && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Tempo = Distância ÷ Velocidade
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Distância (km)</label>
              <input type="number" value={distTime} onChange={(e) => setDistTime(e.target.value)} placeholder="300" className="w-full px-4 py-4 bg-white text-[#0b1120] text-2xl font-black text-center rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Velocidade (m/min)</label>
              <input type="number" value={speedForTime} onChange={(e) => setSpeedForTime(e.target.value)} placeholder="1200" className="w-full px-4 py-4 bg-white text-[#0b1120] text-2xl font-black text-center rounded-xl" />
            </div>
          </div>
          {result && (
            <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-slate-400 mb-2">Tempo estimado de voo</p>
              <p className="text-4xl font-black text-emerald-400">{formatTime(result.totalMinutes)}</p>
              <p className="text-sm text-slate-500 mt-1">{Math.round(result.totalMinutes)} minutos</p>
            </div>
          )}
          <button onClick={handleCalc} className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-bold text-sm transition-colors">
            Calcular Tempo
          </button>
        </div>
      )}

      {/* ─── Distance Mode ─── */}
      {mode === "distance" && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Distância = Velocidade × Tempo
            </span>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Velocidade (m/min)</label>
            <input type="number" value={speedForDist} onChange={(e) => setSpeedForDist(e.target.value)} placeholder="1200" className="w-full px-4 py-4 bg-white text-[#0b1120] text-2xl font-black text-center rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Horas</label>
              <input type="number" value={hoursForDist} onChange={(e) => setHoursForDist(e.target.value)} placeholder="2" className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold text-center rounded-xl border border-[#2a3a4a]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Minutos</label>
              <input type="number" value={minsForDist} onChange={(e) => setMinsForDist(e.target.value)} placeholder="45" className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold text-center rounded-xl border border-[#2a3a4a]" />
            </div>
          </div>
          {result && (
            <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4 mb-4 text-center">
              <p className="text-xs text-slate-400 mb-2">Distância calculada</p>
              <p className="text-4xl font-black text-blue-400">{result.distKm.toFixed(2)} km</p>
            </div>
          )}
          <button onClick={handleCalc} className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-bold text-sm transition-colors">
            Calcular Distância
          </button>
        </div>
      )}

      {/* ─── Classification Table ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Tabela de Referência de Velocidade</span>
        </div>

        <div className="space-y-2">
          {classifications.map((c, i) => {
            const rangeText = c.max === 9999 ? `> ${c.min} m/min` : `${c.min}–${c.max}`;
            const kmhMin = mpmToKmh(c.min).toFixed(0);
            const kmhMax = c.max === 9999 ? `> ${kmhMin}` : `${kmhMin}–${mpmToKmh(c.max).toFixed(0)}`;
            const isActive = result && result.mPerMin >= c.min && result.mPerMin <= c.max;
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all ${
                  isActive ? `${c.bg}/20 border border-current` : "bg-[#0b1120]"
                } ${c.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2 py-0.5 rounded ${c.bg} text-[#0b1120]`}>
                    {c.max === 9999 ? `> ${c.min}` : `${c.min}–${c.max}`}
                  </span>
                  <span className="text-xs text-slate-400">{kmhMax} km/h</span>
                </div>
                <span className={`text-xs font-bold ${c.color}`}>
                  {c.emoji} {c.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-slate-600 mt-4 leading-relaxed">
          * Referências para pombos-correio em provas regulares. Vento e clima afetam significativamente.
        </p>
      </div>

      {/* ─── Quick Converter ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <ArrowRightLeft className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Conversor Rápido m/min ↔ km/h</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">m / min</label>
            <input
              type="number"
              value={convMpm}
              onChange={(e) => setConvMpm(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold text-center rounded-xl border border-[#2a3a4a] focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            onClick={() => { swapConv(); handleConvert(); }}
            className="mt-5 p-2 bg-[#2a3a4a] hover:bg-[#354a5e] rounded-lg transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
          </button>
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1.5">km / h</label>
            <input
              type="number"
              value={convKmh}
              onChange={(e) => setConvKmh(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1120] text-white text-lg font-bold text-center rounded-xl border border-[#2a3a4a] focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-3 text-center">
          Fórmula: km/h × 1000 ÷ 60 = m/min | m/min × 60 ÷ 1000 = km/h
        </p>
      </div>
    </div>
  );
}
