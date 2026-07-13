import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiRecommendations } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allRecommendations = await db.select().from(aiRecommendations).orderBy(desc(aiRecommendations.createdAt));
  return NextResponse.json(allRecommendations);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [rec] = await db
    .insert(aiRecommendations)
    .values(body)
    .returning();
  return NextResponse.json(rec, { status: 201 });
}
