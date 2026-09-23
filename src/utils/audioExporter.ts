/**
 * Audio rendering, WAV file encoder, export, and Web Share utility
 * Uses phonetic formant synthesis, Rosenberg glottal pulse acoustics,
 * consonant articulation, and DC-offset removal for clean speech audio playback.
 */

import { CharacterType, EmotionType } from '../types/tts';

// Encodes an AudioBuffer into standard 16-bit PCM WAV (44100Hz)
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;

  let interleaved: Float32Array;
  if (numChannels === 2) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    interleaved = new Float32Array(left.length + right.length);
    let inputIdx = 0;
    let outputIdx = 0;
    while (inputIdx < left.length) {
      interleaved[outputIdx++] = left[inputIdx];
      interleaved[outputIdx++] = right[inputIdx];
      inputIdx++;
    }
  } else {
    interleaved = buffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = interleaved.length * bytesPerSample;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM samples with soft limiting
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    let s = interleaved[i];
    s = Math.max(-0.98, Math.min(0.98, s));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, Math.round(val), true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Phonetic vowel formants (F1, F2 in Hz)
interface VowelFormants {
  f1: number;
  f2: number;
  f3: number;
}

const PHONETIC_VOWELS: Record<string, VowelFormants> = {
  a: { f1: 780, f2: 1300, f3: 2500 }, // /a/ فتحه
  e: { f1: 520, f2: 1900, f3: 2600 }, // /e/ کسره
  o: { f1: 460, f2: 950, f3: 2400 },  // /o/ ضمه
  aa: { f1: 720, f2: 1100, f3: 2450 }, // /â/ آ
  i: { f1: 300, f2: 2300, f3: 2900 },  // /i/ ای
  u: { f1: 330, f2: 850, f3: 2350 },   // /u/ او
};

/**
 * Generates speech audio based on character persona and tone emotion
 */
export async function synthesizeOfflineAudioTrack(
  text: string,
  durationSec: number,
  pitchMultiplier: number = 1.0,
  speed: number = 1.0,
  lang: 'fa' | 'en' = 'fa',
  character: CharacterType = 'female',
  emotion: EmotionType = 'happy'
): Promise<Blob> {
  const sampleRate = 44100;
  const safeDuration = Math.max(1.5, Math.min(durationSec, 300));
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate,
  });

  const numSamples = Math.floor(sampleRate * safeDuration);
  const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Fundamental frequency F0
  let baseF0 = 165;
  if (character === 'female') baseF0 = 210;
  if (character === 'male') baseF0 = 125;
  if (character === 'child') baseF0 = 290;

  const f0 = baseF0 * pitchMultiplier;

  // Words and syllables breakdown
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = Math.max(1, words.length);
  const secondsPerWord = safeDuration / wordCount;

  // Emotion settings
  let vibratoDepth = 0.02;
  let vibratoRate = 5.2;
  if (emotion === 'happy') {
    vibratoDepth = 0.028;
    vibratoRate = 5.8;
  } else if (emotion === 'sad') {
    vibratoDepth = 0.014;
    vibratoRate = 4.4;
  } else if (emotion === 'angry') {
    vibratoDepth = 0.038;
    vibratoRate = 6.2;
  } else if (emotion === 'commercial') {
    vibratoDepth = 0.018;
    vibratoRate = 5.0;
  }

  // Vowel sequence for modulation
  const vowelKeys = ['a', 'e', 'aa', 'i', 'o', 'u'];

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const currentWordIndex = Math.min(wordCount - 1, Math.floor(t / secondsPerWord));
    const wordProgress = (t % secondsPerWord) / secondsPerWord;

    // Pick vowel for the current syllable
    const wordStr = words[currentWordIndex] || '';
    const charCodeSum = wordStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const vowelIdx = Math.floor((wordProgress * 3 + charCodeSum) % vowelKeys.length);
    const currentVowel = PHONETIC_VOWELS[vowelKeys[vowelIdx]];

    // Formants scaled by character vocal tract size
    const tractScale = character === 'child' ? 1.25 : character === 'female' ? 1.1 : 0.92;
    const f1 = currentVowel.f1 * tractScale;
    const f2 = currentVowel.f2 * tractScale;
    const f3 = currentVowel.f3 * tractScale;

    // Word envelope (attack, sustain, decay, breath)
    let envelope = 0;
    if (wordProgress < 0.12) {
      envelope = Math.sin((wordProgress / 0.12) * (Math.PI / 2));
    } else if (wordProgress < 0.8) {
      envelope = 1.0 - (wordProgress - 0.12) * 0.12;
    } else if (wordProgress < 0.94) {
      envelope = Math.cos(((wordProgress - 0.8) / 0.14) * (Math.PI / 2));
    } else {
      // Breath pause between words
      envelope = 0.005;
    }

    // Sentence pitch contour (slightly declination toward period/comma)
    const sentenceProgress = (t % 3.5) / 3.5;
    const declination = 1.0 - sentenceProgress * 0.08;

    // Vocal vibrato
    const vibrato = 1.0 + vibratoDepth * Math.sin(2 * Math.PI * vibratoRate * t);
    const currentF0 = f0 * vibrato * declination;

    // Rosenberg glottal pulse (AC-coupled, zero-centered to avoid DC pop)
    const phase = (t * currentF0) % 1.0;
    let glottal = 0;
    if (phase < 0.6) {
      const p = phase / 0.6;
      glottal = 3 * p * p - 2 * p * p * p;
    } else if (phase < 0.85) {
      const p = (phase - 0.6) / 0.25;
      glottal = 1.0 - p;
    } else {
      glottal = 0;
    }
    // Zero-center the pulse
    const glottalCentered = (glottal - 0.32) * 1.8;

    // Resonance harmonics with vowel formants
    const formantsHarmonic =
      0.35 * Math.sin(2 * Math.PI * f1 * t) +
      0.22 * Math.sin(2 * Math.PI * f2 * t) +
      0.12 * Math.sin(2 * Math.PI * f3 * t);

    // Consonant fricative burst at word start (e.g. s, t, d, b, p)
    let consonantNoise = 0;
    if (wordProgress > 0.02 && wordProgress < 0.1) {
      consonantNoise = (Math.random() * 2 - 1) * 0.14;
    }

    // Combine voice sound
    const voiceSignal =
      (0.5 * glottalCentered + 0.5 * formantsHarmonic + consonantNoise) * envelope;

    channelData[i] = voiceSignal * 0.75;
  }

  const wavBlob = audioBufferToWav(audioBuffer);
  audioContext.close();
  return wavBlob;
}

export function triggerFileDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

export async function quickShareAudio(
  blob: Blob,
  fileName: string,
  title: string,
  text: string
): Promise<{ success: boolean; method: 'web_share' | 'download' }> {
  const file = new File([blob], fileName, { type: blob.type });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return { success: true, method: 'web_share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'web_share' };
      }
    }
  }

  triggerFileDownload(blob, fileName);
  return { success: true, method: 'download' };
}
