import { PresetMood } from '../types/tts';

export const PRESET_MOODS: PresetMood[] = [
  {
    id: 'radio_host',
    title: 'Radio & Podcast Host',
    persianTitle: 'گوینده رادیو و پادکست',
    description: 'صدای عمیق و باوقار، لحن گرم و رادیویی با مکث‌های استاندارد',
    speed: 0.95,
    pitch: 0.85,
    iconName: 'Radio',
    category: 'persian',
  },
  {
    id: 'audiobook',
    title: 'Audiobook & Storytelling',
    persianTitle: 'کتاب صوتی و قصه‌گویی',
    description: 'لحن آرامش‌بخش، شمرده و صمیمی برای رمان‌ها و متون بلند',
    speed: 0.90,
    pitch: 1.0,
    iconName: 'BookOpen',
    category: 'persian',
  },
  {
    id: 'news_anchor',
    title: 'Official News Broadcast',
    persianTitle: 'گوینده خبر رسمی',
    description: 'بیان رسا، مقتدر، ریتم یکنواخت و تلفظ دقیق بدون احساسات شخصی',
    speed: 1.05,
    pitch: 0.95,
    iconName: 'Megaphone',
    category: 'persian',
  },
  {
    id: 'educational',
    title: 'Educational & Articulation',
    persianTitle: 'آموزشی و تلفظ شمرده',
    description: 'سرعت آرام و تفکیک هجاها برای یادگیری، کودکان و تدریس',
    speed: 0.75,
    pitch: 1.05,
    iconName: 'GraduationCap',
    category: 'persian',
  },
  {
    id: 'fast_summary',
    title: 'Fast Digest & Podcast 1.4x',
    persianTitle: 'خلاصه‌خوانی پرانرژی',
    description: 'سرعت بالا برای مرور سریع مقالات و گوش دادن به خلاصه کتاب‌ها',
    speed: 1.35,
    pitch: 1.0,
    iconName: 'Zap',
    category: 'general',
  },
  {
    id: 'english_narrator',
    title: 'English Professional Voice',
    persianTitle: 'گوینده انگلیسی استاندارد',
    description: 'Clear native articulation with natural rhythm and inflection',
    speed: 1.0,
    pitch: 1.0,
    iconName: 'Globe',
    category: 'english',
  },
];

export interface SampleText {
  id: string;
  title: string;
  lang: 'fa' | 'en';
  tag: string;
  text: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'persian_literature',
    title: 'گلستان سعدی (تست ادب و ظرافت)',
    lang: 'fa',
    tag: 'شعر و ادب',
    text: 'بنی‌آدم اعضای یک‌دیگرند، که در آفرینش ز یک گوهرند. چو عضوی به درد آورَد روزگار، دگر عضوها را نمانَد قرار. تو کز محنت دیگران بی‌غمی، نشاید که نامت نهند آدمی.',
  },
  {
    id: 'persian_news_numbers',
    title: 'متن خبری، تاریخ و اعداد (تست تلفظ ارقام)',
    lang: 'fa',
    tag: 'اخبار و اعداد',
    text: 'در سال ۱۴۰۳ خورشیدی، بیش از ۸۵ میلیون نفر از فناوری‌های نوین صوتی و هوش مصنوعی در سرتاسر جهان بهره‌مند شدند. این پیشرفت نسبت به سال گذشته حدود ۲۴ درصد رشد داشته است.',
  },
  {
    id: 'persian_phonetics',
    title: 'جملات چالشی (تست اعراب و تلفظ کلمات هم‌نگاشت)',
    lang: 'fa',
    tag: 'دقت تلفظ',
    text: 'شُکرِ خداوند را به جای آورید و از کَرَم و مِهربانی او غافل مشوید. کِرمِ ابریشم در دل پیله‌اش به آرامی نقش زیبای بال‌هایش را رقم می‌زَنَد.',
  },
  {
    id: 'english_tech',
    title: 'Tech & AI Innovation (English)',
    lang: 'en',
    tag: 'English Audio',
    text: 'Welcome to AwaStudio TTS Pro. This high-fidelity speech synthesis engine delivers crystal-clear pronunciation, customizable pitch and rate, and complete offline capability for mobile devices.',
  },
];
