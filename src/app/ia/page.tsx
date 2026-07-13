"use client";

import { useEffect, useState } from "react";
import { Brain, Sparkles, Bird, Dna, Heart, TrendingUp, AlertCircle, Lightbulb, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Recommendation {
  id: number;
  type: string;
  title: string;
  description: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

export default function IAPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "ai", text: "Olá! Sou a IA PigeonMaster. Como posso ajudar com seu plantel hoje?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    const res = await fetch("/api/recommendations");
    const data = await res.json();
    setRecommendations(data);
  }

  function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [...prev, { role: "user", text: chatInput }]);
    setChatInput("");

    setTimeout(() => {
      const responses = [
        "Com base nos dados do seu plantel, recomendo aumentar a distância de treino gradualmente.",
        "O pombo #001 apresenta excelente desempenho em provas de meio fundo. Considere utilizá-lo como reprodutor.",
        "A taxa de fertilidade atual está em 85%, acima da média nacional. Parabéns!",
        "Recomendo vacinar contra paramixovírus nos próximos 15 dias.",
        "A linhagem genética do seu plantel mostra forte predisposição para velocidade.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setChatMessages((prev) => [...prev, { role: "ai", text: randomResponse }]);
    }, 1000);
  }

  const unread = recommendations.filter((r) => !r.isRead);
  const byType = [
    { type: "nutricao", label: "Nutrição", icon: Heart, color: "text-rose-600 bg-rose-50" },
    { type: "treino", label: "Treino", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { type: "reproducao", label: "Reprodução", icon: Dna, color: "text-violet-600 bg-violet-50" },
    { type: "saude", label: "Saúde", icon: AlertCircle, color: "text-red-600 bg-red-50" },
    { type: "prova", label: "Provas", icon: Bird, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IA PigeonMaster</h1>
          <p className="text-slate-500">Inteligência Artificial para Columbofilia</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/ia/preditiva"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            🤖 IA Preditiva
          </a>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{unread.length} novas recomendações</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {byType.map((item) => {
          const count = recommendations.filter((r) => r.type === item.type).length;
          return (
            <div key={item.type} className={`p-4 rounded-xl border ${item.color} border-current border-opacity-20`}>
              <item.icon className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm font-medium opacity-80">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Recomendações da IA
          </h2>
          {recommendations.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma recomendação ainda. A IA aprende com seus dados.</p>
            </div>
          ) : (
            recommendations.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-xl border ${
                  rec.isRead ? "bg-white border-slate-200" : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                      rec.priority === "alta" ? "bg-red-100 text-red-700" : rec.priority === "media" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {rec.priority}
                    </span>
                    <h3 className="font-medium text-slate-900">{rec.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDate(rec.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Chat com IA
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl ${
                  msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte sobre seu plantel..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Melhores Reprodutores</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Casal #001 x #002</span>
              <span className="font-medium text-emerald-600">92% sucesso</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Casal #005 x #006</span>
              <span className="font-medium text-emerald-600">88% sucesso</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Melhores Atletas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Pombo #012</span>
              <span className="font-medium text-emerald-600">1.450 m/min</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Pombo #008</span>
              <span className="font-medium text-emerald-600">1.420 m/min</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Previsões</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Próxima prova</span>
              <span className="font-medium text-blue-600">78% chegada</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Ranking esperado</span>
              <span className="font-medium text-blue-600">Top 20%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
