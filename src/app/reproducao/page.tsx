"use client";

import { useEffect, useState } from "react";
import { Dna, Plus, Heart, Egg, Baby, AlertCircle, Bird } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface BreedingPair {
  id: number;
  maleId: number;
  femaleId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notes: string | null;
  maleName?: string;
  femaleName?: string;
  maleRing?: string;
  femaleRing?: string;
}

interface EggData {
  id: number;
  pairId: number;
  layDate: string;
  expectedHatchDate: string | null;
  status: string;
}

export default function ReproductionPage() {
  const [pairs, setPairs] = useState<BreedingPair[]>([]);
  const [eggs, setEggs] = useState<EggData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pigeons, setPigeons] = useState<Array<{ id: number; name: string | null; ringNumber: string; sex: string }>>([]);
  const [formData, setFormData] = useState({ maleId: "", femaleId: "", startDate: "", notes: "" });

  useEffect(() => {
    fetchPairs();
    fetchPigeons();
    fetchEggs();
  }, []);

  async function fetchPairs() {
    const res = await fetch("/api/breeding-pairs");
    const data = await res.json();
    setPairs(data);
  }

  async function fetchPigeons() {
    const res = await fetch("/api/pigeons");
    const data = await res.json();
    setPigeons(data);
  }

  async function fetchEggs() {
    const res = await fetch("/api/eggs");
    const data = await res.json();
    setEggs(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/breeding-pairs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({ maleId: "", femaleId: "", startDate: "", notes: "" });
      fetchPairs();
    }
  }

  const males = pigeons.filter((p) => p.sex === "macho");
  const females = pigeons.filter((p) => p.sex === "femea");
  const activePairs = pairs.filter((p) => p.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reprodução</h1>
          <p className="text-slate-500">Controle de casais, ovos e filhotes</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/reproducao/viuvez"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            ❤️ Sistema de Viuvez
          </a>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Novo Casal
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Formar Novo Casal</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Macho</label>
              <select
                required
                value={formData.maleId}
                onChange={(e) => setFormData({ ...formData, maleId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Selecione</option>
                {males.map((m) => (
                  <option key={m.id} value={m.id}>{m.ringNumber} {m.name ? `- ${m.name}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fêmea</label>
              <select
                required
                value={formData.femaleId}
                onChange={(e) => setFormData({ ...formData, femaleId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Selecione</option>
                {females.map((f) => (
                  <option key={f.id} value={f.id}>{f.ringNumber} {f.name ? `- ${f.name}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Início</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg">Salvar</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-slate-300 rounded-lg">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Dna className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{activePairs.length}</p>
              <p className="text-sm text-slate-500">Casais Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Egg className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{eggs.length}</p>
              <p className="text-sm text-slate-500">Ovos Registrados</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Baby className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{eggs.filter((e) => e.status === "nascido").length}</p>
              <p className="text-sm text-slate-500">Nascimentos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Casais</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Macho</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Fêmea</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Início</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Ovos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pairs.map((pair) => {
                const pairEggs = eggs.filter((e) => e.pairId === pair.id);
                return (
                  <tr key={pair.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bird className="w-4 h-4 text-sky-500" />
                        <span className="font-medium">{pair.maleRing || `ID ${pair.maleId}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">{pair.femaleRing || `ID ${pair.femaleId}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(pair.startDate)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pair.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {pair.isActive ? "Ativo" : "Encerrado"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">{pairEggs.length}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
