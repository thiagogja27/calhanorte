"use client";

import React, { useState } from 'react';
import { Sparkles, Check, CreditCard, Lock, ShieldCheck } from 'lucide-react';

interface CalhaZapPlanosProps {
  verificarAtivo: () => boolean;
  ativarAcessoPlano: (plano: string) => void;
}

const PLANOS_INFO = {
  mensal: {
    total: 49.90,
    label: 'Semestral',
    periodo: 'mês',
    parcelas: [{ n: 1, v: 49.90, desc: 'à vista' }]
  },
  semestral: {
    total: 239.40,
    label: 'Semestral',
    periodo: 'mês', // 39.90 * 6
    parcelas: [
      { n: 1, v: 239.40, desc: 'à vista' },
      { n: 2, v: 119.70, desc: 'sem juros' },
      { n: 3, v: 79.80, desc: 'sem juros' },
      { n: 6, v: 39.90, desc: 'sem juros' }
    ]
  },
  anual: {
    total: 358.80,
    label: 'Anual',
    periodo: 'mês', // 29.90 * 12
    parcelas: [
      { n: 1, v: 358.80, desc: 'à vista' },
      { n: 3, v: 119.65, desc: 'sem juros' },
      { n: 6, v: 59.80, desc: 'sem juros' },
      { n: 12, v: 29.90, desc: 'sem juros' }
    ]
  }
};

export default function CalhaZapPlanos({ verificarAtivo, ativarAcessoPlano }: CalhaZapPlanosProps) {
  const [selectedPlan, setSelectedPlan] = useState<'mensal' | 'semestral' | 'anual'>('semestral');
  const [emailInput, setEmailInput] = useState('');
  const [parcSel, setParcSel] = useState<number>(0);

  const curPl = PLANOS_INFO[selectedPlan];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRe.test(emailInput)) {
      alert("Por favor, informe um endereço de e-mail válido!");
      return;
    }

    // Activates trial directly in the application
    ativarAcessoPlano(selectedPlan);

    // Call a mock redirect or mock checkout success
    alert(
      `🔒 Redirecionando com segurança ao Stripe Checkout!\n\nEmail preenchido: ${emailInput}\nPlano selecionado: ${selectedPlan.toUpperCase()}\nVocê tem 10 DIAS GRÁTIS de teste antes do primeiro faturamento!`
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
          ⭐ Escolha seu Plano Premium
        </h3>

        <div className="bg-[#5a5c5f] rounded-xl p-4 text-white space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center z-10 relative">
            <div>
              <span className="text-sm font-black text-[#f5c800] font-condensed tracking-wide">
                10 DIAS TOTALMENTE GRÁTIS
              </span>
              <p className="text-[11px] text-zinc-300 font-bold">
                Ative o período de testes grátis e cancele quando quiser.
              </p>
            </div>
            <span className="bg-[#f5c800] text-[#5a5c5f] text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
              TRIAL
            </span>
          </div>

          <div className="grid grid-cols-3 text-center border-t border-[#8a8c8f] pt-3 z-10 relative text-[10px]">
            <div>
              <div className="font-bold text-[#f5c800]">Hoje</div>
              <div className="text-zinc-300">Ativação Grátis</div>
            </div>
            <div className="border-x border-[#8a8c8f]">
              <div className="font-bold text-[#f5c800]">Dias 1–10</div>
              <div className="text-zinc-300">Acesso Premium</div>
            </div>
            <div>
              <div className="font-bold text-zinc-300">Dia 11</div>
              <div className="text-zinc-400">Faturamento</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* MENSAL */}
          <div
            onClick={() => {
              setSelectedPlan('mensal');
              setParcSel(0);
            }}
            className={`cursor-pointer rounded-xl border p-4 text-center transition ${
              selectedPlan === 'mensal' ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-[#6a6a6a]">Mensal</span>
            <div className="text-2xl font-black text-[#1a1a1a] mt-1 font-condensed">
              R$ 49<span className="text-sm font-bold">,90</span>
            </div>
            <span className="text-[10px] text-[#6a6a6a] font-semibold">/ mês</span>
          </div>

          {/* SEMESTRAL */}
          <div
            onClick={() => {
              setSelectedPlan('semestral');
              setParcSel(0);
            }}
            className={`cursor-pointer rounded-xl border p-4 text-center transition relative ${
              selectedPlan === 'semestral' ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
            }`}
          >
            <span className="absolute top-[-9px] left-1/2 -translate-x-1/2 bg-[#5a5c5f] text-[#f5c800] text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
              POPULAR
            </span>
            <span className="text-[9px] uppercase font-bold text-[#6a6a6a]">Semestral</span>
            <div className="text-2xl font-black text-[#1a1a1a] mt-1 font-condensed">
              R$ 39<span className="text-sm font-bold">,90</span>
            </div>
            <span className="text-[10px] text-[#6a6a6a] font-semibold">/ mês (R$239,40)</span>
            <div className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 mt-2 rounded inline-block">
              ECONOMIZE 20%
            </div>
          </div>

          {/* ANUAL */}
          <div
            onClick={() => {
              setSelectedPlan('anual');
              setParcSel(0);
            }}
            className={`cursor-pointer rounded-xl border p-4 text-center transition ${
              selectedPlan === 'anual' ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
            }`}
          >
            <span className="text-[9px] uppercase font-bold text-[#6a6a6a]">Anual</span>
            <div className="text-2xl font-black text-[#1a1a1a] mt-1 font-condensed">
              R$ 29<span className="text-sm font-bold">,90</span>
            </div>
            <span className="text-[10px] text-[#6a6a6a] font-semibold">/ mês (R$358,80)</span>
            <div className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 mt-2 rounded inline-block">
              ECONOMIZE 40%
            </div>
          </div>
        </div>

        <div className="p-3 bg-[#c8c9cb] border border-[#b0b2b5] rounded-xl text-center text-xs font-bold text-[#3a3a3a]">
          {selectedPlan === 'mensal' && 'Cobrança Mensal recorrente direta: R$ 49,90'}
          {selectedPlan === 'semestral' && 'Cobrança Semestral total recorrente: R$ 239,40'}
          {selectedPlan === 'anual' && 'Cobrança Anual total recorrente: R$ 358,80'}
        </div>
      </div>

      {curPl.parcelas.length > 1 && (
        <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-4 shadow-sm">
          <span className="text-xs font-bold text-[#5a5c5f] uppercase tracking-wider block mb-3">
            💳 Parcelamento de Faturamento (Sem Juros)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {curPl.parcelas.map((parc, index) => (
              <button
                key={index}
                onClick={() => setParcSel(index)}
                className={`py-2 px-3 border rounded-xl font-bold flex flex-col justify-center items-center transition ${
                  parcSel === index ? 'border-[#e0b400] bg-[#fff9c4]' : 'border-[#b0b2b5] bg-white'
                }`}
              >
                <div className="text-[10px] text-[#6a6a6a]">{parc.n}x</div>
                <div className="text-base font-black text-[#5a5c5f] font-condensed">
                  R$ {parc.v.toFixed(2)}
                </div>
                <div className="text-[9px] text-zinc-500 font-bold">{parc.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="bg-white rounded-2xl border border-[#b0b2b5] p-5 space-y-4 shadow-sm">
        <h4 className="font-extrabold text-sm text-[#1a1a1a] flex items-center gap-1.5 border-b border-[#b0b2b5] pb-2 text-[#5a5c5f] uppercase tracking-wider">
          🔒 Ativação Segura em 10 Segundos
        </h4>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#3a3a3a]">Seu Endereço de E-mail de Faturamento</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="informe seu e-mail"
            className="w-full bg-[#f2f3f4] border border-[#b0b2b5] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] outline-none"
            required
          />
          <span className="text-[10px] text-[#6a6a6a] font-normal block leading-tight">
            Seus cupons, notas de faturamento e chaves de licença Stripe serão despachados com exclusividade para este endereço de correspondência física.
          </span>
        </div>

        <div className="bg-[#fff9c4] rounded-lg p-3 text-xs leading-normal font-bold text-[#5a4400] space-y-1">
          <div>📝 Extrato do Checkout Hoje:</div>
          <div className="font-medium">
            ✅ R$ 0,00 Cobrado Imediatamente (Trial de 10 dias ativo)<br />
            💳 Dia 11: Primeiro faturamento de{' '}
            <strong>
              {selectedPlan === 'mensal'
                ? 'R$ 49,90/mês'
                : selectedPlan === 'semestral'
                ? '6 parcelas de R$ 39,90 sem impostos'
                : '12 parcelas de R$ 29,90 sem impostos'}
            </strong>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#f5c800] border-2 border-[#e0b400] hover:bg-[#e0b400] py-3.5 px-4 font-black text-sm text-[#5a5c5f] rounded-xl transition flex items-center justify-center gap-2 shadow cursor-pointer shadow-amber-500/10"
        >
          <CreditCard className="w-5 h-5 shrink-0" />
          <span>Ativar Trial de 10 Dias Grátis no Stripe</span>
        </button>

        <div className="text-[10px] text-[#6a6a6a] text-center max-w-sm mx-auto leading-relaxed pt-2">
          Stripe® Payment Links — Criptografia de nível bancário TLS 1.3 / Padrão PCI-DSS Nível 1. Seus dados de cartão financeiro nunca trafegam por nossos ambientes servidores.
        </div>

        <div className="flex gap-4 justify-center items-center text-[10px] font-bold text-[#8a8c8f] shrink-0 border-t border-[#b0b2b5] pt-3">
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>CRIPTO SSL</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PCI-DSS SEGURO</span>
          </div>
        </div>
      </form>
    </div>
  );
}
