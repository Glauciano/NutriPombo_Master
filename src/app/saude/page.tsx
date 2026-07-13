"use client";

import { useEffect, useState } from "react";
import { Heart, Plus, Pill, Syringe, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface HealthRecord {
  id: number;
  pigeonId: number;
  pigeonName?: string;
  pigeonRing?: string;
  date: string;
  disease: string | null;
  diagnosis: string | null;
  treatment: string | null;
  result: string | null;
}

interface Vaccination {
  id: number;
  pigeonId: number;
  pigeonName?: string;
  pigeonRing?: string;
  vaccineName: string;
  date: string;
  nextDate: string | null;
}

export default function HealthPage() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [activeTab, setActiveTab] = useState("prontuario");

  useEffect(() => {
    fetchHealth();
    fetchVaccinations();
  }, []);

  async function fetchHealth() {
    const res = await fetch("/api/health");
    const data = await res.json();
    setHealthRecords(data);
  }

  async function fetchVaccinations() {
    const res = await fetch("/api/vaccinations");
    const data = await res.json();
    setVaccinations(data);
  }

  const diseases = ["Tricomoníase", "Coccidiose", "Salmonela", "Vermes", "Respiratória", "Aspergilose", "Varíola", "Paramixovírus", "Adenovírus"];
  const sickPigeons = healthRecords.filter((r) => !r.result || r.result !== "curado");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saúde</h1>
          <p className="text-slate-500">Prontuários, vacinas e calendário sanitário</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/saude/diagnostico"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            🔬 Diagnóstico
          </a>
          <a
            href="/saude/calendario"
            className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            💉 Calendário
          </a>
          <a
            href="/saude/guia"
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            💊 Guia Terapêutico
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{sickPigeons.length}</p>
              <p className="text-sm text-slate-500">Em Tratamento</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{healthRecords.filter((r) => r.result === "curado").length}</p>
              <p className="text-sm text-slate-500">Curados</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Syringe className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vaccinations.length}</p>
              <p className="text-sm text-slate-500">Vacinas Aplicadas</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{vaccinations.filter((v) => v.nextDate && new Date(v.nextDate) > new Date()).length}</p>
              <p className="text-sm text-slate-500">Próximas Doses</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("prontuario")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${activeTab === "prontuario" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
        >
          <Pill className="w-4 h-4" /> Prontuário
        </button>
        <button
          onClick={() => setActiveTab("vacinas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${activeTab === "vacinas" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
        >
          <Syringe className="w-4 h-4" /> Vacinas
        </button>
        <button
          onClick={() => setActiveTab("doencas")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${activeTab === "doencas" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"}`}
        >
          <Heart className="w-4 h-4" /> Doenças
        </button>
      </div>

      {activeTab === "prontuario" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Registros Médicos</h2>
          </div>
          {healthRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Nenhum registro médico encontrado</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Pombo</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Doença</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Diagnóstico</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {healthRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{r.pigeonRing || `ID ${r.pigeonId}`}</td>
                    <td className="px-4 py-3">{r.disease || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{r.diagnosis || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(r.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.result === "curado" ? "bg-emerald-100 text-emerald-700" : r.result ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      }`}>
                        {r.result || "Em tratamento"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "vacinas" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Calendário de Vacinação</h2>
          </div>
          {vaccinations.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Nenhuma vacina registrada</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Pombo</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Vacina</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Próxima Dose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vaccinations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{v.pigeonRing || `ID ${v.pigeonId}`}</td>
                    <td className="px-4 py-3">{v.vaccineName}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(v.date)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(v.nextDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "doencas" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {diseases.map((disease) => {
            const count = healthRecords.filter((r) => r.disease === disease).length;
            return (
              <div key={disease} className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-medium text-slate-900">{disease}</h3>
                <p className="text-2xl font-bold text-slate-700 mt-1">{count}</p>
                <p className="text-sm text-slate-500">casos registrados</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
