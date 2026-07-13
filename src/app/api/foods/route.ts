import { NextResponse } from "next/server";
import { db } from "@/db";
import { foods } from "@/db/schema";

export async function GET() {
  const allFoods = await db.select().from(foods);
  return NextResponse.json(allFoods);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [food] = await db
    .insert(foods)
    .values(body)
    .returning();
  return NextResponse.json(food, { status: 201 });
}
