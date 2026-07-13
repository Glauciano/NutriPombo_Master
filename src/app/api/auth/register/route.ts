import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha precisa ter no mínimo 6 caracteres." }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado. Faça login." }, { status: 409 });
    }

    const [user] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashPassword(password),
        role: "user",
        plan: "gratis",
      })
      .returning();

    const token = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar conta. Tente novamente." }, { status: 500 });
  }
}
