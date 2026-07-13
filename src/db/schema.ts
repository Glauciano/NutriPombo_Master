import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
  boolean,
  numeric,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const pigeonStatusEnum = pgEnum("pigeon_status", [
  "ativo",
  "morto",
  "vendido",
  "emprestado",
  "desaparecido",
  "aposentado",
  "doente",
  "em_tratamento",
]);

export const pigeonSexEnum = pgEnum("pigeon_sex", ["macho", "femea", "desconhecido"]);

export const pigeonCategoryEnum = pgEnum("pigeon_category", [
  "reprodutor",
  "atleta",
  "filhote",
  "viuvo",
  "aposentado",
]);

export const raceTypeEnum = pgEnum("race_type", [
  "velocidade",
  "meio_fundo",
  "fundo",
  "ultra_fundo",
]);

export const eggStatusEnum = pgEnum("egg_status", [
  "posto",
  "incubando",
  "fertil",
  "infertil",
  "quebrado",
  "nascido",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "receita",
  "despesa",
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  "compra",
  "venda",
  "medicamentos",
  "racoes",
  "premiacoes",
  "materiais",
  "outros",
]);

export const inventoryCategoryEnum = pgEnum("inventory_category", [
  "medicamentos",
  "racoes",
  "vitaminas",
  "suplementos",
  "vacinas",
  "materiais",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  plan: varchar("plan", { length: 50 }).default("gratis").notNull(),
  planExpiresAt: timestamp("plan_expires_at", { mode: "date" }),
  avatar: text("avatar"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const pigeons = pgTable("pigeons", {
  id: serial("id").primaryKey(),
  ringNumber: varchar("ring_number", { length: 100 }).notNull().unique(),
  internalCode: varchar("internal_code", { length: 100 }),
  qrCode: text("qr_code"),
  name: varchar("name", { length: 255 }),
  sex: pigeonSexEnum("sex").default("desconhecido").notNull(),
  color: varchar("color", { length: 100 }),
  breed: varchar("breed", { length: 100 }),
  geneticLine: varchar("genetic_line", { length: 255 }),
  originBreeder: varchar("origin_breeder", { length: 255 }),
  birthDate: date("birth_date", { mode: "date" }),
  idealWeight: numeric("ideal_weight", { precision: 6, scale: 2 }),
  currentWeight: numeric("current_weight", { precision: 6, scale: 2 }),
  photos: jsonb("photos").$type<string[]>(),
  videos: jsonb("videos").$type<string[]>(),
  documents: jsonb("documents").$type<string[]>(),
  certificates: jsonb("certificates").$type<string[]>(),
  observations: text("observations"),
  status: pigeonStatusEnum("status").default("ativo").notNull(),
  category: pigeonCategoryEnum("category").default("atleta").notNull(),
  fatherId: integer("father_id"),
  motherId: integer("mother_id"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const breedingPairs = pgTable("breeding_pairs", {
  id: serial("id").primaryKey(),
  maleId: integer("male_id").notNull(),
  femaleId: integer("female_id").notNull(),
  startDate: date("start_date", { mode: "date" }).notNull(),
  endDate: date("end_date", { mode: "date" }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const eggs = pgTable("eggs", {
  id: serial("id").primaryKey(),
  pairId: integer("pair_id").notNull(),
  layDate: date("lay_date", { mode: "date" }).notNull(),
  expectedHatchDate: date("expected_hatch_date", { mode: "date" }),
  actualHatchDate: date("actual_hatch_date", { mode: "date" }),
  status: eggStatusEnum("status").default("posto").notNull(),
  weight: numeric("weight", { precision: 6, scale: 2 }),
  temperature: numeric("temperature", { precision: 4, scale: 1 }),
  humidity: numeric("humidity", { precision: 5, scale: 2 }),
  candlingResults: jsonb("candling_results").$type<{ date: string; result: string }[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const chicks = pgTable("chicks", {
  id: serial("id").primaryKey(),
  eggId: integer("egg_id").notNull(),
  pigeonId: integer("pigeon_id"),
  ringNumber: varchar("ring_number", { length: 100 }),
  birthWeight: numeric("birth_weight", { precision: 6, scale: 2 }),
  weaningDate: date("weaning_date", { mode: "date" }),
  firstFlightDate: date("first_flight_date", { mode: "date" }),
  firstTrainingDate: date("first_training_date", { mode: "date" }),
  firstRaceDate: date("first_race_date", { mode: "date" }),
  dailyWeights: jsonb("daily_weights").$type<{ date: string; weight: number }[]>(),
  photos: jsonb("photos").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const healthRecords = pgTable("health_records", {
  id: serial("id").primaryKey(),
  pigeonId: integer("pigeon_id").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  disease: varchar("disease", { length: 255 }),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  treatment: text("treatment"),
  medications: jsonb("medications").$type<{ name: string; dosage: string; days: number }[]>(),
  veterinarian: varchar("veterinarian", { length: 255 }),
  labResults: text("lab_results"),
  radiographs: jsonb("radiographs").$type<string[]>(),
  result: varchar("result", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const vaccinations = pgTable("vaccinations", {
  id: serial("id").primaryKey(),
  pigeonId: integer("pigeon_id").notNull(),
  vaccineName: varchar("vaccine_name", { length: 255 }).notNull(),
  date: date("date", { mode: "date" }).notNull(),
  nextDate: date("next_date", { mode: "date" }),
  batchNumber: varchar("batch_number", { length: 100 }),
  veterinarian: varchar("veterinarian", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  protein: numeric("protein", { precision: 5, scale: 2 }),
  fat: numeric("fat", { precision: 5, scale: 2 }),
  carbohydrates: numeric("carbohydrates", { precision: 5, scale: 2 }),
  fiber: numeric("fiber", { precision: 5, scale: 2 }),
  energy: numeric("energy", { precision: 6, scale: 2 }),
  pricePerKg: numeric("price_per_kg", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const mixtures = pgTable("mixtures", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: raceTypeEnum("type").notNull(),
  purpose: varchar("purpose", { length: 100 }).notNull(),
  ingredients: jsonb("ingredients").$type<{ foodId: number; percentage: number }[]>(),
  totalWeight: numeric("total_weight", { precision: 8, scale: 2 }),
  supplements: jsonb("supplements").$type<{ name: string; amount: string }[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const feedings = pgTable("feedings", {
  id: serial("id").primaryKey(),
  pigeonId: integer("pigeon_id"),
  groupId: varchar("group_id", { length: 100 }),
  date: date("date", { mode: "date" }).notNull(),
  mixtureId: integer("mixture_id"),
  amount: numeric("amount", { precision: 8, scale: 2 }),
  supplements: jsonb("supplements").$type<{ name: string; amount: string }[]>(),
  waterAdditives: jsonb("water_additives").$type<{ name: string; amount: string }[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  pigeonId: integer("pigeon_id"),
  groupId: varchar("group_id", { length: 100 }),
  date: date("date", { mode: "date" }).notNull(),
  type: raceTypeEnum("type").notNull(),
  distance: numeric("distance", { precision: 8, scale: 2 }),
  duration: integer("duration"),
  speed: numeric("speed", { precision: 6, scale: 2 }),
  altitude: numeric("altitude", { precision: 8, scale: 2 }),
  temperature: numeric("temperature", { precision: 4, scale: 1 }),
  weather: varchar("weather", { length: 100 }),
  windDirection: varchar("wind_direction", { length: 50 }),
  windSpeed: numeric("wind_speed", { precision: 5, scale: 2 }),
  performance: integer("performance"),
  fatigue: integer("fatigue"),
  gpsData: jsonb("gps_data").$type<{ lat: number; lng: number; timestamp: string }[]>(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  orderNumber: integer("order_number"),
  name: varchar("name", { length: 255 }).notNull(),
  club: varchar("club", { length: 255 }),
  federation: varchar("federation", { length: 255 }),
  date: date("date", { mode: "date" }).notNull(),
  arrivalDate: date("arrival_date", { mode: "date" }),
  type: raceTypeEnum("type").notNull(),
  distance: numeric("distance", { precision: 8, scale: 2 }),
  liberationPoint: varchar("liberation_point", { length: 255 }),
  arrivalPoint: varchar("arrival_point", { length: 255 }),
  weather: varchar("weather", { length: 100 }),
  temperature: numeric("temperature", { precision: 4, scale: 1 }),
  windDirection: varchar("wind_direction", { length: 50 }),
  windSpeed: numeric("wind_speed", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 50 }).default("agendada").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  competitionId: integer("competition_id").notNull(),
  pigeonId: integer("pigeon_id").notNull(),
  position: integer("position"),
  time: integer("time"),
  speed: numeric("speed", { precision: 8, scale: 2 }),
  points: numeric("points", { precision: 8, scale: 2 }),
  arrived: boolean("arrived").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: transactionTypeEnum("type").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date", { mode: "date" }).notNull(),
  relatedPigeonId: integer("related_pigeon_id"),
  receiptUrl: text("receipt_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: inventoryCategoryEnum("category").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  minStock: numeric("min_stock", { precision: 10, scale: 2 }),
  expirationDate: date("expiration_date", { mode: "date" }),
  batchNumber: varchar("batch_number", { length: 100 }),
  supplier: varchar("supplier", { length: 255 }),
  price: numeric("price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).default("media").notNull(),
  relatedPigeonId: integer("related_pigeon_id"),
  relatedPairId: integer("related_pair_id"),
  relatedCompetitionId: integer("related_competition_id"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const weightRecords = pgTable("weight_records", {
  id: serial("id").primaryKey(),
  pigeonId: integer("pigeon_id").notNull(),
  date: date("date", { mode: "date" }).notNull(),
  weight: numeric("weight", { precision: 6, scale: 1 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const widowhoodPairs = pgTable("widowhood_pairs", {
  id: serial("id").primaryKey(),
  maleId: integer("male_id").notNull(),
  femaleId: integer("female_id").notNull(),
  type: varchar("type", { length: 50 }).default("classica").notNull(),
  separationDate: date("separation_date", { mode: "date" }),
  reunionDate: date("reunion_date", { mode: "date" }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const weatherLogs = pgTable("weather_logs", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "date" }).notNull(),
  temperature: numeric("temperature", { precision: 4, scale: 1 }),
  humidity: numeric("humidity", { precision: 5, scale: 2 }),
  windDirection: varchar("wind_direction", { length: 50 }),
  windSpeed: numeric("wind_speed", { precision: 5, scale: 2 }),
  pressure: numeric("pressure", { precision: 7, scale: 2 }),
  weather: varchar("weather", { length: 100 }),
  moonPhase: varchar("moon_phase", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
