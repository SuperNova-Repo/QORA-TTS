# QORA-TTS Web Deployment Guide

## 📋 Übersicht

Diese Anleitung zeigt Ihnen, wie Sie QORA-TTS mit InfinityFree nutzen können.

**Wichtig:** QORA-TTS kann NICHT direkt auf InfinityFree laufen, da es ein CLI-Tool ist. Sie benötigen eine **Hybrid-Lösung**:

- **Frontend** → InfinityFree (kostenlos)
- **Backend** → Render.com, Fly.io, oder Railway (kostenlos)

---

## 🏗️ Architektur

```
┌────────────────┐
│   InfinityFree          │
│   (HTML/CSS/JS)         │
│   Statisches Frontend   │
└───────────┬─────┘
                   │ HTTP API
                  ▼
┌─────────────────┐
│   Backend-Service       │
│   (Render/Fly.io/etc.)  │
│   Node.js + QORA-TTS    │
└─────────── ───────┘
```

---

## 📦 Schritt 1: Backend auf Render.com deployen

### 1.1 Render.com Account erstellen

1. Gehen Sie zu [render.com](https://render.com)
2. Erstellen Sie einen kostenlosen Account
3. Klicken Sie auf "New +" → "Web Service"

### 1.2 Projekt vorbereiten

Erstellen Sie folgende Dateistruktur:

```
qora-tts-backend/
├── server.js          # Express Server
├── package.json       # Dependencies
├── render.yaml        # Render Konfiguration (optional)
└── qora-tts/          # QORA-TTS Binary + Modell
    ├── qora-tts       # Binary
    └── model.qora-tts # Modell-Datei
```

### 1.3 QORA-TTS herunterladen

```bash
# QORA-TTS von HuggingFace herunterladen
# https://huggingface.co/qoranet/QORA-TTS

# Extrahieren Sie die Dateien in den qora-tts/ Ordner
```

### 1.4 Auf Render deployen

**Option A: GitHub Repository**

1. Pushen Sie Ihr Projekt zu GitHub
2. Verbinden Sie Render mit GitHub
3. Wählen Sie das Repository aus
4. Konfigurieren Sie:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `QORA_TTS_PATH=/opt/render/project/src/qora-tts/qora-tts`
     - `MODEL_PATH=/opt/render/project/src/qora-tts/model.qora-tts`

**Option B: render.yaml**

```yaml
services:
  - type: web
    name: qora-tts-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: QORA_TTS_PATH
        value: /opt/render/project/src/qora-tts/qora-tts
      - key: MODEL_PATH
        value: /opt/render/project/src/qora-tts/model.qora-tts
```

### 1.5 Backend URL notieren

Nach dem Deployment erhalten Sie eine URL wie:
```
https://qora-tts-api.onrender.com
```

---

## 🌐 Schritt 2: Frontend auf InfinityFree deployen

### 2.1 InfinityFree Account erstellen

1. Gehen Sie zu [infinityfree.com](https://infinityfree.com)
2. Erstellen Sie einen kostenlosen Account
3. Erstellen Sie eine neue Hosting-Version

### 2.2 HTML-Datei anpassen

Öffnen Sie die `index.html` und ändern Sie die API-URL:

```javascript
// Zeile ~180 - Ändern Sie diese URL zu Ihrem Backend!
const API_URL = 'https://IHR-BACKEND.onrender.com/api/tts';
```

### 2.3 Dateien hochladen

1. Gehen Sie zum "File Manager" in InfinityFree
2. Laden Sie die `index.html` in den `htdocs` Ordner hoch
3. Ihre Website ist nun unter Ihrer InfinityFree-Domain erreichbar

---

## 🔧 Alternative Backend-Optionen

### Fly.io

```bash
# Fly.io CLI installieren
curl -L https://fly.io/install.sh | sh

# App erstellen
fly apps create qora-tts-api

# Deploy
fly deploy
```

### Railway.app

```bash
# Railway CLI installieren
npm install -g @railway/cli

# Login
railway login

# Deploy
railway init
railway up
```

---

## 📡 API Dokumentation

### POST /api/tts

Generiert Audio aus Text.

**Request:**
```json
{
  "text": "Hallo, wie geht es Ihnen?",
  "voice": "tongtong",
  "speed": 1.0
}
```

**Response:**
- Content-Type: `audio/wav`
- Body: WAV-Audiodatei

**Parameter:**
| Parameter | Typ | Standard | Beschreibung |
|-----------|-----|----------|--------------|
| text | string | required | Text zum Sprechen (max 1024 Zeichen) |
| voice | string | "tongtong" | Stimme (tongtong, chuichui, xiaochen, jam, kazi, douji, luodo) |
| speed | number | 1.0 | Geschwindigkeit (0.5 - 2.0) |

### GET /api/voices

Listet verfügbare Stimmen auf.

**Response:**
```json
{
  "voices": [
    { "id": "tongtong", "name": "Tongtong", "gender": "female" },
    ...
  ],
  "total": 7
}
```

### GET /health

Health Check Endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## ⚠️ Wichtige Hinweise

### InfinityFree Einschränkungen

| Feature | InfinityFree | Erforderlich für QORA-TTS |
|---------|--------------|---------------------------|
| Statische HTML | ✅ | ✅ |
| PHP | ✅ | ❌ |
| Node.js | ❌ | ✅ (Backend) |
| Eigene Binaries | ❌ | ✅ (Backend) |
| WebSocket | ❌ | Optional |

### Render.com Free Tier

- **750 Stunden/Monat** kostenlos
- Service schläft nach Inaktivität (30 Sek zum Aufwachen)
- Für Produktion: Upgrade auf Paid Plan

---

## 🎯 Zusammenfassung

1. **Backend deployen** auf Render.com/Fly.io/Railway
2. **API-URL** im Frontend anpassen
3. **Frontend** auf InfinityFree hochladen
4. **Fertig!** 🎉

---

## 🔗 Links

- [QORA-TTS auf HuggingFace](https://huggingface.co/qoranet/QORA-TTS)
- [QORA-TTS GitHub](https://github.com/second-state/qwen3_tts_rs)
- [Render.com](https://render.com)
- [Fly.io](https://fly.io)
- [InfinityFree](https://infinityfree.com)

---

## 📞 Support

Bei Problemen:
1. Prüfen Sie die Backend-Logs auf Render.com
2. Stellen Sie sicher, dass CORS korrekt konfiguriert ist
3. Testen Sie die API direkt mit curl oder Postman

```bash
# API testen
curl -X POST https://your-backend.onrender.com/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hallo Welt", "voice": "tongtong"}' \
  --output test.wav
```
