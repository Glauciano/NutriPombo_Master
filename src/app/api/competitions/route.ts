import { NextResponse } from "next/server";
import { db } from "@/db";
import { competitions } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const allCompetitions = await db
    .select()
    .from(competitions)
    .orderBy(sql`coalesce(order_number, 999999)`, competitions.date);
  return NextResponse.json(allCompetitions);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Get next order number
  const maxOrder = await db
    .select({ max: sql<number>`coalesce(max(order_number), 0)` })
    .from(competitions);
  const nextOrder = (maxOrder[0]?.max ?? 0) + 1;

  const [competition] = await db
    .insert(competitions)
    .values({
      orderNumber: nextOrder,
      name: body.name,
      club: body.club,
      federation: body.federation,
      date: new Date(body.date),
      arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : null,
      type: body.type,
      distance: body.distance,
      liberationPoint: body.liberationPoint,
      arrivalPoint: body.arrivalPoint,
      weather: body.weather,
      temperature: body.temperature,
      windDirection: body.windDirection,
      windSpeed: body.windSpeed,
      status: body.status || "agendada",
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(competition, { status: 201 });
}
