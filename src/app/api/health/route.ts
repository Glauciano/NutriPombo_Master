import { NextResponse } from "next/server";
import { db } from "@/db";
import { healthRecords, pigeons } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const records = await db.select().from(healthRecords).orderBy(desc(healthRecords.date));
  const allPigeons = await db.select().from(pigeons);
  const pigeonMap = new Map(allPigeons.map((p) => [p.id, p]));

  const enriched = records.map((r) => ({
    ...r,
    pigeonRing: pigeonMap.get(r.pigeonId)?.ringNumber || null,
    pigeonName: pigeonMap.get(r.pigeonId)?.name || null,
  }));

  return NextResponse.json(enriched);
}
