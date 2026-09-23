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

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // TTS API endpoint - generates human Persian & English speech
  app.post('/api/tts', async (req, res) => {
    try {
      const { text, character = 'female', emotion = 'happy', lang = 'fa' } = req.body;

      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Voice selection
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

      // Pitch and rate calculation based on persona & emotion
      let rateStr = '+0%';
      let pitchStr = '+0Hz';

      if (character === 'child' && lang === 'fa') {
        pitchStr = '+35Hz';
        rateStr = '+5%';
      }

      if (emotion === 'happy') {
        rateStr = rateStr === '+0%' ? '+6%' : rateStr;
        pitchStr = pitchStr === '+0Hz' ? '+8Hz' : pitchStr;
      } else if (emotion === 'sad') {
        rateStr = '-14%';
        pitchStr = '-8Hz';
      } else if (emotion === 'angry') {
        rateStr = '+15%';
        pitchStr = '+12Hz';
      } else if (emotion === 'commercial') {
        rateStr = '+5%';
        pitchStr = '+4Hz';
      }

      // Prepare enhanced text using Persian phonetic & mispronunciation dictionary
      const { customMap } = req.body;
      const enhancedText = lang === 'fa' 
        ? autoEnhancePersianPhonetics(text.trim(), customMap) 
        : text.trim();

      const tts = new MsEdgeTTS();
      await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = await tts.toStream(enhancedText, {
        pitch: pitchStr,
        rate: rateStr,
      });

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      audioStream.pipe(res);
    } catch (err: any) {
      console.error('TTS generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'TTS generation failed' });
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
