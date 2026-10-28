import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  CreditCard, 
  Banknote, 
  TrendingUp,
  Receipt,
  Layers
} from 'lucide-react';
import { Order, Language, PaymentMethod } from '../types';
import { exportOrdersToCSV } from '../utils/csvExport';

interface SalesReportProps {
  orders: Order[];
  lang: Language;
  onViewReceipt: (order: Order) => void;
}

export const SalesReport: React.FC<SalesReportProps> = ({
  orders,
  lang,
  onViewReceipt,
}) => {
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations for KPI Cards
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const cashTotal = orders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);
  const cardTotal = orders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.total, 0);

  const totalStems = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0),
    0
  );

  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Filtered Orders for the Table
  const filteredOrders = orders.filter((order) => {
    const matchesPayment =
      filterPayment === 'all' || order.paymentMethod === filterPayment;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(
        (it) =>
          it.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          it.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesPayment && matchesSearch;
  });

  const handleDownloadCSV = () => {
    exportOrdersToCSV(filteredOrders, lang);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Export Button Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e8ded8]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-700 text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-['Cairo']">
              {lang === 'ar' ? 'تقرير المبيعات والورد اليومي (Excel)' : 'Daily Flower Sales Report (Excel)'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === 'ar'
              ? 'سجل المعاملات والكميات وطرق الدفع (نقدي/بطاقة) المتوافقة مع معايير المحاسبة'
              : 'Detailed transaction ledger with payment methods, stems sold, and VAT accounting'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-200" />
          <span>{lang === 'ar' ? 'تصدير جدول الإكسل (CSV/Excel)' : 'Export Excel / CSV'}</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8ded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#5a1818] tabular-nums">
            {totalRevenue.toFixed(2)}{' '}
            <span className="text-xs font-bold text-stone-500">
              {lang === 'ar' ? 'ر.س' : 'SAR'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            {orders.length} {lang === 'ar' ? 'فاتورة معتمدة' : 'orders processed'}
          </span>
        </div>

        {/* Card / Mada Total */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8ded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'ar' ? 'مبيعات الشبكة (مدى)' : 'Card / Mada'}
            </span>
            <CreditCard className="w-4 h-4 text-[#5a1818]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums">
            {cardTotal.toFixed(2)}{' '}
            <span className="text-xs font-bold text-stone-500">
              {lang === 'ar' ? 'ر.س' : 'SAR'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            {((cardTotal / (totalRevenue || 1)) * 100).toFixed(0)}% {lang === 'ar' ? 'من الإجمالي' : 'of total'}
          </span>
        </div>

        {/* Cash Total */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8ded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'ar' ? 'المقبوضات النقدية (كاش)' : 'Cash Payments'}
            </span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums">
            {cashTotal.toFixed(2)}{' '}
            <span className="text-xs font-bold text-stone-500">
              {lang === 'ar' ? 'ر.س' : 'SAR'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            {((cashTotal / (totalRevenue || 1)) * 100).toFixed(0)}% {lang === 'ar' ? 'من الإجمالي' : 'of total'}
          </span>
        </div>

        {/* Flower Stems Sold */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8ded8] shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold">
              {lang === 'ar' ? 'أغصان الورد المباعة' : 'Flower Stems Sold'}
            </span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900 tabular-nums">
            {totalStems}{' '}
            <span className="text-xs font-bold text-stone-500">
              {lang === 'ar' ? 'غصن' : 'stems'}
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            {lang === 'ar' ? 'متوسط الفاتورة:' : 'Avg ticket:'} {avgOrderValue.toFixed(0)} SAR
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8ded8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Payment Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterPayment('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPayment === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'ar' ? 'جميع طرق الدفع' : 'All Payments'}
          </button>
          <button
            type="button"
            onClick={() => setFilterPayment('cash')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPayment === 'cash'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'كاش فقط' : 'Cash Only'}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterPayment('card')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPayment === 'card'
                ? 'bg-[#5a1818] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'شبكة / مدى فقط' : 'Card Only'}</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث برقم الفاتورة أو الصنف...' : 'Search order # or flower...'}
            className={`w-full py-2 bg-[#fbf9f8] border border-[#e8ded8] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818] ${
              lang === 'ar' ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
            }`}
          />
        </div>
      </div>

      {/* Excel Spreadsheet Style Table */}
      <div className="bg-white rounded-3xl border border-[#e8ded8] shadow-sm overflow-hidden">
        {/* Spreadsheet Header Bar */}
        <div className="px-5 py-3 bg-[#f5f0ec] border-b border-[#e8ded8] flex items-center justify-between text-xs text-stone-600 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-800">SHEET 1:</span>
            <span>Comaiit_Daily_Sales_{new Date().toISOString().split('T')[0]}.xlsx</span>
          </div>
          <span className="font-sans font-medium text-stone-500">
            {filteredOrders.length} {lang === 'ar' ? 'سجل محاسبي' : 'records found'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-stone-100/80 text-stone-600 font-bold border-b border-stone-200">
                <th className="py-3 px-4 text-center w-12 font-mono text-stone-400">#</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'رقم الفاتورة' : 'Order ID'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'تفاصيل الزهور والكميات' : 'Flowers & Stems'}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</th>
                <th className="py-3 px-4 text-right">{lang === 'ar' ? 'قبل الضريبة' : 'Subtotal'}</th>
                <th className="py-3 px-4 text-right">{lang === 'ar' ? 'الضريبة 15%' : 'VAT 15%'}</th>
                <th className="py-3 px-4 text-right font-black">{lang === 'ar' ? 'الإجمالي (ر.س)' : 'Total (SAR)'}</th>
                <th className="py-3 px-4">{lang === 'ar' ? 'الكاشير' : 'Cashier'}</th>
                <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الفاتورة' : 'Receipt'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-sans">
              {filteredOrders.map((order, idx) => (
                <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-stone-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold font-mono text-[#5a1818]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-600 whitespace-nowrap tabular-nums">
                    <div>{order.date}</div>
                    <div className="text-[11px] text-stone-400">{order.timestamp}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5 max-w-xs">
                      {order.items.map((it, i) => (
                        <div key={i} className="text-xs text-stone-800 flex items-center justify-between gap-2">
                          <span className="truncate">
                            {lang === 'ar' ? it.nameAr : it.nameEn}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-stone-500 whitespace-nowrap">
                            {it.quantity}x @{it.unitPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {order.paymentMethod === 'cash' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <Banknote className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'نقدي (كاش)' : 'Cash'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-[#5a1818] border border-rose-200">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'شبكة / مدى' : 'Card / Mada'}</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                    {order.subtotal.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-stone-600">
                    {order.taxAmount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-black text-stone-900">
                    {order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-stone-600 text-xs truncate max-w-[120px]">
                    {order.cashierName}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(order)}
                      className="p-1.5 text-stone-500 hover:text-[#5a1818] hover:bg-stone-100 rounded-lg transition-colors"
                      title={lang === 'ar' ? 'عرض الفاتورة' : 'View Receipt'}
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-stone-400">
                    {lang === 'ar' ? 'لا توجد معاملات مسجلة في هذا التقرير' : 'No sales records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
