import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import axios from 'axios';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hashData = (data: string) => {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
};

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post('/api/fb-conversion', async (req, res) => {
    const { eventName, eventData, userData } = req.body;
    
    const payload = {
      data: [{
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        user_data: {
          em: userData.email ? hashData(userData.email) : undefined,
          ph: userData.phone ? hashData(userData.phone) : undefined,
          client_ip_address: req.ip,
          client_user_agent: req.headers['user-agent']
        },
        custom_data: eventData,
        action_source: 'website'
      }],
      test_event_code: process.env.FB_TEST_EVENT_CODE
    };

    try {
      await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.VITE_FB_PIXEL_ID}/events?access_token=${process.env.FB_ACCESS_TOKEN}`,
        payload
      );
      res.json({ status: 'success' });
    } catch (error: any) {
      console.error('FB API Error:', error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to send event' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
