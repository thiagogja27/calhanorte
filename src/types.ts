export type SteelProductCategory = 'sheets' | 'coils' | 'calhas_rufos' | 'telhas' | 'condutores' | 'chamines' | 'pu40' | 'servicos' | 'extras';

export interface SteelProduct {
  id: string;
  name: string;
  category: SteelProductCategory;
  description: string;
  basePricePerKg: number; // For weight-based calculation (R$ / kg)
  standards: string; // e.g., "ABNT 1010/1020", "ASTM A36", "CA-50 Gerdau"
  imageUrl?: string;
  // Metadata for custom calculators
  density?: number; // default 7.85 for steel
  unitWeightKgM?: number; // for bars (weight per meter) or whole unit weight (for meshes)
  stdLengthM?: number; // e.g., 6 meters or 12 meters
  thicknesses?: number[]; // standard gauges in mm
}

export interface QuoteItem {
  id: string;
  product: SteelProduct;
  quantity: number;
  
  // Custom sizing inputs for the calculator
  widthM?: number;    // for sheets
  lengthM?: number;   // for sheets, tubes, profiles
  thicknessMm?: number; // for sheets, tubings
  outerDiameterMm?: number; // for round tubes
  wallThicknessMm?: number; // for tubings
  
  // Computed values
  calculatedWeightKg: number;
  unitPrice: number; // based on user adjustments or R$ / kg
  totalPrice: number;
}

export interface Quote {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerCompany?: string;
  items: QuoteItem[];
  discountPercent: number;
  additionPercent: number;
  freightCost: number;
  validityDays: number;
  date: string;
  totalWeightKg: number;
  totalPriceBrl: number;
  notes?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
