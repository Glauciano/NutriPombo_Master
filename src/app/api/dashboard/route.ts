import { NextResponse } from "next/server";
import { db } from "@/db";
import { pigeons, breedingPairs, eggs, healthRecords, competitions, results, transactions, inventory, aiRecommendations } from "@/db/schema";
import { eq, sql, and, gte, lt } from "drizzle-orm";

export async function GET() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

  const [
    totalPigeons,
    males,
    females,
    chicks,
    widowers,
    breeders,
    athletes,
    retired,
    sick,
    inTreatment,
    deaths,
    monthBirths,
    activePairs,
    weekTrainings,
    nextCompetition,
    lastResults,
    avgSpeed,
    totalDistance,
    financialResult,
    expiringMeds,
    missingVaccines,
    missingRings,
    missingPigeons,
    unreadAlerts,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pigeons).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.sex, "macho")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.sex, "femea")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.category, "filhote")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.category, "viuvo")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.category, "reprodutor")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.category, "atleta")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.status, "aposentado")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.status, "doente")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.status, "em_tratamento")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.status, "morto")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(
      and(gte(pigeons.birthDate, firstDayOfMonth), lt(pigeons.birthDate, new Date(now.getFullYear(), now.getMonth() + 1, 1)))
    ).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(breedingPairs).where(eq(breedingPairs.isActive, true)).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(
      gte(pigeons.updatedAt, firstDayOfWeek)
    ).then(r => r[0]?.count ?? 0),
    db.select().from(competitions).where(gte(competitions.date, now)).orderBy(competitions.date).limit(1).then(r => r[0] ?? null),
    db.select().from(results).orderBy(results.createdAt).limit(5).then(r => r),
    db.select({ avg: sql<number>`avg(speed)` }).from(results).where(sql`speed > 0`).then(r => r[0]?.avg ?? 0),
    db.select({ sum: sql<number>`sum(distance)` }).from(competitions).where(sql`status = 'concluida'`).then(r => r[0]?.sum ?? 0),
    db.select({ total: sql<number>`sum(case when type = 'receita' then amount else -amount end)` }).from(transactions).then(r => r[0]?.total ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(inventory).where(
      and(sql`expiration_date is not null`, sql`expiration_date <= now() + interval '30 days'`)
    ).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(
      sql`not exists (select 1 from vaccinations where vaccinations.pigeon_id = pigeons.id and vaccinations.date > now() - interval '1 year')`
    ).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(
      and(eq(pigeons.category, "filhote"), sql`ring_number is null`)
    ).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(pigeons).where(eq(pigeons.status, "desaparecido")).then(r => r[0]?.count ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(aiRecommendations).where(eq(aiRecommendations.isRead, false)).then(r => r[0]?.count ?? 0),
  ]);

  return NextResponse.json({
    stats: {
      totalPigeons,
      males,
      females,
      chicks,
      widowers,
      breeders,
      athletes,
      retired,
      sick,
      inTreatment,
      deaths,
      monthBirths,
      activePairs,
      weekTrainings,
      avgSpeed: Math.round(avgSpeed * 100) / 100,
      totalDistance: Math.round(totalDistance * 100) / 100,
      financialResult: Math.round(financialResult * 100) / 100,
      expiringMeds,
      missingVaccines,
      missingRings,
      missingPigeons,
      unreadAlerts,
    },
    nextCompetition,
    lastResults,
  });
}
