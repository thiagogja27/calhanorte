"use client";

import React, { useState } from 'react';
import { Ruler, Scale, RefreshCw } from 'lucide-react';

interface CalhaZapMetroProps {
  verificarAtivo: () => boolean;
  exibirLock: (ttl: string, sub: string) => void;
}

export default function CalhaZapMetro({ verificarAtivo, exibirLock }: CalhaZapMetroProps) {
  const [subTab, setSubTab] = useState<'calc' | 'conv'>('calc');

  // --- CALCULATE METRAGEM ---
  const [mMat, setMMat] = useState('Galvanizado');
  const [mEsp, setMEsp] = useState('0,43 mm');
  const [mCC, setMCC] = useState<number>(20); // calhas length
  const [mCK, setMCK] = useState<number>(250); // calhas width (mm)
  const [mRC, setMRC] = useState<number>(15); // rufos length
  const [mRT, setMRT] = useState('Encosto c/ Pingadeira'); // rufos type

  // --- CONVERSOR M <-> KG ---
  const [cvMat, setCvMat] = useState<'aco' | 'alum'>('aco');
  const [cvEsp, setCvEsp] = useState('0,43');
  const [cvLarg, setCvLarg] = useState<number>(280);
  const [cvModo, setCvModo] = useState<'metros' | 'kg'>('metros');
  const [cvMetros, setCvMetros] = useState<number>(50);
  const [cvKgs, setCvKgs] = useState<number>(80);

  const getThicknessVal = (espStr: string): number => {
    return parseFloat(espStr.replace(',', '.')) || 0.43;
  };

  // Metragem Weight computation
  const calcMetragemWeight = (): number => {
    const thick = getThicknessVal(mEsp);
    const dens = mMat === 'Alumínio' ? 2750 : 7900;
    // Calha weight: length * width_meters * thickness_meters * density
    const widthCalhaM = mCK / 1000;
    const calhaWeight = mCC * widthCalhaM * (thick / 1000) * dens;

    // Rufos widths: Encosto c/ Ping=330mm, Rufo enc=250mm, Rufo ping=280mm, Cumeeira=400mm
    let widthRufoM = 0.33;
    if (mRT === 'Rufo Encosto') widthRufoM = 0.25;
    if (mRT === 'Rufo Pingadeira') widthRufoM = 0.28;
    if (mRT === 'Cumeeira') widthRufoM = 0.40;

    const rufoWeight = mRC * widthRufoM * (thick / 1000) * dens;
    return calhaWeight + rufoWeight;
  };

  const computedWeight = calcMetragemWeight();

  // Converter Calculations
  const getCvDensity = (): number => (cvMat === 'alum' ? 2.7 : 8.0);
  const cvEspVal = parseFloat(cvEsp.replace(',', '.')) || 0.43;
  const cvKgPerMeter = (cvLarg / 1000) * cvEspVal * getCvDensity();

  const handleConvertAction = () => {
    if (!verificarAtivo()) {
      exibirLock(
        'Acesso restrito ao Conversor de Unidades',
        'A calculadora e conversão m ↔ kg de bobinas requer ativação do seu <strong>teste grátis de 10 dias</strong>.'
      );
      return false;
    }
    return true;
  };

  const renderCvOutput = () => {
    const matNm = cvMat === 'alum' ? 'Alumínio' : 'Aço';
    const coef = getCvDensity().toFixed(1);

    if (cvModo === 'metros') {
      const calcKgs = cvMetros * cvKgPerMeter;
      return (
        <div className="bg-[#5a5c5f] text-white rounded-xl p-4 space-y-3">
          <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">
            RESULTADO: PESO TEÓRICO NECESSÁRIO
          </span>
          <div className="text-3xl font-black text-[#f5c800] font-condensed">
            {calcKgs.toFixed(2)} kg
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
            Para <strong>{cvMetros.toFixed(1)}m</strong> de {matNm} ({cvEspVal.toFixed(2)}mm) no corte {cvLarg}mm (kg/m teórico: {cvKgPerMeter.toFixed(3)}kg). Coeficiente físico de densidade: {coef} kg/dm³.
          </p>
        </div>
      );
    } else {
      const calcMeters = cvKgPerMeter > 0 ? cvKgs / cvKgPerMeter : 0;
      return (
        <div className="bg-[#5a5c5f] text-white rounded-xl p-4 space-y-3">
          <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider block">
            RESULTADO: METRAGEM TEÓRICA PRODUZIDA
          </span>
          <div className="text-3xl font-black text-[#f5c800] font-condensed">
            {calcMeters.toFixed(2)} m
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
            Com <strong>{cvKgs.toFixed(1)} kg</strong> de {matNm} ({cvEspVal.toFixed(2)}mm) no corte {cvLarg}mm (kg/m teórico: {cvKgPerMeter.toFixed(3)}kg), você produz {calcMeters.toFixed(2)} metros lineares de tira para conformação.
          </p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-white rounded-xl border border-[#b0b2b5] overflow-hidden">
        <button
          onClick={() => {
            setSubTab('calc');
          }}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === 'calc'
              ? 'bg-[#f5c800] text-[#5a5c5f] shadow-inner'
              : 'bg-white text-[#6a6a6a] hover:bg-zinc-50'
          }`}
        >
          <Ruler className="w-4 h-4" />
          <span>Calcular Metragem Física</span>
        </button>
        <button
          onClick={() => {
            if (handleConvertAction()) {
              setSubTab('conv');
            }
          }}
          className={`flex-1 py-3 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            subTab === 'conv'
              ? 'bg-[#f5c800] text-[#5a5c5f] shadow-inner'
              : 'bg-white text-[#6a6a6a] hover:bg-zinc-50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Conversor Metro ↔ KG</span>
        </button>
      </div>

      {subTab === 'calc' ? (
        <div className="space-y-4">
          <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
              🔩 Especificação de Material
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Material base</label>
                <div className="flex gap-1">
                  {['Galvanizado', 'Galvalume', 'Alumínio'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMMat(m)}
                      className={`flex-1 text-[11px] font-bold py-2 border rounded-lg transition ${
                        mMat === m ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Espessura</label>
                <div className="flex gap-1">
                  {['0,43 mm', '0,47 mm', '0,65 mm'].map((e) => (
                    <button
                      key={e}
                      onClick={() => setMEsp(e)}
                      className={`flex-1 text-[11px] font-bold py-2 border rounded-lg transition ${
                        mEsp === e ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
              🌊 Calhas Planejadas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Extensão Total (m)</label>
                <input
                  type="number"
                  value={mCC || ""}
                  onChange={(e) => setMCC(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Ex: 20"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Corte / Largura (mm)</label>
                <input
                  type="number"
                  value={mCK || ""}
                  onChange={(e) => setMCK(Math.max(100, parseInt(e.target.value) || 0))}
                  placeholder="Ex: 250"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2">
              🏠 Rufos / Outros Planejados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Extensão Total (m)</label>
                <input
                  type="number"
                  value={mRC || ""}
                  onChange={(e) => setMRC(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Ex: 15"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Tipo de Moldura</label>
                <select
                  value={mRT}
                  onChange={(e) => setMRT(e.target.value)}
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option>Encosto c/ Pingadeira</option>
                  <option>Rufo Encosto</option>
                  <option>Rufo Pingadeira</option>
                  <option>Cumeeira</option>
                </select>
              </div>
            </div>
          </div>

          {(mCC > 0 || mRC > 0) && (
            <div className="bg-white rounded-2xl border border-[#b0b2b5] p-5 space-y-4 shadow-sm">
              <div className="bg-[#5a5c5f] text-white p-4 rounded-xl">
                <span className="text-[10px] text-zinc-300 font-bold block">PESO COMPLEMENTAR ESTIMADO</span>
                <span className="text-3xl font-black text-[#f5c800] font-condensed">
                  {computedWeight.toFixed(1)} kg
                </span>
                <p className="text-[11px] text-zinc-300 mt-1 uppercase font-bold">
                  {mMat} ({mEsp}) • Total de linear: {(mCC + mRC).toFixed(1)} metros
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-[#f2f3f4] border border-[#b0b2b5] p-2.5 rounded-xl">
                  <span className="text-lg font-black text-[#5a5c5f] font-condensed">{mCC.toFixed(1)}m</span>
                  <span className="block text-[9px] text-[#6a6a6a] font-bold uppercase mt-1">Calha</span>
                </div>
                <div className="bg-[#f2f3f4] border border-[#b0b2b5] p-2.5 rounded-xl">
                  <span className="text-lg font-black text-[#5a5c5f] font-condensed">{mRC.toFixed(1)}m</span>
                  <span className="block text-[9px] text-[#6a6a6a] font-bold uppercase mt-1">Rufo</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#f2f3f4] rounded-2xl border border-[#b0b2b5] p-5 space-y-4 shadow-sm">
            <h3 className="text-sm font-extrabold text-[#5a5c5f] uppercase tracking-wider flex items-center gap-2 border-l-4 border-[#f5c800] pl-2 animate-pulse">
              ⚖️ Calculadora Inteligente de Equivalência
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3a3a3a]">Material da Bobina</label>
              <select
                value={cvMat}
                onChange={(e) => setCvMat(e.target.value as any)}
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
              >
                <option value="aco">Galvalume / Galvanizado / Pré-pintados — Aço (Dens: 8,0)</option>
                <option value="alum">Alumínio Calheiro (Dens: 2,7)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3a3a3a]">Espessura da Chapa (mm)</label>
              <div className="flex gap-1 flex-wrap">
                {['0,43', '0,47', '0,50', '0,65', '0,80', '1,00'].map((espOption) => (
                  <button
                    key={espOption}
                    onClick={() => setCvEsp(espOption)}
                    className={`flex-1 min-w-[50px] py-1.5 px-2 text-xs font-bold border rounded-lg transition ${
                      cvEsp === espOption ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                    }`}
                  >
                    {espOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3a3a3a]">Largura da Tira / Corte (mm)</label>
              <input
                type="number"
                value={cvLarg || ""}
                onChange={(e) => setCvLarg(Math.max(100, Math.min(1200, parseInt(e.target.value) || 0)))}
                placeholder="Ex: 280 (de 100 a 1200)"
                className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
              />
              <span className="text-[10px] text-[#6a6a6a] font-semibold block">Preencha largura em milímetros (mm). ex: corte 28 = 280mm!</span>
            </div>

            <div className="border-t border-[#b0b2b5] pt-3">
              <span className="text-xs font-bold text-[#3a3a3a] uppercase block mb-2">Qual dado você possui?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCvModo('metros')}
                  className={`flex-1 py-2 text-xs font-bold border rounded-lg transition ${
                    cvModo === 'metros' ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                  }`}
                >
                  📏 Tenho Metragem
                </button>
                <button
                  onClick={() => setCvModo('kg')}
                  className={`flex-1 py-2 text-xs font-bold border rounded-lg transition ${
                    cvModo === 'kg' ? 'border-[#e0b400] bg-[#f5c800]' : 'border-[#b0b2b5] bg-white'
                  }`}
                >
                  ⚖️ Tenho o Peso (Kg)
                </button>
              </div>
            </div>

            {cvModo === 'metros' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Meters lineares disponíveis (m)</label>
                <input
                  type="number"
                  value={cvMetros || ""}
                  onChange={(e) => setCvMetros(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Ex: 50"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3a3a3a]">Peso disponível de metal (kg)</label>
                <input
                  type="number"
                  value={cvKgs || ""}
                  onChange={(e) => setCvKgs(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Ex: 80"
                  className="w-full bg-white border border-[#b0b2b5] rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
            )}

            {(cvModo === 'metros' ? cvMetros : cvKgs) > 0 && renderCvOutput()}
          </div>

          <div className="bg-white rounded-2xl border border-[#b0b2b5] p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black text-[#5a5c5f] uppercase tracking-wider">
              📋 Tabela Teórica Geral (Corte mm x Peso m/linear)
            </h3>
            <table className="w-full text-[11px] border-collapse text-left">
              <thead>
                <tr className="bg-[#5a5c5f] text-[#f5c800] uppercase text-[9px] font-bold">
                  <th className="p-1.5 border border-[#b0b2b5]">Material</th>
                  <th className="p-1.5 border border-[#b0b2b5] text-center">Largura</th>
                  <th className="p-1.5 border border-[#b0b2b5] text-right">0,43mm</th>
                  <th className="p-1.5 border border-[#b0b2b5] text-right">0,47mm</th>
                  <th className="p-1.5 border border-[#b0b2b5] text-right">0,65mm</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-1.5 font-bold">Aço Carbono</td>
                  <td className="p-1.5 text-center font-mono">250mm</td>
                  <td className="p-1.5 text-right font-mono">0,86 kg/m</td>
                  <td className="p-1.5 text-right font-mono">0,94 kg/m</td>
                  <td className="p-1.5 text-right font-mono">1,30 kg/m</td>
                </tr>
                <tr className="border-b bg-[#f2f3f4]">
                  <td className="p-1.5 font-bold">Aço Carbono</td>
                  <td className="p-1.5 text-center font-mono">280mm</td>
                  <td className="p-1.5 text-right font-mono">0,96 kg/m</td>
                  <td className="p-1.5 text-right font-mono">1,05 kg/m</td>
                  <td className="p-1.5 text-right font-mono">1,46 kg/m</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1.5 font-bold">Aço Carbono</td>
                  <td className="p-1.5 text-center font-mono">300mm</td>
                  <td className="p-1.5 text-right font-mono">1,03 kg/m</td>
                  <td className="p-1.5 text-right font-mono">1,13 kg/m</td>
                  <td className="p-1.5 text-right font-mono">1,56 kg/m</td>
                </tr>
                <tr className="border-b bg-[#f2f3f4]">
                  <td className="p-1.5 font-bold text-sky-700">Alumínio</td>
                  <td className="p-1.5 text-center font-mono text-sky-700">250mm</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,29 kg/m</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,32 kg/m</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,44 kg/m</td>
                </tr>
                <tr className="border-b">
                  <td className="p-1.5 font-bold text-sky-700">Alumínio</td>
                  <td className="p-1.5 text-center font-mono text-sky-700">280mm</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,32 kg/m</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,36 kg/m</td>
                  <td className="p-1.5 text-right font-mono text-sky-700">0,49 kg/m</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
