"use client";

import { useEffect, useState } from "react";
import { Dumbbell, MapPin, Wind, Thermometer, TrendingUp, Calendar } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

interface Training {
  id: number;
  pigeonId: number | null;
  groupId: string | null;
  date: string;
  type: string;
  distance: string | null;
  duration: number | null;
  speed: string | null;
  temperature: string | null;
  weather: string | null;
  windDirection: string | null;
  performance: number | null;
}

export default function TrainingsPage() {
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    fetchTrainings();
  }, []);

  async function fetchTrainings() {
    const res = await fetch("/api/trainings");
    const data = await res.json();
    setTrainings(data);
  }

  const totalDistance = trainings.reduce((sum, t) => sum + (parseFloat(t.distance || "0") || 0), 0);
  const avgSpeed = trainings.length > 0
    ? trainings.reduce((sum, t) => sum + (parseFloat(t.speed || "0") || 0), 0) / trainings.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Treinamentos</h1>
          <p className="text-slate-500">Controle de voos, GPS e desempenho</p>
        </div>
        <a
          href="/treinamentos/gps"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          📡 GPS de Treinos
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainings.length}</p>
              <p className="text-sm text-slate-500">Treinos</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(totalDistance, 1)}</p>
              <p className="text-sm text-slate-500">km Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatNumber(avgSpeed, 2)}</p>
              <p className="text-sm text-slate-500">m/min Média</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Wind className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{trainings.filter((t) => t.type === "velocidade").length}</p>
              <p className="text-sm text-slate-500">Velocidade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Histórico de Treinamentos</h2>
        </div>
        {trainings.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhum treinamento registrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Distância</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Tempo</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Velocidade</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Clima</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trainings.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 capitalize">{t.type.replace("_", " ")}</td>
                  <td className="px-4 py-3">{t.distance ? `${formatNumber(t.distance, 1)} km` : "—"}</td>
                  <td className="px-4 py-3">{t.duration ? `${Math.floor(t.duration / 60)}min` : "—"}</td>
                  <td className="px-4 py-3">{t.speed ? `${formatNumber(t.speed, 2)} m/min` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {t.temperature ? `${t.temperature}°C` : "—"}
                      {t.weather && `, ${t.weather}`}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {t.performance ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${t.performance}%` }} />
                        </div>
                        <span className="text-sm">{t.performance}%</span>
                      </div>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Plano de Treinamento IA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-2">Esta Semana</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Seg - Lançamento curto</span>
                <span className="text-slate-500">5km</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Qua - Meio fundo</span>
                <span className="text-slate-500">50km</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Sex - Velocidade</span>
                <span className="text-slate-500">20km</span>
              </div>
              <div className="flex justify-between p-2 bg-white rounded">
                <span>Sáb - Descanso ativo</span>
                <span className="text-slate-500">—</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h3 className="font-medium text-emerald-900 mb-2">Recomendações da IA</h3>
            <ul className="space-y-2 text-sm text-emerald-800">
              <li>• Aumentar distância gradualmente 10% por semana</li>
              <li>• Monitorar peso antes e após voos longos</li>
              <li>• Verificar direção do vento para próximo treino</li>
              <li>• Hidratação com eletrólitos após voos &gt;30km</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
