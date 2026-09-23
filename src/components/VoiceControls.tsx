import React from 'react';
import {
  Mic,
  Sliders,
  Gauge,
  Activity,
  Radio,
  BookOpen,
  Megaphone,
  Globe,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { VoiceOption } from '../types/tts';

interface VoiceControlsProps {
  voices: VoiceOption[];
  persianVoices: VoiceOption[];
  englishVoices: VoiceOption[];
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
  language: 'fa' | 'en';
  speed: number;
  setSpeed: (val: number) => void;
  pitch: number;
  setPitch: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  voices,
  persianVoices,
  englishVoices,
  selectedVoiceId,
  setSelectedVoiceId,
  language,
  speed,
  setSpeed,
  pitch,
  setPitch,
}) => {
  const activeList = language === 'fa' ? persianVoices : englishVoices;
  const displayList = activeList.length > 0 ? activeList : voices;

  // Simple Mood Presets
  const presets = [
    {
      name: 'گوینده رادیو',
      desc: 'بم و وزین',
      speed: 0.95,
      pitch: 0.85,
      icon: <Radio className="w-3.5 h-3.5" />,
    },
    {
      name: 'کتاب صوتی',
      desc: 'آرام و دلنشین',
      speed: 0.9,
      pitch: 1.0,
      icon: <BookOpen className="w-3.5 h-3.5" />,
    },
    {
      name: 'گوینده خبر',
      desc: 'رسمی و رسا',
      speed: 1.05,
      pitch: 0.95,
      icon: <Megaphone className="w-3.5 h-3.5" />,
    },
    {
      name: 'انگلیسی بومی',
      desc: 'Natural UK/US',
      speed: 1.0,
      pitch: 1.0,
      icon: <Globe className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex flex-col gap-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>تنظیم گوینده، لحن و سرعت (بدون رباتیک شدن)</span>
        </div>

        <button
          onClick={() => {
            setSpeed(1.0);
            setPitch(1.0);
          }}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          پیش‌فرض
        </button>
      </div>

      {/* Voice Selection Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-indigo-400" />
            انتخاب گوینده:
          </span>
          <span className="text-indigo-400 text-[10px] font-semibold flex items-center gap-0.5">
            <Sparkles className="w-3 h-3" />
            اولویت با صدای طبیعی انسان
          </span>
        </label>

        {displayList.length > 0 ? (
          <div className="relative">
            <select
              value={selectedVoiceId}
              onChange={(e) => setSelectedVoiceId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              {displayList.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.flag} {v.displayName}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        ) : (
          <div className="p-2 bg-slate-950 rounded-xl text-xs text-slate-400">
            موتور صوتی پیش‌فرض فعال است.
          </div>
        )}
      </div>

      {/* Quick Mood Presets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {presets.map((p) => {
          const isSelected = Math.abs(speed - p.speed) < 0.04 && Math.abs(pitch - p.pitch) < 0.04;
          return (
            <button
              key={p.name}
              onClick={() => {
                setSpeed(p.speed);
                setPitch(p.pitch);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl border text-right transition ${
                isSelected
                  ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                {p.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight">{p.name}</span>
                <span className="text-[10px] text-slate-400">{p.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Speed & Pitch Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        {/* Speed */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              سرعت خوانش:
            </span>
            <span className="font-mono text-cyan-300 font-bold">{speed.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.8"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>آهسته (۰.۶x)</span>
            <span>نرمال (۱.۰x)</span>
            <span>سریع (۱.۸x)</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              لحن و فرکانس صدا:
            </span>
            <span className="font-mono text-purple-300 font-bold">
              {pitch < 0.9 ? 'بم و رادیویی' : pitch > 1.15 ? 'زیر و پرانرژی' : 'طبیعی'} ({pitch.toFixed(2)})
            </span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.5"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>صدای بم</span>
            <span>طبیعی (۱.۰)</span>
            <span>صدای زیر</span>
          </div>
        </div>
      </div>
    </div>
  );
};
