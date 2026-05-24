"use client";

import React, { useState, useEffect } from 'react';
import { 
  Ruler, Scissors, TrendingUp, RefreshCw, Plus, Trash2, 
  Info, Percent, Scale, Combine, Wrench, ChevronRight, Check
} from 'lucide-react';
import { SteelProduct, QuoteItem } from '../types';

interface CalhaTelhaCalculatorsProps {
  onAddItem: (item: Omit<QuoteItem, "id">) => void;
}

export default function CalhaTelhaCalculators({ onAddItem }: CalhaTelhaCalculatorsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'calha_telha' | 'bobina' | 'corte' | 'inclina'>('calha_telha');

  // --- 1. METRAGEM DE CALHA E TELHA STATE ---
  const [ctType, setCtType] = useState<'calha' | 'telha'>('calha');
  
  // Calha Gutter inputs
  const [calhaShape, setCalhaShape] = useState<'moldura' | 'u' | 'platibanda' | 'rufo'>('moldura');
  const [calhaLength, setCalhaLength] = useState<number>(12); // meters
  const [calhaDev, setCalhaDev] = useState<number>(30); // centimeters development (20, 25, 30, 40, 50, 100)
  const [calhaThickness, setCalhaThickness] = useState<number>(0.43); // mm
  const [calhaMaterial, setCalhaMaterial] = useState<'galvanizado' | 'galvalume' | 'pintado'>('galvanizado');
  const [calhaQty, setCalhaQty] = useState<number>(1);

  // Telha Tile inputs
  const [telhaModel, setTelhaModel] = useState<'tp40' | 'tp35' | 'ondulada'>('tp40');
  const [telhaRoofWidth, setTelhaRoofWidth] = useState<number>(15); // meters wide
  const [telhaSlopeLength, setTelhaSlopeLength] = useState<number>(6.5); // meters slope (diagonal)
  const [telhaThickness, setTelhaThickness] = useState<number>(0.50); // mm
  const [telhaMaterial, setTelhaMaterial] = useState<'galvanizado' | 'galvalume' | 'termoacustica'>('galvalume');
  const [telhaQty, setTelhaQty] = useState<number>(1);

  // --- 2. CONVERSÃO DE PESO BOBINA STATE ---
  const [convMode, setConvMode] = useState<'metro-para-kg' | 'kg-para-metro'>('metro-para-kg');
  const [bobinaWidthMm, setBobinaWidthMm] = useState<number>(1200);
  const [bobinaThicknessMm, setBobinaThicknessMm] = useState<number>(0.50);
  const [bobinaLengthM, setBobinaLengthM] = useState<number>(200);
  const [bobinaWeightKg, setBobinaWeightKg] = useState<number>(942); // initial conversion state aligned

  // --- 3. PLANO DE CORTE (SLITTING) STATE ---
  const [motherCoilWidth, setMotherCoilWidth] = useState<number>(1200);
  const [slittingCuts, setSlittingCuts] = useState<Array<{ id: string; widthMm: number; quantity: number; label: string }>>([
    { id: '1', widthMm: 300, quantity: 2, label: 'Perfil Calha principal' },
    { id: '2', widthMm: 150, quantity: 3, label: 'Rufos laterais' },
    { id: '3', widthMm: 120, quantity: 1, label: 'Contra-rufo' },
  ]);
  const [newCutWidth, setNewCutWidth] = useState<number>(100);
  const [newCutQty, setNewCutQty] = useState<number>(1);
  const [newCutLabel, setNewCutLabel] = useState<string>('');

  // --- 4. INCLINAÇÃO STATE ---
  const [incRunLength, setIncRunLength] = useState<number>(10); // horizontal width
  const [incPercent, setIncPercent] = useState<number>(10); // % slope (standard galvanized telhas trapezoidais use 10%)

  // --- ACTIONS & CALCULATIONS ---

  // 1. CALHA/TELHA CALCULATIONS
  const [ctCalculatedWeight, setCtCalculatedWeight] = useState<number>(0);
  const [ctCalculatedPrice, setCtCalculatedPrice] = useState<number>(0);
  const [ctCalculatedPieces, setCtCalculatedPieces] = useState<number>(0);

  useEffect(() => {
    if (ctType === 'calha') {
      // Calha weight: length * (development in meters) * thickness * 7.85 density * qty
      const devM = calhaDev / 100;
      const weight = calhaLength * devM * calhaThickness * 7.85 * calhaQty;
      
      const pricePerKg = calhaMaterial === 'galvanizado' ? 10.10 
                       : calhaMaterial === 'galvalume' ? 11.20 
                       : 13.50; // pintado
      
      const price = weight * pricePerKg;
      
      setCtCalculatedWeight(parseFloat(weight.toFixed(2)));
      setCtCalculatedPrice(parseFloat(price.toFixed(2)));
      // Calhas can be commercialized in 2.0m standard bars
      setCtCalculatedPieces(Math.ceil(calhaLength / 2));
    } else {
      // Telhas calculation:
      // Useful coverage widths: TP40 is 0.98m; TP35 is 1.05m; Ondulada is 0.99m
      const usefulWidth = telhaModel === 'tp40' ? 0.98 
                        : telhaModel === 'tp35' ? 1.05 
                        : 0.99;
      
      // Number of tile sheets alongside roof width (arredondado para cima)
      const sheetsCount = Math.ceil(telhaRoofWidth / usefulWidth);
      const totalMetersOfTile = sheetsCount * telhaSlopeLength * telhaQty;
      
      // Actual physical sheet width is wider than useful width (approx 1.05m for TP40/1.12m for TP35)
      const absoluteSheetWidthM = telhaModel === 'tp40' ? 1.05 : telhaModel === 'tp35' ? 1.12 : 1.08;
      
      // Total weight: total raw meters * absoluteWidthM * thickness * 7.85
      const weight = totalMetersOfTile * absoluteSheetWidthM * telhaThickness * 7.85;
      
      const pricePerKg = telhaMaterial === 'galvanizado' ? 10.10
                       : telhaMaterial === 'galvalume' ? 11.20
                       : 15.85; // termoacústica (sanduíche ou pintada EPS)
      
      const price = weight * pricePerKg;

      setCtCalculatedWeight(parseFloat(weight.toFixed(2)));
      setCtCalculatedPrice(parseFloat(price.toFixed(2)));
      setCtCalculatedPieces(sheetsCount);
    }
  }, [
    ctType, calhaShape, calhaLength, calhaDev, calhaThickness, calhaMaterial, calhaQty,
    telhaModel, telhaRoofWidth, telhaSlopeLength, telhaThickness, telhaMaterial, telhaQty
  ]);

  const handleAddCalhaTelhaToQuote = () => {
    let productName = '';
    let category: any = 'calhas_telhas';
    let std = 'ASTM A653 / NBR 7008';
    let basePriceKg = 10.10;

    if (ctType === 'calha') {
      const shapeLabel = calhaShape === 'moldura' ? 'Moldura' 
                       : calhaShape === 'u' ? 'Perfil U' 
                       : calhaShape === 'rufo' ? 'Rufo / Pingadeira' 
                       : 'Platibanda';
      productName = `Calha de Aço ${shapeLabel} - Corte Dev:${calhaDev}cm (Esp:${calhaThickness}mm)`;
      basePriceKg = calhaMaterial === 'galvanizado' ? 10.10 
                  : calhaMaterial === 'galvalume' ? 11.20 
                  : 13.50;
    } else {
      const modelLabel = telhaModel === 'tp40' ? 'Trapezoidal TP40' 
                       : telhaModel === 'tp35' ? 'Trapezoidal TP35' 
                       : 'Ondulada 17';
      productName = `Telha Metálica ${modelLabel} - Água:${telhaSlopeLength}m (Esp:${telhaThickness}mm)`;
      basePriceKg = telhaMaterial === 'galvanizado' ? 10.10
                  : telhaMaterial === 'galvalume' ? 11.20
                  : 15.85;
    }

    const calculatedProd: SteelProduct = {
      id: ctType === 'calha' ? `custom-calha-${Date.now()}` : `custom-telha-${Date.now()}`,
      name: productName,
      category: 'calhas_telhas',
      description: ctType === 'calha' 
        ? `Calha dobrada sob medida para telhado. Comprimento linear total de ${calhaLength}m (dividido em barras).` 
        : `Telhas metálicas perfiladas de alta cobertura. Total de ${ctCalculatedPieces} telhas de ${telhaSlopeLength}m de comprimento x ${telhaRoofWidth}m largura total do vão, totalizando ${ctCalculatedPieces * telhaSlopeLength} metros lineares.`,
      basePricePerKg: basePriceKg,
      standards: std,
      density: 7.85
    };

    onAddItem({
      product: calculatedProd,
      quantity: ctType === 'calha' ? calhaQty : telhaQty,
      widthM: ctType === 'calha' ? calhaDev / 100 : telhaRoofWidth,
      lengthM: ctType === 'calha' ? calhaLength : telhaSlopeLength,
      thicknessMm: ctType === 'calha' ? calhaThickness : telhaThickness,
      calculatedWeightKg: ctCalculatedWeight,
      unitPrice: basePriceKg,
      totalPrice: ctCalculatedPrice
    });

    // Notify brief success
  };

  // 2. COIL CONVERSIONS (METRO <-> KG)
  useEffect(() => {
    // Weight = Length * (WidthM) * Thickness * 7.85
    const widthM = bobinaWidthMm / 1000;
    if (convMode === 'metro-para-kg') {
      const calculatedWeight = bobinaLengthM * widthM * bobinaThicknessMm * 7.85;
      setBobinaWeightKg(Math.round(calculatedWeight));
    } else {
      // Length = Weight / (WidthM * Thickness * 7.85)
      const densityFactor = widthM * bobinaThicknessMm * 7.85;
      if (densityFactor > 0) {
        const calculatedLength = bobinaWeightKg / densityFactor;
        setBobinaLengthM(Math.round(calculatedLength));
      }
    }
  }, [convMode, bobinaWidthMm, bobinaThicknessMm, bobinaLengthM, bobinaWeightKg]);

  const handleAddCoilToQuote = () => {
    const productName = `Bobina de Chapa Slitada Cortada - Largura:${bobinaWidthMm}mm (Esp:${bobinaThicknessMm}mm)`;
    const calculatedProd: SteelProduct = {
      id: `custom-bobina-${Date.now()}`,
      name: productName,
      category: 'calhas_telhas',
      description: `Bobina fatiada comercial para perfilamento de calhas e condutores. Comprimento linear estimado de ${bobinaLengthM}m.`,
      basePricePerKg: 10.10,
      standards: 'CSN NBR 7008 / Galvanizado Z275',
      density: 7.85
    };

    onAddItem({
      product: calculatedProd,
      quantity: 1,
      widthM: bobinaWidthMm / 1000,
      lengthM: bobinaLengthM,
      thicknessMm: bobinaThicknessMm,
      calculatedWeightKg: bobinaWeightKg,
      unitPrice: 10.10,
      totalPrice: bobinaWeightKg * 10.10
    });
  };

  // 3. SLITTING (PLANO DE CORTE) CALCULATIONS
  const totalWidthAllocated = slittingCuts.reduce((acc, cut) => acc + (cut.widthMm * cut.quantity), 0);
  const leftOverWidth = motherCoilWidth - totalWidthAllocated;
  const yieldPercent = motherCoilWidth > 0 ? (totalWidthAllocated / motherCoilWidth) * 100 : 0;
  const scrapPercent = 100 - yieldPercent;

  const handleAddSlittingCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCutWidth <= 0 || newCutQty <= 0) return;
    if (totalWidthAllocated + (newCutWidth * newCutQty) > motherCoilWidth + 50) {
      if (!window.confirm(`O total cortado ultrapassará a largura da bobina mãe (${motherCoilWidth}mm)! Deseja continuar mesmo assim?`)) {
        return;
      }
    }

    const item: any = {
      id: Date.now().toString(),
      widthMm: newCutWidth,
      quantity: newCutQty,
      label: newCutLabel || `Corte Fita ${newCutWidth}mm`
    };

    setSlittingCuts([...slittingCuts, item]);
    setNewCutLabel('');
  };

  const handleRemoveSlittingCut = (id: string) => {
    setSlittingCuts(slittingCuts.filter(c => c.id !== id));
  };

  // 4. INCLINATION ROOF CALCULATIONS
  // Rise = Run * (Percent / 100)
  const incRiseHeight = incRunLength * (incPercent / 100);
  const incDiagonalLength = Math.sqrt((incRunLength * incRunLength) + (incRiseHeight * incRiseHeight));
  const incAngleDegrees = (Math.atan(incPercent / 100) * 180) / Math.PI;

  const getPitchRecommendation = (percentage: number) => {
    if (percentage < 5) {
      return {
        text: "Inadequado p/ telhas de aço comuns, risco crítico de retorno de água!",
        color: "text-red-650 bg-red-50 border-red-200"
      };
    }
    if (percentage >= 5 && percentage < 10) {
      return {
        text: "Mínimo admissível p/ Telhas Trapezoidais sem emendas. Ideal aplicar selador PU nos transpasses.",
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    }
    if (percentage >= 10 && percentage <= 25) {
      return {
        text: "Inclinação perfeita recomendada para Telha Trapezoidal de Aço e Painéis Termoacústicos (Sanduíche).",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200"
      };
    }
    return {
      text: "Excelente escoamento. Indicado para telhas coloniais ou fibrocimento. Gera maior área de telha diagonal.",
      color: "text-sky-700 bg-sky-55/60 border-sky-200"
    };
  };

  const pitchRecommendation = getPitchRecommendation(incPercent);

  // Apply calculated diagonal to tile slope input automatically for a integrated UX flow!
  const applySlopeToTileCalculator = () => {
    setTelhaSlopeLength(parseFloat(incDiagonalLength.toFixed(2)));
    setCtType('telha');
    setActiveSubTab('calha_telha');
  };

  return (
    <div id="calheiro-pro-suite-root" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-auto lg:h-full">
      {/* HEADER BAR */}
      <div className="bg-slate-900 text-white p-6 relative">
        <div className="absolute top-0 right-0 h-full w-40 bg-radial-gradient from-orange-500/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center space-x-3.5 relative">
          <div className="h-10 w-10 bg-orange-500 rounded-xl flex items-center justify-center text-slate-950">
            <Wrench className="w-5.5 h-5.5 stroke-[2.3]" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-wide uppercase">Suíte Calha Norte PRO</h2>
            <p className="text-xs text-slate-400">Calculadoras dedicadas para Dobra, Bobinas, Corte & Telhados</p>
          </div>
        </div>

        {/* SUBTAB BAR SELECTORS */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-4 gap-1 mt-6 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            id="subtab-calha-telha"
            onClick={() => setActiveSubTab('calha_telha')}
            className={`flex flex-col md:flex-row items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'calha_telha' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 sm:mr-1 shrink-0 text-slate-400 md:text-inherit" />
            <span className="text-[10px] sm:text-xs text-center">Calha / Telha</span>
          </button>
          
          <button
            id="subtab-bobina"
            onClick={() => setActiveSubTab('bobina')}
            className={`flex flex-col md:flex-row items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'bobina' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 sm:mr-1 shrink-0 text-slate-400 md:text-inherit" />
            <span className="text-[10px] sm:text-xs text-center">Metro ↔ Kg</span>
          </button>

          <button
            id="subtab-corte"
            onClick={() => setActiveSubTab('corte')}
            className={`flex flex-col md:flex-row items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'corte' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5 sm:mr-1 shrink-0 text-slate-400 md:text-inherit" />
            <span className="text-[10px] sm:text-xs text-center">Dobra / Slit</span>
          </button>

          <button
            id="subtab-inclina"
            onClick={() => setActiveSubTab('inclina')}
            className={`flex flex-col md:flex-row items-center justify-center py-2 px-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeSubTab === 'inclina' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 sm:mr-1 shrink-0 text-slate-400 md:text-inherit" />
            <span className="text-[10px] sm:text-xs text-center">Inclinação</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 flex-1 lg:overflow-y-auto space-y-6">

        {/* 1. TAB: CALHA & TELHA METRAGEM */}
        {activeSubTab === 'calha_telha' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Toggle internal category */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border">
              <button
                id="toggle-ct-calha"
                onClick={() => setCtType('calha')}
                className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl transition ${
                  ctType === 'calha' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📐 Dimensionar Calhas & Rufos
              </button>
              <button
                id="toggle-ct-telha"
                onClick={() => setCtType('telha')}
                className={`flex-1 py-2.5 text-xs font-black uppercase rounded-xl transition ${
                  ctType === 'telha' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                🏠 Cobertura de Telhas
              </button>
            </div>

            {/* A. CALHA INTERACTIVE LAYOUT INPUTS */}
            {ctType === 'calha' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Formato da Calha / Dobra</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'moldura', label: 'Calha Moldura' },
                        { id: 'u', label: 'Vão Livre em U' },
                        { id: 'platibanda', label: 'Platibanda Escoar' },
                        { id: 'rufo', label: 'Rufo Pingadeira' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setCalhaShape(item.id as any)}
                          className={`text-xs font-semibold py-2.5 px-3 rounded-xl border text-left transition ${
                            calhaShape === item.id 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                              : 'bg-white border-slate-220 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {calhaShape === item.id ? '✓ ' : ''}{item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Comprimento do Vão (m)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value={calhaLength}
                        onChange={(e) => setCalhaLength(Math.max(0.5, parseFloat(e.target.value) || 0))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Desenvolvimento (Corte cm)</label>
                      <select
                        value={calhaDev}
                        onChange={(e) => setCalhaDev(parseInt(e.target.value))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      >
                        <option value={20}>20 cm (Pingadeiras)</option>
                        <option value={25}>25 cm (Rufos leves)</option>
                        <option value={30}>30 cm (Calha Standard)</option>
                        <option value={40}>40 cm (Calha Média/Comum)</option>
                        <option value={50}>50 cm (Calha Predial)</option>
                        <option value={100}>100 cm (Sub-cobertura completa)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Espessura / Chapa</label>
                      <select
                        value={calhaThickness}
                        onChange={(e) => setCalhaThickness(parseFloat(e.target.value))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      >
                        <option value={0.43}>Chapa 28 - 0.43 mm (Economica)</option>
                        <option value={0.50}>Chapa 26 - 0.50 mm (Industrial)</option>
                        <option value={0.80}>Chapa 22 - 0.80 mm (Pesada)</option>
                        <option value={1.20}>Chapa 18 - 1.20 mm (Reforçado)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Material Revestimento</label>
                      <select
                        value={calhaMaterial}
                        onChange={(e) => setCalhaMaterial(e.target.value as any)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      >
                        <option value="galvanizado">Minizinc Galvanizado CSN</option>
                        <option value="galvalume">Galvalume Plus Resistente</option>
                        <option value="pintado">Pré-Pintado Linha Colorida</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Multiplicador (Qtd Vãos Idênticos)</label>
                    <input
                      type="number"
                      min="1"
                      value={calhaQty}
                      onChange={(e) => setCalhaQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Calha design feedback */}
                <div className="bg-slate-50 rounded-2xl border p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-slate-900 py-1 px-2 rounded-md">Esquema Dobra Dobradora</span>
                    <h4 className="font-bold text-sm text-slate-950 mt-2">Dobra Comercial Sob Medida</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Este plano de calha consome uma fita slita de <strong>{calhaDev}cm ({calhaDev * 10}mm)</strong> de fita, dobrada nas angulações ideais contra vazamento.
                    </p>

                    {/* Simple geometric outline of folded plate gutter */}
                    <div className="h-28 bg-white border rounded-xl flex items-center justify-center p-4 relative mt-3 overflow-hidden">
                      <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400">Croqui Dobra de Prensa</div>
                      {calhaShape === 'moldura' && (
                        <svg className="w-40 h-20 text-slate-400" viewBox="0 0 100 50">
                          <polyline points="10,10 10,40 40,40 50,30 80,30 90,20" fill="none" stroke="currentColor" strokeWidth="4" />
                          <text x="35" y="48" fontSize="8" fill="currentColor" fontWeight="bold">Dev: {calhaDev}cm</text>
                        </svg>
                      )}
                      {calhaShape === 'u' && (
                        <svg className="w-40 h-20 text-slate-400" viewBox="0 0 100 50">
                          <polyline points="20,10 20,40 80,40 80,10" fill="none" stroke="currentColor" strokeWidth="4" />
                          <text x="40" y="48" fontSize="8" fill="currentColor" fontWeight="bold">U: {calhaDev}cm</text>
                        </svg>
                      )}
                      {calhaShape === 'platibanda' && (
                        <svg className="w-40 h-20 text-slate-400" viewBox="0 0 100 50">
                          <polyline points="10,20 40,40 80,45 90,10" fill="none" stroke="currentColor" strokeWidth="4" />
                          <text x="35" y="48" fontSize="8" fill="currentColor" fontWeight="bold">Platibanda: {calhaDev}cm</text>
                        </svg>
                      )}
                      {calhaShape === 'rufo' && (
                        <svg className="w-40 h-20 text-slate-400" viewBox="0 0 100 50">
                          <polyline points="20,10 60,10 90,40" fill="none" stroke="currentColor" strokeWidth="4" />
                          <text x="35" y="48" fontSize="8" fill="currentColor" fontWeight="bold">Rufo Dev: {calhaDev}cm</text>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Comprimento Total</span>
                        <span className="font-bold text-sm text-white">{calhaLength * calhaQty} metros lineares</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Peças Requeridas</span>
                        <span className="font-bold text-sm text-white">{ctCalculatedPieces * calhaQty} barras de 2,0m</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-800">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Peso Geral Estimado</span>
                        <span className="font-bold text-base text-orange-400 flex items-center space-x-1">
                          <Scale className="w-4 h-4" />
                          <span>{ctCalculatedWeight} kg</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Preço Estimado:</span>
                      <span className="font-black text-lg text-emerald-400">
                        R$ {ctCalculatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* B. TELHA COVERAGE INPUTS */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Selecione o Modelo de Telha Metálica</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'tp40', name: 'Trapezoidal TP40', spec: 'Cobr. 98cm' },
                        { id: 'tp35', name: 'Trapezoidal TP35', spec: 'Cobr. 105cm' },
                        { id: 'ondulada', name: 'Ondulada 17', spec: 'Cobr. 99cm' },
                      ].map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setTelhaModel(model.id as any)}
                          className={`flex flex-col p-2.5 rounded-xl border text-left transition select-none ${
                            telhaModel === model.id
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xs font-bold">{model.name}</span>
                          <span className={`${telhaModel === model.id ? 'text-orange-400' : 'text-slate-400'} text-[10px] mt-0.5`}>{model.spec}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label id="lbl-telha-width" className="block text-xs font-bold text-slate-500 mb-1.5">Largura do Vão / Cobertura (m)</label>
                      <input
                        type="number"
                        min="1"
                        step="0.1"
                        value={telhaRoofWidth}
                        onChange={(e) => setTelhaRoofWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <label id="lbl-telha-slope" className="block text-xs font-bold text-slate-500 mb-1.5">Comprimento da Telha (Água m)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0.5"
                          step="0.05"
                          value={telhaSlopeLength}
                          onChange={(e) => setTelhaSlopeLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                          className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 pr-12 focus:outline-none focus:ring-1 focus:ring-scale"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">Metros</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Espessura da Chapa (mm)</label>
                      <select
                        value={telhaThickness}
                        onChange={(e) => setTelhaThickness(parseFloat(e.target.value))}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      >
                        <option value={0.43}>Zinco Esp: 0.43 mm (Chapa 28)</option>
                        <option value={0.50}>Zinco Esp: 0.50 mm (Chapa 26 Recomendada COB)</option>
                        <option value={0.65}>Zinco Esp: 0.65 mm (Vão comercial largo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">Material Revestimento</label>
                      <select
                        value={telhaMaterial}
                        onChange={(e) => setTelhaMaterial(e.target.value as any)}
                        className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                      >
                        <option value="galvanizado">Galvanização Eletrolítica Z275</option>
                        <option value="galvalume">Galvalume Plus CSN (Zinco + Alumínio)</option>
                        <option value="termoacustica">Termoacústica (Chapa + EPS Isopor + Filme)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Multiplicador (Qtd de Vãos do Telhado)</label>
                    <input
                      type="number"
                      min="1"
                      value={telhaQty}
                      onChange={(e) => setTelhaQty(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Telha design feedback */}
                <div className="bg-slate-50 rounded-2xl border p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest bg-green-50 border border-green-200 py-1 px-2 rounded-md">Análise de Cobertura Útil</span>
                    <h4 className="font-bold text-sm text-slate-950 mt-2">Distribuição de Pranchas</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Neste vão de <strong>{telhaRoofWidth}m</strong> de largura, o modelo <strong>{telhaModel === 'tp40' ? 'TP40' : telhaModel === 'tp35' ? 'TP35' : 'Ondulada'}</strong> demanda transpasses seguros de transpasse lateral.
                    </p>

                    <div className="bg-white p-3 border rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Largura Útil Cobertura:</span>
                        <span className="font-bold text-slate-800">
                          {telhaModel === 'tp40' ? '980 mm (0.98m)' : telhaModel === 'tp35' ? '1050 mm (1.05m)' : '990 mm (0.99m)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Pranchas / Telhas Lado a Lado:</span>
                        <span className="font-extrabold text-indigo-600 block">{ctCalculatedPieces} Peças</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Área Efetiva Coberta:</span>
                        <span className="font-semibold text-slate-800">{(telhaRoofWidth * telhaSlopeLength).toFixed(1)} m² por água</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Telhas</span>
                        <span className="font-bold text-sm text-white">{ctCalculatedPieces * telhaQty} pranchas de {telhaSlopeLength}m</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Metros Lineares Gerais</span>
                        <span className="font-bold text-sm text-white">{(ctCalculatedPieces * telhaSlopeLength * telhaQty).toFixed(1)} m</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-800">
                        <span className="block text-slate-400 text-[10px] uppercase font-bold">Peso das Telhas Estimado</span>
                        <span className="font-bold text-base text-orange-450 flex items-center space-x-1">
                          <Scale className="w-4 h-4 text-orange-400" />
                          <span>{ctCalculatedWeight} kg</span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-xs text-slate-400">Preço Estimado Cobertura:</span>
                      <span className="font-black text-lg text-emerald-400">
                        R$ {ctCalculatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* General submit button for Calhas/Telhas tab */}
            <button
              id="btn-add-ct-to-quote"
              type="button"
              onClick={handleAddCalhaTelhaToQuote}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-slate-950 font-black text-sm py-4 rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Inserir Calha/Telha no Orçamento Ativo</span>
            </button>
          </div>
        )}

        {/* 2. TAB: CONVERSÃO DE PESO DA BOBINA METRO/KG */}
        {activeSubTab === 'bobina' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-50 p-4 border rounded-2xl text-xs space-y-2 text-slate-650 leading-relaxed">
              <span className="font-bold text-slate-950 flex items-center space-x-1">
                <Info className="w-4 h-4 text-orange-500" />
                <span>Conversão Automática de Bobinas de Chapa Metálica</span>
              </span>
              <p>
                As bobinas comercializadas por usinas (CSN/Usiminas) chegam em fardos pesados (Kg). No entanto, o conformador de calhas e o clitador precisam calcular exatamente quantos metros lineares de chapa conseguirão produzir. Use o conversor abaixo em tempo real.
              </p>
            </div>

            {/* Toggle Conversion Mode */}
            <div className="flex bg-slate-105 p-1 rounded-xl border bg-slate-100">
              <button
                id="toggle-conv-m-to-kg"
                onClick={() => setConvMode('metro-para-kg')}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition ${
                  convMode === 'metro-para-kg' ? 'bg-white text-slate-900 shadow-sm border' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                📏 Transformar Metros em KG (Peso)
              </button>
              <button
                id="toggle-conv-kg-to-m"
                onClick={() => setConvMode('kg-para-metro')}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition ${
                  convMode === 'kg-para-metro' ? 'bg-white text-slate-900 shadow-sm border' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ⚖️ Transformar KG (Peso) em Metros Linear
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Width */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Largura da Chapa / Bobina (mm)</label>
                <select
                  value={bobinaWidthMm}
                  onChange={(e) => setBobinaWidthMm(parseInt(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value={1000}>1000 mm (1,00 metro standard)</option>
                  <option value={1200}>1200 mm (1,20 metro padrão largo)</option>
                  <option value={1250}>1250 mm (1,25 metro de usina)</option>
                  <option value={1500}>1500 mm (1,50 metro especial)</option>
                  <option value={300}>300 mm (Slita Gutter Calheiro)</option>
                  <option value={400}>400 mm (Slita Gutter Predial)</option>
                </select>
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Espessura / Bitola (mm)</label>
                <select
                  value={bobinaThicknessMm}
                  onChange={(e) => setBobinaThicknessMm(parseFloat(e.target.value))}
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                >
                  <option value={0.43}>0.43 mm (Bitola Chapa 28)</option>
                  <option value={0.50}>0.50 mm (Bitola Chapa 26)</option>
                  <option value={0.80}>0.80 mm (Bitola Chapa 22)</option>
                  <option value={0.95}>0.95 mm (Bitola Chapa 20)</option>
                  <option value={1.25}>1.25 mm (Bitola Chapa 18)</option>
                </select>
              </div>

              {/* Dynamic conversion direct input */}
              {convMode === 'metro-para-kg' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Metragem Desejada (Metros)</label>
                  <input
                    type="number"
                    min="1"
                    value={bobinaLengthM}
                    onChange={(e) => setBobinaLengthM(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Peso Desejado na Balança (KG)</label>
                  <input
                    type="number"
                    min="1"
                    value={bobinaWeightKg}
                    onChange={(e) => setBobinaWeightKg(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Comparison card outputs */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest block mb-1">Resultados da Conversão</span>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Calculado sob a densidade fidedigna do aço carbono de <strong>7.85 g/cm³</strong> (Gerdau/CSN):
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono text-slate-350">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="block text-[9px] text-slate-500 uppercase">Fator p/ metro</span>
                    <span className="font-bold text-sm text-white">
                      {((bobinaWidthMm / 1000) * bobinaThicknessMm * 7.85).toFixed(3)} Kg/m
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="block text-[9px] text-slate-500 uppercase">Fator p/ t</span>
                    <span className="font-bold text-sm text-white">
                      {(1000 / ((bobinaWidthMm / 1000) * bobinaThicknessMm * 7.85)).toFixed(0)} m/ton
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-slate-400 text-xs font-semibold">Valor Convertido Equivalente</span>
                
                {convMode === 'metro-para-kg' ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-3xl font-extrabold text-orange-400 font-mono">{bobinaWeightKg} Kg</p>
                    <p className="text-xs text-slate-500 italic">equivalente a {bobinaLengthM} metros de comprimento</p>
                  </div>
                ) : (
                  <div className="mt-2 space-y-1">
                    <p className="text-3xl font-extrabold text-teal-400 font-mono">{bobinaLengthM} Metros</p>
                    <p className="text-xs text-slate-500 italic">equivalente a {bobinaWeightKg} kg de chapa</p>
                  </div>
                )}
              </div>
            </div>

            <button
              id="btn-add-coil-to-quote"
              type="button"
              onClick={handleAddCoilToQuote}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm py-3.5 rounded-xl transition flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Adicionar Bobina de Conversão ao Orçamento</span>
            </button>
          </div>
        )}

        {/* 3. TAB: PLANO DE CORTE (SLITTING DE CHAPA) */}
        {activeSubTab === 'corte' && (
          <div className="space-y-6 animate-fadeIn text-slate-800">
            <div className="bg-slate-50 p-4 border rounded-2xl text-xs space-y-1 text-slate-650 leading-relaxed">
              <span className="font-bold text-slate-900 flex items-center space-x-1">
                <Scissors className="w-4 h-4 text-orange-500" />
                <span>Otimizador de Slitter / Fitas de Chapa (Plano de Corte)</span>
              </span>
              <p>
                Configure a largura de sua "Bobina Mãe" e divida-a de forma eficiente em fitas/tiras (slits) para calheiros ou serralheiros. Veja o aproveitamento em tempo real e reduza a perda com refilo (scrap).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: Config */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Largura da Bobina Mãe (mm)</label>
                  <select
                    value={motherCoilWidth}
                    onChange={(e) => setMotherCoilWidth(parseInt(e.target.value))}
                    className="w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    <option value={1000}>1000 mm (1,00 metro)</option>
                    <option value={1200}>1200 mm (1,20 metro padrão)</option>
                    <option value={1250}>1250 mm (1,25 metro largo)</option>
                    <option value={1500}>1500 mm (1,50 metro jumbo)</option>
                  </select>
                </div>

                <form onSubmit={handleAddSlittingCut} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <Plus className="w-3.5 h-3.5 text-orange-500" />
                    <span>Adicionar Fita de Corte</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Largura Fita (mm)</label>
                      <input
                        type="number"
                        min="1"
                        max={motherCoilWidth}
                        value={newCutWidth}
                        onChange={(e) => setNewCutWidth(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Qtd de Fitas</label>
                      <input
                        type="number"
                        min="1"
                        value={newCutQty}
                        onChange={(e) => setNewCutQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Identificação / Finalidade (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Calha U moldura ou Ref"
                      value={newCutLabel}
                      onChange={(e) => setNewCutLabel(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                    />
                  </div>

                  <button
                    id="btn-add-cut-to-list"
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-2 rounded-lg transition"
                  >
                    Adicionar Corte ao Layout
                  </button>
                </form>
              </div>

              {/* Column 2: Cutting List & Yield */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-slate-50 rounded-xl border p-4 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-xs font-bold text-slate-900">Configuração das Fitas Cortadas</span>
                    <span className="text-[10px] text-slate-400">{slittingCuts.length} cortes cadastrados</span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {slittingCuts.map((cut) => (
                      <div key={cut.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-lg border border-slate-100/60 shadow-sm">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">
                            {cut.quantity}x de <span className="text-orange-600 font-black">{cut.widthMm}mm</span>
                          </p>
                          {cut.label && <p className="text-[10px] text-slate-450 italic">{cut.label}</p>}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            L.Total: {cut.widthMm * cut.quantity}mm
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlittingCut(cut.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary performance bar meter */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Largura Utilizada: <strong className="text-slate-800">{totalWidthAllocated} mm</strong> / {motherCoilWidth}mm</span>
                      <span>Resto de Refilo: <strong className={leftOverWidth < 0 ? 'text-red-600 font-extrabold' : 'text-slate-500'}>{leftOverWidth} mm</strong></span>
                    </div>

                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                      {slittingCuts.map((cut, idx) => (
                        <div
                          key={cut.id}
                          style={{ width: `${((cut.widthMm * cut.quantity) / motherCoilWidth) * 100}%` }}
                          className={`h-full ${
                            idx % 3 === 0 ? 'bg-indigo-500' 
                            : idx % 3 === 1 ? 'bg-orange-400' 
                            : 'bg-emerald-500'
                          }`}
                          title={`${cut.quantity}x ${cut.widthMm}mm`}
                        />
                      ))}
                      {leftOverWidth > 0 && (
                        <div 
                          style={{ width: `${(leftOverWidth / motherCoilWidth) * 100}%` }}
                          className="h-full bg-slate-400 animate-pulse"
                          title="Refilo (Scrap)"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                      <p className="flex items-center space-x-1">
                        <Percent className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Aproveitamento Útil: <strong className="text-emerald-600">{yieldPercent.toFixed(1)}%</strong></span>
                      </p>
                      <p className="flex items-center space-x-1">
                        <Percent className="w-3.5 h-3.5 text-slate-400" />
                        <span>Perda Sucata Refilo: <strong className="text-slate-500">{scrapPercent.toFixed(1)}%</strong></span>
                      </p>
                    </div>

                    {leftOverWidth < 0 && (
                      <div className="text-xs bg-red-50 text-red-650 p-2.5 rounded-lg border border-red-250 font-semibold leading-normal">
                        ⚠ Excesso de corte! O plano ultrapassou a largura útil da bobina em {Math.abs(leftOverWidth)}mm. Remova algum item ou diminua a quantidade.
                      </div>
                    )}
                  </div>
                </div>

                {/* SVG Visual blueprint */}
                {totalWidthAllocated > 0 && (
                  <div className="bg-slate-900 rounded-xl p-4 text-white space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Croqui do Layout Slitting Cutter (Seção Transversal)</p>
                    
                    <div className="h-24 bg-slate-950 rounded-lg flex items-center p-3 overflow-x-auto relative">
                      <div className="flex w-full h-12 bg-slate-900 border border-slate-700 rounded overflow-hidden">
                        {slittingCuts.flatMap((cut, idx) => 
                          Array.from({ length: cut.quantity }).map((_, subIdx) => (
                            <div
                              key={`${cut.id}-${subIdx}`}
                              style={{ width: `${(cut.widthMm / motherCoilWidth) * 100}%` }}
                              className={`h-full border-r border-slate-950 flex flex-col items-center justify-center relative select-none ${
                                idx % 3 === 0 ? 'bg-indigo-600/75' 
                                : idx % 3 === 1 ? 'bg-orange-500/80' 
                                : 'bg-emerald-600/75'
                              }`}
                            >
                              <span className="text-[8px] font-bold text-white block">{cut.widthMm}</span>
                              <span className="text-[6px] text-slate-300 hidden sm:block">fita</span>
                            </div>
                          ))
                        )}
                        {leftOverWidth > 0 && (
                          <div
                            style={{ width: `${(leftOverWidth / motherCoilWidth) * 100}%` }}
                            className="h-full bg-slate-600/50 flex items-center justify-center flex-col text-slate-400 italic"
                          >
                            <span className="text-[8px] font-bold text-yellow-350">{leftOverWidth}</span>
                            <span className="text-[6px] hidden sm:block">Sobra</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: INCLINAÇÃO % DO TELHADO */}
        {activeSubTab === 'inclina' && (
          <div className="space-y-6 animate-fadeIn text-slate-800 leading-relaxed">
            <div className="bg-slate-50 p-4 border rounded-2xl text-xs space-y-1 text-slate-650">
              <span className="font-bold text-slate-950 flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span>Conversor de Inclinação de Telhado (Grau / Altura / Diagonal)</span>
              </span>
              <p>
                As telhas de aço (trapezoidais de Calha Norte) exigem menos inclinação estrutural do que as cerâmicas convencionais devido à sua estanqueidade estendida. Calcule a altura ideal de cumeeira ou a diagonal do telhado abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Largura da Base Horizontal / Run (Meters)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.5"
                      value={incRunLength}
                      onChange={(e) => setIncRunLength(parseFloat(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-sm font-bold text-slate-850 w-16 text-right bg-white border px-3 py-1.5 rounded">{incRunLength} m</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Meia água do telhado (distância da parede até a cumeeira).</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Inclinação Requerida (%)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="3"
                      max="45"
                      step="1"
                      value={incPercent}
                      onChange={(e) => setIncPercent(parseInt(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-sm font-bold text-slate-850 w-16 text-right bg-white border px-3 py-1.5 rounded">{incPercent}%</span>
                  </div>

                  {/* Standard presets recommended */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {[
                      { val: 5, label: '5% (Mínimo sanduíche)' },
                      { val: 10, label: '10% (Trapezoidal Aço padrão)' },
                      { val: 15, label: '15% (Ondulada aço)' },
                      { val: 30, label: '30% (Fibrocimento)' },
                      { val: 35, label: '35% (Cerâmica comum)' },
                    ].map((pre) => (
                      <button
                        key={pre.val}
                        type="button"
                        onClick={() => setIncPercent(pre.val)}
                        className={`text-[10px] font-bold py-1 px-2.5 rounded-lg border transition ${
                          incPercent === pre.val 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pre.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommendations banner depending on standard Brazilian civil norm guidelines */}
                <div className={`text-xs p-3.5 rounded-xl border leading-relaxed ${pitchRecommendation.color}`}>
                  <p className="font-bold flex items-center space-x-1 uppercase text-[10px] tracking-wide mb-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Parecer Engenharia Calha Norte:</span>
                  </p>
                  <span>{pitchRecommendation.text}</span>
                </div>
              </div>

              {/* Geometry output calculations card visual */}
              <div className="bg-slate-50 border rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-b pb-2">Resultados Estruturais do Caimento</h4>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Altura Total</span>
                      <span className="block text-sm font-mono font-bold text-indigo-600 mt-1">{incRiseHeight.toFixed(2)} m</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Diagonal Telha</span>
                      <span className="block text-sm font-mono font-bold text-emerald-600 mt-1">{incDiagonalLength.toFixed(2)} m</span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border shadow-sm">
                      <span className="block text-[9px] text-slate-400 uppercase font-semibold">Ângulo Real</span>
                      <span className="block text-sm font-mono font-bold text-orange-500 mt-1">{incAngleDegrees.toFixed(1)}°</span>
                    </div>
                  </div>

                  {/* Visual right triangle drawing representation of roof rise/run/diagonal */}
                  <div className="h-32 bg-white rounded-xl border flex items-end justify-center p-4 relative overflow-hidden">
                    <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400">Diagrama de Pendiente Lateral</div>
                    <svg className="w-56 h-28 text-slate-400" viewBox="0 0 100 50">
                      {/* Triangle filled shape */}
                      <path d={`M 10,40 L 90,40 L 90,${40 - (30 * (incPercent / 45))} Z`} fill="rgba(249,115,22,0.08)" stroke="#f97316" strokeWidth="2" />
                      
                      {/* Labels */}
                      <text x="50" y="48" fontSize="6" fill="#475569" fontWeight="bold" textAnchor="middle">Run: {incRunLength}m (Base)</text>
                      <text x="94" y={`${40 - (15 * (incPercent / 45))}`} fontSize="6" fill="#4f46e5" fontWeight="bold" textAnchor="start">Rise: {incRiseHeight.toFixed(1)}m</text>
                      <text x="45" y={`${35 - (15 * (incPercent / 45))}`} fontSize="6" fill="#059669" fontWeight="bold" transform={`rotate(${-incAngleDegrees/2}, 45, ${35 - (15 * (incPercent / 45))})`}>
                        Diag: {incDiagonalLength.toFixed(1)}m
                      </text>
                    </svg>
                  </div>
                </div>

                <button
                  id="btn-apply-slope-to-tile-tab"
                  onClick={applySlopeToTileCalculator}
                  className="w-full bg-slate-900 border border-slate-900 text-white hover:bg-slate-950 px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Aplicar Diagonal ({incDiagonalLength.toFixed(2)}m) na Aba Telhas</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
