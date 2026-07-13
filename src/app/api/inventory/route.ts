import { NextResponse } from "next/server";
import { db } from "@/db";
import { inventory } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allInventory = await db.select().from(inventory).orderBy(desc(inventory.createdAt));
  return NextResponse.json(allInventory);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [item] = await db
    .insert(inventory)
    .values({
      name: body.name,
      category: body.category,
      quantity: body.quantity,
      unit: body.unit,
      minStock: body.minStock,
      expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      batchNumber: body.batchNumber,
      supplier: body.supplier,
      price: body.price,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(item, { status: 201 });
}
