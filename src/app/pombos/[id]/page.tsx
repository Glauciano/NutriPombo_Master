"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bird,
  ArrowLeft,
  Heart,
  Dna,
  Calendar,
  Weight,
  FileText,
  Activity,
  Pill,
  Syringe,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

interface Pigeon {
  id: number;
  ringNumber: string;
  internalCode: string | null;
  name: string | null;
  sex: string;
  color: string | null;
  breed: string | null;
  geneticLine: string | null;
  originBreeder: string | null;
  birthDate: string | null;
  idealWeight: string | null;
  currentWeight: string | null;
  observations: string | null;
  status: string;
  category: string;
  fatherId: number | null;
  motherId: number | null;
  photos: string[] | null;
  createdAt: string;
}

interface HealthRecord {
  id: number;
  date: string;
  disease: string | null;
  diagnosis: string | null;
  treatment: string | null;
  result: string | null;
}

interface Vaccination {
  id: number;
  vaccineName: string;
  date: string;
  nextDate: string | null;
}

export default function PigeonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [pigeon, setPigeon] = useState<Pigeon | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    if (id) {
      fetchPigeon();
      fetchHealth();
      fetchVaccinations();
    }
  }, [id]);

  async function fetchPigeon() {
    const res = await fetch(`/api/pigeons/${id}`);
    const data = await res.json();
    setPigeon(data);
    setLoading(false);
  }

  async function fetchHealth() {
    const res = await fetch(`/api/pigeons/${id}/health`);
    const data = await res.json();
    setHealthRecords(data);
  }

  async function fetchVaccinations() {
    const res = await fetch(`/api/pigeons/${id}/vaccinations`);
    const data = await res.json();
    setVaccinations(data);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!pigeon) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Pombo não encontrado</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    ativo: "bg-emerald-100 text-emerald-700",
    morto: "bg-slate-100 text-slate-700",
    doente: "bg-red-100 text-red-700",
    em_tratamento: "bg-orange-100 text-orange-700",
    desaparecido: "bg-red-100 text-red-700",
    aposentado: "bg-slate-100 text-slate-700",
  };

  const tabs = [
    { id: "geral", label: "Geral", icon: Bird },
    { id: "saude", label: "Saúde", icon: Heart },
    { id: "genealogia", label: "Genealogia", icon: Dna },
    { id: "desempenho", label: "Desempenho", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/pombos" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{pigeon.name || pigeon.ringNumber}</h1>
          <p className="text-slate-500">{pigeon.ringNumber}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${statusColors[pigeon.status] || "bg-slate-100"}`}>
          {pigeon.status.replace("_", " ")}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "geral" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bird className="w-5 h-5 text-emerald-600" />
                Informações Gerais
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Nº Anilha</p>
                  <p className="font-medium text-slate-900">{pigeon.ringNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Código Interno</p>
                  <p className="font-medium text-slate-900">{pigeon.internalCode || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Sexo</p>
                  <p className="font-medium text-slate-900 capitalize">{pigeon.sex}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Cor</p>
                  <p className="font-medium text-slate-900">{pigeon.color || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Raça</p>
                  <p className="font-medium text-slate-900">{pigeon.breed || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Linha Genética</p>
                  <p className="font-medium text-slate-900">{pigeon.geneticLine || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Criador de Origem</p>
                  <p className="font-medium text-slate-900">{pigeon.originBreeder || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Data Nascimento</p>
                  <p className="font-medium text-slate-900">{formatDate(pigeon.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Peso Ideal</p>
                  <p className="font-medium text-slate-900">{pigeon.idealWeight ? `${formatNumber(pigeon.idealWeight, 2)} g` : "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Peso Atual</p>
                  <p className="font-medium text-slate-900">{pigeon.currentWeight ? `${formatNumber(pigeon.currentWeight, 2)} g` : "—"}</p>
                </div>
              </div>
            </div>

            {pigeon.observations && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Observações
                </h2>
                <p className="text-slate-700 whitespace-pre-wrap">{pigeon.observations}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Resumo</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Categoria</span>
                  <span className="text-sm font-medium capitalize">{pigeon.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="text-sm font-medium capitalize">{pigeon.status.replace("_", " ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Cadastrado em</span>
                  <span className="text-sm font-medium">{formatDate(pigeon.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                IA PigeonMaster
              </h3>
              <p className="text-sm text-emerald-800">
                Com base no histórico deste pombo, recomendamos manter o peso entre 420-450g para provas de meio fundo.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "saude" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Prontuário Médico
              </h2>
              {healthRecords.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhum registro de saúde</p>
              ) : (
                <div className="space-y-3">
                  {healthRecords.map((record) => (
                    <div key={record.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{record.disease || "Consulta"}</span>
                        <span className="text-sm text-slate-500">{formatDate(record.date)}</span>
                      </div>
                      {record.diagnosis && <p className="text-sm text-slate-600">{record.diagnosis}</p>}
                      {record.treatment && <p className="text-sm text-slate-600">Tratamento: {record.treatment}</p>}
                      {record.result && (
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${
                          record.result === "curado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {record.result}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-600" />
                Vacinações
              </h2>
              {vaccinations.length === 0 ? (
                <p className="text-slate-400 text-sm">Nenhuma vacina registrada</p>
              ) : (
                <div className="space-y-3">
                  {vaccinations.map((vacc) => (
                    <div key={vacc.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{vacc.vaccineName}</span>
                        <span className="text-sm text-slate-500">{formatDate(vacc.date)}</span>
                      </div>
                      {vacc.nextDate && (
                        <p className="text-sm text-slate-600">Próxima dose: {formatDate(vacc.nextDate)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "genealogia" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Dna className="w-5 h-5 text-emerald-600" />
            Árvore Genealógica
          </h2>
          <div className="flex justify-center">
            <div className="text-center space-y-8">
              {/* Pigeon */}
              <div className="inline-block p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl">
                <Bird className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-emerald-900">{pigeon.name || pigeon.ringNumber}</p>
                <p className="text-sm text-emerald-700">{pigeon.ringNumber}</p>
              </div>

              {/* Parents */}
              <div className="flex gap-8 justify-center">
                <div className="text-center">
                  <div className="w-px h-8 bg-slate-300 mx-auto mb-2"></div>
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                    <p className="text-sm font-medium text-sky-900">Pai</p>
                    <p className="text-xs text-sky-700">
                      {pigeon.fatherId ? `ID: ${pigeon.fatherId}` : "Não registrado"}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-px h-8 bg-slate-300 mx-auto mb-2"></div>
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <p className="text-sm font-medium text-pink-900">Mãe</p>
                    <p className="text-xs text-pink-700">
                      {pigeon.motherId ? `ID: ${pigeon.motherId}` : "Não registrado"}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400">
                Cadastre o pai e a mãe para visualizar a árvore genealógica completa com coeficiente de consanguinidade.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "desempenho" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Desempenho
          </h2>
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Registre treinamentos e competições para visualizar o desempenho.</p>
          </div>
        </div>
      )}
    </div>
  );
}
