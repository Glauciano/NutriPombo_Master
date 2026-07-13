import { NextResponse } from "next/server";
import { db } from "@/db";
import { widowhoodPairs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.type !== undefined) updateData.type = body.type;
  if (body.separationDate !== undefined) updateData.separationDate = body.separationDate ? new Date(body.separationDate) : null;
  if (body.reunionDate !== undefined) updateData.reunionDate = body.reunionDate ? new Date(body.reunionDate) : null;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.notes !== undefined) updateData.notes = body.notes;

  const [updated] = await db
    .update(widowhoodPairs)
    .set(updateData)
    .where(eq(widowhoodPairs.id, parseInt(id)))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(widowhoodPairs).where(eq(widowhoodPairs.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
