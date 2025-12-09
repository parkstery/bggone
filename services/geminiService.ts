import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Sends an image to Gemini to remove its background.
 * @param base64Image The base64 encoded string of the original image (without data prefix if possible, but we handle it).
 * @returns The base64 string of the processed image.
 */
export const removeBackground = async (base64Image: string): Promise<string> => {
  const ai = getClient();
  
  // Clean base64 string if it contains the data URL prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg', // Assuming JPEG for input, but the model is flexible.
            },
          },
          {
            text: 'Remove the background from this image. Return the subject on a transparent background. Do not add any other objects or change the subject.',
          },
        ],
      },
      // Note: responseMimeType is not supported for nano banana series models, so we don't set it.
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
