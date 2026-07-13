import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null });

  const user = await getUserByToken(token);
  return NextResponse.json({ user });
}
