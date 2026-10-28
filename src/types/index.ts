export type Language = 'ar' | 'en';

export type PaymentMethod = 'cash' | 'card' | 'split';

export type PriceTier = 'standard' | 'discounted';

export interface BouquetRecipeItem {
  flowerId: string;
  flowerNameAr: string;
  flowerNameEn: string;
  stemsCount: number;
}

export interface FlowerProduct {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'flower' | 'bouquet' | 'coffee' | 'faza' | string;
  standardPrice: number; // Good / Standard price in SAR
  discountedPrice: number; // Low / Offer price in SAR
  priceLabelAr?: {
    standard: string;
    discounted: string;
  };
  priceLabelEn?: {
    standard: string;
    discounted: string;
  };
  stock: number;
  imageUrl: string;
  descriptionAr: string;
  descriptionEn: string;
  recipe?: BouquetRecipeItem[]; // Composition recipe for bouquets (flowers and counts used)
}

export interface CartItem {
  id: string;
  productId: string;
  nameAr: string;
  nameEn: string;
  priceTier: PriceTier;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string; // ISO date string
  timestamp: string; // formatted time e.g. 14:35
  items: {
    productId: string;
    nameAr: string;
    nameEn: string;
    quantity: number;
    priceTier: PriceTier;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  taxAmount: number; // 15% VAT
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  cardAmount?: number; // For card or split payment
  cashierName: string;
}

export type ActiveView = 'pos' | 'sales' | 'admin';
