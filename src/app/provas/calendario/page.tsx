"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Pencil,
  Eye,
  Trash2,
  X,
  CheckSquare,
  Zap,
  Flame,
  Target,
  Rocket,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";

/* ────────── types ────────── */
interface Competition {
  id: number;
  orderNumber: number | null;
  name: string;
  club: string | null;
  federation: string | null;
  date: string;
  arrivalDate: string | null;
  type: string;
  distance: string | null;
  liberationPoint: string | null;
  arrivalPoint: string | null;
  status: string;
  notes: string | null;
}

type FormData = {
  name: string;
  club: string;
  date: string;
  arrivalDate: string;
  type: string;
  distance: string;
  liberationPoint: string;
  status: string;
  notes: string;
};

const emptyForm: FormData = {
  name: "",
  club: "",
  date: "",
  arrivalDate: "",
  type: "velocidade",
  distance: "",
  liberationPoint: "",
  status: "agendada",
  notes: "",
};

/* ────────── helpers ────────── */

/** Sábado 04/07/2026 */
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

/** Days until competition from today */
function daysUntil(d: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(d + "T12:00:00");
  target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
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

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "velocidade":
      return <Zap className="w-4 h-4" />;
    case "meio_fundo":
      return <Flame className="w-4 h-4" />;
    case "fundo":
      return <Target className="w-4 h-4" />;
    case "ultra_fundo":
      return <Rocket className="w-4 h-4" />;
    default:
      return <Zap className="w-4 h-4" />;
  }
}

function statusBadge(status: string) {
  switch (status) {
    case "realizada":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckSquare className="w-3 h-3" />
          Realizada
        </span>
      );
    case "adiada":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          Adiada
        </span>
      );
    case "cancelada":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          <X className="w-3 h-3" />
          Cancelada
        </span>
      );
    default:
      return null; // agendada: no badge
  }
}

/* ────────── component ────────── */

export default function CompetitionsCalendarPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...emptyForm });
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchCompetitions = useCallback(async () => {
    const res = await fetch("/api/competitions");
    const data = await res.json();
    setCompetitions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitions();
  }, [fetchCompetitions]);

  /* --- form handlers --- */
  function openNew() {
    setEditingId(null);
    setFormData({ ...emptyForm });
    setShowForm(true);
  }

  function openEdit(c: Competition) {
    setEditingId(c.id);
    setFormData({
      name: c.name,
      club: c.club || "",
      date: typeof c.date === "string" ? c.date.slice(0, 10) : "",
      arrivalDate: c.arrivalDate ? (typeof c.arrivalDate === "string" ? c.arrivalDate.slice(0, 10) : "") : "",
      type: c.type,
      distance: c.distance || "",
      liberationPoint: c.liberationPoint || "",
      status: c.status,
      notes: c.notes || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/competitions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch("/api/competitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setShowForm(false);
    setEditingId(null);
    fetchCompetitions();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/competitions/${id}`, { method: "DELETE" });
    setDeleteConfirmId(null);
    fetchCompetitions();
  }

  /* --- derived stats --- */
  const total = competitions.length;
  const adiadas = competitions.filter((c) => c.status === "adiada").length;
  const canceladas = competitions.filter((c) => c.status === "cancelada").length;
  const realizadas = competitions.filter((c) => c.status === "realizada").length;
  const agendadas = competitions.filter((c) => c.status === "agendada").length;

  /* --- determine border color for a card --- */
  function cardBorderColor(c: Competition) {
    if (c.status === "realizada") return "border-l-slate-500";
    if (c.status === "adiada") return "border-l-amber-500";
    if (c.status === "cancelada") return "border-l-red-500";
    // upcoming → gold accent
    return "border-l-yellow-500";
  }

  /* --- detail modal --- */
  const detailComp = competitions.find((c) => c.id === detailId);

  return (
    <div className="min-h-screen bg-[#0f1923] text-white -m-6 p-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/provas" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <span className="text-3xl">📅</span>
          <div>
            <h1 className="text-2xl font-bold text-white">Calendário de Provas</h1>
            <p className="text-sm text-slate-400">
              {total} provas • Totalmente editável
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-sm transition-colors shadow-lg shadow-emerald-900/30"
        >
          <Plus className="w-4 h-4" />
          Nova prova
        </button>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-blue-400">{total}</p>
        </div>
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Realizadas</p>
          <p className="text-3xl font-bold text-emerald-400">{realizadas}</p>
        </div>
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Adiadas</p>
          <p className="text-3xl font-bold text-amber-400">{adiadas}</p>
        </div>
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Canceladas</p>
          <p className="text-3xl font-bold text-red-400">{canceladas}</p>
        </div>
      </div>

      {/* ─── Form Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Prova" : "Nova Prova"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome / Cidade *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cravinhos — SP"
                  className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Clube</label>
                <input
                  value={formData.club}
                  onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  >
                    <option value="velocidade">Velocidade</option>
                    <option value="meio_fundo">Meio Fundo</option>
                    <option value="fundo">Fundo</option>
                    <option value="ultra_fundo">Ultra Fundo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Distância (km) *</label>
                  <input
                    required
                    type="number"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="144"
                    className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Data Solta *</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Data Chegada</label>
                  <input
                    type="date"
                    value={formData.arrivalDate}
                    onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                >
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="adiada">Adiada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Observações</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-[#0f1923] border border-[#2a3a4a] rounded-lg text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
                >
                  {editingId ? "Salvar Alterações" : "Criar Prova"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-[#2a3a4a] hover:bg-[#354a5e] text-slate-300 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailComp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Detalhes da Prova</h2>
              <button onClick={() => setDetailId(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-yellow-400">#{detailComp.orderNumber}</span>
                <div>
                  <h3 className="text-lg font-bold text-white">{detailComp.name}</h3>
                  {detailComp.club && <p className="text-sm text-slate-400">{detailComp.club}</p>}
                </div>
              </div>
              <div className="bg-[#0f1923] rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Tipo</span>
                  <span className={`text-sm font-semibold ${typeColor(detailComp.type)}`}>{typeLabel(detailComp.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Distância</span>
                  <span className="text-white text-sm font-semibold">{detailComp.distance ? `${Math.round(parseFloat(detailComp.distance))}km` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Data Solta</span>
                  <span className="text-white text-sm">{fmtWeekday(typeof detailComp.date === "string" ? detailComp.date.slice(0, 10) : null)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Data Chegada</span>
                  <span className="text-white text-sm">{detailComp.arrivalDate ? fmtWeekday(typeof detailComp.arrivalDate === "string" ? detailComp.arrivalDate.slice(0, 10) : null) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span>{statusBadge(detailComp.status) || <span className="text-blue-400 text-sm font-semibold">Agendada</span>}</span>
                </div>
              </div>
              {detailComp.notes && (
                <div className="bg-[#0f1923] rounded-lg p-4">
                  <p className="text-xs text-slate-400 uppercase mb-1">Observações</p>
                  <p className="text-sm text-slate-300">{detailComp.notes}</p>
                </div>
              )}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setDetailId(null); openEdit(detailComp); }}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Editar
              </button>
              <button onClick={() => setDetailId(null)} className="px-5 py-2 bg-[#2a3a4a] hover:bg-[#354a5e] text-slate-300 rounded-lg font-semibold text-sm transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation ─── */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a2736] border border-red-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <Trash2 className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Excluir prova?</h3>
            <p className="text-sm text-slate-400 mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold transition-colors"
              >
                Sim, Excluir
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-[#2a3a4a] hover:bg-[#354a5e] text-slate-300 rounded-lg font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Competition Cards List ─── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        </div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-20">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Nenhuma prova cadastrada</p>
          <button
            onClick={openNew}
            className="mt-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-semibold text-sm transition-colors"
          >
            Criar primeira prova
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {competitions.map((c, idx) => {
            const dateStr = typeof c.date === "string" ? c.date.slice(0, 10) : "";
            const arrStr = c.arrivalDate ? (typeof c.arrivalDate === "string" ? c.arrivalDate.slice(0, 10) : "") : "";
            const days = daysUntil(dateStr);
            const isPast = c.status === "realizada";
            const num = c.orderNumber ?? idx + 1;

            return (
              <div
                key={c.id}
                className={`bg-[#1a2736] border border-[#2a3a4a] rounded-xl overflow-hidden border-l-4 ${cardBorderColor(c)} transition-all hover:bg-[#1e2f40]`}
              >
                <div className="flex items-center px-5 py-4">
                  {/* ── Left: info ── */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-3 flex-wrap mb-1.5">
                      <span className="text-slate-500 font-bold text-sm">#{num}</span>
                      <h3 className="text-white font-bold text-base truncate">{c.name}</h3>
                      {statusBadge(c.status)}
                    </div>
                    {/* Meta row */}
                    <div className="flex items-center gap-4 flex-wrap text-sm">
                      <span className={`flex items-center gap-1.5 font-semibold ${typeColor(c.type)}`}>
                        <TypeIcon type={c.type} />
                        {typeLabel(c.type)} • {c.distance ? `${Math.round(parseFloat(c.distance))}km` : "—"}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {fmtWeekday(dateStr)}
                      </span>
                      {arrStr && (
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {fmtWeekday(arrStr)}
                        </span>
                      )}
                      {!isPast && days > 0 && (
                        <span className="text-blue-400 font-semibold text-xs bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {days}d
                        </span>
                      )}
                      {!isPast && days === 0 && (
                        <span className="text-emerald-400 font-semibold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                          HOJE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Right: action buttons ── */}
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => openEdit(c)}
                      title="Editar"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDetailId(c.id)}
                      title="Detalhes"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      title="Excluir"
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
