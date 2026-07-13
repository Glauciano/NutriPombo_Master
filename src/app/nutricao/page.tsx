"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Wheat,
  Calculator,
  FlaskConical,
  Plus,
  X,
  Trash2,
  CheckCircle,
  Info,
  Zap,
  Flame,
  Target,
} from "lucide-react";
import {
  INGREDIENTS,
  MIXTURES,
  getIngredient,
  calcNutrition,
  type MixtureItem,
  type Ingredient,
} from "@/lib/nutrition";

/* ────────── helpers ────────── */
function fmtKg(v: number): string {
  return v % 1 === 0 ? `${v}kg` : `${v.toFixed(2).replace(".", ",").replace(/,?0+$/, "")}kg`;
}

function fmtBRL(v: number): string {
  return `R$${v.toFixed(2).replace(".", ",")}`;
}

/* custom ingredient type for builder */
interface CustomItem {
  name: string;
  kg: number;
}

export default function AlimentacaoPage() {
  const [tab, setTab] = useState<"misturas" | "calculadora" | "proteina" | "gerador">("misturas");

  /* ─── Gerador IA state ─── */
  const [genObjective, setGenObjective] = useState("velocidade");
  const [genTemp, setGenTemp] = useState("25");
  const [genDistance, setGenDistance] = useState("300");
  const [genWeight, setGenWeight] = useState("30");
  const [genResult, setGenResult] = useState<MixtureItem[] | null>(null);

  /* ─── Calculadora state ─── */
  const [calcCategory, setCalcCategory] = useState("velocidade");
  const [numPigeons, setNumPigeons] = useState("20");
  const [numDays, setNumDays] = useState("7");
  const [gramsPerDay, setGramsPerDay] = useState("30");

  /* ─── Builder (Proteína) state ─── */
  const [builderItems, setBuilderItems] = useState<MixtureItem[]>([
    { ingredientId: "milho", kg: 3 },
    { ingredientId: "ervilha", kg: 2 },
    { ingredientId: "girassol", kg: 1 },
  ]);
  const [selIngredient, setSelIngredient] = useState("milho");
  const [selKg, setSelKg] = useState("1");
  const [customName, setCustomName] = useState("");
  const [customKg, setCustomKg] = useState("1");
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

  /* ─── seed config (from Configurações) ─── */
  const [seedConfig, setSeedConfig] = useState<{ enabledIds: string[]; customSeeds: Ingredient[] } | null>(null);

  useEffect(() => {
    fetch("/api/settings?key=seed_config")
      .then((r) => r.json())
      .then((d) => {
        if (d.value?.enabledIds) setSeedConfig(d.value);
      })
      .catch(() => { /* all seeds available by default */ });
  }, []);

  /* available = enabled built-ins + custom seeds; default all */
  const availableIngredients: Ingredient[] = useMemo(() => {
    if (!seedConfig) return INGREDIENTS;
    const enabled = INGREDIENTS.filter((i) => seedConfig.enabledIds.includes(i.id));
    const customs = (seedConfig.customSeeds || []).filter((s) => seedConfig.enabledIds.includes(s.id));
    return [...enabled, ...customs];
  }, [seedConfig]);

  const extraSeeds = seedConfig?.customSeeds || [];

  const getIng = (id: string) => getIngredient(id, extraSeeds);

  /* ─── Adapta uma mistura às sementes ATIVADAS: remove desativadas e redistribui ─── */
  const adaptMixture = (items: MixtureItem[]): { items: MixtureItem[]; removed: string[] } => {
    if (!seedConfig) return { items, removed: [] };
    const enabled = new Set(seedConfig.enabledIds);
    const kept = items.filter((i) => enabled.has(i.ingredientId));
    const removedItems = items.filter((i) => !enabled.has(i.ingredientId));
    const removed = removedItems.map((i) => getIng(i.ingredientId)?.name || INGREDIENTS.find((x) => x.id === i.ingredientId)?.name || i.ingredientId);

    if (removedItems.length === 0 || kept.length === 0) {
      return { items: kept.length ? kept : items, removed: kept.length ? removed : [] };
    }

    /* redistribui o peso das removidas proporcionalmente entre as mantidas */
    const removedKg = removedItems.reduce((s, i) => s + i.kg, 0);
    const keptKg = kept.reduce((s, i) => s + i.kg, 0);
    const adapted = kept.map((i) => ({ ...i, kg: i.kg + (i.kg / keptKg) * removedKg }));
    return { items: adapted, removed };
  };


  /* ─── Calculadora derived ─── */
  const calcResult = useMemo(() => {
    const pigeons = parseInt(numPigeons) || 0;
    const days = parseInt(numDays) || 0;
    const grams = parseInt(gramsPerDay) || 0;
    const totalKg = (pigeons * days * grams) / 1000;

    const mixture = MIXTURES.find((m) => m.id === calcCategory) || MIXTURES[0];
    const { items: adaptedItems } = adaptMixture(mixture.items);
    const mixNutrition = calcNutrition(adaptedItems, extraSeeds);
    const mixTotalKg = mixNutrition.totalKg;

    // Scale ingredients to needed total
    const scale = mixTotalKg > 0 ? totalKg / mixTotalKg : 0;
    const scaledIngredients = adaptedItems.map((item) => ({
      name: getIng(item.ingredientId)?.name || item.ingredientId,
      kg: item.kg * scale,
    }));

    const costTotal = mixNutrition.costPerKg * totalKg;
    const costPerPigeon = pigeons > 0 ? costTotal / pigeons : 0;
    const costPerDay = days > 0 ? costTotal / days : 0;

    return { totalKg, costTotal, costPerPigeon, costPerDay, scaledIngredients };
  }, [calcCategory, numPigeons, numDays, gramsPerDay, seedConfig, extraSeeds]);

  /* ─── Builder derived ─── */
  const builderNutrition = useMemo(() => calcNutrition(builderItems, extraSeeds), [builderItems, extraSeeds]);
  const builderTotalWithCustom = builderNutrition.totalKg + customItems.reduce((s, c) => s + c.kg, 0);

  function addIngredient() {
    const kg = parseFloat(selKg) || 0;
    if (kg <= 0) return;
    setBuilderItems((prev) => {
      const existing = prev.find((i) => i.ingredientId === selIngredient);
      if (existing) {
        return prev.map((i) => i.ingredientId === selIngredient ? { ...i, kg: i.kg + kg } : i);
      }
      return [...prev, { ingredientId: selIngredient, kg }];
    });
  }

  function addCustom() {
    const kg = parseFloat(customKg) || 0;
    if (!customName.trim() || kg <= 0) return;
    setCustomItems((prev) => [...prev, { name: customName.trim(), kg }]);
    setCustomName("");
    setCustomKg("1");
  }

  function updateItemKg(id: string, kg: number) {
    setBuilderItems((prev) => prev.map((i) => i.ingredientId === id ? { ...i, kg } : i));
  }

  function removeItem(id: string) {
    setBuilderItems((prev) => prev.filter((i) => i.ingredientId !== id));
  }

  function clearBuilder() {
    setBuilderItems([]);
    setCustomItems([]);
  }

  /* target checks */
  const proteinOk = builderNutrition.proteinPerKg >= 120 && builderNutrition.proteinPerKg <= 180;
  const energyOk = builderNutrition.energyPerKg >= 3000 && builderNutrition.energyPerKg <= 4500;
  const fatOk = builderNutrition.fatPerKg >= 30 && builderNutrition.fatPerKg <= 90;


  /* ─── Gerador de Mistura IA — usa APENAS sementes ativadas ─── */
  function generateMixture() {
    const seeds = availableIngredients;
    if (seeds.length === 0) { setGenResult([]); return; }

    /* classify enabled seeds */
    const cereals = seeds.filter((s) => s.protein < 160 && s.fat < 150);
    const legumes = seeds.filter((s) => s.protein >= 160 && s.fat < 150);
    const oilseeds = seeds.filter((s) => s.fat >= 150 && s.protein < 400);
    const supplements = seeds.filter((s) => s.protein >= 400);

    /* base % per objective */
    const profiles: Record<string, { cer: number; leg: number; oil: number; sup: number }> = {
      velocidade: { cer: 62, leg: 22, oil: 13, sup: 3 },
      meio_fundo: { cer: 54, leg: 25, oil: 18, sup: 3 },
      fundo: { cer: 44, leg: 26, oil: 27, sup: 3 },
      reproducao: { cer: 44, leg: 36, oil: 15, sup: 5 },
      muda: { cer: 44, leg: 30, oil: 19, sup: 7 },
      filhotes: { cer: 48, leg: 34, oil: 13, sup: 5 },
    };
    const p = { ...(profiles[genObjective] || profiles.velocidade) };

    /* climate adjustment */
    const temp = parseFloat(genTemp) || 25;
    if (temp >= 30) { p.oil = Math.max(5, p.oil - 6); p.cer += 6; }
    else if (temp <= 14) { p.oil += 6; p.cer = Math.max(20, p.cer - 6); }

    /* distance adjustment (provas longas pedem mais gordura) */
    const dist = parseFloat(genDistance) || 0;
    if (dist >= 500) { p.oil += 4; p.cer = Math.max(20, p.cer - 4); }

    const totalGrams = parseFloat(genWeight) || 30;

    /* distribute % within each category among enabled seeds (max 4 por categoria, melhor custo-benefício primeiro) */
    function allocate(catSeeds: typeof seeds, catPct: number): MixtureItem[] {
      if (catSeeds.length === 0 || catPct <= 0) return [];
      const chosen = catSeeds.slice(0, 4);
      const per = catPct / chosen.length;
      return chosen.map((s) => ({ ingredientId: s.id, kg: (totalGrams * per) / 100 }));
    }

    /* redistribute % of empty categories to cereals */
    let extra = 0;
    if (legumes.length === 0) { extra += p.leg; p.leg = 0; }
    if (oilseeds.length === 0) { extra += p.oil; p.oil = 0; }
    if (supplements.length === 0) { extra += p.sup; p.sup = 0; }
    p.cer += extra;

    const items = [
      ...allocate(cereals, p.cer),
      ...allocate(legumes, p.leg),
      ...allocate(oilseeds, p.oil),
      ...allocate(supplements, p.sup),
    ].filter((i) => i.kg > 0);

    setGenResult(items);
  }

  const genNutrition = genResult ? calcNutrition(genResult, extraSeeds) : null;
  const genTotal = genResult ? genResult.reduce((s, i) => s + i.kg, 0) : 0;

  const categoryTabs = [
    { id: "velocidade", label: "Velocidade" },
    { id: "meio_fundo", label: "Meio Fundo" },
    { id: "fundo", label: "Fundo" },
  ];

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌾</span>
            <h1 className="text-2xl font-extrabold text-white">Alimentação</h1>
          </div>
          <p className="text-sm text-slate-400">Misturas, calculadoras e análise nutricional</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/nutricao/cardapio"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all"
          >
            🍽️ Cardápio
          </a>
          <a
            href="/nutricao/suplementos"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all"
          >
            💊 Suplementos
          </a>
          <a
            href="/nutricao/configuracao"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all"
          >
            ⚙️ Plantel
          </a>
        </div>
      </div>

      {/* ─── Banner: sementes ativas ─── */}
      <div className="bg-[#1a2736] border border-yellow-500/20 rounded-xl px-4 py-3 mb-5 flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs text-slate-300">
          🌾 <span className="font-bold text-yellow-400">{availableIngredients.length} sementes ativas</span>
          <span className="text-slate-500"> — todas as misturas e cálculos usam apenas elas</span>
        </p>
        <a
          href="/configuracoes"
          className="text-[11px] font-bold text-yellow-400 hover:text-yellow-300 shrink-0"
        >
          Gerenciar sementes →
        </a>
      </div>

      {/* ─── Main Tabs ─── */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("misturas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "misturas"
              ? "bg-yellow-500 text-[#0b1120] ring-2 ring-yellow-400/50"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🌾 Misturas
        </button>
        <button
          onClick={() => setTab("calculadora")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "calculadora"
              ? "bg-yellow-500 text-[#0b1120] ring-2 ring-yellow-400/50"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          📊 Calculadora
        </button>
        <button
          onClick={() => setTab("proteina")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "proteina"
              ? "bg-yellow-500 text-[#0b1120] ring-2 ring-yellow-400/50"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🧪 Proteína
        </button>
        <button
          onClick={() => setTab("gerador")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "gerador"
              ? "bg-yellow-500 text-[#0b1120] ring-2 ring-yellow-400/50"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🤖 Gerador IA
        </button>
      </div>

      {/* ══════════ TAB: MISTURAS ══════════ */}
      {tab === "misturas" && (
        <div className="space-y-5">
          {MIXTURES.map((mix) => {
            const { items: mixItems, removed } = adaptMixture(mix.items);
            const nutrition = calcNutrition(mixItems, extraSeeds);
            const maxKg = Math.max(...mixItems.map((i) => i.kg));
            return (
              <div key={mix.id} className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
                {/* Card header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-lg">
                    {mix.emoji}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{mix.name}</h3>
                    <p className="text-xs text-slate-500">total: {fmtKg(nutrition.totalKg)}</p>
                  </div>
                </div>

                {removed.length > 0 && (
                  <div className="mb-4 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-[10px] text-amber-400">
                      🌾 Adaptada às suas sementes — sem: {removed.join(", ")} (redistribuído)
                    </p>
                  </div>
                )}

                {/* Ingredient bars */}
                <div className="space-y-3 mb-5">
                  {mixItems.map((item) => {
                    const ing = getIng(item.ingredientId);
                    if (!ing) return null;
                    const pct = nutrition.totalKg > 0 ? (item.kg / nutrition.totalKg) * 100 : 0;
                    const barPct = maxKg > 0 ? (item.kg / maxKg) * 100 : 0;
                    return (
                      <div key={item.ingredientId}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-300">{ing.name}</span>
                          <span className="text-xs font-bold text-yellow-400">
                            {fmtKg(item.kg)} <span className="text-slate-500">({Math.round(pct)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-[#0b1120] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-500 transition-all duration-500"
                            style={{ width: `${barPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Stats footer */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Proteína</p>
                    <p className="text-sm font-black text-yellow-400">{Math.round(nutrition.proteinPerKg)}g/kg</p>
                  </div>
                  <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Energia</p>
                    <p className="text-sm font-black text-yellow-400">{(nutrition.energyPerKg / 1000).toFixed(2).replace(".", ",")}Mcal</p>
                  </div>
                  <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Gordura</p>
                    <p className="text-sm font-black text-yellow-400">{Math.round(nutrition.fatPerKg)}g/kg</p>
                  </div>
                  <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Custo</p>
                    <p className="text-sm font-black text-yellow-400">{fmtBRL(nutrition.costTotal)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════ TAB: CALCULADORA ══════════ */}
      {tab === "calculadora" && (
        <div className="space-y-4">
          {/* Parâmetros */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Parâmetros</span>
            </div>

            {/* Categoria */}
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Categoria</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {categoryTabs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCalcCategory(cat.id)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    calcCategory === cat.id
                      ? "bg-yellow-500 text-[#0b1120]"
                      : "bg-[#0b1120] border border-[#2a3a4a] text-slate-400 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  🐦 Pombos
                </label>
                <input
                  type="number"
                  value={numPigeons}
                  onChange={(e) => setNumPigeons(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📅 Dias
                </label>
                <input
                  type="number"
                  value={numDays}
                  onChange={(e) => setNumDays(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  ⚖️ g/dia
                </label>
                <input
                  type="number"
                  value={gramsPerDay}
                  onChange={(e) => setGramsPerDay(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm">📋</span>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Resultado</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Total mistura</p>
                <p className="text-2xl font-black text-yellow-400">{calcResult.totalKg.toFixed(2).replace(".", ",")}kg</p>
              </div>
              <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Custo período</p>
                <p className="text-2xl font-black text-emerald-400">{fmtBRL(calcResult.costTotal)}</p>
              </div>
              <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Custo/pombo</p>
                <p className="text-2xl font-black text-blue-400">{fmtBRL(calcResult.costPerPigeon)}</p>
              </div>
              <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Custo/dia</p>
                <p className="text-2xl font-black text-violet-400">{fmtBRL(calcResult.costPerDay)}</p>
              </div>
            </div>

            {/* Ingredientes list */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">📝</span>
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Ingredientes</span>
            </div>
            <div className="space-y-2">
              {calcResult.scaledIngredients.map((ing, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-[#0b1120] rounded-xl">
                  <span className="text-sm text-slate-300">{ing.name}</span>
                  <span className="text-sm font-bold text-yellow-400">{ing.kg.toFixed(2).replace(".", ",")} kg</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: PROTEÍNA (Builder) ══════════ */}
      {tab === "proteina" && (
        <div className="space-y-4">
          {/* Auto-save banner */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Dados salvos automaticamente</span>
          </div>

          {/* Add Ingredients */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Adicionar Ingredientes</span>
            </div>

            {/* From nutritional DB */}
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Da lista nutricional
            </p>
            <div className="flex gap-2 mb-1">
              <select
                value={selIngredient}
                onChange={(e) => setSelIngredient(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-yellow-500"
              >
                {availableIngredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                value={selKg}
                onChange={(e) => setSelKg(e.target.value)}
                className="w-16 px-2 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm font-bold text-center focus:ring-2 focus:ring-yellow-500"
              />
              <span className="flex items-center text-xs text-slate-500">kg</span>
              <button
                onClick={addIngredient}
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black transition-colors"
              >
                +
              </button>
            </div>
            {(() => {
              const ing = getIng(selIngredient);
              return ing ? (
                <p className="text-[10px] text-slate-500 mb-4">
                  Prot: {ing.protein}g/kg • Gord: {ing.fat}g/kg • {fmtBRL(ing.price)}/kg
                </p>
              ) : null;
            })()}

            {/* Custom ingredient */}
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">
              Ingrediente personalizado
            </p>
            <div className="flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nome..."
                className="flex-1 px-3 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="number"
                step="0.1"
                value={customKg}
                onChange={(e) => setCustomKg(e.target.value)}
                className="w-16 px-2 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm font-bold text-center focus:ring-2 focus:ring-yellow-500"
              />
              <button
                onClick={addCustom}
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Minha Mistura */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
                  Minha Mistura ({builderItems.length + customItems.length} itens — {fmtKg(builderTotalWithCustom)})
                </span>
              </div>
              <button
                onClick={clearBuilder}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpar
              </button>
            </div>

            {/* Composition color bar */}
            {builderNutrition.totalKg > 0 && (
              <>
                <div className="flex w-full h-3 rounded-full overflow-hidden mb-2">
                  {builderItems.map((item) => {
                    const ing = getIng(item.ingredientId);
                    if (!ing || item.kg <= 0) return null;
                    const pct = (item.kg / builderNutrition.totalKg) * 100;
                    return (
                      <div
                        key={item.ingredientId}
                        style={{ width: `${pct}%`, backgroundColor: ing.color }}
                        title={`${ing.name}: ${Math.round(pct)}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4">
                  {builderItems.map((item) => {
                    const ing = getIng(item.ingredientId);
                    if (!ing || item.kg <= 0) return null;
                    const pct = Math.round((item.kg / builderNutrition.totalKg) * 100);
                    return (
                      <span key={item.ingredientId} className="flex items-center gap-1 text-[10px] text-slate-400">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: ing.color }} />
                        {ing.name} {pct}%
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            {/* Item rows */}
            <div className="space-y-2">
              {builderItems.map((item) => {
                const ing = getIng(item.ingredientId);
                if (!ing) return null;
                return (
                  <div
                    key={item.ingredientId}
                    className="flex items-center gap-3 bg-[#0b1120] rounded-xl p-3 border-l-4"
                    style={{ borderLeftColor: ing.color }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{ing.name}</p>
                      <p className="text-[10px] text-slate-500">
                        Prot: {ing.protein}g/kg • Gord: {ing.fat}g/kg
                      </p>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.kg}
                      onChange={(e) => updateItemKg(item.ingredientId, parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1.5 bg-[#1a2736] border border-yellow-500/40 rounded-lg text-yellow-400 text-sm font-bold text-center focus:ring-2 focus:ring-yellow-500"
                    />
                    <span className="text-xs text-slate-500">kg</span>
                    <button
                      onClick={() => removeItem(item.ingredientId)}
                      className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {customItems.map((item, idx) => (
                <div key={`custom-${idx}`} className="flex items-center gap-3 bg-[#0b1120] rounded-xl p-3 border-l-4 border-l-slate-500">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-500">Personalizado</p>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">{fmtKg(item.kg)}</span>
                  <button
                    onClick={() => setCustomItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {builderItems.length === 0 && customItems.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-6">
                  Adicione ingredientes acima para montar sua mistura
                </p>
              )}
            </div>
          </div>

          {/* Análise Nutricional */}
          {builderNutrition.totalKg > 0 && (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm">📊</span>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Análise Nutricional</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Total</p>
                  <p className="text-xl font-black text-white">{fmtKg(builderNutrition.totalKg)}</p>
                </div>
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Custo</p>
                  <p className="text-xl font-black text-emerald-400">{fmtBRL(builderNutrition.costTotal)}</p>
                </div>
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Proteína</p>
                  <p className="text-xl font-black text-blue-400">{builderNutrition.proteinPerKg.toFixed(1).replace(".", ",")}g/kg</p>
                </div>
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Energia</p>
                  <p className="text-xl font-black text-yellow-400">{(builderNutrition.energyPerKg / 1000).toFixed(2).replace(".", ",")} Mcal</p>
                </div>
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Gordura</p>
                  <p className="text-xl font-black text-violet-400">{builderNutrition.fatPerKg.toFixed(1).replace(".", ",")}g/kg</p>
                </div>
                <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4">
                  <p className="text-[10px] text-slate-500 uppercase mb-1">Custo/kg</p>
                  <p className="text-xl font-black text-emerald-400">{fmtBRL(builderNutrition.costPerKg)}</p>
                </div>
              </div>

              {/* Target range checks */}
              <div className="space-y-2">
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                  proteinOk ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
                }`}>
                  <span className="text-xs font-semibold text-slate-300">
                    <span className="text-yellow-400 font-bold">Proteína</span> ideal: 120–180g/kg
                  </span>
                  <span className={`text-xs font-black ${proteinOk ? "text-emerald-400" : "text-amber-400"}`}>
                    {builderNutrition.proteinPerKg.toFixed(1).replace(".", ",")}g/kg {proteinOk ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                  energyOk ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
                }`}>
                  <span className="text-xs font-semibold text-slate-300">
                    <span className="text-yellow-400 font-bold">Energia</span> ideal: 3–4,5 Mcal
                  </span>
                  <span className={`text-xs font-black ${energyOk ? "text-emerald-400" : "text-amber-400"}`}>
                    {(builderNutrition.energyPerKg / 1000).toFixed(2).replace(".", ",")}Mcal {energyOk ? "✅" : "⚠️"}
                  </span>
                </div>
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${
                  fatOk ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30"
                }`}>
                  <span className="text-xs font-semibold text-slate-300">
                    <span className="text-yellow-400 font-bold">Gordura</span> ideal: 30–90g/kg
                  </span>
                  <span className={`text-xs font-black ${fatOk ? "text-emerald-400" : "text-amber-400"}`}>
                    {builderNutrition.fatPerKg.toFixed(1).replace(".", ",")}g/kg {fatOk ? "✅" : "⚠️"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════ TAB: GERADOR IA ══════════ */}
      {tab === "gerador" && (
        <div className="space-y-4">
          {/* Sementes disponíveis */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">
              🌾 Sementes Disponíveis ({availableIngredients.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {availableIngredients.map((ing) => (
                <span key={ing.id} className="px-3 py-1 bg-[#0b1120] border border-yellow-500/20 rounded-full text-[11px] font-semibold text-yellow-200/80">
                  {ing.name}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-3">
              ⚙️ Ative/desative grãos em Personalização → Sementes e Grãos
            </p>
          </div>

          {/* Parâmetros do gerador */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
              🤖 Gerador de Mistura (IA)
            </p>
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Objetivo</label>
              <select
                value={genObjective}
                onChange={(e) => setGenObjective(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-yellow-500"
              >
                <option value="velocidade">Velocidade</option>
                <option value="meio_fundo">Meio Fundo</option>
                <option value="fundo">Fundo</option>
                <option value="reproducao">Reprodução</option>
                <option value="muda">Muda</option>
                <option value="filhotes">Filhotes</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Temp. (°C)</label>
                <input type="number" value={genTemp} onChange={(e) => setGenTemp(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Distância (km)</label>
                <input type="number" value={genDistance} onChange={(e) => setGenDistance(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Peso (g/ave)</label>
                <input type="number" value={genWeight} onChange={(e) => setGenWeight(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500" />
              </div>
            </div>
            <button
              onClick={generateMixture}
              className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black text-sm transition-colors"
            >
              🤖 Gerar Mistura com as Minhas Sementes
            </button>
          </div>

          {/* Resultado */}
          {genResult && genNutrition && (
            <div className="bg-[#1a2736] border-2 border-yellow-500/40 rounded-2xl p-5">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
                ✨ Mistura Gerada — {genTotal.toFixed(0)}g/ave
              </p>
              {genResult.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  Nenhuma semente ativa! Ative grãos em Personalização.
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-5">
                    {[...genResult].sort((a, b) => b.kg - a.kg).map((item) => {
                      const ing = getIng(item.ingredientId);
                      if (!ing) return null;
                      const pct = genTotal > 0 ? (item.kg / genTotal) * 100 : 0;
                      return (
                        <div key={item.ingredientId}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-300">{ing.name}</span>
                            <span className="text-xs font-bold text-yellow-400">
                              {Math.round(pct)}% ({item.kg.toFixed(1)}g)
                            </span>
                          </div>
                          <div className="w-full bg-[#0b1120] rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: ing.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Proteína</p>
                      <p className="text-sm font-black text-blue-400">{Math.round(genNutrition.proteinPerKg)}g/kg</p>
                    </div>
                    <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Energia</p>
                      <p className="text-sm font-black text-yellow-400">{(genNutrition.energyPerKg / 1000).toFixed(2)}Mcal</p>
                    </div>
                    <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Gordura</p>
                      <p className="text-sm font-black text-violet-400">{Math.round(genNutrition.fatPerKg)}g/kg</p>
                    </div>
                    <div className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 uppercase mb-1">Custo</p>
                      <p className="text-sm font-black text-emerald-400">R${genNutrition.costPerKg.toFixed(2)}/kg</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
