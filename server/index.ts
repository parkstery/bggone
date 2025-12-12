import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Allow CORS from localhost dev client. Adjust in production.
app.use(cors());
app.use(bodyParser.json({ limit: "30mb" }));

// Load API key from environment. DO NOT put this key in client.
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.error("Missing GEMINI_API_KEY environment variable. Set GEMINI_API_KEY for the server.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

/**
 * POST /api/remove-bg
 * Body: { image: string }  // data URL or base64 string
 * Response: { result: string } // base64 (no data: prefix)
 */
app.post("/api/remove-bg", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'image' in request body." });
    }

    // Remove data URL prefix if present
    const cleanBase64 = image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    // Call Gemini via @google/genai
    // NOTE: The exact request shape may need adjustments depending on @google/genai version.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/png", // Adjust if your input is JPEG; PNG preserves transparency
            },
          },
          {
            text: "Remove the background from this image. Return the subject on a transparent background. Do not add any other objects or change the subject.",
          },
        ],
      },
      // If your SDK supports specifying response mimeType, you can attempt to request PNG.
    });

    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts || !Array.isArray(parts)) {
      console.error("Unexpected Gemini response shape:", response);
      return res.status(500).json({ error: "No content returned from Gemini." });
    }

    // Look for a binary part with inlineData.data
    for (const part of parts) {
      if (part?.inlineData?.data) {
        // Return raw base64 string (no data: prefix). Client expects this.
        return res.json({ result: part.inlineData.data });
      }
    }

    // If we find text instead, surface it as an error for debugging
    const textPart = parts.find((p: any) => p.text);
    if (textPart) {
      console.error("Gemini returned text instead of image:", textPart.text);
      return res.status(500).json({ error: `Gemini returned text: ${String(textPart.text)}` });
    }

    return res.status(500).json({ error: "Gemini did not return a valid image." });
  } catch (err: any) {
    console.error("Error in /api/remove-bg:", err);
    return res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

const PORT = Number(process.env.PORT || 3001);
app.listen(PORT, () => {
  console.log(`BgGone server proxy listening on http://localhost:${PORT}`);
});
