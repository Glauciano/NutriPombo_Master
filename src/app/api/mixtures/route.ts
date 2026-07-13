import { NextResponse } from "next/server";
import { db } from "@/db";
import { mixtures } from "@/db/schema";

export async function GET() {
  const allMixtures = await db.select().from(mixtures);
  return NextResponse.json(allMixtures);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [mixture] = await db
    .insert(mixtures)
    .values(body)
    .returning();
  return NextResponse.json(mixture, { status: 201 });
}
