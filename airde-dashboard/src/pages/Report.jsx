import { useState } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { reportApi } from '../services/api';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../context/AuthContext';

function LiveSummary() {
  const { isAdmin, isOperator } = useAuth();
  const canWrite = isAdmin || isOperator;
  const { stats, loading } = useDashboardStats();
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');

  const summary = stats?.reportSummary;

  const handleApply = async () => {
    if (!summary) return;
    setApplying(true);
    setMessage('');
    try {
      await Promise.all([
        reportApi.update('Executive Summary', { summary: summary.executiveSummary }),
        reportApi.update('Top Priority', { summary: summary.topPriority }),
        reportApi.update('Recommendation', { summary: summary.recommendation }),
      ]);
      setMessage('Tersimpan.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
      <SectionHeader title="Live Summary" subtitle="Dihitung otomatis dari data terkini (risk, AHI, inspection coverage, strategy)" />
      {loading || !summary ? (
        <div className="text-center text-slate-500 text-sm py-4">Menghitung ringkasan...</div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Executive Summary</div>
            <div className="text-xs text-slate-300">{summary.executiveSummary}</div>
          </div>
          <div>
            <div className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Top Priority</div>
            <div className="text-xs text-slate-300">{summary.topPriority}</div>
          </div>
          <div>
            <div className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">Recommendation</div>
            <div className="text-xs text-slate-300">{summary.recommendation}</div>
          </div>

          {canWrite && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
            >
              {applying ? 'Menyimpan...' : 'Simpan Snapshot'}
            </button>
          )}
          {message && <div className="text-[11px] text-green-400">{message}</div>}
        </div>
      )}
    </div>
  );
}

export default function Report() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">REPORT</div>
        <div className="text-[11px] text-slate-400">Executive summary & recommendations (21_Report)</div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4">
        <LiveSummary />
      </div>
    </div>
  );
}
