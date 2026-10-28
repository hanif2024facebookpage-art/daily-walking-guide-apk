import React, { useState } from 'react';
import { 
  Search, 
  AlertCircle, 
  Flower2, 
  Coffee, 
  ShoppingBag, 
  X, 
  Minus,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { FlowerProduct, Language, PriceTier, CartItem } from '../types';

interface POSCatalogProps {
  products: FlowerProduct[];
  lang: Language;
  showStock: boolean;
  customerOrder: CartItem[];
  onRemoveCustomerOrderItem: (id: string) => void;
  onClearCustomerOrder: () => void;
  onCheckoutCustomerOrder: () => void;
  onBuyNow: (product: FlowerProduct, priceTier: PriceTier, quantity: number) => void;
  onOpenBouquetBuilder?: () => void;
}

export const POSCatalog: React.FC<POSCatalogProps> = ({
  products,
  lang,
  showStock,
  customerOrder,
  onRemoveCustomerOrderItem,
  onClearCustomerOrder,
  onCheckoutCustomerOrder,
  onBuyNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('flower');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Per-card local state for chosen quantity (1-100) and chosen price tier
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});
  const [cardTiers, setCardTiers] = useState<Record<string, PriceTier>>({});

  // 4 Core Options in English with dedicated logos: Flower, Bouquet, Coffee, Faza
  const mainCategories = [
    {
      id: 'flower',
      nameEn: 'Flower',
      subtitleAr: 'زهور طبيعية',
      icon: <Flower2 className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'bouquet',
      nameEn: 'Bouquet',
      subtitleAr: 'باقات فاخرة',
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 7.5a3 3 0 1 0-2.8-4 3 3 0 0 0 2.8 4Z" />
          <path d="m6.5 10.5 2.5-4.5" />
          <path d="m17.5 10.5-2.5-4.5" />
          <path d="M7 11a2.5 2.5 0 1 0-2-4 2.5 2.5 0 0 0 2 4Z" />
          <path d="M17 11a2.5 2.5 0 1 0 2-4 2.5 2.5 0 0 0-2 4Z" />
          <path d="M12 8v9" />
          <path d="m8.5 11 3 6" />
          <path d="m15.5 11-3 6" />
          <path d="M9 17h6" />
          <path d="m9 17-2.5 4.5" />
          <path d="m15 17 2.5 4.5" />
        </svg>
      ),
    },
    {
      id: 'coffee',
      nameEn: 'Coffee',
      subtitleAr: 'قهوة كُمَيْت',
      icon: <Coffee className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'faza',
      nameEn: 'Faza',
      subtitleAr: 'فازات ومزهريات',
      icon: (
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 4h6" />
          <path d="M10 4v2c-2.5 2-3.5 5-3.5 8a5.5 5.5 0 0 0 11 0c0-3-1-6-3.5-8V4" />
          <path d="M9.5 20h5" />
          <path d="M12 4V1" />
          <circle cx="12" cy="1" r="1" fill="currentColor" />
        </svg>
      ),
    },
  ];

  // Strict category filtering: In flower tab, ONLY flower items show.
  // In bouquet tab, ONLY bouquets show. In coffee tab, ONLY coffee. In faza, ONLY faza.
  const filteredProducts = products.filter((product) => {
    const categoryMatches = product.category === selectedCategory;

    const matchesSearch =
      product.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionAr.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && matchesSearch;
  });

  const getCardQuantity = (prodId: string) => cardQuantities[prodId] ?? 1;
  const setCardQuantity = (prodId: string, qty: number) => {
    const sanitized = isNaN(qty) ? 1 : Math.max(1, Math.min(100, qty));
    setCardQuantities((prev) => ({ ...prev, [prodId]: sanitized }));
  };

  const getCardTier = (prodId: string): PriceTier => cardTiers[prodId] || 'standard';
  const setCardTier = (prodId: string, tier: PriceTier) => {
    setCardTiers((prev) => ({ ...prev, [prodId]: tier }));
  };

  // Popular quick-selection chips for flowers (specifically highlighting 1, 2, 5, 10, 13, 20, 25, 50, 100)
  const quickQuantityChips = [1, 2, 5, 10, 13, 20, 25, 50, 100];

  const customerOrderTotal = customerOrder.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-24">
      {/* Category Tabs & Search Row */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#e8ded8] mb-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'ar'
                ? 'ابحث بالاسم العربي أو الإنجليزي (مثل: ورد جوري، بيبي روز، توليب، ليليوم، كاسابلانكا، دوار الشمس...)'
                : 'Search catalog (e.g. Red Rose, Baby Rose, Tulip, Lilium, Casablanca, Sunflower...)'
            }
            className={`w-full py-2.5 bg-[#fbf9f8] border border-[#e8ded8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818] transition-all ${
              lang === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
            }`}
          />
        </div>

        {/* 4 Category Options in English with Logos: Flower, Bouquet, Coffee, Faza */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {mainCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border transition-all text-left active:scale-[0.98] cursor-pointer ${
                  isActive
                    ? 'bg-[#5a1818] text-white border-[#421010] shadow-md ring-2 ring-[#5a1818]/20'
                    : 'bg-[#fbf9f8] hover:bg-[#f5ece7] text-stone-800 border-stone-200/90 hover:border-[#5a1818]/30 shadow-2xs'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-white/20 text-amber-200'
                      : 'bg-[#5a1818]/10 text-[#5a1818]'
                  }`}
                >
                  {cat.icon}
                </div>

                <div className="min-w-0">
                  <div className="font-extrabold text-sm sm:text-base leading-tight tracking-wide font-['Plus_Jakarta_Sans']">
                    {cat.nameEn}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-rose-100/90' : 'text-stone-500'
                    }`}
                  >
                    {cat.subtitleAr}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 overflow-y-auto pr-1">
        {filteredProducts.map((flower) => {
          const isLowStock = flower.stock <= 20;
          const isOutOfStock = flower.stock <= 0;
          const isFlower = flower.category === 'flower';
          const isBouquet = flower.category === 'bouquet';
          const isFaza = flower.category === 'faza';

          // 1 to 100 selector is dedicated to flowers
          const qty = isFlower ? getCardQuantity(flower.id) : 1;
          const activeTier = getCardTier(flower.id);
          const currentPrice =
            activeTier === 'standard' ? flower.standardPrice : flower.discountedPrice;
          const totalPrice = currentPrice * qty;

          return (
            <div
              key={flower.id}
              className="group bg-white rounded-2xl border border-[#e8ded8] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Image & Stock Badge Header */}
              <div className="relative aspect-[16/11] bg-stone-100 overflow-hidden">
                <img
                  src={flower.imageUrl}
                  alt={lang === 'ar' ? flower.nameAr : flower.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  referrerPolicy="no-referrer"
                />

                {/* Stock Level Badge */}
                {showStock && (
                  <div
                    className={`absolute top-2.5 ${lang === 'ar' ? 'left-2.5' : 'right-2.5'} px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-xs ${
                      isOutOfStock
                        ? 'bg-rose-900/90 text-white'
                        : isLowStock
                        ? 'bg-amber-600/90 text-white'
                        : 'bg-stone-900/80 text-emerald-300'
                    }`}
                  >
                    {isOutOfStock ? (
                      <span>{lang === 'ar' ? 'نفد المخزون' : 'Out of Stock'}</span>
                    ) : (
                      <span>
                        {flower.stock} {isBouquet ? (lang === 'ar' ? 'باقة' : 'bouquets') : isFaza ? (lang === 'ar' ? 'فازة' : 'vases') : (lang === 'ar' ? 'غصن' : 'stems')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 leading-snug line-clamp-1">
                    {lang === 'ar' ? flower.nameAr : flower.nameEn}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                    {lang === 'ar' ? flower.nameEn : flower.nameAr}
                  </p>

                  {/* If Bouquet has a recipe, display ingredients */}
                  {flower.recipe && flower.recipe.length > 0 && (
                    <div className="mt-2.5 p-2 bg-rose-50/80 rounded-xl border border-rose-200/70 text-xs text-stone-700">
                      <span className="font-bold text-[#5a1818] block mb-1 text-[11px]">
                        {lang === 'ar' ? '🌸 مكونات الباقة (Bouquet Recipe):' : '🌸 Bouquet Recipe Ingredients:'}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {flower.recipe.map((r, i) => (
                          <span
                            key={i}
                            className="bg-white px-2 py-0.5 rounded-lg border border-rose-200/90 font-mono font-bold text-[11px] text-stone-800 shadow-2xs"
                          >
                            {r.stemsCount}x {lang === 'ar' ? r.flowerNameAr : r.flowerNameEn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 1. Dual-Pricing Selection Buttons: Good / Standard vs Low / Offer */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-stone-400">
                    <span>{lang === 'ar' ? 'السعر (اختر الفئة):' : 'Price Tier:'}</span>
                    <span className="font-bold text-stone-700">
                      {lang === 'ar' ? 'الإجمالي:' : 'Total:'} <span className="text-[#5a1818] font-black">{totalPrice} SAR</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Price 1: Standard / Good Price */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setCardTier(flower.id, 'standard')}
                      className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
                        activeTier === 'standard'
                          ? 'bg-[#5a1818] text-white border-[#421010] shadow-xs ring-2 ring-[#5a1818]/20'
                          : 'bg-[#fbf9f8] hover:bg-stone-100 text-stone-800 border-stone-200'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium ${
                          activeTier === 'standard' ? 'text-rose-100' : 'text-stone-500'
                        }`}
                      >
                        {lang === 'ar' ? 'سعر قياسي' : 'Standard'}
                      </span>
                      <span
                        className={`font-black text-sm sm:text-base tabular-nums ${
                          activeTier === 'standard' ? 'text-white' : 'text-[#5a1818]'
                        }`}
                      >
                        {flower.standardPrice} {lang === 'ar' ? 'ر.س' : 'SAR'}
                      </span>
                    </button>

                    {/* Price 2: Low / Offer Price */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => setCardTier(flower.id, 'discounted')}
                      className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border transition-all active:scale-95 disabled:opacity-40 cursor-pointer ${
                        activeTier === 'discounted'
                          ? 'bg-amber-600 text-white border-amber-700 shadow-xs ring-2 ring-amber-500/20'
                          : 'bg-amber-50/60 hover:bg-amber-100 text-amber-900 border-amber-200'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium ${
                          activeTier === 'discounted' ? 'text-amber-100' : 'text-amber-700'
                        }`}
                      >
                        {lang === 'ar' ? 'سعر مخفض' : 'Offer Price'}
                      </span>
                      <span
                        className={`font-black text-sm sm:text-base tabular-nums ${
                          activeTier === 'discounted' ? 'text-white' : 'text-amber-900'
                        }`}
                      >
                        {flower.discountedPrice} {lang === 'ar' ? 'ر.س' : 'SAR'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Flexible Quantity Selector for Flower (ONLY under Flower Option, with prominent large quantity number) */}
                {isFlower && (
                  <div className="space-y-2 pt-2 border-t border-stone-100 bg-[#fdfcfb] p-3 rounded-2xl border border-stone-200/90">
                    {/* Stepper Header with Large Centered Quantity Number */}
                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-stone-200/80 shadow-2xs">
                      <span className="text-xs font-bold text-stone-600 font-['Cairo']">
                        {lang === 'ar' ? 'الكمية:' : 'Quantity:'}
                      </span>

                      {/* Large Stepper Controls (-  [ 1 ]  +) */}
                      <div className="flex items-center gap-2">
                        {/* Minus */}
                        <button
                          type="button"
                          disabled={isOutOfStock || qty <= 1}
                          onClick={() => setCardQuantity(flower.id, qty - 1)}
                          className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer transition-all active:scale-95 shadow-2xs"
                          title="-1"
                        >
                          <Minus className="w-4 h-4 stroke-[2.5]" />
                        </button>

                        {/* Large, Bold, Prominent Editable Quantity Input (Large "1" / "11" / "12" / "13" Display) */}
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={999}
                            value={qty}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setCardQuantity(flower.id, isNaN(val) ? 1 : val);
                            }}
                            className="w-20 h-10 text-center font-mono font-black text-xl sm:text-2xl bg-white border-2 border-[#5a1818] rounded-xl text-[#5a1818] focus:outline-none focus:ring-2 focus:ring-[#5a1818]/30 shadow-xs tabular-nums"
                          />
                        </div>

                        {/* Plus */}
                        <button
                          type="button"
                          disabled={isOutOfStock || qty >= 999}
                          onClick={() => setCardQuantity(flower.id, qty + 1)}
                          className="w-9 h-9 rounded-xl bg-[#5a1818] hover:bg-[#421010] text-white font-black flex items-center justify-center disabled:opacity-30 cursor-pointer transition-all active:scale-95 shadow-2xs"
                          title="+1"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Digit Keypad Buttons (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0, ✕) */}
                    <div className="space-y-1 pt-1">
                      <div className="grid grid-cols-6 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((num) => {
                          const isSelected = qty === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                // If clicked right after another digit, append to form e.g. 11, 12, 13, 14
                                const currentStr = String(qty);
                                if (currentStr.length === 1 && currentStr !== '0') {
                                  const combined = parseInt(currentStr + String(num), 10);
                                  if (!isNaN(combined) && combined <= 999) {
                                    setCardQuantity(flower.id, combined);
                                    return;
                                  }
                                }
                                setCardQuantity(flower.id, num);
                              }}
                              className={`h-8 text-xs sm:text-sm font-mono font-black rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-30 ${
                                isSelected
                                  ? 'bg-[#5a1818] text-white shadow-xs ring-2 ring-[#5a1818]/30 scale-105'
                                  : 'bg-white hover:bg-amber-50 text-stone-800 border border-stone-200 shadow-2xs hover:border-amber-300'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-6 gap-1">
                        {[7, 8, 9, 10, 0].map((num) => {
                          const isSelected = qty === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                if (num === 0) {
                                  // append 0 e.g. 1 -> 10, 2 -> 20
                                  const combined = parseInt(String(qty) + '0', 10);
                                  setCardQuantity(flower.id, isNaN(combined) ? 10 : combined);
                                } else {
                                  setCardQuantity(flower.id, num);
                                }
                              }}
                              className={`h-7 text-xs font-mono font-black rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-30 ${
                                isSelected
                                  ? 'bg-[#5a1818] text-white shadow-xs ring-2 ring-[#5a1818]/30 scale-105'
                                  : num === 10
                                  ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 font-bold'
                                  : 'bg-white hover:bg-amber-50 text-stone-800 border border-stone-200 shadow-2xs'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}

                        {/* SINGLE Cross Button (✕) on the card for clearing/resetting to 1 */}
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setCardQuantity(flower.id, 1)}
                          title={lang === 'ar' ? 'إلغاء ومسح الكمية (✕)' : 'Reset Quantity (✕)'}
                          className="h-7 text-xs font-black rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 flex items-center justify-center cursor-pointer active:scale-95 shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Action Button: Prominent "Buy Now" button ONLY (Clean & Beautiful) */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => onBuyNow(flower, activeTier, qty)}
                    className="w-full py-3 px-4 bg-[#5a1818] hover:bg-[#421010] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer group/btn"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300 transition-transform group-hover/btn:scale-110" />
                    <span>{lang === 'ar' ? 'اشتري الآن (Buy Now)' : 'Buy Now'}</span>
                    <span className="opacity-40 mx-0.5">•</span>
                    <span className="font-mono text-amber-300 font-black">{totalPrice} SAR</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center text-stone-500 bg-white rounded-2xl border border-dashed border-stone-300">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            <p className="font-medium text-sm">
              {lang === 'ar' ? 'لا توجد أصناف مطابقة لخيارات البحث' : 'No items matched your search'}
            </p>
          </div>
        )}
      </div>

      {/* Floating Bottom Customer Order Bar (if multi-item order in progress) */}
      {customerOrder.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#5a1818] shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left: Summary of Customer Items */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto py-1">
              <div className="p-2 rounded-xl bg-[#5a1818] text-white shrink-0 flex items-center gap-1.5 shadow-xs">
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span className="font-extrabold text-xs">
                  {customerOrder.length} {lang === 'ar' ? 'أصناف محددة للعميل' : 'items selected'}
                </span>
              </div>

              {/* Badges of items selected for this customer */}
              <div className="flex items-center gap-2 overflow-x-auto pr-1">
                {customerOrder.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs shrink-0 shadow-2xs"
                  >
                    <span className="font-bold text-stone-900">
                      {it.quantity}x {lang === 'ar' ? it.nameAr : it.nameEn}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-semibold text-[10px]">
                      {it.priceTier === 'standard' ? (lang === 'ar' ? 'قياسي' : 'Std') : (lang === 'ar' ? 'مخفض' : 'Offer')}
                    </span>
                    <span className="font-black text-[#5a1818] font-mono">
                      {it.unitPrice * it.quantity} SAR
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomerOrderItem(it.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-stone-200 rounded-md transition-colors"
                      title={lang === 'ar' ? 'حذف من الطلب' : 'Remove'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Grand Total & Checkout Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block font-semibold">
                  {lang === 'ar' ? 'إجمالي طلب العميل:' : 'Order Total:'}
                </span>
                <span className="font-black text-xl text-[#5a1818] tabular-nums font-mono">
                  {customerOrderTotal} <span className="text-xs">SAR</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClearCustomerOrder}
                  className="p-2.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title={lang === 'ar' ? 'إلغاء وتفريغ طلب العميل' : 'Clear Order'}
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={onCheckoutCustomerOrder}
                  className="py-3 px-5 bg-[#5a1818] hover:bg-[#421010] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                  <span>
                    {lang === 'ar'
                      ? 'إتمام طلب العميل والطباعة (Checkout)'
                      : 'Checkout Customer Order'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
