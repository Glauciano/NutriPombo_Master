"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Zap,
  Flame,
  Target,
  Rocket,
  Navigation,
  Home,
  CheckCircle,
  Circle,
  Flag,
} from "lucide-react";

interface Competition {
  id: number;
  orderNumber: number | null;
  name: string;
  date: string;
  type: string;
  distance: string | null;
  status: string;
  liberationPoint: string | null;
}

function typeLabel(type: string) {
  const map: Record<string, string> = { velocidade: "Velocidade", meio_fundo: "Meio Fundo", fundo: "Fundo", ultra_fundo: "Ultra Fundo" };
  return map[type] || type;
}

function typeColors(type: string) {
  const map: Record<string, { dot: string; text: string; ring: string }> = {
    velocidade: { dot: "bg-yellow-500", text: "text-yellow-400", ring: "ring-yellow-500/40" },
    meio_fundo: { dot: "bg-orange-500", text: "text-orange-400", ring: "ring-orange-500/40" },
    fundo: { dot: "bg-red-500", text: "text-red-400", ring: "ring-red-500/40" },
    ultra_fundo: { dot: "bg-purple-500", text: "text-purple-400", ring: "ring-purple-500/40" },
  };
  return map[type] || { dot: "bg-slate-500", text: "text-slate-400", ring: "ring-slate-500/40" };
}

function TypeIcon({ type }: { type: string }) {
  const cn = "w-3.5 h-3.5";
  switch (type) {
    case "velocidade": return <Zap className={cn} />;
    case "meio_fundo": return <Flame className={cn} />;
    case "fundo": return <Target className={cn} />;
    case "ultra_fundo": return <Rocket className={cn} />;
    default: return <Zap className={cn} />;
  }
}

function getState(name: string): string {
  const match = name.match(/—\s*(\w{2})\s*$/);
  return match ? match[1] : "";
}

export default function MapaSolturasPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompetitions = useCallback(async () => {
    const res = await fetch("/api/competitions");
    const data = await res.json();
    setCompetitions(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCompetitions(); }, [fetchCompetitions]);

  // Sort by distance ascending (closest first)
  const sorted = [...competitions].sort((a, b) =>
    parseFloat(a.distance || "0") - parseFloat(b.distance || "0")
  );
  // Reverse for visual (farthest at top, closest at bottom near pombal)
  const reversed = [...sorted].reverse();

  const nextUpcoming = sorted.find((c) => c.status === "agendada");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
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
          <MapPin className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-extrabold text-white">Mapa de Solturas</h1>
        </div>
        <p className="text-sm text-slate-400">Calendário 2026 — toque nos pontos para detalhes</p>
      </div>

      {/* ─── Linha de Solturas (horizontal icons) ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Flag className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Linha de Solturas 2026</span>
        </div>
        {/* Horizontal scroll of race markers */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {sorted.map((c, idx) => {
            const colors = typeColors(c.type);
            const isDone = c.status === "realizada";
            const isNext = c.id === nextUpcoming?.id;
            return (
              <div key={c.id} className="flex items-center shrink-0">
                <div className={`relative flex flex-col items-center`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white ${
                    isDone ? "bg-emerald-600" : isNext ? `${colors.dot} ring-4 ${colors.ring} animate-pulse` : colors.dot
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : c.orderNumber ?? idx + 1}
                  </div>
                </div>
                {idx < sorted.length - 1 && (
                  <div className={`w-3 h-0.5 ${isDone ? "bg-emerald-600" : "bg-[#2a3a4a]"}`} />
                )}
              </div>
            );
          })}
          {/* Pombal icon at end */}
          <div className="flex items-center shrink-0">
            <div className="w-3 h-0.5 bg-[#2a3a4a]" />
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-3">
          🏠 toque nos pontos para detalhes • Verdes = realizadas • Glow = próxima
        </p>
      </div>

      {/* ─── Vertical Route Map ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <Navigation className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Mapa Geográfico — Rota 2026</span>
        </div>

        {/* Background gradient for terrain feel */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          background: "linear-gradient(180deg, #1a4a1a 0%, #2a3a1a 30%, #3a3a1a 50%, #2a3a2a 100%)"
        }} />

        <div className="relative z-10">
          {/* vertical dashed line */}
          <div className="absolute left-[26px] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-emerald-600/40" />

          {reversed.map((c, idx) => {
            const colors = typeColors(c.type);
            const isDone = c.status === "realizada";
            const isNext = c.id === nextUpcoming?.id;
            const dist = parseFloat(c.distance || "0");
            const state = getState(c.name);
            const cityName = c.name.replace(/\s*—.*$/, "");

            return (
              <div key={c.id} className="flex items-start gap-4 mb-6 relative">
                {/* Dot */}
                <div className="shrink-0 relative z-10">
                  <div className={`w-[54px] h-[54px] rounded-full flex items-center justify-center font-black text-base text-white border-[3px] ${
                    isDone
                      ? "bg-emerald-600 border-emerald-400"
                      : isNext
                        ? `${colors.dot} border-white ring-4 ${colors.ring}`
                        : `${colors.dot} border-[#2a3a4a]`
                  }`}>
                    {isDone ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      c.orderNumber ?? competitions.length - idx
                    )}
                  </div>
                </div>
                {/* Info */}
                <div className="pt-2">
                  <h3 className={`text-base font-extrabold ${isNext ? "text-yellow-400" : "text-white"}`}>
                    {cityName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {dist > 0 ? `${Math.round(dist)}km` : "—"} — {state}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Pombal (home) at bottom */}
          <div className="flex items-start gap-4 relative">
            <div className="shrink-0 relative z-10">
              <div className="w-[54px] h-[54px] rounded-full bg-emerald-500 border-[3px] border-emerald-300 flex items-center justify-center ring-4 ring-emerald-500/30">
                <Home className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="pt-2">
              <h3 className="text-base font-extrabold text-emerald-400">SEU POMBAL</h3>
              <p className="text-xs text-slate-400 mt-0.5">Ponto de origem — 0km</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Legend ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          {[
            { label: "Velocidade", color: "bg-yellow-500" },
            { label: "Meio Fundo", color: "bg-orange-500" },
            { label: "Fundo", color: "bg-red-500" },
            { label: "Realizada", color: "bg-emerald-500" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${l.color}`} />
              <span className="text-xs text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600">
          🏠 toque nos pontos para detalhes a acesse o tempo da região
        </p>
      </div>
    </div>
  );
}
