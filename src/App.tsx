/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AudioWaveform } from './components/AudioWaveform';
import { TextEditor } from './components/TextEditor';
import { CharacterToneSelector } from './components/CharacterToneSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { PronunciationDictionaryModal } from './components/PronunciationDictionaryModal';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { AudioRecordItem, CharacterType, EmotionType } from './types/tts';
import { detectLanguage } from './utils/languageDetector';
import { triggerFileDownload, quickShareAudio } from './utils/audioExporter';
import {
  Sparkles,
  Download,
  Share2,
  Trash2,
  History,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_TEXT = `سلام و درود! به استودیوی صوتی «آوای ایران آزاد» خوش آمدید.
شما می‌توانید شخصیت و لحن احساسی مورد نظر خود را انتخاب کنید و با زدن دکمه تبدیل، فایل صوتی را در پلیر زیر بشنوید و با کیفیت بالا ذخیره نمایید.`;

export default function App() {
  const [text, setText] = useState<string>(INITIAL_TEXT);
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [character, setCharacter] = useState<CharacterType>('female');
  const [emotion, setEmotion] = useState<EmotionType>('happy');
  const [history, setHistory] = useState<AudioRecordItem[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [customMap, setCustomMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('awastudio_custom_pronunciation_map');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const {
    state,
    progress,
    currentAudioRecord,
    setCurrentAudioRecord,
    convertTextToAudio,
  } = useSpeechSynthesis();

  // Save custom pronunciation map
  useEffect(() => {
    try {
      localStorage.setItem('awastudio_custom_pronunciation_map', JSON.stringify(customMap));
    } catch (e) {
      console.warn(e);
    }
  }, [customMap]);

  const handleAddCustomWord = (original: string, phonetic: string) => {
    setCustomMap((prev) => ({ ...prev, [original]: phonetic }));
  };

  const handleRemoveCustomWord = (original: string) => {
    setCustomMap((prev) => {
      const copy = { ...prev };
      delete copy[original];
      return copy;
    });
  };

  // Load saved history
  useEffect(() => {
    try {
      const saved = localStorage.getItem('awastudio_audio_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Save history
  useEffect(() => {
    try {
      const cleanHistory = history.map(({ audioBlob, ...rest }) => rest);
      localStorage.setItem('awastudio_audio_history', JSON.stringify(cleanHistory));
    } catch (e) {
      console.warn(e);
    }
  }, [history]);

  // Main Conversion Action
  const handleConvert = async () => {
    if (!text.trim()) return;
    const detected = detectLanguage(text);
    setLanguage(detected);

    try {
      const record = await convertTextToAudio({
        text,
        character,
        emotion,
        lang: detected,
        customMap,
      });

      // Add to history
      setHistory((prev) => [record, ...prev.slice(0, 19)]);
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  // Download Audio File
  const handleDownload = (record?: AudioRecordItem | null) => {
    const target = record || currentAudioRecord;
    if (!target) return;

    const isMp3 = target.audioBlob?.type.includes('mpeg') || target.audioBlob?.type.includes('mp3');
    const ext = isMp3 ? 'mp3' : 'wav';
    const fileName = `Awa_${target.character}_${target.language}_${Date.now()}.${ext}`;
    if (target.audioBlob) {
      triggerFileDownload(target.audioBlob, fileName);
      setDownloadSuccess(`فایل صوتی (${ext.toUpperCase()}) با موفقیت در حافظه ذخیره شد! 🎉`);
      setTimeout(() => setDownloadSuccess(null), 3500);
    }
  };

  // Quick Share
  const handleShare = async (record?: AudioRecordItem | null) => {
    const target = record || currentAudioRecord;
    if (!target || !target.audioBlob) return;

    const fileName = `Awa_${target.character}_${Date.now()}.wav`;
    const res = await quickShareAudio(
      target.audioBlob,
      fileName,
      'Awa Studio Voice',
      target.textSnippet
    );

    if (res.success) {
      setDownloadSuccess(
        res.method === 'web_share' ? 'پنجره اشتراک‌گذاری باز شد' : 'فایل دانلود شد'
      );
      setTimeout(() => setDownloadSuccess(null), 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Clean Mobile App Header */}
      <Navbar />

      {/* Main Studio Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 flex-1">
        {/* Real-time Waveform Indicator */}
        <AudioWaveform
          isPlaying={state === 'speaking'}
          progress={progress}
          pitch={character === 'child' ? 1.3 : character === 'male' ? 0.9 : 1.1}
          speed={emotion === 'angry' ? 1.15 : emotion === 'sad' ? 0.85 : 1.0}
          height={56}
        />

        {/* 1. Text Input Card */}
        <TextEditor
          text={text}
          setText={setText}
          language={language}
          setLanguage={setLanguage}
          customMap={customMap}
          onOpenDictionary={() => setIsDictionaryOpen(true)}
        />

        {/* 2. Character and Emotion Selector */}
        <CharacterToneSelector
          character={character}
          setCharacter={setCharacter}
          emotion={emotion}
          setEmotion={setEmotion}
        />

        {/* 3. Primary Convert Button */}
        <div className="flex flex-col gap-2 pt-1">
          {currentAudioRecord && (currentAudioRecord.emotion !== emotion || currentAudioRecord.character !== character) && (
            <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center animate-pulse">
              <span>لحن یا شخصیت تغییر کرد؛ روی دکمه زیر بزنید تا صدا با لحن جدید اجرا شود:</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleConvert}
            disabled={!text.trim() || state === 'loading'}
            className={`w-full py-4 px-6 rounded-2xl text-white font-bold text-base shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 active:scale-[0.98] ${
              currentAudioRecord && (currentAudioRecord.emotion !== emotion || currentAudioRecord.character !== character)
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-amber-600/30 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>
              {state === 'loading'
                ? 'در حال پردازش و تغییر لحن صدا...'
                : currentAudioRecord
                ? `تبدیل مجدد با لحن: ${
                    emotion === 'happy'
                      ? 'شاد و صمیمی 😄'
                      : emotion === 'sad'
                      ? 'غمگین و محزون 😢'
                      : emotion === 'angry'
                      ? 'خشمگین و عصبانی 😡'
                      : 'تبلیغاتی و رسا 📢'
                  }`
                : `تبدیل به صدا با لحن: ${
                    emotion === 'happy'
                      ? 'شاد 😄'
                      : emotion === 'sad'
                      ? 'غمگین 😢'
                      : emotion === 'angry'
                      ? 'خشمگین 😡'
                      : 'تبلیغاتی 📢'
                  }`}
            </span>
          </button>
        </div>

        {/* 4. Dedicated Audio Player & Download Confirmation Card */}
        {currentAudioRecord && (
          <AudioPlayer
            record={currentAudioRecord}
            onDownload={() => handleDownload(currentAudioRecord)}
            onShare={() => handleShare(currentAudioRecord)}
            downloadSuccess={downloadSuccess}
          />
        )}

        {/* 5. Saved Audio History Archive */}
        {history.length > 0 && (
          <div className="flex flex-col gap-2.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 mt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                آرشیو فایل‌های تولید شده ({history.length}):
              </span>
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[10px] text-slate-500 hover:text-rose-400 transition"
              >
                پاکسازی تاریخچه
              </button>
            </div>

            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentAudioRecord(item)}
                    className="flex flex-col min-w-0 flex-1 pr-1 text-right group"
                  >
                    <span className="font-semibold text-slate-200 group-hover:text-indigo-400 truncate transition">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.voiceName} • {item.duration} ثانیه • {item.createdAt}
                    </span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-300 rounded-lg hover:bg-slate-800 transition"
                      title="دانلود فایل"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition"
                      title="اشتراک‌گذاری"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Pronunciation & Mispronunciation Dictionary Modal */}
        <PronunciationDictionaryModal
          isOpen={isDictionaryOpen}
          onClose={() => setIsDictionaryOpen(false)}
          customMap={customMap}
          onAddCustomWord={handleAddCustomWord}
          onRemoveCustomWord={handleRemoveCustomWord}
          onTestPronunciation={(testWord) => {
            convertTextToAudio({
              text: testWord,
              character,
              emotion,
              lang: 'fa',
              customMap,
            });
          }}
        />
      </main>
    </div>
  );
}
