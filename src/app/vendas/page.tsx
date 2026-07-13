import Link from "next/link";
import {
  Bird,
  Trophy,
  Bell,
  Brain,
  Heart,
  MapPin,
  Scale,
  Dna,
  CloudSun,
  Utensils,
  Save,
  Check,
  ChevronRight,
  Star,
} from "lucide-react";

const FEATURES = [
  { icon: Trophy, title: "Centro de Provas", desc: "Calendário completo, calculadora de velocidade, mapa de solturas e protocolo por prova." },
  { icon: Bell, title: "Alertas com Som", desc: "O app avisa a hora de abrir o pombal, alimentar, trocar água — com alarme sonoro." },
  { icon: Brain, title: "IA Preditiva", desc: "Previsão de desempenho por pombo cruzando forma, histórico e clima em tempo real." },
  { icon: Utensils, title: "Nutrição Completa", desc: "Misturas calculadas, cardápio semanal e protocolo Bioxan, Eletrovit, Aminomix e Organew." },
  { icon: Heart, title: "Saúde Total", desc: "Guia terapêutico com 12 doenças, dosagens exatas, diagnóstico por sintomas e calendário sanitário." },
  { icon: MapPin, title: "GPS de Treinos", desc: "Marque o ponto de solta, cronometre e a velocidade em m/min é calculada sozinha." },
  { icon: Scale, title: "Controle de Peso", desc: "Pesagens com gráfico de evolução e alerta quando o pombo sai do peso de prova." },
  { icon: Dna, title: "Genealogia", desc: "Árvore de pedigree e teste de consanguinidade antes de formar casais." },
  { icon: CloudSun, title: "Clima Real", desc: "Previsão do tempo das cidades de solta com análise de vento para a prova." },
  { icon: Star, title: "Ranking + Hall da Fama", desc: "Classificação automática da temporada e recordes históricos do seu plantel." },
  { icon: Heart, title: "Sistema de Viuvez", desc: "Checklist semanal do método e controle de casais com datas de separação." },
  { icon: Save, title: "Backup Seguro", desc: "Seus dados protegidos: exporte tudo com um clique e restaure quando quiser." },
];

const PLANS = [
  { name: "Grátis", price: "R$ 0", period: "", features: ["Até 10 pombos", "Calendário de provas", "Alertas com som", "Guia terapêutico"], highlight: false },
  { name: "Pro", price: "R$ 19,90", period: "/mês", features: ["Pombos ilimitados", "IA Preditiva", "GPS de treinos", "Ranking completo", "Suporte prioritário"], highlight: true },
  { name: "Master", price: "R$ 39,90", period: "/mês", features: ["Tudo do Pro", "Multi-pombal", "Relatórios PDF", "Backup automático", "Suporte WhatsApp"], highlight: false },
];

export default function VendasPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      {/* ─── Nav ─── */}
      <nav className="border-b border-[#1a2736] sticky top-0 bg-[#0b1120]/90 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Bird className="w-5 h-5 text-[#0b1120]" />
            </div>
            <span className="font-black text-lg">PigeonMaster AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl text-sm font-black transition-colors"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="inline-block px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs font-bold text-yellow-400 mb-6">
          🏆 O sistema mais completo para columbofilia do Brasil
        </span>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          Gerencie seu pombal como um{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            campeão
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Provas, treinos, nutrição, saúde, reprodução e inteligência artificial — tudo em um só aplicativo,
          feito por quem entende de pombo-correio.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/cadastro"
            className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-2xl text-base font-black transition-all hover:scale-105 flex items-center gap-2"
          >
            Começar Grátis Agora
            <ChevronRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/40 rounded-2xl text-base font-bold text-slate-300 transition-all"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="text-xs text-slate-600 mt-4">✓ Sem cartão de crédito &nbsp; ✓ Comece em 1 minuto &nbsp; ✓ 100% em português</p>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-[#1a2736] bg-[#0d1526]">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-yellow-400">25+</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Módulos completos</p>
          </div>
          <div>
            <p className="text-3xl font-black text-yellow-400">12</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Doenças no guia</p>
          </div>
          <div>
            <p className="text-3xl font-black text-yellow-400">🔊</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Alertas sonoros</p>
          </div>
          <div>
            <p className="text-3xl font-black text-yellow-400">🇧🇷</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Feito para o Brasil</p>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-center mb-3">Tudo que seu pombal precisa</h2>
        <p className="text-center text-slate-400 mb-12">Do filhote ao pódio — cada detalhe pensado para o columbófilo brasileiro</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#1a2736] border border-[#2a3a4a] hover:border-yellow-500/30 rounded-2xl p-6 transition-all">
              <div className="w-11 h-11 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-black text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-3">Planos que cabem no bolso</h2>
        <p className="text-center text-slate-400 mb-12">Muito mais barato que um saco de ração 😉</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 ${
                plan.highlight
                  ? "bg-gradient-to-b from-yellow-500/15 to-[#1a2736] border-2 border-yellow-500/60 relative"
                  : "bg-[#1a2736] border border-[#2a3a4a]"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-[#0b1120] rounded-full text-[10px] font-black uppercase">
                  Mais Popular
                </span>
              )}
              <h3 className={`text-lg font-black mb-2 ${plan.highlight ? "text-yellow-400" : "text-white"}`}>{plan.name}</h3>
              <div className="mb-5">
                <span className="text-3xl font-black">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <div className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link
                href="/cadastro"
                className={`block w-full py-3 rounded-xl text-center font-black text-sm transition-colors ${
                  plan.highlight
                    ? "bg-yellow-500 hover:bg-yellow-400 text-[#0b1120]"
                    : "bg-[#0b1120] border border-[#2a3a4a] hover:border-yellow-500/40 text-white"
                }`}
              >
                Começar
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-b from-yellow-500/15 to-[#1a2736] border-2 border-yellow-500/40 rounded-3xl p-10">
          <span className="text-5xl block mb-4">🐦👑</span>
          <h2 className="text-3xl font-black mb-3">Pronto para voar mais alto?</h2>
          <p className="text-slate-400 mb-8">Crie sua conta grátis e organize seu pombal hoje mesmo.</p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-2xl text-base font-black transition-all hover:scale-105"
          >
            Criar Conta Grátis
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1a2736] py-8 text-center">
        <p className="text-xs text-slate-600">
          PigeonMaster AI © 2026 — Feito com ❤️ para columbófilos brasileiros
        </p>
      </footer>
    </div>
  );
}
