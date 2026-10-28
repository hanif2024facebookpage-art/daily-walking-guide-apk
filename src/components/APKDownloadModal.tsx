import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, X, Sparkles, AlertCircle, Share2 } from 'lucide-react';
import { Language } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [showAPKHelp, setShowAPKHelp] = useState(true);

  if (!isOpen) return null;

  const apkUrl = '/APK_DOWNLOAD/app-debug.apk';

  const handlePwaClick = async () => {
    if (isInstallable) {
      await triggerInstall();
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Browser fallback (e.g., Chrome menu instructions)
      alert(
        lang === 'ar'
          ? 'من القائمة أعلى المتصفح (⋮)، اضغط على "الإضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق"'
          : 'From browser menu (⋮), tap "Add to Home Screen" or "Install App"'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4 my-8 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#5a1818] text-amber-300 rounded-2xl shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-stone-900 font-['Cairo']">
                {lang === 'ar'
                  ? 'تثبيت تطبيق كُمَيْت على الجوال'
                  : 'Install Comaiit App on Mobile'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'ar'
                  ? 'اختر طريقة التثبيت المناسبة لهاتفك (أندرويد / آيفون)'
                  : 'Choose install method for your phone (Android / iOS)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METHOD 1: INSTANT WEB APP / PWA INSTALLATION (RECOMMENDED - WORKS 100% ON ALL PHONES) */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-300/80 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5a1818] text-white text-[10px] font-black">
                {lang === 'ar' ? 'الطريقة الأولى (موصى بها)' : 'Method 1 (Recommended)'}
              </span>
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>100% مضمونة</span>
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-black text-stone-900 text-sm font-['Cairo']">
              {lang === 'ar'
                ? 'تثبيت تطبيق الجوال بضغطة واحدة (Web App / PWA)'
                : '1-Click Direct Mobile App Install (PWA)'}
            </h4>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {lang === 'ar'
                ? 'تثبيت مباشر دون الحاجة لتحميل ملفات خارجية أو أذونات الحماية (Play Protect). يعمل فوراً على كافة أجهزة أندرويد والآيفون.'
                : 'Directly installs app to your home screen with no unknown sources prompt or Play Protect blocking.'}
            </p>
          </div>

          {isInstalled ? (
            <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900">
              <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {lang === 'ar' ? 'التطبيق مثبت بالفعل على جهازك!' : 'App is already installed on your device!'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePwaClick}
              className="w-full py-3 px-4 rounded-xl bg-[#5a1818] hover:bg-[#421010] active:scale-[0.98] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-amber-300" />
              <span>
                {lang === 'ar'
                  ? 'اضغط هنا لتثبيت التطبيق فوراً على الشاشة الرئيسية'
                  : 'Tap Here to Install App to Home Screen'}
              </span>
            </button>
          )}

          {/* iOS Safari Guide drop-down */}
          {showIOSInstructions && (
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 text-xs text-stone-700 animate-in fade-in">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-amber-700" />
                <span>{lang === 'ar' ? 'خطوات التثبيت على الآيفون (iOS Safari):' : 'iOS Safari Steps:'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-600 font-medium">
                <li>{lang === 'ar' ? 'اضغط على زر المشاركة (Share) أسفل متصفح سفاري' : 'Tap the Share button in Safari toolbar'}</li>
                <li>{lang === 'ar' ? 'اختر "الإضافة إلى الشاشة الرئيسية" (Add to Home Screen)' : 'Tap "Add to Home Screen"'}</li>
                <li>{lang === 'ar' ? 'اضغط "إضافة" (Add) في الأعلى' : 'Tap "Add" at top right'}</li>
              </ol>
            </div>
          )}
        </div>

        {/* METHOD 2: DIRECT APK DOWNLOAD & INSTALLATION */}
        <div className="p-4 bg-[#fbf9f8] rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold">
              {lang === 'ar' ? 'الطريقة الثانية (ملف APK جاهز)' : 'Method 2 (Direct APK File)'}
            </span>
            <span className="text-xs font-mono font-bold text-stone-500">com.comaiit.pos (~9.1 MB)</span>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 text-xs sm:text-sm font-['Cairo']">
              {lang === 'ar'
                ? 'تحميل ملف APK المباشر لأجهزة أندرويد'
                : 'Download Direct APK Package for Android'}
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'ar'
                ? 'ملف APK للأنظمة اللوحية وأجهزة نقاط البيع Sunmi / Pax والهواتف الذكية'
                : 'Direct APK file for Android tablets, POS terminals, and phones.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={apkUrl}
              download="comaiit-pos-debug.apk"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'ar' ? 'تحميل ملف APK مباشرة' : 'Download APK File'}</span>
            </a>

            <button
              type="button"
              onClick={() => setShowAPKHelp(!showAPKHelp)}
              className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>{lang === 'ar' ? 'حل مشكلة التثبيت؟' : 'Install Issue?'}</span>
            </button>
          </div>

          {/* APK Installation Error Fix Guidance */}
          {showAPKHelp && (
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-300 space-y-2 text-xs text-stone-800 animate-in fade-in">
              <div className="font-extrabold text-[#5a1818] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {lang === 'ar'
                    ? 'حل مشكلة (Installation Error / لم يتم تثبيت التطبيق):'
                    : 'Fixing "Installation Error / Could not be installed":'}
                </span>
              </div>
              
              <p className="text-[11px] text-stone-600 font-medium">
                {lang === 'ar'
                  ? 'يحدث هذا التنبيه بسبب حظر نظام أندرويد لتثبيت التطبيقات الخارجية غير المباشرة. يمكنك التغلب على ذلك بسهولة بأحد خيارين:'
                  : 'This error is caused by Android blocking external APK packages. You can fix it instantly using either option below:'}
              </p>

              <ol className="space-y-1.5 text-stone-700 font-medium list-decimal list-inside">
                <li>
                  <strong className="text-[#5a1818] font-black">
                    {lang === 'ar' ? 'الحل الأول والأسهل (موصى به):' : 'Option 1 (Fastest & Easiest):'}
                  </strong>{' '}
                  {lang === 'ar'
                    ? 'اضغط على زر (الطريقة الأولى) في الأعلى لتثبيت التطبيق فوراً بضغطة واحدة وبدون أي أخطاء!'
                    : 'Use Method 1 at the top to install the Web App with 1-tap — zero errors, no Play Protect prompt!'}
                </li>
                <li>
                  <strong className="text-stone-900 font-bold">
                    {lang === 'ar' ? 'الحل الثاني (لـ APK):' : 'Option 2 (For APK):'}
                  </strong>{' '}
                  {lang === 'ar'
                    ? 'افتح إعدادات الجوال (Settings) -> التطبيقات (Apps) -> متصفح Chrome -> افعل (تثبيت التطبيقات غير معروفة المصدر).'
                    : 'Open Phone Settings -> Apps -> Chrome -> Enable "Install Unknown Apps" (Allow from this source).'}
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* METHOD 3: DOWNLOAD COMPLETE APPLICATION SOURCE CODE (ZIP) */}
        <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-black">
              {lang === 'ar' ? 'تحميل كود التطبيق الكامل (ZIP)' : 'Full Source Code Package'}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-800">comaiit-pos-source-code.zip</span>
          </div>

          <div>
            <h4 className="font-bold text-stone-900 text-xs sm:text-sm font-['Cairo']">
              {lang === 'ar'
                ? 'تحميل كود ومكونات التطبيق الكاملة للتحكم والتعديل'
                : 'Download Complete Source Code ZIP File'}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              {lang === 'ar'
                ? 'حزمة الكود المصدرية المكتملة بكل المكونات والواجهات والأيقونات جاهزة للتشغيل والتعديل'
                : 'Full React TypeScript source code package with all assets and configs ready to build.'}
            </p>
          </div>

          <a
            href="/APK_DOWNLOAD/comaiit-pos-source-code.zip"
            download="comaiit-pos-source-code.zip"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-[0.99]"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>
              {lang === 'ar'
                ? 'تحميل ملف الكود المصدر (ZIP)'
                : 'Download Source Code (ZIP Archive)'}
            </span>
          </a>
        </div>

        {/* Technical Features Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600">
          <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{lang === 'ar' ? 'دعم العمل بدون إنترنت' : 'Offline Support'}</span>
          </div>
          <div className="p-2 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{lang === 'ar' ? 'دعم Android 7.0 - 15' : 'Android 7.0 - 15'}</span>
          </div>
        </div>

        {/* Close Modal Button */}
        <div className="pt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
