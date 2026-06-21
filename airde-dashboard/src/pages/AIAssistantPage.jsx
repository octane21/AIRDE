import AIChat from '../components/ai/AIChat';
import { aiSuggestions } from '../data/dashboardData';
import { MessageCircle, Search, AlertTriangle, Wrench, BarChart3, ClipboardList, Lightbulb } from 'lucide-react';

const capabilities = [
  { icon: Search, label: 'Asset condition analysis' },
  { icon: AlertTriangle, label: 'Risk level assessment' },
  { icon: Wrench, label: 'Maintenance recommendations' },
  { icon: BarChart3, label: 'Trend analysis & forecasting' },
  { icon: ClipboardList, label: 'Inspection planning support' },
  { icon: Lightbulb, label: 'Integrity strategy optimization' },
];

export default function AIAssistantPage({ chat }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 py-4 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">AI ASSISTANT</div>
        <div className="text-[11px] text-slate-400 mt-0.5">AIRDE AI-Powered Analysis & Recommendations</div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-[#1e2d4f] overflow-hidden">
        {/* ── Chat room (riwayat bersama) ── */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <AIChat
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onSend={chat.sendMessage}
            onAskData={chat.askDataQuestion}
            onClear={chat.clearChat}
            showClose={false}
          />
        </div>

        {/* ── Info panel ── */}
        <div className="p-5 overflow-auto scrollbar-thin hidden lg:block">
          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">About AIRDE AI</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                AIRDE AI Assistant menggunakan model AI berbasis data pipeline integrity untuk memberikan analisis, rekomendasi, dan insight real-time berdasarkan data inspeksi, risk assessment, dan maintenance history.
              </p>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Quick Questions</div>
              <div className="space-y-2">
                {aiSuggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => chat.askDataQuestion(s)}
                    disabled={chat.isLoading}
                    className="w-full flex items-center gap-2 text-left text-[11px] text-slate-400 hover:text-orange-400 bg-[#111d35] hover:bg-[#162040] border border-[#1e2d4f] hover:border-orange-500/30 rounded-md px-3 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageCircle size={13} className="flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Capabilities</div>
              <div className="space-y-2">
                {capabilities.map(({ icon: Icon, label }, i) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-center gap-2.5">
                    <Icon size={13} className="text-orange-400/70 flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Jumlah pesan aktif */}
            <div className="pt-3 border-t border-[#1e2d4f]">
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
