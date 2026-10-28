import React from 'react';
import { Printer, Check, X } from 'lucide-react';
import { Order, Language } from '../types';

interface ReceiptModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfirmDone?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  isOpen,
  onClose,
  lang,
  onConfirmDone,
}) => {
  const [printAccepted, setPrintAccepted] = React.useState(false);

  // Reset print status when new order opens
  React.useEffect(() => {
    if (isOpen) {
      setPrintAccepted(false);
    }
  }, [isOpen, order?.id]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
    setPrintAccepted(true);
  };

  const handleDone = () => {
    if (onConfirmDone) {
      onConfirmDone();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-[#5a1818] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div>
              <span className="font-bold text-sm block leading-tight">
                {lang === 'ar' ? 'تم تأكيد الطلب وحفظه في لوحة الإدارة' : 'Order Confirmed & Saved in Admin'}
              </span>
              <span className="text-[10px] text-rose-100">
                {lang === 'ar' ? 'مسجل في ملف اليوميات وملف الإكسل اليومي' : 'Logged into daily sales file & ledger'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Confirmation Banner */}
        <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-200 flex items-center justify-between text-xs">
          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'ar' ? 'محفوظ في سجل الإدارة (Admin Panel)' : 'Saved in Admin Panel'}
          </span>
          {printAccepted && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] animate-pulse">
              {lang === 'ar' ? '✓ تم قبول الطباعة' : '✓ Print Accepted'}
            </span>
          )}
        </div>

        {/* Thermal Receipt Body (Printable) */}
        <div className="overflow-y-auto p-5 bg-stone-50 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[320px] bg-white p-5 rounded-xl shadow-xs border border-stone-200 text-stone-900 text-xs font-mono space-y-3"
          >
            {/* Header */}
            <div className="text-center space-y-1 pb-3 border-b border-dashed border-stone-300">
              <div className="flex justify-center mb-1">
                <img
                  src="/assets/aistudio/d0d50e28c3b56d04b8ce5b3568658139_tplv-tiktokx-cropcenter_1080_1080_a5199097.jpeg"
                  alt="Comaiit Logo"
                  className="w-12 h-12 rounded-lg object-cover mx-auto"
                />
              </div>
              <h2 className="font-bold text-base font-['Cairo'] text-[#5a1818]">
                كُمَيْت للزهور والهدايا
              </h2>
              <p className="text-[10px] text-stone-500 font-sans">
                Comaiit Florist Boutique - Saudi Arabia
              </p>
              <p className="text-[10px] text-stone-600">
                الرقم الضريبي / VAT: 310849204800003
              </p>
            </div>

            {/* Invoice Info */}
            <div className="space-y-0.5 text-[11px] pb-2 border-b border-dashed border-stone-300">
              <div className="flex justify-between">
                <span className="text-stone-500">رقم الفاتورة / Inv #:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">التاريخ / Date:</span>
                <span>{order.date} {order.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">طريقة الدفع / Payment:</span>
                <span className="font-bold">
                  {order.paymentMethod === 'split'
                    ? 'دفع مشترك (كاش + شبكة)'
                    : order.paymentMethod === 'cash'
                    ? 'كاش / Cash (نقدي)'
                    : 'بطاقة مدى / Card (شبكة)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">الكاشير / Cashier:</span>
                <span>{order.cashierName}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 py-1 border-b border-dashed border-stone-300">
              <div className="flex justify-between font-bold text-stone-500 text-[10px] pb-1 border-b border-stone-200">
                <span>الصنف / Item</span>
                <span>الكمية × السعر</span>
                <span>الإجمالي</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <div className="min-w-0 pr-1">
                    <div className="font-semibold truncate">{item.nameAr}</div>
                    <div className="text-[9px] text-stone-400">
                      {item.priceTier === 'standard' ? 'سعر قياسي' : 'سعر مخفض'}
                    </div>
                  </div>
                  <div className="tabular-nums text-stone-600 whitespace-nowrap">
                    {item.quantity} × {item.unitPrice}
                  </div>
                  <div className="font-bold tabular-nums">
                    {item.lineTotal.toFixed(0)} ر.س
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between text-stone-600">
                <span>المبلغ الخاضع للضريبة / Taxable:</span>
                <span className="tabular-nums">{order.subtotal.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ضريبة القيمة المضافة 15% / VAT:</span>
                <span className="tabular-nums">{order.taxAmount.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-stone-900 text-stone-900">
                <span>الإجمالي شامل الضريبة / Total:</span>
                <span className="tabular-nums text-[#5a1818]">{order.total.toFixed(2)} SAR</span>
              </div>

              {/* Split Payment Breakdown */}
              {order.paymentMethod === 'split' && (
                <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] space-y-0.5 mt-1">
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>مدفوع نقداً (Cash):</span>
                    <span className="tabular-nums">{order.cashReceived?.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#5a1818]">
                    <span>مدفوع بالبطاقة (Card):</span>
                    <span className="tabular-nums">{order.cardAmount?.toFixed(2)} SAR</span>
                  </div>
                </div>
              )}

              {/* Standard Cash Tendered / Change */}
              {order.paymentMethod === 'cash' && order.cashReceived && (
                <>
                  <div className="flex justify-between text-stone-600 pt-1">
                    <span>المبلغ المدفوع / Tendered:</span>
                    <span className="tabular-nums">{order.cashReceived.toFixed(2)} SAR</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>المتبقي للعميل / Change:</span>
                    <span className="tabular-nums">{order.changeGiven?.toFixed(2)} SAR</span>
                  </div>
                </>
              )}
            </div>

            {/* ZATCA QR Code Graphic Simulation */}
            <div className="pt-3 border-t border-dashed border-stone-300 text-center flex flex-col items-center">
              <div className="p-2 bg-white border border-stone-300 rounded-lg shadow-2xs mb-1">
                <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="white" />
                  <rect x="5" y="5" width="26" height="26" fill="black" />
                  <rect x="8" y="8" width="20" height="20" fill="white" />
                  <rect x="12" y="12" width="12" height="12" fill="black" />

                  <rect x="69" y="5" width="26" height="26" fill="black" />
                  <rect x="72" y="8" width="20" height="20" fill="white" />
                  <rect x="76" y="12" width="12" height="12" fill="black" />

                  <rect x="5" y="69" width="26" height="26" fill="black" />
                  <rect x="8" y="72" width="20" height="20" fill="white" />
                  <rect x="12" y="76" width="12" height="12" fill="black" />

                  <rect x="36" y="8" width="5" height="5" fill="black" />
                  <rect x="46" y="12" width="5" height="5" fill="black" />
                  <rect x="54" y="6" width="5" height="5" fill="black" />
                  <rect x="38" y="24" width="5" height="5" fill="black" />
                  <rect x="48" y="22" width="5" height="5" fill="black" />

                  <rect x="12" y="38" width="5" height="5" fill="black" />
                  <rect x="22" y="44" width="5" height="5" fill="black" />
                  <rect x="8" y="52" width="5" height="5" fill="black" />

                  <rect x="36" y="36" width="8" height="8" fill="black" />
                  <rect x="50" y="38" width="6" height="6" fill="black" />
                  <rect x="42" y="48" width="10" height="10" fill="black" />
                  <rect x="60" y="45" width="8" height="8" fill="black" />

                  <rect x="75" y="38" width="6" height="6" fill="black" />
                  <rect x="85" y="48" width="6" height="6" fill="black" />
                  <rect x="70" y="58" width="8" height="8" fill="black" />

                  <rect x="36" y="72" width="6" height="6" fill="black" />
                  <rect x="48" y="75" width="8" height="8" fill="black" />
                  <rect x="42" y="86" width="6" height="6" fill="black" />
                  <rect x="62" y="70" width="8" height="8" fill="black" />
                  <rect x="74" y="82" width="12" height="6" fill="black" />
                  <rect x="82" y="72" width="6" height="6" fill="black" />
                </svg>
              </div>
              <p className="text-[9px] text-stone-500">
                فاتورة ضريبية مبسطة معتمدة - هيئة الزكاة والضريبة والجمارك
              </p>
              <p className="text-[9px] text-stone-400 mt-0.5">
                شكراً لزيارتكم كُمَيْت .. يُترجم مشاعركم
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions: Print Accepted / Confirmed & Done */}
        <div className="p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2.5">
          {/* Action 1: Print / Print Accepted Button */}
          <button
            type="button"
            onClick={handlePrint}
            className={`w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              printAccepted
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/30'
                : 'bg-[#5a1818] hover:bg-[#421010] text-white'
            }`}
          >
            {printAccepted ? (
              <>
                <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>
                  {lang === 'ar'
                    ? 'تم قبول الطباعة / مؤكد (Print Accepted)'
                    : 'Print Accepted / Confirmed'}
                </span>
              </>
            ) : (
              <>
                <Printer className="w-4 h-4 text-amber-300" />
                <span>
                  {lang === 'ar' ? 'طباعة الفاتورة (Print)' : 'Print Receipt'}
                </span>
              </>
            )}
          </button>

          {/* Action 2: Done (تم / Done) Button - Saves to Admin Panel & Closes */}
          <button
            type="button"
            onClick={handleDone}
            className="w-full sm:w-auto py-3 px-6 rounded-xl bg-stone-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{lang === 'ar' ? 'تم (Done)' : 'Done'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
