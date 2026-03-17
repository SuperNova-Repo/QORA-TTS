// Express.js Backend für QORA-TTS auf Render.com
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import { unlink } from 'fs/promises';
import cors from 'cors';

const execAsync = promisify(exec);
const app = express();

// CORS konfigurieren - für InfinityFree erlauben
app.use(cors({
  origin: '*', // In Produktion: nur Ihre InfinityFree-Domain erlauben
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '10mb' }));

// QORA-TTS Pfade (anpassen!)
const QORA_TTS_PATH = process.env.QORA_TTS_PATH || '/opt/qora-tts/qora-tts';
const MODEL_PATH = process.env.MODEL_PATH || '/opt/qora-tts/model.qora-tts';

// Verfügbare Stimmen
const AVAILABLE_VOICES = [
  { id: 'tongtong', name: 'Tongtong', description: 'Warm und freundlich', gender: 'female' },
  { id: 'chuichui', name: 'Chuichui', description: 'Lebhaft und charmant', gender: 'female' },
  { id: 'xiaochen', name: 'Xiaochen', description: 'Ruhig und professionell', gender: 'male' },
  { id: 'jam', name: 'Jam', description: 'Britischer Gentleman', gender: 'male' },
  { id: 'kazi', name: 'Kazi', description: 'Klar und standardisiert', gender: 'neutral' },
  { id: 'douji', name: 'Douji', description: 'Natürlich und flüssig', gender: 'neutral' },
  { id: 'luodo', name: 'Luodo', description: 'Ausdrucksstark', gender: 'neutral' },
];

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Voices API
app.get('/api/voices', (req, res) => {
  res.json({
    voices: AVAILABLE_VOICES,
    total: AVAILABLE_VOICES.length
  });
});

// TTS API
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = req.body;

    // Validierung
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text ist erforderlich' });
    }

    if (text.length > 1024) {
      return res.status(400).json({ error: 'Text ist zu lang (maximal 1024 Zeichen)' });
    }

    const voiceExists = AVAILABLE_VOICES.some(v => v.id === voice);
    if (!voiceExists) {
      return res.status(400).json({ error: `Unbekannte Stimme: ${voice}` });
    }

    // Speed validieren
    const validSpeed = Math.max(0.5, Math.min(2.0, parseFloat(speed) || 1.0));

    // Temporäre Ausgabedatei
    const outputFile = `/tmp/tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.wav`;

    // QORA-TTS CLI Befehl
    // Hinweis: Passen Sie den Befehl an Ihre QORA-TTS Installation an!
    const command = `${QORA_TTS_PATH} --load ${MODEL_PATH} --speaker ${voice} --text "${text.replace(/"/g, '\\"')}" --output ${outputFile}`;

    console.log(`[TTS] Generating audio for: ${text.substring(0, 50)}...`);

    // Befehl ausführen
    await execAsync(command, { timeout: 60000 });

    // Audiodatei senden
    res.sendFile(outputFile, async (err) => {
      // Cleanup
      try {
        await unlink(outputFile);
      } catch (e) {
        console.error('Cleanup error:', e);
      }

      if (err) {
        console.error('Send file error:', err);
      }
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({
      error: 'Fehler bei der Audio-Generierung',
      details: error.message
    });
  }
});

// Statische Dateien (optional - für lokales Frontend)
app.use(express.static('public'));

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 QORA-TTS Server läuft auf Port ${PORT}`);
  console.log(`📡 API Endpunkte:`);
  console.log(`   POST /api/tts - Audio generieren`);
  console.log(`   GET  /api/voices - Stimmen auflisten`);
  console.log(`   GET  /health - Health Check`);
});
