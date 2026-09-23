import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Github,
  Terminal,
  Check,
  Copy,
  ExternalLink,
  Code2,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileDown,
} from 'lucide-react';

interface ApkGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkGuideModal: React.FC<ApkGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'github' | 'capacitor' | 'pwabuilder'>('github');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const gitCommands = `# ۱. ایجاد ریپازیتوری محلی و ثبت فایل‌ها
git init
git add .
git commit -m "Initial commit - AwaStudio TTS Pro with APK build support"

# ۲. اتصال به ریپازیتوری خود در گیت‌هاب (نام کاربری و ریپازیتوری خود را جایگزین کنید)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/awastudio-tts.git
git push -u origin main`;

  const capacitorCommands = `# ۱. ساخت فایل‌های فرانت‌اند
npm run build

# ۲. نصب بسته‌های Capacitor برای اندروید
npm install @capacitor/core @capacitor/cli @capacitor/android

# ۳. مقداردهی و افزودن پلتفرم اندروید (پیکربندی از قبل در پروژه آماده است)
npx cap add android

# ۴. باز کردن پروژه در نرم‌افزار Android Studio
npx cap open android

# ۵. در منوی بالا اندروید استودیو کلیک کنید روی:
# Build -> Build Bundle(s) / APK(s) -> Build APK(s)
# فایل خروجی APK در مسیر android/app/build/outputs/apk/debug/app-debug.apk ذخیره می‌شود.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto text-right">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                راهنمای کامل دریافت فایل نصبی اندروید (APK)
              </h2>
              <p className="text-xs text-slate-400">
                پروژه کاملاً برای آپلود در GitHub و خروجی APK استاندارد مهیا شده است
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950/80 p-2 border-b border-slate-800 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'github'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>روش ۱: ساخت خودکار با GitHub Actions (پیشنهادی)</span>
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'capacitor'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>روش ۲: Capacitor &amp; Android Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('pwabuilder')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'pwabuilder'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>روش ۳: تبدیل آنلاین در PWABuilder</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          {activeTab === 'github' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-200 text-sm mb-1">
                    ساخت خودکار APK با لوگوی برج آزادی در سرورهای ابری گیت‌هاب
                  </h4>
                  <p className="text-xs text-emerald-300/80 leading-relaxed">
                    فایل ورک‌فلو <code className="bg-emerald-900/60 px-1 py-0.5 rounded text-white font-mono">.github/workflows/build-apk.yml</code> بازنویسی و خطای قفل فایل (<span className="text-amber-300">Dependencies lock file</span>) به طور کامل رفع شد. همچنین آیکون برج آزادی به عنوان آیکون لانچر پکیج APK قرار گرفت.
                  </p>
                </div>
              </div>

              {/* Step by Step */}
              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-400" />
                  مراحل آپلود و دریافت APK:
                </h5>

                <ol className="list-decimal list-inside space-y-2 pr-1 text-slate-300 text-xs leading-relaxed">
                  <li>
                    در سایت <strong>GitHub.com</strong> یک مخزن (Repository) جدید و عمومی یا خصوصی بسازید (مثلاً به نام <span className="font-mono text-emerald-400">awastudio-tts</span>).
                  </li>
                  <li>
                    دستورات زیر را در ترمینال سیستم خود برای ارسال کدها به گیت‌هاب وارد کنید:
                  </li>
                </ol>

                <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto text-left" dir="ltr">
                  <button
                    onClick={() => copyToClipboard(gitCommands, 'git')}
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="کپی دستورات"
                  >
                    {copiedSnippet === 'git' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <pre className="pr-8">{gitCommands}</pre>
                </div>

                <ol start={3} className="list-decimal list-inside space-y-2 pr-1 text-slate-300 text-xs leading-relaxed">
                  <li>
                    وارد صفحه ریپازیتوری خود در گیت‌هاب شوید و به تب <strong className="text-white">Actions</strong> بروید.
                  </li>
                  <li>
                    فرآیند ساخت <span className="font-mono text-emerald-400">Build Android APK</span> آغاز می‌شود (حدود ۳ تا ۴ دقیقه طول می‌کشد).
                  </li>
                  <li>
                    پس از تیک سبز، روی اجرا کلیک کنید و در بخش <strong className="text-white">Artifacts</strong> فایل <span className="font-mono text-emerald-300 font-bold underline">AvayeIranAzad-Debug-APK.zip</span> را دانلود کرده و روی هر گوشی اندروید نصب کنید!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'capacitor' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-3.5">
                <h4 className="font-bold text-indigo-200 text-sm mb-1">
                  کامپایل محلی با Capacitor و Android Studio
                </h4>
                <p className="text-xs text-indigo-300/80 leading-relaxed">
                  فایل پیکربندی <code className="bg-indigo-900/60 px-1 py-0.5 rounded text-white font-mono">capacitor.config.json</code> و متادیتاهای پروژه با شناسه <span className="font-mono text-cyan-300">com.awastudio.tts</span> در ریشه پروژه قرار دارد.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>دستورات مورد نیاز در محیط توسعه (ترمینال):</span>
                  <button
                    onClick={() => copyToClipboard(capacitorCommands, 'cap')}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSnippet === 'cap' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>کپی تمام دستورات</span>
                  </button>
                </div>

                <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 font-mono text-[11px] text-slate-300 overflow-x-auto text-left" dir="ltr">
                  <pre>{capacitorCommands}</pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pwabuilder' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-3.5">
                <h4 className="font-bold text-cyan-200 text-sm mb-1">
                  ساخت فایل APK بدون نیاز به کامپیوتر یا کدنویسی (PWABuilder)
                </h4>
                <p className="text-xs text-cyan-300/80 leading-relaxed">
                  این اپلیکیشن استانداردهای رسمی مایکروسافت و گوگل (PWA Compliant) شامل Manifest، آیکون‌های Maskable، Service Worker آفلاین و متاهای اندروید را به صورت ۱۰۰٪ پیاده کرده است.
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <p>
                  ۱. اپلیکیشن را روی هر هاست دلخواه (Vercel، Cloud Run، Liara یا GitHub Pages) دیپلوی نمایید.
                </p>
                <p>
                  ۲. وارد سایت <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold underline inline-flex items-center gap-0.5">PWABuilder.com <ExternalLink className="w-3 h-3" /></a> شوید و لینک اپلیکیشن خود را وارد کنید.
                </p>
                <p>
                  ۳. دکمه <strong className="text-white">Build My App</strong> را بزنید و در بخش Android گزینه <strong className="text-emerald-400">Generate APK &amp; AAB</strong> را بزنید.
                </p>
                <p>
                  ۴. فایل نهایی به صورت مستقیم دانلود می‌شود و آماده انتشار در کافه‌بازار، مایکت و گوگل‌پلی است.
                </p>
              </div>
            </div>
          )}

          {/* Files Prepared In Repository Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>فایل‌های راهنمای <span className="font-mono text-slate-200">README.md</span> و <span className="font-mono text-slate-200">APK_BUILD_GUIDE.md</span> نیز در ریپازیتوری ذخیره شدند.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
          >
            بستن راهنما
          </button>
        </div>
      </div>
    </div>
  );
};
