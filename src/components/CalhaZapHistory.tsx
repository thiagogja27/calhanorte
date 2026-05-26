"use client";

import React, { useState } from 'react';
import { Search, Calendar, CreditCard, Printer, Trash2, Edit3, DollarSign, Send } from 'lucide-react';

interface CalhaZapHistoryProps {
  quotes: any[];
  onToggleStatus: (id: string, status: string) => void;
  onDeleteQuote: (id: string) => void;
  onEditLoad: (quote: any) => void;
  onPrintQuote: (quote: any) => void;
  companyName?: string;
}

export default function CalhaZapHistory({
  quotes,
  onToggleStatus,
  onDeleteQuote,
  onEditLoad,
  onPrintQuote,
  companyName = "Oficina de Calhas"
}: CalhaZapHistoryProps) {
  const [search, setSearch] = useState('');

  const formatQuoteWhatsApp = (q: any, company: string) => {
    let text = `*📄 PROPOSTA COMERCIAL: ${q.id}*\n`;
    text += `*${company}*\n`;
    text += `-------------------------------------------\n`;
    text += `*Cliente:* ${q.customerName || 'Não Informado'}\n`;
    text += `*Data:* ${q.date || ''}\n`;
    if (q.customerAddress) {
      text += `*Endereço:* ${q.customerAddress}\n`;
    }
    text += `-------------------------------------------\n`;
    text += `*DETALHES DA SOLICITAÇÃO:*\n`;

    if (q.telhas && q.telhas.length > 0) {
      q.telhas.forEach((it: any) => {
        text += `🔹 telha ${it.type || ''} (${it.material || ''}) - Qtd: ${it.qty || 1}un | R$ ${it.total?.toFixed(2)}\n`;
      });
    }
    if (q.calhas && q.calhas.length > 0) {
      q.calhas.forEach((it: any) => {
        text += `🔹 calha ${it.type || ''} (Corte ${it.cut || 280}mm | Esp ${it.thick || '0,43'}mm) - Comprim: ${it.len || 0}m | Qtd: ${it.qty || 1}un | R$ ${it.total?.toFixed(2)}\n`;
      });
    }
    if (q.rufos && q.rufos.length > 0) {
      q.rufos.forEach((it: any) => {
        text += `🔹 rufo ${it.type || ''} (Corte ${it.cut || 250}mm | Esp ${it.thick || '0,43'}mm) - Comprim: ${it.len || 0}m | Qtd: ${it.qty || 1}un | R$ ${it.total?.toFixed(2)}\n`;
      });
    }
    if (q.condutores && q.condutores.qtd > 0) {
      text += `🔹 condutor ${q.condutores.desc || ''} - Qtd: ${q.condutores.qtd || 1}un | R$ ${q.condutores.total?.toFixed(2)}\n`;
    }
    if (q.chamines && q.chamines.length > 0) {
      q.chamines.forEach((it: any) => {
        if (it.qtd > 0) {
          text += `🔹 chaminé ${it.desc || ''} (${it.specs || ''}) - Qtd: ${it.qtd}un | R$ ${it.total?.toFixed(2)}\n`;
        }
      });
    }
    if (q.coifas && q.coifas.length > 0) {
      q.coifas.forEach((it: any) => {
        if (it.qtd > 0) {
          text += `🔹 coifa ${it.desc || ''} (${it.specs || ''}) - Qtd: ${it.qtd}un | R$ ${it.total?.toFixed(2)}\n`;
        }
      });
    }
    if (q.puQty > 0) {
      text += `🔹 vedação PU-40 Bisnagas - Qtd: ${q.puQty}un | R$ ${(q.puQty * q.puPrice)?.toFixed(2)}\n`;
    }
    if (q.laborPrice > 0) {
      text += `⚙️ Mão de Obra / Serviço Técnico: R$ ${q.laborPrice?.toFixed(2)}\n`;
    }

    text += `-------------------------------------------\n`;
    text += `*SUBTOTAL:* R$ ${q.subtotal?.toFixed(2)}\n`;
    if (q.discountPercent > 0) {
      text += `*DESCONTO (${q.discountPercent}%):* -R$ ${q.discountAmount?.toFixed(2)}\n`;
    }
    text += `*💰 TOTAL DA PROPOSTA:* R$ ${q.total?.toFixed(2)}\n`;
    if (q.notes) {
      text += `\n*Garantia / Observações:* ${q.notes}\n`;
    }
    text += `-------------------------------------------\n`;
    text += `_Aguardamos sua aprovação para iniciar a fabricação!_`;
    return text;
  };

  const getWhatsAppUrl = (phone: string, text: string) => {
    let cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length > 0) {
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        if (!cleanPhone.startsWith('55')) {
          cleanPhone = '55' + cleanPhone;
        }
      }
    }
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  };

  const filteredQuotes = quotes.filter(q => {
    return (
      (q.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.customerAddress || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.id || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex bg-white dark:bg-zinc-900 rounded-xl border border-[#b0b2b5] dark:border-zinc-800 px-3.5 py-2.5 items-center gap-3">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por cliente, endereço ou número do orçamento..."
          className="w-full text-xs text-[#1a1a1a] dark:text-zinc-100 bg-transparent outline-none"
        />
      </div>

      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <div className="text-center p-12 bg-[#f2f3f4] dark:bg-zinc-900/55 border border-dashed border-[#b0b2b5] dark:border-zinc-800 rounded-2xl text-[#6a6a6a] dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            📁 Nenhum orçamento salvo no histórico de nuvem desta oficina.
          </div>
        ) : (
          filteredQuotes.map((q) => {
            const isPaid = q.status === 'pago';
            return (
              <div
                key={q.id}
                className="bg-[#f2f3f4] dark:bg-zinc-900/40 rounded-2xl border border-[#b0b2b5] dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#5a5c5f] dark:bg-zinc-800 text-[#f5c800] dark:text-amber-400 border dark:border-amber-400/20 text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded font-mono">
                      {q.id}
                    </span>
                    <button
                      onClick={() => onToggleStatus(q.id, isPaid ? 'pendente' : 'pago')}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-0.5 transition btn-click cursor-pointer ${
                        isPaid
                           ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                           : 'bg-zinc-250 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-400 dark:border-zinc-700'
                      }`}
                    >
                      <DollarSign className="w-2.5 h-2.5 shrink-0" />
                      <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                    </button>
                    <span className="text-[10px] text-[#6a6a6a] dark:text-zinc-400 font-bold flex items-center gap-1 ml-auto sm:ml-0">
                      <Calendar className="w-3.5 h-3.5 mt-[-2px]" />
                      {q.date}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[#1a1a1a] dark:text-zinc-100">{q.customerName}</h4>
                    {q.customerAddress && (
                      <p className="text-[11px] text-[#6a6a6a] dark:text-zinc-400 font-semibold">{q.customerAddress}</p>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-[#3a3a3a] dark:text-zinc-300 flex gap-3">
                    <span>💲 Total: <strong className="text-zinc-800 dark:text-emerald-400 text-xs">R$ {q.total.toFixed(2)}</strong></span>
                    <span>🏷️ Desconto: {q.discountPercent}%</span>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 justify-end font-bold text-xs shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#b0b2b5] dark:border-zinc-800">
                  <div className="flex gap-2">
                    <a
                      href={getWhatsAppUrl(q.customerPhone, formatQuoteWhatsApp(q, companyName))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none p-2 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer font-bold"
                      title="Enviar orçamento direto para o WhatsApp do cliente"
                    >
                      <Send className="w-3.5 h-3.5 shrink-0" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      onClick={() => onPrintQuote(q)}
                      className="flex-1 sm:flex-none p-2 bg-white dark:bg-zinc-800 border border-[#b0b2b5] dark:border-zinc-700 text-[#5a5c5f] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition text-[10px] flex items-center justify-center gap-1 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Ver PDF Papel Timbrado"
                    >
                      <Printer className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:inline">Imprimir</span>
                    </button>

                    <button
                      onClick={() => onEditLoad(q)}
                      className="flex-1 sm:flex-none p-2 bg-white dark:bg-zinc-800 border border-[#b0b2b5] dark:border-zinc-700 text-[#3a3a3a] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition text-[10px] flex items-center justify-center gap-1 hover:text-black dark:hover:text-white cursor-pointer"
                      title="Editar e recalcular"
                    >
                      <Edit3 className="w-3.5 h-3.5 shrink-0" />
                      <span className="sm:inline">Editar</span>
                    </button>

                    <button
                      onClick={() => onDeleteQuote(q.id)}
                      className="p-2 bg-white dark:bg-zinc-800 border border-[#b0b2b5] dark:border-zinc-700 text-[#c62828] dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition text-[10px] flex items-center justify-center gap-1 cursor-pointer"
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
