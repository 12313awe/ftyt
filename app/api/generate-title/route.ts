import { type NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

export const runtime = 'edge';

const generateTitleRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(8000, 'Message cannot be longer than 8000 characters.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = generateTitleRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten() }, { status: 400 });
    }

    const { message } = validation.data;

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;

    if (!googleApiKey) {
      console.error("CRITICAL: Missing environment variable for Google API Key.");
      return NextResponse.json(
        { error: 'Server configuration error. Google API Key is missing.' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Aşağıdaki sohbet mesajını 2 ila 5 kelimeyle özetleyen kısa, açıklayıcı bir başlık oluştur. Başlık, mesajın ana konusunu yansıtmalı. Sadece başlığı döndür, başka hiçbir şey ekleme.

Mesaj: "${message}"

Başlık:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // AI'dan gelen yanıtı temizle ve fazladan boşlukları kaldır
    const cleanedTitle = responseText.replace(/['"]+/g, '').trim();

    return NextResponse.json({ title: cleanedTitle });

  } catch (e: any) {
    console.error('[GENERATE_TITLE_API_ERROR]', {
      errorMessage: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "An unexpected error occurred while generating title." },
      { status: 500 }
    );
  }
} 