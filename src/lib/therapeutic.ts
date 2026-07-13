/* ────────── Guia Terapêutico — Base de dados de doenças de pombos-correio ────────── */

export type DiseaseCategory = "bacteriana" | "protozoario" | "parasita_interno" | "fungica" | "viral";
export type Severity = "baixa" | "media" | "alta" | "critica";

export interface ActivePrinciple {
  name: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface Disease {
  id: string;
  name: string;
  altName?: string;
  category: DiseaseCategory;
  severity: Severity;
  symptoms: string[];
  transmission: string;
  principles: ActivePrinciple[];
  prevention: string;
  emoji: string;
  borderColor: string;
}

export const CATEGORY_LABELS: Record<DiseaseCategory, string> = {
  bacteriana: "Bacteriana",
  protozoario: "Protozoário",
  parasita_interno: "Parasita Interno",
  fungica: "Fúngica",
  viral: "Viral",
};

export const CATEGORY_COLORS: Record<DiseaseCategory, { text: string; bg: string }> = {
  bacteriana: { text: "text-red-400", bg: "bg-red-500/15" },
  protozoario: { text: "text-orange-400", bg: "bg-orange-500/15" },
  parasita_interno: { text: "text-violet-400", bg: "bg-violet-500/15" },
  fungica: { text: "text-cyan-400", bg: "bg-cyan-500/15" },
  viral: { text: "text-pink-400", bg: "bg-pink-500/15" },
};

export const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; border: string }> = {
  baixa: { label: "Baixa", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  media: { label: "Média", color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  alta: { label: "Alta", color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
  critica: { label: "CRÍTICA", color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
};

export const DISEASES: Disease[] = [
  {
    id: "salmonelose",
    name: "Salmonelose",
    altName: "Paratifose",
    category: "bacteriana",
    severity: "alta",
    emoji: "🦠",
    borderColor: "border-l-blue-500",
    symptoms: ["Diarreia verde e aquosa", "Tremores de asas e patas", "Emagrecimento progressivo", "Infertilidade", "Artrite nas articulações"],
    transmission: "Água e alimentos contaminados, ovos infectados, contato direto",
    principles: [
      { name: "Enrofloxacina 10%", dosage: "0,5ml por litro de água", duration: "7-10 dias", notes: "Antibiótico de eleição" },
      { name: "Amoxicilina", dosage: "1g por litro de água", duration: "7 dias" },
      { name: "Trimetoprim + Sulfa", dosage: "Conforme bula", duration: "7 dias" },
      { name: "Probióticos", dosage: "5g/kg de ração", duration: "Após tratamento", notes: "Restaurar flora intestinal" },
    ],
    prevention: "Vacinação anual, higiene rigorosa, quarentena de aves novas",
  },
  {
    id: "micoplasmose",
    name: "Micoplasmose",
    category: "bacteriana",
    severity: "media",
    emoji: "🫁",
    borderColor: "border-l-slate-400",
    symptoms: ["Espirros frequentes", "Secreção nasal", "Respiração ruidosa", "Queda de rendimento em voo"],
    transmission: "Aerossóis, contato direto, transmissão vertical (ovo)",
    principles: [
      { name: "Tilosina", dosage: "0,5g por litro de água", duration: "5-7 dias", notes: "Específico para micoplasma" },
      { name: "Tiamulina", dosage: "Conforme bula", duration: "5 dias" },
    ],
    prevention: "Boa ventilação do pombal, evitar superlotação, controle de poeira",
  },
  {
    id: "coriza",
    name: "Coriza Infecciosa",
    category: "bacteriana",
    severity: "media",
    emoji: "🤧",
    borderColor: "border-l-yellow-500",
    symptoms: ["Nariz sujo", "Tosse", "Dificuldade respiratória", "Olhos inchados"],
    transmission: "Contato direto, água contaminada, aerossóis",
    principles: [
      { name: "Doxiciclina", dosage: "0,5g por litro de água", duration: "7 dias" },
      { name: "Clortetraciclina", dosage: "1g por litro de água", duration: "5-7 dias" },
      { name: "Vitamina A", dosage: "Suplementação na água", duration: "Durante tratamento", notes: "Regeneração de mucosas" },
    ],
    prevention: "Ventilação adequada, evitar correntes de ar frio, higiene dos bebedouros",
  },
  {
    id: "tricomoniase",
    name: "Tricomoníase",
    altName: "Gogo/Canker",
    category: "protozoario",
    severity: "alta",
    emoji: "🔴",
    borderColor: "border-l-orange-500",
    symptoms: ["Placas amareladas na boca e garganta", "Dificuldade para engolir", "Emagrecimento", "Filhotes morrem no ninho"],
    transmission: "Água do papo (pais para filhotes), bebedouros contaminados",
    principles: [
      { name: "Ronidazol 10%", dosage: "1g por litro de água", duration: "5-7 dias", notes: "Padrão-ouro no tratamento" },
      { name: "Metronidazol", dosage: "1 comprimido 250mg/10 pombos", duration: "5 dias" },
      { name: "Carnidazol", dosage: "1 comprimido por ave", duration: "Dose única" },
    ],
    prevention: "Tratamento preventivo antes da reprodução, higiene dos bebedouros, água limpa diária",
  },
  {
    id: "coccidiose",
    name: "Coccidiose",
    category: "protozoario",
    severity: "alta",
    emoji: "🟡",
    borderColor: "border-l-yellow-500",
    symptoms: ["Fezes aquosas com muco", "Apetite irregular", "Perda de rendimento", "Penas arrepiadas", "Anemia"],
    transmission: "Ingestão de oocistos nas fezes, piso úmido do pombal",
    principles: [
      { name: "Toltrazuril 2,5%", dosage: "1ml por litro de água", duration: "2 dias", notes: "Mais eficaz" },
      { name: "Amprolium", dosage: "30ml por litro de água", duration: "5 dias" },
      { name: "Sulfaquinoxalina", dosage: "Conforme bula", duration: "3+2 dias (pausa de 2)" },
      { name: "Vitamina K", dosage: "Na água", duration: "Durante tratamento", notes: "Prevenir hemorragias" },
    ],
    prevention: "Piso seco, limpeza diária das fezes, evitar umidade, exame de fezes regular",
  },
  {
    id: "verminoses",
    name: "Verminoses",
    altName: "Ascaridíase / Capilariose",
    category: "parasita_interno",
    severity: "media",
    emoji: "🪱",
    borderColor: "border-l-violet-500",
    symptoms: ["Emagrecimento progressivo", "Fezes com vermes visíveis", "Queda de performance", "Anemia", "Penas sem brilho"],
    transmission: "Ingestão de ovos de vermes no solo e fezes",
    principles: [
      { name: "Levamisol 7,5%", dosage: "1ml por litro de água", duration: "1 dia, repetir em 21 dias" },
      { name: "Fenbendazol", dosage: "5mg/kg", duration: "3 dias", notes: "Não usar na muda" },
      { name: "Ivermectina", dosage: "1 gota na pele", duration: "Dose única", notes: "Também age contra parasitas externos" },
      { name: "Praziquantel", dosage: "Conforme bula", duration: "Dose única", notes: "Para tênias" },
    ],
    prevention: "Vermifugação a cada 3 meses, exame de fezes, piso limpo e seco",
  },
  {
    id: "candidiase",
    name: "Candidíase",
    altName: "Muguet/Sapinho",
    category: "fungica",
    severity: "media",
    emoji: "🍄",
    borderColor: "border-l-cyan-500",
    symptoms: ["Placas esbranquiçadas no papo", "Dificuldade de digestão", "Papo inchado e mole", "Regurgitação", "Mau hálito"],
    transmission: "Excesso de antibióticos, imunidade baixa, alimentos mofados",
    principles: [
      { name: "Nistatina", dosage: "200.000 UI por litro", duration: "7 dias", notes: "Antifúngico de eleição" },
      { name: "Micostatin", dosage: "Conforme bula", duration: "7 dias" },
    ],
    prevention: "Evitar uso prolongado de antibióticos, grãos sempre secos, probióticos regulares",
  },
  {
    id: "newcastle",
    name: "New Castle",
    altName: "Paramixovírus",
    category: "viral",
    severity: "critica",
    emoji: "☠️",
    borderColor: "border-l-red-500",
    symptoms: ["Torcicolo (cabeça virada)", "Tremores de cabeça e pescoço", "Paralisia de asas/patas", "Perda de equilíbrio", "Fezes aquosas"],
    transmission: "Contato direto, aerossóis, água contaminada — ALTAMENTE CONTAGIOSO",
    principles: [
      { name: "NÃO TEM CURA — Suporte", dosage: "Isolamento imediato", duration: "—", notes: "Doença viral sem tratamento específico" },
      { name: "Vitaminas B1 + B12", dosage: "Na água", duration: "30 dias", notes: "Suporte neurológico" },
    ],
    prevention: "VACINAÇÃO OBRIGATÓRIA anual (La Sota ou Paramixo), quarentena rigorosa. Notificação obrigatória!",
  },
  {
    id: "variola",
    name: "Díftero-Varíola",
    altName: "Bouba",
    category: "viral",
    severity: "alta",
    emoji: "⚡",
    borderColor: "border-l-amber-500",
    symptoms: ["Crostas e pústulas no bico e olhos", "Placas na boca (forma diftérica)", "Lesões nas patas", "Dificuldade para comer"],
    transmission: "Mosquitos, contato com crostas, feridas na pele",
    principles: [
      { name: "Sem cura específica — Suporte", dosage: "Iodo glicerinado nas lesões", duration: "Até cicatrizar" },
      { name: "Antibiótico preventivo", dosage: "Conforme veterinário", duration: "5-7 dias", notes: "Prevenir infecção secundária" },
      { name: "Vitamina A", dosage: "Na água", duration: "14 dias", notes: "Regeneração da pele" },
    ],
    prevention: "Vacinação anual, controle de mosquitos, telas no pombal",
  },
  {
    id: "ornitose",
    name: "Ornitose",
    altName: "Clamidiose",
    category: "bacteriana",
    severity: "alta",
    emoji: "👁️",
    borderColor: "border-l-red-400",
    symptoms: ["Olho de um lado só inflamado", "Lacrimejamento", "Secreção nasal", "Respiração ofegante", "Apatia"],
    transmission: "Poeira de fezes secas, aerossóis — ZOONOSE (transmite ao homem)",
    principles: [
      { name: "Doxiciclina", dosage: "0,5g por litro de água", duration: "20-30 dias", notes: "Tratamento longo obrigatório" },
      { name: "Clortetraciclina", dosage: "1,5g por litro", duration: "30 dias" },
      { name: "Sem cálcio durante tratamento", dosage: "—", duration: "—", notes: "Cálcio inativa a tetraciclina" },
    ],
    prevention: "Controle de poeira, higiene, cuidado ao manusear aves doentes (usar máscara)",
  },
  {
    id: "aspergilose",
    name: "Aspergilose",
    category: "fungica",
    severity: "alta",
    emoji: "🍂",
    borderColor: "border-l-teal-500",
    symptoms: ["Respiração ofegante sem secreção", "Perda de peso", "Sede excessiva", "Voz alterada"],
    transmission: "Inalação de esporos de fungos em grãos/palha mofados",
    principles: [
      { name: "Itraconazol", dosage: "10mg/kg", duration: "4-6 semanas", notes: "Tratamento prolongado" },
      { name: "Anfotericina B", dosage: "Nebulização", duration: "Conforme veterinário" },
    ],
    prevention: "NUNCA usar grãos mofados, palha seca e limpa, ventilação excelente",
  },
  {
    id: "hexamitiase",
    name: "Hexamitíase",
    category: "protozoario",
    severity: "media",
    emoji: "💧",
    borderColor: "border-l-blue-400",
    symptoms: ["Diarreia aquosa intensa", "Desidratação rápida", "Emagrecimento em filhotes", "Mortalidade em jovens"],
    transmission: "Água e alimentos contaminados com fezes",
    principles: [
      { name: "Ronidazol", dosage: "1g por litro de água", duration: "7 dias" },
      { name: "Metronidazol", dosage: "Conforme bula", duration: "5-7 dias" },
      { name: "Eletrólitos", dosage: "Na água", duration: "Durante tratamento", notes: "Combater desidratação" },
    ],
    prevention: "Água fresca diária, higiene de bebedouros, tratar junto com tricomoníase",
  },
];

/* ────────── Recomendações gerais ────────── */
export interface Recommendation {
  id: string;
  title: string;
  emoji: string;
  items: string[];
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "calendario",
    title: "Calendário Sanitário Anual",
    emoji: "📅",
    items: [
      "Janeiro: Vacinação Paramixovírus (obrigatória)",
      "Fevereiro: Vermifugação completa do plantel",
      "Março: Tratamento preventivo tricomoníase (pré-reprodução)",
      "Maio: Exame de fezes (coccidiose e vermes)",
      "Junho: Vacinação Bouba/Varíola",
      "Agosto: Vermifugação (pré-temporada de provas)",
      "Setembro: Preventivo tricomoníase + coccidiose",
      "Novembro: Exame geral pós-temporada",
      "Dezembro: Desinfecção completa do pombal",
    ],
  },
  {
    id: "antes_provas",
    title: "Antes das Provas",
    emoji: "🏁",
    items: [
      "Nunca medicar na semana da prova (dopping e queda de forma)",
      "Preventivos devem terminar 10 dias antes do embarque",
      "Probióticos até 3 dias antes da prova",
      "Eletrólitos na volta da prova (recuperação)",
      "Observar olhos, garganta e fezes ao retornar do cesto",
    ],
  },
  {
    id: "quarentena",
    title: "Quarentena de Aves Novas",
    emoji: "🔒",
    items: [
      "Mínimo 30 dias isolado do plantel",
      "Exame de fezes na chegada",
      "Tratamento preventivo: tricomoníase + coccidiose + vermes",
      "Vacinar contra paramixovírus se não vacinado",
      "Observar sinais respiratórios diariamente",
    ],
  },
  {
    id: "higiene",
    title: "Higiene do Pombal",
    emoji: "🧹",
    items: [
      "Raspagem diária das fezes ou piso gradeado",
      "Bebedouros lavados diariamente",
      "Desinfecção quinzenal com produto específico",
      "Comedouros limpos e sem restos de comida",
      "Controle de roedores e insetos",
      "Ventilação sem correntes de ar direto",
    ],
  },
  {
    id: "regras_ouro",
    title: "Regras de Ouro da Medicação",
    emoji: "⚕️",
    items: [
      "Nunca medicar sem diagnóstico (exame ou veterinário)",
      "Sempre completar o ciclo do antibiótico",
      "Probióticos após todo tratamento antibiótico",
      "Não misturar medicamentos sem orientação",
      "Retirar grit e cálcio durante tetraciclinas",
      "Água medicada trocada a cada 24h",
      "Anotar todos os tratamentos na ficha do pombo",
    ],
  },
];
