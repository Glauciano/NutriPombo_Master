import { db } from "./index";
import {
  pigeons,
  breedingPairs,
  eggs,
  healthRecords,
  vaccinations,
  foods,
  mixtures,
  trainings,
  competitions,
  results,
  transactions,
  inventory,
  aiRecommendations,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  // Pigeons
  const pigeonData = [
    { ringNumber: "BR-2024-0001", name: "Relâmpago", sex: "macho" as const, color: "Azul", breed: "Racing Homer", category: "atleta" as const, status: "ativo" as const, currentWeight: "450" },
    { ringNumber: "BR-2024-0002", name: "Estrela", sex: "femea" as const, color: "Vermelho", breed: "Racing Homer", category: "reprodutor" as const, status: "ativo" as const, currentWeight: "420" },
    { ringNumber: "BR-2024-0003", name: "Flecha", sex: "macho" as const, color: "Preto", breed: "Racing Homer", category: "atleta" as const, status: "ativo" as const, currentWeight: "440" },
    { ringNumber: "BR-2024-0004", name: "Princesa", sex: "femea" as const, color: "Branco", breed: "Racing Homer", category: "reprodutor" as const, status: "ativo" as const, currentWeight: "410" },
    { ringNumber: "BR-2024-0005", name: "Trovão", sex: "macho" as const, color: "Azul Barrado", breed: "Racing Homer", category: "atleta" as const, status: "ativo" as const, currentWeight: "460" },
    { ringNumber: "BR-2024-0006", name: "Ninja", sex: "macho" as const, color: "Cinza", breed: "Racing Homer", category: "atleta" as const, status: "doente" as const, currentWeight: "430" },
    { ringNumber: "BR-2024-0007", name: "Luz", sex: "femea" as const, color: "Amarelo", breed: "Racing Homer", category: "filhote" as const, status: "ativo" as const, currentWeight: "380" },
    { ringNumber: "BR-2024-0008", name: "Sombra", sex: "macho" as const, color: "Preto", breed: "Racing Homer", category: "viuvo" as const, status: "ativo" as const, currentWeight: "455" },
    { ringNumber: "BR-2024-0009", name: "Vento", sex: "macho" as const, color: "Azul", breed: "Racing Homer", category: "atleta" as const, status: "ativo" as const, currentWeight: "445" },
    { ringNumber: "BR-2024-0010", name: "Raios", sex: "femea" as const, color: "Vermelho", breed: "Racing Homer", category: "atleta" as const, status: "ativo" as const, currentWeight: "425" },
  ];

  const insertedPigeons = await db.insert(pigeons).values(pigeonData).returning();
  console.log(`Inserted ${insertedPigeons.length} pigeons`);

  // Breeding pairs
  const pairData = [
    { maleId: insertedPigeons[0].id, femaleId: insertedPigeons[1].id, startDate: new Date("2024-01-15"), isActive: true },
    { maleId: insertedPigeons[2].id, femaleId: insertedPigeons[3].id, startDate: new Date("2024-02-01"), isActive: true },
    { maleId: insertedPigeons[4].id, femaleId: insertedPigeons[9].id, startDate: new Date("2023-06-10"), isActive: false, endDate: new Date("2023-12-01") },
  ];
  const insertedPairs = await db.insert(breedingPairs).values(pairData).returning();
  console.log(`Inserted ${insertedPairs.length} breeding pairs`);

  // Eggs
  const eggData = [
    { pairId: insertedPairs[0].id, layDate: new Date("2024-03-01"), expectedHatchDate: new Date("2024-03-18"), status: "nascido" as const },
    { pairId: insertedPairs[0].id, layDate: new Date("2024-04-10"), expectedHatchDate: new Date("2024-04-27"), status: "incubando" as const },
    { pairId: insertedPairs[1].id, layDate: new Date("2024-04-05"), expectedHatchDate: new Date("2024-04-22"), status: "fertil" as const },
  ];
  await db.insert(eggs).values(eggData);
  console.log(`Inserted ${eggData.length} eggs`);

  // Health records
  const healthData = [
    { pigeonId: insertedPigeons[5].id, date: new Date("2024-04-01"), disease: "Tricomoníase", diagnosis: "Infecção leve na cavidade oral", treatment: "Ronidazol 20mg/kg por 7 dias", result: "em_tratamento" },
    { pigeonId: insertedPigeons[0].id, date: new Date("2024-03-15"), disease: "Coccidiose", diagnosis: "Exame de fezes positivo", treatment: "Amprolium 30ml/L água por 5 dias", result: "curado" },
    { pigeonId: insertedPigeons[2].id, date: new Date("2024-02-20"), disease: "Respiratória", diagnosis: "Secreção nasal leve", treatment: "Enrofloxacino 10mg/kg por 10 dias", result: "curado" },
  ];
  await db.insert(healthRecords).values(healthData);
  console.log(`Inserted ${healthData.length} health records`);

  // Vaccinations
  const vaccData = [
    { pigeonId: insertedPigeons[0].id, vaccineName: "Paramixovírus", date: new Date("2024-01-10"), nextDate: new Date("2025-01-10") },
    { pigeonId: insertedPigeons[1].id, vaccineName: "Paramixovírus", date: new Date("2024-01-10"), nextDate: new Date("2025-01-10") },
    { pigeonId: insertedPigeons[2].id, vaccineName: "Varíola", date: new Date("2024-02-15"), nextDate: new Date("2025-02-15") },
    { pigeonId: insertedPigeons[3].id, vaccineName: "Paramixovírus", date: new Date("2024-01-10"), nextDate: new Date("2025-01-10") },
  ];
  await db.insert(vaccinations).values(vaccData);
  console.log(`Inserted ${vaccData.length} vaccinations`);

  // Foods
  const foodData = [
    { name: "Milho", category: "Grão", protein: "8.5", fat: "3.8", carbohydrates: "72", energy: "365" },
    { name: "Ervilha", category: "Leguminosa", protein: "22", fat: "1.2", carbohydrates: "58", energy: "340" },
    { name: "Trigo", category: "Grão", protein: "12", fat: "2", carbohydrates: "68", energy: "340" },
    { name: "Aveia", category: "Grão", protein: "11", fat: "5", carbohydrates: "60", energy: "390" },
    { name: "Girassol", category: "Semente", protein: "20", fat: "51", carbohydrates: "20", energy: "580" },
  ];
  await db.insert(foods).values(foodData);
  console.log(`Inserted ${foodData.length} foods`);

  // Mixtures
  const mixtureData = [
    { name: "Mistura Velocidade", type: "velocidade" as const, purpose: "Provas curtas", totalWeight: "25" },
    { name: "Mistura Meio Fundo", type: "meio_fundo" as const, purpose: "Provas médias", totalWeight: "30" },
    { name: "Mistura Fundo", type: "fundo" as const, purpose: "Provas longas", totalWeight: "35" },
  ];
  await db.insert(mixtures).values(mixtureData);
  console.log(`Inserted ${mixtureData.length} mixtures`);

  // Trainings
  const trainingData = [
    { pigeonId: insertedPigeons[0].id, date: new Date("2024-04-15"), type: "velocidade" as const, distance: "5", duration: 12, speed: "1250", temperature: "24", weather: "Ensolarado", windDirection: "NE", performance: 92 },
    { pigeonId: insertedPigeons[0].id, date: new Date("2024-04-17"), type: "meio_fundo" as const, distance: "50", duration: 45, speed: "1111", temperature: "22", weather: "Parcialmente nublado", windDirection: "E", performance: 88 },
    { pigeonId: insertedPigeons[2].id, date: new Date("2024-04-16"), type: "velocidade" as const, distance: "5", duration: 11, speed: "1363", temperature: "25", weather: "Ensolarado", windDirection: "NE", performance: 95 },
    { pigeonId: insertedPigeons[4].id, date: new Date("2024-04-18"), type: "fundo" as const, distance: "100", duration: 95, speed: "1052", temperature: "23", weather: "Nublado", windDirection: "SE", performance: 85 },
  ];
  await db.insert(trainings).values(trainingData);
  console.log(`Inserted ${trainingData.length} trainings`);

  // Competitions
  const competitionData = [
    { name: "Prova Clubes Regional", club: "Clube de Columbofilia SP", date: new Date("2024-05-10"), type: "meio_fundo" as const, distance: "250", liberationPoint: "Sorocaba", status: "agendada" },
    { name: "Campeonato Estadual", club: "Federação Paulista", date: new Date("2024-04-20"), type: "fundo" as const, distance: "400", liberationPoint: "Bauru", status: "concluida" },
    { name: "Prova de Velocidade", club: "Clube de Columbofilia SP", date: new Date("2024-05-05"), type: "velocidade" as const, distance: "100", liberationPoint: "Campinas", status: "agendada" },
  ];
  const insertedCompetitions = await db.insert(competitions).values(competitionData).returning();
  console.log(`Inserted ${insertedCompetitions.length} competitions`);

  // Results
  const resultData = [
    { competitionId: insertedCompetitions[1].id, pigeonId: insertedPigeons[0].id, position: 5, speed: "1450", points: "85", arrived: true },
    { competitionId: insertedCompetitions[1].id, pigeonId: insertedPigeons[2].id, position: 12, speed: "1420", points: "70", arrived: true },
    { competitionId: insertedCompetitions[1].id, pigeonId: insertedPigeons[4].id, position: 3, speed: "1480", points: "95", arrived: true },
  ];
  await db.insert(results).values(resultData);
  console.log(`Inserted ${resultData.length} results`);

  // Transactions
  const transactionData = [
    { type: "despesa" as const, category: "racoes" as const, amount: "450.00", description: "Compra de ração mensal", date: new Date("2024-04-01") },
    { type: "despesa" as const, category: "medicamentos" as const, amount: "180.50", description: "Antibióticos e vitaminas", date: new Date("2024-04-05") },
    { type: "receita" as const, category: "premiacoes" as const, amount: "1200.00", description: "Prêmio Campeonato Estadual", date: new Date("2024-04-22") },
    { type: "despesa" as const, category: "materiais" as const, amount: "95.00", description: "Anilhas e equipamentos", date: new Date("2024-04-10") },
    { type: "receita" as const, category: "venda" as const, amount: "800.00", description: "Venda de filhote", date: new Date("2024-03-20") },
  ];
  await db.insert(transactions).values(transactionData);
  console.log(`Inserted ${transactionData.length} transactions`);

  // Inventory
  const inventoryData = [
    { name: "Ronidazol 20%", category: "medicamentos" as const, quantity: "2", unit: "frascos", minStock: "1", expirationDate: new Date("2025-06-01") },
    { name: "Enrofloxacino 10%", category: "medicamentos" as const, quantity: "1", unit: "frascos", minStock: "1", expirationDate: new Date("2025-03-15") },
    { name: "Mistura Premium", category: "racoes" as const, quantity: "25", unit: "kg", minStock: "10", expirationDate: new Date("2024-12-01") },
    { name: "Vitagold", category: "vitaminas" as const, quantity: "3", unit: "frascos", minStock: "2", expirationDate: new Date("2025-01-01") },
    { name: "Vacina Paramixovírus", category: "vacinas" as const, quantity: "5", unit: "doses", minStock: "3", expirationDate: new Date("2024-08-01") },
  ];
  await db.insert(inventory).values(inventoryData);
  console.log(`Inserted ${inventoryData.length} inventory items`);

  // AI Recommendations
  const recData = [
    { type: "nutricao", title: "Ajuste na alimentação", description: "Com temperatura elevada, reduza girassol em 20% e aumente eletrólitos na água.", priority: "media" },
    { type: "treino", title: "Aumento gradual de distância", description: "Próxima semana aumente treinos em 15% para preparar prova de 250km.", priority: "alta" },
    { type: "saude", title: "Vacinação pendente", description: "3 pombos estão com vacina de varíola vencendo em 15 dias.", priority: "alta" },
    { type: "reproducao", title: "Sugestão de cruzamento", description: "O casal Relâmpago x Estrela apresenta 92% de sucesso. Considere nova postura.", priority: "media" },
    { type: "prova", title: "Previsão próxima prova", description: "Condições meteorológicas favoráveis para prova de 250km no próximo sábado.", priority: "baixa" },
  ];
  await db.insert(aiRecommendations).values(recData);
  console.log(`Inserted ${recData.length} AI recommendations`);

  console.log("Seed completed!");
}

seed().catch(console.error);
