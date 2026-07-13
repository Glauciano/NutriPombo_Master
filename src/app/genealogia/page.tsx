"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Dna, AlertTriangle, CheckCircle, Heart, Bird } from "lucide-react";

interface Pigeon {
  id: number;
  ringNumber: string;
  name: string | null;
  sex: string;
  fatherId: number | null;
  motherId: number | null;
  geneticLine: string | null;
  breed: string | null;
  status: string;
}

export default function GenealogiaPage() {
  const [pigeons, setPigeons] = useState<Pigeon[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"arvore" | "consanguinidade">("arvore");

  /* consanguinity checker */
  const [checkMale, setCheckMale] = useState("");
  const [checkFemale, setCheckFemale] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/pigeons");
    setPigeons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pigeonMap = useMemo(() => new Map(pigeons.map((p) => [p.id, p])), [pigeons]);
  const selected = selectedId ? pigeonMap.get(selectedId) : null;

  /* get all ancestors with generation depth */
  const getAncestors = useCallback((id: number | null, depth = 0, max = 6): Map<number, number> => {
    const result = new Map<number, number>();
    if (!id || depth >= max) return result;
    const p = pigeonMap.get(id);
    if (!p) return result;
    if (p.fatherId) {
      result.set(p.fatherId, depth + 1);
      getAncestors(p.fatherId, depth + 1, max).forEach((d, aid) => {
        if (!result.has(aid) || result.get(aid)! > d) result.set(aid, d);
      });
    }
    if (p.motherId) {
      result.set(p.motherId, depth + 1);
      getAncestors(p.motherId, depth + 1, max).forEach((d, aid) => {
        if (!result.has(aid) || result.get(aid)! > d) result.set(aid, d);
      });
    }
    return result;
  }, [pigeonMap]);

  /* consanguinity analysis */
  const consanguinity = useMemo(() => {
    if (!checkMale || !checkFemale) return null;
    const mAnc = getAncestors(parseInt(checkMale));
    const fAnc = getAncestors(parseInt(checkFemale));
    mAnc.set(parseInt(checkMale), 0);
    fAnc.set(parseInt(checkFemale), 0);

    const common: { pigeon: Pigeon; genM: number; genF: number }[] = [];
    mAnc.forEach((genM, id) => {
      if (fAnc.has(id)) {
        const p = pigeonMap.get(id);
        if (p) common.push({ pigeon: p, genM, genF: fAnc.get(id)! });
      }
    });

    /* Wright's coefficient approximation: sum (0.5)^(n1+n2+1) for each common ancestor */
    let coefficient = 0;
    for (const c of common) {
      coefficient += Math.pow(0.5, c.genM + c.genF + 1);
    }

    return { common, coefficient: coefficient * 100 };
  }, [checkMale, checkFemale, getAncestors, pigeonMap]);

  /* Tree node component */
  function TreeNode({ id, label, generation }: { id: number | null; label: string; generation: number }) {
    const p = id ? pigeonMap.get(id) : null;
    const sexColor = p?.sex === "macho" ? "border-sky-500/40 bg-sky-500/5" : p?.sex === "femea" ? "border-pink-500/40 bg-pink-500/5" : "border-[#2a3a4a] bg-[#0b1120]";
    return (
      <div className={`rounded-lg border p-2 text-center ${p ? sexColor : "border-dashed border-[#2a3a4a] bg-transparent"}`}>
        <p className="text-[8px] text-slate-500 uppercase">{label}</p>
        {p ? (
          <button onClick={() => setSelectedId(p.id)} className="w-full">
            <p className="text-[11px] font-bold text-white truncate">{p.name || p.ringNumber}</p>
            <p className="text-[8px] text-slate-500 truncate">{p.ringNumber}</p>
            {p.geneticLine && <p className="text-[8px] text-violet-400 truncate">{p.geneticLine}</p>}
          </button>
        ) : (
          <p className="text-[10px] text-slate-600 py-1">Não registrado</p>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
      </div>
    );
  }

  const males = pigeons.filter((p) => p.sex === "macho");
  const females = pigeons.filter((p) => p.sex === "femea");

  /* build 3-generation tree for selected */
  const father = selected?.fatherId ? pigeonMap.get(selected.fatherId) : null;
  const mother = selected?.motherId ? pigeonMap.get(selected.motherId) : null;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Dna className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl font-extrabold text-white">Análise Genealógica</h1>
        </div>
        <p className="text-sm text-slate-400">Árvore de pedigree e verificação de consanguinidade</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab("arvore")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "arvore" ? "bg-violet-500 text-white" : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400"
          }`}
        >
          🌳 Árvore Genealógica
        </button>
        <button
          onClick={() => setTab("consanguinidade")}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
            tab === "consanguinidade" ? "bg-violet-500 text-white" : "bg-[#1a2736] border border-[#2a3a4a] text-slate-400"
          }`}
        >
          ⚠️ Teste de Cruzamento
        </button>
      </div>

      {tab === "arvore" && (
        <>
          {/* Selector */}
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Selecionar pombo</p>
            <select
              value={selectedId ?? ""}
              onChange={(e) => setSelectedId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Escolha um pombo...</option>
              {pigeons.map((p) => (
                <option key={p.id} value={p.id}>{p.ringNumber} {p.name ? `— ${p.name}` : ""}</option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4 overflow-x-auto">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-4">
                Pedigree — 3 gerações
              </p>
              <div className="grid grid-cols-3 gap-3 min-w-[560px]">
                {/* Gen 0 */}
                <div className="flex items-center">
                  <div className="w-full rounded-xl border-2 border-violet-500/50 bg-violet-500/10 p-3 text-center">
                    <p className="text-[9px] text-violet-400 uppercase font-bold mb-1">Pombo</p>
                    <p className="text-sm font-black text-white">{selected.name || selected.ringNumber}</p>
                    <p className="text-[9px] text-slate-500">{selected.ringNumber}</p>
                    <p className="text-[9px] mt-0.5">
                      <span className={selected.sex === "macho" ? "text-sky-400" : "text-pink-400"}>
                        {selected.sex === "macho" ? "♂ Macho" : selected.sex === "femea" ? "♀ Fêmea" : "?"}
                      </span>
                    </p>
                    {selected.breed && <p className="text-[8px] text-slate-500">{selected.breed}</p>}
                  </div>
                </div>
                {/* Gen 1 */}
                <div className="flex flex-col justify-center gap-3">
                  <TreeNode id={selected.fatherId} label="Pai" generation={1} />
                  <TreeNode id={selected.motherId} label="Mãe" generation={1} />
                </div>
                {/* Gen 2 */}
                <div className="flex flex-col justify-center gap-1.5">
                  <TreeNode id={father?.fatherId ?? null} label="Avô paterno" generation={2} />
                  <TreeNode id={father?.motherId ?? null} label="Avó paterna" generation={2} />
                  <TreeNode id={mother?.fatherId ?? null} label="Avô materno" generation={2} />
                  <TreeNode id={mother?.motherId ?? null} label="Avó materna" generation={2} />
                </div>
              </div>
              <p className="text-[10px] text-slate-600 mt-4">
                💡 Cadastre pai e mãe na ficha do pombo para preencher a árvore. Clique em um ancestral para navegar.
              </p>
            </div>
          )}
        </>
      )}

      {tab === "consanguinidade" && (
        <>
          <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3">
              Simular cruzamento — verificar parentesco
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-sky-400 uppercase mb-1.5">♂ Macho</label>
                <select
                  value={checkMale}
                  onChange={(e) => setCheckMale(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Selecionar...</option>
                  {males.map((p) => (
                    <option key={p.id} value={p.id}>{p.ringNumber} {p.name ? `— ${p.name}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-pink-400 uppercase mb-1.5">♀ Fêmea</label>
                <select
                  value={checkFemale}
                  onChange={(e) => setCheckFemale(e.target.value)}
                  className="w-full px-3 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white text-sm focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Selecionar...</option>
                  {females.map((p) => (
                    <option key={p.id} value={p.id}>{p.ringNumber} {p.name ? `— ${p.name}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {consanguinity && (
            <div className={`rounded-2xl p-5 border-2 ${
              consanguinity.coefficient > 12.5
                ? "bg-red-500/10 border-red-500/50"
                : consanguinity.coefficient > 3
                  ? "bg-amber-500/10 border-amber-500/50"
                  : "bg-emerald-500/10 border-emerald-500/50"
            }`}>
              <div className="text-center mb-4">
                {consanguinity.coefficient > 12.5 ? (
                  <>
                    <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                    <p className="text-lg font-black text-red-400">⛔ Cruzamento de risco!</p>
                  </>
                ) : consanguinity.coefficient > 3 ? (
                  <>
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                    <p className="text-lg font-black text-amber-400">⚠️ Consanguinidade moderada</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="text-lg font-black text-emerald-400">✅ Cruzamento seguro</p>
                  </>
                )}
                <p className="text-3xl font-black text-white mt-2">
                  {consanguinity.coefficient.toFixed(2)}%
                </p>
                <p className="text-[10px] text-slate-400 uppercase">Coeficiente de consanguinidade (Wright)</p>
              </div>

              {consanguinity.common.length > 0 ? (
                <div>
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                    Ancestrais em comum ({consanguinity.common.length})
                  </p>
                  <div className="space-y-1.5">
                    {consanguinity.common.map((c) => (
                      <div key={c.pigeon.id} className="flex items-center justify-between px-3 py-2 bg-black/20 rounded-lg text-xs">
                        <span className="font-bold text-white">{c.pigeon.name || c.pigeon.ringNumber}</span>
                        <span className="text-slate-400">
                          {c.genM === 0 ? "é o macho" : `${c.genM}ª ger. ♂`} / {c.genF === 0 ? "é a fêmea" : `${c.genF}ª ger. ♀`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  Nenhum ancestral em comum encontrado nos registros.
                </p>
              )}

              <div className="mt-4 text-[10px] text-slate-500 space-y-0.5">
                <p>• &lt;3%: seguro • 3-12,5%: moderado (linebreeding) • &gt;12,5%: alto risco (inbreeding)</p>
                <p>• A precisão depende do cadastro completo de pais e mães nas fichas.</p>
              </div>
            </div>
          )}
        </>
      )}

      <p className="text-center text-[10px] text-slate-600 mt-8">PigeonMaster AI 2026 — v1 • Genealogia</p>
    </div>
  );
}
