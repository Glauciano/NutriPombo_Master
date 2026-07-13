"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { GlobalAlarm } from "@/components/global-alarm";

const PUBLIC_PATHS = ["/vendas", "/login", "/cadastro"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isPublic) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 p-6 overflow-auto">{children}</main>
      </div>
      <GlobalAlarm />
    </>
  );
}
