import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";

const VALID_PLANS = ["gratis", "pro", "master"];

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await getUserByToken(token);
  if (!user) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

  const { plan } = await request.json();
  if (!VALID_PLANS.includes(plan)) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  // paid plans get 30 days (payment gateway integration comes later)
  const planExpiresAt = plan === "gratis" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(users)
    .set({ plan, planExpiresAt, updatedAt: new Date() })
    .where(eq(users.id, user.userId));

  return NextResponse.json({ success: true, plan });
}
