"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  Palette,
  Home,
  Eye,
  EyeOff,
  Bell,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { DAILY_TASKS, type DailyTask } from "@/lib/alerts";
import { INGREDIENTS, type Ingredient } from "@/lib/nutrition";

interface SeedConfig {
  enabledIds: string[];
  customSeeds: Ingredient[];
}

const DEFAULT_SEED_CONFIG: SeedConfig = {
  enabledIds: INGREDIENTS.map((i) => i.id),
  customSeeds: [],
};

/* ────────── types ────────── */
interface Customization {
  loftName: string;
  breederName: string;
  city: string;
  slogan: string;
  accentColor: string;
  hiddenModules: string[];
}

const DEFAULT_CUSTOM: Customization = {
  loftName: "PigeonMaster",
  breederName: "",
  city: "",
  slogan: "AI Columbofilia",
  accentColor: "#10b981",
  hiddenModules: [],
};

const ACCENT_COLORS = [
  { hex: "#10b981", name: "Verde" },
  { hex: "#eab308", name: "Dourado" },
  { hex: "#3b82f6", name: "Azul" },
  { hex: "#8b5cf6", name: "Roxo" },
  { hex: "#ef4444", name: "Vermelho" },
  { hex: "#f97316", name: "Laranja" },
  { hex: "#ec4899", name: "Rosa" },
  { hex: "#06b6d4", name: "Ciano" },
];

const ALL_MODULES = [
  { href: "/pombos", label: "Pombos" },
  { href: "/genealogia", label: "Genealogia" },
  { href: "/peso", label: "Controle de Peso" },
  { href: "/reproducao", label: "Reprodução" },
  { href: "/saude", label: "Saúde" },
  { href: "/nutricao", label: "Alimentação" },
  { href: "/treinamentos", label: "Treinamentos" },
  { href: "/provas", label: "Centro de Provas" },
  { href: "/ranking", label: "Ranking" },
  { href: "/alertas", label: "Central de Alertas" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/estoque", label: "Estoque" },
  { href: "/ia", label: "IA PigeonMaster" },
  { href: "/backup", label: "Backup" },
];

export default function ConfiguracoesPage() {
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOM);
  const [tasks, setTasks] = useState<DailyTask[]>(DAILY_TASKS);
  const [seedConfig, setSeedConfig] = useState<SeedConfig>(DEFAULT_SEED_CONFIG);
  const [newSeed, setNewSeed] = useState({ name: "", protein: "", fat: "", energy: "", price: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cRes, tRes, sRes] = await Promise.all([
        fetch("/api/settings?key=customization"),
        fetch("/api/settings?key=custom_tasks"),
        fetch("/api/settings?key=seed_config"),
      ]);
      const cData = await cRes.json();
      const tData = await tRes.json();
      const sData = await sRes.json();
      if (cData.value) setCustom({ ...DEFAULT_CUSTOM, ...cData.value });
      if (tData.value?.tasks?.length) setTasks(tData.value.tasks);
      if (sData.value?.enabledIds) setSeedConfig({ ...DEFAULT_SEED_CONFIG, ...sData.value });
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveAll() {
    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "customization", value: custom }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "custom_tasks", value: { tasks } }),
        }),
        fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "seed_config", value: seedConfig }),
        }),
      ]);
      /* cache for sidebar/alarm instant read */
      try {
        localStorage.setItem("pm_customization", JSON.stringify(custom));
        localStorage.setItem("pm_custom_tasks", JSON.stringify(tasks));
      } catch { /* ignore */ }
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        window.location.reload(); // apply sidebar changes
      }, 1200);
    } catch { /* ignore */ }
    setSaving(false);
  }

  function toggleModule(href: string) {
    setCustom((c) => ({
      ...c,
      hiddenModules: c.hiddenModules.includes(href)
        ? c.hiddenModules.filter((h) => h !== href)
        : [...c.hiddenModules, href],
    }));
  }

  /* task editing */
  function updateTask(idx: number, field: keyof DailyTask, value: string) {
    setTasks((prev) => prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  }

  function removeTask(idx: number) {
    setTasks((prev) => prev.filter((_, i) => i !== idx));
  }

  function addTask() {
    setTasks((prev) => [
      ...prev,
      { id: `custom_${Date.now()}`, time: "12:00", title: "Nova tarefa", description: "Descrição da tarefa", emoji: "📌" },
    ]);
  }

  function restoreDefaultTasks() {
    setTasks(DAILY_TASKS);
  }

  /* seed helpers */
  function toggleSeed(id: string) {
    setSeedConfig((sc) => ({
      ...sc,
      enabledIds: sc.enabledIds.includes(id)
        ? sc.enabledIds.filter((s) => s !== id)
        : [...sc.enabledIds, id],
    }));
  }

  function addCustomSeed() {
    const name = newSeed.name.trim();
    if (!name) return;
    const id = `custom_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`;
    const seed: Ingredient = {
      id,
      name,
      protein: parseFloat(newSeed.protein) || 100,
      fat: parseFloat(newSeed.fat) || 30,
      carbs: 600,
      energy: parseFloat(newSeed.energy) || 3400,
      price: parseFloat(newSeed.price) || 3,
      color: "#a3a3a3",
    };
    setSeedConfig((sc) => ({
      ...sc,
      customSeeds: [...sc.customSeeds, seed],
      enabledIds: [...sc.enabledIds, id],
    }));
    setNewSeed({ name: "", protein: "", fat: "", energy: "", price: "" });
  }

  function removeCustomSeed(id: string) {
    setSeedConfig((sc) => ({
      ...sc,
      customSeeds: sc.customSeeds.filter((s) => s.id !== id),
      enabledIds: sc.enabledIds.filter((s) => s !== id),
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8 pb-28">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-extrabold text-white">Personalização</h1>
        </div>
        <p className="text-sm text-slate-400">Deixe o app com a cara do SEU pombal 🐦✨</p>
      </div>

      {/* ─── Identidade do Pombal ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Identidade do Pombal</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nome do Pombal *</label>
            <input
              value={custom.loftName}
              onChange={(e) => setCustom({ ...custom, loftName: e.target.value })}
              placeholder="Ex: Pombal Estrela do Sul"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white font-bold placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-[10px] text-slate-600 mt-1">Aparece no topo do menu, no lugar de &quot;PigeonMaster&quot;</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Slogan / Subtítulo</label>
            <input
              value={custom.slogan}
              onChange={(e) => setCustom({ ...custom, slogan: e.target.value })}
              placeholder="Ex: Campeões desde 1998"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Nome do Criador</label>
            <input
              value={custom.breederName}
              onChange={(e) => setCustom({ ...custom, breederName: e.target.value })}
              placeholder="Seu nome"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cidade</label>
            <input
              value={custom.city}
              onChange={(e) => setCustom({ ...custom, city: e.target.value })}
              placeholder="Ex: Ribeirão Preto - SP"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* ─── Cor do Tema ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Cor do Seu Pombal</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => setCustom({ ...custom, accentColor: color.hex })}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                custom.accentColor === color.hex ? "bg-white/10 ring-2 ring-white/40" : "hover:bg-white/5"
              }`}
            >
              <span
                className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                {custom.accentColor === color.hex && <CheckCircle className="w-5 h-5 text-white" />}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">{color.name}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-3">A cor é aplicada no menu lateral e nos destaques do app</p>
      </div>

      {/* ─── Módulos Visíveis ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Módulos do Menu</span>
        </div>
        <p className="text-[10px] text-slate-500 mb-4">
          Desligue o que você não usa — o menu fica só com o que importa para VOCÊ
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ALL_MODULES.map((mod) => {
            const isHidden = custom.hiddenModules.includes(mod.href);
            return (
              <button
                key={mod.href}
                onClick={() => toggleModule(mod.href)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                  isHidden
                    ? "bg-[#0b1120] border-[#2a3a4a] opacity-50"
                    : "bg-emerald-500/5 border-emerald-500/30"
                }`}
              >
                <span className={`text-sm font-semibold ${isHidden ? "text-slate-500 line-through" : "text-white"}`}>
                  {mod.label}
                </span>
                {isHidden ? (
                  <EyeOff className="w-4 h-4 text-slate-600" />
                ) : (
                  <Eye className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Sementes e Grãos ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm">🌾</span>
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
            Sementes e Grãos ({seedConfig.enabledIds.length} ativos)
          </span>
        </div>
        <p className="text-[10px] text-slate-500 mb-4">
          Cada criador usa sua própria mistura! Ative os grãos que você usa — só eles aparecem na fórmula (aba 🧪 Proteína da Alimentação).
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {INGREDIENTS.map((ing) => {
            const isOn = seedConfig.enabledIds.includes(ing.id);
            return (
              <button
                key={ing.id}
                onClick={() => toggleSeed(ing.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                  isOn
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-[#0b1120] border-[#2a3a4a] opacity-50"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  isOn ? "bg-emerald-500 border-emerald-500" : "border-slate-600"
                }`}>
                  {isOn && <span className="text-[9px] text-white font-black">✓</span>}
                </div>
                <span className={`text-xs font-semibold truncate ${isOn ? "text-white" : "text-slate-500"}`}>
                  {ing.name}
                </span>
              </button>
            );
          })}

          {/* custom seeds */}
          {seedConfig.customSeeds.map((seed) => {
            const isOn = seedConfig.enabledIds.includes(seed.id);
            return (
              <div
                key={seed.id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${
                  isOn ? "bg-violet-500/5 border-violet-500/30" : "bg-[#0b1120] border-[#2a3a4a] opacity-50"
                }`}
              >
                <button onClick={() => toggleSeed(seed.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                    isOn ? "bg-violet-500 border-violet-500" : "border-slate-600"
                  }`}>
                    {isOn && <span className="text-[9px] text-white font-black">✓</span>}
                  </div>
                  <span className={`text-xs font-semibold truncate ${isOn ? "text-violet-300" : "text-slate-500"}`}>
                    {seed.name} ✨
                  </span>
                </button>
                <button
                  onClick={() => removeCustomSeed(seed.id)}
                  className="p-1 text-red-400 hover:text-red-300 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* add custom seed */}
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">➕ Adicionar semente própria</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <input
            value={newSeed.name}
            onChange={(e) => setNewSeed({ ...newSeed, name: e.target.value })}
            placeholder="Nome da semente"
            className="col-span-2 px-3 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-xs placeholder-slate-600 focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="number"
            value={newSeed.protein}
            onChange={(e) => setNewSeed({ ...newSeed, protein: e.target.value })}
            placeholder="Prot g/kg"
            className="px-2 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-xs text-center placeholder-slate-600"
          />
          <input
            type="number"
            value={newSeed.fat}
            onChange={(e) => setNewSeed({ ...newSeed, fat: e.target.value })}
            placeholder="Gord g/kg"
            className="px-2 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-xs text-center placeholder-slate-600"
          />
          <input
            type="number"
            value={newSeed.price}
            onChange={(e) => setNewSeed({ ...newSeed, price: e.target.value })}
            placeholder="R$/kg"
            className="px-2 py-2.5 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-xs text-center placeholder-slate-600"
          />
          <button
            onClick={addCustomSeed}
            className="px-3 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black text-xs transition-colors"
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* ─── Rotina de Alertas Editável ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">
              Minha Rotina Diária ({tasks.length} tarefas)
            </span>
          </div>
          <button
            onClick={restoreDefaultTasks}
            className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors"
          >
            Restaurar padrão
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mb-4">
          Edite horários, nomes e descrições — os alertas sonoros seguem a SUA rotina
        </p>

        <div className="space-y-2 mb-4">
          {tasks.map((task, idx) => (
            <div key={task.id} className="flex items-center gap-2 bg-[#0b1120] rounded-xl p-2.5">
              <GripVertical className="w-4 h-4 text-slate-700 shrink-0" />
              <input
                value={task.emoji}
                onChange={(e) => updateTask(idx, "emoji", e.target.value)}
                className="w-10 px-1 py-2 bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-center text-sm"
                maxLength={2}
              />
              <input
                type="time"
                value={task.time}
                onChange={(e) => updateTask(idx, "time", e.target.value)}
                className="w-24 px-2 py-2 bg-[#1a2736] border border-yellow-500/30 rounded-lg text-yellow-400 text-sm font-bold text-center shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  value={task.title}
                  onChange={(e) => updateTask(idx, "title", e.target.value)}
                  placeholder="Nome da tarefa"
                  className="w-full px-2 py-1.5 bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-white text-xs font-bold"
                />
                <input
                  value={task.description}
                  onChange={(e) => updateTask(idx, "description", e.target.value)}
                  placeholder="Descrição"
                  className="w-full px-2 py-1.5 bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 text-[10px]"
                />
              </div>
              <button
                onClick={() => removeTask(idx)}
                className="p-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-lg transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={addTask}
          className="w-full py-3 bg-[#0b1120] border border-dashed border-[#2a3a4a] hover:border-yellow-500/40 rounded-xl text-sm font-bold text-slate-400 hover:text-yellow-400 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar tarefa personalizada
        </button>
      </div>

      {/* ─── Floating Save Button ─── */}
      <div className="fixed bottom-6 left-72 right-6 z-40 max-w-3xl mx-auto">
        <button
          onClick={saveAll}
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-2xl ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-yellow-500 hover:bg-yellow-400 text-[#0b1120]"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Salvo! Aplicando personalização...
            </>
          ) : saving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Personalização
            </>
          )}
        </button>
      </div>
    </div>
  );
}
