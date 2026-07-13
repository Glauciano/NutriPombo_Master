"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Zap,
  Flame,
  Target,
  Rocket,
  ChevronRight,
  AlertTriangle,
  CheckSquare,
  MapPin,
  CloudSun,
  Flag,
  ClipboardList,
} from "lucide-react";

/* ────────── types ────────── */
interface Competition {
  id: number;
  orderNumber: number | null;
  name: string;
  club: string | null;
  date: string;
  arrivalDate: string | null;
  type: string;
  distance: string | null;
  status: string;
}

/* ────────── helpers ────────── */
function daysUntil(d: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d + "T12:00:00");
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function fmtWeekday(d: string | null) {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  const weekday = dt.toLocaleDateString("pt-BR", { weekday: "long" });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const day = String(dt.getDate()).padStart(2, "0");
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const year = dt.getFullYear();
  return `${cap} ${day}/${month}/${year}`;
}

function fmtShortDate(d: string | null) {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  const day = String(dt.getDate()).padStart(2, "0");
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const year = dt.getFullYear();
  return `${day}/${month}/${year}`;
}

function typeLabel(type: string) {
  const map: Record<string, string> = {
    velocidade: "Velocidade",
    meio_fundo: "Meio Fundo",
    fundo: "Fundo",
    ultra_fundo: "Ultra Fundo",
  };
  return map[type] || type;
}

function typeColor(type: string) {
  const map: Record<string, string> = {
    velocidade: "text-yellow-400",
    meio_fundo: "text-orange-400",
    fundo: "text-red-400",
    ultra_fundo: "text-purple-400",
  };
  return map[type] || "text-slate-400";
}

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const cn = className || "w-4 h-4";
  switch (type) {
    case "velocidade":
      return <Zap className={cn} />;
    case "meio_fundo":
      return <Flame className={cn} />;
    case "fundo":
      return <Target className={cn} />;
    case "ultra_fundo":
      return <Rocket className={cn} />;
    default:
      return <Zap className={cn} />;
  }
}

/* ────────── page ────────── */
export default function CentroDeProvasPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompetitions = useCallback(async () => {
    const res = await fetch("/api/competitions");
    const data = await res.json();
    setCompetitions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  /* derived */
  const total = competitions.length;
  const realizadas = competitions.filter((c) => c.status === "realizada").length;
  const restantes = total - realizadas;

  /* next upcoming race */
  const upcoming = competitions
    .filter((c) => c.status === "agendada")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextRace = upcoming[0] || null;
  const nextDays = nextRace ? daysUntil(typeof nextRace.date === "string" ? nextRace.date.slice(0, 10) : "") : null;

  /* season progress */
  const sortedDates = competitions
    .map((c) => (typeof c.date === "string" ? c.date.slice(0, 10) : ""))
    .filter(Boolean)
    .sort();
  const seasonStart = sortedDates[0] || "";
  const seasonEnd = sortedDates[sortedDates.length - 1] || "";
  const progressPct = total > 0 ? Math.round((realizadas / total) * 100) : 0;

  /* protocol text */
  function protocolText(days: number | null) {
    if (days === null) return "";
    if (days <= 0) return "Dia da prova — boa sorte!";
    if (days <= 3) return `${days} dias — protocolo de carga final.`;
    if (days <= 7) return `${days} dias — iniciar protocolo.`;
    if (days <= 14) return `${days} dias — preparação intermediária.`;
    return `${days} dias — planejamento inicial.`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🏁</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Centro de Provas
          </h1>
        </div>
        <p className="text-sm text-slate-400 ml-12">
          Calendário • Mapa • Clima integrados
        </p>
      </div>

      {/* ─── Próxima Prova (hero card) ─── */}
      {nextRace && (
        <div className="mb-6 bg-[#1a2736] border-2 border-yellow-500/50 rounded-2xl overflow-hidden">
          <div className="p-5 md:p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    Próxima Prova
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white mb-1">
                  #{nextRace.orderNumber} {nextRace.name}
                </h2>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className={`flex items-center gap-1 font-semibold ${typeColor(nextRace.type)}`}>
                    <TypeIcon type={nextRace.type} />
                    {typeLabel(nextRace.type)}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-medium">
                    {nextRace.distance ? `${Math.round(parseFloat(nextRace.distance))}km` : "—"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    {fmtWeekday(typeof nextRace.arrivalDate === "string" ? nextRace.arrivalDate.slice(0, 10) : typeof nextRace.date === "string" ? nextRace.date.slice(0, 10) : null)}
                  </span>
                </div>
              </div>

              {/* days counter */}
              <div className="text-right ml-4 shrink-0">
                <p className="text-5xl md:text-6xl font-black text-yellow-500 leading-none">
                  {nextDays !== null && nextDays >= 0 ? nextDays : 0}
                </p>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
                  dias
                </p>
              </div>
            </div>

            {/* protocol alert */}
            {nextDays !== null && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-300 font-medium">
                  {protocolText(nextDays)}
                </p>
              </div>
            )}

            {/* CTA button */}
            <Link
              href="/provas/calendario"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-bold text-sm transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              Ver Protocolo Completo →
            </Link>
          </div>
        </div>
      )}

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🏴</span>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Provas 2026
            </span>
          </div>
          <p className="text-4xl font-black text-blue-400">{total}</p>
          <p className="text-xs text-slate-500 mt-1">{realizadas} realizadas</p>
        </div>
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Realizadas
            </span>
          </div>
          <p className="text-4xl font-black text-emerald-400">{realizadas}</p>
          <p className="text-xs text-slate-500 mt-1">{restantes} restantes</p>
        </div>
      </div>

      {/* ─── Season Progress Bar ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-bold text-white">Temporada 2026</span>
          </div>
          <span className="text-sm font-bold text-yellow-400">{realizadas}/{total}</span>
        </div>
        <div className="w-full bg-[#0b1120] rounded-full h-3 mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{fmtShortDate(seasonStart)}</span>
          <span>{fmtShortDate(seasonEnd)}</span>
        </div>
      </div>

      {/* ─── Quick Access Menu ─── */}
      <div className="space-y-3">
        {/* Calendário de Provas */}
        <Link
          href="/provas/calendario"
          className="group flex items-center bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl p-4 transition-all hover:bg-[#1e2f40]"
        >
          <div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center mr-4 shrink-0">
            <Calendar className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-yellow-400">Calendário de Provas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {total} provas — protocolo completo por prova
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0 ml-2" />
        </Link>

        {/* Calculadora de Velocidade */}
        <Link
          href="/provas/calculadora"
          className="group flex items-center bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl p-4 transition-all hover:bg-[#1e2f40]"
        >
          <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center mr-4 shrink-0">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-yellow-400">Calculadora de Velocidade</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calcule m/min, km/h, tempo e distância
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0 ml-2" />
        </Link>

        {/* Mapa de Solturas */}
        <Link
          href="/provas/mapa"
          className="group flex items-center bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl p-4 transition-all hover:bg-[#1e2f40]"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center mr-4 shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-yellow-400">Mapa de Solturas</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cidades do calendário com estacas e velocidades
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0 ml-2" />
        </Link>

        {/* Previsão do Tempo */}
        <Link
          href="/provas/clima"
          className="group flex items-center bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl p-4 transition-all hover:bg-[#1e2f40]"
        >
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center mr-4 shrink-0">
            <CloudSun className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-yellow-400">Previsão do Tempo</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clima real das cidades de soltura
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-yellow-400 transition-colors shrink-0 ml-2" />
        </Link>
      </div>
    </div>
  );
}
