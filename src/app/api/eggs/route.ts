import { NextResponse } from "next/server";
import { db } from "@/db";
import { eggs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allEggs = await db.select().from(eggs).orderBy(desc(eggs.createdAt));
  return NextResponse.json(allEggs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [egg] = await db
    .insert(eggs)
    .values({
      pairId: parseInt(body.pairId),
      layDate: new Date(body.layDate),
      expectedHatchDate: body.expectedHatchDate ? new Date(body.expectedHatchDate) : null,
      status: body.status || "posto",
      weight: body.weight,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(egg, { status: 201 });
}
