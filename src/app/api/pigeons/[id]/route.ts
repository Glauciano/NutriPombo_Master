import { NextResponse } from "next/server";
import { db } from "@/db";
import { pigeons } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pigeon = await db.select().from(pigeons).where(eq(pigeons.id, parseInt(id))).limit(1);
  if (!pigeon.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pigeon[0]);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const [updated] = await db
    .update(pigeons)
    .set({
      ...body,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
      updatedAt: new Date(),
    })
    .where(eq(pigeons.id, parseInt(id)))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(pigeons).where(eq(pigeons.id, parseInt(id)));
  return NextResponse.json({ success: true });
}
