"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  Plus,
  CheckCircle,
  Save,
  X,
  Trash2,
  Bird,
  Calendar,
} from "lucide-react";

/* ────────── checklist semanal ────────── */
const WEEKLY_CHECKLIST = [
  { id: "separar", label: "Separar machos das fêmeas" },
  { id: "motivacao", label: "Verificar motivação (pombo no ninho)" },
  { id: "alimentacao", label: "Ajustar alimentação — carga energética" },
  { id: "treino", label: "Treino curto 48h antes" },
  { id: "apresentar", label: "Apresentar a fêmea 30 min antes do enceste" },
  { id: "enceste", label: "Encestamento motivado" },
  { id: "reencontro", label: "Reencontro após retorno da prova" },
];

/* ────────── tipos de viuvez ────────── */
const WIDOWHOOD_TYPES = [
  { id: "classica", label: "Clássica", desc: "Macho separado da fêmea. Apresentação antes do enceste." },
  { id: "dupla", label: "Dupla", desc: "Ambos, machos e fêmeas separados. Maior motivação." },
  { id: "semi_viuvez", label: "Semi-viuvez", desc: "Separação parcial. Ideal para meio fundo." },
];

interface WidowPair {
  id: number;
  maleId: number;
  femaleId: number;
  type: string;
  separationDate: string | null;
  reunionDate: string | null;
  isActive: boolean;
  maleRing?: string | null;
  maleName?: string | null;
  femaleRing?: string | null;
  femaleName?: string | null;
}

interface Pigeon {
  id: number;
  ringNumber: string;
  name: string | null;
  sex: string;
  status: string;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  const dt = new Date(typeof d === "string" ? d.slice(0, 10) + "T12:00:00" : d);
  return dt.toLocaleDateString("pt-BR");
}

export default function SistemaViuvezPage() {
  const [pairs, setPairs] = useState<WidowPair[]>([]);
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  /* form */
  const [formMale, setFormMale] = useState("");
  const [formFemale, setFormFemale] = useState("");
  const [formType, setFormType] = useState("classica");
  const [formSeparation, setFormSeparation] = useState(() => new Date().toISOString().slice(0, 10));
  const [formReunion, setFormReunion] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });

  const fetchData = useCallback(async () => {
    const [pairsRes, pigeonsRes] = await Promise.all([
      fetch("/api/widowhood"),
      fetch("/api/pigeons"),
    ]);
    setPairs(await pairsRes.json());
    setPigeons(await pigeonsRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── checklist with weekly reset (per ISO week) ─── */
  useEffect(() => {
    try {
      const now = new Date();
      const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}-${now.getMonth()}`;
      const saved = localStorage.getItem("viuvez_checklist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.week === weekKey) {
          setChecklist(parsed.items || {});
        } else {
          localStorage.setItem("viuvez_checklist", JSON.stringify({ week: weekKey, items: {} }));
        }
      }
    } catch { /* ignore */ }
  }, []);

  function toggleCheck(id: string) {
    setChecklist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        const now = new Date();
        const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() + new Date(now.getFullYear(), now.getMonth(), 1).getDay()) / 7)}-${now.getMonth()}`;
        localStorage.setItem("viuvez_checklist", JSON.stringify({ week: weekKey, items: next }));
      } catch { /* ignore */ }
      return next;
    });
  }

  async function handleSave() {
    if (!formMale || !formFemale) return;
    await fetch("/api/widowhood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        maleId: formMale,
        femaleId: formFemale,
        type: formType,
        separationDate: formSeparation,
        reunionDate: formReunion,
      }),
    });
    setShowForm(false);
    setFormMale("");
    setFormFemale("");
    setFormType("classica");
    fetchData();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/widowhood/${id}`, { method: "DELETE" });
    fetchData();
  }

  const males = pigeons.filter((p) => p.sex === "macho" && p.status === "ativo");
  const females = pigeons.filter((p) => p.sex === "femea" && p.status === "ativo");
  const doneCount = WEEKLY_CHECKLIST.filter((c) => checklist[c.id]).length;

  const typeLabels: Record<string, string> = {
    classica: "Clássica",
    dupla: "Dupla",
    semi_viuvez: "Semi-viuvez",
  };

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
        <Link href="/reproducao" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-extrabold text-white">Sistema de Viuvez</h1>
        </div>
        <p className="text-sm text-slate-400">Controle de casais e ciclos motivacionais</p>
      </div>

      {/* ─── Checklist Semanal ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">✅</span>
            <span className="text-sm font-extrabold text-yellow-400">Checklist Semanal</span>
          </div>
          <span className="text-xs text-slate-500 font-bold">{doneCount}/{WEEKLY_CHECKLIST.length}</span>
        </div>

        {/* progress bar */}
        <div className="w-full bg-[#0b1120] rounded-full h-1.5 overflow-hidden mb-4">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / WEEKLY_CHECKLIST.length) * 100}%` }}
          />
        </div>

        <div className="space-y-2">
          {WEEKLY_CHECKLIST.map((item) => {
            const isDone = !!checklist[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  isDone
                    ? "bg-emerald-500/5 border-emerald-500/30"
                    : "bg-[#0b1120] border-[#2a3a4a] hover:border-yellow-500/30"
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-md border-2 border-slate-600 shrink-0" />
                )}
                <span className={`text-sm ${isDone ? "text-emerald-400 line-through" : "text-slate-300"}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Tipos de Viuvez ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm">📖</span>
          <span className="text-sm font-extrabold text-yellow-400">Tipos de Viuvez</span>
        </div>
        <div className="space-y-4">
          {WIDOWHOOD_TYPES.map((type) => (
            <div key={type.id} className="border-b border-[#2a3a4a] last:border-0 pb-3 last:pb-0">
              <p className="text-sm font-bold text-yellow-400 mb-0.5">{type.label}</p>
              <p className="text-xs text-slate-400">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Casais Ativos ─── */}
      {pairs.length > 0 && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm">💑</span>
            <span className="text-sm font-extrabold text-yellow-400">Casais em Viuvez ({pairs.length})</span>
          </div>
          <div className="space-y-2.5">
            {pairs.map((pair) => (
              <div key={pair.id} className="bg-[#0b1120] rounded-xl p-4 border border-[#2a3a4a]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 rounded text-[10px] font-black uppercase">
                      {typeLabels[pair.type] || pair.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(pair.id)}
                    className="p-1.5 bg-red-500/15 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 bg-[#1a2736] rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-sky-400 font-bold uppercase mb-0.5">♂ Macho</p>
                    <p className="text-xs font-bold text-white">{pair.maleRing || `#${pair.maleId}`}</p>
                    {pair.maleName && <p className="text-[10px] text-slate-500">{pair.maleName}</p>}
                  </div>
                  <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
                  <div className="flex-1 bg-[#1a2736] rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-pink-400 font-bold uppercase mb-0.5">♀ Fêmea</p>
                    <p className="text-xs font-bold text-white">{pair.femaleRing || `#${pair.femaleId}`}</p>
                    {pair.femaleName && <p className="text-[10px] text-slate-500">{pair.femaleName}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Separação: <span className="text-slate-300 font-semibold">{fmtDate(pair.separationDate)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Reencontro: <span className="text-slate-300 font-semibold">{fmtDate(pair.reunionDate)}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Novo Casal button ─── */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Casal
        </button>
      )}

      {/* ─── Novo Casal form ─── */}
      {showForm && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Plus className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-extrabold text-yellow-400">Novo Casal</span>
          </div>

          {/* Macho */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Macho
            </label>
            <select
              value={formMale}
              onChange={(e) => setFormMale(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Selecionar macho...</option>
              {males.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.ringNumber} {m.name ? `— ${m.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Fêmea */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Fêmea
            </label>
            <select
              value={formFemale}
              onChange={(e) => setFormFemale(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <option value="">Selecionar fêmea...</option>
              {females.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.ringNumber} {f.name ? `— ${f.name}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WIDOWHOOD_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormType(type.id)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                    formType === type.id
                      ? "bg-yellow-500 text-[#0b1120]"
                      : "bg-[#0b1120] border border-[#2a3a4a] text-slate-400 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Separação
              </label>
              <input
                type="date"
                value={formSeparation}
                onChange={(e) => setFormSeparation(e.target.value)}
                className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Reencontro
              </label>
              <input
                type="date"
                value={formReunion}
                onChange={(e) => setFormReunion(e.target.value)}
                className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm font-semibold focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-[#0b1120] border border-[#2a3a4a] hover:border-slate-500 text-slate-400 rounded-xl font-bold text-sm transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formMale || !formFemale}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo Reprodução • Viuvez
      </p>
    </div>
  );
}
