import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { AudioRecordItem } from '../types/tts';

interface AudioPlayerProps {
  record: AudioRecordItem;
  onDownload: () => void;
  onShare: () => void;
  downloadSuccess: string | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  record,
  onDownload,
  onShare,
  downloadSuccess,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(record.duration || 0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);

  // Auto-play when a new record is generated
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = record.audioUrl;
    audio.playbackRate = 1.0;
    setPlaybackRate(1.0);
    audio.load();
    setCurrentTime(0);
    setIsPlaying(false);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log('Autoplay prevented or waiting for interaction:', err);
          setIsPlaying(false);
        });
    }
  }, [record.id, record.audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const targetTime = parseFloat(e.target.value);
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const val = parseFloat(e.target.value);
    audio.volume = val;
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const rates = [1.0, 1.25, 1.5, 0.8];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-3.5 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-indigo-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-indigo-950/50 animate-in fade-in zoom-in-95">
      {/* Hidden native audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
      />

      {/* Header with status badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-white">
            پلیر اختصاصی فایل صوتی تولید شده
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Emotion Badge */}
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            record.emotion === 'happy'
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              : record.emotion === 'sad'
              ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
              : record.emotion === 'angry'
              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
          }`}>
            {record.emotion === 'happy' && '😄 لحن شاد'}
            {record.emotion === 'sad' && '😢 لحن غمگین'}
            {record.emotion === 'angry' && '😡 لحن خشمگین'}
            {record.emotion === 'commercial' && '📢 لحن تبلیغاتی'}
          </span>
          {/* Voice and Format Badge */}
          <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
            {record.voiceName} • {record.audioBlob?.type.includes('wav') ? 'WAV' : 'MP3'}
          </span>
        </div>
      </div>

      {/* Text preview snippet */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-['Vazirmatn']" dir="auto">
        "{record.textSnippet}"
      </div>

      {/* Waveform / Timeline Scrubber */}
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 10}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 z-10"
          />
          {/* Active progress fill */}
          <div
            className="absolute left-0 top-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-0.5">
          <span className="text-indigo-300 font-bold">{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Play / Pause / Replay Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition"
            title={isPlaying ? 'توقف پخش' : 'پخش صوت'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleReplay}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition"
            title="پخش از ابتدا"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Button */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-mono text-xs font-bold active:scale-95 transition"
            title="تغییر سرعت پخش"
          >
            {playbackRate}x
          </button>
        </div>

        {/* Volume Controls */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <button
            type="button"
            onClick={toggleMute}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 bg-slate-800 rounded-lg cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Download & Share Confirmation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 active:scale-95 transition"
          >
            <Download className="w-4 h-4" />
            <span>تایید و دانلود فایل صوتی</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 transition"
            title="اشتراک‌گذاری مستقیم"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Download Success Notice */}
      {downloadSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl px-3 py-2 flex items-center justify-between animate-in fade-in">
          <span>{downloadSuccess}</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
      )}
    </div>
  );
};
