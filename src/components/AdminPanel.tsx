import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Package, 
  Layers,
  Lock,
  Sparkles,
  FileSpreadsheet,
  Calendar,
  Download,
  CreditCard,
  Banknote,
  Receipt,
  FileText,
  Upload,
  Image as ImageIcon,
  Flower2,
  Coffee,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Split,
  CheckCircle2,
  Minus
} from 'lucide-react';
import { FlowerProduct, Language, Order, BouquetRecipeItem } from '../types';
import { exportOrdersToCSV } from '../utils/csvExport';

interface AdminPanelProps {
  products: FlowerProduct[];
  orders: Order[];
  lang: Language;
  showStock: boolean;
  onToggleStock: () => void;
  onAddProduct: (product: Omit<FlowerProduct, 'id'>) => void;
  onUpdateProduct: (product: FlowerProduct) => void;
  onDeleteProduct: (id: string) => void;
  onQuickRestock: (id: string, amount: number) => void;
  isAuthenticated: boolean;
  onAuthenticate: (pin: string) => boolean;
  onLogoutAdmin: () => void;
  onViewReceipt?: (order: Order) => void;
}

type AdminTab = 'add_products' | 'order_stats' | 'daily_orders';
type ProductFormCategory = 'flower' | 'bouquet' | 'coffee' | 'faza';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  orders,
  lang,
  showStock,
  onToggleStock,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onQuickRestock,
  isAuthenticated,
  onAuthenticate,
  onLogoutAdmin,
  onViewReceipt,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // 3 Primary Admin Pages requested by user:
  // 1. 'add_products' (প্রোডাক্ট অ্যাড করার পেজ ও ক্যাটালগ)
  // 2. 'order_stats' (অর্ডারের পরিমাণ ও পরিসংখ্যান)
  // 3. 'daily_orders' (আজকের অর্ডার এবং প্রতিদিনের অর্ডারের ফাইলসমূহ)
  const [activeTab, setActiveTab] = useState<AdminTab>('add_products');

  // Filter in Add Products tab for existing items
  const [catalogFilterCategory, setCatalogFilterCategory] = useState<string>('all');

  // Selected date filter in daily orders
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Modal State for Add / Edit
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FlowerProduct | null>(null);

  // 4 Product Form Categories: Flower, Bouquet, Coffee, Faza
  const [selectedFormCategory, setSelectedFormCategory] = useState<ProductFormCategory>('flower');

  // Bouquet specific state: composition recipe of flower stems & extra fees
  const [bouquetStems, setBouquetStems] = useState<Record<string, number>>({});
  const [adminExtraPaperFee, setAdminExtraPaperFee] = useState<number>(30);

  // Image upload state
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    standardPrice: 20,
    discountedPrice: 15,
    stock: 50,
    imageUrl: '/src/assets/images/flower_red_rose_1793182282218.jpg',
    descriptionAr: '',
    descriptionEn: '',
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAuthenticate(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  // Open Form to Add New Product under specific category
  const openAddProductModal = (category: ProductFormCategory = 'flower') => {
    setSelectedFormCategory(category);
    setEditingProduct(null);
    setBouquetStems({});

    const defaultImages: Record<ProductFormCategory, string> = {
      flower: '/src/assets/images/flower_red_rose_1793182282218.jpg',
      bouquet: '/src/assets/images/luxury_flower_bouquet_1793186094326.jpg',
      coffee: '/src/assets/images/coffee_saudi_latte_1793183277320.jpg',
      faza: '/src/assets/images/faza_luxury_vase_1793183277028.jpg',
    };

    setFormData({
      nameAr: '',
      nameEn: '',
      standardPrice: category === 'bouquet' ? 180 : category === 'faza' ? 120 : category === 'coffee' ? 24 : 18,
      discountedPrice: category === 'bouquet' ? 150 : category === 'faza' ? 95 : category === 'coffee' ? 20 : 14,
      stock: category === 'bouquet' ? 15 : category === 'faza' ? 20 : 50,
      imageUrl: defaultImages[category],
      descriptionAr: '',
      descriptionEn: '',
    });
    setUploadedImagePreview(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal for an existing product
  const openEditProductModal = (product: FlowerProduct) => {
    setEditingProduct(product);
    setSelectedFormCategory(product.category as ProductFormCategory);
    
    // If bouquet has recipe, prefill
    if (product.recipe && product.recipe.length > 0) {
      const stemsMap: Record<string, number> = {};
      product.recipe.forEach((r) => {
        stemsMap[r.flowerId] = r.stemsCount;
      });
      setBouquetStems(stemsMap);
    } else {
      setBouquetStems({});
    }

    setFormData({
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      standardPrice: product.standardPrice,
      discountedPrice: product.discountedPrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
    });
    setUploadedImagePreview(product.imageUrl);
    setIsFormModalOpen(true);
  };

  // Handle Photo Upload from Laptop or Mobile Device
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setUploadedImagePreview(result);
      setFormData((prev) => ({ ...prev, imageUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  // Single flowers available to compose a bouquet
  const availableFlowersForBouquet = products.filter((p) => p.category === 'flower');

  // Handle stem count increment / decrement
  const handleStemChange = (flowerId: string, delta: number) => {
    setBouquetStems((prev) => {
      const current = prev[flowerId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) {
        const next = { ...prev };
        delete next[flowerId];
        return next;
      }
      return { ...prev, [flowerId]: updated };
    });
  };

  // Save form handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Compile recipe if category is bouquet
    let recipeItems: BouquetRecipeItem[] | undefined = undefined;
    if (selectedFormCategory === 'bouquet') {
      recipeItems = Object.entries(bouquetStems)
        .filter(([_, count]) => count > 0)
        .map(([fId, count]) => {
          const flw = availableFlowersForBouquet.find((f) => f.id === fId);
          return {
            flowerId: fId,
            flowerNameAr: flw?.nameAr || 'زهرة',
            flowerNameEn: flw?.nameEn || 'Flower',
            stemsCount: count,
          };
        });
    }

    const payload = {
      nameAr: formData.nameAr.trim(),
      nameEn: formData.nameEn.trim(),
      category: selectedFormCategory,
      standardPrice: Number(formData.standardPrice),
      discountedPrice: Number(formData.discountedPrice),
      stock: Number(formData.stock),
      imageUrl: formData.imageUrl,
      descriptionAr: formData.descriptionAr.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      recipe: recipeItems,
    };

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...payload,
      });
    } else {
      onAddProduct(payload);
    }

    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  // Orders statistics calculations
  const totalOrdersCount = orders.length;
  const totalLifetimeRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const ordersByDate = orders.reduce<Record<string, Order[]>>((acc, order) => {
    const d = order.date || '2026-10-28';
    if (!acc[d]) acc[d] = [];
    acc[d].push(order);
    return acc;
  }, {});

  const datesList = Object.keys(ordersByDate).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];

  const todayOrders = orders.filter((o) => o.date === todayStr);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayCash = todayOrders.reduce((sum, o) => {
    if (o.paymentMethod === 'cash') return sum + o.total;
    if (o.paymentMethod === 'split') return sum + (o.cashReceived || 0);
    return sum;
  }, 0);
  const todayCard = todayOrders.reduce((sum, o) => {
    if (o.paymentMethod === 'card') return sum + o.total;
    if (o.paymentMethod === 'split') return sum + (o.cardAmount || 0);
    return sum;
  }, 0);

  const displayedOrders = selectedDateFilter === 'all'
    ? orders
    : orders.filter((o) => o.date === selectedDateFilter);

  const handleExportDateFile = (dateKey: string) => {
    const dateOrders = ordersByDate[dateKey] || [];
    exportOrdersToCSV(dateOrders, lang);
  };

  // Category options for product adding
  const categoryOptions = [
    {
      id: 'flower' as ProductFormCategory,
      nameEn: 'Flower',
      nameAr: 'أزهار طبيعية',
      nameBn: 'ফ্লাওয়ার',
      desc: lang === 'ar' ? 'إضافة ورد منفرد وسيقان أزهار' : 'Add individual flower stems',
      icon: <Flower2 className="w-5 h-5 text-rose-600" />,
    },
    {
      id: 'bouquet' as ProductFormCategory,
      nameEn: 'Bouquet',
      nameAr: 'باقات فاخرة',
      nameBn: 'বুকে',
      desc: lang === 'ar' ? 'تنسيق باقة من عدة أزهار مع رفع صورة' : 'Compose bouquet from flowers with photo upload',
      icon: (
        <svg
          className="w-5 h-5 text-amber-700"
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
        </svg>
      ),
    },
    {
      id: 'coffee' as ProductFormCategory,
      nameEn: 'Coffee',
      nameAr: 'قهوة كُمَيْت',
      nameBn: 'কফি',
      desc: lang === 'ar' ? 'مشروبات القهوة المختصة واللاتيه' : 'Specialty coffee and drinks',
      icon: <Coffee className="w-5 h-5 text-amber-800" />,
    },
    {
      id: 'faza' as ProductFormCategory,
      nameEn: 'Faza',
      nameAr: 'فازات ومزهريات',
      nameBn: 'ফাজা',
      desc: lang === 'ar' ? 'فازات كريستال وسيراميك ورخام' : 'Luxury vases and decor vessels',
      icon: (
        <svg
          className="w-5 h-5 text-stone-700"
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

  // PIN Authentication Screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-[#e8ded8] shadow-sm text-center">
        <div className="w-14 h-14 bg-[#5a1818]/10 text-[#5a1818] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-stone-900 font-['Cairo']">
          {lang === 'ar' ? 'لوحة تحكم كُمَيْت (Admin Panel)' : 'Comaiit Admin Panel'}
        </h2>
        <p className="text-xs text-stone-500 mt-1 mb-6">
          {lang === 'ar'
            ? 'يرجى إدخال رمز المرور السري (الرمز الافتراضي: 1234)'
            : 'Please enter the admin PIN code (Default PIN: 1234)'}
        </p>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-widest text-2xl py-3 bg-[#fbf9f8] border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818]"
            />
            {pinError && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium">
                {lang === 'ar' ? 'رمز المرور غير صحيح! جرب 1234' : 'Incorrect PIN! Try 1234'}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#5a1818] hover:bg-[#421010] text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            {lang === 'ar' ? 'تسجيل الدخول للمدير' : 'Unlock Admin Panel'}
          </button>

          <button
            type="button"
            onClick={() => onAuthenticate('1234')}
            className="text-xs text-stone-400 hover:text-stone-600 underline pt-2 block mx-auto cursor-pointer"
          >
            {lang === 'ar' ? 'دخول سريع تجريبي (1234)' : 'Quick Demo Bypass (1234)'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#e8ded8]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#5a1818] text-white shadow-xs">
              <Package className="w-5 h-5 text-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 font-['Cairo']">
              {lang === 'ar' ? 'لوحة تحكم المدير كُمَيْت' : 'Comaiit Admin Dashboard'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {lang === 'ar'
              ? 'إضافة المنتجات (زهور، باقات، قهوة، فازات)، إحصائيات الطلبات، وملفات المبيعات اليومية'
              : 'Add products (Flower, Bouquet, Coffee, Faza), order volume stats, and daily sales files'}
          </p>
        </div>

        {/* Top Actions: Stock visibility and Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              showStock
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-stone-100 border-stone-300 text-stone-600'
            }`}
          >
            {showStock ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-stone-500" />}
            <span>{showStock ? (lang === 'ar' ? 'المخزون ظاهر' : 'Stock Visible') : (lang === 'ar' ? 'المخزون مخفي' : 'Stock Hidden')}</span>
          </button>

          <button
            type="button"
            onClick={onLogoutAdmin}
            className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors cursor-pointer"
            title={lang === 'ar' ? 'قفل لوحة التحكم' : 'Lock Admin'}
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3 Main Admin Navigation Tabs (Exact user requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200">
        {/* Tab 1: Product Add & Catalog */}
        <button
          type="button"
          onClick={() => setActiveTab('add_products')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'add_products'
              ? 'bg-[#5a1818] text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Plus className="w-4 h-4 text-amber-300 stroke-[2.5]" />
          <span>{lang === 'ar' ? 'صفحة إضافة المنتجات (Add Products)' : 'Add Products & Catalog'}</span>
        </button>

        {/* Tab 2: Orders Volume & Statistics */}
        <button
          type="button"
          onClick={() => setActiveTab('order_stats')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'order_stats'
              ? 'bg-[#5a1818] text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-300" />
          <span>{lang === 'ar' ? 'أرقام وإحصائيات الطلبات (Order Volume)' : 'Order Volume & Analytics'}</span>
        </button>

        {/* Tab 3: Today's Orders & Daily Date Files */}
        <button
          type="button"
          onClick={() => setActiveTab('daily_orders')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'daily_orders'
              ? 'bg-[#5a1818] text-white shadow-md'
              : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-300" />
          <span>{lang === 'ar' ? 'طلبات اليوم وملفات التواريخ (Daily Files)' : 'Today & Daily Date Files'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 1: ADD PRODUCTS & CATALOG (প্রোডাক্ট অ্যাড করার একটা পেজ)             */}
      {/* ========================================================================= */}
      {activeTab === 'add_products' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Dedicated Custom Bouquet Arranger Banner inside Admin Panel (Requested by user) */}
          <div className="bg-gradient-to-r from-[#5a1818] via-[#782323] to-[#5a1818] text-white p-5 rounded-3xl shadow-md border border-[#421010] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0 border border-white/20 shadow-xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg font-['Cairo'] text-white">
                    {lang === 'ar' ? 'تنسيق وإضافة باقة مخصصة جديدة (Bouquet Creator)' : 'Custom Bouquet Creator & Recipe Arranger'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                    {lang === 'ar' ? 'حصري للمدير' : 'Admin'}
                  </span>
                </div>
                <p className="text-xs text-rose-100/90 mt-1 max-w-2xl">
                  {lang === 'ar'
                    ? 'اختر الزهور المكونة للباقة (ورد جوري، بيبي روز، جيبسي، كريس...) مع تحديد عدد كل زهرة، وارفع صورة الباقة مباشرة من جهازك بالسعر الذي تحدده'
                    : 'Select flowers (Rose, Baby Rose, Gypsy, Cres...) with stem counts, set custom prices, and upload photo from laptop/mobile'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAddProductModal('bouquet')}
              className="w-full md:w-auto px-5 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'ar' ? '+ تنسيق باقة جديدة' : '+ Add Custom Bouquet'}</span>
            </button>
          </div>

          {/* 4 Dedicated Quick-Add Cards for the 4 Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-extrabold text-stone-900 font-['Cairo'] flex items-center gap-2">
                <span>{lang === 'ar' ? 'إضافة صنف جديد حسب القسم (اختر القسم):' : 'Add New Item by Category:'}</span>
              </h2>
              <span className="text-xs text-stone-500 font-medium">
                {lang === 'ar' ? 'يدعم رفع الصور مباشرة من الجوال أو اللابتوب' : 'Supports photo upload from laptop & mobile'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {categoryOptions.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 rounded-xl bg-stone-100 group-hover:bg-[#5a1818]/10 transition-colors">
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 uppercase">
                      {cat.nameEn}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base leading-snug">
                      {cat.nameEn} <span className="text-xs text-stone-500 font-normal">({cat.nameAr})</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openAddProductModal(cat.id)}
                    className="w-full py-2.5 px-3 bg-[#5a1818] hover:bg-[#421010] active:scale-95 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {lang === 'ar'
                        ? `+ إضافة ${cat.nameAr}`
                        : `+ Add ${cat.nameEn}`}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Catalog Inventory Table */}
          <div className="bg-white rounded-3xl border border-[#e8ded8] shadow-sm overflow-hidden space-y-0">
            <div className="p-4 bg-[#fbf9f8] border-b border-[#e8ded8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#5a1818]" />
                <h3 className="font-bold text-sm text-stone-800 font-['Cairo']">
                  {lang === 'ar' ? 'قائمة الأصناف الحالية في المتجر' : 'Current Store Inventory'}
                </h3>
                <span className="text-xs bg-stone-200/80 text-stone-700 px-2 py-0.5 rounded-full font-bold">
                  {products.length}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto">
                {['all', 'flower', 'bouquet', 'coffee', 'faza'].map((catKey) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCatalogFilterCategory(catKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      catalogFilterCategory === catKey
                        ? 'bg-white text-[#5a1818] shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {catKey === 'all'
                      ? (lang === 'ar' ? 'الكل' : 'All')
                      : catKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Cards View for Smartphone screens */}
            <div className="block md:hidden divide-y divide-stone-100">
              {products
                .filter(
                  (p) =>
                    catalogFilterCategory === 'all' ||
                    p.category === catalogFilterCategory
                )
                .map((prod) => {
                  const isLow = prod.stock <= 20;

                  return (
                    <div key={prod.id} className="p-3.5 space-y-2.5 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={prod.imageUrl}
                            alt={prod.nameAr}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-extrabold text-sm text-stone-900 truncate">{prod.nameAr}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-bold shrink-0 capitalize">
                              {prod.category}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 truncate">{prod.nameEn}</div>
                          {prod.recipe && prod.recipe.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {prod.recipe.map((r, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.2 bg-rose-50 text-[#5a1818] border border-rose-200 rounded text-[10px] font-mono font-bold"
                                >
                                  {r.stemsCount}x {r.flowerNameAr}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs bg-[#fcfbf9] p-2 rounded-xl border border-stone-200">
                        <div>
                          <span className="text-stone-500 text-[11px] block">{lang === 'ar' ? 'السعر القياسي / المخفض:' : 'Prices:'}</span>
                          <div className="flex items-center gap-2 font-mono font-black">
                            <span className="text-[#5a1818]">{prod.standardPrice} SAR</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-amber-800">{prod.discountedPrice} SAR</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-stone-500 text-[11px] block">{lang === 'ar' ? 'المخزون:' : 'Stock:'}</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums inline-block ${
                            isLow ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-stone-100 text-stone-800'
                          }`}>
                            {prod.stock} {lang === 'ar' ? 'قطعة' : 'units'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-stone-400 font-bold ml-1">{lang === 'ar' ? 'تزويد:' : '+:'}</span>
                          {[10, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => onQuickRestock(prod.id, amt)}
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-stone-100 hover:bg-[#5a1818] hover:text-white text-stone-800 transition-colors cursor-pointer border border-stone-200"
                            >
                              +{amt}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(prod)}
                            className="px-3 py-1.5 bg-[#5a1818] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(prod.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title={lang === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Desktop / Tablet Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <th className="py-3 px-4 w-16">{lang === 'ar' ? 'الصورة' : 'Photo'}</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'اسم الصنف' : 'Item Name'}</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'القسم' : 'Category'}</th>
                    <th className="py-3 px-4 text-right">
                      <div className="text-[#5a1818]">{lang === 'ar' ? 'السعر القياسي' : 'Standard'}</div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="text-amber-800">{lang === 'ar' ? 'السعر المخفض' : 'Offer'}</div>
                    </th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'المخزون' : 'Stock'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'تزويد سريع' : 'Quick Restock'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {products
                    .filter(
                      (p) =>
                        catalogFilterCategory === 'all' ||
                        p.category === catalogFilterCategory
                    )
                    .map((prod) => {
                      const isLow = prod.stock <= 20;

                      return (
                        <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shadow-2xs">
                              <img
                                src={prod.imageUrl}
                                alt={prod.nameAr}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-extrabold text-stone-900">{prod.nameAr}</div>
                            <div className="text-xs text-stone-500">{prod.nameEn}</div>
                            {prod.recipe && prod.recipe.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {prod.recipe.map((r, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.2 bg-rose-50 text-[#5a1818] border border-rose-200 rounded text-[10px] font-mono font-bold"
                                  >
                                    {r.stemsCount}x {r.flowerNameAr}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-stone-600 font-bold capitalize">
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-xs">
                              {prod.category}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right font-black text-[#5a1818] tabular-nums">
                            {prod.standardPrice} SAR
                          </td>

                          <td className="py-3 px-4 text-right font-black text-amber-800 tabular-nums">
                            {prod.discountedPrice} SAR
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold tabular-nums ${
                                isLow
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-stone-100 text-stone-800'
                              }`}
                            >
                              {prod.stock}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              {[10, 50, 100].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => onQuickRestock(prod.id, amt)}
                                  className="px-2 py-0.5 text-xs font-semibold rounded bg-stone-100 hover:bg-[#5a1818] hover:text-white text-stone-700 transition-colors cursor-pointer"
                                  title={`+${amt}`}
                                >
                                  +{amt}
                                </button>
                              ))}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(prod)}
                                className="p-1.5 text-stone-600 hover:text-[#5a1818] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                title={lang === 'ar' ? 'تعديل' : 'Edit'}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteProduct(prod.id)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title={lang === 'ar' ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 2: ORDER VOLUME & STATS (অর্ডারের পরিমাণ ও পরিসংখ্যান)                */}
      {/* ========================================================================= */}
      {activeTab === 'order_stats' && (
        <div className="space-y-6 animate-in fade-in">
          {/* High-Level Order Volume Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#e8ded8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'إجمالي عدد الطلبات' : 'Total Order Volume'}
                </span>
                <div className="p-2 rounded-xl bg-[#5a1818]/10 text-[#5a1818]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-stone-900 tabular-nums font-mono">
                {totalOrdersCount}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ar' ? 'إجمالي الطلبات المؤكدة في النظام' : 'All-time confirmed sales volume'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e8ded8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'طلبات اليوم' : "Today's Orders Count"}
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-[#5a1818] tabular-nums font-mono">
                {todayOrders.length}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ar' ? 'عدد عمليات البيع المسجلة اليوم' : 'Completed orders today'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e8ded8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'مبيعات اليوم المالية' : "Today's Gross Sales"}
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-emerald-700 tabular-nums font-mono">
                {todayRevenue.toFixed(2)} <span className="text-xs text-stone-500 font-sans">SAR</span>
              </div>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {todayCash.toFixed(2)} SAR كاش + {todayCard.toFixed(2)} SAR شبكة
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#e8ded8] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-stone-500 font-bold uppercase tracking-wider">
                  {lang === 'ar' ? 'المبيعات الكلية' : 'Lifetime Sales'}
                </span>
                <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-black text-stone-900 tabular-nums font-mono">
                {totalLifetimeRevenue.toFixed(2)} <span className="text-xs text-stone-500 font-sans">SAR</span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'ar' ? 'إجمالي المبالغ المحصلة' : 'Cumulative revenue'}
              </p>
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900">
                  {lang === 'ar' ? 'الدفع النقدي (كاش)' : 'Cash Payments'}
                </h3>
              </div>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'مبيعات الكاش اليوم:' : "Today's Cash:"}</span>
                  <span className="font-bold text-emerald-700 tabular-nums">{todayCash.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'عدد العمليات النقدية:' : 'Cash Transactions:'}</span>
                  <span className="font-bold tabular-nums">
                    {orders.filter((o) => o.paymentMethod === 'cash').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-[#5a1818]" />
                <h3 className="font-bold text-stone-900">
                  {lang === 'ar' ? 'الدفع بالشبكة (مدى/بطاقة)' : 'Card / Mada Payments'}
                </h3>
              </div>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'مبيعات الشبكة اليوم:' : "Today's Card:"}</span>
                  <span className="font-bold text-[#5a1818] tabular-nums">{todayCard.toFixed(2)} SAR</span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'عدد عمليات مدى:' : 'Card Transactions:'}</span>
                  <span className="font-bold tabular-nums">
                    {orders.filter((o) => o.paymentMethod === 'card').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Split className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900">
                  {lang === 'ar' ? 'الدفع المشترك (Split)' : 'Split Payments'}
                </h3>
              </div>
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'العمليات المشتركة:' : 'Split Transactions:'}</span>
                  <span className="font-bold tabular-nums">
                    {orders.filter((o) => o.paymentMethod === 'split').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{lang === 'ar' ? 'طريقة السداد:' : 'Payment Split:'}</span>
                  <span className="font-semibold text-stone-500">جزء كاش + جزء شبكة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PAGE 3: TODAY'S ORDERS & DAILY DATE FILES (আজকের অর্ডার ও দৈনিক ফাইলসমূহ)  */}
      {/* ========================================================================= */}
      {activeTab === 'daily_orders' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Daily Date Files Archive (প্রতিদিনের একটা একটা করে ফাইল) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8ded8] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-stone-200 gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#5a1818]" />
                <div>
                  <h3 className="font-extrabold text-base text-stone-900 font-['Cairo']">
                    {lang === 'ar' ? 'ملفات المبيعات اليومية المؤرشفة (Daily Date Files Archive)' : 'Archived Daily Date Files'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === 'ar' ? 'كل يوم يتم حفظ ملف مستقل بصيغة CSV قابل للتحميل والمراجعة' : 'Each date is saved as an independent downloadable CSV file'}
                  </p>
                </div>
              </div>

              <span className="text-xs text-stone-500 font-mono font-bold bg-stone-100 px-3 py-1 rounded-xl">
                {datesList.length} {lang === 'ar' ? 'ملفات أيام' : 'date files'}
              </span>
            </div>

            {/* Date Files Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {datesList.map((dateKey) => {
                const dayOrders = ordersByDate[dateKey] || [];
                const dayTotal = dayOrders.reduce((sum, o) => sum + o.total, 0);
                const isSelected = selectedDateFilter === dateKey;
                const isToday = dateKey === todayStr;

                return (
                  <div
                    key={dateKey}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-[#fbf9f8] border-stone-200 hover:border-stone-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-sm text-stone-900 flex items-center gap-2">
                            <span>{dateKey}</span>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-700 text-white font-bold">
                                {lang === 'ar' ? 'اليوم' : 'Today'}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-stone-500 font-mono">
                            Comaiit_Sales_{dateKey}.csv
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 space-y-1 pt-2 border-t border-stone-200/80">
                      <div className="flex justify-between">
                        <span>{lang === 'ar' ? 'الطلبات المؤكدة:' : 'Confirmed Orders:'}</span>
                        <span className="font-bold tabular-nums text-stone-900">{dayOrders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{lang === 'ar' ? 'إجمالي مبيعات اليوم:' : 'Daily Sales:'}</span>
                        <span className="font-black text-[#5a1818] tabular-nums font-mono">{dayTotal.toFixed(2)} SAR</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDateFilter(isSelected ? 'all' : dateKey)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#5a1818] text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        {isSelected
                          ? (lang === 'ar' ? 'عرض الكل' : 'Show All')
                          : (lang === 'ar' ? 'تصفية اليوم' : 'Filter Date')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportDateFile(dateKey)}
                        title={lang === 'ar' ? 'تحميل ملف هذا اليوم بصيغة CSV' : 'Download daily CSV'}
                        className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmed Orders Ledger Table */}
          <div className="bg-white rounded-3xl border border-[#e8ded8] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#fbf9f8] border-b border-[#e8ded8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#5a1818]" />
                <h3 className="font-bold text-sm text-stone-900 font-['Cairo']">
                  {lang === 'ar'
                    ? `سجل الطلبات المؤكدة ${selectedDateFilter !== 'all' ? `ليوم (${selectedDateFilter})` : 'لجميع الأيام'}`
                    : `Confirmed Orders Ledger ${selectedDateFilter !== 'all' ? `for (${selectedDateFilter})` : 'All Dates'}`}
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-bold">
                {displayedOrders.length} {lang === 'ar' ? 'طلب مسجل' : 'records'}
              </span>
            </div>

            {/* Mobile View for Confirmed Orders Ledger */}
            <div className="block md:hidden divide-y divide-stone-100">
              {displayedOrders.map((order, idx) => (
                <div key={order.id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-500 text-xs font-mono font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-extrabold font-mono text-[#5a1818] text-sm">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-stone-900 font-mono tabular-nums">
                        {order.total.toFixed(2)} SAR
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 bg-[#fbf9f8] p-2 rounded-xl border border-stone-200/80">
                    <div>
                      <span>{order.date}</span> • <span className="font-mono text-stone-400">{order.timestamp}</span>
                    </div>
                    <div className="font-medium text-stone-600">
                      {lang === 'ar' ? 'الكاشير:' : 'Cashier:'} <span className="font-bold text-stone-800">{order.cashierName}</span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-100 space-y-1">
                    <span className="text-[11px] font-bold text-stone-500 block mb-1">
                      {lang === 'ar' ? 'الأصناف المشتراة:' : 'Purchased Items:'}
                    </span>
                    {order.items.map((it, i) => (
                      <div key={i} className="text-xs text-stone-800 flex items-center justify-between">
                        <span className="font-medium truncate">{lang === 'ar' ? it.nameAr : it.nameEn}</span>
                        <span className="text-[11px] font-mono font-bold text-stone-600 shrink-0 ml-2">
                          {it.quantity}x @{it.unitPrice} SAR
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method & Receipt Action */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      {order.paymentMethod === 'cash' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Banknote className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'كاش' : 'Cash'}</span>
                        </span>
                      ) : order.paymentMethod === 'split' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Split className="w-3.5 h-3.5 text-amber-700" />
                          <span>{lang === 'ar' ? `مشترك (${order.cashReceived}N + ${order.cardAmount}C)` : `Split (${order.cashReceived}C + ${order.cardAmount}K)`}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-[#5a1818] border border-rose-200">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'شبكة / مدى' : 'Card'}</span>
                        </span>
                      )}
                    </div>

                    {onViewReceipt && (
                      <button
                        type="button"
                        onClick={() => onViewReceipt(order)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-[#5a1818] hover:text-white text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'الفاتورة' : 'Receipt'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {displayedOrders.length === 0 && (
                <div className="py-10 text-center text-stone-400 text-xs">
                  {lang === 'ar' ? 'لا توجد طلبات مؤكدة في هذا التاريخ' : 'No confirmed orders for this date'}
                </div>
              )}
            </div>

            {/* Desktop View Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'رقم الطلب' : 'Order #'}</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'الأصناف والكميات' : 'Items & Quantities'}</th>
                    <th className="py-3 px-4 text-center">{lang === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'ar' ? 'الإجمالي' : 'Total (SAR)'}</th>
                    <th className="py-3 px-4">{lang === 'ar' ? 'الكاشير' : 'Cashier'}</th>
                    {onViewReceipt && (
                      <th className="py-3 px-4 text-center">{lang === 'ar' ? 'الفاتورة' : 'Receipt'}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {displayedOrders.map((order, idx) => (
                    <tr key={order.id} className="hover:bg-amber-50/20 transition-colors">
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
                              <span className="truncate">{lang === 'ar' ? it.nameAr : it.nameEn}</span>
                              <span className="text-[11px] font-mono font-semibold text-stone-500 whitespace-nowrap">
                                {it.quantity}x @{it.unitPrice} SAR
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {order.paymentMethod === 'cash' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Banknote className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'كاش' : 'Cash'}</span>
                          </span>
                        ) : order.paymentMethod === 'split' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Split className="w-3.5 h-3.5 text-amber-700" />
                            <span>{lang === 'ar' ? `مشترك (${order.cashReceived}N + ${order.cardAmount}C)` : `Split (${order.cashReceived}C + ${order.cardAmount}K)`}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-100 text-[#5a1818] border border-rose-200">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'شبكة / مدى' : 'Card'}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-stone-900 tabular-nums">
                        {order.total.toFixed(2)} SAR
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs truncate max-w-[120px]">
                        {order.cashierName}
                      </td>
                      {onViewReceipt && (
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onViewReceipt(order)}
                            className="p-1.5 text-stone-500 hover:text-[#5a1818] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                            title={lang === 'ar' ? 'عرض الفاتورة' : 'View Receipt'}
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {displayedOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-stone-400">
                        {lang === 'ar' ? 'لا توجد طلبات مؤكدة في هذا التاريخ' : 'No confirmed orders for this date'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (Supports 4 Categories + Laptop/Mobile Upload)    */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#5a1818]/10 text-[#5a1818]">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-['Cairo']">
                    {editingProduct
                      ? (lang === 'ar' ? 'تعديل بيانات الصنف' : 'Edit Item Details')
                      : (lang === 'ar' ? `إضافة صنف جديد (${selectedFormCategory.toUpperCase()})` : `Add New ${selectedFormCategory.toUpperCase()} Item`)}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {lang === 'ar'
                      ? 'أدخل البيانات وارفع صورة الصنف مباشرة من جهازك'
                      : 'Fill in details and upload photo from your laptop or phone'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsFormModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Category Selector Buttons inside Modal */}
            {!editingProduct && (
              <div className="grid grid-cols-4 gap-2 p-1.5 bg-stone-100 rounded-2xl">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedFormCategory(cat.id);
                      if (cat.id === 'bouquet') {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: '/src/assets/images/luxury_flower_bouquet_1793186094326.jpg',
                          standardPrice: 180,
                          discountedPrice: 150,
                        }));
                      } else if (cat.id === 'coffee') {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: '/src/assets/images/coffee_saudi_latte_1793183277320.jpg',
                          standardPrice: 24,
                          discountedPrice: 20,
                        }));
                      } else if (cat.id === 'faza') {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: '/src/assets/images/faza_luxury_vase_1793183277028.jpg',
                          standardPrice: 120,
                          discountedPrice: 95,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: '/src/assets/images/flower_red_rose_1793182282218.jpg',
                          standardPrice: 18,
                          discountedPrice: 14,
                        }));
                      }
                      setUploadedImagePreview(null);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFormCategory === cat.id
                        ? 'bg-[#5a1818] text-white shadow-xs'
                        : 'text-stone-700 hover:bg-stone-200/70'
                    }`}
                  >
                    <span>{cat.nameEn}</span>
                    <span className="text-[10px] opacity-75 font-normal">{cat.nameAr}</span>
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Product Names (Arabic & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'اسم الصنف بالعربي *' : 'Arabic Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    placeholder={
                      selectedFormCategory === 'flower'
                        ? 'مثلاً: ورد جوري أحمر'
                        : selectedFormCategory === 'bouquet'
                        ? 'مثلاً: باقة حكاية مشاعر الفاخرة'
                        : selectedFormCategory === 'coffee'
                        ? 'مثلاً: آيس سبانش لاتيه كُمَيْت'
                        : 'مثلاً: فازة كريستال مذهبة'
                    }
                    className="w-full p-2.5 bg-[#fbf9f8] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'اسم الصنف بالإنجليزي *' : 'English Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder={
                      selectedFormCategory === 'flower'
                        ? 'e.g. Red Rose'
                        : selectedFormCategory === 'bouquet'
                        ? 'e.g. Feelings Tale Bouquet'
                        : selectedFormCategory === 'coffee'
                        ? 'e.g. Iced Spanish Latte'
                        : 'e.g. Royal Gilded Faza'
                    }
                    className="w-full p-2.5 bg-[#fbf9f8] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5a1818]/20 focus:border-[#5a1818]"
                  />
                </div>
              </div>

              {/* Bouquet Recipe Section: Only shown when selected category is Bouquet */}
              {selectedFormCategory === 'bouquet' && (() => {
                const adminFlowerStemsTotal = Object.entries(bouquetStems).reduce((sum, [fId, count]) => {
                  const flw = availableFlowersForBouquet.find((f) => f.id === fId);
                  return sum + (flw ? flw.standardPrice * count : 0);
                }, 0);

                const adminCalculatedBouquetTotal = Math.max(
                  0,
                  adminFlowerStemsTotal + (isNaN(adminExtraPaperFee) ? 0 : adminExtraPaperFee)
                );

                return (
                  <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5a1818] font-['Cairo'] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>
                          {lang === 'ar'
                            ? 'تحديد الأزهار وحساب السعر التلقائي (Bouquet Recipe):'
                            : 'Select Flower Stems & Auto-Calculate Price:'}
                        </span>
                      </span>
                      <span className="text-xs font-mono font-black text-stone-700 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                        {Object.values(bouquetStems).reduce((a, b) => a + b, 0)} {lang === 'ar' ? 'غصن مختار' : 'stems'}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500">
                      {lang === 'ar'
                        ? 'اختر عدد الأغصان من كل زهرة، وسيتم جمع الأسعار تلقائياً مع إمكانية إضافة تكلفة التغليف والورق'
                        : 'Select stems per flower to sum up prices automatically plus extra wrapping paper fees'}
                    </p>

                    {/* Flower Stems Selection Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                      {availableFlowersForBouquet.map((flower) => {
                        const count = bouquetStems[flower.id] || 0;
                        const lineTotal = flower.standardPrice * count;

                        return (
                          <div
                            key={flower.id}
                            className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                              count > 0
                                ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300/40 shadow-2xs'
                                : 'bg-white border-rose-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={flower.imageUrl}
                                alt={flower.nameAr}
                                className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                              />
                              <div className="truncate">
                                <div className="text-xs font-bold text-stone-900 truncate">
                                  {lang === 'ar' ? flower.nameAr : flower.nameEn}
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono">
                                  {flower.standardPrice} SAR/غصن
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStemChange(flower.id, -1)}
                                disabled={count === 0}
                                className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono font-black text-xs text-[#5a1818]">
                                {count}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStemChange(flower.id, 1)}
                                className="w-6 h-6 rounded-md bg-[#5a1818] hover:bg-[#421010] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Live Calculated Price Breakdown & Extra Paper Fee Box */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-stone-700">
                        <span>{lang === 'ar' ? 'إجمالي سعر الأغصان المختارة:' : 'Flower Stems Total:'}</span>
                        <span className="font-mono font-bold text-[#5a1818]">{adminFlowerStemsTotal} SAR</span>
                      </div>

                      {/* Extra Cost / Wrapping Paper Fee Input */}
                      <div className="flex justify-between items-center pt-1.5 border-t border-stone-100 font-bold text-stone-800">
                        <span>{lang === 'ar' ? 'تكلفة التغليف والورق الإضافية:' : 'Extra Wrapping / Paper Fee:'}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={adminExtraPaperFee}
                            onChange={(e) => setAdminExtraPaperFee(parseFloat(e.target.value) || 0)}
                            className="w-16 p-1 bg-amber-50 border border-amber-300 rounded-lg text-center font-bold text-xs text-amber-950 focus:ring-1 focus:ring-amber-500"
                          />
                          <span className="text-[11px] text-stone-500 font-normal">SAR</span>
                        </div>
                      </div>

                      {/* Total Sum & Apply Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rose-200">
                        <div>
                          <span className="text-stone-500 font-bold block text-[11px]">
                            {lang === 'ar' ? 'السعر الكلي المحسوب للباقة:' : 'Total Calculated Bouquet Cost:'}
                          </span>
                          <span className="text-base font-black text-[#5a1818] font-mono tabular-nums">
                            {adminCalculatedBouquetTotal} SAR
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              standardPrice: adminCalculatedBouquetTotal || prev.standardPrice,
                              discountedPrice: Math.max(1, Math.round((adminCalculatedBouquetTotal || prev.standardPrice) * 0.85)),
                            }));
                          }}
                          className="py-1.5 px-3 bg-[#5a1818] hover:bg-[#421010] text-white text-xs font-bold rounded-lg transition-all active:scale-95 shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {lang === 'ar'
                              ? `تطبيق هذا السعر (${adminCalculatedBouquetTotal} ر.س)`
                              : `Apply Price (${adminCalculatedBouquetTotal} SAR)`}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Photo Upload Section: Direct from Laptop or Mobile Device */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
                <label className="block text-xs font-extrabold text-stone-800">
                  {lang === 'ar'
                    ? 'صورة الصنف (رفع من اللابتوب أو الجوال) *'
                    : 'Product Photo (Upload from Laptop or Mobile) *'}
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Image Preview Box */}
                  <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-stone-300 overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
                    {uploadedImagePreview || formData.imageUrl ? (
                      <img
                        src={uploadedImagePreview || formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-stone-300" />
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      id="admin-image-upload"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 hover:border-[#5a1818] text-stone-800 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#5a1818]" />
                      <span>
                        {lang === 'ar'
                          ? 'اختر صورة من جهازك (لابتوب / جوال)'
                          : 'Choose Image from Laptop / Mobile'}
                      </span>
                    </button>

                    <p className="text-[10px] text-stone-500">
                      {lang === 'ar'
                        ? 'يدعم صور JPG, PNG, WEBP من كاميرا الجوال أو ملفات الكمبيوتر'
                        : 'Supports JPG, PNG, WEBP from mobile camera or PC folders'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual-Pricing Options (Standard vs Offer Price) */}
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                <span className="text-xs font-extrabold text-amber-950 block">
                  {lang === 'ar' ? 'التسعير المزدوج للصنف (Dual Pricing):' : 'Dual-Pricing Options:'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {lang === 'ar' ? 'السعر القياسي / العادي (ر.س)' : 'Standard Price (SAR)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.standardPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, standardPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-[#5a1818] focus:ring-2 focus:ring-[#5a1818]/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {lang === 'ar' ? 'السعر المخفض / العرض (ر.س)' : 'Offer Price (SAR)'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formData.discountedPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-amber-800 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Stock Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'الكمية في المخزون *' : 'Initial Stock Quantity *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full p-2.5 bg-[#fbf9f8] border border-stone-200 rounded-xl text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'ar' ? 'وصف مختصر (اختياري)' : 'Short Description (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={lang === 'ar' ? 'وصف الصنف...' : 'Item description...'}
                    className="w-full p-2.5 bg-[#fbf9f8] border border-stone-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#5a1818] hover:bg-[#421010] active:scale-95 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>
                    {editingProduct
                      ? (lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes')
                      : (lang === 'ar' ? 'إضافة الصنف للمتجر' : 'Add Product to Catalog')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
