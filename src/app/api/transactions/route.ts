import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.date));
  return NextResponse.json(allTransactions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const [transaction] = await db
    .insert(transactions)
    .values({
      type: body.type,
      category: body.category,
      amount: body.amount,
      description: body.description,
      date: new Date(body.date),
      relatedPigeonId: body.relatedPigeonId,
      notes: body.notes,
    })
    .returning();
  return NextResponse.json(transaction, { status: 201 });
}
