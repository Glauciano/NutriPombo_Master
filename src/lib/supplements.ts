/* ────────── Protocolo de Suplementação ──────────
   ÁGUA:   Bioxan (recuperador) + Eletrovit (eletrólitos/vitaminas)
   COMIDA: Aminomix (aminoácidos) + Organew (probiótico/prebiótico)
*/

export interface Product {
  id: string;
  name: string;
  via: "agua" | "comida";
  color: string;
  textColor: string;
  emoji: string;
  what: string;
  dosage: string;
  when: string;
  tips: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "bioxan",
    name: "Bioxan",
    via: "agua",
    color: "bg-blue-500",
    textColor: "text-blue-400",
    emoji: "💧",
    what: "Recuperador orgânico — combate fadiga e desgaste pós-esforço.",
    dosage: "2-3 ml por litro de água",
    when: "Pós-prova (recuperação) e carga pré-prova",
    tips: [
      "Usar pela manhã, na primeira água do dia",
      "Não misturar com Aminomix na mesma água",
      "Trocar a água medicada a cada 24h",
    ],
  },
  {
    id: "eletrovit",
    name: "Eletrovit",
    via: "agua",
    color: "bg-cyan-500",
    textColor: "text-cyan-400",
    emoji: "⚡",
    what: "Eletrólitos + vitaminas — reidratação e reposição mineral.",
    dosage: "1-2 g por litro de água",
    when: "Retorno de provas, dias quentes e pós-treino intenso",
    tips: [
      "Essencial no dia do retorno da prova",
      "Em dias >30°C usar também em treinos",
      "Pode combinar com Bioxan na recuperação",
    ],
  },
  {
    id: "aminomix",
    name: "Aminomix",
    via: "comida",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
    emoji: "💪",
    what: "Complexo de aminoácidos — reconstrói músculo após esforço.",
    dosage: "1 g por kg de ração (misturar com óleo de alho)",
    when: "Terça e quarta — reconstrução muscular",
    tips: [
      "Umedecer a ração com algumas gotas de óleo para aderir",
      "Aplicar na refeição da manhã",
      "Não usar nos 2 dias antes do enceste",
    ],
  },
  {
    id: "organew",
    name: "Organew",
    via: "comida",
    color: "bg-amber-500",
    textColor: "text-amber-400",
    emoji: "🦠",
    what: "Probiótico + prebiótico — flora intestinal e imunidade.",
    dosage: "2 g por kg de ração",
    when: "Início da semana (recuperação da flora) e pós-antibióticos",
    tips: [
      "Ideal após o estresse do cesto e da prova",
      "Usar sempre após tratamentos com antibióticos",
      "Pode ser usado junto com Aminomix na ração",
    ],
  },
];

/* ────────── Protocolo semanal por categoria ────────── */
export interface DayProtocol {
  day: number; // 0=domingo
  dayLabel: string;
  title: string;
  description: string;
  water: { productId: string; dose: string }[]; // água
  food: { productId: string; dose: string }[]; // comida
  phase: "recuperacao" | "reconstrucao" | "carga" | "descanso" | "prova";
  borderColor: string;
}

export const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  recuperacao: { label: "Recuperação", color: "text-blue-400" },
  reconstrucao: { label: "Reconstrução", color: "text-emerald-400" },
  carga: { label: "Carga pré-prova", color: "text-yellow-400" },
  descanso: { label: "Água limpa", color: "text-slate-400" },
  prova: { label: "Prova/Enceste", color: "text-orange-400" },
};

export const PROTOCOLS: Record<string, DayProtocol[]> = {
  velocidade: [
    {
      day: 0, dayLabel: "Domingo", title: "Recuperação pós-prova",
      description: "Bioxan repõe vitaminas B e eletrólitos. Organew recupera a flora após o estresse do cesto.",
      water: [{ productId: "bioxan", dose: "3 ml/L" }, { productId: "eletrovit", dose: "2 g/L" }],
      food: [{ productId: "organew", dose: "2 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 1, dayLabel: "Segunda", title: "Continua recuperação + depuração",
      description: "Segundo dia de Bioxan na água. Organew segue na ração da manhã.",
      water: [{ productId: "bioxan", dose: "2 ml/L" }],
      food: [{ productId: "organew", dose: "2 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 2, dayLabel: "Terça", title: "Reconstrução muscular",
      description: "Aminomix reconstrói o músculo após o esforço da prova. Água limpa.",
      water: [],
      food: [{ productId: "aminomix", dose: "1 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 3, dayLabel: "Quarta", title: "Continua síntese muscular",
      description: "Segundo dia de Aminomix na ração. Água limpa.",
      water: [],
      food: [{ productId: "aminomix", dose: "1 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 4, dayLabel: "Quinta", title: "Carga dupla pré-prova",
      description: "Bioxan na água + Aminomix na ração para carga energética pré-prova.",
      water: [{ productId: "bioxan", dose: "2 ml/L" }],
      food: [{ productId: "aminomix", dose: "1,5 g/kg" }],
      phase: "carga", borderColor: "border-l-yellow-500",
    },
    {
      day: 5, dayLabel: "Sexta", title: "Só água limpa",
      description: "Enceste amanhã. Não sobrecarregar o organismo. Ração limpa.",
      water: [],
      food: [],
      phase: "descanso", borderColor: "border-l-slate-500",
    },
    {
      day: 6, dayLabel: "Sábado", title: "Dia da prova",
      description: "Água fresca apenas. Boa sorte! 🏁",
      water: [],
      food: [],
      phase: "prova", borderColor: "border-l-orange-500",
    },
  ],
  meio_fundo: [
    {
      day: 0, dayLabel: "Domingo", title: "Recuperação reforçada",
      description: "Prova mais longa exige recuperação forte: Bioxan + Eletrovit na água, Organew na ração.",
      water: [{ productId: "bioxan", dose: "3 ml/L" }, { productId: "eletrovit", dose: "2 g/L" }],
      food: [{ productId: "organew", dose: "2 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 1, dayLabel: "Segunda", title: "Segundo dia de recuperação",
      description: "Bioxan segue na água. Organew mantém a flora em dia.",
      water: [{ productId: "bioxan", dose: "3 ml/L" }],
      food: [{ productId: "organew", dose: "2 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 2, dayLabel: "Terça", title: "Início da reconstrução",
      description: "Aminomix na ração da manhã. Água limpa para depurar.",
      water: [],
      food: [{ productId: "aminomix", dose: "1 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 3, dayLabel: "Quarta", title: "Reconstrução + treino",
      description: "Aminomix segue na ração. Eletrovit pós-treino se houver solta.",
      water: [{ productId: "eletrovit", dose: "1 g/L (pós-treino)" }],
      food: [{ productId: "aminomix", dose: "1 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 4, dayLabel: "Quinta", title: "Carga energética",
      description: "Bioxan na água + Aminomix reforçado na ração gordurosa pré-prova.",
      water: [{ productId: "bioxan", dose: "2 ml/L" }],
      food: [{ productId: "aminomix", dose: "1,5 g/kg" }],
      phase: "carga", borderColor: "border-l-yellow-500",
    },
    {
      day: 5, dayLabel: "Sexta", title: "Véspera do enceste",
      description: "Água limpa. Última refeição leve antes do embarque.",
      water: [],
      food: [],
      phase: "descanso", borderColor: "border-l-slate-500",
    },
    {
      day: 6, dayLabel: "Sábado", title: "Dia da prova",
      description: "Água fresca à disposição na chegada, já com Eletrovit preparado.",
      water: [{ productId: "eletrovit", dose: "2 g/L (na chegada)" }],
      food: [],
      phase: "prova", borderColor: "border-l-orange-500",
    },
  ],
  fundo: [
    {
      day: 0, dayLabel: "Domingo", title: "Recuperação máxima",
      description: "Fundo desgasta muito: dose cheia de Bioxan + Eletrovit. Organew obrigatório na ração.",
      water: [{ productId: "bioxan", dose: "3 ml/L" }, { productId: "eletrovit", dose: "2 g/L" }],
      food: [{ productId: "organew", dose: "3 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 1, dayLabel: "Segunda", title: "Recuperação continua",
      description: "Bioxan + Eletrovit seguem. Organew na ração da manhã.",
      water: [{ productId: "bioxan", dose: "3 ml/L" }, { productId: "eletrovit", dose: "1 g/L" }],
      food: [{ productId: "organew", dose: "2 g/kg" }],
      phase: "recuperacao", borderColor: "border-l-blue-500",
    },
    {
      day: 2, dayLabel: "Terça", title: "Reconstrução profunda",
      description: "Aminomix dose cheia — músculo muito exigido em provas longas.",
      water: [],
      food: [{ productId: "aminomix", dose: "1,5 g/kg" }, { productId: "organew", dose: "2 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 3, dayLabel: "Quarta", title: "Síntese muscular",
      description: "Aminomix segue na ração. Água limpa.",
      water: [],
      food: [{ productId: "aminomix", dose: "1,5 g/kg" }],
      phase: "reconstrucao", borderColor: "border-l-emerald-500",
    },
    {
      day: 4, dayLabel: "Quinta", title: "Carga dupla máxima",
      description: "Bioxan na água + Aminomix na ração gordurosa (carga energética para o fundo).",
      water: [{ productId: "bioxan", dose: "3 ml/L" }],
      food: [{ productId: "aminomix", dose: "2 g/kg" }],
      phase: "carga", borderColor: "border-l-yellow-500",
    },
    {
      day: 5, dayLabel: "Sexta", title: "Hidratação pré-enceste",
      description: "Eletrovit leve na água para embarcar bem hidratado. Enceste hoje à noite.",
      water: [{ productId: "eletrovit", dose: "1 g/L" }],
      food: [],
      phase: "descanso", borderColor: "border-l-slate-500",
    },
    {
      day: 6, dayLabel: "Sábado", title: "Prova de fundo",
      description: "Na chegada: Eletrovit imediato + Bioxan na segunda água.",
      water: [{ productId: "eletrovit", dose: "2 g/L (chegada)" }],
      food: [],
      phase: "prova", borderColor: "border-l-orange-500",
    },
  ],
};

/* count days each product is used per protocol */
export function productUsageSummary(category: string): Record<string, number> {
  const protocol = PROTOCOLS[category] || [];
  const usage: Record<string, number> = {};
  for (const day of protocol) {
    const ids = new Set([...day.water.map((w) => w.productId), ...day.food.map((f) => f.productId)]);
    ids.forEach((id) => { usage[id] = (usage[id] || 0) + 1; });
  }
  return usage;
}
