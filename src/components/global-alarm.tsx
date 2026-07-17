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

type Section = "home" | "cal" | "calc" | "map" | "wx" | "novo-pombo" | "alimentacao" | "plantel" | "alertas" | "perf" | "viuvez" | "cfg-plantel" | "pombal" | "financeiro" | "flights" | "backup" | "protocolos" | "ia";

type Props = { user: User; onSignOut: () => void };

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

function daysLeftFor(dom: string, done?: boolean): number | undefined {
  if (done) return undefined;
  const [d, m, y] = dom.split("/").map(Number);
  if (!d || !m || !y) return undefined;
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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
              GESTÃO DE COLUMBOFILIA · V3.1
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
          <button onClick={() => setSec("alertas")} className="rounded-md p-2 text-mist-500 transition hover:bg-ink-800 hover:text-gold-300">🔔</button>
          <button onClick={onSignOut} className="rounded-md p-2 text-mist-500 transition hover:bg-ink-800 hover:text-mist-100">Sair</button>
        </div>
      </header>

      <div className="sticky top-[57px] z-20 border-b border-ink-700 bg-ink-900/80 backdrop-blur">
        <nav className="mx-auto flex max-w-[1040px] gap-1 overflow-x-auto px-3 sm:px-6">
          {[
            { id: "home" as Section, label: "Início", icon: "🏠" },
            { id: "cal" as Section, label: "Calendário", icon: "📅" },
            { id: "calc" as Section, label: "Calculadora", icon: "⚡" },
            { id: "map" as Section, label: "Mapa", icon: "🗺️" },
            { id: "wx" as Section, label: "Clima", icon: "🌤️" },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setSec(n.id)}
              className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-[13.5px] transition ${sec === n.id ? "text-mist-100 border-b-2 border-gold-400" : "text-mist-500 hover:text-mist-300"}`}
            >
              <span className="text-[15px]">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      <main className="relative mx-auto max-w-[1040px] px-4 py-6 sm:px-6 sm:py-8">
        {sec === "home" && <Home go={setSec} />}
        {sec === "cal" && <Calendario onBack={() => setSec("home")} />}
        {sec === "calc" && <Placeholder title="Calculadora" onBack={() => setSec("home")} />}
        {sec === "map" && <Placeholder title="Mapa" onBack={() => setSec("home")} />}
        {sec === "wx" && <Placeholder title="Clima" onBack={() => setSec("home")} />}
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

/* ====================== CALENDÁRIO - VERSÃO MAIS PRÓXIMA DAS SUAS IMAGENS ====================== */
function Calendario({ onBack }: { onBack: () => void }) {
  const { provas } = useProvas();
  const done = provas.filter(p => p.done).length;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="mb-6 flex items-center gap-2 text-mist-400 hover:text-white">
        ← Voltar
      </button>

      <div className="bg-[#0a1428] rounded-3xl p-8">
        <h1 className="text-4xl font-bold text-white mb-1">Calendário 2026</h1>
        <p className="text-mist-400 mb-8">Campeonato Nacional • Calcular pontos por posição</p>

        <div className="bg-[#1e2937] rounded-2xl p-5 mb-8">
          <div className="flex justify-between items-center">
            <div className="text-mist-400">Progresso da Temporada</div>
            <div className="text-yellow-400 font-bold">{done}/10</div>
          </div>
          <div className="h-2.5 bg-[#334155] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(done / 10) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3">
          {provas.map((prova, index) => {
            const daysLeft = daysLeftFor(prova.dom, prova.done);
            return (
              <div key={prova.id} className="bg-[#1e2937] hover:bg-[#25344a] transition-all rounded-2xl p-6 flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 ${prova.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                    {prova.n}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-lg">{prova.city} — {prova.uf}</div>
                    <div className="text-mist-400 text-sm">{prova.diff} • {prova.km} km</div>
                    <div className="text-xs text-mist-500 mt-1">Sábado {prova.sab} • Domingo {prova.dom}</div>
                  </div>
                </div>

                <div className="text-right">
                  {prova.done ? (
                    <div className="text-emerald-400 text-sm font-bold px-5 py-2 bg-emerald-500/10 rounded-full">✓ Realizada</div>
                  ) : (
                    <div className="text-right">
                      <div className="text-5xl font-light text-white leading-none">{daysLeft}</div>
                      <div className="text-xs text-mist-400 tracking-widest">DIAS</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ====================== OUTRAS TELAS ====================== */
function Home({ go }: { go: (s: Section) => void }) {
  const { provas } = useProvas();
  const next = provas.find((p) => !p.done) ?? provas[0];
  const nextDays = next ? daysLeftFor(next.dom, next.done) : 2;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="text-4xl">⚙️</div>
        <div>
          <h1 className="text-4xl font-bold text-white">Centro de Provas</h1>
          <p className="text-mist-400">Calendário · Mapa · Clima · IA integrados</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#13222f] to-[#0f172a] border border-yellow-400/30 rounded-3xl p-8">
        <div className="flex justify-between items-start">
          <div>
            <div className="uppercase text-yellow-400 text-sm font-bold tracking-widest">Próxima Prova</div>
            <h2 className="text-5xl font-bold text-white mt-3">#{next.n} {next.city} — {next.uf}</h2>
            <p className="text-mist-400 mt-4">↑ {next.diff} • {next.km} km • Domingo {next.dom}</p>
          </div>
          <div className="text-right">
            <div className="text-[72px] leading-none font-light text-emerald-400">{nextDays}</div>
            <div className="text-sm text-mist-400 -mt-3">DIAS</div>
          </div>
        </div>
        <button 
          onClick={() => go("cal")}
          className="mt-10 w-full bg-yellow-400 text-black font-bold py-4 rounded-2xl text-lg hover:bg-amber-300 transition"
        >
          Ver Protocolo Completo →
        </button>
      </div>
    </div>
  );
}

function Placeholder({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="bg-[#0f172a] rounded-3xl p-20 text-center">
      <div className="text-3xl text-mist-400">Em breve...</div>
      <p className="text-mist-500 mt-4">{title}</p>
    </div>
  );
}

function Ambient() {
  return <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <div className="hidden sm:block text-xs font-mono text-mist-500">🕒 {now.toLocaleTimeString("pt-BR")}</div>;
}
