/* ────────── Base de dados nutricional de grãos para pombos-correio ──────────
   Valores por kg: proteína (g), gordura (g), carboidratos (g), energia (kcal), preço (R$)
*/

export interface Ingredient {
  id: string;
  name: string;
  protein: number; // g/kg
  fat: number; // g/kg
  carbs: number; // g/kg
  energy: number; // kcal/kg
  price: number; // R$/kg
  color: string; // for chart bars
}

export const INGREDIENTS: Ingredient[] = [
  /* ─── Cereais / Energia ─── */
  { id: "milho", name: "Milho", protein: 85, fat: 38, carbs: 720, energy: 3650, price: 2.50, color: "#eab308" },
  { id: "milho_pequeno", name: "Milho pequeno", protein: 85, fat: 38, carbs: 720, energy: 3650, price: 2.80, color: "#facc15" },
  { id: "quirela_milho", name: "Quirela de milho", protein: 82, fat: 35, carbs: 730, energy: 3600, price: 1.90, color: "#fbbf24" },
  { id: "trigo", name: "Trigo", protein: 120, fat: 20, carbs: 680, energy: 3400, price: 2.20, color: "#d4a373" },
  { id: "sorgo", name: "Sorgo", protein: 90, fat: 30, carbs: 700, energy: 3350, price: 1.80, color: "#b45309" },
  { id: "dari", name: "Dari (sorgo branco)", protein: 95, fat: 32, carbs: 690, energy: 3400, price: 3.50, color: "#fef3c7" },
  { id: "cevada", name: "Cevada", protein: 105, fat: 22, carbs: 640, energy: 3300, price: 2.40, color: "#a16207" },
  { id: "aveia", name: "Aveia", protein: 110, fat: 50, carbs: 600, energy: 3900, price: 3.00, color: "#a8a29e" },
  { id: "centeio", name: "Centeio", protein: 100, fat: 17, carbs: 690, energy: 3250, price: 3.20, color: "#9ca3af" },
  { id: "arroz_casca", name: "Arroz c/ casca", protein: 75, fat: 20, carbs: 640, energy: 3300, price: 2.00, color: "#e7e5e4" },
  { id: "arroz_sem_casca", name: "Arroz s/ casca", protein: 80, fat: 12, carbs: 780, energy: 3500, price: 3.00, color: "#f5f5f4" },
  { id: "arroz_integral", name: "Arroz integral", protein: 80, fat: 28, carbs: 770, energy: 3600, price: 3.50, color: "#d6d3d1" },
  { id: "painco", name: "Painço", protein: 110, fat: 40, carbs: 650, energy: 3600, price: 4.00, color: "#fde047" },
  { id: "alpiste", name: "Alpiste", protein: 140, fat: 60, carbs: 550, energy: 3700, price: 6.00, color: "#fef08a" },
  { id: "trigo_sarraceno", name: "Trigo sarraceno", protein: 130, fat: 34, carbs: 620, energy: 3350, price: 5.50, color: "#78716c" },

  /* ─── Leguminosas / Proteína ─── */
  { id: "ervilha", name: "Ervilha", protein: 220, fat: 12, carbs: 580, energy: 3400, price: 4.50, color: "#22c55e" },
  { id: "ervilhaca", name: "Ervilhaca", protein: 260, fat: 10, carbs: 540, energy: 3300, price: 4.00, color: "#16a34a" },
  { id: "lentilha", name: "Lentilha", protein: 240, fat: 11, carbs: 600, energy: 3400, price: 6.50, color: "#dc2626" },
  { id: "soja", name: "Soja", protein: 360, fat: 190, carbs: 300, energy: 4200, price: 3.80, color: "#ca8a04" },
  { id: "fava", name: "Fava / Faverol", protein: 250, fat: 14, carbs: 550, energy: 3350, price: 4.20, color: "#84cc16" },

  /* ─── Oleaginosas / Gordura ─── */
  { id: "girassol", name: "Girassol", protein: 200, fat: 510, carbs: 200, energy: 5800, price: 5.00, color: "#facc15" },
  { id: "cardi", name: "Cardi (mini girassol)", protein: 180, fat: 420, carbs: 280, energy: 5400, price: 6.50, color: "#fbbf24" },
  { id: "linhaca", name: "Linhaça", protein: 180, fat: 420, carbs: 290, energy: 5300, price: 8.00, color: "#92400e" },
  { id: "canhamo", name: "Cânhamo", protein: 250, fat: 300, carbs: 280, energy: 4900, price: 12.00, color: "#4d7c0f" },
  { id: "amendoim", name: "Amendoim", protein: 260, fat: 490, carbs: 160, energy: 5700, price: 9.00, color: "#c2410c" },
  { id: "canola", name: "Canola", protein: 210, fat: 450, carbs: 240, energy: 5500, price: 6.00, color: "#65a30d" },
  { id: "golza", name: "Golza (colza)", protein: 200, fat: 440, carbs: 250, energy: 5400, price: 5.50, color: "#3f6212" },
  { id: "nabao", name: "Nabão", protein: 190, fat: 430, carbs: 260, energy: 5300, price: 5.00, color: "#a3e635" },
  { id: "cartamo", name: "Cártamo", protein: 160, fat: 380, carbs: 340, energy: 5200, price: 7.00, color: "#ea580c" },

  /* ─── Suplementos alimentares ─── */
  { id: "levedura_cerveja", name: "Levedura de cerveja", protein: 450, fat: 20, carbs: 380, energy: 3600, price: 15.00, color: "#f59e0b" },
  { id: "farinha_peixe", name: "Farinha de peixe", protein: 600, fat: 90, carbs: 20, energy: 3800, price: 10.00, color: "#0ea5e9" },
];

export function getIngredient(id: string, extras?: Ingredient[]): Ingredient | undefined {
  return INGREDIENTS.find((i) => i.id === id) || extras?.find((i) => i.id === id);
}

/* ────────── Misturas pré-definidas por categoria ────────── */
export interface MixtureItem {
  ingredientId: string;
  kg: number;
}

export interface Mixture {
  id: string;
  name: string;
  emoji: string;
  items: MixtureItem[];
}

export const MIXTURES: Mixture[] = [
  {
    id: "velocidade",
    name: "Velocidade",
    emoji: "⚡",
    items: [
      { ingredientId: "milho_pequeno", kg: 4 },
      { ingredientId: "trigo", kg: 2.3 },
      { ingredientId: "sorgo", kg: 2 },
      { ingredientId: "ervilha", kg: 1 },
      { ingredientId: "girassol", kg: 0.3 },
    ],
  },
  {
    id: "meio_fundo",
    name: "Meio Fundo",
    emoji: "🔥",
    items: [
      { ingredientId: "milho", kg: 3.3 },
      { ingredientId: "trigo", kg: 2 },
      { ingredientId: "ervilha", kg: 2 },
      { ingredientId: "sorgo", kg: 1.3 },
      { ingredientId: "girassol", kg: 0.3 },
      { ingredientId: "arroz_casca", kg: 0.3 },
    ],
  },
  {
    id: "fundo",
    name: "Fundo",
    emoji: "🎯",
    items: [
      { ingredientId: "milho", kg: 3 },
      { ingredientId: "ervilha", kg: 2 },
      { ingredientId: "trigo", kg: 1.3 },
      { ingredientId: "girassol", kg: 1.3 },
      { ingredientId: "sorgo", kg: 1 },
      { ingredientId: "amendoim", kg: 0.3 },
      { ingredientId: "linhaca", kg: 0.3 },
    ],
  },
];

/* ────────── Cálculo nutricional de uma mistura ────────── */
export interface NutritionResult {
  totalKg: number;
  proteinPerKg: number; // g/kg
  fatPerKg: number; // g/kg
  energyPerKg: number; // kcal/kg
  costTotal: number; // R$
  costPerKg: number; // R$/kg
}

export function calcNutrition(items: MixtureItem[], extras?: Ingredient[]): NutritionResult {
  let totalKg = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalEnergy = 0;
  let totalCost = 0;

  for (const item of items) {
    const ing = getIngredient(item.ingredientId, extras);
    if (!ing || item.kg <= 0) continue;
    totalKg += item.kg;
    totalProtein += ing.protein * item.kg;
    totalFat += ing.fat * item.kg;
    totalEnergy += ing.energy * item.kg;
    totalCost += ing.price * item.kg;
  }

  return {
    totalKg,
    proteinPerKg: totalKg > 0 ? totalProtein / totalKg : 0,
    fatPerKg: totalKg > 0 ? totalFat / totalKg : 0,
    energyPerKg: totalKg > 0 ? totalEnergy / totalKg : 0,
    costTotal: totalCost,
    costPerKg: totalKg > 0 ? totalCost / totalKg : 0,
  };
}
