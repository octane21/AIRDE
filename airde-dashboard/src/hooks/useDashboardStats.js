import { useState, useEffect } from 'react';
import { statsApi, risksApi, actionsApi, assetsApi } from '../services/api';
import { generateAlerts, generateKeyTakeaways, generateNextActions, generateReportSummary } from '../lib/insights';

const CONDITION_META = {
  EXCELLENT: { range: '≥90', color: '#22c55e' },
  GOOD: { range: '70-89', color: '#84cc16' },
  FAIR: { range: '50-69', color: '#eab308' },
  POOR: { range: '30-49', color: '#ef4444' },
  CRITICAL: { range: '<30', color: '#7f1d1d' },
};

const STRATEGY_META = {
  Preventive: { icon: '🛡', color: '#3b82f6' },
  Predictive: { icon: '⌕', color: '#8b5cf6' },
  Corrective: { icon: '🔧', color: '#f59e0b' },
  Replacement: { icon: '▣', color: '#ef4444' },
  Monitoring: { icon: '👁', color: '#22c55e' },
};

function pofBucket(pof) {
  return Math.min(5, Math.max(1, Math.ceil(Number(pof) * 5)));
}

// Aggregates backend stats + risk/action/asset lists into chart-ready shapes
// consumed by CommandCenter / RiskManagement. Returns { loading, error, stats }.
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [overview, kpi, trend, risks, actions, assets] = await Promise.all([
          statsApi.overview(), statsApi.kpi(), statsApi.trend(),
          risksApi.list(), actionsApi.list(), assetsApi.list(),
        ]);

        const locationById = Object.fromEntries(assets.map(a => [a.id, a.location]));
        const totalConditions = overview.conditions.reduce((s, c) => s + c.cnt, 0) || 1;

        const healthDistribution = overview.conditions.map(c => ({
          label: c.condition,
          count: c.cnt,
          pct: Math.round((c.cnt / totalConditions) * 100),
          color: CONDITION_META[c.condition]?.color || '#64748b',
          range: CONDITION_META[c.condition]?.range || '',
        }));

        const riskMatrixCells = {};
        for (const r of risks) {
          const key = `${pofBucket(r.pof)}-${Number(r.cof)}`;
          riskMatrixCells[key] = (riskMatrixCells[key] || 0) + 1;
        }

        const top5Critical = [...risks]
          .sort((a, b) => b.risk_score - a.risk_score)
          .slice(0, 5)
          .map((r, i) => ({
            rank: i + 1, id: r.id, location: locationById[r.id] || '-',
            riskScore: Number(r.risk_score), riskLevel: r.risk_level, ahi: r.ahi,
          }));

        const strategyCounts = {};
        for (const a of actions) strategyCounts[a.strategy] = (strategyCounts[a.strategy] || 0) + 1;
        const totalActions = actions.length || 1;
        const maintenanceStrategy = Object.entries(strategyCounts).map(([label, count]) => ({
          label, count, pct: Math.round((count / totalActions) * 100),
          icon: STRATEGY_META[label]?.icon || '•', color: STRATEGY_META[label]?.color || '#64748b',
        }));

        const trendChart = trend.map(t => ({
          month: new Date(t.snapshot_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', timeZone: 'UTC' }),
          ahi: Number(t.avg_ahi), corrosionRate: Number(t.avg_corrosion_rate), highExtremeCount: t.high_extreme_count,
        }));

        const avgAhiKpi = kpi.find(k => k.kpi === 'Average AHI');
        const highExtremeKpi = kpi.find(k => k.kpi === 'High/Extreme Risk Assets');
        const coverageKpi = kpi.find(k => k.kpi === 'Inspection Coverage');
        const openActionsKpi = kpi.find(k => k.kpi === 'Open P0/P1 Actions');
        const avgRiskScore = risks.length ? risks.reduce((s, r) => s + Number(r.risk_score), 0) / risks.length : 0;
        const avgRemainingLife = risks.length ? risks.reduce((s, r) => s + Number(r.remaining_life), 0) / risks.length : 0;

        const avgAhiValue = Number(avgAhiKpi?.actual) || 0;
        const coveragePct = parseFloat(coverageKpi?.actual) || 0;
        const totalAssetsCount = assets.length || 1;
        const inspectedCount = Math.round((coveragePct / 100) * totalAssetsCount);
        const pendingCount = Math.max(0, totalAssetsCount - inspectedCount);
        const highExtremeIds = risks.filter(r => r.risk_level === 'EXTREME' || r.risk_level === 'HIGH').map(r => r.id);
        const sortedStrategies = [...maintenanceStrategy].sort((a, b) => b.count - a.count);
        const topStrategy = sortedStrategies[0];

        const alerts = generateAlerts(risks);
        const keyTakeaways = generateKeyTakeaways({
          avgAhi: avgAhiValue,
          highExtremeCount: highExtremeIds.length,
          trendChart,
          coveragePct,
          pendingCount,
          topStrategy,
        });
        const nextActions = generateNextActions({
          highExtremeIds,
          pendingCount,
          topStrategies: sortedStrategies.slice(0, 2).map(s => s.label),
        });
        const reportSummary = generateReportSummary({
          avgAhi: avgAhiValue,
          highExtremeCount: highExtremeIds.length,
          highExtremeIds,
          coveragePct,
          topStrategy,
        });

        const data = {
          kpi: {
            ahi: { value: avgAhiKpi?.actual ?? 0, label: avgAhiKpi?.actual >= 70 ? 'GOOD' : 'FAIR' },
            riskScore: { value: avgRiskScore.toFixed(2), label: avgRiskScore <= 0.5 ? 'LOW' : avgRiskScore <= 1.5 ? 'MEDIUM' : 'HIGH' },
            remainingLife: { value: avgRemainingLife.toFixed(1), label: 'YEARS' },
            inspectionCoverage: { value: coverageKpi?.actual ?? '0%' },
            totalAssets: { value: assets.length, label: 'ASSETS', sub: 'Active Assets' },
            highExtreme: highExtremeKpi?.actual ?? 0,
            openActions: openActionsKpi?.actual ?? 0,
          },
          kpiTable: kpi,
          healthDistribution,
          riskMatrixCells,
          top5Critical,
          maintenanceStrategy,
          trendChart,
          inspectionStatus: {
            inspectedPct: parseFloat(coverageKpi?.actual) || 0,
            pendingCount,
          },
          alerts,
          keyTakeaways,
          nextActions,
          reportSummary,
        };

        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { stats, loading, error };
}
