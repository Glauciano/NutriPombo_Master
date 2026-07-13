"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Pill, X, ChevronDown, ChevronUp, AlertTriangle, Shield, Syringe } from "lucide-react";
import {
  DISEASES,
  RECOMMENDATIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  SEVERITY_META,
  type Disease,
  type DiseaseCategory,
  type Severity,
} from "@/lib/therapeutic";

type Tab = "doencas" | "recomendacoes" | "buscar";
type CategoryFilter = "todas" | DiseaseCategory;

export default function GuiaTerapeuticoPage() {
  const [tab, setTab] = useState<Tab>("doencas");
  const [catFilter, setCatFilter] = useState<CategoryFilter>("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* filtered diseases */
  const filtered = useMemo(() => {
    let list = DISEASES;
    if (catFilter !== "todas") {
      list = list.filter((d) => d.category === catFilter);
    }
    return list;
  }, [catFilter]);

  /* search results */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return DISEASES.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.altName && d.altName.toLowerCase().includes(q)) ||
        d.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        d.principles.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  /* severity counts */
  const counts = useMemo(() => {
    const c: Record<Severity, number> = { baixa: 0, media: 0, alta: 0, critica: 0 };
    filtered.forEach((d) => { c[d.severity]++; });
    return c;
  }, [filtered]);

  const categoryFilters: { id: CategoryFilter; label: string }[] = [
    { id: "todas", label: "Todas" },
    { id: "bacteriana", label: "Bacteriana" },
    { id: "protozoario", label: "Protozoário" },
    { id: "parasita_interno", label: "Parasita Interno" },
    { id: "fungica", label: "Fúngica" },
    { id: "viral", label: "Viral" },
  ];

  function DiseaseCard({ disease }: { disease: Disease }) {
    const isExpanded = expandedId === disease.id;
    const catColor = CATEGORY_COLORS[disease.category];
    const sevMeta = SEVERITY_META[disease.severity];

    return (
      <div
        className={`bg-[#1a2736] border border-[#2a3a4a] rounded-xl overflow-hidden border-l-4 ${disease.borderColor} transition-all hover:bg-[#1e2f40]`}
      >
        <button
          onClick={() => setExpandedId(isExpanded ? null : disease.id)}
          className="w-full text-left p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Name + alt */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-base">{disease.emoji}</span>
                <h3 className="text-sm font-extrabold text-white">
                  {disease.name}
                  {disease.altName && <span className="text-slate-400 font-semibold"> [{disease.altName}]</span>}
                </h3>
              </div>
              {/* Category badge */}
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${catColor.bg} ${catColor.text} mb-2`}>
                {CATEGORY_LABELS[disease.category]}
              </span>
              {/* Symptoms preview */}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {disease.symptoms.slice(0, 3).map((s, i) => (
                  <span key={i}>• {s} </span>
                ))}
                {disease.symptoms.length > 3 && <span className="text-slate-600">+{disease.symptoms.length - 3}</span>}
              </p>
            </div>
            {/* Right side */}
            <div className="shrink-0 text-right">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black ${sevMeta.bg} ${sevMeta.color} border ${sevMeta.border} mb-2`}>
                {disease.severity === "critica" ? "☠️" : "⚠️"} {sevMeta.label}
              </span>
              <p className="text-[10px] text-slate-500">
                {disease.principles.length} princípio(s)
              </p>
              <div className="mt-1 flex justify-end">
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </div>
            </div>
          </div>
        </button>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-[#2a3a4a] pt-4">
            {/* Symptoms full */}
            <div>
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">🩺 Sintomas</p>
              <div className="space-y-1">
                {disease.symptoms.map((s, i) => (
                  <p key={i} className="text-xs text-slate-300">• {s}</p>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">🔄 Transmissão</p>
              <p className="text-xs text-slate-300">{disease.transmission}</p>
            </div>

            {/* Active principles */}
            <div>
              <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">💊 Princípios Ativos & Posologia</p>
              <div className="space-y-2">
                {disease.principles.map((p, i) => (
                  <div key={i} className="bg-[#0b1120] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[10px] font-bold text-emerald-400">{p.duration}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Dosagem: <span className="text-yellow-400 font-semibold">{p.dosage}</span></p>
                    {p.notes && <p className="text-[10px] text-slate-500 mt-0.5">💡 {p.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Prevention */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">🛡️ Prevenção</p>
              <p className="text-xs text-emerald-300">{disease.prevention}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <Link href="/saude" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">💊</span>
          <h1 className="text-2xl font-extrabold text-white">Guia Terapêutico</h1>
        </div>
        <p className="text-sm text-slate-400">Doenças, princípios ativos e posologia para pombos</p>
      </div>

      {/* ─── Main Tabs ─── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          onClick={() => setTab("doencas")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "doencas"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🦠 Doenças
        </button>
        <button
          onClick={() => setTab("recomendacoes")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "recomendacoes"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          📋 Recomendações
        </button>
        <button
          onClick={() => setTab("buscar")}
          className={`py-2.5 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            tab === "buscar"
              ? "bg-yellow-500 text-[#0b1120]"
              : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
          }`}
        >
          🔍 Buscar
        </button>
      </div>

      {/* ══════════ TAB: DOENÇAS ══════════ */}
      {tab === "doencas" && (
        <div>
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {categoryFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setCatFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  catFilter === f.id
                    ? "bg-yellow-500 text-[#0b1120]"
                    : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Severity stat cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#1a2736] border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                🟢 Baixa
              </span>
              <span className="text-2xl font-black text-emerald-400">{counts.baixa}</span>
            </div>
            <div className="bg-[#1a2736] border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                🟡 Média
              </span>
              <span className="text-2xl font-black text-yellow-400">{counts.media}</span>
            </div>
            <div className="bg-[#1a2736] border border-orange-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                🟠 Alta
              </span>
              <span className="text-2xl font-black text-orange-400">{counts.alta}</span>
            </div>
            <div className="bg-[#1a2736] border border-red-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                🔴 CRÍTICA
              </span>
              <span className="text-2xl font-black text-red-400">{counts.critica}</span>
            </div>
          </div>

          {/* Disease cards */}
          <div className="space-y-3">
            {filtered.map((d) => (
              <DiseaseCard key={d.id} disease={d} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Nenhuma doença nesta categoria
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ TAB: RECOMENDAÇÕES ══════════ */}
      {tab === "recomendacoes" && (
        <div className="space-y-4">
          {RECOMMENDATIONS.map((rec) => (
            <div key={rec.id} className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{rec.emoji}</span>
                <h3 className="text-sm font-extrabold text-yellow-400">{rec.title}</h3>
              </div>
              <div className="space-y-2">
                {rec.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0b1120] rounded-lg px-3 py-2.5">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400 mb-1">Aviso Importante</p>
              <p className="text-xs text-red-300/80">
                Este guia é informativo. Sempre consulte um médico veterinário especializado em aves antes de iniciar qualquer tratamento. Doses incorretas podem ser fatais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ TAB: BUSCAR ══════════ */}
      {tab === "buscar" && (
        <div>
          {/* Search input */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por doença, sintoma ou medicamento..."
              className="w-full pl-11 pr-10 py-3.5 bg-[#1a2736] border border-[#2a3a4a] rounded-xl text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Quick searches */}
          {!searchQuery && (
            <div className="mb-5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Buscas rápidas</p>
              <div className="flex flex-wrap gap-2">
                {["Diarreia", "Respiração", "Torcicolo", "Placas na boca", "Ronidazol", "Enrofloxacina", "Vermes", "Olho inflamado"].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSearchQuery(q)}
                    className="px-3 py-1.5 bg-[#1a2736] border border-[#2a3a4a] rounded-full text-xs text-slate-400 hover:text-white hover:border-yellow-500/40 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {searchQuery && (
            <p className="text-xs text-slate-500 mb-3">
              {searchResults.length} resultado(s) para &quot;{searchQuery}&quot;
            </p>
          )}
          <div className="space-y-3">
            {searchResults.map((d) => (
              <DiseaseCard key={d.id} disease={d} />
            ))}
            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Nenhum resultado encontrado</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI • Guia Terapêutico • Consulte sempre um veterinário
      </p>
    </div>
  );
}
