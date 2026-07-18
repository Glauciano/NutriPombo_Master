import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { PigeonLogo } from "./PigeonLogo";
import { hasSupabase } from "../lib/supabase";
import { useLocal, uid } from "../lib/useLocal";
import type { User } from "../lib/db";
import { NovoPombo } from "./NovoPombo";
import { Alimentacao } from "./Alimentacao";
import { Plantel } from "./Plantel";
import { Alertas } from "./Alertas";
import { Performance } from "./Performance";
import { Viuvez } from "./Viuvez";
import { ConfigPlantel } from "./ConfigPlantel";
import { Pombal } from "./Pombal";
import { Financeiro } from "./Financeiro";
import { Flights } from "./Flights";
import { BackupRestore } from "./BackupRestore";
import { ProtocolosCompeticao } from "./ProtocolosCompeticao";
import { AssistenteIA } from "./AssistenteIA";

type Diff = "Velocidade" | "Meio Fundo" | "Fundo";

type Prova = {
  id: string;
  n: number;
  city: string;
  uf: string;
  km: number;
  diff: Diff;
  sab: string;
  dom: string;
  lat: number;
  lon: number;
  done?: boolean;
};

type Section =
  | "home" | "cal" | "calc" | "map" | "wx" | "centro"
  | "novo-pombo" | "alimentacao" | "plantel" | "alertas"
  | "perf" | "viuvez" | "cfg-plantel" | "pombal" | "financeiro"
  | "flights" | "backup" | "protocolos" | "ia";

type Props = { user: User; onSignOut: () => void; };

const PROVAS_DEFAULT: Prova[] = [
  { id: uid(), n: 1, city: "Crambeíbas", uf: "SP", km: 141, diff: "Velocidade", sab: "02/05/2026", dom: "03/05/2026", lat: -21.34, lon: -47.73, done: true },
  { id: uid(), n: 2, city: "Jardinópolis", uf: "SP", km: 190, diff: "Velocidade", sab: "16/05/2026", dom: "17/05/2026", lat: -21.02, lon: -47.80, done: true },
  { id: uid(), n: 3, city: "São Joaquim da Barra", uf: "SP", km: 251, diff: "Velocidade", sab: "30/05/2026", dom: "31/05/2026", lat: -20.58, lon: -47.86, done: true },
  { id: uid(), n: 4, city: "Igarapava", uf: "SP", km: 280, diff: "Velocidade", sab: "13/06/2026", dom: "14/06/2026", lat: -20.04, lon: -47.75, done: true },
  { id: uid(), n: 5, city: "Uberaba", uf: "MG", km: 350, diff: "Meio Fundo", sab: "27/06/2026", dom: "28/06/2026", lat: -19.75, lon: -47.94, done: true },
  { id: uid(), n: 6, city: "Araguari", uf: "MG", km: 450, diff: "Meio Fundo", sab: "18/07/2026", dom: "19/07/2026", lat: -18.65, lon: -48.19 },
  { id: uid(), n: 7, city: "Catalão", uf: "GO", km: 550, diff: "Meio Fundo", sab: "25/07/2026", dom: "26/07/2026", lat: -18.17, lon: -47.95 },
  { id: uid(), n: 8, city: "Campo Alegre", uf: "GO", km: 650, diff: "Meio Fundo", sab: "01/08/2026", dom: "02/08/2026", lat: -17.64, lon: -47.78 },
  { id: uid(), n: 9, city: "Cristalina", uf: "GO", km: 840, diff: "Fundo", sab: "15/08/2026", dom: "16/08/2026", lat: -16.77, lon: -47.61 },
  { id: uid(), n: 10, city: "Brasília", uf: "DF", km: 990, diff: "Fundo", sab: "29/08/2026", dom: "30/08/2026", lat: -15.79, lon: -47.88 },
];

function daysLeftFor(dom: string, done?: boolean) {
  if (done) return undefined;
  const [d, m, y] = dom.split("/").map(Number);
  if (!d || !m || !y) return undefined;
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((+target - +today) / 86400000));
}

function parseBR(s: string) {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function useProvas() {
  const [list, setList] = useLocal<Prova[]>("pm.provas", PROVAS_DEFAULT);
  const sorted = useMemo(() => [...list].sort((a, b) => +parseBR(a.dom) - +parseBR(b.dom)), [list]);
  return { provas: sorted, setProvas: setList };
}

export function Dashboard({ user, onSignOut }: Props) {
  const [sec, setSec] = useState<Section>("home");
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-night text-mist-100">
      <Ambient />
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-700 bg-ink-900/85 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="flex items-center gap-2.5">
          <PigeonLogo size={30} interactive={false} />
          <div className="leading-tight">
            <div className="font-display text-[15px] font-semibold tracking-tight">
              PigeonMaster <span className="text-gold-300">AI</span>
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-mist-500">
              Campeonato 2026 · build v3.1
            </div>
          </div>
        </div>
        <Clock />
        <div className="flex items-center gap-3">
          <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:inline-flex ${hasSupabase ? "border-ok/40 bg-ok/10 text-ok" : "border-ink-700 bg-ink-850 text-mist-500"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${hasSupabase ? "bg-ok live-dot" : "bg-mist-700"}`} />
            {hasSupabase ? "Supabase" : "Demo"}
          </span>
          <div className="hidden text-right sm:block">
            <div className="text-[12.5px] font-medium text-mist-100">{user.name}</div>
            <div className="text-[11px] text-mist-500">{user.email}</div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-400 font-display text-[12px] font-semibold text-ink-950">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <button onClick={() => setSec("alertas")} className="rounded-md p-2 text-mist-500 hover:bg-ink-800 hover:text-gold-300">🔔</button>
          <button onClick={onSignOut} className="rounded-md p-2 text-mist-500 hover:bg-ink-800 hover:text-mist-100">Sair</button>
        </div>
      </header>

      <div className="sticky top-[57px] z-20 border-b border-ink-700 bg-ink-900/80 backdrop-blur">
        <nav>
          <div className="mx-auto flex max-w-[1040px] gap-1 overflow-x-auto px-3 sm:px-6">
            {([
              { id: "home" as Section, label: "Início", icon: "🏠" },
              { id: "cal" as Section, label: "Calendário", icon: "📅" },
              { id: "calc" as Section, label: "Calculadora", icon: "⚡" },
              { id: "map" as Section, label: "Mapa", icon: "🗺️" },
              { id: "wx" as Section, label: "Clima", icon: "🌤️" },
              { id: "centro" as Section, label: "Integrado", icon: "📊" },
            ]).map((n) => (
              <button
                key={n.id}
                onClick={() => setSec(n.id)}
                className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3 text-[13.5px] transition ${
                  sec === n.id ? "text-mist-100" : "text-mist-500 hover:text-mist-300"
                }`}
              >
                <span className="text-[15px]">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="border-t border-ink-700/60 bg-ink-900/95">
          <div className="mx-auto flex max-w-[1040px] gap-1 overflow-x-auto px-3 py-2 sm:px-6">
            {([
              { id: "novo-pombo" as Section, label: "Novo Pombo", icon: "🐦" },
              { id: "alimentacao" as Section, label: "Alimentação", icon: "🌾" },
              { id: "plantel" as Section, label: "Plantel", icon: "📊" },
              { id: "perf" as Section, label: "Performance", icon: "⚡" },
              { id: "viuvez" as Section, label: "Viuvez", icon: "❤️" },
              { id: "pombal" as Section, label: "Guia Terapêutico", icon: "🩺" },
              { id: "financeiro" as Section, label: "Financeiro", icon: "💰" },
              { id: "flights" as Section, label: "Histórico", icon: "📜" },
              { id: "protocolos" as Section, label: "Protocolos", icon: "🏆" },
              { id: "backup" as Section, label: "Backup", icon: "💾" },
              { id: "ia" as Section, label: "Assistente IA", icon: "🤖" },
              { id: "cfg-plantel" as Section, label: "Configuração", icon: "⚙️" },
            ]).map((n) => (
              <button
                key={n.id}
                onClick={() => setSec(n.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-[12.5px] transition ${
                  sec === n.id
                    ? "bg-gold-400 font-semibold text-ink-950"
                    : "bg-ink-850 text-mist-300 hover:text-mist-100"
                }`}
              >
                <span className="mr-1">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="relative mx-auto max-w-[1040px] px-4 py-6 sm:px-6 sm:py-8">
        {sec === "home" && <Home go={setSec} />}
        {sec === "cal" && <CalendarioScreen onBack={() => setSec("home")} />}
        {sec === "calc" && <CalculadoraScreen onBack={() => setSec("home")} />}
        {sec === "map" && <MapaScreen onBack={() => setSec("home")} />}
        {sec === "wx" && <ClimaScreen onBack={() => setSec("home")} />}
        {sec === "centro" && <CentroIntegrado onBack={() => setSec("home")} />}
        {sec === "novo-pombo" && <NovoPombo user={user} onBack={() => setSec("home")} />}
        {sec === "alimentacao" && <Alimentacao onBack={() => setSec("home")} />}
        {sec === "plantel" && <Plantel onBack={() => setSec("home")} />}
        {sec === "alertas" && <Alertas onBack={() => setSec("home")} />}
        {sec === "perf" && <Performance onBack={() => setSec("home")} />}
        {sec === "viuvez" && <Viuvez onBack={() => setSec("home")} />}
        {sec === "cfg-plantel" && <ConfigPlantel onBack={() => setSec("home")} />}
        {sec === "pombal" && <Pombal onBack={() => setSec("home")} />}
        {sec === "financeiro" && <Financeiro onBack={() => setSec("home")} />}
        {sec === "flights" && <Flights onBack={() => setSec("home")} />}
        {sec === "backup" && <BackupRestore onBack={() => setSec("home")} />}
        {sec === "protocolos" && <ProtocolosCompeticao onBack={() => setSec("home")} />}
        {sec === "ia" && <AssistenteIA onBack={() => setSec("home")} />}
      </main>
    </div>
  );
}

function Card({ children, className = "", glow, style }: { children: ReactNode; className?: string; glow?: boolean; style?: CSSProperties }) {
  return <div className={`rounded-xl border border-ink-700 bg-ink-850 transition ${glow ? "shadow-[0_0_0_1px_rgba(245,181,10,0.35),0_30px_80px_-40px_rgba(245,181,10,0.4)]" : ""} ${className}`} style={style}>{children}</div>;
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700"><div className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300 transition-all duration-700" style={{ width: `${pct}%` }} /></div>;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(id); }, []);
  return <div className="hidden rounded-md border border-ink-700 bg-ink-850 px-2 py-1 font-mono text-[10.5px] text-mist-500 sm:block">🕐 {now.toLocaleTimeString("pt-BR")}</div>;
}

function Ambient() {
  return (<>
    <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
    <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-gold-400/5 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -left-20 h-96 w-96 rounded-full bg-info/5 blur-3xl" />
  </>);
}

function Home({ go }: { go: (s: Section) => void }) {
  const { provas } = useProvas();
  const next = provas.find((p) => !p.done) ?? provas[0];
  const done = provas.filter((p) => p.done).length;
  const nextDays = next ? daysLeftFor(next.dom, next.done) || 0 : 0;
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[26px] font-bold tracking-tight sm:text-[30px]">⚙️ Centro de Provas</h1>
        <div className="text-[12.5px] text-mist-500">Calendário · Mapa · Clima integrado</div>
      </div>
      <Card glow className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300">⚡ Próxima prova</div>
            <h2 className="mt-1 font-display text-[28px] font-bold leading-tight tracking-tight sm:text-[34px]">#{next.n} {next.city} — {next.uf}</h2>
            <div className="mt-1 text-[13px] text-mist-500">↑ {next.diff} · {next.km} km · Domingo {next.dom}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-[48px] font-bold leading-none text-info">{nextDays}</div>
            <div className="text-[11px] uppercase tracking-wider text-mist-500">dias</div>
          </div>
        </div>
        <button onClick={() => go("cal")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-3 text-[14px] font-semibold text-ink-950 hover:bg-gold-300">📋 Ver Protocolo Completo →</button>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><div className="text-[12px] text-mist-500">🏁 Provas 2026</div><div className="font-display text-[38px] font-bold text-gold-300">{provas.length}</div><div className="text-[12px] text-mist-500">{done} realizadas</div></Card>
        <Card className="p-5"><div className="text-[12px] text-mist-500">✅ Realizadas</div><div className="font-display text-[38px] font-bold text-ok">{done}</div><div className="text-[12px] text-mist-500">{provas.length - done} agendadas</div></Card>
      </div>
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between"><div className="text-[13px] text-mist-300">🏆 Temporada 2026</div><div className="font-display text-[15px] font-bold text-gold-300">{done}/{provas.length}</div></div>
        <ProgressBar value={done} max={provas.length} />
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <button onClick={() => go("novo-pombo")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">🐦 Novo pombo</button>
        <button onClick={() => go("alimentacao")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">🌾 Alimentação</button>
        <button onClick={() => go("plantel")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">📊 Plantel</button>
        <button onClick={() => go("perf")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">⚡ Performance</button>
        <button onClick={() => go("viuvez")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">❤️ Viuvez</button>
        <button onClick={() => go("pombal")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">🩺 Guia Terapêutico</button>
        <button onClick={() => go("financeiro")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">💰 Financeiro</button>
        <button onClick={() => go("flights")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">📜 Histórico</button>
        <button onClick={() => go("protocolos")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">🏆 Protocolos</button>
        <button onClick={() => go("backup")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">💾 Backup</button>
        <button onClick={() => go("ia")} className="rounded-xl border border-gold-400/50 bg-gold-400/10 px-4 py-3 text-[14px] font-semibold text-gold-300 hover:bg-gold-400/20">🤖 Assistente IA</button>
      </div>
    </div>
  );
}

function Placeholder({ title, onBack }: { title: string; onBack: () => void }) {
  return <Card className="p-5"><button onClick={onBack} className="mb-4 rounded-md border border-ink-700 bg-ink-850 px-3 py-1.5 text-[12px] text-mist-300">← Voltar</button><div className="text-[14px] text-mist-300">{title} carregado.</div></Card>;
}

function CalendarioScreen({ onBack }: { onBack: () => void }) {
  const { provas } = useProvas();
  const feitas = provas.filter((p) => p.done).length;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-[12px] text-mist-300 hover:bg-ink-800 hover:text-mist-100">← Voltar</button>
        <h2 className="font-display text-[22px] font-bold tracking-tight">📅 Calendário <span className="text-gold-300">2026</span></h2>
      </div>
      <Card glow className="p-6">
        <div className="mb-5">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] text-mist-500">Progresso de Integração</h3>
          <div className="mt-2 h-2.5 w-full rounded-full bg-ink-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-amber-400" style={{ width: `${(feitas/provas.length)*100}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-mist-500 font-medium">{feitas}/{provas.length}</div>
        </div>
        <div className="space-y-2">
          {provas.map((p) => {
            const dias = daysLeftFor(p.dom, p.done);
            return (
              <div key={p.id} className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition ${p.done ? "border-ok/30 bg-ok/5" : "border-ink-700 bg-ink-850 hover:border-gold-400/30"}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${p.done ? "bg-ok text-ink-950" : "bg-ink-900 text-gold-300"}`}>{p.done ? "✓" : p.n}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-[14px] font-bold text-mist-100 truncate">{p.city} — {p.uf}</h4>
                    {p.done && <span className="rounded-full bg-ok/20 px-1.5 py-0.5 text-[9px] font-extrabold text-ok">CONCLUÍDA</span>}
                  </div>
                  <div className="text-[11px] text-mist-500">
                    {p.diff} · Distância {p.km} km · Sábado {p.sab} · Domingo {p.dom}
                    {dias !== undefined && !p.done && <span className="ml-2 text-gold-300">· {dias} d</span>}
                  </div>
                </div>
                <div className="text-right">
                  {p.done ? <span className="text-[11px] text-ok font-semibold">Concluída</span> : dias !== undefined ? <span className="text-[13px] font-extrabold text-info">{dias} d</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function CalculadoraScreen({ onBack }: { onBack: () => void }) {
  type Tab = "vel" | "tempo" | "dist";
  const [tab, setTab] = useState<Tab>("vel");
  const [dist, setDist] = useState("300");
  const [vel, setVel] = useState("72");
  const [h, setH] = useState("4");
  const [m, setM] = useState("10");

  const minutos = (parseFloat(h || "0") || 0) * 60 + (parseFloat(m || "0") || 0) || 1;

  const calc = (() => {
    const d = parseFloat(dist) || 0;
    const v = parseFloat(vel) || 0;
    if (tab === "vel") return (d / (minutos / 60)).toFixed(2).replace(".", ",") + " km/h";
    if (tab === "tempo") {
      const th = d / v;
      return Math.floor(th) + "h " + Math.round((th - Math.floor(th)) * 60).toString().padStart(2, "0") + "min";
    }
    return ((v / 60) * minutos).toFixed(1).replace(".", ",") + " km";
  })();

  const labelRes = tab === "vel" ? "Velocidade média calculada" : tab === "tempo" ? "Tempo estimado de viagem" : "Distância percorrida";
  const subRes = tab === "vel" ? `Distância ${dist}km em ${h}h ${m}min` : "";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-[12px] text-mist-300 hover:bg-ink-800 hover:text-mist-100">← Voltar</button>
        <h2 className="font-display text-[22px] font-bold tracking-tight">⚡ Calculadora <span className="text-gold-300">Premium</span></h2>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {([
          { id: "vel" as Tab, label: "Calcular Velocidade" },
          { id: "tempo" as Tab, label: "Calcular Tempo" },
          { id: "dist" as Tab, label: "Calcular Distância" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-xl border px-5 py-3 text-[12px] font-extrabold tracking-wide transition ${
              tab === t.id
                ? "bg-gradient-to-r from-gold-400 to-amber-400 text-ink-950 border-gold-400 shadow-[0_0_20px_rgba(245,181,10,0.3)]"
                : "bg-ink-850 text-mist-400 border-ink-700 hover:text-mist-100 hover:border-ink-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card glow className="p-6">
        <h3 className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-500">DISTÂNCIA PERCORRIDA — VELOCIDADE · TEMPO</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">DISTÂNCIA (km)</label>
            <input
              type="number"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-5 py-4 text-[28px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">VELOCIDADE (km/h)</label>
            <input
              type="number"
              value={vel}
              onChange={(e) => setVel(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-5 py-4 text-[28px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">HORAS</label>
            <input
              type="number"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">MINUTOS</label>
            <input
              type="number"
              value={m}
              onChange={(e) => setM(e.target.value)}
              className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none"
            />
          </div>
        </div>

        <button
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-gold-400 to-amber-500 py-4 text-[15px] font-extrabold text-ink-950 shadow-[0_4px_25px_rgba(245,181,10,0.35)] hover:brightness-110 transition"
        >
          ⚡ CALCULAR {tab === "vel" ? "VELOCIDADE" : tab === "tempo" ? "TEMPO" : "DISTÂNCIA"}
        </button>

        <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#1a1033] via-[#0f172a] to-[#0a0f1a] border border-purple-500/20 p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.15)]">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple-300">{labelRes}</div>
          <div className="mt-2 font-display text-[60px] sm:text-[72px] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-fuchsia-300 to-blue-300 drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]">
            {calc}
          </div>
          <div className="mt-2 text-[14px] font-medium text-purple-200/70">{subRes}</div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-mist-400">📊 Tabela de Referência de Velocidades</h3>
        <div className="space-y-2">
          {[
            { cat: "Velocidade", faixa: "140 - 280 km", desc: "Sprint" },
            { cat: "Meio Fundo", faixa: "350 - 650 km", desc: "Resistência média" },
            { cat: "Fundo", faixa: "840 - 990 km", desc: "Longa distância" },
            { cat: "Elite", faixa: "+1000 km", desc: "Maratona aérea" },
          ].map((item) => (
            <div key={item.cat} className="flex items-center justify-between rounded-xl bg-ink-900 px-4 py-3 border border-ink-700/50 hover:border-gold-400/20 transition">
              <div>
                <div className="text-[13px] font-bold text-mist-100">{item.cat}</div>
                <div className="text-[11px] text-mist-500">{item.desc}</div>
              </div>
              <span className="text-[13px] font-extrabold text-gold-300">{item.faixa}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-mist-400">🔄 Conversor Rápido km/h ↔ m/min</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-mist-500">KM/H</label>
            <input type="number" defaultValue={72} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-mist-500">M/MIN</label>
            <input type="number" defaultValue={1200} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 p-4 text-center">
          <div className="text-[11px] text-blue-200/60">Conversão instantânea</div>
          <div className="mt-1 text-[16px] font-extrabold text-blue-100">1 km/h ≈ 16,67 m/min</div>
        </div>
      </Card>
    </div>
  );
}

function MapaScreen({ onBack }: { onBack: () => void }) {
  const { provas } = useProvas();
  const cores = ["#f59e0b","#a855f7","#10b981","#38bdf8","#f97316","#ec4899","#8b5cf6","#14b8a6","#6366f1","#ef4444"];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-[12px] text-mist-300 hover:bg-ink-800 hover:text-mist-100">← Voltar</button>
        <h2 className="font-display text-[22px] font-bold tracking-tight">🗺️ Mapa <span className="text-gold-300">de Soltura</span></h2>
      </div>
      <Card glow className="relative overflow-hidden bg-gradient-to-b from-[#0d1117] via-[#0f172a] to-[#0a0f1a] p-6">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10">
          <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-500">Trajeto das Provas · SP → MG → GO → DF</h3>
        </div>
        <div className="relative mx-auto mt-8 max-w-sm">
          <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gold-400 via-purple-400 to-emerald-500" />
          {provas.map((p, i) => (
            <div key={p.id} className="relative mb-8 flex items-start gap-4 last:mb-0">
              <div className="relative z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] shadow-[0_0_15px_rgba(245,181,10,0.3)]" style={{ borderColor: cores[i % cores.length], backgroundColor: cores[i % cores.length] }}>
                <span className="text-[12px] font-extrabold text-ink-950">{p.n}</span>
                {p.done && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0a0f1a] bg-ok" />}
              </div>
              <div className="flex-1 rounded-xl border border-ink-700/40 bg-ink-850/70 p-3 backdrop-blur-sm">
                <h4 className="font-display text-[15px] font-bold text-mist-100 leading-tight">{p.city}<span className="text-[12px] font-normal text-mist-500"> — {p.uf}</span></h4>
                <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-mist-400">
                  <span className="rounded bg-ink-900 px-1.5 py-0.5 text-[10px] text-gold-300 font-extrabold">{p.diff}</span>
                  <span>{p.km} km</span>
                  <span>·</span>
                  <span>Sáb {p.sab}</span>
                  <span>·</span>
                  <span>Dom {p.dom}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-mist-400">📋 Detalhes das Solturas</h3>
          <div className="space-y-2">
            {provas.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-ink-900 px-3 py-2.5 border border-ink-700/40">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-ink-950" style={{ backgroundColor: cores[i % cores.length] }}>{p.n}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-mist-100 truncate">{p.city}, {p.uf}</div>
                  <div className="text-[11px] text-mist-500">{p.diff} · {p.km} km · {p.sab} → {p.dom}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-mist-400">📊 Resumo</h3>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-mist-300"><span>Provas</span><span className="font-extrabold text-gold-300">{provas.length}</span></div>
            <div className="flex justify-between text-mist-300"><span>Realizadas</span><span className="font-extrabold text-ok">{provas.filter(p=>p.done).length}</span></div>
            <div className="flex justify-between text-mist-300"><span>Distância Total</span><span className="font-extrabold text-blue-300">{provas.reduce((a,p)=>a+p.km,0)} km</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ClimaScreen({ onBack }: { onBack: () => void }) {
  const cidade = "São Paulo";
  const hoje = { temp: 18, sensacao: 19, condicao: "Céu limpo", umidade: 71, ventoDir: "NE", ventoInt: 16, icone: "☀️", max: 22, min: 16 };
  const proximos = [
    { dia: "Seg", temp: 21, min: 15, icone: "⛅", ventoDir: "NE", ventoInt: 14 },
    { dia: "Ter", temp: 20, min: 14, icone: "☀️", ventoDir: "N", ventoInt: 18 },
    { dia: "Qua", temp: 19, min: 13, icone: "☁️", ventoDir: "NO", ventoInt: 22 },
    { dia: "Qui", temp: 18, min: 12, icone: "☁️", ventoDir: "O", ventoInt: 15 },
    { dia: "Sex", temp: 17, min: 11, icone: "☀️", ventoDir: "SO", ventoInt: 12 },
    { dia: "Sáb", temp: 16, min: 10, icone: "⛅", ventoDir: "S", ventoInt: 20 },
    { dia: "Dom", temp: 15, min: 9, icone: "☁️", ventoDir: "SE", ventoInt: 8 },
  ];
  const rot = (dir: string) => ({ N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, NO: 315, O: 270, SO: 225 }[dir] ?? 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-[12px] text-mist-300 hover:bg-ink-800 hover:text-mist-100">← Voltar</button>
        <h2 className="font-display text-[22px] font-bold tracking-tight">☀️ Previsão do Tempo <span className="text-gold-300">· {cidade}</span></h2>
      </div>
      <Card glow className="relative overflow-hidden bg-gradient-to-br from-amber-600/20 via-ink-900 to-ink-950 p-6 sm:p-8 border-amber-400/20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px]" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[13px] font-medium text-amber-200/80">Hoje</h3>
              <p className="mt-1 text-[15px] text-amber-100/90">{hoje.condicao}</p>
            </div>
            <span className="text-[72px] leading-none drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">{hoje.icone}</span>
          </div>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-display text-[90px] font-extralight leading-none text-white tracking-tighter">{hoje.temp}°</span>
            <div className="flex flex-col">
              <span className="text-[15px] text-amber-200 font-semibold">Sensação {hoje.sensacao}°</span>
              <span className="text-[13px] text-amber-200/60">Umidade {hoje.umidade}%</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-8 text-[13px]">
            <span className="text-amber-100/80">Máx {hoje.max}°</span>
            <span className="text-amber-100/50">Mín {hoje.min}°</span>
          </div>
          <div className="mt-8 rounded-2xl bg-ink-850/60 border border-ink-700/50 p-5">
            <h4 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Vento</h4>
            <div className="mt-3 flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-400/30 bg-amber-900/20 text-[24px] text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.2)]" style={{ transform: `rotate(${rot(hoje.ventoDir)}deg)` }}>↑</div>
                <span className="mt-2 text-[11px] font-bold text-mist-300">Direção</span>
                <span className="text-[14px] font-extrabold text-amber-200">{hoje.ventoDir}</span>
              </div>
              <div className="h-10 w-px bg-ink-700" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-mist-400">Velocidade</span>
                <span className="text-[28px] font-extrabold text-amber-200 leading-none">{hoje.ventoInt}<span className="text-[14px] text-amber-200/60"> km/h</span></span>
                <span className="text-[11px] text-mist-500 mt-1">Brisa leve</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <div>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-mist-400">📅 Próximos 7 dias</h3>
        <div className="grid gap-2">
          {proximos.map((d, i) => (
            <Card key={i} className="group p-4 hover:border-amber-400/20 hover:bg-ink-850/60 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="w-10 text-[12px] font-extrabold text-mist-400">{d.dia}</span>
                  <span className="text-[22px]">{d.icone}</span>
                  <span className="text-[15px] font-bold text-mist-100">{d.temp}°</span>
                  <span className="text-[11px] text-mist-500">Mín {d.min}°</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-amber-300 font-bold">{d.ventoDir}</span>
                  <span className="text-[11px] text-mist-500">{d.ventoInt} km/h</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function CentroIntegrado({ onBack }: { onBack: () => void }) {
  const { provas } = useProvas();
  const feitas = provas.filter((p) => p.done).length;
  const cores = ["#f59e0b","#a855f7","#10b981","#38bdf8","#f97316","#ec4899","#8b5cf6","#14b8a6","#6366f1","#ef4444"];

  const [dist, setDist] = useState("300");
  const [vel, setVel] = useState("72");
  const [h, setH] = useState("4");
  const [m, setM] = useState("10");

  const minutos = (parseFloat(h || "0") || 0) * 60 + (parseFloat(m || "0") || 0) || 1;

  const calc = (() => {
    const d = parseFloat(dist) || 0;
    const v = parseFloat(vel) || 0;
    if (dist && vel) return (d / (minutos / 60)).toFixed(2).replace(".", ",") + " km/h";
    return "—";
  })();

  const cidade = "São Paulo";
  const hoje = { temp: 18, sensacao: 19, condicao: "Céu limpo", umidade: 71, ventoDir: "NE", ventoInt: 16, icone: "☀️", max: 22, min: 16 };
  const rot = (dir: string) => ({ N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315, NO: 315, O: 270, SO: 225 }[dir] ?? 0);

  const proximos = [
    { dia: "Seg", temp: 21, min: 15, icone: "⛅", ventoDir: "NE", ventoInt: 14 },
    { dia: "Ter", temp: 20, min: 14, icone: "☀️", ventoDir: "N", ventoInt: 18 },
    { dia: "Qua", temp: 19, min: 13, icone: "☁️", ventoDir: "NO", ventoInt: 22 },
    { dia: "Qui", temp: 18, min: 12, icone: "☁️", ventoDir: "O", ventoInt: 15 },
    { dia: "Sex", temp: 17, min: 11, icone: "☀️", ventoDir: "SO", ventoInt: 12 },
    { dia: "Sáb", temp: 16, min: 10, icone: "⛅", ventoDir: "S", ventoInt: 20 },
    { dia: "Dom", temp: 15, min: 9, icone: "☁️", ventoDir: "SE", ventoInt: 8 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="rounded-lg border border-ink-700 bg-ink-850 px-3.5 py-2 text-[12px] text-mist-300 hover:bg-ink-800 hover:text-mist-100">← Voltar</button>
        <h2 className="font-display text-[24px] font-bold tracking-tight">📊 Centro Integrado <span className="text-gold-300 text-[14px] font-normal">Calendário · Mapa · Clima · Calculadora</span></h2>
      </div>

      {/* CALENDÁRIO */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.15em] text-mist-400">📅 Calendário <span className="text-[10px] font-normal text-mist-600">2026</span></h3>
        <Card glow className="p-6">
          <div className="mb-5">
            <div className="flex justify-between text-[12px] text-mist-500">
              <span>Progresso de Integração</span>
              <span className="font-bold text-gold-300">{feitas}/{provas.length}</span>
            </div>
            <div className="mt-2 h-2.5 w-full rounded-full bg-ink-700 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-amber-400" style={{ width: `${(feitas/provas.length)*100}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {provas.map((p) => {
              const dias = daysLeftFor(p.dom, p.done);
              return (
                <div key={p.id} className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 transition ${p.done ? "border-ok/30 bg-ok/5" : "border-ink-700 bg-ink-850 hover:border-gold-400/30"}`}>
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${p.done ? "bg-ok text-ink-950" : "bg-ink-900 text-gold-300"}`}>{p.done ? "✓" : p.n}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-[14px] font-bold text-mist-100 truncate">{p.city} — {p.uf}</h4>
                      {p.done && <span className="rounded-full bg-ok/20 px-1.5 py-0.5 text-[9px] font-extrabold text-ok">CONCLUÍDA</span>}
                    </div>
                    <div className="text-[11px] text-mist-500">
                      {p.diff} · Distância {p.km} km · Sábado {p.sab} · Domingo {p.dom}
                      {dias !== undefined && !p.done && <span className="ml-2 text-gold-300">· {dias} d</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    {p.done ? <span className="text-[11px] text-ok font-semibold">Concluída</span> : dias !== undefined ? <span className="text-[13px] font-extrabold text-info">{dias} d</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      {/* MAPA + CLIMA */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.15em] text-mist-400">🗺️ Mapa <span className="text-[10px] font-normal text-mist-600">de Soltura</span></h3>
          <Card glow className="relative overflow-hidden bg-gradient-to-b from-[#0d1117] via-[#0f172a] to-[#0a0f1a] p-6">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(circle at 2px 2px,#fff 1px,transparent 0)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10">
              <h4 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-500">Trajeto das Provas · SP → MG → GO → DF</h4>
            </div>
            <div className="relative mx-auto mt-6 max-w-sm">
              <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gold-400 via-purple-400 to-emerald-500" />
              {provas.map((p, i) => (
                <div key={p.id} className="relative mb-6 flex items-start gap-4 last:mb-0">
                  <div className="relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px]" style={{ borderColor: cores[i % cores.length], backgroundColor: cores[i % cores.length] }}>
                    <span className="text-[11px] font-extrabold text-ink-950">{p.n}</span>
                    {p.done && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#0a0f1a] bg-ok" />}
                  </div>
                  <div className="flex-1 rounded-xl border border-ink-700/40 bg-ink-850/60 p-3">
                    <h5 className="font-display text-[14px] font-bold text-mist-100">{p.city}<span className="text-[11px] font-normal text-mist-500"> — {p.uf}</span></h5>
                    <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-mist-400">
                      <span className="rounded bg-ink-900 px-1 py-0.5 text-[9px] text-gold-300 font-extrabold">{p.diff}</span>
                      <span>{p.km} km</span>
                      <span>· {p.sab}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.15em] text-mist-400">☀️ Clima <span className="text-[10px] font-normal text-mist-600">São Paulo</span></h3>
          <Card glow className="relative overflow-hidden bg-gradient-to-br from-amber-600/20 via-ink-900 to-ink-950 p-6 border-amber-400/20">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-400/10 blur-[80px]" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[13px] font-medium text-amber-200/80">Hoje</h3>
                  <p className="mt-1 text-[15px] text-amber-100/90">Céu limpo</p>
                </div>
                <span className="text-[72px] leading-none drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">☀️</span>
              </div>
              <div className="mt-6 flex items-baseline gap-4">
                <span className="font-display text-[90px] font-extralight leading-none text-white tracking-tighter">18°</span>
                <div className="flex flex-col">
                  <span className="text-[15px] text-amber-200 font-semibold">Sensação 19°</span>
                  <span className="text-[13px] text-amber-200/60">Umidade 71%</span>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-8 text-[13px]">
                <span className="text-amber-100/80">Máx 22°</span>
                <span className="text-amber-100/50">Mín 16°</span>
              </div>
              <div className="mt-8 rounded-2xl bg-ink-850/60 border border-ink-700/50 p-4">
                <h4 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-amber-300">Vento</h4>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-[24px]">↑</span>
                  <div>
                    <span className="text-[13px] font-extrabold text-amber-200">NE</span>
                    <span className="text-[11px] text-amber-200/60"> · 16 km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>

      {/* CALCULADORA */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.15em] text-mist-400">⚡ Calculadora <span className="text-[10px] font-normal text-mist-600">Premium</span></h3>
        <Card glow className="p-6">
          <div className="flex gap-2 mb-4 overflow-x-auto">
            {[
              { id: "vel", label: "Calcular Velocidade" },
              { id: "tempo", label: "Calcular Tempo" },
              { id: "dist", label: "Calcular Distância" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {}}
                className="shrink-0 rounded-xl border border-gold-400/60 bg-gradient-to-r from-gold-400 to-amber-500 px-5 py-2.5 text-[12px] font-extrabold text-ink-950 shadow-[0_0_20px_rgba(245,181,10,0.25)]"
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">DISTÂNCIA (km)</label>
              <input type="number" value={dist} onChange={e => setDist(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-5 py-4 text-[28px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">VELOCIDADE (km/h)</label>
              <input type="number" value={vel} onChange={e => setVel(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-5 py-4 text-[28px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">HORAS</label>
              <input type="number" value={h} onChange={e => setH(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-mist-400">MINUTOS</label>
              <input type="number" value={m} onChange={e => setM(e.target.value)} className="mt-2 w-full rounded-2xl border-2 border-ink-700 bg-ink-900 px-4 py-3 text-[22px] font-extrabold text-mist-100 focus:border-gold-400 focus:outline-none" />
            </div>
          </div>
          <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-gold-400 to-amber-500 py-4 text-[15px] font-extrabold text-ink-950 shadow-[0_4px_25px_rgba(245,181,10,0.35)] hover:brightness-110">
            ⚡ CALCULAR VELOCIDADE
          </button>
          <div className="mt-6 rounded-3xl bg-gradient-to-br from-[#1a1033] via-[#0f172a] to-[#0a0f1a] border border-purple-500/20 p-8 text-center shadow-[0_0_50px_rgba(168,85,247,0.15)]">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-purple-300">Velocidade média calculada</div>
            <div className="mt-2 font-display text-[60px] sm:text-[72px] font-extrabold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-200 via-fuchsia-300 to-blue-300 drop-shadow-[0_0_30px_rgba(147,51,234,0.4)]">{calc}</div>
            <div className="mt-2 text-[14px] font-medium text-purple-200/70">Distância {dist}km em {h}h {m}min</div>
          </div>
        </Card>
      </section>

      {/* 7 DIAS DO CLIMA */}
      <section>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-mist-400">📅 Previsão — Próximos 7 dias</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {proximos.map((d, i) => (
            <Card key={i} className="group p-4 hover:border-amber-400/20 hover:bg-ink-850/80 transition">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-mist-200">{d.dia}</span>
                <span className="text-[24px]">{d.icone}</span>
              </div>
              <div className="mt-2 text-[30px] font-extrabold leading-none text-mist-100">{d.temp}°</div>
              <div className="mt-1 text-[11px] text-mist-500">Mín {d.min}°</div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-900/60 px-2.5 py-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px]" style={{ transform: `rotate(${rot(d.ventoDir)}deg)` }}>↑</span>
                  <span className="text-[11px] font-extrabold text-amber-200">{d.ventoDir}</span>
                </div>
                <span className="text-[11px] font-medium text-mist-400">{d.ventoInt} km/h</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
