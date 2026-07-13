import { NextResponse } from "next/server";
import { db } from "@/db";
import { competitions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const competition = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, parseInt(id)))
    .limit(1);
  if (!competition.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(competition[0]);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.club !== undefined) updateData.club = body.club;
  if (body.federation !== undefined) updateData.federation = body.federation;
  if (body.date !== undefined) updateData.date = new Date(body.date);
  if (body.arrivalDate !== undefined) updateData.arrivalDate = body.arrivalDate ? new Date(body.arrivalDate) : null;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.distance !== undefined) updateData.distance = body.distance;
  if (body.liberationPoint !== undefined) updateData.liberationPoint = body.liberationPoint;
  if (body.arrivalPoint !== undefined) updateData.arrivalPoint = body.arrivalPoint;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.orderNumber !== undefined) updateData.orderNumber = body.orderNumber;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const [updated] = await db
    .update(competitions)
    .set(updateData)
    .where(eq(competitions.id, parseInt(id)))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(competitions).where(eq(competitions.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
