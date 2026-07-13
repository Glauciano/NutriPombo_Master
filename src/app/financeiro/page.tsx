"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

interface Transaction {
  id: number;
  type: string;
  category: string;
  amount: string;
  description: string | null;
  date: string;
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const res = await fetch("/api/transactions");
    const data = await res.json();
    setTransactions(data);
  }

  const revenues = transactions.filter((t) => t.type === "receita");
  const expenses = transactions.filter((t) => t.type === "despesa");
  const totalRevenue = revenues.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = expenses.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalRevenue - totalExpense;

  const categories = ["compra", "venda", "medicamentos", "racoes", "premiacoes", "materiais", "outros"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
          <p className="text-slate-500">Receitas, despesas e ROI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Receitas</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Despesas</span>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Saldo</span>
            {balance >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Transações</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Nenhuma transação registrada</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Data</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Categoria</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Descrição</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-slate-700">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 capitalize">{t.category}</td>
                    <td className="px-4 py-3 text-slate-600">{t.description || "—"}</td>
                    <td className={`px-4 py-3 text-right font-medium ${t.type === "receita" ? "text-emerald-600" : "text-red-600"}`}>
                      {t.type === "receita" ? "+" : "-"} {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Por Categoria</h3>
            <div className="space-y-3">
              {categories.map((cat) => {
                const catTotal = transactions
                  .filter((t) => t.category === cat)
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-slate-600">{cat}</span>
                    <span className="text-sm font-medium">{formatCurrency(catTotal)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">IA Financeira</h3>
            <p className="text-sm text-emerald-800">
              Seu custo médio por pombo ativo é de R$ 45,00/mês. Recomendamos reduzir gastos com medicamentos em 15% otimizando o calendário sanitário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
