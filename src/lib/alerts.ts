/* ────────── Central de Alertas — tarefas diárias do pombal ────────── */

export interface DailyTask {
  id: string;
  time: string; // HH:MM
  title: string;
  description: string;
  emoji: string;
}

export const DAILY_TASKS: DailyTask[] = [
  { id: "abrir", time: "06:00", title: "Abrir o pombal", description: "Soltar os pombos para voo manhã.", emoji: "🌅" },
  { id: "alimentacao_manha", time: "06:30", title: "Alimentação matinal", description: "Ração da manhã conforme protocolo.", emoji: "🌾" },
  { id: "agua", time: "07:00", title: "Trocar a água", description: "Água fresca, lavar bebedouros.", emoji: "💧" },
  { id: "observar", time: "08:00", title: "Observar o plantel", description: "Verificar saúde, fezes, apetite.", emoji: "👁️" },
  { id: "treino", time: "09:00", title: "Treino (se programado)", description: "Executar conforme plano semanal.", emoji: "🏋️" },
  { id: "suplementos", time: "12:00", title: "Suplementos", description: "Vitaminas ou eletrólitos conforme protocolo.", emoji: "💊" },
  { id: "alimentacao_tarde", time: "16:00", title: "Alimentação da tarde", description: "Refeição menor que a da manhã.", emoji: "🌾" },
  { id: "banho", time: "17:00", title: "Banho (3x/semana)", description: "Ter/Qui/Sáb com vinagre de maçã.", emoji: "🛁" },
  { id: "fechar", time: "18:00", title: "Fechar o pombal", description: "Recolher todos e fechar.", emoji: "🌙" },
  { id: "registro", time: "18:30", title: "Registrar o dia", description: "Anotar observações no app.", emoji: "📝" },
];

export interface WeeklyTask {
  id: string;
  day: number; // 0 = domingo
  dayLabel: string;
  title: string;
  description: string;
  emoji: string;
}

export const WEEKLY_TASKS: WeeklyTask[] = [
  { id: "dom_descanso", day: 0, dayLabel: "Domingo", title: "Descanso total", description: "Sem treinos. Apenas rotina básica.", emoji: "😴" },
  { id: "seg_limpeza", day: 1, dayLabel: "Segunda", title: "Limpeza pesada do pombal", description: "Raspagem completa + desinfecção de bebedouros.", emoji: "🧹" },
  { id: "ter_banho", day: 2, dayLabel: "Terça", title: "Banho dos pombos", description: "Com vinagre de maçã na água.", emoji: "🛁" },
  { id: "qua_treino", day: 3, dayLabel: "Quarta", title: "Treino de solta", description: "Lançamento conforme distância do plano.", emoji: "🚀" },
  { id: "qui_banho", day: 4, dayLabel: "Quinta", title: "Banho dos pombos", description: "Segunda sessão da semana.", emoji: "🛁" },
  { id: "sex_preparo", day: 5, dayLabel: "Sexta", title: "Preparo pré-prova", description: "Conferir anilhas, cestos e documentação.", emoji: "📋" },
  { id: "sab_prova", day: 6, dayLabel: "Sábado", title: "Dia de prova / treino longo", description: "Embarque ou solta longa.", emoji: "🏁" },
];

export interface PreventiveTask {
  id: string;
  frequency: string;
  title: string;
  description: string;
  emoji: string;
}

export const PREVENTIVE_TASKS: PreventiveTask[] = [
  { id: "tricomoniase", frequency: "A cada 45 dias", title: "Preventivo Tricomoníase", description: "Ronidazol 10% — 1g/L por 5 dias.", emoji: "🔴" },
  { id: "coccidiose", frequency: "A cada 60 dias", title: "Preventivo Coccidiose", description: "Toltrazuril 2,5% — 1ml/L por 2 dias.", emoji: "🟡" },
  { id: "vermifugo", frequency: "A cada 90 dias", title: "Vermifugação", description: "Levamisol 7,5% — 1ml/L dose única, repetir em 21 dias.", emoji: "🪱" },
  { id: "vacina_paramixo", frequency: "Anual (janeiro)", title: "Vacina Paramixovírus", description: "Obrigatória — 0,3ml subcutânea por ave.", emoji: "💉" },
  { id: "vacina_bouba", frequency: "Anual (junho)", title: "Vacina Bouba/Varíola", description: "Via folículo ou punctura na asa.", emoji: "💉" },
  { id: "desinfeccao", frequency: "Quinzenal", title: "Desinfecção do pombal", description: "Produto específico em todas as superfícies.", emoji: "🧴" },
  { id: "exame_fezes", frequency: "Trimestral", title: "Exame de fezes", description: "Coletar amostras e levar ao laboratório.", emoji: "🔬" },
  { id: "probioticos", frequency: "Semanal", title: "Probióticos", description: "2x por semana na água ou ração.", emoji: "🦠" },
];
