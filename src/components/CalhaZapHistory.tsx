"use client";

import React, { useState } from 'react';
import { Search, Calendar, CreditCard, Printer, Trash2, Edit3, DollarSign } from 'lucide-react';

interface CalhaZapHistoryProps {
  quotes: any[];
  onToggleStatus: (id: string, status: string) => void;
  onDeleteQuote: (id: string) => void;
  onEditLoad: (quote: any) => void;
  onPrintQuote: (quote: any) => void;
}

export default function CalhaZapHistory({
  quotes,
  onToggleStatus,
  onDeleteQuote,
  onEditLoad,
  onPrintQuote
}: CalhaZapHistoryProps) {
  const [search, setSearch] = useState('');

  const filteredQuotes = quotes.filter(q => {
    return (
      (q.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.customerAddress || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.id || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex bg-white rounded-xl border border-[#b0b2b5] px-3.5 py-2.5 items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por cliente, endereço ou número do orçamento..."
          className="w-full text-xs text-[#1a1a1a] outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="text-center p-12 bg-[#f2f3f4] border border-dashed border-[#b0b2b5] rounded-2xl text-[#6a6a6a] text-xs font-semibold uppercase tracking-wider">
            📁 Nenhum orçamento salvo no histórico de nuvem desta oficina.
          </div>
        ) : (
          filteredQuotes.map((q) => {
            const isPaid = q.status === 'pago';
            return (
              <div
                key={q.id}
                className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#5a5c5f] text-[#f5c800] text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded font-mono">
                      {q.id}
                    </span>
                    <button
                      onClick={() => onToggleStatus(q.id, isPaid ? 'pendente' : 'pago')}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-0.5 transition btn-click cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-zinc-200 text-zinc-700 border border-zinc-400'
                      }`}
                    >
                      <DollarSign className="w-2.5 h-2.5 shrink-0" />
                      <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                    </button>
                    <span className="text-[10px] text-[#6a6a6a] font-bold flex items-center gap-1 ml-auto sm:ml-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {q.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1a1a1a]">{q.customerName}</h4>
                    {q.customerAddress && (
                      <p className="text-[11px] text-[#6a6a6a] font-semibold">{q.customerAddress}</p>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-[#3a3a3a] flex gap-3 text-zinc-500">
                    <span>💲 Total: <strong className="text-zinc-800 text-xs">R$ {q.total.toFixed(2)}</strong></span>
                    <span>🏷️ Desconto: {q.discountPercent}%</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 justify-end font-bold text-xs shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#b0b2b5]">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onPrintQuote(q)}
                      className="flex-1 sm:flex-none p-2 bg-white border border-[#b0b2b5] text-[#5a5c5f] hover:bg-zinc-100 rounded-lg transition text-[10px] flex items-center justify-center gap-1 hover:text-black cursor-pointer"
                      title="Ver PDF Papel Timbrado"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:inline">Imprimir</span>
                    </button>

                    <button
                      onClick={() => onEditLoad(q)}
                      className="flex-1 sm:flex-none p-2 bg-white border border-[#b0b2b5] text-[#3a3a3a] hover:bg-zinc-100 rounded-lg transition text-[10px] flex items-center justify-center gap-1 hover:text-black cursor-pointer"
                      title="Editar e recalcular"
                    >
                      <Edit3 className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:inline">Editar</span>
                    </button>

                    <button
                      onClick={() => onDeleteQuote(q.id)}
                      className="p-2 bg-white border border-[#b0b2b5] text-[#c62828] hover:bg-red-50 rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                      title="Deletar orçamento do registro"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
