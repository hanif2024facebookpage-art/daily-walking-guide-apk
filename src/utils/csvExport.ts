import { Order, Language } from '../types';

export function exportOrdersToCSV(orders: Order[], lang: Language) {
  // UTF-8 BOM to prevent Excel from garbling Arabic characters
  const BOM = '\uFEFF';

  const headersAr = [
    'رقم الفاتورة',
    'التاريخ',
    'الوقت',
    'تفاصيل الأصناف والكميات',
    'إجمالي عدد الأغصان',
    'طريقة الدفع',
    'المبلغ الخاضع للضريبة (ر.س)',
    'ضريبة القيمة المضافة 15% (ر.س)',
    'الإجمالي شامل الضريبة (ر.س)',
    'المبلغ المستلم',
    'المتبقي للعميل',
    'اسم الكاشير',
  ];

  const headersEn = [
    'Order Number',
    'Date',
    'Time',
    'Items & Quantities',
    'Total Stems Count',
    'Payment Method',
    'Taxable Subtotal (SAR)',
    'VAT 15% (SAR)',
    'Grand Total (SAR)',
    'Cash Received',
    'Change Given',
    'Cashier Name',
  ];

  const headers = lang === 'ar' ? headersAr : headersEn;

  const rows = orders.map((order) => {
    const itemsDescription = order.items
      .map(
        (it) =>
          `${lang === 'ar' ? it.nameAr : it.nameEn} (${it.quantity}x @ ${it.unitPrice} SAR [${
            it.priceTier === 'standard'
              ? lang === 'ar'
                ? 'قياسي'
                : 'Std'
              : lang === 'ar'
                ? 'مخفض'
                : 'Disc'
          }])`
      )
      .join(' | ');

    const totalStems = order.items.reduce((sum, it) => sum + it.quantity, 0);

    const paymentLabel =
      order.paymentMethod === 'cash'
        ? lang === 'ar'
          ? 'نقدي (كاش)'
          : 'Cash'
        : order.paymentMethod === 'split'
          ? lang === 'ar'
            ? `دفع مشترك (كاش ${order.cashReceived || 0} + شبكة ${order.cardAmount || 0})`
            : `Split (Cash ${order.cashReceived || 0} + Card ${order.cardAmount || 0})`
          : lang === 'ar'
            ? 'شبكة / بطاقة (مدى)'
            : 'Card / Mada';

    return [
      `"${order.orderNumber}"`,
      `"${order.date}"`,
      `"${order.timestamp}"`,
      `"${itemsDescription.replace(/"/g, '""')}"`,
      totalStems,
      `"${paymentLabel}"`,
      order.subtotal.toFixed(2),
      order.taxAmount.toFixed(2),
      order.total.toFixed(2),
      order.cashReceived ? order.cashReceived.toFixed(2) : '-',
      order.changeGiven ? order.changeGiven.toFixed(2) : '-',
      `"${order.cashierName}"`,
    ].join(',');
  });

  const csvContent = BOM + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const todayStr = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `Comaiit_Sales_Report_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
