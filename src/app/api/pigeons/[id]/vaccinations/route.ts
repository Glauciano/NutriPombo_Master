import { NextResponse } from "next/server";
import { db } from "@/db";
import { vaccinations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = await db
    .select()
    .from(vaccinations)
    .where(eq(vaccinations.pigeonId, parseInt(id)))
    .orderBy(desc(vaccinations.date));
  return NextResponse.json(records);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const [record] = await db
    .insert(vaccinations)
    .values({
      pigeonId: parseInt(id),
      vaccineName: body.vaccineName,
      date: new Date(body.date),
      nextDate: body.nextDate ? new Date(body.nextDate) : null,
      batchNumber: body.batchNumber,
      veterinarian: body.veterinarian,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(record, { status: 201 });
}
