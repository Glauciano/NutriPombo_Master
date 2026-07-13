"use client";

import { useEffect, useState } from "react";
import {
  Bird,
  Heart,
  Dna,
  Trophy,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Wind,
  Thermometer,
  Droplets,
  Moon,
  Activity,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalPigeons: number;
    males: number;
    females: number;
    chicks: number;
    widowers: number;
    breeders: number;
    athletes: number;
    retired: number;
    sick: number;
    inTreatment: number;
    deaths: number;
    monthBirths: number;
    activePairs: number;
    weekTrainings: number;
    avgSpeed: number;
    totalDistance: number;
    financialResult: number;
    expiringMeds: number;
    missingVaccines: number;
    missingRings: number;
    missingPigeons: number;
    unreadAlerts: number;
  };
  nextCompetition: {
    id: number;
    name: string;
    club: string;
    date: string;
    distance: string;
    type: string;
    liberationPoint: string;
  } | null;
  lastResults: Array<{
    id: number;
    position: number;
    speed: string;
    points: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const stats = data?.stats;

  const statCards = [
    { label: "Total de Pombos", value: stats?.totalPigeons ?? 0, icon: Bird, color: "bg-blue-500" },
    { label: "Machos", value: stats?.males ?? 0, icon: Bird, color: "bg-sky-500" },
    { label: "Fêmeas", value: stats?.females ?? 0, icon: Bird, color: "bg-pink-500" },
    { label: "Filhotes", value: stats?.chicks ?? 0, icon: Bird, color: "bg-amber-500" },
    { label: "Viúvos", value: stats?.widowers ?? 0, icon: Heart, color: "bg-rose-500" },
    { label: "Reprodutores", value: stats?.breeders ?? 0, icon: Dna, color: "bg-violet-500" },
    { label: "Atletas", value: stats?.athletes ?? 0, icon: Trophy, color: "bg-emerald-500" },
    { label: "Aposentados", value: stats?.retired ?? 0, icon: Clock, color: "bg-slate-500" },
  ];

  const alertCards = [
    { label: "Doentes", value: stats?.sick ?? 0, color: "text-red-600 bg-red-50" },
    { label: "Em Tratamento", value: stats?.inTreatment ?? 0, color: "text-orange-600 bg-orange-50" },
    { label: "Mortes", value: stats?.deaths ?? 0, color: "text-slate-600 bg-slate-100" },
    { label: "Nasc. Mês", value: stats?.monthBirths ?? 0, color: "text-emerald-600 bg-emerald-50" },
    { label: "Acasalamentos", value: stats?.activePairs ?? 0, color: "text-violet-600 bg-violet-50" },
    { label: "Treinos Sem.", value: stats?.weekTrainings ?? 0, color: "text-blue-600 bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Visão geral do seu plantel</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { href: "/provas", emoji: "🏁", label: "Centro de Provas", color: "hover:border-yellow-400" },
          { href: "/ranking", emoji: "🏆", label: "Ranking", color: "hover:border-yellow-400" },
          { href: "/hall-da-fama", emoji: "🏛️", label: "Hall da Fama", color: "hover:border-amber-400" },
          { href: "/ia/preditiva", emoji: "🤖", label: "IA Preditiva", color: "hover:border-violet-400" },
          { href: "/genealogia", emoji: "🧬", label: "Genealogia", color: "hover:border-violet-400" },
          { href: "/peso", emoji: "⚖️", label: "Controle de Peso", color: "hover:border-yellow-400" },
          { href: "/nutricao/cardapio", emoji: "🍽️", label: "Cardápio", color: "hover:border-emerald-400" },
          { href: "/saude/calendario", emoji: "💉", label: "Cal. Sanitário", color: "hover:border-red-400" },
          { href: "/saude/diagnostico", emoji: "🔬", label: "Diagnóstico", color: "hover:border-cyan-400" },
          { href: "/treinamentos/gps", emoji: "📡", label: "GPS Treinos", color: "hover:border-emerald-400" },
          { href: "/alertas", emoji: "🔔", label: "Alertas", color: "hover:border-amber-400" },
          { href: "/nutricao/suplementos", emoji: "💊", label: "Suplementos", color: "hover:border-emerald-400" },
          { href: "/saude/guia", emoji: "🩺", label: "Guia Terapêutico", color: "hover:border-red-400" },
          { href: "/backup", emoji: "💾", label: "Backup", color: "hover:border-slate-400" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md ${item.color}`}
          >
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{item.label}</span>
          </a>
        ))}
      </div>

      {/* Weather Bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span className="font-medium">24°C</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4 text-blue-500" />
          <span className="font-medium">NE 12 km/h</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Droplets className="w-4 h-4 text-cyan-500" />
          <span className="font-medium">65% Umidade</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Moon className="w-4 h-4 text-indigo-500" />
          <span className="font-medium">Lua Crescente</span>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatNumber(card.value)}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alert Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Status do Plantel
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {alertCards.map((card) => (
              <div key={card.label} className={`p-4 rounded-xl border ${card.color} border-current border-opacity-20`}>
                <p className="text-2xl font-bold">{formatNumber(card.value)}</p>
                <p className="text-sm font-medium opacity-80">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Velocidade Média</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(stats?.avgSpeed ?? 0, 2)} m/min</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Distância Acumulada</p>
              <p className="text-xl font-bold text-slate-900">{formatNumber(stats?.totalDistance ?? 0, 2)} km</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500 mb-1">Resultado Financeiro</p>
              <div className="flex items-center gap-1">
                {(stats?.financialResult ?? 0) >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <p className={`text-xl font-bold ${(stats?.financialResult ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(stats?.financialResult ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Next Competition */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Próxima Prova</h3>
            {data?.nextCompetition ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">{data.nextCompetition.name}</p>
                    <p className="text-sm text-slate-500">{data.nextCompetition.club}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  {formatDate(data.nextCompetition.date)}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  {data.nextCompetition.distance} km - {data.nextCompetition.type}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Nenhuma prova agendada</p>
            )}
          </div>

          {/* Alerts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertas
            </h3>
            <div className="space-y-2">
              {stats && stats.expiringMeds > 0 && (
                <div className="flex items-center justify-between text-sm p-2 bg-red-50 text-red-700 rounded-lg">
                  <span>Medicamentos vencendo</span>
                  <span className="font-bold">{stats.expiringMeds}</span>
                </div>
              )}
              {stats && stats.missingVaccines > 0 && (
                <div className="flex items-center justify-between text-sm p-2 bg-orange-50 text-orange-700 rounded-lg">
                  <span>Vacinas pendentes</span>
                  <span className="font-bold">{stats.missingVaccines}</span>
                </div>
              )}
              {stats && stats.missingRings > 0 && (
                <div className="flex items-center justify-between text-sm p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <span>Anilhas faltando</span>
                  <span className="font-bold">{stats.missingRings}</span>
                </div>
              )}
              {stats && stats.missingPigeons > 0 && (
                <div className="flex items-center justify-between text-sm p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <span>Pombos desaparecidos</span>
                  <span className="font-bold">{stats.missingPigeons}</span>
                </div>
              )}
              {stats && stats.unreadAlerts > 0 && (
                <div className="flex items-center justify-between text-sm p-2 bg-violet-50 text-violet-700 rounded-lg">
                  <span>Alertas da IA</span>
                  <span className="font-bold">{stats.unreadAlerts}</span>
                </div>
              )}
              {stats && stats.expiringMeds === 0 && stats.missingVaccines === 0 && stats.missingRings === 0 && stats.missingPigeons === 0 && stats.unreadAlerts === 0 && (
                <p className="text-slate-400 text-sm">Nenhum alerta no momento</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
