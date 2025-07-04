import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export const runtime = 'edge';

const formatChatHistory = (chatHistory: [string, string][]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) =>
      `Human: ${dialogueTurn[0]}\nAssistant: ${dialogueTurn[1]}`
  );
  return formattedDialogueTurns.join("\n");
};

const getSystemPrompt = (data: string) => {
  return `Ad: SkalGPT

Kimlik: Sezai Karakoç Anadolu Lisesi için özel geliştirilmiş, okulun öğrencileri, öğretmenleri ve idaresi için güvenilir, saygılı ve etkili bir dijital eğitim ve iletişim asistanısın.

Amac:
- Öğrencilere konu anlatımı, özet çıkarma, soru çözümü ve sınav hazırlığı konularında rehberlik etmek.
- Öğretmenlerin içerik üretimini, ders planlamasını ve öğrenci takip süreçlerini kolaylaştırmak.
- Okul içi duyuruları, etkinlik planlarını ve önemli tarihleri zamanında hatırlatmak.
- Tüm iletişimde etik, güvenli ve okul kurallarına uygun davranmak.

Kullanım Kuralları:
- Cevaplarını öncelikle sana sunulan "Okul Bilgileri" bölümündeki dökümanlara dayandır. Eğer cevap bu dökümanlarda yoksa, genel bilgilerini kullanabilirsin ancak bu durumu mutlaka belirtmelisin. (Örnek: "Okul dökümanlarında bu bilgiye rastlamadım, ancak genel bilgilere göre...")
- Yanıtların daima doğru, anlaşılır ve hedef kitlenin seviyesine uygun olmalı.
- Gereksiz bilgi, spam veya okul kurallarına aykırı içerik üretme.
- Gizliliğe bağlı kal, kişisel bilgi paylaşımından kaçın.
- Kendini sürekli geliştir, geri bildirimlere açık ol.

Hedef Kitle:
- Sezai Karakoç Anadolu Lisesi öğrencileri
- Sezai Karakoç Anadolu Lisesi öğretmenleri
- Sezai Karakoç Anadolu Lisesi idare ve çalışanları

Yetkinlikler:
- Tüm derslerde konu anlatmak, özet çıkarmak, not hazırlamak.
- Farklı seviyelerde soru hazırlamak ve çözmek.
- Yazılı ödevlerde rehberlik etmek, örnekler vermek.
- Etkinlik önerileri ve okul kültürüne uygun projeler geliştirmek.
- Akademik takvimi hatırlatmak, duyuruları düzenli paylaşmak.

Davranış Kuralları:
- Samimi, motive edici, öğretici ve seviyeye uygun bir dil kullan.
- Okulun değerlerini yansıt, saygılı ol.
- Sadece yetkin olunan konularda bilgi paylaş.
- Gerektiğinde öğrenciye rehberlik servisine veya öğretmenine başvurmasını öner.

Okul Bilgileri:
${data}

Format Kuralı:
- Tüm yanıtlar temiz, düzenli ve başlıklandırılmış biçimde sunulmalıdır.
- Uzun yanıtlar için uygun şekilde bölümler ve madde işaretleri kullanılmalıdır.
- Gerektiğinde tablo, kod bloğu veya liste kullanılarak anlatım desteklenmelidir.`;
};

const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.').max(8000, 'Message cannot be longer than 8000 characters.'),
  sessionId: z.string().uuid('Invalid session ID format.'),
});

export async function POST(req: NextRequest) {
  try {
  const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten() }, { status: 400 });
    }

    const { message, sessionId } = validation.data;

  const cookieStore = cookies()

  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;

      if (!supabaseServiceKey || !googleApiKey) {
        console.error("CRITICAL: Missing environment variables for Supabase (service key) or Google.");
      return NextResponse.json(
        { error: 'Server configuration error. Required API keys are missing.' },
        { status: 500 }
      );
    }
    
      // Create a separate admin client ONLY for privileged operations (RAG)
      const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceKey);
    
      // RAG: Retrieve relevant documents using the admin client
    const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: googleApiKey });
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabaseAdmin,
      tableName: "document_chunks",
      queryName: "match_documents",
    });
    const relevantDocs = await vectorStore.similaritySearch(message, 4);

      // Fetch chat history using the user's client to respect RLS
      const { data: chatHistory, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
        .eq('user_id', user.id) // This is redundant with RLS but good for defense-in-depth
      .order('created_at', { ascending: true });

    if (historyError) {
      throw new Error(`Failed to fetch chat history: ${historyError.message}`);
    }

    // Construct the prompt
    const context = relevantDocs.map((doc, i) => `Doküman ${i + 1}:\n${doc.pageContent}`).join("\n\n");
    const history = formatChatHistory((chatHistory || []).map(msg => [msg.role === 'user' ? 'Human' : 'Assistant', msg.content]) as [string, string][]);
    const systemPrompt = getSystemPrompt(context);
    const finalPrompt = `${systemPrompt}\n\n<chat_history>\n${history}\n</chat_history>\n\nHuman: ${message}\nAssistant:`;

      // Save user message using the user's client
      await supabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role: 'user',
      content: message,
    });
    
    // Call Google Gemini API
    const genAI = new GoogleGenerativeAI(googleApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContentStream(finalPrompt);

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(chunkText);
            fullResponse += chunkText;
          }
        } catch (streamError: any) {
          console.error('[CHAT_API_STREAM_ERROR]', { errorMessage: streamError.message, stack: streamError.stack });
          controller.error(streamError); // Propagate error to client
        } finally {
          // Save the full response from the assistant using the user's client
          if (fullResponse) {
            await supabase.from('chat_messages').insert({
              session_id: sessionId,
              user_id: user.id,
              role: 'assistant',
              content: fullResponse,
            });
          }
          controller.close();
        }
      },
    });

    return new Response(stream);

  } catch (e: any) {
    console.error('[CHAT_API_GENERAL_ERROR]', {
      errorMessage: e.message,
      requestBody: body,
      stack: e.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json(
      { error: "An unexpected error occurred. The developers have been notified." },
      { status: 500 }
    );
    }
  } catch (e: any) {
    // This outer catch is for issues with reading/parsing the request body itself
    console.error('[CHAT_API_VALIDATION_ERROR]', {
      errorMessage: e.message,
      stack: e.stack,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }
} 