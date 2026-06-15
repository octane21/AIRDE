import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandCenter from './pages/CommandCenter';
import TacticalDashboard from './pages/TacticalDashboard';
import AssetManagement from './pages/AssetManagement';
import Inspection from './pages/Inspection';
import RiskManagement from './pages/RiskManagement';
import Maintenance from './pages/Maintenance';
import Reporting from './pages/Reporting';
import AIAssistantPage from './pages/AIAssistantPage';
import AIChat from './components/ai/AIChat';
import { useChat } from './hooks/useChat';
import './index.css';

const pages = {
  command: CommandCenter,
  asset: AssetManagement,
  inspection: Inspection,
  risk: RiskManagement,
  maintenance: Maintenance,
  reporting: Reporting,
  tactical: TacticalDashboard,
};

export default function App() {
  const [activePage, setActivePage] = useState('command');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  // State chat bersama — dipakai side panel DAN halaman AI Assistant
  const chat = useChat();

  const isAiPage = activePage === 'ai';
  const PageComponent = pages[activePage];

  const handlePageChange = (id) => {
    setActivePage(id);
    // Tutup side panel saat masuk ke halaman AI (chat ada di halaman)
    if (id === 'ai') setAiOpen(false);
    // Tutup sidebar di layar < 1030px saat navigasi
    if (window.innerWidth < 1030) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-[#070e1a] overflow-hidden">
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0 sidebar:ml-60 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        <div className="flex flex-1 min-h-0 overflow-hidden relative">

          {/* ── Konten halaman ── */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {isAiPage
              ? <AIAssistantPage chat={chat} />
              : <PageComponent />
            }
          </div>

          {/*
            ── AI Side Panel ──
            Hanya tampil saat aiOpen=true DAN bukan halaman AI Assistant.
            Mobile (< sm)   : overlay penuh (fixed inset-0)
            sm+ (≥ 640px)   : kolom samping relatif, dashboard tetap terlihat
          */}
          {aiOpen && !isAiPage && (
            <div className="
              flex flex-col bg-[#0a1628] border-l border-[#1e2d4f]
              flex-shrink-0 overflow-hidden
              fixed inset-0 z-40 w-full
              sm:relative sm:inset-auto sm:z-auto sm:w-72
              md:w-80
            ">
              <AIChat
                messages={chat.messages}
                isLoading={chat.isLoading}
                error={chat.error}
                onSend={chat.sendMessage}
                onClear={chat.clearChat}
                onClose={() => setAiOpen(false)}
                showClose
              />
            </div>
          )}
        </div>
      </div>

      {/*
        ── Floating bubble button ──
        Disembunyikan ketika:
        • Panel sudah terbuka (aiOpen = true)
        • Sedang di halaman AI Assistant (chat ada di halaman itu)
      */}
      {!aiOpen && !isAiPage && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
            bg-orange-500 hover:bg-orange-600 text-white text-2xl
            flex items-center justify-center
            shadow-2xl shadow-orange-500/40
            transition-all hover:scale-110 active:scale-95"
          title="Buka AI Assistant"
        >
          🤖
        </button>
      )}
    </div>
  );
}
