import { useState, useEffect } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { statsApi } from '../services/api';

const CATEGORY_ICON = { 'Asset Health': '🛡', Risk: '⚠', Criticality: '▲' };

export default function Analytics() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let cancelled = false;
    statsApi.analytics()
      .then(data => { if (!cancelled) setInsights(data); })
      .catch(err => { if (!cancelled) setApiError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">ANALYTICS</div>
        <div className="text-[11px] text-slate-400">Generated insights & recommended follow-up (17_Analytics)</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        {apiError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{apiError}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Memuat insight...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins, i) => (
              <div key={i} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
                <SectionHeader title={ins.category} />
                <div className="flex gap-2 mb-3">
                  <span className="text-xl flex-shrink-0">{CATEGORY_ICON[ins.category] || '💡'}</span>
                  <span className="text-[12px] text-slate-300">{ins.insight}</span>
                </div>
                <div className="pt-2 border-t border-[#1e2d4f]">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Recommended Follow-up</div>
                  <div className="text-[11px] text-orange-400">{ins.follow_up}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
