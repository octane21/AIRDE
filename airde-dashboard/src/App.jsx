import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Breadcrumb from './components/layout/Breadcrumb';
import CommandCenter from './pages/CommandCenter';
import TacticalDashboard from './pages/TacticalDashboard';
import OperationalDashboard from './pages/OperationalDashboard';
import AssetManagement from './pages/AssetManagement';
import AssetDetail from './pages/AssetDetail';
import Hierarchy from './pages/Hierarchy';
import Criticality from './pages/Criticality';
import Inspection from './pages/Inspection';
import Team from './pages/Team';
import DFT from './pages/DFT';
import UT from './pages/UT';
import VisualInspection from './pages/VisualInspection';
import Photos from './pages/Photos';
import AssetIntelligence from './pages/AssetIntelligence';
import Findings from './pages/Findings';
import RiskManagement from './pages/RiskManagement';
import Maintenance from './pages/Maintenance';
import KPI from './pages/KPI';
import Trend from './pages/Trend';
import Analytics from './pages/Analytics';
import MaintenanceStrategy from './pages/MaintenanceStrategy';
import MaintenancePlan from './pages/MaintenancePlan';
import WorkOrders from './pages/WorkOrders';
import Report from './pages/Report';
import Lookup from './pages/Lookup';
import WeightConfig from './pages/WeightConfig';
import FormulaMap from './pages/FormulaMap';
import AIAssistantPage from './pages/AIAssistantPage';
import UserManagement from './pages/UserManagement';
import LoginPage from './pages/LoginPage';
import AIChat from './components/ai/AIChat';
import { useChat } from './hooks/useChat';
import './index.css';

function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();

  const chat = useChat();
  const isAiPage = location.pathname === '/ai';

  const handleNavigate = () => {
    if (window.innerWidth < 1030) setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#070e1a] items-center justify-center">
        <div className="text-slate-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#070e1a] overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
        onNavigate={handleNavigate}
        onLoginClick={() => setLoginOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 sidebar:ml-60 overflow-hidden">
        <Header
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          onLoginClick={() => setLoginOpen(true)}
          onOpenAiPanel={() => setAiOpen(true)}
        />
        <Breadcrumb />

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {isAiPage ? (
              <AIAssistantPage chat={chat} />
            ) : (
              <Routes>
                <Route path="/" element={<CommandCenter />} />
                <Route path="/tactical" element={<TacticalDashboard />} />
                <Route path="/operational" element={<OperationalDashboard />} />
                <Route path="/asset" element={<AssetManagement />} />
                <Route path="/asset/:id" element={<AssetDetail />} />
                <Route path="/hierarchy" element={<Hierarchy />} />
                <Route path="/criticality" element={<Criticality />} />
                <Route path="/inspection" element={<Inspection />} />
                <Route path="/teams" element={<Team />} />
                <Route path="/dft" element={<DFT />} />
                <Route path="/ut" element={<UT />} />
                <Route path="/visual" element={<VisualInspection />} />
                <Route path="/photos" element={<Photos />} />
                <Route path="/asset-intelligence" element={<AssetIntelligence />} />
                <Route path="/findings" element={<Findings />} />
                <Route path="/risk" element={<RiskManagement />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/kpi" element={<KPI />} />
                <Route path="/trend" element={<Trend />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/maintenance-plan" element={<MaintenancePlan />} />
                <Route path="/work-orders" element={<WorkOrders />} />
                <Route path="/report" element={<Report />} />
                <Route path="/maintenance-strategy" element={<AdminRoute><MaintenanceStrategy /></AdminRoute>} />
                <Route path="/lookup" element={<AdminRoute><Lookup /></AdminRoute>} />
                <Route path="/config" element={<AdminRoute><WeightConfig /></AdminRoute>} />
                <Route path="/formula-map" element={<AdminRoute><FormulaMap /></AdminRoute>} />
                <Route path="/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </div>

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
                onAskData={chat.askDataQuestion}
                onClear={chat.clearChat}
                onClose={() => setAiOpen(false)}
                showClose
              />
            </div>
          )}
        </div>
      </div>

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

      {loginOpen && <LoginPage onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FilterProvider>
        <AppShell />
      </FilterProvider>
    </AuthProvider>
  );
}
