"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Save,
  Download,
  Upload,
  Copy,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  FileJson,
  HardDrive,
} from "lucide-react";

interface BackupData {
  meta: { app: string; version: number; createdAt: string };
  data: Record<string, unknown[]>;
}

const TABLE_LABELS: Record<string, string> = {
  pigeons: "Pombos",
  breedingPairs: "Casais",
  eggs: "Ovos",
  chicks: "Filhotes",
  healthRecords: "Saúde",
  vaccinations: "Vacinas",
  foods: "Alimentos",
  mixtures: "Misturas",
  feedings: "Alimentações",
  trainings: "Treinos",
  competitions: "Provas",
  results: "Resultados",
  transactions: "Financeiro",
  inventory: "Estoque",
  aiRecommendations: "Recomendações IA",
  widowhoodPairs: "Viuvez",
  settings: "Configurações",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BackupPage() {
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [backupJson, setBackupJson] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBackup = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backup");
      const data = await res.json();
      setBackup(data);
      setBackupJson(JSON.stringify(data));
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBackup(); }, [fetchBackup]);

  const backupSize = backupJson ? new Blob([backupJson]).size : 0;

  /* ─── download ─── */
  function downloadBackup() {
    if (!backupJson) return;
    const blob = new Blob([backupJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pigeonmaster-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── copy ─── */
  async function copyBackup() {
    try {
      await navigator.clipboard.writeText(backupJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  }

  /* ─── share ─── */
  async function shareBackup() {
    const dateStr = new Date().toISOString().slice(0, 10);
    const file = new File([backupJson], `pigeonmaster-backup-${dateStr}.json`, { type: "application/json" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Backup PigeonMaster" });
      } catch { /* cancelled */ }
    } else {
      downloadBackup();
    }
  }

  /* ─── restore ─── */
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    setRestoreMsg(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data) {
        setRestoreMsg({ type: "error", text: "Arquivo inválido — não é um backup do PigeonMaster." });
        setRestoring(false);
        return;
      }
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (res.ok) {
        setRestoreMsg({ type: "ok", text: "✅ Backup restaurado com sucesso! Todos os dados foram recuperados." });
        fetchBackup();
      } else {
        setRestoreMsg({ type: "error", text: "Falha ao restaurar. Verifique o arquivo." });
      }
    } catch {
      setRestoreMsg({ type: "error", text: "Arquivo inválido ou corrompido." });
    }
    setRestoring(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  /* ─── reset ─── */
  async function handleReset() {
    setResetting(true);
    try {
      const res = await fetch("/api/backup/reset", { method: "POST" });
      if (res.ok) {
        setShowResetConfirm(false);
        fetchBackup();
      }
    } catch { /* ignore */ }
    setResetting(false);
  }

  const counts = backup?.data
    ? Object.fromEntries(Object.entries(backup.data).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]))
    : {};

  const mainStats = [
    { key: "pigeons", emoji: "🐦" },
    { key: "competitions", emoji: "🏁" },
    { key: "breedingPairs", emoji: "💑" },
    { key: "healthRecords", emoji: "❤️" },
    { key: "trainings", emoji: "🏋️" },
    { key: "vaccinations", emoji: "💉" },
    { key: "transactions", emoji: "💰" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center -m-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white -m-6 p-6 md:p-8">
      {/* ─── Header ─── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">💾</span>
          <h1 className="text-2xl font-extrabold text-white">Backup & Restauração</h1>
        </div>
        <p className="text-sm text-slate-400">Proteja seus dados</p>
      </div>

      {/* ─── Dados do backup ─── */}
      <div className="bg-[#1a2736] border-2 border-yellow-500/40 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">Dados do backup</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {mainStats.map((stat) => (
            <div key={stat.key} className="bg-[#0b1120] border border-[#2a3a4a] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <span>{stat.emoji}</span>
                {TABLE_LABELS[stat.key]}
              </span>
              <span className="text-lg font-black text-yellow-400">{counts[stat.key] ?? 0}</span>
            </div>
          ))}
          {/* size */}
          <div className="bg-[#0b1120] border border-yellow-500/30 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-2">
              <FileJson className="w-3.5 h-3.5" />
              Tamanho
            </span>
            <span className="text-lg font-black text-yellow-400">{formatSize(backupSize)}</span>
          </div>
        </div>
      </div>

      {/* ─── Fazer Backup ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Fazer Backup</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Salve no Google Drive, WhatsApp ou e-mail.
        </p>

        <button
          onClick={downloadBackup}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2 mb-3"
        >
          <Download className="w-4 h-4" />
          Baixar Backup ({formatSize(backupSize)})
        </button>

        <button
          onClick={copyBackup}
          className="w-full py-3 bg-[#0b1120] border border-[#2a3a4a] hover:border-slate-500 text-slate-300 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 mb-3"
        >
          {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado para a área de transferência!" : "Copiar dados para compartilhar"}
        </button>

        <button
          onClick={shareBackup}
          className="w-full py-3 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          📤 Google Drive • WhatsApp • Qualquer app — Enviar
        </button>
      </div>

      {/* ─── Restaurar Backup ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Restaurar Backup</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Selecione o arquivo .json que salvou anteriormente.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
          id="backup-file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={restoring}
          className="w-full py-4 bg-transparent border-2 border-dashed border-blue-500/40 hover:border-blue-500/70 hover:bg-blue-500/5 text-blue-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {restoring ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Restaurando...
            </>
          ) : (
            <>
              📁 Selecionar arquivo de backup
            </>
          )}
        </button>

        {restoreMsg && (
          <div className={`mt-3 px-4 py-3 rounded-xl border text-xs font-semibold ${
            restoreMsg.type === "ok"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>
            {restoreMsg.text}
          </div>
        )}
      </div>

      {/* ─── Status dos dados ─── */}
      <div className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Save className="w-4 h-4 text-slate-300" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Status dos dados</span>
        </div>
        <div className="space-y-1.5">
          {Object.entries(TABLE_LABELS).map(([key, label]) => {
            const count = counts[key] ?? 0;
            const hasData = count > 0;
            return (
              <div key={key} className="flex items-center justify-between px-3 py-2 bg-[#0b1120] rounded-lg">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hasData ? "bg-emerald-500" : "bg-slate-600"}`} />
                  {label}
                  {hasData && <span className="text-slate-600">({count})</span>}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  hasData
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-slate-700/50 text-slate-500"
                }`}>
                  {hasData ? "✓ Salvo" : "Vazio"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Download do código-fonte ─── */}
      <div className="bg-[#1a2736] border border-violet-500/30 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileJson className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Código-fonte do Projeto</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Baixe o projeto completo (limpo, pronto para subir no GitHub e publicar na Vercel/Netlify).
        </p>
        <a
          href="/pigeonmaster-projeto.zip"
          download
          className="block w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-black text-sm transition-colors text-center"
        >
          📦 Baixar Projeto Completo (.zip)
        </a>
      </div>

      {/* ─── Reset (danger zone) ─── */}
      <div className="bg-[#1a2736] border border-red-500/30 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Resetar App</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Apaga tudo. Faça backup antes! Esta ação não pode ser desfeita.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 bg-transparent border border-red-500/40 hover:bg-red-500/10 text-red-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Resetar
          </button>
        ) : (
          <div className="space-y-3">
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/40 rounded-xl">
              <p className="text-xs font-bold text-red-400 mb-1">⚠️ Tem certeza absoluta?</p>
              <p className="text-[11px] text-red-300/70">
                Todos os pombos, provas, casais, saúde, financeiro e configurações serão apagados permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 bg-[#0b1120] border border-[#2a3a4a] text-slate-400 rounded-xl font-bold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
              >
                {resetting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {resetting ? "Apagando..." : "Sim, apagar tudo"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <p className="text-center text-[10px] text-slate-600 mt-8">
        PigeonMaster AI 2026 — v1 • Módulo Backup • Segurança
      </p>
    </div>
  );
}
