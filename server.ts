import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, contents, modelName, useSearch } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API Key not configured on server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const actualModelName = 'gemini-1.5-flash';

      let finalContents: any[] = [];
      if (contents) {
        finalContents = Array.isArray(contents) ? contents : [contents];
      } else if (prompt) {
        finalContents = [{ role: 'user', parts: [{ text: prompt }] }];
      }

      const result = await ai.models.generateContent({
        model: actualModelName,
        contents: finalContents,
        config: {
          systemInstruction: prompt && contents ? prompt : undefined,
          tools: useSearch ? [{ googleSearch: {} }] : undefined,
        }
      });

      const text = result.text || '';
      
      let image = null;
      // Extract image if present
      if (result.candidates?.[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData) {
            image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      res.json({ text, image });
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ 
        error: error.message || "Internal Server Error",
        details: error.stack
      });
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
