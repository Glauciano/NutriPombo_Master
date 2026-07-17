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
    <div className="relative min-h-screen bg-[#0a0f1c] text-white">
      <Ambient />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0f1c]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PigeonLogo size={36} />
          <div>
            <div className="font-bold text-xl">PigeonMaster AI</div>
            <div className="text-xs text-gray-400 -mt-1">GESTÃO DE COLUMBOFILIA • V3.1</div>
          </div>
        </div>

        <Clock />

        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-1.5 rounded-full text-sm">Demo</div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
            </div>
            <div className="w-9 h-9 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold">
              {user.name[0]}
            </div>
          </div>
          <button onClick={onSignOut} className="text-gray-400 hover:text-white">Sair</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {sec === "home" && <Home go={setSec} />}
        {sec === "cal" && <Calendario onBack={() => setSec("home")} />}
        {sec === "calc" && <Calculadora onBack={() => setSec("home")} />}
        {sec === "map" && <Mapa onBack={() => setSec("home")} />}
        {sec === "wx" && <Clima onBack={() => setSec("home")} />}
      </main>
    </div>
  );
}

/* ====================== HOME - CENTRO DE PROVAS (como na primeira imagem) ====================== */
function Home({ go }: { go: (s: Section) => void }) {
  const { provas } = useProvas();
  const next = provas.find(p => !p.done) || provas[6];
  const done = provas.filter(p => p.done).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          ⚙️ Centro de Provas
        </h1>
        <p className="text-gray-400">Calendário • Mapa • Clima • IA integrados</p>
      </div>

      {/* Card Urgente */}
      <div className="bg-gradient-to-r from-red-900/30 to-[#1a2338] border border-red-500/30 rounded-3xl p-6">
        <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
          <span className="text-lg">⚠️</span> URGENTE
        </div>
        <div className="flex justify-between mt-4">
          <div>
            <div className="text-3xl font-bold">#{next.n} {next.city} — {next.uf}</div>
            <div className="text-gray-400 mt-1">Meio Fundo • 550 km • Sábado 25/07/2026</div>
            <div className="text-amber-400 text-sm mt-4">⚠️ 2 dias — carga energética!</div>
          </div>
          <div className="text-right">
            <div className="text-6xl font-light text-red-400">2</div>
            <div className="text-xs text-gray-400">dias</div>
          </div>
        </div>
        <button onClick={() => go("cal")} className="mt-6 w-full bg-yellow-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-300">
          📋 Ver Protocolo Completo →
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a2338] rounded-3xl p-6">
          <div className="text-gray-400 text-sm">Provas 2026</div>
          <div className="text-5xl font-bold text-white mt-2">10</div>
          <div className="text-emerald-400 text-sm">4 já finalizadas</div>
        </div>
        <div className="bg-[#1a2338] rounded-3xl p-6">
          <div className="text-gray-400 text-sm">Realizadas</div>
          <div className="text-5xl font-bold text-emerald-400 mt-2">{done}</div>
          <div className="text-emerald-400 text-sm">6 restantes</div>
        </div>
      </div>

      {/* Progresso */}
      <div className="bg-[#1a2338] rounded-3xl p-6">
        <div className="flex justify-between mb-3">
          <span>Temporada 2026</span>
          <span className="font-bold text-yellow-400">{done}/10</span>
        </div>
        <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full w-3/5 bg-yellow-400 rounded-full"></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">06/04/2026 — 30/08/2026</div>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div onClick={() => go("cal")} className="bg-[#1a2338] hover:bg-[#212b42] p-6 rounded-3xl cursor-pointer transition border border-white/5">
          <div className="text-yellow-400 text-xl mb-2">📅</div>
          <div className="font-semibold">Calendário de Provas</div>
          <div className="text-sm text-gray-400">10 provas • protocolo completo por prova</div>
        </div>

        <div onClick={() => go("calc")} className="bg-[#1a2338] hover:bg-[#212b42] p-6 rounded-3xl cursor-pointer transition border border-white/5">
          <div className="text-yellow-400 text-xl mb-2">⚡</div>
          <div className="font-semibold">Calculadora de Velocidade</div>
          <div className="text-sm text-gray-400">Calcule velocidade, tempo ou distância</div>
        </div>

        <div onClick={() => go("map")} className="bg-[#1a2338] hover:bg-[#212b42] p-6 rounded-3xl cursor-pointer transition border border-white/5">
          <div className="text-sky-400 text-xl mb-2">🗺️</div>
          <div className="font-semibold">Mapa de Solturas</div>
          <div className="text-sm text-gray-400">Localização, distâncias e velocidades</div>
        </div>

        <div onClick={() => go("wx")} className="bg-[#1a2338] hover:bg-[#212b42] p-6 rounded-3xl cursor-pointer transition border border-white/5">
          <div className="text-emerald-400 text-xl mb-2">⛅</div>
          <div className="font-semibold">Previsão do Tempo</div>
          <div className="text-sm text-gray-400">Clima real + análise para soltura</div>
        </div>
      </div>
    </div>
  );
}

/* ====================== TELAS (ainda básicas - vamos melhorar uma por uma) ====================== */
function Calendario({ onBack }: { onBack: () => void }) {
  const { provas } = useProvas();
  const done = provas.filter(p => p.done).length;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2">← Voltar</button>
      
      <div className="bg-[#0f172a] rounded-3xl p-8">
        <h1 className="text-3xl font-bold">Calendário 2026</h1>
        <p className="text-gray-400">Campeonato Nacional • Calcular pontos por posição</p>

        <div className="mt-8 bg-[#1e2937] p-5 rounded-2xl">
          <div className="flex justify-between mb-4">
            <span>Progresso da Temporada</span>
            <span className="font-bold text-yellow-400">{done}/10</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full">
            <div className="h-2 bg-yellow-400 rounded-full w-3/5"></div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {provas.map(p => (
            <div key={p.id} className="bg-[#1e2937] p-5 rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-semibold">#{p.n} {p.city} — {p.uf}</div>
                <div className="text-xs text-gray-400">{p.diff} • {p.km}km • {p.dom}</div>
              </div>
              <div className="text-right">
                {p.done ? <span className="text-emerald-400">✓ Realizada</span> : <span className="text-2xl font-light">{daysLeftFor(p.dom, p.done)}d</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Calculadora({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#0f172a] rounded-3xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">⚡ Calculadora de Velocidade</h2>
      <p className="text-gray-400">Versão completa será implementada na próxima etapa.</p>
      <button onClick={onBack} className="mt-10 text-gray-400 hover:text-white">← Voltar</button>
    </div>
  );
}

function Mapa({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#0f172a] rounded-3xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">🗺️ Mapa de Solturas</h2>
      <p className="text-gray-400">Versão completa será implementada na próxima etapa.</p>
      <button onClick={onBack} className="mt-10 text-gray-400 hover:text-white">← Voltar</button>
    </div>
  );
}

function Clima({ onBack }: { onBack: () => void }) {
  return (
    <div className="bg-[#0f172a] rounded-3xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">🌤️ Previsão do Tempo</h2>
      <p className="text-gray-400">Versão completa será implementada na próxima etapa.</p>
      <button onClick={onBack} className="mt-10 text-gray-400 hover:text-white">← Voltar</button>
    </div>
  );
}

/* ====================== COMPONENTES AUXILIARES ====================== */
function Ambient() {
  return <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <div className="bg-white/5 px-4 py-2 rounded-full font-mono text-sm">{now.toLocaleTimeString("pt-BR")}</div>;
}
