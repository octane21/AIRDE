import { useState, useEffect } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import { reportApi, risksApi, actionsApi, assetsApi } from '../services/api';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useAuth } from '../context/AuthContext';
import { generateActionReportPDF } from '../lib/pdfReport';

const PRIORITY_RANK = { P0: 0, P1: 1, P2: 2, P3: 3 };

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

function DownloadReportCard() {
  const { stats } = useDashboardStats();
  const [rawData, setRawData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([risksApi.list(), actionsApi.list(), assetsApi.list()])
      .then(([risks, actions, assets]) => { if (!cancelled) setRawData({ risks, actions, assets }); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoadingData(false); });
    return () => { cancelled = true; };
  }, []);

  const urgentActions = (() => {
    if (!rawData) return [];
    const riskById = Object.fromEntries(rawData.risks.map(r => [r.id, r]));
    const assetById = Object.fromEntries(rawData.assets.map(a => [a.id, a]));
    return [...rawData.actions]
      .map(a => {
        const risk = riskById[a.id] || {};
        const asset = assetById[a.id] || {};
        return {
          ...a,
          ahi: risk.ahi, condition: risk.condition, risk_score: risk.risk_score,
          remaining_life: risk.remaining_life, location: asset.location,
        };
      })
      .sort((x, y) => {
        const rankDiff = (PRIORITY_RANK[x.priority] ?? 9) - (PRIORITY_RANK[y.priority] ?? 9);
        if (rankDiff !== 0) return rankDiff;
        return Number(y.risk_score || 0) - Number(x.risk_score || 0);
      });
  })();

  const urgentCount = urgentActions.filter(a => a.priority === 'P0' || a.priority === 'P1').length;
  const ready = !loadingData && stats?.reportSummary && rawData;

  const handleDownload = () => {
    if (!ready) return;
    setGenerating(true);
    try {
      generateActionReportPDF({
        reportSummary: stats.reportSummary,
        kpi: stats.kpi,
        urgentActions,
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
      <SectionHeader title="Download Laporan PDF" subtitle="Tindakan prioritas, strategi, dan detail aset yang memerlukan perhatian" />

      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 text-[11px] text-yellow-400 mb-3">{error}</div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-xs text-slate-400">
          {loadingData ? (
            'Memuat data aset & action register...'
          ) : (
            <>
              Laporan akan mencakup{' '}
              <span className="text-orange-400 font-semibold">{urgentCount} tindakan prioritas P0/P1</span>
              {' '}dari total <span className="text-slate-200 font-medium">{urgentActions.length} action register</span>,
              lengkap dengan detail AHI, Risk Score, dan Risk Level per aset.
            </>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={!ready || generating}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-2.5 rounded-md transition-colors flex-shrink-0"
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
          {generating ? 'Membuat PDF...' : 'Download PDF Report'}
        </button>
      </div>
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
      <div className="flex-1 overflow-auto scrollbar-thin p-4 md:p-5 space-y-4">
        <LiveSummary />
        <DownloadReportCard />
      </div>
    </div>
  );
}
