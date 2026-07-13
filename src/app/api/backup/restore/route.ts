import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  pigeons,
  breedingPairs,
  eggs,
  chicks,
  healthRecords,
  vaccinations,
  foods,
  mixtures,
  feedings,
  trainings,
  competitions,
  results,
  transactions,
  inventory,
  aiRecommendations,
  widowhoodPairs,
  settings,
} from "@/db/schema";
import { sql } from "drizzle-orm";

/* convert ISO strings back to Date for date/timestamp columns */
function conv(row: Record<string, unknown>, dateFields: string[]): Record<string, unknown> {
  const out = { ...row };
  for (const f of dateFields) {
    if (out[f] && typeof out[f] === "string") {
      out[f] = new Date(out[f] as string);
    }
  }
  return out;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = body.data;
    if (!data) {
      return NextResponse.json({ error: "invalid_backup" }, { status: 400 });
    }

    // Clear all tables (order matters due to no FK but keep logical)
    await db.execute(sql`TRUNCATE TABLE results, competitions, trainings, feedings, mixtures, foods, vaccinations, health_records, chicks, eggs, breeding_pairs, widowhood_pairs, transactions, inventory, ai_recommendations, settings, pigeons RESTART IDENTITY CASCADE`);

    // Restore each table
    if (data.pigeons?.length) {
      await db.insert(pigeons).values(
        data.pigeons.map((r: Record<string, unknown>) => conv(r, ["birthDate", "createdAt", "updatedAt"]))
      );
    }
    if (data.breedingPairs?.length) {
      await db.insert(breedingPairs).values(
        data.breedingPairs.map((r: Record<string, unknown>) => conv(r, ["startDate", "endDate", "createdAt"]))
      );
    }
    if (data.eggs?.length) {
      await db.insert(eggs).values(
        data.eggs.map((r: Record<string, unknown>) => conv(r, ["layDate", "expectedHatchDate", "actualHatchDate", "createdAt"]))
      );
    }
    if (data.chicks?.length) {
      await db.insert(chicks).values(
        data.chicks.map((r: Record<string, unknown>) => conv(r, ["weaningDate", "firstFlightDate", "firstTrainingDate", "firstRaceDate", "createdAt"]))
      );
    }
    if (data.healthRecords?.length) {
      await db.insert(healthRecords).values(
        data.healthRecords.map((r: Record<string, unknown>) => conv(r, ["date", "createdAt"]))
      );
    }
    if (data.vaccinations?.length) {
      await db.insert(vaccinations).values(
        data.vaccinations.map((r: Record<string, unknown>) => conv(r, ["date", "nextDate", "createdAt"]))
      );
    }
    if (data.foods?.length) {
      await db.insert(foods).values(
        data.foods.map((r: Record<string, unknown>) => conv(r, ["createdAt"]))
      );
    }
    if (data.mixtures?.length) {
      await db.insert(mixtures).values(
        data.mixtures.map((r: Record<string, unknown>) => conv(r, ["createdAt"]))
      );
    }
    if (data.feedings?.length) {
      await db.insert(feedings).values(
        data.feedings.map((r: Record<string, unknown>) => conv(r, ["date", "createdAt"]))
      );
    }
    if (data.trainings?.length) {
      await db.insert(trainings).values(
        data.trainings.map((r: Record<string, unknown>) => conv(r, ["date", "createdAt"]))
      );
    }
    if (data.competitions?.length) {
      await db.insert(competitions).values(
        data.competitions.map((r: Record<string, unknown>) => conv(r, ["date", "arrivalDate", "createdAt"]))
      );
    }
    if (data.results?.length) {
      await db.insert(results).values(
        data.results.map((r: Record<string, unknown>) => conv(r, ["createdAt"]))
      );
    }
    if (data.transactions?.length) {
      await db.insert(transactions).values(
        data.transactions.map((r: Record<string, unknown>) => conv(r, ["date", "createdAt"]))
      );
    }
    if (data.inventory?.length) {
      await db.insert(inventory).values(
        data.inventory.map((r: Record<string, unknown>) => conv(r, ["expirationDate", "createdAt", "updatedAt"]))
      );
    }
    if (data.aiRecommendations?.length) {
      await db.insert(aiRecommendations).values(
        data.aiRecommendations.map((r: Record<string, unknown>) => conv(r, ["createdAt"]))
      );
    }
    if (data.widowhoodPairs?.length) {
      await db.insert(widowhoodPairs).values(
        data.widowhoodPairs.map((r: Record<string, unknown>) => conv(r, ["separationDate", "reunionDate", "createdAt"]))
      );
    }
    if (data.settings?.length) {
      await db.insert(settings).values(
        data.settings.map((r: Record<string, unknown>) => conv(r, ["updatedAt"]))
      );
    }

    return NextResponse.json({ success: true, restored: Object.keys(data).length });
  } catch (err) {
    return NextResponse.json({ error: "restore_failed", message: String(err) }, { status: 500 });
  }
}
