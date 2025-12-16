import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  // 1. process.env.API_KEY (vite.config.ts의 define 설정)
  // 2. import.meta.env.VITE_API_KEY (Vite 표준 방식)
  // 3. import.meta.env.API_KEY (일부 환경 호환)
  const apiKey = process.env.API_KEY || import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

  if (!apiKey) {
    console.error("API Key config check failed. Environment variables:", {
      processEnv: !!process.env.API_KEY,
      viteEnv: !!import.meta.env.VITE_API_KEY
    });
    throw new Error("API Key is missing. Please set 'API_KEY' in your .env file and restart the server.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends an image to Gemini to remove its background.
 * @param base64Image The base64 encoded string of the original image.
 * @returns The base64 string of the processed image.
 */
export const removeBackground = async (base64Image: string): Promise<string> => {
  const ai = getClient();
  
  // Extract real mime type from base64 header (e.g., data:image/png;base64,...)
  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  // Clean base64 string (remove data URL prefix)
  const cleanBase64 = base64Image.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType, 
            },
          },
          {
            text: 'Remove the background from this image. Return the subject on a transparent background. Do not add any other objects or change the subject.',
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content returned from Gemini.");
    }

    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return part.inlineData.data;
      }
    }
    
    // If no image part found, check for text indicating refusal or error
    const textPart = parts.find(p => p.text);
    if (textPart) {
        throw new Error(`Gemini returned text instead of an image: ${textPart.text}`);
    }

    throw new Error("Gemini did not return a valid image.");
    
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to process image with Gemini.");
  }
};