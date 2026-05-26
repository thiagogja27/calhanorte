"use client";

import React, { useState, useEffect } from 'react';
import { Scissors, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CalhaZapCorteProps {
  verificarAtivo: () => boolean;
  exibirLock: (ttl: string, sub: string) => void;
}

export default function CalhaZapCorte({ verificarAtivo, exibirLock }: CalhaZapCorteProps) {
  const [bMat, setBMat] = useState('Galvalume #26');
  const [bPeso, setBPeso] = useState<number>(335);
  const [bLMode, setBLMode] = useState<'1200' | '1000' | '900' | 'Outra'>('1200');
  const [bLCust, setBLCust] = useState<number>(1200);

  // 5 cuts values (mm)
  const [cuts, setCuts] = useState<number[]>([300, 300, 200, 200, 200]);

  const getMotherWidth = (): number => {
    if (bLMode === 'Outra') return bLCust || 1200;
    return parseInt(bLMode) || 1200;
  };

  const getDensity = (): number => {
    return bMat.includes('Alumínio') || bMat.includes('Aluminio') ? 2.7 : 8.0;
  };

  const totalCutsWidth = cuts.reduce((a, b) => a + b, 0);
  const lt = getMotherWidth();
  const leftover = lt - totalCutsWidth;

  const handleCutChange = (index: number, val: number) => {
    if (!verificarAtivo()) {
      exibirLock(
        'Cadastre o cartão para usar o Plano de Corte',
        'O Plano de Corte de bobinas requer ativação do <strong>teste grátis de 10 dias</strong>. Sem cobrança agora!'
      );
      return;
    }
    const nCuts = [...cuts];
    nCuts[index] = Math.max(0, val);
    setCuts(nCuts);
  };

  const colors = ['#1565C0', '#2E7D32', '#E65100', '#6A1B9A', '#00838F'];

  const cutsCalculated = cuts.map((l, i) => {
    if (l <= 0 || bPeso <= 0 || lt <= 0) {
      return { width: l, pct: 0, weight: 0, length: 0 };
    }
    const pt = (l / lt) * bPeso;
    const ct = pt / ((l / 1000) * getDensity());
    return {
      width: l,
      pct: (l / lt) * 100,
      weight: pt,
      length: ct
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#5a5c5f] dark:text-zinc-300 uppercase tracking-wider mb-4 flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
          🏭 Dados da Bobina Mãe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-400">Material Comercial</label>
            <select
              value={bMat}
              onChange={(e) => setBMat(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 font-bold outline-none"
            >
              <option>Galvalume #26</option>
              <option>Galvalume #28</option>
              <option>Galvanizado #26</option>
              <option>Galvanizado #28</option>
              <option>Pré-pintado #28</option>
              <option>Alumínio Calheiro</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-650 dark:text-zinc-400">Peso Total Bobina (kg)</label>
            <input
              type="number"
              value={bPeso || ""}
              onChange={(e) => setBPeso(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="Ex: 335"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 font-extrabold outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 mt-4">
          <label className="text-xs font-bold text-zinc-650 dark:text-zinc-400">Largura Nominal da Bobina (mm)</label>
          <div className="flex gap-2 flex-wrap">
            {['1200', '1000', '900', 'Outra'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBLMode(preset as any)}
                className={`flex-1 py-2 px-3 text-xs font-bold border rounded-lg transition cursor-pointer ${
                  bLMode === preset
                    ? 'border-[#e0b400] bg-[#f5c800] text-zinc-900'
                    : 'border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          {bLMode === 'Outra' && (
            <input
              type="number"
              value={bLCust || ""}
              onChange={(e) => setBLCust(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="Largura em mm"
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 mt-2 rounded-xl px-3 py-2 text-sm text-zinc-805 dark:text-zinc-100 font-bold outline-none"
            />
          )}
        </div>
      </div>

      {bMat.includes('Alumínio') && (
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 text-sky-900 dark:text-sky-300 rounded-xl p-3.5 text-xs flex gap-2.5">
          <div className="text-lg">ℹ️</div>
          <div>
            <strong>Alumínio:</strong> Coeficiente 2,7 kg/dm³ — consideravelmente mais leve que o aço (8,0 kg/dm³). O comprimento de metros lineares de tira será consideravelmente maior para o mesmo peso configurado.
          </div>
        </div>
      )}

      <div className="bg-zinc-100 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-[#5a5c5f] dark:text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
          ✂️ Relação de Fitas (Espaçamento)
        </h3>
        <p className="text-[11px] text-[#6a6a6a] dark:text-zinc-400 font-semibold mb-4">
          Defina as larguras das fitas de corte em <strong>milímetros (mm)</strong>. A soma das fitas deve ser menor ou igual a {lt}mm.
        </p>

        <div className="space-y-4">
          {cuts.map((wVal, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <div
                className="col-span-1 h-7 w-7 rounded-full flex items-center justify-center font-bold text-white text-xs"
                style={{ backgroundColor: colors[i] }}
              >
                {i + 1}
              </div>
              <div className="col-span-5 relative">
                <input
                  type="number"
                  value={wVal || ""}
                  onChange={(e) => handleCutChange(i, parseInt(e.target.value) || 0)}
                  placeholder="Largura mm"
                  className="w-full bg-white border border-[#b0b2b5] rounded-lg px-3 py-1.5 text-xs outline-none"
                />
                <span className="absolute right-3 top-2 text-[10px] text-[#6a6a6a] font-bold">mm</span>
              </div>
              <div className="col-span-3 text-center bg-[#c8c9cb] rounded-lg py-1 px-2 text-[11px] font-bold">
                {cutsCalculated[i].weight > 0 ? `${cutsCalculated[i].weight.toFixed(1)}kg` : '—'}
              </div>
              <div className="col-span-3 text-center bg-[#fff9c4] rounded-lg py-1 px-2 text-[11px] font-bold text-[#633806]">
                {cutsCalculated[i].length > 0 ? `${cutsCalculated[i].length.toFixed(1)}m` : '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#b0b2b5] pt-4 mt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#3a3a3a]">
            <span>Uso de Largura Bobina:</span>
            <span className="font-mono text-[#1a1a1a]">
              {totalCutsWidth} / {lt} mm
            </span>
          </div>

          <div className="w-full bg-[#c8c9cb] h-3.5 rounded-full overflow-hidden relative flex">
            {cuts.map((wVal, i) => {
              const widthPct = (wVal / lt) * 100;
              if (wVal <= 0) return null;
              return (
                <div
                  key={i}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: colors[i]
                  }}
                  className="h-full border-r border-[#ffffff33] text-[9px] text-white flex items-center justify-center font-bold"
                  title={`C${i + 1}: ${wVal}mm`}
                >
                  C{i + 1}
                </div>
              );
            })}
          </div>

          <div className="text-xs font-bold mt-1">
            {totalCutsWidth > lt ? (
              <div className="text-[#c62828] flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Risco Crítico: Sobrecarga ultrapassa largura nominal da bobina!</span>
              </div>
            ) : totalCutsWidth === lt ? (
              <div className="text-[#2e7d32] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Excelente! 100% da bobina será aproveitada de forma limpa.</span>
              </div>
            ) : (
              <div className="text-[#d97706] flex items-center gap-1">
                <span>🔸 Largura restante para sobras: {leftover} mm</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {totalCutsWidth > 0 && totalCutsWidth <= lt && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-250 dark:border-zinc-805 p-5 shadow-sm">
          <h3 className="text-xs font-black text-[#5a5c5f] dark:text-zinc-300 uppercase tracking-wider mb-2">
            📊 Resumo do Corte Slitting
          </h3>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#5a5c5f] dark:bg-zinc-800 text-[#f5c800] dark:text-amber-400 uppercase text-[10px]">
                <th className="p-2 border border-zinc-250 dark:border-zinc-700">Fita / Corte</th>
                <th className="p-2 border border-zinc-250 dark:border-zinc-700 text-center">Larg. (mm)</th>
                <th className="p-2 border border-zinc-250 dark:border-zinc-700 text-right">Peso Est.</th>
                <th className="p-2 border border-zinc-250 dark:border-zinc-700 text-right">M. Lineares</th>
                <th className="p-2 border border-zinc-250 dark:border-zinc-700 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {cuts.map((wVal, i) => {
                if (wVal <= 0) return null;
                const calc = cutsCalculated[i];
                return (
                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="p-2 font-bold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                      <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: colors[i] }}></div>
                      <span>Corte {i + 1}</span>
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-center font-mono text-zinc-700 dark:text-zinc-300">{wVal}</td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono font-bold text-zinc-805 dark:text-zinc-100">
                      {calc.weight > 0 ? `${calc.weight.toFixed(1)} kg` : '—'}
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono text-[#2e7d32] dark:text-emerald-400">
                      {calc.length > 0 ? `${calc.length.toFixed(1)} m` : '—'}
                    </td>
                    <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono text-zinc-500 dark:text-zinc-400">
                      {calc.pct.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-zinc-100 dark:bg-zinc-950 font-bold text-zinc-900 dark:text-zinc-150">
                <td className="p-2 border border-zinc-200 dark:border-zinc-800">TOTAL GERAL</td>
                <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-center font-mono">{totalCutsWidth}</td>
                <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono">
                  {bPeso > 0 ? `${((totalCutsWidth / lt) * bPeso).toFixed(1)} kg` : '—'}
                </td>
                <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono text-[#2e7d32] dark:text-emerald-400">
                  {cutsCalculated.some(c => c.length > 0)
                    ? `${cutsCalculated.reduce((a, b) => a + b.length, 0).toFixed(1)} m`
                    : '—'}
                </td>
                <td className="p-2 border border-zinc-200 dark:border-zinc-800 text-right font-mono">
                  {((totalCutsWidth / lt) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
