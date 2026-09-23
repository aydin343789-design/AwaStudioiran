import React from 'react';
import { User, Smile, Frown, Flame, Megaphone, Baby, Sparkles } from 'lucide-react';
import { CharacterType, EmotionType } from '../types/tts';

interface CharacterToneSelectorProps {
  character: CharacterType;
  setCharacter: (c: CharacterType) => void;
  emotion: EmotionType;
  setEmotion: (e: EmotionType) => void;
}

export const CharacterToneSelector: React.FC<CharacterToneSelectorProps> = ({
  character,
  setCharacter,
  emotion,
  setEmotion,
}) => {
  const characters: { id: CharacterType; label: string; icon: string; desc: string }[] = [
    { id: 'female', label: 'زن', icon: '👩', desc: 'صدای رسا و دلنشین بانوان' },
    { id: 'male', label: 'مرد', icon: '👨', desc: 'صدای عمیق و بم آقایان' },
    { id: 'child', label: 'کودک', icon: '🧒', desc: 'صدای شاداب و جوان' },
  ];

  const emotions: { id: EmotionType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'happy',
      label: 'شاد و صمیمی',
      icon: <Smile className="w-4 h-4 text-amber-400" />,
      desc: 'پرانرژی، گرم و دوستانه',
    },
    {
      id: 'sad',
      label: 'غمگین و ناراحت',
      icon: <Frown className="w-4 h-4 text-blue-400" />,
      desc: 'شمرده، آرام و حزن‌انگیز',
    },
    {
      id: 'angry',
      label: 'خشمگین و عصبانی',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
      desc: 'قاطع، تند و هیجانی',
    },
    {
      id: 'commercial',
      label: 'تبلیغاتی و رسا',
      icon: <Megaphone className="w-4 h-4 text-emerald-400" />,
      desc: 'واضح، ترغیب‌کننده و رسمی',
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-lg">
      {/* Section 1: Character Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-400" />
            ۱. انتخاب شخصیت گوینده:
          </span>
          <span className="text-[11px] text-indigo-300 font-normal">
            {characters.find((c) => c.id === character)?.label}
          </span>
        </label>

        <div className="grid grid-cols-3 gap-2">
          {characters.map((c) => {
            const isSelected = character === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCharacter(c.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-600/30 to-purple-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{c.icon}</span>
                <span className="text-xs font-bold">{c.label}</span>
                <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{c.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Emotion / Tone Selection */}
      <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-800/80">
        <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            ۲. انتخاب لحن و حس گوینده:
          </span>
          <span className="text-[11px] text-amber-300 font-normal">
            {emotions.find((e) => e.id === emotion)?.label}
          </span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {emotions.map((e) => {
            const isSelected = emotion === e.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setEmotion(e.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-indigo-500 text-white shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-indigo-600/80 text-white' : 'bg-slate-800/80'
                  }`}
                >
                  {e.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate">{e.label}</span>
                  <span className="text-[10px] text-slate-400 truncate">{e.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
