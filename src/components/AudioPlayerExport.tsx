import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  Download,
  Share2,
  Trash2,
  Check,
  Volume2,
  History,
  FileAudio,
} from 'lucide-react';
import { AudioRecordItem, TTSState } from '../types/tts';
import { triggerFileDownload, quickShareAudio } from '../utils/audioExporter';

interface AudioPlayerExportProps {
  state: TTSState;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onExport: (format: 'wav' | 'webm' | 'mp3') => Promise<AudioRecordItem>;
  progress: number;
  spokenWords: string[];
  currentWordIndex: number;
  history: AudioRecordItem[];
  setHistory: React.Dispatch<React.SetStateAction<AudioRecordItem[]>>;
  text: string;
  language: 'fa' | 'en';
}

export const AudioPlayerExport: React.FC<AudioPlayerExportProps> = ({
  state,
  onPlay,
  onPause,
  onResume,
  onStop,
  onExport,
  progress,
  spokenWords,
  currentWordIndex,
  history,
  setHistory,
  text,
  language,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const wordsBoxRef = useRef<HTMLDivElement | null>(null);
  const historyAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll words box to keep spoken word in view
  useEffect(() => {
    if (wordsBoxRef.current && currentWordIndex >= 0) {
      const activeEl = wordsBoxRef.current.querySelector(`[data-word-idx="${currentWordIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [currentWordIndex]);

  // Export & Download WAV file
  const handleExportWav = async () => {
    if (!text.trim()) return;
    setIsExporting(true);
    setNotice(null);

    try {
      const record = await onExport('wav');
      const fileName = `AwaStudio_${language === 'fa' ? 'Persian' : 'English'}_${Date.now()}.wav`;
      if (record.audioBlob) {
        triggerFileDownload(record.audioBlob, fileName);
      }
      setHistory((prev) => [record, ...prev.slice(0, 19)]);
      setNotice('فایل صوتی با فرمت استاندارد WAV با موفقیت دانلود شد! 🎉');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(null), 3500);
    }
  };

  // Quick Share
  const handleQuickShare = async () => {
    if (!text.trim()) return;
    setIsExporting(true);
    try {
      const record = await onExport('wav');
      const fileName = `AwaStudio_Voice_${Date.now()}.wav`;
      if (record.audioBlob) {
        const res = await quickShareAudio(
          record.audioBlob,
          fileName,
          'AwaStudio Audio',
          record.textSnippet
        );
        if (res.success) {
          setNotice(res.method === 'web_share' ? 'پنجره اشتراک‌گذاری باز شد' : 'فایل دانلود شد');
        }
      }
      setHistory((prev) => [record, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // History playback
  const handlePlayHistory = (item: AudioRecordItem) => {
    if (activeHistoryId === item.id) {
      if (historyAudioRef.current) {
        historyAudioRef.current.pause();
        setActiveHistoryId(null);
      }
      return;
    }
    if (historyAudioRef.current) {
      historyAudioRef.current.pause();
    }
    const audio = new Audio(item.audioUrl);
    audio.onended = () => setActiveHistoryId(null);
    audio.play();
    historyAudioRef.current = audio;
    setActiveHistoryId(item.id);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Play & Download Control Card */}
      <div className="flex flex-col gap-3 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
        {/* Main Action Buttons Grid */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Play / Pause / Resume */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            {state === 'speaking' ? (
              <button
                onClick={onPause}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition"
              >
                <Pause className="w-5 h-5 fill-current" />
                توقف موقت
              </button>
            ) : state === 'paused' ? (
              <button
                onClick={onResume}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md active:scale-95 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                ادامه خواندن
              </button>
            ) : (
              <button
                onClick={onPlay}
                disabled={!text.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-40 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>پخش صدای گوینده ({language === 'fa' ? 'فارسی 🇮🇷' : 'English 🇬🇧'})</span>
              </button>
            )}

            {(state === 'speaking' || state === 'paused') && (
              <button
                onClick={onStop}
                className="p-3 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 border border-slate-700 active:scale-95 transition"
                title="توقف کامل"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>

          {/* Download & Share */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWav}
              disabled={!text.trim() || isExporting}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 active:scale-95 disabled:opacity-40 transition whitespace-nowrap"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'در حال آماده‌سازی...' : 'دانلود فایل صوتی (WAV)'}</span>
            </button>

            <button
              onClick={handleQuickShare}
              disabled={!text.trim() || isExporting}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white active:scale-95 disabled:opacity-40 transition"
              title="اشتراک‌گذاری سریع"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time word highlight sync */}
        {spokenWords.length > 0 && (
          <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-indigo-400" />
                متن همگام با صوت گوینده:
              </span>
              <span className="font-mono text-indigo-300">
                {currentWordIndex >= 0 ? currentWordIndex + 1 : 0} / {spokenWords.length}
              </span>
            </div>

            <div
              ref={wordsBoxRef}
              className="max-h-20 overflow-y-auto p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-loose flex flex-wrap gap-1"
              dir={language === 'fa' ? 'rtl' : 'ltr'}
            >
              {spokenWords.map((word, idx) => {
                const isActive = idx === currentWordIndex;
                const isPassed = idx < currentWordIndex;
                return (
                  <span
                    key={`${word}-${idx}`}
                    data-word-idx={idx}
                    className={`px-1.5 py-0.5 rounded transition ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold scale-105 shadow-sm'
                        : isPassed
                        ? 'text-indigo-300 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Notice alert */}
        {notice && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in">
            <span>{notice}</span>
            <Check className="w-4 h-4 text-emerald-400" />
          </div>
        )}
      </div>

      {/* History Section (Recent Audio Files) */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              فایل‌های صوتی تولید شده ({history.length}):
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-[10px] text-slate-500 hover:text-rose-400"
            >
              پاکسازی
            </button>
          </div>

          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {history.map((item) => {
              const isPlayingThis = activeHistoryId === item.id;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => handlePlayHistory(item)}
                      className={`p-1.5 rounded-lg ${
                        isPlayingThis ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-200 truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.duration} ثانیه • {item.language === 'fa' ? 'فارسی' : 'English'} • {item.createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        if (item.audioBlob) {
                          triggerFileDownload(item.audioBlob, `AwaStudio_${item.id}.wav`);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-300"
                      title="دانلود"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-400"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
