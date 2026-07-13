"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bird, Plus, Search, Filter, ChevronRight, Heart, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Pigeon {
  id: number;
  ringNumber: string;
  internalCode: string | null;
  name: string | null;
  sex: string;
  color: string | null;
  breed: string | null;
  status: string;
  category: string;
  birthDate: string | null;
  currentWeight: string | null;
}

export default function PigeonsPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    ringNumber: "",
    name: "",
    sex: "desconhecido",
    color: "",
    breed: "",
    status: "ativo",
    category: "atleta",
    birthDate: "",
    observations: "",
  });

  useEffect(() => {
    fetchPigeons();
  }, [search, filterStatus]);

  async function fetchPigeons() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/pigeons?${params}`);
    const data = await res.json();
    setPigeons(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pigeons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setShowForm(false);
      setFormData({
        ringNumber: "",
        name: "",
        sex: "desconhecido",
        color: "",
        breed: "",
        status: "ativo",
        category: "atleta",
        birthDate: "",
        observations: "",
      });
      fetchPigeons();
    }
  }

  const statusColors: Record<string, string> = {
    ativo: "bg-emerald-100 text-emerald-700",
    morto: "bg-slate-100 text-slate-700",
    vendido: "bg-blue-100 text-blue-700",
    emprestado: "bg-amber-100 text-amber-700",
    desaparecido: "bg-red-100 text-red-700",
    aposentado: "bg-slate-100 text-slate-700",
    doente: "bg-red-100 text-red-700",
    em_tratamento: "bg-orange-100 text-orange-700",
  };

  const categoryLabels: Record<string, string> = {
    reprodutor: "Reprodutor",
    atleta: "Atleta",
    filhote: "Filhote",
    viuvo: "Viúvo",
    aposentado: "Aposentado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pombos</h1>
          <p className="text-slate-500">Gerencie seu plantel completo</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Pombo
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Cadastrar Novo Pombo</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nº Anilha *</label>
              <input
                required
                value={formData.ringNumber}
                onChange={(e) => setFormData({ ...formData, ringNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="desconhecido">Desconhecido</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cor</label>
              <input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Raça</label>
              <input
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="atleta">Atleta</option>
                <option value="reprodutor">Reprodutor</option>
                <option value="filhote">Filhote</option>
                <option value="viuvo">Viúvo</option>
                <option value="aposentado">Aposentado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="ativo">Ativo</option>
                <option value="doente">Doente</option>
                <option value="em_tratamento">Em Tratamento</option>
                <option value="aposentado">Aposentado</option>
                <option value="desaparecido">Desaparecido</option>
                <option value="morto">Morto</option>
                <option value="vendido">Vendido</option>
                <option value="emprestado">Emprestado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Salvar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Buscar por anilha, nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="doente">Doente</option>
            <option value="em_tratamento">Em Tratamento</option>
            <option value="desaparecido">Desaparecido</option>
            <option value="morto">Morto</option>
            <option value="vendido">Vendido</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : pigeons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Bird className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum pombo encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Anilha</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Nome</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Sexo</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Raça</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Categoria</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Nascimento</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pigeons.map((pigeon) => (
                  <tr key={pigeon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Bird className="w-4 h-4 text-emerald-500" />
                        <span className="font-medium text-slate-900">{pigeon.ringNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{pigeon.name || "—"}</td>
                    <td className="px-4 py-3">
                      {pigeon.sex === "macho" ? (
                        <span className="flex items-center gap-1 text-sky-600">
                          <Bird className="w-4 h-4" /> Macho
                        </span>
                      ) : pigeon.sex === "femea" ? (
                        <span className="flex items-center gap-1 text-pink-600">
                          <Heart className="w-4 h-4" /> Fêmea
                        </span>
                      ) : (
                        <span className="text-slate-400">Desconhecido</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{pigeon.breed || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{categoryLabels[pigeon.category] || pigeon.category}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[pigeon.status] || "bg-slate-100 text-slate-700"}`}>
                        {pigeon.status === "doente" && <AlertCircle className="w-3 h-3" />}
                        {pigeon.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(pigeon.birthDate)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/pombos/${pigeon.id}`}
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Detalhes <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
