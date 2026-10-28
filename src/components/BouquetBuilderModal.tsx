import React, { useState } from 'react';
import { X, Plus, Minus, Flower2, Check, ShoppingBag, Layers, Image as ImageIcon } from 'lucide-react';
import { FlowerProduct, Language, PriceTier, BouquetRecipeItem } from '../types';

interface BouquetBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  availableFlowers: FlowerProduct[];
  onSaveBouquetToCatalog: (newBouquet: Omit<FlowerProduct, 'id'>) => void;
  onDirectBuyBouquet: (
    bouquetItem: FlowerProduct,
    tier: PriceTier,
    quantity: number,
    recipe: BouquetRecipeItem[]
  ) => void;
}

export const BouquetBuilderModal: React.FC<BouquetBuilderModalProps> = ({
  isOpen,
  onClose,
  lang,
  availableFlowers,
  onSaveBouquetToCatalog,
  onDirectBuyBouquet,
}) => {
  // Flower stem selections: flowerId -> count
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
  const [customNameAr, setCustomNameAr] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  
  // Extra custom price / fee addition state (رسوم إضافية والتغليف)
  const [extraPriceFee, setExtraPriceFee] = useState<number>(25);

  // Manual total price override toggle and value (تخصيص السعر النهائي الإجمالي)
  const [isPriceOverridden, setIsPriceOverridden] = useState<boolean>(false);
  const [manualTotalPrice, setManualTotalPrice] = useState<number>(150);

  if (!isOpen) return null;

  // Single flowers filter
  const singleFlowers = availableFlowers.filter(
    (p) => p.category === 'flower' || !['bouquet', 'coffee', 'faza'].includes(p.category)
  );

  const handleIncrement = (flowerId: string, maxStock: number) => {
    setSelectedCounts((prev) => {
      const current = prev[flowerId] || 0;
      if (current >= maxStock) return prev;
      return { ...prev, [flowerId]: current + 1 };
    });
  };

  const handleDecrement = (flowerId: string) => {
    setSelectedCounts((prev) => {
      const current = prev[flowerId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[flowerId];
        return next;
      }
      return { ...prev, [flowerId]: current - 1 };
    });
  };

  const handleSetCount = (flowerId: string, count: number, maxStock: number) => {
    const validCount = Math.max(0, Math.min(count, maxStock));
    setSelectedCounts((prev) => {
      if (validCount === 0) {
        const next = { ...prev };
        delete next[flowerId];
        return next;
      }
      return { ...prev, [flowerId]: validCount };
    });
  };

  const handleResetFlower = (flowerId: string) => {
    setSelectedCounts((prev) => {
      const next = { ...prev };
      delete next[flowerId];
      return next;
    });
  };

  // Compile recipe with full flower details including photo thumbnail URL
  const recipeItems: BouquetRecipeItem[] = Object.entries(selectedCounts)
    .filter(([_, count]) => count > 0)
    .map(([fId, count]) => {
      const flower = singleFlowers.find((f) => f.id === fId);
      return {
        flowerId: fId,
        flowerNameAr: flower?.nameAr || 'زهرة',
        flowerNameEn: flower?.nameEn || 'Flower',
        stemsCount: count,
      };
    });

  const totalStems = recipeItems.reduce((sum, r) => sum + r.stemsCount, 0);

  // Dynamic calculation of total flower stems cost based on inventory prices
  const baseFlowerCost = recipeItems.reduce((sum, r) => {
    const flw = singleFlowers.find((f) => f.id === r.flowerId);
    return sum + (flw ? flw.standardPrice * r.stemsCount : 0);
  }, 0);

  // Standard final price calculation or manual override
  const calculatedStandardPrice = Math.max(0, Math.round(baseFlowerCost + (isNaN(extraPriceFee) ? 0 : extraPriceFee)));
  const standardPrice = isPriceOverridden ? Math.max(0, manualTotalPrice) : calculatedStandardPrice;
  const discountedPrice = Math.max(0, Math.round(standardPrice * 0.88));

  // Default suggested names
  const defaultNameAr = customNameAr.trim() || `باقة كُمَيْت المنسقة (${totalStems} غصن)`;
  const defaultNameEn = customNameEn.trim() || `Comaiit Custom Bouquet (${totalStems} stems)`;

  const handleSaveToCatalog = () => {
    if (totalStems === 0) return;

    onSaveBouquetToCatalog({
      nameAr: defaultNameAr,
      nameEn: defaultNameEn,
      category: 'bouquet',
      standardPrice,
      discountedPrice,
      stock: 15,
      imageUrl: '/src/assets/images/luxury_flower_bouquet_1793186094326.jpg',
      descriptionAr: `باقة مخصصة مكونة من: ${recipeItems.map((r) => `${r.stemsCount} ${r.flowerNameAr}`).join(' + ')}`,
      descriptionEn: `Custom bouquet recipe: ${recipeItems.map((r) => `${r.stemsCount}x ${r.flowerNameEn}`).join(', ')}`,
      recipe: recipeItems,
    });
    onClose();
  };

  const handleDirectBuy = () => {
    if (totalStems === 0) return;

    const tempBouquet: FlowerProduct = {
      id: `custom-bq-${Date.now()}`,
      nameAr: defaultNameAr,
      nameEn: defaultNameEn,
      category: 'bouquet',
      standardPrice,
      discountedPrice,
      stock: 99,
      imageUrl: '/src/assets/images/luxury_flower_bouquet_1793186094326.jpg',
      descriptionAr: `باقة مخصصة فورية مكونة من: ${recipeItems.map((r) => `${r.stemsCount} ${r.flowerNameAr}`).join(' + ')}`,
      descriptionEn: `Instant custom bouquet: ${recipeItems.map((r) => `${r.stemsCount}x ${r.flowerNameEn}`).join(', ')}`,
      recipe: recipeItems,
    };

    onDirectBuyBouquet(tempBouquet, 'standard', 1, recipeItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] shadow-2xl border border-stone-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#5a1818] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl text-amber-200">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg font-['Cairo']">
                {lang === 'ar' ? 'تنسيق باقة ورد مخصصة بالأسعار والصور' : 'Custom Bouquet Builder & Pricing'}
              </h2>
              <p className="text-xs text-rose-100/90">
                {lang === 'ar'
                  ? 'اختر الزهور المتاحة من لوحة التحكم، واعرض الصور الصغيرة، واحسب السعر التلقائي مع إضافة أسعار إضافية'
                  : 'Select flowers, view stem photos, calculate exact totals and add custom fees'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Flower Selection List with Photos & Keypad Digit Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              <span className="font-bold text-xs sm:text-sm text-stone-900 font-['Cairo'] flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#5a1818]" />
                {lang === 'ar' ? '1. اختر أنواع الأزهار وأغصانها:' : '1. Select Flowers & Stem Counts:'}
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                {singleFlowers.length} {lang === 'ar' ? 'أصناف زهور' : 'flower options'}
              </span>
            </div>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {singleFlowers.map((flower) => {
                const count = selectedCounts[flower.id] || 0;
                const isSelected = count > 0;
                const isOut = flower.stock <= 0;

                return (
                  <div
                    key={flower.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/30 shadow-xs'
                        : 'bg-[#fbf9f8] border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {/* Flower Thumbnail Photo & Name (Explicitly requested by user) */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-14 h-14 rounded-2xl bg-stone-200 overflow-hidden shrink-0 border-2 border-white shadow-xs">
                        <img
                          src={flower.imageUrl}
                          alt={flower.nameAr}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-900/20 flex items-center justify-center">
                            <span className="px-1.5 py-0.5 bg-[#5a1818] text-white rounded-md text-[10px] font-black font-mono">
                              {count}x
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-extrabold text-sm text-stone-900 truncate">
                          {lang === 'ar' ? flower.nameAr : flower.nameEn}
                        </div>
                        <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                          <span className="font-black text-[#5a1818] font-mono">{flower.standardPrice} SAR/غصن</span>
                          <span>•</span>
                          <span className="text-[11px] text-stone-400">
                            {lang === 'ar' ? `المخزون: ${flower.stock}` : `Stock: ${flower.stock}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stem Count Keypad Buttons (1, 2, 3, 4, 5, 10, 0, ✕) & Numeric Input */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {/* Minus */}
                        <button
                          type="button"
                          disabled={count === 0}
                          onClick={() => handleDecrement(flower.id)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-black flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct Editable Stem Input (Supports typing 13, 14, 25 stems) */}
                        <input
                          type="number"
                          min={0}
                          max={flower.stock}
                          value={count}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            handleSetCount(flower.id, isNaN(val) ? 0 : val, flower.stock);
                          }}
                          className="w-14 h-7 text-center font-mono font-black text-xs sm:text-sm bg-white border border-stone-300 rounded-lg text-[#5a1818] focus:ring-2 focus:ring-[#5a1818]/30 shadow-2xs"
                        />

                        {/* Plus */}
                        <button
                          type="button"
                          disabled={isOut || count >= flower.stock}
                          onClick={() => handleIncrement(flower.id, flower.stock)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#5a1818] font-black flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>

                        {/* Cross (✕) Reset Button */}
                        <button
                          type="button"
                          onClick={() => handleResetFlower(flower.id)}
                          title={lang === 'ar' ? 'إلغاء ومسح هذا النوع (✕)' : 'Reset stem count'}
                          className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-black flex items-center justify-center border border-rose-200 transition-colors cursor-pointer active:scale-95 ml-0.5"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </div>

                      {/* Quick Digit Preset Buttons for fast stem selection [1] [2] [3] [5] [10] [0] [✕] */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 5, 10].map((num) => (
                          <button
                            key={num}
                            type="button"
                            disabled={isOut || num > flower.stock}
                            onClick={() => handleSetCount(flower.id, num, flower.stock)}
                            className={`px-1.5 py-0.5 text-[11px] font-mono font-black rounded-md transition-all cursor-pointer ${
                              count === num
                                ? 'bg-[#5a1818] text-white shadow-2xs scale-105'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Recipe Breakdown with Photos & Comprehensive Price Calculator (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-[#faf8f7] p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="font-extrabold text-sm text-stone-900 font-['Cairo'] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#5a1818]" />
                  {lang === 'ar' ? '2. مكونات الباقة الحالية (بالصور):' : '2. Bouquet Composition (with Photos):'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs font-mono tabular-nums">
                  {totalStems} {lang === 'ar' ? 'غصن' : 'stems'}
                </span>
              </div>

              {/* Recipe List with Photo Thumbnails (Explicit user requirement) */}
              <div className="min-h-[140px] max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {recipeItems.length > 0 ? (
                  recipeItems.map((item) => {
                    const flw = singleFlowers.find((f) => f.id === item.flowerId);
                    const itemTotal = flw ? flw.standardPrice * item.stemsCount : 0;

                    return (
                      <div
                        key={item.flowerId}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-stone-200/90 shadow-2xs gap-2"
                      >
                        {/* Photo Thumbnail + Name */}
                        <div className="flex items-center gap-2 min-w-0">
                          {flw?.imageUrl ? (
                            <img
                              src={flw.imageUrl}
                              alt={item.flowerNameAr}
                              className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                              <Flower2 className="w-4 h-4 text-[#5a1818]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-stone-900 block truncate">
                              {lang === 'ar' ? item.flowerNameAr : item.flowerNameEn}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {flw?.standardPrice} SAR × {item.stemsCount} غصن
                            </span>
                          </div>
                        </div>

                        {/* Stems count & line price */}
                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-950 font-black text-xs font-mono border border-amber-200 block">
                            {item.stemsCount} {lang === 'ar' ? 'غصن' : 'stems'}
                          </span>
                          <span className="text-[11px] font-black text-[#5a1818] font-mono block mt-0.5">
                            {itemTotal} SAR
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-1.5 border border-dashed border-stone-300 rounded-2xl bg-white">
                    <Flower2 className="w-8 h-8 text-stone-300 stroke-[1.5]" />
                    <span>
                      {lang === 'ar'
                        ? 'اختر الزهور من القائمة لإظهار الصور وحساب السعر'
                        : 'Select flowers from the list to preview images and price'}
                    </span>
                  </div>
                )}
              </div>

              {/* Bouquet Name Input */}
              <div className="space-y-1 pt-2 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-800 font-['Cairo']">
                  {lang === 'ar' ? 'اسم الباقة المخصصة:' : 'Bouquet Name:'}
                </label>
                <input
                  type="text"
                  placeholder={
                    lang === 'ar'
                      ? 'مثال: باقة بيبي روز ورود جوري ملكية'
                      : 'e.g. Royal Baby Rose & Red Bouquet'
                  }
                  value={lang === 'ar' ? customNameAr : customNameEn}
                  onChange={(e) => {
                    if (lang === 'ar') setCustomNameAr(e.target.value);
                    else setCustomNameEn(e.target.value);
                  }}
                  className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818]"
                />
              </div>

              {/* Dynamic Price Calculation & Extra Custom Price Additions (Requested by user) */}
              <div className="p-3.5 bg-amber-50/90 rounded-2xl border border-amber-300/80 space-y-2.5 shadow-2xs">
                {/* 1. Base Flower Stems Cost */}
                <div className="flex justify-between items-center text-xs text-stone-700 font-medium">
                  <span>{lang === 'ar' ? 'إجمالي قيمة الأزهار المختارة:' : 'Selected Flowers Cost:'}</span>
                  <span className="font-bold font-mono tabular-nums text-stone-900">{baseFlowerCost} SAR</span>
                </div>

                {/* 2. Extra Price / Fee Addition System (User requested: "আমি এক্সট্রা কিছু প্রাইস অ্যাড করমু") */}
                <div className="space-y-1 pt-1.5 border-t border-amber-200/80">
                  <div className="flex justify-between items-center text-xs font-bold text-amber-950">
                    <span>{lang === 'ar' ? 'إضافة سعر إضافي (تغليف/تنسيق/أخرى):' : 'Add Extra Fee/Markup (SAR):'}</span>
                    <input
                      type="number"
                      min={0}
                      value={extraPriceFee}
                      onChange={(e) => setExtraPriceFee(parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 bg-white border border-amber-300 rounded-lg text-center font-bold text-xs text-amber-950 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 3. Total Custom Price Override Option (User requested: "টোটাল আমি একটা প্রাইস বসামু") */}
                <div className="pt-2 border-t border-amber-300/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-amber-950 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPriceOverridden}
                        onChange={(e) => {
                          setIsPriceOverridden(e.target.checked);
                          if (e.target.checked && manualTotalPrice === 150) {
                            setManualTotalPrice(calculatedStandardPrice || 150);
                          }
                        }}
                        className="rounded text-[#5a1818] focus:ring-[#5a1818]"
                      />
                      <span>{lang === 'ar' ? 'تحديد إجمالي السعر يدوياً (Manual Price):' : 'Set Total Price Manually:'}</span>
                    </label>

                    {isPriceOverridden && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          value={manualTotalPrice}
                          onChange={(e) => setManualTotalPrice(parseFloat(e.target.value) || 0)}
                          className="w-24 p-1 bg-white border border-[#5a1818] rounded-lg text-center font-black text-sm text-[#5a1818] focus:ring-2 focus:ring-[#5a1818]/30"
                        />
                        <span className="text-xs font-bold text-stone-700">SAR</span>
                      </div>
                    )}
                  </div>

                  {/* Calculated vs Final Price display */}
                  <div className="flex justify-between items-center pt-2 border-t border-amber-300 font-black">
                    <div>
                      <span className="text-xs text-amber-950 block">
                        {lang === 'ar' ? 'إجمالي سعر الباقة النهائي:' : 'Final Bouquet Price:'}
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold">
                        {lang === 'ar' ? `السعر المخفض: ${discountedPrice} ر.س` : `Offer Price: ${discountedPrice} SAR`}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-[#5a1818] font-mono tabular-nums">
                        {standardPrice} <span className="text-xs font-extrabold text-stone-700">SAR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions: Save to Catalog OR Direct Buy */}
            <div className="space-y-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                disabled={totalStems === 0}
                onClick={handleDirectBuy}
                className="w-full py-3 px-4 bg-[#5a1818] hover:bg-[#421010] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-amber-300" />
                <span>{lang === 'ar' ? 'إضافة الباقة للطلب والشراء (Buy Now)' : 'Direct Buy Custom Bouquet'}</span>
                <span className="font-mono text-amber-300 font-black ml-1">• {standardPrice} SAR</span>
              </button>

              <button
                type="button"
                disabled={totalStems === 0}
                onClick={handleSaveToCatalog}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold text-xs rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'ar'
                    ? 'حفظ كباقة دائمة في المتجر (Catalog)'
                    : 'Save Bouquet to Store Catalog'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

