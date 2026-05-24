import { SteelProduct } from "./types";

export const STEEL_PRODUCTS: SteelProduct[] = [
  // CHAPAS (Category: 'sheets')
  {
    id: "ch-galvanizada",
    name: "Chapa Galvanizada Z275 (Nacional)",
    category: "sheets",
    description: "Chapa de aço revestida com zinco de alta pureza. Excelente durabilidade e maleabilidade para dobra de calhas, rufos e condutores.",
    basePricePerKg: 10.20,
    standards: "NBR 7008 / NBR 6523",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65, 0.80, 0.95] // MSG 28, 26, 24, 22, 20
  },
  {
    id: "ch-galvalume",
    name: "Chapa Galvalume Aluzinc (CSN / Gerdau)",
    category: "sheets",
    description: "Chapa com revestimento de liga de Alumínio e Zinco. Apresenta resistência à corrosão atmosférica até 4 vezes superior ao galvanizado comum.",
    basePricePerKg: 11.50,
    standards: "ASTM A792 / NBR 15578",
    density: 7.80,
    thicknesses: [0.43, 0.50, 0.65, 0.80]
  },
  {
    id: "ch-aluminio",
    name: "Chapa de Alumínio Leve (Liga 1200)",
    category: "sheets",
    description: "Altíssima durabilidade frente à maresia e intempéries. Extremamente leve e fácil de conformar, ideal para acabamentos náuticos ou de alto padrão.",
    basePricePerKg: 28.90,
    standards: "ASTM B209 / NBR ISO 209",
    density: 2.70,
    thicknesses: [0.40, 0.50, 0.70, 0.80, 1.00]
  },
  {
    id: "ch-prepintada",
    name: "Chapa Pré-Pintada Poliéster (Colorida)",
    category: "sheets",
    description: "Base de aço galvanizado revestida com pintura eletrostática líquida contínua. Disponível em Branco, Cinza, Marrom e Preto.",
    basePricePerKg: 14.80,
    standards: "NBR 7008 / Revestimento Poliéster",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65]
  },

  // BOBINAS (Category: 'coils')
  {
    id: "bob-galvanizada",
    name: "Bobina Galvanizada Z275 (Padrão Calheiro)",
    category: "coils",
    description: "Bobinas comerciais destinadas a abastecer dobradoras e conformadoras de fita contínua em obras residenciais ou industriais.",
    basePricePerKg: 9.80,
    standards: "NBR 7008 / CSN",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65, 0.80, 0.95]
  },
  {
    id: "bob-galvalume",
    name: "Bobina Galvalume Plus (Fita contínua)",
    category: "coils",
    description: "Bobina com revestimento liga Al-Zn de alta refletividade de calor e excelente escoamento térmico.",
    basePricePerKg: 10.90,
    standards: "ASTM A792 / CSN",
    density: 7.80,
    thicknesses: [0.43, 0.50, 0.65, 0.80]
  },
  {
    id: "bob-aluminio",
    name: "Bobina de Alumínio (Rolos Fracionados)",
    category: "coils",
    description: "Bobinas leves de alumínio cru para confecção sem emendas de calhas de beiral de grande extensão.",
    basePricePerKg: 27.50,
    standards: "NBR ISO 209 / Alcoa",
    density: 2.70,
    thicknesses: [0.40, 0.50, 0.70, 0.80]
  },
  {
    id: "bob-prepintada",
    name: "Bobina Pré-Pintada Colorida (Fatiada / Slita)",
    category: "coils",
    description: "Bobinas fatiadas slitas prontas para conformador, garantindo durabilidade máxima com pintura original de usina.",
    basePricePerKg: 13.90,
    standards: "NBR 15578 / Colorcoat",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65]
  },

  // CALHAS E RUFOS SOB MEDIDA (Category: 'calhas_rufos')
  {
    id: "calha-moldura",
    name: "Calha Moldura Sob Medida",
    category: "calhas_rufos",
    description: "Calhas conformadas com aba de fixação e acabamento estético em moldura tradicional. Fabricação sob especificação.",
    basePricePerKg: 12.50,
    standards: "Calha Norte Custom",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65]
  },
  {
    id: "calha-platibanda",
    name: "Calha Platibanda / Cocho",
    category: "calhas_rufos",
    description: "Calhas retangulares profundas projetadas para escoamento rápido entre paredes platibanda.",
    basePricePerKg: 12.50,
    standards: "Calha Norte Custom",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65, 0.80]
  },
  {
    id: "rufo-pingadeira",
    name: "Rufo Pingadeira / Capa de Muro",
    category: "calhas_rufos",
    description: "Rufos para proteção de topo de muros e vãos de acabamento contra infiltrações e escorrimentos pluviais.",
    basePricePerKg: 11.90,
    standards: "Calha Norte Custom",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65]
  },
  {
    id: "rufo-encosto",
    name: "Rufo Encosto / Parede",
    category: "calhas_rufos",
    description: "Rufo com aba de assentamento para selagem da junção entre telhas e paredes verticais de tijolo/concreto.",
    basePricePerKg: 11.90,
    standards: "Calha Norte Custom",
    density: 7.85,
    thicknesses: [0.43, 0.50, 0.65]
  }
];

// Caminhões adequados para transporte de material de calheiro
export interface TruckOption {
  name: string;
  maxWeightKg: number;
  description: string;
  icon: string;
  color: string;
}

export const TRUCK_OPTIONS: TruckOption[] = [
  {
    name: "Utilitário Leve (Fiorino / Saveiro / Caminhonete)",
    maxWeightKg: 700,
    description: "Ideal para levar poucos rufos fabricados ou chapas avulsas menores.",
    icon: "CargoCabin",
    color: "emerald"
  },
  {
    name: "Caminhão Urbano Leve (Bongo / HR)",
    maxWeightKg: 1550,
    description: "Recomendado para entregas urbanas ágeis de calhas de 3m a 6m lineares e pequenas bobinas slitas.",
    icon: "TruckFast",
    color: "sky"
  },
  {
    name: "Caminhão 3/4 (VW 8.160 / Cargo)",
    maxWeightKg: 4200,
    description: "Ótima capacidade para fardos de chapas comerciais de 3,00m e bobinas fracionadas medianas.",
    icon: "TruckSimple",
    color: "amber"
  },
  {
    name: "Caminhão Toco (Médio 2 eixos)",
    maxWeightKg: 7000,
    description: "Carga robusta ideal para transportes volumosos de condutores de escoamento e bobinas pesadas de calheiro.",
    icon: "TruckMedium",
    color: "orange"
  },
  {
    name: "Caminhão Truck (Pesado 3 eixos / Carreta)",
    maxWeightKg: 13000,
    description: "Utilizado para transportar bobinas de usina de 10 a 12 toneladas inteiras diretamente da Gerdau/CSN.",
    icon: "TruckHeavy",
    color: "rose"
  }
];

/**
 * Calculadora de Pesos Teóricos de Chapas/Bobinas metalúrgicas
 */
export function calculateSheetWeight(
  widthM: number,
  lengthM: number,
  thicknessMm: number,
  density: number = 7.85
): number {
  // Fórmula: Largura (m) * Comprimento (m) * Espessura (mm) * fator densidade comercial
  return parseFloat((widthM * lengthM * thicknessMm * density).toFixed(2));
}

/**
 * Recomenda o frete ideal de acordo com o peso da proposta
 */
export function getRecommendedTruck(weightKg: number): TruckOption {
  if (weightKg <= 0) return TRUCK_OPTIONS[0];
  for (const option of TRUCK_OPTIONS) {
    if (weightKg <= option.maxWeightKg) {
      return option;
    }
  }
  return TRUCK_OPTIONS[TRUCK_OPTIONS.length - 1];
}

/**
 * Tabela de conversão fidedigna de bitolas comerciais do mercado de calhas
 */
export const BITOLA_CONVERSIONS = [
  { gaugeInches: "MSG 28", gaugeMm: 0.43, designator: "Chapa 28 - Uso Residencial Econômico" },
  { gaugeInches: "MSG 26", gaugeMm: 0.50, designator: "Chapa 26 - Padrão Comercial Calheiro mais Vendido" },
  { gaugeInches: "MSG 24", gaugeMm: 0.65, designator: "Chapa 24 - Uso Residencial Pesado / Industrial" },
  { gaugeInches: "MSG 22", gaugeMm: 0.80, designator: "Chapa 22 - Calhas Prediais e Rufos Estruturais" },
  { gaugeInches: "MSG 20", gaugeMm: 0.95, designator: "Chapa 20 - Chapas de Encosto Pesado / Canaletes" },
  { gaugeInches: "MSG 18", gaugeMm: 1.25, designator: "Chapa 18 - Reforços e Suportes Dobrados" }
];
