import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceOption, TTSState, AudioRecordItem, CharacterType, EmotionType } from '../types/tts';
import { synthesizeOfflineAudioTrack } from '../utils/audioExporter';
import { autoEnhancePersianPhonetics } from '../utils/persianDiacritics';

interface ConvertOptions {
  text: string;
  character: CharacterType;
  emotion: EmotionType;
  lang: 'fa' | 'en';
  customMap?: Record<string, string>;
}

export function useSpeechSynthesis() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [state, setState] = useState<TTSState>('idle');
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [currentAudioRecord, setCurrentAudioRecord] = useState<AudioRecordItem | null>(null);

  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<any>(null);
  const isCancelledRef = useRef<boolean>(false);

  // Stop playback cleanly
  const stop = useCallback(() => {
    isCancelledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setState('idle');
    setCurrentWordIndex(-1);
    setProgress(0);
  }, []);

  // Pause
  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setState('paused');
    }
  }, []);

  // Resume
  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setState('speaking');
    }
  }, []);

  // Main Conversion Function
  const convertTextToAudio = useCallback(
    async ({ text, character, emotion, lang, customMap }: ConvertOptions): Promise<AudioRecordItem> => {
      if (!text || !text.trim()) {
        throw new Error('متن ورودی خالی است');
      }

      stop();
      isCancelledRef.current = false;
      setState('loading');

      const phoneticallyEnhanced = lang === 'fa' ? autoEnhancePersianPhonetics(text.trim(), customMap) : text.trim();
      const words = text.trim().split(/\s+/).filter(Boolean);
      setSpokenWords(words);
      setCurrentWordIndex(0);

      let audioBlob: Blob | null = null;
      let durationSec = Math.max(2, Math.round((words.length / 125) * 60));
      let audioFormat: 'mp3' | 'wav' = 'mp3';

      // 1. Try real neural human TTS via /api/tts
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text.trim(),
            character,
            emotion,
            lang,
            customMap,
          }),
        });

        if (response.ok) {
          const blob = await response.blob();
          if (blob && blob.size > 200) {
            audioBlob = blob;
            audioFormat = 'mp3';

            // Try to decode audio to get exact duration
            try {
              const arrayBuf = await audioBlob.arrayBuffer();
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
                if (decoded && decoded.duration && isFinite(decoded.duration)) {
                  durationSec = Math.max(1, Math.round(decoded.duration));
                }
                audioCtx.close().catch(() => {});
              }
            } catch (e) {
              // fallback to estimated duration
            }
          }
        }
      } catch (networkErr) {
        console.warn('Backend TTS endpoint not reachable, using offline synthesis fallback:', networkErr);
      }

      // 2. If /api/tts is offline or failed, use acoustic formant synthesis fallback
      if (!audioBlob) {
        audioFormat = 'wav';
        audioBlob = await synthesizeOfflineAudioTrack(
          phoneticallyEnhanced,
          durationSec,
          character === 'child' ? 1.42 : character === 'male' ? 0.86 : 1.05,
          emotion === 'angry' ? 1.22 : emotion === 'sad' ? 0.74 : emotion === 'happy' ? 1.16 : 1.08,
          lang,
          character,
          emotion
        );
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      const characterLabels: Record<CharacterType, string> = {
        female: 'بانو (زن)',
        male: 'آقا (مرد)',
        child: 'کودک',
      };

      const record: AudioRecordItem = {
        id: `rec_${Date.now()}`,
        title: text.slice(0, 32).trim() + (text.length > 32 ? '...' : ''),
        textSnippet: text.slice(0, 80).trim() + (text.length > 80 ? '...' : ''),
        fullText: text,
        audioUrl,
        audioBlob,
        duration: durationSec,
        createdAt: new Date().toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        language: lang,
        character,
        emotion,
        voiceName: `${characterLabels[character]} • ${lang === 'fa' ? 'فارسی' : 'English'}`,
        format: audioFormat,
        fileSizeBytes: audioBlob.size,
      };

      setCurrentAudioRecord(record);
      setState('speaking');

      // Sync progress timer for waveform
      const startTime = Date.now();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      progressTimerRef.current = setInterval(() => {
        if (isCancelledRef.current) {
          clearInterval(progressTimerRef.current);
          return;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        const curProg = Math.min(100, Math.round((elapsed / durationSec) * 100));
        setProgress(curProg);
        const wordIdx = Math.min(
          words.length - 1,
          Math.floor((curProg / 100) * words.length)
        );
        setCurrentWordIndex(wordIdx);

        if (curProg >= 100) {
          clearInterval(progressTimerRef.current);
          setState('idle');
        }
      }, 100);

      return record;
    },
    [stop]
  );

  return {
    voices,
    state,
    progress,
    spokenWords,
    currentWordIndex,
    currentAudioRecord,
    setCurrentAudioRecord,
    convertTextToAudio,
    pause,
    resume,
    stop,
  };
}
