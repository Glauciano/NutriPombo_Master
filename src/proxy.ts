import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/vendas", "/login", "/cadastro"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // public pages pass through
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // check session cookie for all app pages
  const session = request.cookies.get("pm_session");
  if (!session?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/vendas";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // protect all pages; leave APIs, static files and PWA assets alone
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-512.png|pigeonmaster-projeto.zip).*)",
  ],
};
