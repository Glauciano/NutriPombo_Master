"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UtensilsCrossed, RefreshCw } from "lucide-react";
import { MIXTURES, calcNutrition, getIngredient } from "@/lib/nutrition";

interface PlantelConfig {
  gramsPerDay: number;
  numPigeons: number;
  bodyCondition: string;
}

/* weekly plan: phase per day with feeding details */
interface DayMenu {
  day: number;
  dayLabel: string;
  phase: string;
  phaseEmoji: string;
  borderColor: string;
  morning: { pct: number; desc: string };
  afternoon: { pct: number; desc: string };
  mixHint: string;
  extras: string[];
}

const WEEK_MENU: DayMenu[] = [
  {
    day: 0, dayLabel: "Domingo", phase: "Recuperação pós-prova", phaseEmoji: "💧", borderColor: "border-l-blue-500",
    morning: { pct: 40, desc: "Mistura leve (depurativa) + Organew" },
    afternoon: { pct: 60, desc: "Mistura leve à vontade controlada" },
    mixHint: "50% cevada/arroz + 50% mistura base — fácil digestão",
    extras: ["Bioxan + Eletrovit na água", "Grit limpo à disposição"],
  },
  {
    day: 1, dayLabel: "Segunda", phase: "Depuração", phaseEmoji: "🌿", borderColor: "border-l-teal-500",
    morning: { pct: 40, desc: "Mistura depurativa + Organew" },
    afternoon: { pct: 60, desc: "Mistura base da categoria" },
    mixHint: "Reduzir milho, aumentar cevada — limpar o organismo",
    extras: ["Bioxan na água (2º dia)", "Banho liberado"],
  },
  {
    day: 2, dayLabel: "Terça", phase: "Reconstrução proteica", phaseEmoji: "💪", borderColor: "border-l-emerald-500",
    morning: { pct: 45, desc: "Mistura rica em proteína + Aminomix" },
    afternoon: { pct: 55, desc: "Mistura base + ervilha extra" },
    mixHint: "Aumentar ervilha/lentilha para 30% — músculo",
    extras: ["Aminomix na ração da manhã", "Água limpa"],
  },
  {
    day: 3, dayLabel: "Quarta", phase: "Proteína + treino", phaseEmoji: "🏋️", borderColor: "border-l-emerald-500",
    morning: { pct: 35, desc: "Refeição leve pré-treino + Aminomix" },
    afternoon: { pct: 65, desc: "Reposição pós-treino completa" },
    mixHint: "Manhã leve para voar com fome — tarde reforçada",
    extras: ["Aminomix na ração", "Eletrovit pós-treino se solta"],
  },
  {
    day: 4, dayLabel: "Quinta", phase: "Carga energética", phaseEmoji: "⚡", borderColor: "border-l-yellow-500",
    morning: { pct: 40, desc: "Mistura energética + Aminomix" },
    afternoon: { pct: 60, desc: "Mistura gordurosa (milho + girassol)" },
    mixHint: "Aumentar milho para 40% + girassol/cártamo — combustível",
    extras: ["Bioxan na água", "Última carga pesada da semana"],
  },
  {
    day: 5, dayLabel: "Sexta", phase: "Pré-enceste", phaseEmoji: "📦", borderColor: "border-l-slate-500",
    morning: { pct: 50, desc: "Mistura energética leve" },
    afternoon: { pct: 50, desc: "Refeição cedo (antes do embarque)" },
    mixHint: "Grãos pequenos e digestos — nada pesado no papo",
    extras: ["Só água limpa", "Alimentar 4h antes do enceste"],
  },
  {
    day: 6, dayLabel: "Sábado", phase: "Dia de prova", phaseEmoji: "🏁", borderColor: "border-l-orange-500",
    morning: { pct: 0, desc: "Em prova — sem alimentação" },
    afternoon: { pct: 100, desc: "Na chegada: mistura leve + recuperação" },
    mixHint: "Chegada: grãos leves + Eletrovit imediato na água",
    extras: ["Eletrovit na água da chegada", "Observar condição de cada um"],
  },
];

export default function CardapioPage() {
  const [config, setConfig] = useState<PlantelConfig>({ gramsPerDay: 32, numPigeons: 70, bodyCondition: "ideal" });
  const [category, setCategory] = useState("velocidade");
  const [loading, setLoading] = useState(true);

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/settings?key=plantel_config");
      const data = await res.json();
      if (data.value) setConfig((c) => ({ ...c, ...data.value }));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  const today = new Date().getDay();
  const totalDailyKg = (config.gramsPerDay * config.numPigeons) / 1000;
  const mixture = MIXTURES.find((m) => m.id === category) || MIXTURES[0];
  const nutrition = calcNutrition(mixture.items);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <Link href="/nutricao" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-2xl font-extrabold text-white">Cardápio Semanal</h1>
        </div>
        <p className="text-sm text-slate-400">
          Plano de alimentação dia a dia — {config.numPigeons} pombos × {config.gramsPerDay}g = {totalDailyKg.toFixed(2).replace(".", ",")}kg/dia
        </p>
      </div>

      {/* Category */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { id: "velocidade", label: "Velocidade" },
          { id: "meio_fundo", label: "Meio Fundo" },
          { id: "fundo", label: "Fundo" },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`py-2.5 rounded-full text-sm font-bold transition-all ${
              category === cat.id
                ? "bg-yellow-500 text-[#0b1120]"
                : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Base mixture info */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-4 mb-5">
        <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">
          Mistura base — {mixture.name}
        </p>
        <div className="flex flex-wrap gap-2">
          {mixture.items.map((item) => {
            const ing = getIngredient(item.ingredientId);
            if (!ing) return null;
            const pct = Math.round((item.kg / nutrition.totalKg) * 100);
            return (
              <span key={item.ingredientId} className="px-2.5 py-1 bg-[#0b1120] rounded-lg text-[10px] font-semibold text-slate-300">
                {ing.name} <span className="text-yellow-400">{pct}%</span>
              </span>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-500 mt-2">
          Proteína {Math.round(nutrition.proteinPerKg)}g/kg • Energia {(nutrition.energyPerKg / 1000).toFixed(2)}Mcal • Gordura {Math.round(nutrition.fatPerKg)}g/kg
        </p>
      </div>

      {/* Week menu */}
      <div className="space-y-3">
        {WEEK_MENU.map((menu) => {
          const isToday = menu.day === today;
          const morningKg = (totalDailyKg * menu.morning.pct) / 100;
          const afternoonKg = (totalDailyKg * menu.afternoon.pct) / 100;
          const morningPerPigeon = (config.gramsPerDay * menu.morning.pct) / 100;
          const afternoonPerPigeon = (config.gramsPerDay * menu.afternoon.pct) / 100;

          return (
            <div
              key={menu.day}
              className={`bg-[#1a2736] border rounded-xl overflow-hidden border-l-4 ${menu.borderColor} ${
                isToday ? "border-yellow-500/60 ring-1 ring-yellow-500/30" : "border-[#2a3a4a]"
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{menu.phaseEmoji}</span>
                  <h3 className="text-sm font-extrabold text-white">{menu.dayLabel}</h3>
                  <span className="text-[10px] text-slate-500">— {menu.phase}</span>
                  {isToday && (
                    <span className="ml-auto px-2 py-0.5 bg-yellow-500 text-[#0b1120] rounded text-[9px] font-black uppercase">Hoje</span>
                  )}
                </div>

                {/* meals */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#0b1120] rounded-lg p-3">
                    <p className="text-[9px] text-amber-400 font-black uppercase mb-1">🌅 Manhã ({menu.morning.pct}%)</p>
                    <p className="text-[11px] text-slate-300">{menu.morning.desc}</p>
                    {menu.morning.pct > 0 && (
                      <p className="text-[10px] font-black text-yellow-400 mt-1">
                        {morningPerPigeon.toFixed(0)}g/pombo • {morningKg.toFixed(2).replace(".", ",")}kg total
                      </p>
                    )}
                  </div>
                  <div className="bg-[#0b1120] rounded-lg p-3">
                    <p className="text-[9px] text-indigo-400 font-black uppercase mb-1">🌇 Tarde ({menu.afternoon.pct}%)</p>
                    <p className="text-[11px] text-slate-300">{menu.afternoon.desc}</p>
                    {menu.afternoon.pct > 0 && (
                      <p className="text-[10px] font-black text-yellow-400 mt-1">
                        {afternoonPerPigeon.toFixed(0)}g/pombo • {afternoonKg.toFixed(2).replace(".", ",")}kg total
                      </p>
                    )}
                  </div>
                </div>

                {/* mix hint */}
                <p className="text-[10px] text-emerald-400/80 mb-2">
                  🌾 <span className="font-semibold">{menu.mixHint}</span>
                </p>

                {/* extras */}
                <div className="flex flex-wrap gap-1.5">
                  {menu.extras.map((extra, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/5 border border-[#2a3a4a] rounded text-[9px] text-slate-400">
                      {extra}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* weekly totals */}
      <div className="bg-[#1a2736] border-2 border-yellow-500/40 rounded-2xl p-5 mt-5">
        <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">📊 Consumo semanal estimado</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#0b1120] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-yellow-400">{(totalDailyKg * 6.5).toFixed(1).replace(".", ",")}</p>
            <p className="text-[9px] text-slate-500 uppercase">kg de ração/semana</p>
          </div>
          <div className="bg-[#0b1120] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-emerald-400">{(totalDailyKg * 6.5 * nutrition.costPerKg).toFixed(0)}</p>
            <p className="text-[9px] text-slate-500 uppercase">R$ estimado/semana</p>
          </div>
          <div className="bg-[#0b1120] rounded-xl p-3 text-center">
            <p className="text-xl font-black text-blue-400">{(totalDailyKg * 6.5 * 4.3).toFixed(0)}</p>
            <p className="text-[9px] text-slate-500 uppercase">kg/mês aprox.</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-3">
          💡 Valores baseados na Configuração do Plantel ({config.gramsPerDay}g × {config.numPigeons} pombos). Sábado conta meia ração.
        </p>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • Cardápio Semanal</p>
    </div>
  );
}
