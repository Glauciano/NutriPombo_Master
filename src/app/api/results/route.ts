import { NextResponse } from "next/server";
import { db } from "@/db";
import { results, competitions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allResults = await db.select().from(results).orderBy(desc(results.createdAt));
  const allCompetitions = await db.select().from(competitions);
  const compMap = new Map(allCompetitions.map((c) => [c.id, c]));

  const enriched = allResults.map((r) => ({
    ...r,
    competitionName: compMap.get(r.competitionId)?.name || null,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [result] = await db
    .insert(results)
    .values({
      competitionId: body.competitionId,
      pigeonId: body.pigeonId,
      position: body.position,
      time: body.time,
      speed: body.speed,
      points: body.points,
      arrived: body.arrived ?? true,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(result, { status: 201 });
}
