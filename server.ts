import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Google GenAI initialization with required telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: Analyze product details and URL
app.post('/api/analyze-product', async (req, res) => {
  try {
    const { url, description, productName } = req.body;
    if (!description && !url && !productName) {
      return res.status(400).json({ error: 'Please provide a product description, name, or URL.' });
    }

    const prompt = `Analyze this product information for a high-converting digital advertising campaign:
Product Name: ${productName || 'Not specified'}
Product URL: ${url || 'Not specified'}
Product Description / Context: ${description || 'Not specified'}

Extract and structure the marketing intelligence:
1. Refined brand/product name
2. Core value proposition (one powerful benefit sentence)
3. Target audience segment
4. Optimal advertising tone (e.g. "Tech Minimalist", "Vibrant & Bold", "Luxury & Refined", "Fresh & Organic", "High Performance")
5. 3 punchy, high-converting headline options (max 6-8 words each)
6. 3 subheadline options (max 10-14 words each)
7. 4 call-to-action (CTA) button texts (e.g. "Shop Now - 20% Off", "Get Started Free", "Claim Early Access")
8. 3 promotional badge labels (e.g. "LIMITED EDITION", "★ 4.9 RATED", "FREE EXPRESS SHIPPING", "BESTSELLER")
9. Recommended primary accent color in Hex (e.g. #2563EB, #10B981, #F59E0B, #EC4899, #8B5CF6) and secondary color (Hex)
10. Studio photography visual prompt for the background/hero image to be fed into Gemini image generation models (gemini-3-pro-image-preview). It should describe clean commercial studio photography, dramatic lighting, sharp focus, aesthetic product staging, modern background with room for banner text overlays.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an elite creative advertising director specializing in high-CTR standard display banner ads for digital marketing.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            coreBenefit: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            recommendedTone: { type: Type.STRING },
            headlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            subheadlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            callToActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            badges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            colorPalette: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING },
                secondary: { type: Type.STRING },
                backgroundTone: { type: Type.STRING },
                textDark: { type: Type.BOOLEAN },
              },
              required: ['primary', 'secondary'],
            },
            imagePrompt: { type: Type.STRING },
          },
          required: [
            'brandName',
            'coreBenefit',
            'headlines',
            'subheadlines',
            'callToActions',
            'badges',
            'colorPalette',
            'imagePrompt',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing product:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze product context.',
      details: error.toString(),
    });
  }
});

// Endpoint: Generate high-quality image with gemini-3-pro-image-preview or gemini-nano-banana-2.1
app.post('/api/generate-image', async (req, res) => {
  try {
    const {
      prompt,
      model = 'gemini-3-pro-image-preview',
      aspectRatio = '1:1',
      imageSize = '1K',
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Validate supported models
    const validModel =
      model === 'gemini-nano-banana-2.1' ? 'gemini-nano-banana-2.1' : 'gemini-3-pro-image-preview';

    // Validate aspect ratio: "1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"
    const allowedRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
    const validAspectRatio = allowedRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    // Validate image size: "1K", "2K", "4K"
    const allowedSizes = ['1K', '2K', '4K'];
    const validImageSize = allowedSizes.includes(imageSize) ? imageSize : '1K';

    console.log(`Generating ad image using ${validModel} [${validAspectRatio}, ${validImageSize}]: "${prompt.slice(0, 60)}..."`);

    const response = await ai.models.generateContent({
      model: validModel,
      contents: {
        parts: [
          {
            text: `${prompt}. High commercial advertising photography, professional studio lighting, 8k sharp focus, clean background suitable for text overlay, premium product marketing shot.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: validAspectRatio as any,
          imageSize: validImageSize as any,
        },
      },
    });

    // Locate the image part in the response parts
    let imageUrl = '';
    let foundMime = 'image/png';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const base64Str = part.inlineData.data;
        foundMime = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${foundMime};base64,${base64Str}`;
        break;
      }
    }

    if (!imageUrl) {
      // Check if text was returned explaining why
      const textPart = response.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
      return res.status(500).json({
        error: 'No image data returned from Gemini.',
        details: textPart || 'The model completed without generating an image part.',
      });
    }

    return res.json({
      imageUrl,
      model: validModel,
      aspectRatio: validAspectRatio,
      imageSize: validImageSize,
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    const msg = error.message || 'Image generation failed';
    const status = error.status || 500;
    return res.status(status).json({
      error: msg,
      code: error.code || 'IMAGE_GEN_ERROR',
      details: error.toString(),
    });
  }
});

// Setup Vite middleware for local development, or serve static dist in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const portNumber = Number(process.env.PORT) || 3000;
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${portNumber}`);
  });
}

startServer();
