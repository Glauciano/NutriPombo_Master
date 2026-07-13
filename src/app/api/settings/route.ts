import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key) {
    const row = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (!row.length) return NextResponse.json({ key, value: null });
    return NextResponse.json(row[0]);
  }

  const all = await db.select().from(settings);
  return NextResponse.json(all);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { key, value } = body;

  if (!key || value === undefined) {
    return NextResponse.json({ error: "key and value required" }, { status: 400 });
  }

  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return NextResponse.json(updated);
  }

  const [created] = await db.insert(settings).values({ key, value }).returning();
  return NextResponse.json(created, { status: 201 });
}
