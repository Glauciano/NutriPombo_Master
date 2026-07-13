"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bird,
  Heart,
  Dna,
  Utensils,
  Dumbbell,
  Trophy,
  DollarSign,
  Package,
  Brain,
  Settings,
  ChevronRight,
  Bell,
  Save,
  Medal,
  Scale,
  LogOut,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pombos", label: "Pombos", icon: Bird },
  { href: "/genealogia", label: "Genealogia", icon: Dna },
  { href: "/peso", label: "Controle de Peso", icon: Scale },
  { href: "/reproducao", label: "Reprodução", icon: Dna },
  { href: "/saude", label: "Saúde", icon: Heart },
  { href: "/nutricao", label: "Alimentação", icon: Utensils },
  { href: "/treinamentos", label: "Treinamentos", icon: Dumbbell },
  { href: "/provas", label: "Centro de Provas", icon: Trophy },
  { href: "/ranking", label: "Ranking", icon: Medal },
  { href: "/alertas", label: "Central de Alertas", icon: Bell },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/estoque", label: "Estoque", icon: Package },
  { href: "/ia", label: "IA PigeonMaster", icon: Brain },
  { href: "/backup", label: "Backup", icon: Save },
];

interface Customization {
  loftName: string;
  slogan: string;
  accentColor: string;
  hiddenModules: string[];
}

const DEFAULT_CUSTOM: Customization = {
  loftName: "PigeonMaster",
  slogan: "AI Columbofilia",
  accentColor: "#10b981",
  hiddenModules: [],
};

export function Sidebar() {
  const pathname = usePathname();
  const [custom, setCustom] = useState<Customization>(DEFAULT_CUSTOM);

  useEffect(() => {
    /* instant load from cache, then refresh from server */
    try {
      const cached = localStorage.getItem("pm_customization");
      if (cached) setCustom({ ...DEFAULT_CUSTOM, ...JSON.parse(cached) });
    } catch { /* ignore */ }

    fetch("/api/settings?key=customization")
      .then((r) => r.json())
      .then((d) => {
        if (d.value) {
          const merged = { ...DEFAULT_CUSTOM, ...d.value };
          setCustom(merged);
          try { localStorage.setItem("pm_customization", JSON.stringify(merged)); } catch { /* ignore */ }
        }
      })
      .catch(() => { /* ignore */ });
  }, []);

  const visibleItems = navItems.filter((item) => !custom.hiddenModules.includes(item.href));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col z-50">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: custom.accentColor }}
          >
            <Bird className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-lg leading-tight truncate">{custom.loftName || "PigeonMaster"}</h1>
            <p className="text-xs text-slate-400 truncate">{custom.slogan || "AI Columbofilia"}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
              style={isActive ? { backgroundColor: custom.accentColor } : undefined}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}

        {/* Personalização sempre visível */}
        <Link
          href="/configuracoes"
          className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
            pathname === "/configuracoes"
              ? "text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
          style={pathname === "/configuracoes" ? { backgroundColor: custom.accentColor } : undefined}
        >
          <Settings className="w-5 h-5" />
          <span className="flex-1">Personalização</span>
          {pathname === "/configuracoes" && <ChevronRight className="w-4 h-4" />}
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <UserFooter />
      </div>
    </aside>
  );
}

function UserFooter() {
  const [user, setUser] = useState<{ name: string; plan: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => { /* ignore */ });
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/vendas";
  }

  const planLabels: Record<string, string> = { gratis: "Grátis", pro: "Pro 🏆", master: "Master 👑" };

  return (
    <div className="space-y-2">
      {user && (
        <div className="px-4 py-2">
          <p className="text-sm font-bold text-white truncate">{user.name}</p>
          <p className="text-xs text-emerald-400">Plano {planLabels[user.plan] || user.plan}</p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span>Sair</span>
      </button>
    </div>
  );
}
