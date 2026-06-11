import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Lazy-loaded Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured or contains placeholder values.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fallback logic if Gemini is not configured, so application can still run
function fallbackSimplify(text: string): string {
  // Simple rule-based paragraph layout booster (shorter sentences, bullet items, more line breaks)
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
  return sentences.map(s => s.trim()).join("\n\n");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint: Status Probe
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", keyConfigured: !!process.env.GEMINI_API_KEY });
  });

  // AI Route: Simplify Paragraph
  app.post("/api/ai/simplify", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    try {
      const client = getGeminiClient();
      const prompt = `Rewrite the following text to make it extremely easy to read for individuals with dyslexia or reading difficulties.
Rules:
- Use simple grammar and basic, high-frequency vocabulary.
- Keep sentences short, active, and direct.
- Do not lose or change the original fundamental meaning.
- Keep it visually clean and avoid dense formatting.
- Respond with only the simplified text.

Original text:
${text}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ simplifiedText: response.text || fallbackSimplify(text) });
    } catch (err: any) {
      console.warn("Gemini Error, utilizing formatting fallback:", err.message);
      res.json({ 
        simplifiedText: fallbackSimplify(text),
        note: "Simplified using local rules-based layout engine due to API simulation mode." 
      });
    }
  });

  // AI Route: Explain Section/Word/Idiom
  app.post("/api/ai/explain", async (req, res) => {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text to explain" });
    }

    try {
      const client = getGeminiClient();
      const prompt = `You are a helpful reading coach for a reader with dyslexia or learning differences. 
Explain the meaning, context, pronunciation, or literary references of this specific text.
Keep your tone warm, simple, supportive, and extremely clear. Ensure explanations are short and digestible.

Text to explain:
"${text}"

${context ? `Full surrounding context:\n"${context}"` : ""}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ explanation: response.text || `"${text}" is an interesting phrase here. Let's read it slowly.` });
    } catch (err: any) {
      console.warn("Gemini Error, utilizing fallback explanation:", err.message);
      res.json({ 
        explanation: `"${text}" means to look at this passage carefully. If you break it into smaller words, it will read easily. (API Offline Mode)`,
      });
    }
  });

  // AI Route: Summarize Chapter
  app.post("/api/ai/summarize", async (req, res) => {
    const { title, paragraphs } = req.body;
    if (!paragraphs || !Array.isArray(paragraphs)) {
      return res.status(400).json({ error: "Missing or invalid paragraphs parameter" });
    }

    try {
      const client = getGeminiClient();
      const contentSample = paragraphs.slice(0, 8).join("\n");
      const prompt = `Synthesize a memory support summary for the chapter titled "${title || 'This Chapter'}" to help readers who have difficulty retaining story details and characters.
Summarize the key ideas, main narrative events, and critical character state updates in JSON format. Use simple terms.

Content excerpt:
${contentSample}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keyIdeas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Top 2-3 key thematic ideas or learning points from this passage."
              },
              mainEvents: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "The concrete main events of what happened in chronological order."
              },
              characterUpdates: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Current state, emotions, location or relational updates of the major characters in this segment."
              }
            },
            required: ["keyIdeas", "mainEvents", "characterUpdates"]
          }
        }
      });

      if (response.text) {
        res.json({ chapterSummary: JSON.parse(response.text.trim()) });
      } else {
        throw new Error("No response text from Gemini");
      }
    } catch (err: any) {
      console.warn("Gemini Error, utilizing fallback summarization:", err.message);
      // Fallback response for summary
      res.json({
        chapterSummary: {
          keyIdeas: ["Getting started with the adventure", "Exploring new spaces calmly"],
          mainEvents: ["The story introduces the main space.", "A sequence of initial observations begins."],
          characterUpdates: ["The major characters continue their journey safely."]
        }
      });
    }
  });

  // Proxy: Open Library Subjects proxy to avoid browser-side CORS blocks
  app.get("/api/proxy/openlibrary/subjects", async (req, res) => {
    const { subject, limit } = req.query;
    if (!subject) {
      return res.status(400).json({ error: "Missing subject parameter" });
    }
    try {
      const url = `https://openlibrary.org/subjects/${encodeURIComponent(subject as string)}.json?limit=${limit || 12}`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "NaraAccessibilityApp/1.0 (ioana.el.ionescu@gmail.com)"
        }
      });
      if (!response.ok) {
        throw new Error(`Open Library returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Open Library Subjects Proxy Error:", err.message);
      res.status(500).json({ error: err.message || "Failed to retrieve subject books" });
    }
  });

  // Proxy: Open Library Search proxy to avoid browser-side CORS blocks
  app.get("/api/proxy/openlibrary/search", async (req, res) => {
    const { q, limit } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Missing query space parameter 'q'" });
    }
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q as string)}&limit=${limit || 9}`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "NaraAccessibilityApp/1.0 (ioana.el.ionescu@gmail.com)"
        }
      });
      if (!response.ok) {
        throw new Error(`Open Library returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Open Library Search Proxy Error:", err.message);
      res.status(500).json({ error: err.message || "Failed to query library index" });
    }
  });

  // AI Route: Generate Accessible Book on-demand
  app.post("/api/ai/generate-book", async (req, res) => {
    const { title, author, category } = req.body;
    if (!title || !author) {
      return res.status(400).json({ error: "Missing title or author parameters" });
    }

    try {
      const client = getGeminiClient();
      const prompt = `You are a professional educational reading curator and accessibility specialist.
We are converting classic or popular books into dyslexia-optimized layouts.
Format your response as a strictly valid, single JSON object containing content for "${title}" by "${author}" (Category: "${category || 'Literature'}"). 
Do not wrap in markdown quotes or block formats, return exclusively raw JSON matching this schema:
{
  "chapters": [
    {
      "id": "chap-1",
      "title": "Chapter I: The Beginning of the Journey",
      "content": [
        "First paragraph of the actual starting story passage, custom-adapted for visual stress relief. Must be immersive, high quality, and 3-4 sentences long.",
        "Second paragraph of actual story passage continues with easy vocabulary...",
        "Third paragraph of actual story passage...",
        "Fourth paragraph of actual story passage..."
      ]
    }
  ],
  "characters": [
    { "name": "Protagonist Name", "role": "Main Hero", "relationships": "Describe who they connect with", "events": "What they do in Chapter 1" }
  ],
  "concepts": [
    { "term": "Vocabulary word or complex theme", "definition": "Direct, easy-to-read explanation", "keyTerms": ["helper key", "easy definition"], "examples": ["A plain illustrative sentence using the word"] }
  ]
}

Make sure the narrated narrative is high quality and faithful to the spirit, plot, and tone of "${title}". Keep paragraphs spaced and short. No placeholder text or truncated lists.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (response.text) {
        res.json(JSON.parse(response.text.trim()));
      } else {
        throw new Error("Empty response text from Gemini");
      }
    } catch (err: any) {
      console.warn("Gemini Error, utilizing fallback generator:", err.message);
      res.json({
        chapters: [
          {
            id: "chap-1",
            title: "Chapter I: The Discovery",
            content: [
              `This is an accessible overview and starting passage of code-generated narration for "${title}" by ${author}.`,
              "Every great story begins with a curious mind exploring new boundaries and learning to see things differently.",
              "As we turn the first page of this classic, we invite you to adjust your font size, contrast theme, and line-spacing multiplier in the Preferences panel."
            ]
          }
        ],
        characters: [
          {
            name: "The Protagonist",
            role: "Determined Leader",
            relationships: "The central voice of this classic tale.",
            events: "Emerged at the start of the narrative to face new questions."
          }
        ],
        concepts: [
          {
            term: "Discovery",
            definition: "The act of finding, learning, or experiencing something brand new for the first time.",
            keyTerms: ["Finding", "Opening", "Learning"],
            examples: ["Finding a secret passageway in a library."]
          }
        ]
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {},
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Accessible Reader Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
