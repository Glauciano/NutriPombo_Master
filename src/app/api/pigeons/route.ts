import { NextResponse } from "next/server";
import { db } from "@/db";
import { pigeons } from "@/db/schema";
import { eq, like, or, and, sql } from "drizzle-orm";
import { z } from "zod";

const pigeonSchema = z.object({
  ringNumber: z.string().min(1),
  internalCode: z.string().optional(),
  name: z.string().optional(),
  sex: z.enum(["macho", "femea", "desconhecido"]).default("desconhecido"),
  color: z.string().optional(),
  breed: z.string().optional(),
  geneticLine: z.string().optional(),
  originBreeder: z.string().optional(),
  birthDate: z.string().optional(),
  idealWeight: z.string().optional(),
  currentWeight: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum(["ativo", "morto", "vendido", "emprestado", "desaparecido", "aposentado", "doente", "em_tratamento"]).default("ativo"),
  category: z.enum(["reprodutor", "atleta", "filhote", "viuvo", "aposentado"]).default("atleta"),
  fatherId: z.number().optional(),
  motherId: z.number().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const sex = searchParams.get("sex");

  let conditions = [];

  if (search) {
    conditions.push(
      or(
        like(pigeons.ringNumber, `%${search}%`),
        like(pigeons.name, `%${search}%`),
        like(pigeons.internalCode, `%${search}%`)
      )
    );
  }

  if (status) conditions.push(eq(pigeons.status, status as any));
  if (category) conditions.push(eq(pigeons.category, category as any));
  if (sex) conditions.push(eq(pigeons.sex, sex as any));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const allPigeons = await db
    .select()
    .from(pigeons)
    .where(whereClause)
    .orderBy(sql`created_at desc`);

  return NextResponse.json(allPigeons);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = pigeonSchema.parse(body);

    const [pigeon] = await db
      .insert(pigeons)
      .values({
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
      })
      .returning();

    return NextResponse.json(pigeon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
