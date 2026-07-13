"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bird, UserPlus, RefreshCw } from "lucide-react";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/planos");
        router.refresh();
      } else {
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
      }
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-yellow-500 rounded-2xl items-center justify-center mb-3">
            <Bird className="w-9 h-9 text-[#0b1120]" />
          </div>
          <h1 className="text-2xl font-black text-white">Criar Conta</h1>
          <p className="text-sm text-slate-400">Comece grátis — sem cartão de crédito</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a2736] border border-[#2a3a4a] rounded-2xl p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Seu nome
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João da Silva"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Senha (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#0b1120] border border-[#2a3a4a] rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-[#0b1120] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Criando conta..." : "Criar Conta Grátis"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-yellow-400 font-bold hover:text-yellow-300">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
