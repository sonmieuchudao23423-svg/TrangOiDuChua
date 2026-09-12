import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

export class AIController {
  /**
   * POST /api/ai/generate
   * Generates a square image based on prompt using Gemini AI for prompt engineering and rendering
   */
  static async generateImage(req: Request, res: Response) {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập mô tả ý tưởng hình ảnh',
        });
      }

      const rawPrompt = prompt.trim();
      let optimizedPrompt = rawPrompt;

      // 1. Use Google Gemini to understand & enrich the prompt in depth
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey.trim()) {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
          const systemInstruction = `You are an expert Mid-Autumn Festival visual art director.
Translate and transform the user request into an exquisite, vivid English visual prompt for a square digital art illustration.
Key aesthetics to always include:
- A prominent, luminous golden full moon in the night sky.
- Warm, celebratory festive ambiance, magical golden glow, traditional paper/star lanterns.
- Detailed, colorful, and polished 3D animation / digital storybook art style.
- Clean composition suitable for a Mid-Autumn puzzle piece.
- Output ONLY the prompt text without quotation marks or explanations.`;

          // Try Gemini models
          const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];
          for (const model of modelsToTry) {
            try {
              const geminiRes = await ai.models.generateContent({
                model,
                contents: `${systemInstruction}\nUser request: "${rawPrompt}"`,
              });
              if (geminiRes.text && geminiRes.text.trim()) {
                optimizedPrompt = geminiRes.text.trim();
                console.log(`[Gemini AI] Prompt optimized with ${model}:`, optimizedPrompt);
                break;
              }
            } catch (err: any) {
              console.warn(`[Gemini AI] Model ${model} failed, trying next:`, err.message);
            }
          }
        } catch (geminiErr: any) {
          console.warn('[Gemini AI] Could not optimize prompt, using fallback:', geminiErr.message);
        }
      }

      // If Gemini wasn't able to optimize, provide a rich fallback enhancement
      if (optimizedPrompt === rawPrompt) {
        optimizedPrompt = `${rawPrompt}, Vietnamese Mid-Autumn festival, prominent glowing golden full moon, magical festive lanterns, warm golden illumination, high quality digital storybook 3d art, clean composition, square 1:1`;
      }

      // 2. Fetch generated image
      const encodedPrompt = encodeURIComponent(optimizedPrompt);
      const seed = Math.floor(Math.random() * 1000000);
      const targetUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true&seed=${seed}&model=flux`;

      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`AI Service returned status ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const rawBuffer = Buffer.from(arrayBuffer);

      // 3. Post-process with sharp to remove any bottom watermark & output crisp JPEG
      const meta = await sharp(rawBuffer).metadata();
      const width = meta.width || 800;
      const height = meta.height || 800;
      const cropHeight = Math.max(100, height - 35); // Remove bottom bar

      const cleanBuffer = await sharp(rawBuffer)
        .extract({ left: 0, top: 0, width, height: cropHeight })
        .resize(768, 768, { fit: 'cover' })
        .jpeg({ quality: 92 })
        .toBuffer();

      const base64Data = cleanBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64Data}`;

      return res.json({
        success: true,
        data: {
          imageUrl: dataUrl,
          prompt: rawPrompt,
          refinedPrompt: optimizedPrompt,
        },
      });
    } catch (error: any) {
      console.error('Lỗi khi AI tạo ảnh:', error);
      return res.status(500).json({
        success: false,
        message: 'Không thể tạo ảnh bằng AI lúc này. Bạn vui lòng thử lại nhé!',
      });
    }
  }
}
