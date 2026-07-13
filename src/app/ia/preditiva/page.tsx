"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Brain, Trophy, Wind, TrendingUp, Zap, AlertTriangle, CheckCircle } from "lucide-react";

interface RankEntry {
  pigeonId: number;
  ringNumber: string;
  name: string | null;
  sex: string;
  status: string;
  races: number;
  points: number;
  avgSpeed: number;
  bestSpeed: number;
  podiums: number;
  wins: number;
  arrivalRate: number;
  totalKm: number;
}

interface Competition {
  id: number;
  orderNumber: number | null;
  name: string;
  date: string;
  type: string;
  distance: string | null;
  status: string;
}

interface Weather {
  temp: number;
  windSpeed: number;
  windDir: string;
  humidity: number;
  rain: number;
  description: string;
}

interface Prediction {
  entry: RankEntry;
  score: number;
  factors: { label: string; impact: number; note: string }[];
}

export default function IAPreditvaPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [nextComp, setNextComp] = useState<Competition | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [rRes, cRes] = await Promise.all([fetch("/api/ranking"), fetch("/api/competitions")]);
    const rData = await rRes.json();
    const cData: Competition[] = await cRes.json();
    setRanking(rData);
    const upcoming = cData
      .filter((c) => c.status === "agendada")
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
    setNextComp(upcoming);

    if (upcoming) {
      const city = upcoming.name.replace(/\s*—.*$/, "").trim();
      try {
        const wRes = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        if (wRes.ok) {
          const w = await wRes.json();
          if (!w.error) setWeather(w);
        }
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* prediction algorithm */
  function predict(): Prediction[] {
    const active = ranking.filter((r) => r.status === "ativo" && r.races > 0);
    if (active.length === 0) return [];

    const maxPoints = Math.max(...active.map((r) => r.points), 1);
    const maxSpeed = Math.max(...active.map((r) => r.avgSpeed), 1);
    const dist = nextComp?.distance ? parseFloat(nextComp.distance) : 300;

    return active.map((entry) => {
      const factors: { label: string; impact: number; note: string }[] = [];

      /* form: points relative */
      const formScore = (entry.points / maxPoints) * 35;
      factors.push({ label: "Forma (pontos)", impact: Math.round(formScore), note: `${entry.points} pts na temporada` });

      /* speed */
      const speedScore = (entry.avgSpeed / maxSpeed) * 25;
      factors.push({ label: "Velocidade média", impact: Math.round(speedScore), note: `${Math.round(entry.avgSpeed)} m/min` });

      /* regularity */
      const regScore = (entry.arrivalRate / 100) * 20;
      factors.push({ label: "Regularidade", impact: Math.round(regScore), note: `${Math.round(entry.arrivalRate)}% de chegadas` });

      /* experience with distance */
      const kmPerRace = entry.races > 0 ? entry.totalKm / entry.races : 0;
      const distMatch = kmPerRace > 0 ? Math.max(0, 10 - Math.abs(kmPerRace - dist) / 50) : 5;
      factors.push({ label: "Experiência na distância", impact: Math.round(distMatch), note: `média ${Math.round(kmPerRace)}km/prova vs ${Math.round(dist)}km` });

      /* weather adjustment */
      let weatherScore = 10;
      let weatherNote = "clima neutro";
      if (weather) {
        if (weather.windSpeed > 20) { weatherScore -= 4; weatherNote = "vento forte penaliza"; }
        if (weather.rain > 0) { weatherScore -= 3; weatherNote = "chuva prevista"; }
        if (weather.temp > 32) { weatherScore -= 2; weatherNote = "calor extremo"; }
        if (weather.windSpeed <= 12 && weather.rain === 0) { weatherNote = "condições favoráveis"; }
      }
      factors.push({ label: "Fator clima", impact: Math.round(weatherScore), note: weatherNote });

      const score = Math.min(99, Math.round(formScore + speedScore + regScore + distMatch + weatherScore));

      return { entry, score, factors };
    }).sort((a, b) => b.score - a.score);
  }

  const predictions = predict();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <Link href="/ia" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl font-extrabold text-white">IA Preditiva</h1>
        </div>
        <p className="text-sm text-slate-400">Previsão de desempenho para a próxima prova</p>
      </div>

      {/* Next competition + weather context */}
      {nextComp ? (
        <div className="bg-[#1a2736] border-2 border-violet-500/40 rounded-2xl p-5 mb-5">
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">🎯 Analisando</p>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-black text-white">#{nextComp.orderNumber} {nextComp.name}</h2>
              <p className="text-xs text-slate-400">
                {nextComp.distance ? `${Math.round(parseFloat(nextComp.distance))}km` : ""} • {nextComp.type.replace("_", " ")} • {new Date(nextComp.date.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            {weather && (
              <div className="flex items-center gap-3 text-xs bg-[#0b1120] rounded-xl px-4 py-2.5">
                <span className="text-orange-400 font-bold">{weather.temp}°C</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Wind className="w-3 h-3" /> {weather.windDir} {weather.windSpeed}km/h
                </span>
                <span className="text-blue-400">{weather.humidity}%</span>
                <span className="text-slate-400 capitalize">{weather.description}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-8 text-center mb-5">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">Nenhuma prova agendada — previsões baseadas apenas na forma</p>
        </div>
      )}

      {/* Predictions */}
      {predictions.length === 0 ? (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-12 text-center">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Sem dados suficientes. Registre resultados de provas primeiro.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Probabilidade de bom desempenho — {predictions.length} atleta(s) analisado(s)
          </p>
          {predictions.map((pred, idx) => (
            <details key={pred.entry.pigeonId} className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl overflow-hidden group">
              <summary className="p-4 cursor-pointer list-none flex items-center gap-3">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                  idx === 0 ? "bg-violet-500/20 text-violet-300" : "bg-[#0b1120] text-slate-500"
                }`}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">
                    {pred.entry.name || pred.entry.ringNumber}
                    {idx === 0 && <span className="ml-2 text-[9px] px-2 py-0.5 bg-violet-500 text-white rounded font-black uppercase">Favorito</span>}
                  </p>
                  <p className="text-[10px] text-slate-500">{pred.entry.ringNumber} • {pred.entry.races} provas</p>
                </div>
                {/* score bar */}
                <div className="w-32 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-lg font-black ${
                      pred.score >= 75 ? "text-emerald-400" : pred.score >= 50 ? "text-yellow-400" : "text-orange-400"
                    }`}>
                      {pred.score}%
                    </span>
                  </div>
                  <div className="w-full bg-[#0b1120] rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pred.score >= 75 ? "bg-emerald-500" : pred.score >= 50 ? "bg-yellow-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${pred.score}%` }}
                    />
                  </div>
                </div>
              </summary>
              {/* factors breakdown */}
              <div className="px-4 pb-4 border-t border-[#2a3a4a] pt-3">
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">Fatores da previsão</p>
                <div className="space-y-1.5">
                  {pred.factors.map((f, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#0b1120] rounded-lg text-xs">
                      <span className="text-slate-300">{f.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px]">{f.note}</span>
                        <span className="font-black text-violet-400 w-8 text-right">+{f.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}

          <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 flex items-start gap-3">
            <Brain className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-violet-300/80">
              O modelo pondera: forma na temporada (35%), velocidade média (25%), regularidade (20%), experiência na distância (10%) e clima em tempo real (10%). Quanto mais provas registradas, mais precisa a previsão.
            </p>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • IA Preditiva</p>
    </div>
  );
}
