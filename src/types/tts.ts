export type TTSState = 'idle' | 'loading' | 'speaking' | 'paused';

export type SupportedLanguage = 'fa' | 'en';

export type CharacterType = 'female' | 'male' | 'child';

export type EmotionType = 'happy' | 'sad' | 'angry' | 'commercial';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  displayName: string;
  gender: 'female' | 'male' | 'neutral';
  isLocal: boolean;
  isPersian: boolean;
  isNatural: boolean;
  flag: string;
}

export interface PresetMood {
  id: string;
  title: string;
  persianTitle: string;
  description: string;
  speed: number;
  pitch: number;
  iconName: string;
  category?: string;
}

export interface AudioRecordItem {
  id: string;
  title: string;
  textSnippet: string;
  fullText: string;
  audioUrl: string;
  audioBlob?: Blob;
  duration: number; // in seconds
  createdAt: string;
  language: SupportedLanguage;
  character: CharacterType;
  emotion: EmotionType;
  voiceName: string;
  format: 'wav';
  fileSizeBytes: number;
}
