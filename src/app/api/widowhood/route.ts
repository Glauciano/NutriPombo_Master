import { NextResponse } from "next/server";
import { db } from "@/db";
import { widowhoodPairs, pigeons } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const pairs = await db.select().from(widowhoodPairs).orderBy(desc(widowhoodPairs.createdAt));
  const allPigeons = await db.select().from(pigeons);
  const pigeonMap = new Map(allPigeons.map((p) => [p.id, p]));

  const enriched = pairs.map((pair) => ({
    ...pair,
    maleRing: pigeonMap.get(pair.maleId)?.ringNumber || null,
    maleName: pigeonMap.get(pair.maleId)?.name || null,
    femaleRing: pigeonMap.get(pair.femaleId)?.ringNumber || null,
    femaleName: pigeonMap.get(pair.femaleId)?.name || null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [pair] = await db
    .insert(widowhoodPairs)
    .values({
      maleId: parseInt(body.maleId),
      femaleId: parseInt(body.femaleId),
      type: body.type || "classica",
      separationDate: body.separationDate ? new Date(body.separationDate) : null,
      reunionDate: body.reunionDate ? new Date(body.reunionDate) : null,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(pair, { status: 201 });
}
