/**
 * Persian linguistic and phonetic preprocessing toolkit for TTS precision
 */
import { applyPronunciationDictionary } from './persianPronunciationDict.ts';

// Convert Persian and English digits to Persian words (0 to billions)
const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
const hundreds = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

export function numberToPersianWords(num: number): string {
  if (num === 0) return 'صفر';
  if (isNaN(num) || num < 0 || num > 999999999999) return num.toString();

  const chunks: number[] = [];
  let n = Math.floor(num);
  while (n > 0) {
    chunks.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const chunkWords: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk === 0) continue;

    const h = Math.floor(chunk / 100);
    const remainder = chunk % 100;
    const parts: string[] = [];

    if (h > 0) parts.push(hundreds[h]);

    if (remainder >= 10 && remainder < 20) {
      parts.push(teens[remainder - 10]);
    } else {
      const t = Math.floor(remainder / 10);
      const o = remainder % 10;
      if (t > 0) parts.push(tens[t]);
      if (o > 0) parts.push(ones[o]);
    }

    const chunkStr = parts.join(' و ');
    const scale = scales[i];
    chunkWords.push(scale ? `${chunkStr} ${scale}` : chunkStr);
  }

  return chunkWords.join(' و ');
}

// Persian and Arabic digits mapper
const enDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function normalizeDigitsToEn(str: string): string {
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replace(new RegExp(faDigits[i], 'g'), enDigits[i]);
    res = res.replace(new RegExp(arDigits[i], 'g'), enDigits[i]);
  }
  return res;
}

// Convert all numbers within text to Persian spoken words for smooth TTS
export function convertTextNumbersToWords(text: string): string {
  const normalized = normalizeDigitsToEn(text);
  // Match consecutive digits
  return normalized.replace(/\b\d+\b/g, (match) => {
    const num = parseInt(match, 10);
    if (!isNaN(num) && num < 1000000000) {
      return numberToPersianWords(num);
    }
    return match;
  });
}

// Common Persian abbreviations expanded to clear spoken audio
export const persianAbbreviations: Record<string, string> = {
  'ص': 'صَلّی‌اللهُ‌عَلَیهِ‌وَ‌آلِه‌وَ‌سَلَّم',
  '(ص)': 'صَلّی‌اللهُ‌عَلَیهِ‌وَ‌آلِه‌وَ‌سَلَّم',
  'ع': 'عَلَیهِ‌السَّلام',
  '(ع)': 'عَلَیهِ‌السَّلام',
  'ره': 'رَحمَةُ‌اللهِ‌عَلَیه',
  '(ره)': 'رَحمَةُ‌اللهِ‌عَلَیه',
  'د.': 'دُکتُر',
  'م.': 'میلادی',
  'ه‍.ق': 'هجری قمری',
  'ه‍.ش': 'هجری شمسی',
  'ق.م': 'قبل از میلاد',
  'صص': 'صفحه‌های',
  'ص.': 'صفحهٔ',
};

// Common homographs and words prone to TTS mispronunciation with diacritic recommendations
export const persianPhoneticFixes: [RegExp, string][] = [
  [/\bمهربانی\b/g, 'مِهربانی'],
  [/\bمهربان\b/g, 'مِهربان'],
  [/\bمهر ماه\b/g, 'مِهر ماه'],
  [/\bشکرگزاری\b/g, 'شُکرگزاری'],
  [/\bشکر خدا\b/g, 'شُکرِ خدا'],
  [/\bشیرین و شکر\b/g, 'شیرین و شِکَر'],
  [/\bکرم ابریشم\b/g, 'کِرمِ ابریشم'],
  [/\bلطف و کرم\b/g, 'لطف و کَرَم'],
  [/\bگل سرخ\b/g, 'گُلِ سرخ'],
  [/\bگل و لای\b/g, 'گِل و لای'],
  [/\bدرآمد\b/g, 'درآمَد'],
  [/\bمی شود\b/g, 'می‌شَوَد'],
  [/\bمی‌شود\b/g, 'می‌شَوَد'],
  [/\bمی کند\b/g, 'می‌کُنَد'],
  [/\bمی‌کند\b/g, 'می‌کُنَد'],
  [/\bمی رود\b/g, 'می‌رَوَد'],
  [/\bمی‌رود\b/g, 'می‌رَوَد'],
  [/\bمی گوید\b/g, 'می‌گویَد'],
  [/\bمی‌گوید\b/g, 'می‌گویَد'],
  [/\bمی خواند\b/g, 'می‌خوانَد'],
  [/\bمی‌خواند\b/g, 'می‌خوانَد'],
  [/\bخوانده\b/g, 'خواندِه'],
  [/\bخواهش\b/g, 'خواهِش'],
  [/\bخواستن\b/g, 'خواستَن'],
  [/\bخویش\b/g, 'خویش'],
  [/\bخواب\b/g, 'خواب'],
  [/\bروشن\b/g, 'روشَن'],
  [/\bکشور\b/g, 'کِشوَر'],
  [/\bانسان\b/g, 'اِنسان'],
  [/\bامروز\b/g, 'اِمروز'],
  [/\bامید\b/g, 'اُمید'],
  [/\bایران\b/g, 'ایران'],
  [/\bآینده\b/g, 'آیَندِه'],
];

// Normalize ZWNJ (Zero-Width Non-Joiner / نیم‌فاصله)
export function applyPersianTypography(text: string): string {
  let result = text;

  // Replace "می " at the start of words with "می‌"
  result = result.replace(/\bمی\s+([آ-ی])/g, 'می‌$1');
  // Replace "نمی " at the start of words with "نمی‌"
  result = result.replace(/\bنمی\s+([آ-ی])/g, 'نمی‌$1');
  // Replace " ها" at the end of plural nouns with "‌ها"
  result = result.replace(/([آ-ی])\s+ها\b/g, '$1‌ها');
  // Replace " تر" with "‌تر"
  result = result.replace(/([آ-ی])\s+تر\b/g, '$1‌تر');
  // Replace " ترین" with "‌ترین"
  result = result.replace(/([آ-ی])\s+ترین\b/g, '$1‌ترین');

  return result;
}

// Master offline diacritic and phonetic enhancer
export function autoEnhancePersianPhonetics(
  text: string,
  userCustomMap?: Record<string, string>
): string {
  let result = applyPersianTypography(text);

  // Expand abbreviations
  for (const [abbr, expanded] of Object.entries(persianAbbreviations)) {
    const escaped = abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`\\b${escaped}\\b`, 'g'), expanded);
  }

  // Convert numbers to words for voice clarity
  result = convertTextNumbersToWords(result);

  // Apply common homograph diacritics
  for (const [pattern, replacement] of persianPhoneticFixes) {
    result = result.replace(pattern, replacement);
  }

  // Apply comprehensive pronunciation dictionary & mispronunciation map
  result = applyPronunciationDictionary(result, userCustomMap);

  // Normalize punctuation spacing for natural speaker pauses
  result = result
    .replace(/([،؛.؟!])(?=[^\s\d])/g, '$1 ')
    .replace(/\s+([،؛.؟!])/g, '$1');

  return result;
}

export const DIACRITIC_BUTTONS = [
  { label: 'َ', symbol: '\u064E', name: 'فتحه (Fatha)', description: 'صدای اَ' },
  { label: 'ِ', symbol: '\u0650', name: 'کسره (Kasra)', description: 'صدای اِ' },
  { label: 'ُ', symbol: '\u064F', name: 'ضمه (Damma)', description: 'صدای اُ' },
  { label: 'ّ', symbol: '\u0651', name: 'تشدید (Tashdid)', description: 'تکرار حرف' },
  { label: 'ً', symbol: '\u064B', name: 'تنوین نصب', description: 'صدای اًن' },
  { label: 'ٍ', symbol: '\u064D', name: 'تنوین جر', description: 'صدای اٍن' },
  { label: 'ٌ', symbol: '\u064C', name: 'تنوین رفع', description: 'صدای اٌن' },
  { label: 'ْ', symbol: '\u0652', name: 'سکون (Sukun)', description: 'بدون حرکت' },
  { label: 'ٔ', symbol: '\u0654', name: 'همزه روی ی/ه', description: 'همزهٔ بالا' },
  { label: '‌', symbol: '\u200C', name: 'نیم‌فاصله (ZWNJ)', description: 'اتصال جدا' },
];
