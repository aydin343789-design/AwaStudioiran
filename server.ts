import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { autoEnhancePersianPhonetics } from './src/utils/persianDiacritics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function computeEmotionalProsody(
  character: string,
  emotion: string,
  lang: string
): { voiceName: string; pitch: string; rate: string; volume: string } {
  let voiceName = 'fa-IR-DilaraNeural';
  if (lang === 'fa') {
    if (character === 'male') {
      voiceName = 'fa-IR-FaridNeural';
    } else {
      voiceName = 'fa-IR-DilaraNeural';
    }
  } else {
    if (character === 'male') {
      voiceName = 'en-US-GuyNeural';
    } else if (character === 'child') {
      voiceName = 'en-US-AnaNeural';
    } else {
      voiceName = 'en-US-JennyNeural';
    }
  }

  // Base character offsets
  let pitchOffset = 0;
  let rateOffset = 0;
  let volumeOffset = 0;

  if (character === 'child') {
    if (lang === 'fa') {
      pitchOffset = 46; // Transmute into an authentic sweet child voice
      rateOffset = 12;
      volumeOffset = 8;
    }
  } else if (character === 'male') {
    pitchOffset = -7; // Richer baritone resonance
    volumeOffset = 6;
  }

  // Emotional modulation deltas (distinct, palpable, expressive)
  let pitchDelta = 0;
  let rateDelta = 0;
  let volumeDelta = 0;

  switch (emotion) {
    case 'happy':
      pitchDelta = +26;
      rateDelta = +22;
      volumeDelta = +20;
      break;
    case 'sad':
      pitchDelta = -26;
      rateDelta = -34;
      volumeDelta = -28;
      break;
    case 'angry':
      pitchDelta = +22;
      rateDelta = +26;
      volumeDelta = +40;
      break;
    case 'commercial':
      pitchDelta = +8;
      rateDelta = +12;
      volumeDelta = +25;
      break;
    default:
      break;
  }

  const finalPitch = pitchOffset + pitchDelta;
  const finalRate = rateOffset + rateDelta;
  const finalVolume = volumeOffset + volumeDelta;

  const pitchStr = (finalPitch >= 0 ? `+${finalPitch}` : `${finalPitch}`) + '%';
  const rateStr = (finalRate >= 0 ? `+${finalRate}` : `${finalRate}`) + '%';
  const volumeStr = (finalVolume >= 0 ? `+${finalVolume}` : `${finalVolume}`) + '%';

  return { voiceName, pitch: pitchStr, rate: rateStr, volume: volumeStr };
}

function formatEmotionalText(text: string, emotion: string): string {
  let formatted = text.trim();
  if (emotion === 'sad') {
    // Replace harsh exclamation marks with quiet sorrowful pauses
    formatted = formatted.replace(/!+/g, '...');
    // Introduce delicate breathing pauses after clauses
    formatted = formatted.replace(/،\s*/g, '، ... ');
    formatted = formatted.replace(/,\s*/g, ', ... ');
    if (!/[.!?؟…]$/.test(formatted)) {
      formatted += '...';
    }
  } else if (emotion === 'angry') {
    // Convert gentle ellipses to punchy exclamation marks
    formatted = formatted.replace(/\.{2,}/g, '!');
    formatted = formatted.replace(/…/g, '!');
    if (!/[!؟?]$/.test(formatted)) {
      formatted += '!';
    }
  } else if (emotion === 'happy') {
    // Upbeat and energetic cadence
    if (formatted.endsWith('.')) {
      formatted = formatted.slice(0, -1) + '!';
    }
  } else if (emotion === 'commercial') {
    formatted = formatted.replace(/\.{2,}/g, '.');
  }
  return formatted;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Top-level process protection against unhandled crashes
  process.on('uncaughtException', (err) => {
    console.error('[SERVER PROTECTION] Uncaught exception prevented:', err);
  });
  process.on('unhandledRejection', (reason) => {
    console.error('[SERVER PROTECTION] Unhandled rejection prevented:', reason);
  });

  // TTS API endpoint - generates human Persian & English speech with distinct emotional tones
  app.post('/api/tts', async (req, res) => {
    let audioStreamRef: any = null;

    // Handle client disconnect gracefully
    req.on('close', () => {
      if (audioStreamRef && typeof audioStreamRef.destroy === 'function') {
        try {
          audioStreamRef.destroy();
        } catch (_) {}
      }
    });

    try {
      const { text, character = 'female', emotion = 'happy', lang = 'fa', customMap } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const { voiceName, pitch, rate, volume } = computeEmotionalProsody(character, emotion, lang);

      // Emotionally shaped punctuation & pacing
      const emotionTunedText = formatEmotionalText(text, emotion);

      // Prepare enhanced text using Persian phonetic & mispronunciation dictionary
      const enhancedText = lang === 'fa' 
        ? autoEnhancePersianPhonetics(emotionTunedText, customMap) 
        : emotionTunedText;

      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = await tts.toStream(enhancedText, {
        pitch,
        rate,
        volume,
      });

      audioStreamRef = audioStream;

      // Safely buffer audio chunks with explicit error handling and timeout
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          try {
            audioStream.destroy();
          } catch (_) {}
          reject(new Error('TTS generation timed out'));
        }, 30000);

        audioStream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        audioStream.once('end', () => {
          clearTimeout(timeout);
          resolve();
        });

        audioStream.once('error', (streamErr: any) => {
          clearTimeout(timeout);
          reject(streamErr);
        });
      });

      if (chunks.length === 0) {
        throw new Error('No audio data received from synthesis engine');
      }

      const audioBuffer = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.end(audioBuffer);
    } catch (err: any) {
      console.error('TTS generation error caught safely:', err?.message || err);
      if (!res.headersSent) {
        res.status(500).json({ error: err?.message || 'TTS generation failed' });
      }
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
