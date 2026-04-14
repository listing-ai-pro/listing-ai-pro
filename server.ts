import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Gemini API Proxy
  app.post("/api/gemini", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API Error: GEMINI_API_KEY is not set');
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    try {
      const { prompt, modelName, useSearch } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      
      // Map old model names to new ones
      let actualModelName = 'gemini-3-flash-preview';
      if (modelName === 'gemini-1.5-pro-latest' || modelName === 'gemini-3.1-pro-preview') {
        actualModelName = 'gemini-3.1-pro-preview';
      }

      const response = await ai.models.generateContent({
        model: actualModelName,
        contents: prompt,
        config: {
          tools: useSearch ? [{ googleSearch: {} }] : undefined
        }
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      
      // Check for invalid API key error
      if (error.message && error.message.includes('API key not valid')) {
        return res.status(401).json({ error: 'Invalid Gemini API Key. Please check your Secrets configuration.' });
      }
      
      res.status(500).json({ error: 'Failed to generate content. Please check your API key.' });
    }
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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
