import React, { useRef, useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Type,
  Volume2,
  BookOpen,
} from 'lucide-react';
import {
  autoEnhancePersianPhonetics,
  convertTextNumbersToWords,
  DIACRITIC_BUTTONS,
} from '../utils/persianDiacritics';
import { detectLanguage, optimizeEnglishText } from '../utils/languageDetector';
import { getDictionaryStats } from '../utils/persianPronunciationDict';

interface TextEditorProps {
  text: string;
  setText: (val: string) => void;
  language: 'fa' | 'en';
  setLanguage: (lang: 'fa' | 'en') => void;
  customMap?: Record<string, string>;
  onOpenDictionary?: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  setText,
  language,
  setLanguage,
  customMap = {},
  onOpenDictionary,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDiacritics, setShowDiacritics] = useState(false);
  const dictStats = getDictionaryStats();
  const totalRules = dictStats.totalRules + Object.keys(customMap).length;

  // Statistics
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estSeconds = wordCount > 0 ? Math.round((wordCount / 125) * 60) : 0;

  // On text change: auto-detect language silently
  const handleTextChange = (val: string) => {
    setText(val);
    if (val.trim().length >= 2) {
      const detected = detectLanguage(val);
      if (detected !== language) {
        setLanguage(detected);
      }
    }
  };

  // Insert diacritic at cursor
  const insertDiacritic = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setText(text + symbol);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = text.substring(0, start) + symbol + text.substring(end);
    setText(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + symbol.length, start + symbol.length);
    }, 10);
  };

  // Smart Persian Pronunciation & Diacritics
  const handleSmartEnhance = () => {
    if (!text.trim()) return;
    if (language === 'fa') {
      const enhanced = autoEnhancePersianPhonetics(text, customMap);
      setText(enhanced);
      setNotice('اصلاح واژگان، اعراب‌گذاری و نگاشت تلفظ اعمال شد');
    } else {
      const optimized = optimizeEnglishText(text);
      setText(optimized);
      setNotice('بهینه‌سازی ریتم و درنگ‌های متن انجام شد');
    }
    setTimeout(() => setNotice(null), 2500);
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Editor Box */}
      <div className="relative rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-indigo-500 transition shadow-lg overflow-hidden">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder={
            language === 'fa'
              ? 'متن خود را اینجا وارد کنید (فارسی یا انگلیسی)...'
              : 'Enter your text here...'
          }
          dir={language === 'fa' ? 'rtl' : 'ltr'}
          rows={5}
          className="w-full bg-transparent px-4 py-3.5 text-slate-100 placeholder-slate-500 focus:outline-none text-sm leading-relaxed resize-none font-['Vazirmatn']"
        />

        {/* Bottom stats & quick actions bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>
              <strong className="text-indigo-400">{wordCount}</strong> کلمه
            </span>
            <span>
              <strong className="text-slate-300">{charCount}</strong> کاراکتر
            </span>
            {wordCount > 0 && (
              <span className="text-emerald-400 flex items-center gap-1 font-sans">
                <Volume2 className="w-3 h-3" />
                حدود {estSeconds} ثانیه
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!text}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 transition"
              title="کپی متن"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition"
              title="پاکسازی متن"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification */}
      {notice && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl px-3 py-1.5 flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      )}

      {/* Diacritics & Pronunciation Fix Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSmartEnhance}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 text-xs font-semibold active:scale-95 disabled:opacity-40 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>اعراب‌گذاری و تصحیح هوشمند تلفظ</span>
          </button>

          {language === 'fa' && onOpenDictionary && (
            <button
              type="button"
              onClick={onOpenDictionary}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium active:scale-95 transition"
              title="مشاهده و مدیریت واژگان و تلفظ‌های صحیح"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>فرهنگ نگاشت تلفظ</span>
              <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-indigo-500/30">
                {totalRules}
              </span>
            </button>
          )}
        </div>

        {language === 'fa' && (
          <button
            type="button"
            onClick={() => setShowDiacritics(!showDiacritics)}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 transition"
          >
            {showDiacritics ? 'بستن اعراب‌گذاری دستی ▲' : 'اعراب‌گذاری دستی (فتحه، کسره، ضمه) ▼'}
          </button>
        )}
      </div>

      {/* Manual Diacritics Buttons */}
      {showDiacritics && language === 'fa' && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800 animate-in fade-in">
          {DIACRITIC_BUTTONS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => insertDiacritic(item.symbol)}
              className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded-lg text-sm font-bold transition shadow-sm"
              title={item.name}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
