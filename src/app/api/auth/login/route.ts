import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    }

    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    const user = rows[0];

    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const token = await createSession(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, role: user.role },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao entrar. Tente novamente." }, { status: 500 });
  }
}
