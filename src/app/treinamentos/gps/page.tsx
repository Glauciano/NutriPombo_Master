"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Play,
  Square,
  Save,
  Home,
  Crosshair,
  Timer,
  Zap,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

/* ─── Haversine distance in km ─── */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtCoord(v: number): string {
  return v.toFixed(5);
}

function fmtElapsed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface Loft { lat: number; lon: number }

export default function GpsTreinosPage() {
  const [loft, setLoft] = useState<Loft | null>(null);
  const [currentPos, setCurrentPos] = useState<Loft | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  /* training session */
  const [releasePoint, setReleasePoint] = useState<Loft | null>(null);
  const [flying, setFlying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState<{ durationSec: number; distance: number; speed: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* load loft from settings */
  useEffect(() => {
    fetch("/api/settings?key=loft_location")
      .then((r) => r.json())
      .then((d) => {
        if (d.value?.lat) setLoft(d.value as Loft);
      })
      .catch(() => { /* ignore */ });
  }, []);

  /* GPS position */
  const getPosition = useCallback((): Promise<Loft> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS não disponível neste dispositivo"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(new Error(err.message)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    });
  }, []);

  async function captureCurrent() {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await getPosition();
      setCurrentPos(pos);
    } catch (e) {
      setGpsError(e instanceof Error ? e.message : "Erro de GPS");
    }
    setGpsLoading(false);
  }

  async function setLoftHere() {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await getPosition();
      setLoft(pos);
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "loft_location", value: pos }),
      });
    } catch (e) {
      setGpsError(e instanceof Error ? e.message : "Erro de GPS");
    }
    setGpsLoading(false);
  }

  async function markReleaseHere() {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const pos = await getPosition();
      setReleasePoint(pos);
      setCurrentPos(pos);
      setFinished(null);
      setSavedOk(false);
    } catch (e) {
      setGpsError(e instanceof Error ? e.message : "Erro de GPS");
    }
    setGpsLoading(false);
  }

  const distance = releasePoint && loft ? haversine(releasePoint.lat, releasePoint.lon, loft.lat, loft.lon) : 0;

  /* timer */
  function startFlight() {
    setFlying(true);
    setStartTime(Date.now());
    setElapsed(0);
    setFinished(null);
    setSavedOk(false);
  }

  /* timer effect */
  useEffect(() => {
    if (flying && startTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [flying, startTime]);

  function stopFlight() {
    if (timerRef.current) clearInterval(timerRef.current);
    setFlying(false);
    const durationSec = startTime ? Math.floor((Date.now() - startTime) / 1000) : elapsed;
    const durationMin = durationSec / 60;
    const speed = durationMin > 0 ? (distance * 1000) / durationMin : 0;
    setFinished({ durationSec, distance, speed });
  }

  async function saveTraining() {
    if (!finished) return;
    setSaving(true);
    try {
      const type = distance < 30 ? "velocidade" : distance < 100 ? "meio_fundo" : "fundo";
      await fetch("/api/trainings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          type,
          distance: finished.distance.toFixed(2),
          duration: finished.durationSec,
          speed: finished.speed.toFixed(2),
          notes: `GPS: solta ${releasePoint ? `${fmtCoord(releasePoint.lat)}, ${fmtCoord(releasePoint.lon)}` : ""} → pombal`,
        }),
      });
      setSavedOk(true);
    } catch { /* ignore */ }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/treinamentos" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Navigation className="w-6 h-6 text-emerald-400" />
          <h1 className="text-2xl font-extrabold text-white">GPS de Treinos</h1>
        </div>
        <p className="text-sm text-slate-400">Marque o ponto de solta, cronometre e registre o treino automaticamente</p>
      </div>

      {gpsError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400">Erro de GPS</p>
            <p className="text-xs text-red-300/70">{gpsError}. Permita o acesso à localização no navegador.</p>
          </div>
        </div>
      )}

      {/* ─── STEP 1: Pombal ─── */}
      <div className={`bg-[#1a2736] border rounded-2xl p-5 mb-4 ${loft ? "border-emerald-500/40" : "border-[#2a3a4a]"}`}>
        <div className="flex items-center gap-2 mb-3">
          <Home className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">1. Localização do Pombal</span>
          {loft && <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />}
        </div>
        {loft ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              📍 <span className="text-white font-mono font-semibold">{fmtCoord(loft.lat)}, {fmtCoord(loft.lon)}</span>
            </p>
            <button
              onClick={setLoftHere}
              disabled={gpsLoading}
              className="px-3 py-1.5 bg-[#0b1120] border border-[#2a3a4a] rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Atualizar
            </button>
          </div>
        ) : (
          <button
            onClick={setLoftHere}
            disabled={gpsLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {gpsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
            Estou no pombal — marcar aqui
          </button>
        )}
      </div>

      {/* ─── STEP 2: Release point ─── */}
      <div className={`bg-[#1a2736] border rounded-2xl p-5 mb-4 ${releasePoint ? "border-blue-500/40" : "border-[#2a3a4a]"}`}>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">2. Ponto de Solta</span>
          {releasePoint && <CheckCircle className="w-4 h-4 text-blue-400 ml-auto" />}
        </div>
        <button
          onClick={markReleaseHere}
          disabled={gpsLoading || !loft || flying}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 mb-3"
        >
          {gpsLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          Estou no ponto de solta — marcar GPS
        </button>
        {!loft && <p className="text-[10px] text-slate-600 text-center">Configure o pombal primeiro (passo 1)</p>}

        {releasePoint && loft && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b1120] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Coordenadas</p>
              <p className="text-xs font-mono font-bold text-blue-400">{fmtCoord(releasePoint.lat)}</p>
              <p className="text-xs font-mono font-bold text-blue-400">{fmtCoord(releasePoint.lon)}</p>
            </div>
            <div className="bg-[#0b1120] rounded-xl p-3 text-center">
              <p className="text-[10px] text-slate-500 uppercase mb-1">Distância até o pombal</p>
              <p className="text-2xl font-black text-yellow-400">{distance.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500">km (linha reta)</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── STEP 3: Timer ─── */}
      <div className={`bg-[#1a2736] border-2 rounded-2xl p-5 mb-4 ${flying ? "border-yellow-500/60" : "border-[#2a3a4a]"}`}>
        <div className="flex items-center gap-2 mb-4">
          <Timer className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">3. Cronômetro de Voo</span>
        </div>

        {/* Big timer display */}
        <div className="text-center mb-5">
          <p className={`text-6xl font-black tabular-nums ${flying ? "text-yellow-400 animate-pulse" : finished ? "text-emerald-400" : "text-slate-600"}`}>
            {fmtElapsed(finished ? finished.durationSec : elapsed)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {flying ? "🕊️ Pombos voando..." : finished ? "✅ Voo concluído" : "Aguardando solta"}
          </p>
        </div>

        {!flying && !finished && (
          <button
            onClick={startFlight}
            disabled={!releasePoint || !loft}
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            SOLTEI OS POMBOS — iniciar cronômetro
          </button>
        )}

        {flying && (
          <button
            onClick={stopFlight}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" />
            CHEGARAM — parar cronômetro
          </button>
        )}

        {finished && (
          <div>
            {/* Results */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#0b1120] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Distância</p>
                <p className="text-lg font-black text-blue-400">{finished.distance.toFixed(2)}</p>
                <p className="text-[9px] text-slate-600">km</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Tempo</p>
                <p className="text-lg font-black text-emerald-400">{fmtElapsed(finished.durationSec)}</p>
                <p className="text-[9px] text-slate-600">min</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Velocidade</p>
                <p className="text-lg font-black text-yellow-400">{finished.speed.toFixed(0)}</p>
                <p className="text-[9px] text-slate-600">m/min</p>
              </div>
            </div>

            {savedOk ? (
              <div className="w-full py-3.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Treino salvo no histórico!
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => { setFinished(null); setElapsed(0); setReleasePoint(null); }}
                  className="flex-1 py-3 bg-[#0b1120] border border-[#2a3a4a] text-slate-400 rounded-xl font-bold text-sm"
                >
                  Descartar
                </button>
                <button
                  onClick={saveTraining}
                  disabled={saving}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Treino
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-xl p-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">💡 Como usar</p>
        <div className="space-y-1 text-xs text-slate-500">
          <p>1. No pombal, marque a localização uma vez (fica salva)</p>
          <p>2. Ao chegar no ponto de solta, marque o GPS — a distância é calculada</p>
          <p>3. Solte os pombos e inicie o cronômetro</p>
          <p>4. Quando chegarem (aviso de casa), pare e salve — velocidade em m/min automática</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo GPS • Treinos
      </p>
    </div>
  );
}
