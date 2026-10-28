import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  CheckCircle, 
  ShoppingBag, 
  Split
} from 'lucide-react';
import { Language, PaymentMethod, PriceTier } from '../types';

export interface CheckoutOrderItem {
  productId: string;
  nameAr: string;
  nameEn: string;
  priceTier: PriceTier;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface QuickCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  items: CheckoutOrderItem[];
  onConfirmOrder: (
    items: CheckoutOrderItem[],
    paymentMethod: PaymentMethod,
    cashAmount?: number,
    cardAmount?: number
  ) => void;
}

export const QuickCheckoutModal: React.FC<QuickCheckoutModalProps> = ({
  isOpen,
  onClose,
  lang,
  items,
  onConfirmOrder,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitCard, setSplitCard] = useState<string>('');

  const totalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const subtotal = totalAmount / 1.15;
  const taxAmount = totalAmount - subtotal;

  // Initialize split amounts when total changes
  useEffect(() => {
    if (isOpen && totalAmount > 0) {
      // Default split: half cash, half card
      const half = Math.round(totalAmount / 2);
      setSplitCash(String(half));
      setSplitCard(String(totalAmount - half));
      setCashTendered(String(totalAmount));
    }
  }, [isOpen, totalAmount]);

  if (!isOpen || items.length === 0) return null;

  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, cashNum - totalAmount);

  const splitCashNum = parseFloat(splitCash) || 0;
  const splitCardNum = parseFloat(splitCard) || 0;
  const splitTotal = splitCashNum + splitCardNum;
  const isSplitValid = Math.abs(splitTotal - totalAmount) < 0.01;

  // Handle changing split cash -> auto adjust split card
  const handleSplitCashChange = (val: string) => {
    setSplitCash(val);
    const parsed = parseFloat(val) || 0;
    const remaining = Math.max(0, totalAmount - parsed);
    setSplitCard(String(Math.round(remaining * 100) / 100));
  };

  const handleConfirm = () => {
    if (paymentMethod === 'split') {
      onConfirmOrder(items, 'split', splitCashNum, splitCardNum);
    } else if (paymentMethod === 'cash') {
      onConfirmOrder(items, 'cash', cashNum || totalAmount, 0);
    } else {
      onConfirmOrder(items, 'card', 0, totalAmount);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 bg-[#5a1818] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/10 rounded-xl text-amber-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg font-['Cairo']">
                {lang === 'ar' ? 'تأكيد طلب العميل والدفع' : 'Customer Order Checkout'}
              </h2>
              <p className="text-[11px] text-rose-100/90">
                {items.length}{' '}
                {lang === 'ar' ? 'أصناف محددة في هذا الطلب' : 'items selected for customer'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Itemized Order List for this Customer */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-stone-500 font-bold">
              <span>{lang === 'ar' ? 'أصناف طلب العميل:' : "Customer's Items:"}</span>
              <span>{items.reduce((s, it) => s + it.quantity, 0)} {lang === 'ar' ? 'قطعة/غصن' : 'units'}</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#fcfbf9] rounded-xl border border-stone-200/80 gap-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-stone-200 overflow-hidden shrink-0 border border-stone-200">
                      <img
                        src={it.imageUrl}
                        alt={it.nameAr}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {lang === 'ar' ? it.nameAr : it.nameEn}
                      </div>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            it.priceTier === 'standard'
                              ? 'bg-rose-50 text-[#5a1818] border border-rose-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {it.priceTier === 'standard'
                            ? lang === 'ar' ? 'سعر قياسي' : 'Standard'
                            : lang === 'ar' ? 'سعر مخفض' : 'Offer'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-stone-700">
                          {it.quantity} × {it.unitPrice} SAR
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-black font-mono text-sm text-[#5a1818] tabular-nums shrink-0">
                    {it.quantity * it.unitPrice} SAR
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Selection: Cash vs Card vs Split (Cash + Card) */}
          <div className="space-y-2 pt-2 border-t border-stone-200">
            <label className="block text-xs font-bold text-stone-800 font-['Cairo']">
              {lang === 'ar' ? 'طريقة الدفع (كاش، شبكة، أو دفع مشترك):' : 'Payment Method:'}
            </label>

            <div className="grid grid-cols-3 gap-2">
              {/* Option 1: Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'bg-[#5a1818] text-white border-[#421010] shadow-md ring-2 ring-[#5a1818]/20'
                    : 'bg-[#fbf9f8] hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-amber-300' : 'text-[#5a1818]'}`} />
                <span className="font-bold text-xs">
                  {lang === 'ar' ? 'شبكة / مدى' : 'Card'}
                </span>
              </button>

              {/* Option 2: Cash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600/20'
                    : 'bg-[#fbf9f8] hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <Banknote className={`w-5 h-5 ${paymentMethod === 'cash' ? 'text-emerald-200' : 'text-emerald-700'}`} />
                <span className="font-bold text-xs">
                  {lang === 'ar' ? 'كاش / نقدي' : 'Cash'}
                </span>
              </button>

              {/* Option 3: Split (Cash + Card) - Requested by User */}
              <button
                type="button"
                onClick={() => setPaymentMethod('split')}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'split'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-500/20'
                    : 'bg-[#fbf9f8] hover:bg-amber-50 text-stone-800 border-stone-200'
                }`}
              >
                <Split className={`w-5 h-5 ${paymentMethod === 'split' ? 'text-amber-100' : 'text-amber-600'}`} />
                <span className="font-bold text-xs">
                  {lang === 'ar' ? 'دفع مشترك' : 'Split Pay'}
                </span>
                <span className={`text-[9px] ${paymentMethod === 'split' ? 'text-amber-100' : 'text-stone-400'}`}>
                  {lang === 'ar' ? 'كاش + شبكة' : 'Cash + Card'}
                </span>
              </button>
            </div>
          </div>

          {/* SPLIT PAYMENT CONTROLS (Requested by user: some cash, some card) */}
          {paymentMethod === 'split' && (
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex justify-between items-center text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1">
                  <Split className="w-3.5 h-3.5 text-amber-700" />
                  {lang === 'ar' ? 'توزيع المبلغ بين الكاش والشبكة:' : 'Split Cash & Card Allocation:'}
                </span>
                <span className="tabular-nums font-mono">
                  {totalAmount} SAR
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Cash Portion */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{lang === 'ar' ? 'المبلغ نقداً (كاش):' : 'Cash Amount (SAR):'}</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalAmount}
                    value={splitCash}
                    onChange={(e) => handleSplitCashChange(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-center font-bold text-base text-emerald-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Card Portion */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-[#5a1818]" />
                    <span>{lang === 'ar' ? 'المبلغ بالبطاقة (شبكة):' : 'Card Amount (SAR):'}</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={totalAmount}
                    value={splitCard}
                    onChange={(e) => setSplitCard(e.target.value)}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-center font-bold text-base text-[#5a1818] focus:ring-2 focus:ring-[#5a1818]"
                  />
                </div>
              </div>

              {/* Quick Split Buttons: Half/Half, 50 SAR Cash, 100 SAR Cash */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSplitCashChange(String(Math.round(totalAmount / 2)))}
                  className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100"
                >
                  {lang === 'ar' ? 'مناصفة 50% / 50%' : '50/50 Half'}
                </button>
                {totalAmount >= 50 && (
                  <button
                    type="button"
                    onClick={() => handleSplitCashChange('50')}
                    className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    50 SAR {lang === 'ar' ? 'كاش والباقي شبكة' : 'Cash'}
                  </button>
                )}
                {totalAmount >= 100 && (
                  <button
                    type="button"
                    onClick={() => handleSplitCashChange('100')}
                    className="px-2 py-0.5 rounded-lg bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100"
                  >
                    100 SAR {lang === 'ar' ? 'كاش والباقي شبكة' : 'Cash'}
                  </button>
                )}
              </div>

              {/* Split Summary Status */}
              <div className="flex justify-between items-center text-xs pt-1 border-t border-amber-200">
                <span className="text-stone-600">
                  {lang === 'ar' ? 'مجموع الكاش والشبكة:' : 'Total Allocated:'}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isSplitValid ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {splitTotal} / {totalAmount} SAR {isSplitValid ? '✓' : '(غير متطابق)'}
                </span>
              </div>
            </div>
          )}

          {/* Single Cash Mode: Tendered & Change */}
          {paymentMethod === 'cash' && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">
                  {lang === 'ar' ? 'المبلغ المستلم نقداً من العميل:' : 'Cash Tendered (SAR):'}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {lang === 'ar' ? `المطلوب: ${totalAmount} ر.س` : `Due: ${totalAmount} SAR`}
                </span>
              </div>

              <input
                type="number"
                placeholder={String(totalAmount)}
                value={cashTendered}
                onChange={(e) => setCashTendered(e.target.value)}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl text-center font-bold text-lg text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Quick Cash buttons */}
              <div className="flex gap-1.5 justify-center">
                {[totalAmount, 50, 100, 200, 500]
                  .filter((v, i, a) => a.indexOf(v) === i && v >= totalAmount)
                  .slice(0, 4)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCashTendered(String(val))}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-300 cursor-pointer"
                    >
                      {val} SAR
                    </button>
                  ))}
              </div>

              {cashNum > totalAmount && (
                <div className="flex justify-between text-xs font-bold text-emerald-900 pt-1 border-t border-emerald-200">
                  <span>{lang === 'ar' ? 'الباقي للعميل:' : 'Change Due:'}</span>
                  <span className="tabular-nums font-mono text-sm">{changeDue.toFixed(2)} SAR</span>
                </div>
              )}
            </div>
          )}

          {/* Breakdown: VAT 15% & Grand Total */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <div className="flex justify-between text-stone-500">
              <span>{lang === 'ar' ? 'المبلغ قبل الضريبة:' : 'Subtotal (Excl. VAT):'}</span>
              <span className="tabular-nums">{subtotal.toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
              <span className="tabular-nums">{taxAmount.toFixed(2)} SAR</span>
            </div>
            <div className="flex justify-between font-black text-base text-stone-900 pt-1.5 border-t border-stone-200">
              <span>{lang === 'ar' ? 'إجمالي طلب العميل:' : 'Total Amount Due:'}</span>
              <span className="tabular-nums text-[#5a1818] text-lg font-black">{totalAmount.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            disabled={paymentMethod === 'split' && !isSplitValid}
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-[#5a1818] hover:bg-[#421010] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-amber-300" />
            <span>
              {lang === 'ar'
                ? 'تأكيد الطلب وإصدار الفاتورة (Confirm Order)'
                : 'Confirm Order & Print Receipt'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
