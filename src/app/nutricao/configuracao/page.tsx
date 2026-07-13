"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Settings,
  Pencil,
  CheckCircle,
  Save,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

/* ────────── constants ────────── */
const CONSUMPTION_PRESETS = [25, 28, 30, 32, 35];

const BODY_CONDITIONS = [
  { id: "magro", label: "Magro", desc: "+3% sementes", icon: "📉", adjust: 1.03 },
  { id: "ideal", label: "Ideal", desc: "Protocolo padrão", icon: "✅", adjust: 1.0 },
  { id: "pesado", label: "Pesado", desc: "−3% sementes", icon: "📈", adjust: 0.97 },
];

/* mix percentage per category (rest = seeds) */
const MIX_PCT: Record<string, number> = {
  velocidade: 0.165,
  meio_fundo: 0.2,
  fundo: 0.235,
};

const DAY_LABELS: Record<number, string> = {
  0: "Domingo (descanso)",
  1: "Segunda-feira (recuperação)",
  2: "Terça-feira (base proteica)",
  3: "Quarta-feira (treino leve)",
  4: "Quinta-feira (carga energética)",
  5: "Sexta-feira (pré-embarque)",
  6: "Sábado (dia de prova)",
};

interface PlantelConfig {
  gramsPerDay: number;
  customGrams: number | null;
  numPigeons: number;
  bodyCondition: string;
}

const DEFAULT_CONFIG: PlantelConfig = {
  gramsPerDay: 32,
  customGrams: null,
  numPigeons: 70,
  bodyCondition: "ideal",
};

export default function ConfiguracaoPlantelPage() {
  const [config, setConfig] = useState<PlantelConfig>(DEFAULT_CONFIG);
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ─── load config ─── */
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/settings?key=plantel_config");
      const data = await res.json();
      if (data.value) {
        setConfig({ ...DEFAULT_CONFIG, ...data.value });
        if (data.value.customGrams) {
          setCustomValue(String(data.value.customGrams));
        }
      }
    } catch {
      // use defaults
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  /* ─── save config ─── */
  async function saveConfig() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "plantel_config", value: config }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    }
    setSaving(false);
  }

  function selectPreset(g: number) {
    setConfig((c) => ({ ...c, gramsPerDay: g, customGrams: null }));
    setShowCustom(false);
  }

  function applyCustom() {
    const v = parseFloat(customValue);
    if (v > 0) {
      setConfig((c) => ({ ...c, gramsPerDay: v, customGrams: v }));
    }
  }

  /* ─── preview calc ─── */
  const condition = BODY_CONDITIONS.find((b) => b.id === config.bodyCondition) || BODY_CONDITIONS[1];
  const effectiveGrams = config.gramsPerDay;
  const today = new Date().getDay();
  const dayLabel = DAY_LABELS[today] || "";

  const preview = [
    { label: "Velocidade", pct: MIX_PCT.velocidade },
    { label: "Meio Fundo", pct: MIX_PCT.meio_fundo },
    { label: "Fundo", pct: MIX_PCT.fundo },
  ].map((cat) => {
    const mixG = effectiveGrams * cat.pct;
    const seedsG = (effectiveGrams - mixG) * condition.adjust;
    const total = seedsG + mixG;
    return {
      label: cat.label,
      seeds: seedsG,
      mix: mixG,
      total,
    };
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
      {/* ─── Header ─── */}
      <div className="mb-6">
        <Link href="/nutricao" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-6 h-6 text-slate-300" />
          <h1 className="text-2xl font-extrabold text-white">Configuração do Plantel</h1>
        </div>
        <p className="text-sm text-slate-400">
          Configure o consumo base — todos os protocolos recalculam automaticamente
        </p>
      </div>

      {/* ─── Consumo médio por pombo/dia ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">🌾</span>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Consumo médio por pombo/dia
          </span>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          {CONSUMPTION_PRESETS.map((g) => {
            const isActive = config.gramsPerDay === g && !config.customGrams;
            return (
              <button
                key={g}
                onClick={() => selectPreset(g)}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-yellow-500 text-[#0b1120]"
                    : "bg-[#0b1120] border border-[#2a3a4a] text-slate-300 hover:border-yellow-500/40"
                }`}
              >
                {g}g
              </button>
            );
          })}
        </div>

        {/* Custom button */}
        <button
          onClick={() => setShowCustom((s) => !s)}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 mb-3 ${
            config.customGrams
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#0b1120] border border-[#2a3a4a] text-slate-400 hover:border-yellow-500/40"
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          Personalizado
        </button>

        {showCustom && (
          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Ex: 33"
              className="flex-1 px-4 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            <button
              onClick={applyCustom}
              className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-bold text-sm transition-colors"
            >
              Aplicar
            </button>
          </div>
        )}

        {/* Confirmation banner */}
        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-sm font-bold text-yellow-400">
            Consumo configurado: {config.gramsPerDay}g por pombo/dia
          </p>
        </div>
      </div>

      {/* ─── Quantidade de pombos ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">🐦</span>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Quantidade de pombos
          </span>
        </div>
        <input
          type="number"
          value={config.numPigeons}
          onChange={(e) => setConfig((c) => ({ ...c, numPigeons: parseInt(e.target.value) || 0 }))}
          className="w-full px-4 py-4 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-2xl font-black text-center focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
        />
      </div>

      {/* ─── Condição Corporal ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">📊</span>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Condição Corporal
          </span>
        </div>

        <div className="space-y-2">
          {BODY_CONDITIONS.map((cond) => {
            const isActive = config.bodyCondition === cond.id;
            return (
              <button
                key={cond.id}
                onClick={() => setConfig((c) => ({ ...c, bodyCondition: cond.id }))}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30"
                    : "bg-[#0b1120] border-[#2a3a4a] hover:border-slate-500"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${
                  isActive ? "bg-emerald-500/20" : "bg-[#1a2736]"
                }`}>
                  {isActive ? "✅" : cond.id === "magro" ? "📉" : cond.id === "pesado" ? "📈" : "✅"}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isActive ? "text-emerald-400" : "text-white"}`}>
                    {cond.label}
                  </p>
                  <p className={`text-xs ${isActive ? "text-emerald-500/70" : "text-slate-500"}`}>
                    {cond.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Preview ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Preview — {dayLabel}
          </span>
        </div>

        <div className="space-y-1">
          {preview.map((p) => (
            <div key={p.label} className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a3a4a] last:border-0">
              <span className="text-sm text-slate-300">{p.label}</span>
              <span className="text-xs font-bold">
                <span className="text-yellow-400">{p.seeds.toFixed(1).replace(".", ",")}g sementes</span>
                <span className="text-slate-500"> + </span>
                <span className="text-violet-400">{p.mix.toFixed(1).replace(".", ",")}g mix</span>
                <span className="text-slate-500"> = </span>
                <span className="text-emerald-400">{p.total.toFixed(1).replace(".", ",")}g</span>
              </span>
            </div>
          ))}
        </div>

        {/* daily totals */}
        <div className="mt-4 px-4 py-3 bg-[#0b1120] rounded-xl flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Total diário do plantel ({config.numPigeons} pombos)
          </span>
          <span className="text-sm font-black text-yellow-400">
            {((config.gramsPerDay * config.numPigeons) / 1000).toFixed(2).replace(".", ",")} kg/dia
          </span>
        </div>
      </div>

      {/* ─── Save button ─── */}
      <button
        onClick={saveConfig}
        disabled={saving}
        className={`w-full py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
          saved
            ? "bg-emerald-500 text-white"
            : "bg-yellow-500 hover:bg-yellow-400 text-[#0b1120]"
        }`}
      >
        {saved ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Configuração Salva!
          </>
        ) : saving ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Salvar Configuração
          </>
        )}
      </button>

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-6">
        PigeonMaster AI 2026 — v1 • Módulo Nutrição • Plantel
      </p>
    </div>
  );
}
