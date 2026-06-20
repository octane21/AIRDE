import { buildLiveContext } from './aiContext.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

/**
 * Membangun system prompt secara DINAMIS untuk setiap request, berdasarkan
 * pertanyaan terbaru user. `context` dihasilkan oleh buildLiveContext() yang
 * mengambil data LANGSUNG dari database (via REST API) — lihat aiContext.js.
 */
function buildSystemPrompt(context) {
  return `Anda adalah AIRDE AI Assistant, asisten cerdas untuk sistem manajemen integritas pipa (Pipeline Integrity Management System) bernama AIRDE V20.

Konteks data terkini (diambil langsung dari database, bukan data statis):
${context}

Panduan respons:
- Jawab dalam Bahasa Indonesia yang profesional dan teknis
- Berikan analisis konkret berdasarkan data di atas
- Sertakan rekomendasi actionable
- Gunakan format yang rapi (bullet points, angka spesifik), tanpa format highlight
- Jika ditanya tentang aset spesifik, berikan data yang relevan
- Jangan buat data fiktif di luar konteks yang diberikan`;
}

export async function sendMessageToGroq(messages, onChunk, onDone, onError) {
  if (!API_KEY) {
    onError(`API key belum dikonfigurasi. Buka file .env.local dan isi VITE_GROQ_API_KEY dengan API key Groq Anda.`);
    return;
  }

  // Ambil pesan terbaru dari user untuk menentukan konteks data apa yang relevan
  const latestUserMessage = [...messages].reverse().find((m) => m.from === 'user')?.text || '';
  let context;
  try {
    context = await buildLiveContext(latestUserMessage);
  } catch (err) {
    onError(`Gagal mengambil data dari database: ${err.message}`);
    return;
  }
  const systemPrompt = buildSystemPrompt(context);

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
    ],
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError(err.error?.message || `Error ${response.status}: ${response.statusText}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const chunk = json.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // skip malformed chunk
        }
      }
    }

    onDone();
  } catch (err) {
    onError(err.message || 'Koneksi gagal. Periksa koneksi internet Anda.');
  }
}