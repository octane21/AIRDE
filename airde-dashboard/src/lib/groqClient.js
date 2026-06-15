const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `Anda adalah AIRDE AI Assistant, asisten cerdas untuk sistem manajemen integritas pipa (Pipeline Integrity Management System) bernama AIRDE V20.

Konteks data terkini (per 15 Juni 2026):
- Total aset: 125 pipeline segments
- Asset Health Index (AHI) rata-rata: 86 (GOOD)
- Risk Score rata-rata: 0.36 (LOW)
- Remaining Life rata-rata: 305.2 tahun
- Inspection Coverage: 62% (78 selesai, 47 pending)
- Aset paling kritis: PL-045 (Jetty 2, AHI=38, Risk=2.33 HIGH), PL-078 (Jetty 1, AHI=54, Risk=1.30)
- Corrosion rate terkini: 0.125 mm/year (tren menurun dari 0.18 Jan 2026)
- Maintenance Strategy: Preventive 51%, Predictive 27%, Corrective 15%, Replacement 4%
- KPI Status: AHI On Track (86≥75), Risk Assets On Track (1≤3), Inspection Coverage Need Action (62%<80%)

Panduan respons:
- Jawab dalam Bahasa Indonesia yang profesional dan teknis
- Berikan analisis konkret berdasarkan data di atas
- Sertakan rekomendasi actionable
- Gunakan format yang rapi (bullet points, angka spesifik), tanpa format highlight
- Jika ditanya tentang aset spesifik, berikan data yang relevan
- Jangan buat data fiktif di luar konteks yang diberikan`;

export async function sendMessageToGroq(messages, onChunk, onDone, onError) {
  if (!API_KEY) {
    onError(`API key belum dikonfigurasi. Buka file .env.local dan isi VITE_GROQ_API_KEY dengan API key Groq Anda.`);
    return;
    // console.log(API_KEY)
  }
  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
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
