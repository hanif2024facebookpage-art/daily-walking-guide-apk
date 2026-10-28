import React from 'react';
import { 
  ShoppingBag, 
  FileSpreadsheet, 
  Settings, 
  Eye, 
  EyeOff, 
  Languages, 
  Download,
  Menu,
  X
} from 'lucide-react';
import { Language, ActiveView } from '../types';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  showStock: boolean;
  onToggleStock: () => void;
  onOpenAPKModal: () => void;
  cartCount: number;
  onOpenAdminAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeView,
  onChangeView,
  showStock,
  onToggleStock,
  onOpenAPKModal,
  cartCount,
  onOpenAdminAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const t = {
    brandAr: 'كُمَيْت',
    brandEn: 'Comaiit',
    taglineAr: 'يُترجم مشاعرك',
    taglineEn: 'Translates Your Feelings',
    posView: lang === 'ar' ? 'نقطة البيع' : 'POS Register',
    salesView: lang === 'ar' ? 'تقرير المبيعات اليومي' : 'Daily Sales',
    adminView: lang === 'ar' ? 'إدارة المخزون' : 'Inventory Admin',
    stockVisible: lang === 'ar' ? 'إظهار المخزون' : 'Stock Visible',
    stockHidden: lang === 'ar' ? 'إخفاء المخزون' : 'Stock Hidden',
    downloadApk: lang === 'ar' ? 'تطبيق أندرويد (APK)' : 'Android APK',
    cartLabel: lang === 'ar' ? 'السلة' : 'Cart',
  };

  const handleNavClick = (view: ActiveView) => {
    if (view === 'admin') {
      onOpenAdminAuth();
    } else {
      onChangeView(view);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#5a1818] text-white shadow-md border-b border-[#421010]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Identity with uploaded logo */}
          <div 
            onClick={() => onChangeView('pos')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-sm border border-white/20 bg-[#421010] flex items-center justify-center">
              <img 
                src="/assets/aistudio/d0d50e28c3b56d04b8ce5b3568658139_tplv-tiktokx-cropcenter_1080_1080_a5199097.jpeg"
                alt="Comaiit كُمَيْت Logo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white font-['Cairo']">
                  كُمَيْت
                </span>
                <span className="text-xs sm:text-sm font-medium tracking-wider text-rose-200/90 uppercase font-['Plus_Jakarta_Sans']">
                  Comaiit
                </span>
              </div>
              <span className="text-[11px] text-amber-200/90 font-light">
                {lang === 'ar' ? t.taglineAr : t.taglineEn}
              </span>
            </div>
          </div>


          {/* Right Action Tools: Three-Line Menu Button ONLY */}
          <div className="flex items-center">
            
            {/* Three-Line Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className={`flex items-center justify-center p-2.5 sm:p-3 rounded-xl transition-all shadow-sm cursor-pointer border ${
                  mobileMenuOpen || activeView === 'admin'
                    ? 'bg-white text-[#5a1818] border-white shadow-md'
                    : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
                }`}
                title={lang === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Dropdown Menu when 3-line button is clicked */}
              {mobileMenuOpen && (
                <div className={`absolute top-full mt-2 ${lang === 'ar' ? 'left-0' : 'right-0'} w-64 sm:w-72 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 p-2.5 z-50 space-y-1.5 animate-in fade-in zoom-in-95`}>
                  <button
                    type="button"
                    onClick={() => handleNavClick('pos')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      activeView === 'pos' ? 'bg-[#5a1818] text-white' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>{t.posView}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('sales')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      activeView === 'sales' ? 'bg-[#5a1818] text-white' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>{t.salesView}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      activeView === 'admin' ? 'bg-[#5a1818] text-white' : 'hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#5a1818]" />
                    <span>{t.adminView}</span>
                  </button>

                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    {/* Stock Eye Button inside Three-Line Menu */}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleStock();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-stone-50 hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer border border-stone-200"
                    >
                      <span className="flex items-center gap-2">
                        {showStock ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
                        <span>{showStock ? t.stockVisible : t.stockHidden}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {showStock ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Translator Button inside Three-Line Menu */}
                    <button
                      type="button"
                      onClick={() => {
                        onToggleLang();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-50/70 hover:bg-amber-100 text-amber-950 transition-colors cursor-pointer border border-amber-200"
                    >
                      <span className="flex items-center gap-2">
                        <Languages className="w-4 h-4 text-amber-700" />
                        <span>{lang === 'ar' ? 'تغيير اللغة إلى English' : 'Switch to العربية'}</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-900">
                        {lang === 'ar' ? 'EN' : 'عربي'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-white/10 space-y-1">
            <button
              type="button"
              onClick={() => handleNavClick('pos')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeView === 'pos' ? 'bg-white text-[#5a1818]' : 'text-rose-100 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{t.posView}</span>
              </div>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-[#5a1818] text-white rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('sales')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeView === 'sales' ? 'bg-white text-[#5a1818]' : 'text-rose-100 hover:bg-white/10'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.salesView}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNavClick('admin')}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                activeView === 'admin' ? 'bg-white text-[#5a1818]' : 'text-rose-100 hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t.adminView}</span>
            </button>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onToggleStock}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white/10 rounded-lg text-white"
              >
                {showStock ? <Eye className="w-3.5 h-3.5 text-emerald-300" /> : <EyeOff className="w-3.5 h-3.5 text-rose-300" />}
                <span>{showStock ? t.stockVisible : t.stockHidden}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenAPKModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 text-stone-950 rounded-lg"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadApk}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
