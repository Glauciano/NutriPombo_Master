"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Droplets, Wheat, Calculator, AlertTriangle } from "lucide-react";
import {
  PRODUCTS,
  PROTOCOLS,
  PHASE_LABELS,
  productUsageSummary,
  type Product,
} from "@/lib/supplements";

type Tab = "protocolo" | "calculadora" | string; // product ids also

const CATEGORIES = [
  { id: "velocidade", label: "Velocidade" },
  { id: "meio_fundo", label: "Meio Fundo" },
  { id: "fundo", label: "Fundo" },
];

export default function SuplementosPage() {
  const [tab, setTab] = useState<Tab>("protocolo");
  const [category, setCategory] = useState("velocidade");

  /* calculadora state */
  const [numPigeons, setNumPigeons] = useState("20");
  const [litersWater, setLitersWater] = useState("2");
  const [kgFood, setKgFood] = useState("0.6");

  const protocol = PROTOCOLS[category] || [];
  const usage = useMemo(() => productUsageSummary(category), [category]);
  const today = new Date().getDay();

  function getProduct(id: string): Product | undefined {
    return PRODUCTS.find((p) => p.id === id);
  }

  /* calculadora results */
  const calcResults = useMemo(() => {
    const liters = parseFloat(litersWater) || 0;
    const kg = parseFloat(kgFood) || 0;
    return {
      bioxan: { min: 2 * liters, max: 3 * liters, unit: "ml" },
      eletrovit: { min: 1 * liters, max: 2 * liters, unit: "g" },
      aminomix: { min: 1 * kg, max: 2 * kg, unit: "g" },
      organew: { min: 2 * kg, max: 3 * kg, unit: "g" },
    };
  }, [litersWater, kgFood]);

  const productTab = PRODUCTS.find((p) => p.id === tab);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <Link href="/nutricao" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">💊</span>
          <h1 className="text-2xl font-extrabold text-white">Bioxan + Eletrovit + Aminomix + Organew</h1>
        </div>
        <p className="text-sm text-slate-400">Protocolo semanal integrado • Água e comida nas proporções corretas</p>
      </div>

      {/* ─── Via banner ─── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs">
            <span className="font-black text-blue-400">NA ÁGUA:</span>{" "}
            <span className="text-blue-300">Bioxan + Eletrovit</span>
          </p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
          <Wheat className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs">
            <span className="font-black text-amber-400">NA COMIDA:</span>{" "}
            <span className="text-amber-300">Aminomix + Organew</span>
          </p>
        </div>
      </div>

      {/* ─── Main tabs ─── */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setTab("protocolo")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            tab === "protocolo"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          📋 Protocolo Semanal
        </button>
        <button
          onClick={() => setTab("calculadora")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            tab === "calculadora"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🧮 Calculadora
        </button>
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            onClick={() => setTab(p.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              tab === p.id
                ? "bg-yellow-500 text-[#0b1120]"
                : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
            }`}
          >
            {p.emoji} {p.name}
          </button>
        ))}
      </div>

      {/* ══════════ TAB: PROTOCOLO ══════════ */}
      {tab === "protocolo" && (
        <div>
          {/* Category selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`py-2.5 rounded-full text-sm font-bold transition-all ${
                  category === cat.id
                    ? "bg-yellow-500 text-[#0b1120]"
                    : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 px-1">
            <span className="text-[10px] text-blue-400 font-semibold">💧 Bioxan (água)</span>
            <span className="text-[10px] text-cyan-400 font-semibold">⚡ Eletrovit (água)</span>
            <span className="text-[10px] text-emerald-400 font-semibold">💪 Aminomix (comida)</span>
            <span className="text-[10px] text-amber-400 font-semibold">🦠 Organew (comida)</span>
            <span className="text-[10px] text-slate-500 font-semibold">🚱 só água limpa</span>
          </div>

          {/* Day cards */}
          <div className="space-y-3 mb-5">
            {protocol.map((day) => {
              const isToday = day.day === today;
              const phase = PHASE_LABELS[day.phase];
              return (
                <div
                  key={day.day}
                  className={`bg-[#1a2736] border rounded-xl overflow-hidden border-l-4 ${day.borderColor} ${
                    isToday ? "border-yellow-500/60 ring-1 ring-yellow-500/30" : "border-[#2a3a4a]"
                  }`}
                >
                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {day.phase === "recuperacao" ? "💧" : day.phase === "reconstrucao" ? "💪" : day.phase === "carga" ? "⚡" : day.phase === "prova" ? "🏁" : "🚱"}
                        </span>
                        <h3 className="text-sm font-extrabold text-white">{day.dayLabel}</h3>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-yellow-500 text-[#0b1120] rounded text-[9px] font-black uppercase">Hoje</span>
                        )}
                      </div>
                      {/* dose badges right */}
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {day.water.map((w) => {
                          const p = getProduct(w.productId);
                          return p ? (
                            <span key={w.productId} className={`px-2 py-0.5 rounded text-[10px] font-black ${p.textColor} bg-white/5 border border-current/20`}>
                              💧 {w.dose}
                            </span>
                          ) : null;
                        })}
                        {day.food.map((f) => {
                          const p = getProduct(f.productId);
                          return p ? (
                            <span key={f.productId} className={`px-2 py-0.5 rounded text-[10px] font-black ${p.textColor} bg-white/5 border border-current/20`}>
                              🌾 {f.dose}
                            </span>
                          ) : null;
                        })}
                        {day.water.length === 0 && day.food.length === 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-white/5">
                            🚱 só água
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Products used names */}
                    {(day.water.length > 0 || day.food.length > 0) && (
                      <p className="text-[10px] mb-1">
                        {day.water.map((w, i) => {
                          const p = getProduct(w.productId);
                          return p ? (
                            <span key={w.productId} className={`font-bold ${p.textColor}`}>
                              {i > 0 ? " + " : ""}{p.name} (água)
                            </span>
                          ) : null;
                        })}
                        {day.water.length > 0 && day.food.length > 0 && <span className="text-slate-600"> • </span>}
                        {day.food.map((f, i) => {
                          const p = getProduct(f.productId);
                          return p ? (
                            <span key={f.productId} className={`font-bold ${p.textColor}`}>
                              {i > 0 ? " + " : ""}{p.name} (comida)
                            </span>
                          ) : null;
                        })}
                      </p>
                    )}

                    <p className="text-xs text-slate-400">{day.description}</p>
                    <p className={`text-[10px] font-bold mt-1 ${phase.color}`}>{phase.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Resumo da Semana ─── */}
          <div className="bg-[#1a2736] border-2 border-yellow-500/40 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm">📊</span>
              <span className="text-sm font-extrabold text-yellow-400">
                Resumo da Semana — {CATEGORIES.find((c) => c.id === category)?.label}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {PRODUCTS.map((p) => (
                <div key={p.id} className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl p-4 text-center">
                  <span className="text-xl block mb-1">{p.emoji}</span>
                  <p className={`text-sm font-black ${p.textColor}`}>{p.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {usage[p.id] || 0} dia(s)/semana
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    {p.via === "agua" ? "💧 na água" : "🌾 na comida"}
                  </p>
                </div>
              ))}
            </div>

            {/* Golden rule */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300 leading-relaxed">
                <span className="font-black">Regra de ouro:</span> Nunca misture os produtos da água (Bioxan/Eletrovit) com os da comida (Aminomix/Organew) na mesma solução. Pela manhã: água medicada + ração com suplemento. Trocar a água a cada 24h. Organew sempre após antibióticos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: CALCULADORA ══════════ */}
      {tab === "calculadora" && (
        <div className="space-y-4">
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Parâmetros</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">🐦 Pombos</label>
                <input
                  type="number"
                  value={numPigeons}
                  onChange={(e) => {
                    setNumPigeons(e.target.value);
                    const n = parseInt(e.target.value) || 0;
                    setLitersWater(String(Math.max(0.5, Math.round(n * 0.1 * 10) / 10)));
                    setKgFood(String(Math.max(0.1, Math.round(n * 0.032 * 100) / 100)));
                  }}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">💧 Litros água</label>
                <input
                  type="number"
                  step="0.5"
                  value={litersWater}
                  onChange={(e) => setLitersWater(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">🌾 Kg ração</label>
                <input
                  type="number"
                  step="0.1"
                  value={kgFood}
                  onChange={(e) => setKgFood(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-lg font-bold text-center focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">
              💡 Litros e kg são estimados automaticamente pelo nº de pombos (100ml água + 32g ração/pombo). Ajuste se necessário.
            </p>
          </div>

          {/* Water products */}
          <div className="bg-[#1a2736] border border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Na Água ({litersWater}L)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b1120] rounded-xl p-4 text-center">
                <span className="text-xl block mb-1">💧</span>
                <p className="text-sm font-black text-blue-400 mb-1">Bioxan</p>
                <p className="text-2xl font-black text-white">
                  {calcResults.bioxan.min.toFixed(1).replace(".", ",")}–{calcResults.bioxan.max.toFixed(1).replace(".", ",")}
                </p>
                <p className="text-[10px] text-slate-500">ml no total</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-4 text-center">
                <span className="text-xl block mb-1">⚡</span>
                <p className="text-sm font-black text-cyan-400 mb-1">Eletrovit</p>
                <p className="text-2xl font-black text-white">
                  {calcResults.eletrovit.min.toFixed(1).replace(".", ",")}–{calcResults.eletrovit.max.toFixed(1).replace(".", ",")}
                </p>
                <p className="text-[10px] text-slate-500">g no total</p>
              </div>
            </div>
          </div>

          {/* Food products */}
          <div className="bg-[#1a2736] border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Wheat className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Na Comida ({kgFood}kg)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0b1120] rounded-xl p-4 text-center">
                <span className="text-xl block mb-1">💪</span>
                <p className="text-sm font-black text-emerald-400 mb-1">Aminomix</p>
                <p className="text-2xl font-black text-white">
                  {calcResults.aminomix.min.toFixed(1).replace(".", ",")}–{calcResults.aminomix.max.toFixed(1).replace(".", ",")}
                </p>
                <p className="text-[10px] text-slate-500">g no total</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-4 text-center">
                <span className="text-xl block mb-1">🦠</span>
                <p className="text-sm font-black text-amber-400 mb-1">Organew</p>
                <p className="text-2xl font-black text-white">
                  {calcResults.organew.min.toFixed(1).replace(".", ",")}–{calcResults.organew.max.toFixed(1).replace(".", ",")}
                </p>
                <p className="text-[10px] text-slate-500">g no total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: PRODUCT DETAIL ══════════ */}
      {productTab && (
        <div className="space-y-4">
          <div className={`bg-[#1a2736] border-2 rounded-2xl p-6 ${
            productTab.via === "agua" ? "border-blue-500/40" : "border-amber-500/40"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-14 h-14 rounded-2xl ${productTab.color}/20 flex items-center justify-center text-2xl`}>
                {productTab.emoji}
              </div>
              <div>
                <h2 className={`text-xl font-black ${productTab.textColor}`}>{productTab.name}</h2>
                <p className="text-xs text-slate-400">
                  {productTab.via === "agua" ? "💧 Administrar NA ÁGUA" : "🌾 Administrar NA COMIDA"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#0b1120] rounded-xl p-4">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">O que é</p>
                <p className="text-sm text-slate-300">{productTab.what}</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-4">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Dosagem</p>
                <p className={`text-lg font-black ${productTab.textColor}`}>{productTab.dosage}</p>
              </div>
              <div className="bg-[#0b1120] rounded-xl p-4">
                <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1">Quando usar</p>
                <p className="text-sm text-slate-300">{productTab.when}</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">💡 Dicas</p>
                <div className="space-y-1.5">
                  {productTab.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-emerald-300">• {tip}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo Nutrição • Suplementação
      </p>
    </div>
  );
}
