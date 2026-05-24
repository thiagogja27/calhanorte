import { SteelProduct } from "./types";

export const STEEL_PRODUCTS: SteelProduct[] = [
  // CHAPAS (Sheets)
  {
    id: "ch-fina-quente",
    name: "Chapa Preta Fina a Quente (ASTM A36)",
    category: "sheets",
    description: "Chapa de aço carbono laminada a quente, ideal para serralheria, estruturas metálicas de médio porte e tampas.",
    basePricePerKg: 8.40,
    standards: "ASTM A36 / NBR 6649",
    density: 7.85,
    thicknesses: [2.00, 2.65, 3.00, 4.75, 6.30, 8.00, 9.50, 12.50] // in mm
  },
  {
    id: "ch-fina-frio",
    name: "Chapa Fina a Frio (Alta Qualidade)",
    category: "sheets",
    description: "Chapa com excelente acabamento superficial, ótima para dobras precisas, painéis elétricos e carenagens industriais.",
    basePricePerKg: 9.20,
    standards: "NBR 5915 / SAE 1008",
    density: 7.85,
    thicknesses: [0.75, 0.90, 1.20, 1.50, 1.90] // in mm
  },
  {
    id: "ch-galvanizada",
    name: "Chapa Zincada Galvanizada (CSN)",
    category: "sheets",
    description: "Chapa revestida de zinco com alta proteção contra corrosão e ferrugem. Ideal para calhas, rufos e ambientes externos.",
    basePricePerKg: 10.10,
    standards: "NBR 7008 / NBR 6523",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.80, 0.95, 1.25, 1.55, 1.95] // in mm
  },
  {
    id: "ch-antiderrapante",
    name: "Chapa Antiderrapante (Piso Xadrez)",
    category: "sheets",
    description: "Chapa estampada em relevo tipo 'pé de galinha', proporcionando alta segurança. Usada em escadas, rampas e pisos de caminhão.",
    basePricePerKg: 9.10,
    standards: "NBR 5590 / ASTM A36",
    density: 7.85,
    thicknesses: [3.00, 4.75, 6.30] // in mm
  },

  // TUBOS (Tubings)
  {
    id: "tub-redondo",
    name: "Tubo Industrial Redondo (Com Costura)",
    category: "tubes",
    description: "Tubo em aço carbono ideal para corrimãos, estruturas leves, escapamentos e estofados industriais.",
    basePricePerKg: 8.70,
    standards: "NBR 6591 / SAE 1008/1010",
    stdLengthM: 6,
    thicknesses: [1.20, 1.50, 2.00, 2.65, 3.00]
  },
  {
    id: "tub-quadrado",
    name: "Tubo Industrial Quadrado (Metalon)",
    category: "tubes",
    description: "O famoso Metalon Quadrado. Essencial para serralheiros na fabricação de portões, grades, mezaninos e mobília industrial.",
    basePricePerKg: 8.90,
    standards: "NBR 6591 / SAE 1008",
    stdLengthM: 6,
    thicknesses: [1.20, 1.50, 2.00, 2.65, 3.00, 4.75]
  },
  {
    id: "tub-retangular",
    name: "Tubo Industrial Retangular (Metalon)",
    category: "tubes",
    description: "Metalon Retangular ideal para vigamento leve, estruturas de portão e quadros de painel. Excelente resistência torcional.",
    basePricePerKg: 8.95,
    standards: "NBR 6591 / ASTM A500",
    stdLengthM: 6,
    thicknesses: [1.20, 1.50, 2.00, 2.65, 3.00, 4.75]
  },

  // PERFIS E VIGAS (Profiles/Beams)
  {
    id: "viga-u-simples",
    name: "Perfil U Simples Dobrado de Chapa",
    category: "profiles",
    description: "Perfil de aço estrutural aberto em formato de U, muito leve. Utilizado em terças de telhado, portões e galpões.",
    basePricePerKg: 8.30,
    standards: "ASTM A36 / NBR 6355",
    stdLengthM: 6,
    unitWeightKgM: 4.54 // Average reference for standard commercial 75x40 U profile
  },
  {
    id: "viga-u-enrijecido",
    name: "Perfil U Enrijecido Dobrado de Chapa",
    category: "profiles",
    description: "Perfil em formato U com abas dobradas voltadas para o interior, dobrando a resistência mecânica sob cargas de flambagem.",
    basePricePerKg: 8.50,
    standards: "ASTM A36 / NBR 6355",
    stdLengthM: 6,
    unitWeightKgM: 5.62 // Average core profile 100x40x15x2.0
  },
  {
    id: "viga-i-gerdau",
    name: "Viga I Laminada de Alta Resistência",
    category: "profiles",
    description: "Viga pesada com padrão de qualidade Gerdau para mezaninos industriais, pontes rolantes, vigamento estrutural pesado e fundações.",
    basePricePerKg: 9.60,
    standards: "ASTM A36 / ASTM A572 Gr. 50",
    stdLengthM: 6,
    unitWeightKgM: 13.00 // Standard designators like W150x13
  },

  // VERGALHÃO (Rebars)
  {
    id: "verg-ca50-10",
    name: "Vergalhão Gerdau CA-50 (10.0mm / Bitola 3/8\")",
    category: "rebar",
    description: "Aço nervurado de alta aderência ao concreto. O preferido das construtoras para vigas, colunas, lajes e sapatas estruturais.",
    basePricePerKg: 9.50,
    standards: "NBR 7480 CA-50 Gerdau",
    stdLengthM: 12,
    unitWeightKgM: 0.617
  },
  {
    id: "verg-ca50-8",
    name: "Vergalhão Gerdau CA-50 (8.0mm / Bitola 5/16\")",
    category: "rebar",
    description: "Vergalhão Gerdau de bitola intermediária, excelente para estribos pesados, amarrações de pilares e armações de concreto armado.",
    basePricePerKg: 9.50,
    standards: "NBR 7480 CA-50 Gerdau",
    stdLengthM: 12,
    unitWeightKgM: 0.395
  },
  {
    id: "verg-ca60-5",
    name: "Vergalhão Gerdau CA-60 (5.0mm / Bitola 3/16\")",
    category: "rebar",
    description: "Aço trefilado com alta resistência limite de escoamento. Essencial para fabricação de estribos padrão, sapatas leves e telas eletrosoldadas.",
    basePricePerKg: 9.80,
    standards: "NBR 7480 CA-60 Gerdau",
    stdLengthM: 12,
    unitWeightKgM: 0.154
  },

  // ARAMES E TELAS (Wire Mesh)
  {
    id: "arame-recozido-18",
    name: "Arame Recozido Gerdau BWG 18",
    category: "wire_mesh",
    description: "Arame de extrema maleabilidade, ideal para amarração rápida de vergalhões e fixação de estribos em obras de concreto armado.",
    basePricePerKg: 13.50,
    standards: "SAE 1006 Gerdau",
    unitWeightKgM: 1.00 // Sold per kg units directly
  },
  {
    id: "tela-eq045",
    name: "Tela Eletrosoldada Nervurada Gerdau EQ-045",
    category: "wire_mesh",
    description: "Painel soldado pronto de 2,00m de largura por 3,00m de comprimento. Impede rachaduras em calçadas, lajes e pisos mecânicos de concreto.",
    basePricePerKg: 11.20,
    standards: "NBR 7481 Gerdau",
    unitWeightKgM: 4.30 // Weight of 1 full panel (6m²)
  }
];

// Reference standard truck limits in Brazil for steel distribution
export interface TruckOption {
  name: string;
  maxWeightKg: number;
  description: string;
  icon: string;
  color: string;
}

export const TRUCK_OPTIONS: TruckOption[] = [
  {
    name: "Utilitário Leve (Fiorino / Saveiro)",
    maxWeightKg: 650,
    description: "Recomendado apenas para pequenas barras cortadas, arames ou poucas telas.",
    icon: "CargoCabin",
    color: "emerald"
  },
  {
    name: "Caminhão Urbano Leve (Bongo / HR)",
    maxWeightKg: 1500,
    description: "Ideal para entregas rápidas na cidade, tubos de 6m com bandeirolas e chapas medianas.",
    icon: "TruckFast",
    color: "sky"
  },
  {
    name: "Caminhão 3/4 (VW 8.160 ou similar)",
    maxWeightKg: 4000,
    description: "Capacidade ideal para lote médio de vergalhões, perfis abertos de 6m e chapas pesadas.",
    icon: "TruckSimple",
    color: "amber"
  },
  {
    name: "Caminhão Toco (2 eixos)",
    maxWeightKg: 6000,
    description: "Excelente para carregar feixes inteiros de ferro CA-50 dobrados e bobinas médias.",
    icon: "TruckMedium",
    color: "orange"
  },
  {
    name: "Caminhão Truck (3 eixos)",
    maxWeightKg: 12000,
    description: "Para cargas expressivas de vigas I de 12 metros, fardos de chapas laminadas de usina.",
    icon: "TruckHeavy",
    color: "rose"
  },
  {
    name: "Carreta Metálica (Múltiplos eixos)",
    maxWeightKg: 27000,
    description: "Carga pesada fechada industrial para fardos maciços ou bobinas de usinas (CSN/Usiminas).",
    icon: "TruckTrailer",
    color: "dark"
  }
];

/**
 * Calculators for Steel Weights
 */
export function calculateSheetWeight(
  widthM: number,
  lengthM: number,
  thicknessMm: number,
  density: number = 7.85
): number {
  // Formula: Largura (m) * Comprimento (m) * Espessura (mm) * fator densidade (7.85 para aço)
  return parseFloat((widthM * lengthM * thicknessMm * density).toFixed(2));
}

export function calculateRoundTubeWeight(
  outerDiameterMm: number,
  wallThicknessMm: number,
  lengthM: number
): number {
  // Formula física aproximada: (diametro - espessura) * espessura * 0.02466 (fator do aço) * comprimento
  // Peso por metro linear * comprimento
  const weightPerMeter = (outerDiameterMm - wallThicknessMm) * wallThicknessMm * 0.02466;
  return parseFloat((weightPerMeter * lengthM).toFixed(2));
}

export function calculateSquareTubeWeight(
  sideMm: number,
  wallThicknessMm: number,
  lengthM: number
): number {
  // Metalon Quadrado aproximado: peso por metro linear = 4 * (lado - espessura) * espessura * 0.00785
  const weightPerMeter = 4 * (sideMm - wallThicknessMm) * wallThicknessMm * 0.00785;
  return parseFloat((weightPerMeter * lengthM).toFixed(2));
}

export function calculateRectangularTubeWeight(
  heightMm: number,
  widthMm: number,
  wallThicknessMm: number,
  lengthM: number
): number {
  // Metalon Retangular aproximado: peso por metro = 2 * (altura + largura - 2 * espessura) * espessura * 0.00785
  const weightPerMeter = 2 * (heightMm + widthMm - 2 * wallThicknessMm) * wallThicknessMm * 0.00785;
  return parseFloat((weightPerMeter * lengthM).toFixed(2));
}

/**
 * Recommends the ideal transport according to load weight in Kg
 */
export function getRecommendedTruck(weightKg: number): TruckOption {
  if (weightKg <= 0) return TRUCK_OPTIONS[0];
  for (const option of TRUCK_OPTIONS) {
    if (weightKg <= option.maxWeightKg) {
      return option;
    }
  }
  return TRUCK_OPTIONS[TRUCK_OPTIONS.length - 1]; // maximum carrier
}

/**
 * Helpful conversion helper
 */
export const BITOLA_CONVERSIONS = [
  { gaugeInches: "3/16\"", gaugeMm: 4.75, designator: "Fina (Bitola 18 MSG)" },
  { gaugeInches: "1/4\"", gaugeMm: 6.30, designator: "Médio CA-50 / Chapa 1/4\"" },
  { gaugeInches: "5/16\"", gaugeMm: 8.00, designator: "Estribos Médios / Chapa 5/16\"" },
  { gaugeInches: "3/8\"", gaugeMm: 10.00, designator: "Vergalhão 3/8\" / Estrutural" },
  { gaugeInches: "1/2\"", gaugeMm: 12.50, designator: "Vergalhão Pesado / Chapa Grossa" },
  { gaugeInches: "5/8\"", gaugeMm: 16.00, designator: "Fundações / Ancoragem" },
  { gaugeInches: "3/4\"", gaugeMm: 19.00, designator: "Tirante / Reforço Pesado" },
  { gaugeInches: "1\"", gaugeMm: 25.40, designator: "Eixo Maciço / Barra Redonda" }
];
