"use client";

import { useEffect, useState } from "react";
import { Package, AlertTriangle, Pill, Wheat, FlaskConical, Syringe, Wrench } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  minStock: string | null;
  expirationDate: string | null;
  batchNumber: string | null;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const res = await fetch("/api/inventory");
    const data = await res.json();
    setItems(data);
  }

  const lowStock = items.filter((i) => i.minStock && parseFloat(i.quantity) <= parseFloat(i.minStock));
  const expiring = items.filter((i) => i.expirationDate && new Date(i.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const categoryIcons: Record<string, React.ElementType> = {
    medicamentos: Pill,
    racoes: Wheat,
    vitaminas: FlaskConical,
    suplementos: FlaskConical,
    vacinas: Syringe,
    materiais: Wrench,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estoque</h1>
          <p className="text-slate-500">Controle de medicamentos, rações e suprimentos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-sm text-slate-500">Itens</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{lowStock.length}</p>
              <p className="text-sm text-slate-500">Estoque Baixo</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expiring.length}</p>
              <p className="text-sm text-slate-500">Vencendo</p>
            </div>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Alertas de Estoque Baixo
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item.id} className="px-3 py-1 bg-white text-red-700 rounded-full text-sm border border-red-200">
                {item.name}: {formatNumber(item.quantity, 2)} {item.unit}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Itens em Estoque</h2>
        </div>
        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhum item em estoque</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Item</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Categoria</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Quantidade</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Validade</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-700">Lote</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const isLow = item.minStock && parseFloat(item.quantity) <= parseFloat(item.minStock);
                const isExpiring = item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                const Icon = categoryIcons[item.category] || Package;
                return (
                  <tr key={item.id} className={`hover:bg-slate-50 ${isLow ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{item.category}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${isLow ? "text-red-600" : ""}`}>
                        {formatNumber(item.quantity, 2)} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={isExpiring ? "text-amber-600 font-medium" : "text-slate-600"}>
                        {formatDate(item.expirationDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.batchNumber || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
