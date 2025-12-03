import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

export async function extractUserData(frontImage?: string, backImage?: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Extract the following information from this ID card image(s):
- Full name
- Email address (if visible)
- Phone number (if visible) 
- Full address (if visible)

Return ONLY a JSON object with these fields: name, email, phone, address. 
If a field is not visible, use null for that field.`;

  const parts: any[] = [{ text: prompt }];

  if (frontImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frontImage.split(',')[1]
      }
    });
  }

  if (backImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: backImage.split(',')[1]
      }
    });
  }

  const result = await model.generateContent(parts);
  const text = result.response.text();
  
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
  } catch {
    throw new Error('Failed to parse AI response');
  }
}