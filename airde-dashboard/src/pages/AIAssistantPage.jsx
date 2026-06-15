import AIChat from '../components/ai/AIChat';
import { aiSuggestions } from '../data/dashboardData';

export default function AIAssistantPage({ chat }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">06 AI ASSISTANT</div>
        <div className="text-[11px] text-slate-400">AIRDE AI-Powered Analysis & Recommendations</div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-[#1e2d4f] overflow-hidden">
        {/* ── Chat room (riwayat bersama) ── */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <AIChat
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onSend={chat.sendMessage}
            onClear={chat.clearChat}
            showClose={false}
          />
        </div>

        {/* ── Info panel ── */}
        <div className="p-4 overflow-auto scrollbar-thin hidden lg:block">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About AIRDE AI</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                AIRDE AI Assistant menggunakan model AI berbasis data pipeline integrity untuk memberikan analisis, rekomendasi, dan insight real-time berdasarkan data inspeksi, risk assessment, dan maintenance history.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Questions</div>
              <div className="space-y-1.5">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => chat.sendMessage(s)}
                    disabled={chat.isLoading}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-orange-400 bg-[#111d35] hover:bg-[#162040] border border-[#1e2d4f] hover:border-orange-500/30 rounded px-3 py-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    💬 {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Capabilities</div>
              <div className="space-y-1.5">
                {[
                  '🔍 Asset condition analysis',
                  '⚠️ Risk level assessment',
                  '🛠 Maintenance recommendations',
                  '📊 Trend analysis & forecasting',
                  '📋 Inspection planning support',
                  '💡 Integrity strategy optimization',
                ].map((cap, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-center gap-2">{cap}</div>
                ))}
              </div>
            </div>

            {/* Jumlah pesan aktif */}
            <div className="pt-2 border-t border-[#1e2d4f]">
              <div className="text-[10px] text-slate-600">
                {chat.messages.length} pesan dalam sesi ini
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
