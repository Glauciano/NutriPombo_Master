"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bird, Check, Crown, Zap, RefreshCw } from "lucide-react";

const PLANS = [
  {
    id: "gratis",
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    emoji: "🐣",
    highlight: false,
    features: [
      "Até 10 pombos cadastrados",
      "Calendário de provas",
      "Central de alertas com som",
      "Guia terapêutico completo",
      "Backup manual",
    ],
    cta: "Começar Grátis",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 19,90",
    period: "/mês",
    emoji: "🏆",
    highlight: true,
    features: [
      "Pombos ILIMITADOS",
      "Ranking + Hall da Fama",
      "IA Preditiva de provas",
      "GPS de treinos",
      "Controle de peso com gráficos",
      "Análise genealógica",
      "Clima em tempo real",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
  },
  {
    id: "master",
    name: "Master",
    price: "R$ 39,90",
    period: "/mês",
    emoji: "👑",
    highlight: false,
    features: [
      "Tudo do Pro +",
      "Multi-pombal (reprodução e voo)",
      "Relatórios em PDF",
      "Backup automático",
      "Cardápio e protocolos avançados",
      "Acesso antecipado a novidades",
      "Suporte via WhatsApp",
    ],
    cta: "Assinar Master",
  },
];

export default function PlanosPage() {
  const router = useRouter();
  const [choosing, setChoosing] = useState<string | null>(null);

  async function choosePlan(planId: string) {
    setChoosing(planId);
    try {
      const res = await fetch("/api/auth/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setChoosing(null);
      }
    } catch {
      setChoosing(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1120] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 bg-yellow-500 rounded-2xl items-center justify-center mb-3">
            <Bird className="w-8 h-8 text-[#0b1120]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Escolha seu plano</h1>
          <p className="text-sm text-slate-400">Comece grátis e evolua quando quiser. Cancele a qualquer momento.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col ${
                plan.highlight
                  ? "bg-gradient-to-b from-yellow-500/15 to-[#1a2736] border-2 border-yellow-500/60 relative"
                  : "bg-[#1a2736] border border-[#2a3a4a]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-[#0b1120] rounded-full text-[10px] font-black uppercase tracking-wider">
                  Mais Popular
                </span>
              )}

              <div className="text-center mb-5">
                <span className="text-3xl block mb-2">{plan.emoji}</span>
                <h2 className={`text-lg font-black ${plan.highlight ? "text-yellow-400" : "text-white"}`}>
                  {plan.name}
                </h2>
                <div className="mt-2">
                  <span className="text-3xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlight ? "text-yellow-400" : "text-emerald-400"}`} />
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => choosePlan(plan.id)}
                disabled={choosing !== null}
                className={`w-full py-3.5 rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? "bg-yellow-500 hover:bg-yellow-400 text-[#0b1120]"
                    : "bg-[#0b1120] border border-[#2a3a4a] hover:border-yellow-500/40 text-white"
                }`}
              >
                {choosing === plan.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : plan.id === "master" ? <Crown className="w-4 h-4" /> : plan.id === "pro" ? <Zap className="w-4 h-4" /> : null}
                {choosing === plan.id ? "Ativando..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-8">
          💳 Nos planos pagos, o pagamento será ativado em breve via Pix e cartão. Por enquanto, você pode testar todos os recursos.
        </p>
      </div>
    </div>
  );
}
