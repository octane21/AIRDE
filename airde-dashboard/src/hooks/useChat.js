import { useState, useRef } from 'react';
import { sendMessageToGroq } from '../lib/groqClient';
import { answerDataQuestion } from '../lib/aiQueries';

function now() {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

const WELCOME = {
  from: 'ai',
  text: 'Hai! Saya AIRDE AI Assistant — asisten cerdas untuk Pipeline Integrity Management.\n\nSaya dapat membantu analisis kondisi aset, risk assessment, rekomendasi maintenance, dan tren corrosion. Ada yang bisa saya bantu?',
  time: now(),
};

export function useChat() {
  const [messages, setMessages] = useState([WELCOME]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref agar closure di sendMessageToGroq selalu baca state terbaru
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const sendMessage = (text) => {
    const msg = text.trim();
    if (!msg || isLoading) return;

    setError(null);

    const userMsg = { from: 'user', text: msg, time: now() };
    const history = [...messagesRef.current, userMsg];
    setMessages(history);
    setIsLoading(true);

    const aiId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: aiId, from: 'ai', text: '', time: now(), streaming: true },
    ]);

    let accumulated = '';

    sendMessageToGroq(
      history,
      (chunk) => {
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, text: accumulated } : m))
        );
      },
      () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiId ? { ...m, streaming: false } : m))
        );
        setIsLoading(false);
      },
      (errMsg) => {
        setMessages((prev) => prev.filter((m) => m.id !== aiId));
        setError(errMsg);
        setIsLoading(false);
      }
    );
  };

  // Quick Question buttons: run a real DB query first (deterministic, always-correct numbers
  // + a link to the relevant page); only fall back to the LLM if the question isn't canonical.
  const askDataQuestion = async (text) => {
    const msg = text.trim();
    if (!msg || isLoading) return;
    setError(null);

    const answer = await answerDataQuestion(msg);
    if (answer) {
      const userMsg = { from: 'user', text: msg, time: now() };
      setMessages((prev) => [...prev, userMsg, { from: 'ai', text: answer.text, time: now(), link: answer.link }]);
      return;
    }

    // Not a canonical data question — fall back to the LLM (adds the user message itself).
    sendMessage(msg);
  };

  const clearChat = () => {
    setMessages([{ from: 'ai', text: 'Chat dibersihkan. Ada yang bisa saya bantu?', time: now() }]);
    setError(null);
  };

  return { messages, isLoading, error, sendMessage, askDataQuestion, clearChat };
}
