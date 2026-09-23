import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Search,
  Plus,
  Trash2,
  Check,
  Volume2,
  Info,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  PERSIAN_TANWIN_MAP,
  PERSIAN_VERBS_MAP,
  PERSIAN_NOUNS_MAP,
  PERSIAN_PHRASAL_RULES,
} from '../utils/persianPronunciationDict';

interface PronunciationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customMap: Record<string, string>;
  onAddCustomWord: (original: string, phonetic: string) => void;
  onRemoveCustomWord: (original: string) => void;
  onTestPronunciation?: (text: string) => void;
}

export const PronunciationDictionaryModal: React.FC<PronunciationModalProps> = ({
  isOpen,
  onClose,
  customMap,
  onAddCustomWord,
  onRemoveCustomWord,
  onTestPronunciation,
}) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'custom' | 'verbs' | 'tanwin' | 'nouns' | 'phrases'>('all');
  const [newOriginal, setNewOriginal] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [addNotice, setAddNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Prepare dictionary items
  const tanwinItems = Object.entries(PERSIAN_TANWIN_MAP).map(([orig, phon]) => ({
    original: orig,
    phonetic: phon,
    category: 'tanwin' as const,
    categoryLabel: 'تنوین',
  }));

  const verbItems = Object.entries(PERSIAN_VERBS_MAP).map(([orig, phon]) => ({
    original: orig,
    phonetic: phon,
    category: 'verbs' as const,
    categoryLabel: 'فعل',
  }));

  const nounItems = Object.entries(PERSIAN_NOUNS_MAP).map(([orig, phon]) => ({
    original: orig,
    phonetic: phon,
    category: 'nouns' as const,
    categoryLabel: 'اسم/صفت',
  }));

  const phraseItems = PERSIAN_PHRASAL_RULES.map(([regex, phon]) => {
    // extract sample phrase from regex source
    const raw = regex.source.replace(/\\b/g, '').replace(/\\s\+/g, ' ');
    return {
      original: raw,
      phonetic: phon,
      category: 'phrases' as const,
      categoryLabel: 'ترکیب متنی',
    };
  });

  const customItems = Object.entries(customMap).map(([orig, phon]) => ({
    original: orig,
    phonetic: phon,
    category: 'custom' as const,
    categoryLabel: 'اختصاصی شما',
    isCustom: true,
  }));

  const allItems = [...customItems, ...verbItems, ...tanwinItems, ...nounItems, ...phraseItems];

  const filteredItems = allItems.filter((item) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'custom'
        ? item.category === 'custom'
        : item.category === activeTab;

    if (!matchesTab) return false;

    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.original.toLowerCase().includes(q) ||
      item.phonetic.toLowerCase().includes(q)
    );
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOriginal.trim() || !newPhonetic.trim()) return;

    onAddCustomWord(newOriginal.trim(), newPhonetic.trim());
    setAddNotice(`قاعده تلفظ «${newOriginal.trim()}» با موفقیت اضافه شد`);
    setNewOriginal('');
    setNewPhonetic('');
    setTimeout(() => setAddNotice(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                فرهنگ نگاشت تلفظ صحیح کلمات فارسی
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  {allItems.length} قاعده فعال
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                رفع خطاهای رایج گوینده در ادای واژگان، تنوین‌ها، حرکات کوتاه و ترکیب‌های هم‌نگاشت
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Add custom entry form */}
          <form
            onSubmit={handleAdd}
            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>افزودن کلمه یا اصطلاح دلخواه به نگاشت تلفظ:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={newOriginal}
                onChange={(e) => setNewOriginal(e.target.value)}
                placeholder="کلمه به شکل معمول (مثلاً: دیجی‌کالا یا مه‌آلود)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={newPhonetic}
                onChange={(e) => setNewPhonetic(e.target.value)}
                placeholder="تلفظ با اعراب (مثلاً: دیجی‌کالا یا مَه‌آلود)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                این اصلاح به صورت خودکار پیش از تبدیل صوت روی متن اعمال می‌شود.
              </span>
              <button
                type="submit"
                disabled={!newOriginal.trim() || !newPhonetic.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ثبت قاعده جدید</span>
              </button>
            </div>
            {addNotice && (
              <div className="text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{addNotice}</span>
              </div>
            )}
          </form>

          {/* Search and Tabs */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در فرهنگ تلفظ (مثلاً: می‌شود، مهربان، لطفاً)..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'all', label: `همه (${allItems.length})` },
                { id: 'custom', label: `اختصاصی شما (${customItems.length})` },
                { id: 'verbs', label: `افعال (${verbItems.length})` },
                { id: 'tanwin', label: `تنوین‌ها (${tanwinItems.length})` },
                { id: 'nouns', label: `واژگان و صفات (${nounItems.length})` },
                { id: 'phrases', label: `ترکیبات متنی (${phraseItems.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of rules */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                موردی یافت نشد. می‌توانید با فرم بالا قاعده جدید اضافه کنید.
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={`${item.original}-${idx}`}
                  className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-800/30 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-300 min-w-20">
                      {item.original}
                    </span>
                    <span className="text-slate-500 text-[11px]">➔</span>
                    <span className="font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                      {item.phonetic}
                    </span>
                    <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onTestPronunciation && (
                      <button
                        onClick={() => onTestPronunciation(item.phonetic)}
                        className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition"
                        title="شنیدن تلفظ"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(item as any).isCustom && (
                      <button
                        onClick={() => onRemoveCustomWord(item.original)}
                        className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition"
                        title="حذف این قاعده"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              این نگاشت به طور خودکار قبل از ارسال متن به موتور صوتی پردازش می‌شود تا افعال (مانند «می‌شود» به «می‌شَوَد»)، واژگان دارای تنوین (مانند «لطفاً»)، و کلمات دارای فتحه/کسره/ضمه بدون مکث ماشینی و دقیقاً مشابه ادای انسانی خوانده شوند.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
