import { NextResponse } from "next/server";
import { db } from "@/db";
import { trainings } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allTrainings = await db.select().from(trainings).orderBy(desc(trainings.date));
  return NextResponse.json(allTrainings);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [training] = await db
    .insert(trainings)
    .values({
      pigeonId: body.pigeonId || null,
      groupId: body.groupId || null,
      date: new Date(body.date),
      type: body.type,
      distance: body.distance,
      duration: body.duration,
      speed: body.speed,
      temperature: body.temperature,
      weather: body.weather,
      windDirection: body.windDirection,
      windSpeed: body.windSpeed,
      performance: body.performance,
      fatigue: body.fatigue,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(training, { status: 201 });
}
