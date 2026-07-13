"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Scale, Plus, TrendingUp, TrendingDown, Minus, AlertTriangle, Save, RefreshCw } from "lucide-react";

interface WeightRecord {
  id: number;
  pigeonId: number;
  date: string;
  weight: string;
  ringNumber: string | null;
  pigeonName: string | null;
  idealWeight: string | null;
}

interface Pigeon {
  id: number;
  ringNumber: string;
  name: string | null;
  currentWeight: string | null;
  idealWeight: string | null;
  status: string;
}

function fmtDate(d: string): string {
  return new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function PesoPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const fetchData = useCallback(async () => {
    const [pRes, wRes] = await Promise.all([fetch("/api/pigeons"), fetch("/api/weights")]);
    const pData = await pRes.json();
    setPigeons(pData.filter((p: Pigeon) => p.status === "ativo" || p.status === "em_tratamento" || p.status === "doente"));
    setRecords(await wRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const selected = pigeons.find((p) => p.id === selectedId) || null;
  const selectedRecords = useMemo(
    () => records.filter((r) => r.pigeonId === selectedId).sort((a, b) => a.date.localeCompare(b.date)),
    [records, selectedId]
  );

  async function addWeight() {
    if (!selectedId || !newWeight) return;
    setSaving(true);
    await fetch("/api/weights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pigeonId: selectedId,
        date: new Date().toISOString().slice(0, 10),
        weight: newWeight,
      }),
    });
    setNewWeight("");
    await fetchData();
    setSaving(false);
  }

  /* status per pigeon: latest weight vs ideal */
  function weightStatus(p: Pigeon): { label: string; color: string; icon: "up" | "down" | "ok" | null } {
    const ideal = p.idealWeight ? parseFloat(p.idealWeight) : null;
    const current = p.currentWeight ? parseFloat(p.currentWeight) : null;
    if (!ideal || !current) return { label: "—", color: "text-slate-500", icon: null };
    const diff = ((current - ideal) / ideal) * 100;
    if (diff > 4) return { label: `+${diff.toFixed(1)}% pesado`, color: "text-red-400", icon: "up" };
    if (diff < -4) return { label: `${diff.toFixed(1)}% magro`, color: "text-orange-400", icon: "down" };
    return { label: "No peso ideal", color: "text-emerald-400", icon: "ok" };
  }

  /* simple SVG chart */
  function WeightChart() {
    if (selectedRecords.length < 2) return null;
    const weights = selectedRecords.map((r) => parseFloat(r.weight));
    const ideal = selected?.idealWeight ? parseFloat(selected.idealWeight) : null;
    const all = ideal ? [...weights, ideal] : weights;
    const min = Math.min(...all) - 10;
    const max = Math.max(...all) + 10;
    const W = 600, H = 160, PAD = 10;
    const x = (i: number) => PAD + (i / (selectedRecords.length - 1)) * (W - PAD * 2);
    const y = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    const path = weights.map((w, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(w)}`).join(" ");

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
        {ideal && (
          <>
            <line x1={PAD} y1={y(ideal)} x2={W - PAD} y2={y(ideal)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
            <text x={W - PAD - 4} y={y(ideal) - 5} fill="#10b981" fontSize="11" textAnchor="end" opacity="0.8">ideal {ideal}g</text>
          </>
        )}
        <path d={path} fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(w)} r="4" fill="#eab308" />
            <text x={x(i)} y={y(w) - 9} fill="#e2e8f0" fontSize="11" textAnchor="middle" fontWeight="bold">{w}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  const alerts = pigeons.filter((p) => {
    const s = weightStatus(p);
    return s.icon === "up" || s.icon === "down";
  });

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Scale className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-extrabold text-white">Controle de Peso</h1>
        </div>
        <p className="text-sm text-slate-400">Pesagens, evolução e alertas de forma física</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Fora do peso ideal ({alerts.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((p) => {
              const s = weightStatus(p);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`px-3 py-1 bg-[#0b1120] border border-amber-500/30 rounded-full text-[11px] font-bold ${s.color}`}
                >
                  {p.name || p.ringNumber}: {s.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pigeon selector */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selecionar pombo</p>
        <div className="flex flex-wrap gap-2">
          {pigeons.map((p) => {
            const s = weightStatus(p);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedId === p.id
                    ? "bg-yellow-500 text-[#0b1120]"
                    : "bg-[#0b1120] border border-[#2a3a4a] text-slate-400 hover:text-white"
                }`}
              >
                {p.name || p.ringNumber}
                {s.icon === "up" && " 📈"}
                {s.icon === "down" && " 📉"}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <>
          {/* Current status */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Peso Atual</p>
              <p className="text-2xl font-black text-yellow-400">{selected.currentWeight ? `${parseFloat(selected.currentWeight)}g` : "—"}</p>
            </div>
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Peso Ideal</p>
              <p className="text-2xl font-black text-emerald-400">{selected.idealWeight ? `${parseFloat(selected.idealWeight)}g` : "—"}</p>
            </div>
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Status</p>
              <p className={`text-sm font-black mt-1.5 ${weightStatus(selected).color}`}>
                {weightStatus(selected).label}
              </p>
            </div>
          </div>

          {/* Add weight */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">⚖️ Nova pesagem (hoje)</p>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Ex: 445"
                className="flex-1 px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-xl font-black text-center focus:ring-2 focus:ring-yellow-500"
              />
              <span className="flex items-center text-sm text-slate-500 font-bold">gramas</span>
              <button
                onClick={addWeight}
                disabled={saving || !newWeight}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center gap-2"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </button>
            </div>
          </div>

          {/* Chart */}
          {selectedRecords.length >= 2 && (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">📈 Evolução do peso</p>
              <WeightChart />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-2">
                <span>{fmtDate(selectedRecords[0].date)}</span>
                <span>{fmtDate(selectedRecords[selectedRecords.length - 1].date)}</span>
              </div>
            </div>
          )}

          {/* History */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Histórico de pesagens</p>
            {selectedRecords.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-6">Nenhuma pesagem registrada</p>
            ) : (
              <div className="space-y-1.5">
                {[...selectedRecords].reverse().map((r, i, arr) => {
                  const prev = arr[i + 1];
                  const diff = prev ? parseFloat(r.weight) - parseFloat(prev.weight) : 0;
                  return (
                    <div key={r.id} className="flex items-center justify-between px-4 py-2.5 bg-[#0b1120] rounded-lg">
                      <span className="text-xs text-slate-400">{fmtDate(r.date)}</span>
                      <div className="flex items-center gap-3">
                        {prev && diff !== 0 && (
                          <span className={`text-[10px] font-bold flex items-center gap-0.5 ${diff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                            {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {diff > 0 ? "+" : ""}{diff.toFixed(1)}g
                          </span>
                        )}
                        <span className="text-sm font-black text-white">{parseFloat(r.weight)}g</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!selected && (
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-12 text-center">
          <Scale className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Selecione um pombo para registrar e acompanhar o peso</p>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • Controle de Peso</p>
    </div>
  );
}
