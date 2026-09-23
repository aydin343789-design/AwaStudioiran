import React, { useRef, useEffect } from 'react';

interface AudioWaveformProps {
  isPlaying: boolean;
  progress: number; // 0 to 100
  pitch?: number;
  speed?: number;
  height?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying,
  progress,
  pitch = 1.0,
  speed = 1.0,
  height = 72,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const barCount = 48;
    const barWidth = Math.max(3, (rect.width - barCount * 3) / barCount);
    const barSpacing = 3;

    const render = () => {
      ctx.clearRect(0, 0, rect.width, height);
      phaseRef.current += isPlaying ? 0.08 * speed : 0.01;

      // Base gradient for active and inactive bars
      const activeGradient = ctx.createLinearGradient(0, height, 0, 0);
      activeGradient.addColorStop(0, '#06b6d4'); // cyan
      activeGradient.addColorStop(0.5, '#6366f1'); // indigo
      activeGradient.addColorStop(1, '#ec4899'); // pink-purple

      const inactiveGradient = ctx.createLinearGradient(0, height, 0, 0);
      inactiveGradient.addColorStop(0, '#1e293b');
      inactiveGradient.addColorStop(1, '#334155');

      const activeBarThreshold = Math.floor((progress / 100) * barCount);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + barSpacing) + barSpacing;
        const normalizedIndex = i / barCount;
        
        // Bell curve envelope in middle
        const centerDistance = Math.abs(normalizedIndex - 0.5) * 2;
        const bellEnvelope = Math.cos(centerDistance * Math.PI * 0.45);

        let dynamicAmp = 0.25;
        if (isPlaying) {
          const wave1 = Math.sin(phaseRef.current + i * 0.3 * pitch);
          const wave2 = Math.cos(phaseRef.current * 0.7 + i * 0.15);
          dynamicAmp = 0.25 + 0.65 * Math.abs(wave1 * 0.6 + wave2 * 0.4);
        } else {
          dynamicAmp = 0.2 + 0.08 * Math.sin(phaseRef.current + i * 0.2);
        }

        const barHeight = Math.max(6, height * 0.85 * bellEnvelope * dynamicAmp);
        const y = (height - barHeight) / 2;

        const isPassed = i <= activeBarThreshold;
        ctx.fillStyle = isPassed ? activeGradient : inactiveGradient;

        // Draw rounded bar
        ctx.beginPath();
        const radius = Math.min(barWidth / 2, barHeight / 2);
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x, y, barWidth, barHeight, radius);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        // Glow indicator on current playback bar
        if (isPassed && i === activeBarThreshold && isPlaying) {
          ctx.shadowColor = '#6366f1';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, progress, pitch, speed, height]);

  return (
    <div className="w-full relative overflow-hidden rounded-2xl bg-slate-900/80 p-3 border border-slate-800/80 shadow-inner backdrop-blur-md">
      <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          {isPlaying ? 'در حال پردازش سیگنال صوتی' : 'آماده پخش و تولید صدا'}
        </span>
        <span className="font-mono text-indigo-400">{Math.round(progress)}%</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block rounded-lg"
      />
    </div>
  );
};
