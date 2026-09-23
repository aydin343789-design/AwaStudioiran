/**
 * Persian Pronunciation & Phonetic Disambiguation Dictionary
 * Solves common TTS mispronunciations for Iranian Persian (Farsi)
 */

export interface PronunciationEntry {
  original: string;
  phonetic: string;
  category: 'verb' | 'tanwin' | 'homograph' | 'noun' | 'general';
  description?: string;
}

// 1. Common Persian words typed without Tanwin (تنوین) that TTS reads incorrectly as "a" instead of "an"
export const PERSIAN_TANWIN_MAP: Record<string, string> = {
  'اصلا': 'اَصلاً',
  'لطفا': 'لُطفاً',
  'حتما': 'حَتماً',
  'واقعا': 'واقِعاً',
  'مثلا': 'مَثَلاً',
  'معمولا': 'مَعمولاً',
  'کاملا': 'کامِلاً',
  'دقیقا': 'دَقیقاً',
  'تقریبا': 'تَقریباً',
  'نسبتا': 'نِسبَتاً',
  'عملا': 'عَمَلاً',
  'مجددا': 'مُجَدَّداً',
  'فورا': 'فَوراً',
  'ظاهرا': 'ظاهِراً',
  'باطنا': 'باطِناً',
  'قلبا': 'قَلبَاً',
  'شخصا': 'شَخصاً',
  'رسما': 'رَسمياً',
  'مستقیما': 'مُستَقیماً',
  'قبلا': 'قَبلاً',
  'بعدا': 'بَعداً',
  'نهایتا': 'نِهایَتاً',
  'مخصوصا': 'مَخصوصاً',
  'عمدتا': 'عُمدَتاً',
  'صرفا': 'صِرفاً',
  'مطمئنا': 'مُطمَئِنّاً',
  'ابدا': 'اَبَداً',
  'غالبا': 'غالِباً',
  'متقابلا': 'مُتَقابِلاً',
  'اولا': 'اَوَّلاً',
  'ثانیا': 'ثانِیاً',
  'ثالثا': 'ثالِثاً',
};

// 2. Persian verbs with short vowels that TTS often flattens or mispronounces
export const PERSIAN_VERBS_MAP: Record<string, string> = {
  // Shodan (شدن) family
  'می‌شود': 'می‌شَوَد',
  'می شود': 'می‌شَوَد',
  'نمی‌شود': 'نمی‌شَوَد',
  'نمی شود': 'نمی‌شَوَد',
  'می‌شوند': 'می‌شَوَند',
  'می شوند': 'می‌شَوَند',
  'نمی‌شوند': 'نمی‌شَوَند',
  'نمی شوند': 'نمی‌شَوَند',
  'بشود': 'بِشَوَد',
  'بشوند': 'بِشَوَند',
  'نشود': 'نَشَوَد',
  'نشوند': 'نَشَوَند',

  // Raftan (رفتن) family
  'می‌رود': 'می‌رَوَد',
  'می رود': 'می‌رَوَد',
  'نمی‌رود': 'نمی‌رَوَد',
  'نمی رود': 'نمی‌رَوَد',
  'می‌روند': 'می‌رَوَند',
  'می روند': 'می‌رَوَند',
  'نمی‌روند': 'نمی‌رَوَند',
  'نمی روند': 'نمی‌رَوَند',
  'برود': 'بِرَوَد',
  'بروند': 'بِرَوَند',
  'نرود': 'نَرَوَد',
  'نروند': 'نَرَوَند',

  // Kardan (کردن) family
  'می‌کند': 'می‌کُنَد',
  'می کند': 'می‌کُنَد',
  'نمی‌کند': 'نمی‌کُنَد',
  'نمی کند': 'می‌کُنَد',
  'می‌کنند': 'می‌کُنَند',
  'می کنند': 'می‌کُنَند',
  'نمی‌کنند': 'نمی‌کُنَند',
  'نمی کنند': 'نمی‌کُنَند',
  'بکند': 'بِکُنَد',
  'بکنند': 'بِکُنَند',

  // Zadan (زدن) family
  'می‌زند': 'می‌زَنَد',
  'می زند': 'می‌زَنَد',
  'می‌زنند': 'می‌زَنَند',
  'می زنند': 'می‌زَنَند',
  'نمی‌زند': 'نمی‌زَنَد',
  'بزند': 'بِزَنَد',

  // Goftan (گفتن) family
  'می‌گوید': 'می‌گویَد',
  'می گوید': 'می‌گویَد',
  'می‌گویند': 'می‌گویَند',
  'می گویند': 'می‌گویَند',
  'بگوید': 'بِگویَد',
  'بگویند': 'بِگویَند',

  // Khandan (خواندن) & Didan (دیدن) & Danestan (دانستن)
  'می‌خواند': 'می‌خوانَد',
  'می خواند': 'می‌خوانَد',
  'می‌خوانند': 'می‌خوانَند',
  'خوانده': 'خواندِه',
  'می‌داند': 'می‌دانَد',
  'می داند': 'می‌دانَد',
  'نمی‌داند': 'نمی‌دانَد',
  'می‌دانند': 'می‌دانَند',
  'می‌بیند': 'می‌بینَد',
  'می بیند': 'می‌بینَد',
  'می‌بینند': 'می‌بینَند',
  'می‌خورد': 'می‌خورَد',
  'می خورد': 'می‌خورَد',
  'می‌آید': 'می‌آیَد',
  'می آید': 'می‌آیَد',
  'می‌آیند': 'می‌آیَند',
  'می آیند': 'می‌آیَند',
  'می‌آورد': 'می‌آوَرَد',
  'می آورد': 'می‌آوَرَد',
  'می‌ماند': 'می‌مانَد',
  'می ماند': 'می‌مانَد',

  // Tavanestan (توانستن)
  'می‌تواند': 'می‌تَوانَد',
  'می تواند': 'می‌تَوانَد',
  'نمی‌تواند': 'نمی‌تَوانَد',
  'نمی تواند': 'نمی‌تَوانَد',
  'می‌توانند': 'می‌تَوانَند',
  'می توانند': 'می‌تَوانَند',
  'نمی‌توانند': 'نمی‌تَوانَند',
  'نمی توانند': 'نمی‌تَوانَند',
  'می‌توان': 'می‌تَوان',
  'می توان': 'می‌تَوان',
  'نمی‌توان': 'نمی‌تَوان',
  'نمی توان': 'نمی‌تَوان',
  'بتواند': 'بِتَوانَد',
  'بتوانند': 'بِتَوانَند',
};

// 3. Common Persian nouns and adjectives prone to incorrect vowelization
export const PERSIAN_NOUNS_MAP: Record<string, string> = {
  'مهربان': 'مِهربان',
  'مهربانی': 'مِهربانی',
  'مهربانان': 'مِهربانان',
  'کشور': 'کِشوَر',
  'کشورها': 'کِشوَرها',
  'کشورمان': 'کِشوَرمان',
  'انسان': 'اِنسان',
  'انسان‌ها': 'اِنسان‌ها',
  'انسانیت': 'اِنسانیَّت',
  'امروز': 'اِمروز',
  'امشب': 'اِمشَب',
  'امسال': 'اِمسال',
  'امید': 'اُمید',
  'امیدوار': 'اُمیدوار',
  'امیدوارم': 'اُمیدوارَم',
  'امیدواریم': 'اُمیدواریم',
  'بهتر': 'بِهتَر',
  'بهترین': 'بِهتَرین',
  'بزرگ': 'بُزُرگ',
  'بزرگتر': 'بُزُرگ‌تر',
  'بزرگ‌تر': 'بُزُرگ‌تر',
  'بزرگترین': 'بُزُرگ‌ترین',
  'بزرگ‌ترین': 'بُزُرگ‌ترین',
  'کوچک': 'کوچَک',
  'کوچکتر': 'کوچَک‌تر',
  'کوچک‌تر': 'کوچَک‌تر',
  'روشن': 'روشَن',
  'آینده': 'آیَندِه',
  'گذشته': 'گُذَشتِه',
  'دوباره': 'دوبارِه',
  'همیشه': 'هَمیشِه',
  'همینطور': 'هَمین‌طور',
  'همچنین': 'هَمچـِنین',
  'عزیز': 'عَزیز',
  'عزیزان': 'عَزیزان',
  'سلام': 'سَلام',
  'درود': 'دُرود',
  'خداحافظ': 'خُداحافِظ',
  'خداحافظی': 'خُداحافِظی',
  'سپاسگزارم': 'سِپاسگُزارَم',
  'سپاسگزاریم': 'سِپاسگُزاریم',
  'تشکر': 'تَشَکُّر',
  'ممنون': 'مَمنون',
  'ممنونم': 'مَمنونَم',
  'خواهش': 'خواهِش',
  'خواهش می‌کنم': 'خواهِش می‌کُنَم',
  'خواهش میکنم': 'خواهِش می‌کُنَم',
  'خواستن': 'خواستَن',
  'خویشتن': 'خویشتَن',
  'درآمد': 'درآمَد',
  'رفتار': 'رَفتار',
  'گفتار': 'گُفتار',
  'پندار': 'پِندار',
  'کردار': 'کِردار',
  'شنیدار': 'شِنیدار',
  'کیفیت': 'کِیفیَّت',
  'موفقیت': 'مُوَفَّقیَّت',
  'پیشرفت': 'پیشرَفت',
  'شروع': 'شُروع',
  'کاربر': 'کاربَر',
  'کاربران': 'کاربَران',
  'صدا': 'صِدا',
  'صدای': 'صِدای',
  'متن': 'مَتن',
  'متن‌ها': 'مَتن‌ها',
  'پردازش': 'پَردازِش',
  'هوشمند': 'هوشمَند',
  'تلفظ': 'تَلَفُّظ',
  'کلمات': 'کَلِمات',
  'جمله': 'جُملِه',
  'جملات': 'جُملات',
  'صحبت': 'صُحبَت',
  'گفتگو': 'گُفتِگو',
  'استودیو': 'اِستودیو',
  'اینترنت': 'اینتِـرنِت',
  'پروژه': 'پِروژه',
  'اپلیکیشن': 'اَپلیکِیشِن',
  'برنامه': 'بَرنامِه',
};

// 4. Multi-word context-dependent homograph phrases
export const PERSIAN_PHRASAL_RULES: [RegExp, string][] = [
  [/\bخوش آمدید\b/g, 'خوش آمَدید'],
  [/\bخوش‌آمدید\b/g, 'خوش‌آمَدید'],
  [/\bخوش آمدی\b/g, 'خوش آمَدی'],
  [/\bگل سرخ\b/g, 'گُلِ سرخ'],
  [/\bگل رز\b/g, 'گُلِ رز'],
  [/\bگل لاله\b/g, 'گُلِ لاله'],
  [/\bگل و گیاه\b/g, 'گُل و گیاه'],
  [/\bگل و لای\b/g, 'گِل و لای'],
  [/\bآب و گل\b/g, 'آب و گِل'],
  [/\bشکر خدا\b/g, 'شُکرِ خدا'],
  [/\bشکرگزاری\b/g, 'شُکرگزاری'],
  [/\bقند و شکر\b/g, 'قند و شِکَر'],
  [/\bشیرین و شکر\b/g, 'شیرین و شِکَر'],
  [/\bکرم ابریشم\b/g, 'کِرمِ ابریشم'],
  [/\bکرم خاکی\b/g, 'کِرمِ خاکی'],
  [/\bلطف و کرم\b/g, 'لطف و کَرَم'],
  [/\bکرم ضد آفتاب\b/g, 'کِرِم ضد آفتاب'],
  [/\bکسب درآمد\b/g, 'کسبِ درآمَد'],
  [/\bمیزان درآمد\b/g, 'میزانِ درآمَد'],
  [/\bمهر ماه\b/g, 'مِهر ماه'],
  [/\bاول مهر\b/g, 'اوَّلِ مِهر'],
  [/\bمحبت و مهر\b/g, 'محبت و مِهر'],
];

// Single unified lookup dictionary for fast word matching
export const UNIFIED_PERSIAN_PRONUNCIATION_MAP: Record<string, string> = {
  ...PERSIAN_TANWIN_MAP,
  ...PERSIAN_VERBS_MAP,
  ...PERSIAN_NOUNS_MAP,
};

/**
 * Applies the pronunciation dictionary to Persian text
 * Takes into account phrase rules, word boundaries, and optional user overrides
 */
export function applyPronunciationDictionary(
  text: string,
  userCustomMap: Record<string, string> = {}
): string {
  if (!text || typeof text !== 'string') return '';

  let processed = text;

  // 1. First apply user custom phrases/words if any (highest priority)
  for (const [key, replacement] of Object.entries(userCustomMap)) {
    if (!key.trim() || !replacement.trim()) continue;
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    processed = processed.replace(new RegExp(`(^|\\s|[،؛.؟!«»])${escaped}($|\\s|[،؛.؟!«»])`, 'g'), `$1${replacement}$2`);
  }

  // 2. Apply multi-word context phrases
  for (const [pattern, replacement] of PERSIAN_PHRASAL_RULES) {
    processed = processed.replace(pattern, replacement);
  }

  // 3. Apply unified dictionary with word boundaries
  // Match Persian tokens including ZWNJ
  processed = processed.replace(/([آ-ی\u200C]+)/g, (word) => {
    // Exact match in dictionary
    if (UNIFIED_PERSIAN_PRONUNCIATION_MAP[word]) {
      return UNIFIED_PERSIAN_PRONUNCIATION_MAP[word];
    }
    // Also check with/without ZWNJ
    const withoutZwnj = word.replace(/\u200C/g, ' ');
    if (UNIFIED_PERSIAN_PRONUNCIATION_MAP[withoutZwnj]) {
      return UNIFIED_PERSIAN_PRONUNCIATION_MAP[withoutZwnj];
    }
    return word;
  });

  return processed;
}

/**
 * Returns statistics and catalog of pre-loaded pronunciation fixes
 */
export function getDictionaryStats() {
  return {
    tanwinCount: Object.keys(PERSIAN_TANWIN_MAP).length,
    verbsCount: Object.keys(PERSIAN_VERBS_MAP).length,
    nounsCount: Object.keys(PERSIAN_NOUNS_MAP).length,
    phrasesCount: PERSIAN_PHRASAL_RULES.length,
    totalRules:
      Object.keys(PERSIAN_TANWIN_MAP).length +
      Object.keys(PERSIAN_VERBS_MAP).length +
      Object.keys(PERSIAN_NOUNS_MAP).length +
      PERSIAN_PHRASAL_RULES.length,
  };
}
