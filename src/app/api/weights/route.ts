import { NextResponse } from "next/server";
import { db } from "@/db";
import { weightRecords, pigeons } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pigeonId = searchParams.get("pigeonId");

  const records = pigeonId
    ? await db.select().from(weightRecords).where(eq(weightRecords.pigeonId, parseInt(pigeonId))).orderBy(desc(weightRecords.date))
    : await db.select().from(weightRecords).orderBy(desc(weightRecords.date));

  const allPigeons = await db.select().from(pigeons);
  const pigeonMap = new Map(allPigeons.map((p) => [p.id, p]));

  const enriched = records.map((r) => ({
    ...r,
    ringNumber: pigeonMap.get(r.pigeonId)?.ringNumber || null,
    pigeonName: pigeonMap.get(r.pigeonId)?.name || null,
    idealWeight: pigeonMap.get(r.pigeonId)?.idealWeight || null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [record] = await db
    .insert(weightRecords)
    .values({
      pigeonId: parseInt(body.pigeonId),
      date: new Date(body.date),
      weight: body.weight,
      notes: body.notes,
    })
    .returning();

  // also update pigeon's current weight
  await db
    .update(pigeons)
    .set({ currentWeight: body.weight, updatedAt: new Date() })
    .where(eq(pigeons.id, parseInt(body.pigeonId)));

  return NextResponse.json(record, { status: 201 });
}
