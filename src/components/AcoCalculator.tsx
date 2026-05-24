"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Layers, CircleDot, Landmark, Anchor, Grid, Ruler, 
  HelpCircle, Scale, DollarSign, Archive, Compass 
} from 'lucide-react';
import { SteelProduct, SteelProductCategory, QuoteItem } from '../types';
import { 
  STEEL_PRODUCTS, 
  calculateSheetWeight, 
  calculateRoundTubeWeight, 
  calculateSquareTubeWeight, 
  calculateRectangularTubeWeight 
} from '../data';

interface AcoCalculatorProps {
  onAddItem: (item: Omit<QuoteItem, "id">) => void;
}

export default function AcoCalculator({ onAddItem }: AcoCalculatorProps) {
  const [selectedCategory, setSelectedCategory] = useState<SteelProductCategory>('sheets');
  const [filteredProducts, setFilteredProducts] = useState<SteelProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SteelProduct | null>(null);

  // Dynamic inputs dependent on product and category
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerKg, setPricePerKg] = useState<number>(8.40);
  
  // Sizing criteria
  const [sheetThickness, setSheetThickness] = useState<number>(2.00);
  const [sheetWidth, setSheetWidth] = useState<number>(1.20);
  const [sheetLength, setSheetLength] = useState<number>(3.00);

  // Tubings criteria
  const [tubeType, setTubeType] = useState<'round' | 'square' | 'rectangular'>('square');
  const [tubeDiameter, setTubeDiameter] = useState<number>(50.8); // Round outer diameter in mm
  const [tubeSideA, setTubeSideA] = useState<number>(40.0); // Side in mm (for square) or Side A (rectangular)
  const [tubeSideB, setTubeSideB] = useState<number>(20.0); // Side B (rectangular)
  const [wallThickness, setWallThickness] = useState<number>(1.50); // in mm
  const [tubeLength, setTubeLength] = useState<number>(6.00); // in meters

  // Profiles, Rebar, Wire
  const [genericLength, setGenericLength] = useState<number>(6.00); // bar length in meters
  const [wireWeightKg, setWireWeightKg] = useState<number>(10.00); // for raw wire direct weight input

  // Output stats
  const [computedWeightPerUnit, setComputedWeightPerUnit] = useState<number>(0);
  const [computedTotalWeight, setComputedTotalWeight] = useState<number>(0);
  const [computedTotalPrice, setComputedTotalPrice] = useState<number>(0);

  // Filter products when category changes
  useEffect(() => {
    const prods = STEEL_PRODUCTS.filter(p => p.category === selectedCategory);
    setFilteredProducts(prods);
    if (prods.length > 0) {
      setSelectedProduct(prods[0]);
    } else {
      setSelectedProduct(null);
    }
  }, [selectedCategory]);

  // Update default states when product selection changes
  useEffect(() => {
    if (selectedProduct) {
      setPricePerKg(selectedProduct.basePricePerKg);
      
      // Set default sheet thickness
      if (selectedProduct.thicknesses && selectedProduct.thicknesses.length > 0) {
        setSheetThickness(selectedProduct.thicknesses[0]);
        setWallThickness(selectedProduct.thicknesses[0]);
      }
      
      // Set default tube lengths
      if (selectedProduct.stdLengthM) {
        setTubeLength(selectedProduct.stdLengthM);
        setGenericLength(selectedProduct.stdLengthM);
      }
    }
  }, [selectedProduct]);

  // Fire formula recalculations on any input adjustment
  useEffect(() => {
    if (!selectedProduct) return;

    let unitWeight = 0;

    switch (selectedCategory) {
      case 'sheets':
        unitWeight = calculateSheetWeight(
          sheetWidth,
          sheetLength,
          sheetThickness,
          selectedProduct.density || 7.85
        );
        break;

      case 'tubes':
        if (tubeType === 'round') {
          unitWeight = calculateRoundTubeWeight(tubeDiameter, wallThickness, tubeLength);
        } else if (tubeType === 'square') {
          unitWeight = calculateSquareTubeWeight(tubeSideA, wallThickness, tubeLength);
        } else {
          unitWeight = calculateRectangularTubeWeight(tubeSideA, tubeSideB, wallThickness, tubeLength);
        }
        break;

      case 'profiles':
        // Standard profiles use defined nominal meter weight if available
        if (selectedProduct.unitWeightKgM) {
          unitWeight = parseFloat((selectedProduct.unitWeightKgM * genericLength).toFixed(2));
        } else {
          unitWeight = 10.00; // fallback safety
        }
        break;

      case 'rebar':
        // Rebar uses Gerdau unit Weight Kg/m * bar length
        if (selectedProduct.unitWeightKgM) {
          unitWeight = parseFloat((selectedProduct.unitWeightKgM * genericLength).toFixed(2));
        }
        break;

      case 'wire_mesh':
        // Some meshes are sold per panel with preset weight (e.g. Tela welded is 4.3kg)
        if (selectedProduct.id === 'tela-eq045') {
          unitWeight = selectedProduct.unitWeightKgM || 4.30;
        } else {
          // Arame Recozido is directly bought in customized scale
          unitWeight = wireWeightKg;
        }
        break;
    }

    if (unitWeight < 0) unitWeight = 0;
    
    const totWeight = parseFloat((unitWeight * (selectedProduct.id === 'arame-recozido-18' ? 1 : quantity)).toFixed(2));
    
    // Total price is simply total weight * selected negotiated R$/kg
    let totPrice = totWeight * pricePerKg;

    // Special override: screens where selling item relies flatly per unit instead of strictly per kg weight
    if (selectedProduct.id === 'tela-eq045') {
      // Just a default price based on panel weight
      totPrice = quantity * unitWeight * pricePerKg; 
    }

    setComputedWeightPerUnit(unitWeight);
    setComputedTotalWeight(totWeight);
    setComputedTotalPrice(parseFloat(totPrice.toFixed(2)));

  }, [
    selectedCategory, selectedProduct, quantity, pricePerKg,
    sheetThickness, sheetWidth, sheetLength,
    tubeType, tubeDiameter, tubeSideA, tubeSideB, wallThickness, tubeLength,
    genericLength, wireWeightKg
  ]);

  const handleAddToQuote = () => {
    if (!selectedProduct) return;

    const sizeDetails: any = {};
    if (selectedCategory === 'sheets') {
      sizeDetails.widthM = sheetWidth;
      sizeDetails.lengthM = sheetLength;
      sizeDetails.thicknessMm = sheetThickness;
    } else if (selectedCategory === 'tubes') {
      sizeDetails.lengthM = tubeLength;
      sizeDetails.thicknessMm = wallThickness;
      if (tubeType === 'round') {
        sizeDetails.outerDiameterMm = tubeDiameter;
      } else if (tubeType === 'square') {
        sizeDetails.widthM = tubeSideA / 1000; // side represented in meters
      } else {
        sizeDetails.widthM = tubeSideA / 1000;
        sizeDetails.lengthM = tubeSideB / 1000;
      }
    } else if (selectedCategory === 'profiles' || selectedCategory === 'rebar') {
      sizeDetails.lengthM = genericLength;
    }

    onAddItem({
      product: selectedProduct,
      quantity: selectedProduct.id === 'arame-recozido-18' ? 1 : quantity,
      ...sizeDetails,
      calculatedWeightKg: computedTotalWeight,
      unitPrice: pricePerKg,
      totalPrice: computedTotalPrice
    });

    // Reset some inputs on complete
    setQuantity(1);
  };

  const categoriesConfig = [
    { id: 'sheets', label: 'Chapas', icon: Layers, desc: 'Fina Quente, Galvanizada, Piso' },
    { id: 'tubes', label: 'Tubos / Metalon', icon: CircleDot, desc: 'Redondo, Quadrado, Retangular' },
    { id: 'profiles', label: 'Vigas & Perfis', icon: Landmark, desc: 'Perfis U, Vigas I Laminadas' },
    { id: 'rebar', label: 'Vergalhão', icon: Anchor, desc: 'Gerdau CA-50, CA-60 em Barras' },
    { id: 'wire_mesh', label: 'Telas & Arames', icon: Grid, desc: 'Arame Recozido, Telas p/ Piso' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-auto lg:h-full">
      {/* Tab bar header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Scale className="w-5 h-5 text-orange-500" />
          <span>Calculadora Amigável de Aço</span>
        </h2>
        
        {/* Responsive horizontal category selector */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-5 gap-1.5">
          {categoriesConfig.map((cat) => {
            const IconComp = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-tab-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id as SteelProductCategory)}
                className={`flex flex-row sm:flex-col items-center justify-start sm:justify-center p-2.5 sm:p-2 rounded-xl sm:rounded-2xl border transition text-left sm:text-center space-x-2 sm:space-x-0 sm:space-y-1 ${
                  isSelected 
                    ? 'bg-slate-950 border-slate-950 text-white shadow shadow-orange-500/10' 
                    : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/60'
                }`}
              >
                <IconComp className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
                <span className="text-[10.5px] font-bold tracking-tight truncate leading-none">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 sm:p-6 flex-1 lg:overflow-y-auto space-y-6">
        {/* Product selector dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Material Selecionado</span>
            <span className="text-[10px] lowercase text-slate-400">Padrão Brasileiro</span>
          </label>
          <select
            id="product-selector-field"
            value={selectedProduct?.id || ''}
            onChange={(e) => {
              const p = filteredProducts.find(prod => prod.id === e.target.value);
              if (p) setSelectedProduct(p);
            }}
            className="w-full text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          >
            {filteredProducts.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.standards})
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p className="text-xs text-slate-500 italic px-1 leading-snug">
              {selectedProduct.description}
            </p>
          )}
        </div>

        {/* Dynamic size parameter configurations depending on selected category */}
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Ruler className="w-3.5 h-3.5 text-orange-500" />
            <span>Dimensionar Peças de Aço</span>
          </h3>

          {/* CHAPAS INPUTS */}
          {selectedCategory === 'sheets' && selectedProduct && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Espessura (mm)</label>
                <select
                  id="sheet-thickness-val"
                  value={sheetThickness}
                  onChange={(e) => setSheetThickness(parseFloat(e.target.value))}
                  className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                >
                  {selectedProduct.thicknesses?.map(t => (
                    <option key={t} value={t}>{t.toFixed(2)} mm</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Largura (m)</label>
                <input
                  id="sheet-width-val"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sheetWidth}
                  onChange={(e) => setSheetWidth(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Comprimento (m)</label>
                <input
                  id="sheet-length-val"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={sheetLength}
                  onChange={(e) => setSheetLength(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TUBOS INPUTS */}
          {selectedCategory === 'tubes' && selectedProduct && (
            <div className="space-y-4">
              {/* Tube Type Toggle inside Metalon */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Formato do Perfil do Tubo</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-200/50 p-1 rounded-xl">
                  {(['round', 'square', 'rectangular'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTubeType(t)}
                      className={`text-[11px] py-1.5 font-bold rounded-lg transition ${
                        tubeType === t 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {t === 'round' ? 'Redondo' : t === 'square' ? 'Quadrado' : 'Retangular'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {tubeType === 'round' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Diâmetro Externo (mm)</label>
                    <input
                      id="tube-diameter-val"
                      type="number"
                      step="0.1"
                      min="1"
                      value={tubeDiameter}
                      onChange={(e) => setTubeDiameter(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {tubeType === 'square' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Largura do Lado (mm)</label>
                    <input
                      id="tube-side-val"
                      type="number"
                      step="1"
                      min="5"
                      value={tubeSideA}
                      onChange={(e) => setTubeSideA(Math.max(5, parseFloat(e.target.value) || 0))}
                      className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                {tubeType === 'rectangular' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Lado Maior A (mm)</label>
                      <input
                        id="tube-side-a"
                        type="number"
                        step="1"
                        min="5"
                        value={tubeSideA}
                        onChange={(e) => setTubeSideA(Math.max(5, parseFloat(e.target.value) || 0))}
                        className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Lado Menor B (mm)</label>
                      <input
                        id="tube-side-b"
                        type="number"
                        step="1"
                        min="5"
                        value={tubeSideB}
                        onChange={(e) => setTubeSideB(Math.max(5, parseFloat(e.target.value) || 0))}
                        className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Chapa / Parede (mm)</label>
                  <select
                    id="tube-wall-val"
                    value={wallThickness}
                    onChange={(e) => setWallThickness(parseFloat(e.target.value))}
                    className="w-full text-sm bg-white border border-slate-220 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                  >
                    {selectedProduct.thicknesses?.map(t => (
                      <option key={t} value={t}>{t.toFixed(2)} mm</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Comprimento da Barra (m)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="tube-length-val"
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={tubeLength}
                      onChange={(e) => setTubeLength(parseFloat(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-sm font-semibold text-slate-800 w-16 text-right bg-white border px-2 py-1 rounded bg-slate-50">{tubeLength.toFixed(1)} m</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Barras Industriais padrão têm 6,00m</span>
                </div>
              </div>
            </div>
          )}

          {/* STRUCTURAL BEAMS & PROFILES / REBARS */}
          {(selectedCategory === 'profiles' || selectedCategory === 'rebar') && selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Peso Teórico p/ metro</label>
                  <div className="text-sm font-bold text-slate-800 py-1.5 bg-slate-100 px-3 rounded-lg border">
                    {selectedProduct.unitWeightKgM?.toFixed(3)} kg/m
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Norma de Resistência</label>
                  <div className="text-xs font-semibold text-slate-650 py-2 bg-slate-100 px-3 rounded-lg border truncate">
                    {selectedProduct.standards}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Comprimento Desejado (m)</label>
                <div className="flex items-center space-x-3">
                  <input
                    id="generic-length-val"
                    type="range"
                    min="1"
                    max="12"
                    step="0.5"
                    value={genericLength}
                    onChange={(e) => setGenericLength(parseFloat(e.target.value))}
                    className="flex-1 accent-orange-500"
                  />
                  <span className="text-sm font-semibold text-slate-800 w-16 text-right bg-white border px-2 py-1 rounded bg-slate-50">
                    {genericLength.toFixed(1)} m
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 block mt-1">
                  {selectedCategory === 'rebar' ? 'Vergalhões são trefilados Gerdau (comprimento total original 12m).' : 'Comprimento padrão de barras estruturais: 6,00 metros.'}
                </p>
              </div>
            </div>
          )}

          {/* WIRE & MESH */}
          {selectedCategory === 'wire_mesh' && selectedProduct && (
            <div className="space-y-3">
              {selectedProduct.id === 'tela-eq045' ? (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dimensão do Painel Pronto</label>
                  <p className="text-sm text-slate-800 font-semibold bg-white p-2 border rounded-lg">
                    2,00m largura x 3,00m comprimento (Área: 6m²)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Cada malha estrutural soldada pesa cerca de 4.30kg.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Quantidade de Arame (kg)</label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="wire-weight-val"
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={wireWeightKg}
                      onChange={(e) => setWireWeightKg(parseFloat(e.target.value))}
                      className="flex-1 accent-orange-500"
                    />
                    <span className="text-sm font-semibold text-slate-800 w-20 text-right bg-white border px-2 py-1 rounded bg-slate-50">
                      {wireWeightKg} kg
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">Geralmente vendido por rolo de 1kg ou fardo de 5kg.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quantity and Price options (Negotiation station) */}
        {selectedProduct && selectedProduct.id !== 'arame-recozido-18' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Qtd de Peças/Barras</label>
              <input
                id="quantity-field"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-slate-800 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>
            
            <div className="space-y-2">
              <label id="lbl-negotiated-price" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Preço por Kg (R$)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 border border-emerald-100 rounded font-normal">Negociável</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-400 text-sm font-semibold">R$</span>
                <input
                  id="negotiated-price-field"
                  type="number"
                  step="0.05"
                  min="0.5"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-full text-slate-850 pl-9 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Display calculation breakdown */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-inner relative overflow-hidden">
          {/* Subtle metal texture simulation grids */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent to-slate-950 opacity-15 pointer-events-none"></div>

          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Resultados Teóricos</p>
              <h4 className="font-bold text-sm text-white mt-0.5">{selectedProduct?.name}</h4>
            </div>
            <Archive className="w-5 h-5 text-orange-400 stroke-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/65">
              <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
                <Scale className="w-3 h-3 text-orange-400" />
                <span>Peso Unitário</span>
              </p>
              <p className="text-lg font-bold text-white mt-1">
                {computedWeightPerUnit.toFixed(2)} <span className="text-xs text-slate-450 font-medium font-mono">kg</span>
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Sob densidade padrão 7.85</p>
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/65">
              <p className="text-[10px] text-slate-400 uppercase font-semibold flex items-center space-x-1">
                <Scale className="w-3 h-3 text-orange-500" />
                <span>Peso Total</span>
              </p>
              <p className="text-lg font-bold text-orange-400 mt-1">
                {computedTotalWeight.toFixed(2)} <span className="text-xs text-orange-350/70 font-medium font-mono">kg</span>
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">Multiplicado pelas quantidades</p>
            </div>
          </div>

          <div className="relative pt-2 bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-xl border border-orange-500/20">
            <p className="text-[10px] text-orange-300 font-bold uppercase tracking-wide">Preço Estimado Deste Item</p>
            <div className="flex items-baseline space-x-1.5 mt-1.5">
              <span className="text-sm font-bold text-white">R$</span>
              <span className="text-2xl font-black text-white leading-none">
                {computedTotalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 leading-snug">
              *Baseado em negociação de <span className="text-orange-350 font-bold">R$ {pricePerKg.toFixed(2)} / kg</span>
            </p>
          </div>
        </div>

        {/* Submit action */}
        <button
          id="btn-add-item-to-quote"
          type="button"
          onClick={handleAddToQuote}
          disabled={!selectedProduct}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-98 text-slate-950 hover:text-white font-extrabold text-sm py-4 rounded-2xl shadow-lg shadow-orange-500/10 transition duration-150 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Inserir no Orçamento Ativo</span>
        </button>
      </div>
    </div>
  );
}
