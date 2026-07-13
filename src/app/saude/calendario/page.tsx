"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Syringe, CheckCircle, Calendar } from "lucide-react";

interface SanitaryEvent {
  id: string;
  month: number; // 0-11
  title: string;
  description: string;
  emoji: string;
  priority: "obrigatorio" | "recomendado";
}

const SANITARY_CALENDAR: SanitaryEvent[] = [
  { id: "jan_paramixo", month: 0, title: "Vacina Paramixovírus", description: "OBRIGATÓRIA — 0,3ml subcutânea por ave. Todo o plantel.", emoji: "💉", priority: "obrigatorio" },
  { id: "jan_limpeza", month: 0, title: "Desinfecção geral", description: "Início de ano: desinfecção completa do pombal.", emoji: "🧴", priority: "recomendado" },
  { id: "fev_vermes", month: 1, title: "Vermifugação completa", description: "Levamisol 7,5% — 1ml/L, repetir em 21 dias.", emoji: "🪱", priority: "obrigatorio" },
  { id: "mar_trico", month: 2, title: "Preventivo Tricomoníase", description: "Ronidazol 10% — 1g/L por 5-7 dias. Pré-reprodução.", emoji: "🔴", priority: "obrigatorio" },
  { id: "mar_cocci", month: 2, title: "Preventivo Coccidiose", description: "Toltrazuril 2,5% — 1ml/L por 2 dias.", emoji: "🟡", priority: "recomendado" },
  { id: "abr_acasalamento", month: 3, title: "Check pré-acasalamento", description: "Revisar condição corporal e saúde dos reprodutores.", emoji: "💑", priority: "recomendado" },
  { id: "mai_fezes", month: 4, title: "Exame de fezes", description: "Coleta e análise laboratorial (coccidiose + vermes).", emoji: "🔬", priority: "obrigatorio" },
  { id: "jun_bouba", month: 5, title: "Vacina Bouba/Varíola", description: "Via folículo ou punctura na asa. Antes do verão.", emoji: "💉", priority: "obrigatorio" },
  { id: "jul_muda_prep", month: 6, title: "Preparação para muda", description: "Aumentar proteína, adicionar levedura de cerveja.", emoji: "🪶", priority: "recomendado" },
  { id: "ago_vermes2", month: 7, title: "Vermifugação pré-temporada", description: "Segunda vermifugação anual. Antes das provas.", emoji: "🪱", priority: "obrigatorio" },
  { id: "set_trico2", month: 8, title: "Preventivo Trico + Cocci", description: "Ronidazol 5 dias + Toltrazuril 2 dias. Pré-provas.", emoji: "🔴", priority: "obrigatorio" },
  { id: "out_respiratorio", month: 9, title: "Check respiratório", description: "Observar sinais respiratórios antes das provas longas.", emoji: "🫁", priority: "recomendado" },
  { id: "nov_exame_geral", month: 10, title: "Exame geral pós-temporada", description: "Avaliação completa do plantel após as provas.", emoji: "🩺", priority: "obrigatorio" },
  { id: "dez_desinfeccao", month: 11, title: "Desinfecção completa", description: "Fechamento do ano: pombal inteiro + equipamentos.", emoji: "🧹", priority: "obrigatorio" },
];

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function CalendarioSanitarioPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sanitary_done");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.year === currentYear) setDone(parsed.items || {});
        else localStorage.setItem("sanitary_done", JSON.stringify({ year: currentYear, items: {} }));
      }
    } catch { /* ignore */ }
  }, [currentYear]);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("sanitary_done", JSON.stringify({ year: currentYear, items: next }));
      } catch { /* ignore */ }
      return next;
    });
  }

  const doneCount = SANITARY_CALENDAR.filter((e) => done[e.id]).length;
  const pending = SANITARY_CALENDAR.filter((e) => e.month <= currentMonth && !done[e.id]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <Link href="/saude" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Syringe className="w-6 h-6 text-red-400" />
          <h1 className="text-2xl font-extrabold text-white">Calendário Sanitário {currentYear}</h1>
        </div>
        <p className="text-sm text-slate-400">Vacinas, preventivos e exames — mês a mês</p>
      </div>

      {/* Progress + pending alert */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400">{doneCount}/{SANITARY_CALENDAR.length}</p>
          <p className="text-[10px] text-slate-500 uppercase">Concluídos no ano</p>
        </div>
        <div className={`rounded-xl p-4 text-center border ${
          pending.length > 0 ? "bg-red-500/10 border-red-500/40" : "bg-[#1a2736] border-[#2a3a4a]"
        }`}>
          <p className={`text-2xl font-black ${pending.length > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {pending.length}
          </p>
          <p className="text-[10px] text-slate-500 uppercase">Atrasados/pendentes</p>
        </div>
      </div>

      {/* Months */}
      <div className="space-y-4">
        {MONTHS.map((monthName, monthIdx) => {
          const events = SANITARY_CALENDAR.filter((e) => e.month === monthIdx);
          if (events.length === 0) return null;
          const isCurrent = monthIdx === currentMonth;
          const isPast = monthIdx < currentMonth;

          return (
            <div
              key={monthIdx}
              className={`bg-[#1a2736] border rounded-2xl p-5 ${
                isCurrent ? "border-yellow-500/50 ring-1 ring-yellow-500/20" : "border-[#2a3a4a]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Calendar className={`w-4 h-4 ${isCurrent ? "text-yellow-400" : "text-slate-500"}`} />
                <h3 className={`text-sm font-black ${isCurrent ? "text-yellow-400" : isPast ? "text-slate-500" : "text-white"}`}>
                  {monthName}
                </h3>
                {isCurrent && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-[#0b1120] rounded text-[9px] font-black uppercase">
                    Mês atual
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {events.map((event) => {
                  const isDone = !!done[event.id];
                  const isLate = event.month < currentMonth && !isDone;
                  return (
                    <button
                      key={event.id}
                      onClick={() => toggle(event.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        isDone
                          ? "bg-emerald-500/5 border-emerald-500/30"
                          : isLate
                            ? "bg-red-500/5 border-red-500/40"
                            : "bg-[#0b1120] border-[#2a3a4a] hover:border-yellow-500/30"
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <span className="text-lg">{event.emoji}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-bold ${isDone ? "text-emerald-400 line-through" : "text-white"}`}>
                            {event.title}
                          </p>
                          {event.priority === "obrigatorio" && !isDone && (
                            <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[8px] font-black uppercase">
                              Obrigatório
                            </span>
                          )}
                          {isLate && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[8px] font-black uppercase">
                              Atrasado!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • Calendário Sanitário</p>
    </div>
  );
}
