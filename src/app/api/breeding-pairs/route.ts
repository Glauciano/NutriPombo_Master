import { NextResponse } from "next/server";
import { db } from "@/db";
import { breedingPairs, pigeons } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const pairs = await db.select().from(breedingPairs).orderBy(desc(breedingPairs.createdAt));
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
    .insert(breedingPairs)
    .values({
      maleId: parseInt(body.maleId),
      femaleId: parseInt(body.femaleId),
      startDate: new Date(body.startDate),
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(pair, { status: 201 });
}
