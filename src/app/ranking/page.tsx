"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trophy, TrendingUp, ChevronDown, ChevronUp, Target, Zap, Medal } from "lucide-react";

interface RankEntry {
  pigeonId: number;
  ringNumber: string;
  name: string | null;
  sex: string;
  status: string;
  races: number;
  arrived: number;
  points: number;
  avgSpeed: number;
  bestSpeed: number;
  bestPosition: number | null;
  podiums: number;
  wins: number;
  totalKm: number;
  arrivalRate: number;
  resultsList: {
    competitionName: string | null;
    date: string | null;
    distance: string | null;
    type: string | null;
    position: number | null;
    speed: string | null;
    points: string | null;
    arrived: boolean;
  }[];
}

function medalFor(idx: number): string {
  if (idx === 0) return "🥇";
  if (idx === 1) return "🥈";
  if (idx === 2) return "🥉";
  return `${idx + 1}º`;
}

function fmtNum(v: number, d = 0): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR");
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"points" | "speed" | "podiums">("points");

  const fetchRanking = useCallback(async () => {
    const res = await fetch("/api/ranking");
    const data = await res.json();
    setRanking(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRanking(); }, [fetchRanking]);

  const sorted = [...ranking].sort((a, b) => {
    if (sortBy === "speed") return b.avgSpeed - a.avgSpeed;
    if (sortBy === "podiums") return b.podiums - a.podiums || b.wins - a.wins;
    return b.points - a.points || b.avgSpeed - a.avgSpeed;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-extrabold text-white">Ranking do Plantel</h1>
        </div>
        <p className="text-sm text-slate-400">Classificação da temporada por resultados em provas</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { id: "points" as const, label: "🏆 Pontos" },
          { id: "speed" as const, label: "⚡ Velocidade" },
          { id: "podiums" as const, label: "🥇 Pódios" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSortBy(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              sortBy === tab.id
                ? "bg-yellow-500 text-[#0b1120]"
                : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-12 text-center">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">Nenhum resultado registrado ainda</p>
          <p className="text-xs text-slate-600">Registre resultados de provas para gerar o ranking</p>
        </div>
      ) : (
        <>
          {/* ─── Podium Top 3 ─── */}
          {sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-3 mb-6 items-end">
              {/* 2nd */}
              <div className="bg-[#1a2736] border border-slate-400/30 rounded-2xl p-4 text-center">
                <span className="text-3xl block mb-1">🥈</span>
                <p className="text-sm font-black text-white truncate">{sorted[1].name || sorted[1].ringNumber}</p>
                <p className="text-[10px] text-slate-500 mb-1">{sorted[1].ringNumber}</p>
                <p className="text-lg font-black text-slate-300">{fmtNum(sorted[1].points)} pts</p>
              </div>
              {/* 1st */}
              <div className="bg-gradient-to-b from-yellow-500/15 to-[#1a2736] border-2 border-yellow-500/50 rounded-2xl p-5 text-center">
                <span className="text-4xl block mb-1">🥇</span>
                <p className="text-base font-black text-yellow-400 truncate">{sorted[0].name || sorted[0].ringNumber}</p>
                <p className="text-[10px] text-slate-500 mb-1">{sorted[0].ringNumber}</p>
                <p className="text-2xl font-black text-yellow-400">{fmtNum(sorted[0].points)} pts</p>
                <p className="text-[10px] text-slate-400 mt-1">{fmtNum(sorted[0].avgSpeed, 0)} m/min média</p>
              </div>
              {/* 3rd */}
              <div className="bg-[#1a2736] border border-orange-500/30 rounded-2xl p-4 text-center">
                <span className="text-3xl block mb-1">🥉</span>
                <p className="text-sm font-black text-white truncate">{sorted[2].name || sorted[2].ringNumber}</p>
                <p className="text-[10px] text-slate-500 mb-1">{sorted[2].ringNumber}</p>
                <p className="text-lg font-black text-orange-400">{fmtNum(sorted[2].points)} pts</p>
              </div>
            </div>
          )}

          {/* ─── Full list ─── */}
          <div className="space-y-2.5">
            {sorted.map((entry, idx) => {
              const isExpanded = expandedId === entry.pigeonId;
              const isTop3 = idx < 3;
              return (
                <div
                  key={entry.pigeonId}
                  className={`bg-[#1a2736] border rounded-xl overflow-hidden transition-all ${
                    isTop3 ? "border-yellow-500/30" : "border-[#2a3a4a]"
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.pigeonId)}
                    className="w-full text-left p-4 flex items-center gap-3"
                  >
                    {/* Position */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 ${
                      idx === 0 ? "bg-yellow-500/20 text-yellow-400" : idx === 1 ? "bg-slate-400/20 text-slate-300" : idx === 2 ? "bg-orange-500/20 text-orange-400" : "bg-[#0b1120] text-slate-500"
                    }`}>
                      {medalFor(idx)}
                    </div>

                    {/* Pigeon info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-white truncate">
                          {entry.name || entry.ringNumber}
                        </p>
                        <span className={`text-xs ${entry.sex === "macho" ? "text-sky-400" : entry.sex === "femea" ? "text-pink-400" : "text-slate-500"}`}>
                          {entry.sex === "macho" ? "♂" : entry.sex === "femea" ? "♀" : ""}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {entry.ringNumber} • {entry.races} prova(s) • {fmtNum(entry.arrivalRate, 0)}% chegada
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right shrink-0 mr-1">
                      <p className="text-base font-black text-yellow-400">{fmtNum(entry.points)} pts</p>
                      <p className="text-[10px] text-slate-500">{fmtNum(entry.avgSpeed, 0)} m/min</p>
                    </div>

                    {/* Badges */}
                    <div className="hidden md:flex items-center gap-1.5 shrink-0">
                      {entry.wins > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 rounded text-[10px] font-black">
                          🥇×{entry.wins}
                        </span>
                      )}
                      {entry.podiums > 0 && (
                        <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 rounded text-[10px] font-black">
                          Pódios: {entry.podiums}
                        </span>
                      )}
                    </div>

                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>

                  {/* Expanded: race history */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#2a3a4a] pt-4">
                      {/* Stats grid */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Provas</p>
                          <p className="text-sm font-black text-white">{entry.races}</p>
                        </div>
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Vitórias</p>
                          <p className="text-sm font-black text-yellow-400">{entry.wins}</p>
                        </div>
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Pódios</p>
                          <p className="text-sm font-black text-orange-400">{entry.podiums}</p>
                        </div>
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Melhor Pos.</p>
                          <p className="text-sm font-black text-emerald-400">{entry.bestPosition ? `${entry.bestPosition}º` : "—"}</p>
                        </div>
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Vel. Máx</p>
                          <p className="text-sm font-black text-blue-400">{fmtNum(entry.bestSpeed, 0)}</p>
                        </div>
                        <div className="bg-[#0b1120] rounded-lg p-2.5 text-center">
                          <p className="text-[9px] text-slate-500 uppercase">Km voados</p>
                          <p className="text-sm font-black text-violet-400">{fmtNum(entry.totalKm, 0)}</p>
                        </div>
                      </div>

                      {/* Race history */}
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">Histórico de Provas</p>
                      <div className="space-y-1.5">
                        {entry.resultsList.map((r, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#0b1120] rounded-lg text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`shrink-0 w-7 text-center font-black ${
                                r.position === 1 ? "text-yellow-400" : r.position && r.position <= 3 ? "text-orange-400" : "text-slate-500"
                              }`}>
                                {r.position ? `${r.position}º` : r.arrived ? "✓" : "✗"}
                              </span>
                              <span className="text-slate-300 truncate">{r.competitionName || "—"}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 text-slate-500">
                              <span>{r.distance ? `${Math.round(parseFloat(r.distance))}km` : ""}</span>
                              <span className="text-blue-400 font-semibold">{r.speed ? `${fmtNum(parseFloat(r.speed), 0)} m/min` : ""}</span>
                              <span>{fmtDate(r.date)}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={`/pombos/${entry.pigeonId}`}
                        className="inline-block mt-3 text-xs font-bold text-yellow-400 hover:text-yellow-300"
                      >
                        Ver ficha completa do pombo →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo Ranking • Temporada
      </p>
    </div>
  );
}
