import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    await db.execute(
      sql`TRUNCATE TABLE results, competitions, trainings, feedings, mixtures, foods, vaccinations, health_records, chicks, eggs, breeding_pairs, widowhood_pairs, transactions, inventory, ai_recommendations, settings, pigeons RESTART IDENTITY CASCADE`
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "reset_failed", message: String(err) }, { status: 500 });
  }
}
