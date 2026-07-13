import { NextResponse } from "next/server";
import { db } from "@/db";
import { healthRecords } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const records = await db
    .select()
    .from(healthRecords)
    .where(eq(healthRecords.pigeonId, parseInt(id)))
    .orderBy(desc(healthRecords.date));
  return NextResponse.json(records);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const [record] = await db
    .insert(healthRecords)
    .values({
      pigeonId: parseInt(id),
      date: new Date(body.date),
      disease: body.disease,
      symptoms: body.symptoms,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      medications: body.medications,
      veterinarian: body.veterinarian,
      result: body.result,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(record, { status: 201 });
}
