"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Crown, Zap, Target, Medal, TrendingUp, Star, Award } from "lucide-react";

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
}

function fmtNum(v: number, d = 0): string {
  return v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
}

interface Record_ {
  title: string;
  emoji: string;
  holder: RankEntry | null;
  value: string;
  color: string;
  border: string;
}

export default function HallDaFamaPage() {
  const [ranking, setRanking] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async () => {
    const res = await fetch("/api/ranking");
    const data = await res.json();
    setRanking(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRanking(); }, [fetchRanking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const withRaces = ranking.filter((r) => r.races > 0);

  /* records */
  const bySpeed = [...withRaces].sort((a, b) => b.bestSpeed - a.bestSpeed);
  const byWins = [...withRaces].sort((a, b) => b.wins - a.wins);
  const byPodiums = [...withRaces].sort((a, b) => b.podiums - a.podiums);
  const byKm = [...withRaces].sort((a, b) => b.totalKm - a.totalKm);
  const byRegularity = [...withRaces].filter((r) => r.races >= 2).sort((a, b) => b.arrivalRate - a.arrivalRate);
  const byPoints = [...withRaces].sort((a, b) => b.points - a.points);

  const records: Record_[] = [
    {
      title: "Campeão de Pontos",
      emoji: "👑",
      holder: byPoints[0] || null,
      value: byPoints[0] ? `${fmtNum(byPoints[0].points)} pts` : "—",
      color: "text-yellow-400",
      border: "border-yellow-500/40",
    },
    {
      title: "Recorde de Velocidade",
      emoji: "⚡",
      holder: bySpeed[0] || null,
      value: bySpeed[0] ? `${fmtNum(bySpeed[0].bestSpeed)} m/min` : "—",
      color: "text-blue-400",
      border: "border-blue-500/40",
    },
    {
      title: "Mais Vitórias",
      emoji: "🥇",
      holder: byWins[0] && byWins[0].wins > 0 ? byWins[0] : null,
      value: byWins[0]?.wins ? `${byWins[0].wins} vitória(s)` : "—",
      color: "text-amber-400",
      border: "border-amber-500/40",
    },
    {
      title: "Mais Pódios",
      emoji: "🏅",
      holder: byPodiums[0] && byPodiums[0].podiums > 0 ? byPodiums[0] : null,
      value: byPodiums[0]?.podiums ? `${byPodiums[0].podiums} pódio(s)` : "—",
      color: "text-orange-400",
      border: "border-orange-500/40",
    },
    {
      title: "Maratonista (km voados)",
      emoji: "🛫",
      holder: byKm[0] || null,
      value: byKm[0] ? `${fmtNum(byKm[0].totalKm)} km` : "—",
      color: "text-violet-400",
      border: "border-violet-500/40",
    },
    {
      title: "Mais Regular",
      emoji: "🎯",
      holder: byRegularity[0] || null,
      value: byRegularity[0] ? `${fmtNum(byRegularity[0].arrivalRate)}% chegadas` : "—",
      color: "text-emerald-400",
      border: "border-emerald-500/40",
    },
  ];

  /* legends: pigeons with 2+ wins or 4+ podiums or 500+ km */
  const legends = withRaces.filter((r) => r.wins >= 2 || r.podiums >= 4 || r.totalKm >= 1000);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-block mb-2">
          <span className="text-5xl">🏛️</span>
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 mb-1">
          Hall da Fama
        </h1>
        <p className="text-sm text-slate-400">Os maiores campeões do seu pombal</p>
      </div>

      {withRaces.length === 0 ? (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-12 text-center">
          <Crown className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-1">O Hall da Fama aguarda seus campeões</p>
          <p className="text-xs text-slate-600">Registre resultados de provas para imortalizar seus pombos aqui</p>
        </div>
      ) : (
        <>
          {/* ─── GOAT (best overall) ─── */}
          {byPoints[0] && (
            <div className="relative bg-gradient-to-b from-yellow-500/20 via-[#1a2736] to-[#1a2736] border-2 border-yellow-500/60 rounded-3xl p-8 mb-6 text-center overflow-hidden">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-black text-yellow-500 uppercase tracking-[0.3em]">
                ★ Melhor do Plantel ★
              </div>
              <span className="text-6xl block mb-3 mt-4">👑</span>
              <h2 className="text-2xl font-black text-yellow-400 mb-0.5">
                {byPoints[0].name || byPoints[0].ringNumber}
              </h2>
              <p className="text-xs text-slate-500 mb-4">{byPoints[0].ringNumber}</p>
              <div className="flex items-center justify-center gap-6">
                <div>
                  <p className="text-2xl font-black text-white">{fmtNum(byPoints[0].points)}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Pontos</p>
                </div>
                <div className="w-px h-8 bg-yellow-500/30" />
                <div>
                  <p className="text-2xl font-black text-white">{byPoints[0].wins}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Vitórias</p>
                </div>
                <div className="w-px h-8 bg-yellow-500/30" />
                <div>
                  <p className="text-2xl font-black text-white">{byPoints[0].podiums}</p>
                  <p className="text-[10px] text-slate-500 uppercase">Pódios</p>
                </div>
                <div className="w-px h-8 bg-yellow-500/30" />
                <div>
                  <p className="text-2xl font-black text-white">{fmtNum(byPoints[0].avgSpeed)}</p>
                  <p className="text-[10px] text-slate-500 uppercase">m/min méd</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Records grid ─── */}
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Recordes do Pombal</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {records.map((rec) => (
              <div key={rec.title} className={`bg-[#1a2736] border ${rec.border} rounded-2xl p-4 flex items-center gap-4`}>
                <div className="w-12 h-12 rounded-2xl bg-[#0b1120] flex items-center justify-center text-2xl shrink-0">
                  {rec.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{rec.title}</p>
                  {rec.holder ? (
                    <>
                      <p className="text-sm font-black text-white truncate">
                        {rec.holder.name || rec.holder.ringNumber}
                      </p>
                      <p className={`text-base font-black ${rec.color}`}>{rec.value}</p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-600">Ainda sem detentor</p>
                  )}
                </div>
                {rec.holder && (
                  <Link
                    href={`/pombos/${rec.holder.pigeonId}`}
                    className="text-[10px] font-bold text-slate-500 hover:text-yellow-400 shrink-0"
                  >
                    Ficha →
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* ─── Legends ─── */}
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Lendas do Pombal {legends.length > 0 && `(${legends.length})`}
            </span>
          </div>
          {legends.length === 0 ? (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-8 text-center mb-6">
              <Star className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Para virar lenda: 2+ vitórias, 4+ pódios ou 1.000+ km voados
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 mb-6">
              {legends.map((legend) => (
                <Link
                  key={legend.pigeonId}
                  href={`/pombos/${legend.pigeonId}`}
                  className="flex items-center gap-3 bg-[#1a2736] border border-yellow-500/20 hover:border-yellow-500/50 rounded-xl p-4 transition-all"
                >
                  <span className="text-2xl shrink-0">⭐</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">
                      {legend.name || legend.ringNumber}
                      <span className={`ml-2 text-xs ${legend.sex === "macho" ? "text-sky-400" : "text-pink-400"}`}>
                        {legend.sex === "macho" ? "♂" : legend.sex === "femea" ? "♀" : ""}
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {legend.ringNumber} • {legend.races} provas • {fmtNum(legend.totalKm)} km na carreira
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {legend.wins > 0 && (
                      <span className="px-2 py-1 bg-yellow-500/15 text-yellow-400 rounded-lg text-[10px] font-black">
                        🥇 {legend.wins}
                      </span>
                    )}
                    {legend.podiums > 0 && (
                      <span className="px-2 py-1 bg-orange-500/15 text-orange-400 rounded-lg text-[10px] font-black">
                        🏅 {legend.podiums}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* link to ranking */}
          <Link
            href="/ranking"
            className="block w-full py-3.5 bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl text-center text-sm font-bold text-slate-300 hover:text-yellow-400 transition-all"
          >
            🏆 Ver Ranking Completo da Temporada →
          </Link>
        </>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Hall da Fama • Imortais
      </p>
    </div>
  );
}
