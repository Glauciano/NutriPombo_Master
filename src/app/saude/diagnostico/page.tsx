"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Microscope, RotateCcw, AlertTriangle, ChevronRight } from "lucide-react";
import { DISEASES, CATEGORY_LABELS, SEVERITY_META, type Disease } from "@/lib/therapeutic";

/* symptom groups for the wizard */
const SYMPTOM_OPTIONS = [
  { id: "diarreia", label: "Diarreia / fezes aquosas", keywords: ["diarreia", "fezes aquosas", "fezes com muco", "aquosa"] },
  { id: "fezes_verdes", label: "Fezes verdes", keywords: ["verde"] },
  { id: "emagrecimento", label: "Emagrecimento", keywords: ["emagrecimento", "perda de peso"] },
  { id: "placas_boca", label: "Placas na boca/garganta", keywords: ["placas", "boca", "garganta", "papo"] },
  { id: "respiracao", label: "Respiração ruidosa/ofegante", keywords: ["respiração", "respiratória", "ofegante", "ruidosa"] },
  { id: "espirros", label: "Espirros / secreção nasal", keywords: ["espirros", "secreção nasal", "nariz"] },
  { id: "olho", label: "Olho inflamado / lacrimejando", keywords: ["olho", "olhos", "lacrimejamento"] },
  { id: "torcicolo", label: "Torcicolo / cabeça virada", keywords: ["torcicolo", "cabeça virada", "tremores de cabeça"] },
  { id: "paralisia", label: "Paralisia / perda de equilíbrio", keywords: ["paralisia", "equilíbrio"] },
  { id: "crostas", label: "Crostas no bico/olhos/patas", keywords: ["crostas", "pústulas", "lesões"] },
  { id: "vermes_fezes", label: "Vermes visíveis nas fezes", keywords: ["vermes visíveis", "vermes"] },
  { id: "queda_rendimento", label: "Queda de rendimento em voo", keywords: ["rendimento", "performance"] },
  { id: "apetite", label: "Apetite irregular / não come", keywords: ["apetite", "engolir", "comer"] },
  { id: "penas", label: "Penas arrepiadas / sem brilho", keywords: ["penas"] },
  { id: "sede", label: "Sede excessiva / desidratação", keywords: ["sede", "desidratação"] },
  { id: "filhotes_morrem", label: "Filhotes morrendo no ninho", keywords: ["filhotes", "mortalidade"] },
];

export default function DiagnosticoPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  function toggleSymptom(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowResults(false);
  }

  const matches = useMemo(() => {
    if (selected.size === 0) return [];
    const selectedOptions = SYMPTOM_OPTIONS.filter((s) => selected.has(s.id));

    const scored = DISEASES.map((disease) => {
      let hits = 0;
      const matchedSymptoms: string[] = [];
      for (const opt of selectedOptions) {
        const diseaseText = disease.symptoms.join(" ").toLowerCase();
        if (opt.keywords.some((kw) => diseaseText.includes(kw.toLowerCase()))) {
          hits++;
          matchedSymptoms.push(opt.label);
        }
      }
      const score = selectedOptions.length > 0 ? (hits / selectedOptions.length) * 100 : 0;
      return { disease, hits, score, matchedSymptoms };
    })
      .filter((m) => m.hits > 0)
      .sort((a, b) => b.score - a.score || b.hits - a.hits);

    return scored;
  }, [selected]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <Link href="/saude" className="inline-flex px-3 py-1.5 text-xs font-semibold bg-[#1a2736] border border-[#2a3a4a] rounded-lg text-slate-400 hover:text-white transition-colors mb-4">
          ← Voltar
        </Link>
        <div className="flex items-center gap-2 mb-1">
          <Microscope className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-extrabold text-white">Diagnóstico por Sintomas</h1>
        </div>
        <p className="text-sm text-slate-400">Marque o que observa no pombo — a IA sugere as doenças prováveis</p>
      </div>

      {/* Symptom selector */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
            🩺 Sintomas observados ({selected.size})
          </p>
          {selected.size > 0 && (
            <button
              onClick={() => { setSelected(new Set()); setShowResults(false); }}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-white"
            >
              <RotateCcw className="w-3 h-3" /> Limpar
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SYMPTOM_OPTIONS.map((sym) => {
            const isSelected = selected.has(sym.id);
            return (
              <button
                key={sym.id}
                onClick={() => toggleSymptom(sym.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-300"
                    : "bg-[#0b1120] border-[#2a3a4a] text-slate-400 hover:border-cyan-500/30"
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-cyan-500 border-cyan-500" : "border-slate-600"
                }`}>
                  {isSelected && <span className="text-[9px] text-[#0b1120] font-black">✓</span>}
                </div>
                {sym.label}
              </button>
            );
          })}
        </div>

        {selected.size > 0 && !showResults && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full mt-4 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-[#0b1120] rounded-xl font-black text-sm transition-colors"
          >
            🔬 Analisar Sintomas ({selected.size})
          </button>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            {matches.length} doença(s) compatível(is) — em ordem de probabilidade
          </p>

          {matches.length === 0 ? (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-8 text-center">
              <Microscope className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Nenhuma correspondência clara. Consulte um veterinário.</p>
            </div>
          ) : (
            matches.slice(0, 5).map((m, idx) => {
              const sev = SEVERITY_META[m.disease.severity];
              return (
                <div
                  key={m.disease.id}
                  className={`bg-[#1a2736] border rounded-xl p-4 border-l-4 ${m.disease.borderColor} ${
                    idx === 0 ? "border-cyan-500/40 ring-1 ring-cyan-500/20" : "border-[#2a3a4a]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{m.disease.emoji}</span>
                        <h3 className="text-sm font-black text-white">
                          {m.disease.name}
                          {m.disease.altName && <span className="text-slate-400"> [{m.disease.altName}]</span>}
                        </h3>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 bg-cyan-500 text-[#0b1120] rounded text-[8px] font-black uppercase">
                            Mais provável
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">{CATEGORY_LABELS[m.disease.category]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xl font-black ${
                        m.score >= 70 ? "text-cyan-400" : m.score >= 40 ? "text-yellow-400" : "text-slate-400"
                      }`}>
                        {Math.round(m.score)}%
                      </p>
                      <span className={`text-[9px] font-black ${sev.color}`}>{sev.label}</span>
                    </div>
                  </div>

                  {/* matched symptoms */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {m.matchedSymptoms.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded text-[9px] font-semibold">
                        ✓ {s}
                      </span>
                    ))}
                  </div>

                  {/* first treatment */}
                  {m.disease.principles[0] && (
                    <div className="bg-[#0b1120] rounded-lg p-3 mb-2">
                      <p className="text-[9px] font-bold text-yellow-400 uppercase mb-0.5">💊 Tratamento de eleição</p>
                      <p className="text-xs text-white font-bold">{m.disease.principles[0].name}</p>
                      <p className="text-[10px] text-slate-400">
                        {m.disease.principles[0].dosage} • {m.disease.principles[0].duration}
                      </p>
                    </div>
                  )}

                  <Link
                    href="/saude/guia"
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    Ver ficha completa no Guia Terapêutico <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              );
            })
          )}

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-red-300/80">
              <span className="font-black">Importante:</span> este é um auxílio de triagem, não substitui o diagnóstico veterinário. Casos com torcicolo/paralisia (suspeita de Paramixovírus) exigem isolamento imediato.
            </p>
          </div>
        </div>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • Diagnóstico</p>
    </div>
  );
}
