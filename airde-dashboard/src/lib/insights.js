// Generates Alerts, Key Takeaways, Next Actions, and the Report's Executive Summary /
// Top Priority / Recommendation text — all derived live from current risk/action/trend data,
// instead of hardcoded copy. Shared by CommandCenter.jsx and Report.jsx so both pages stay
// in sync with whatever the calculation engine currently outputs.

function todayLabel() {
  return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function quarterLabel(monthsAhead = 3) {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}

export function generateAlerts(risks) {
  const date = todayLabel();
  const alerts = [];

  for (const r of risks) {
    if (r.risk_level === 'EXTREME') {
      alerts.push({ level: 'red', date, asset: r.id, message: `Risk Level EXTREME (${Number(r.risk_score).toFixed(2)})\nImmediate Action Required`, priority: 3 });
    } else if (r.risk_level === 'HIGH') {
      alerts.push({ level: 'orange', date, asset: r.id, message: `Risk Level HIGH (${Number(r.risk_score).toFixed(2)})\nAction Required`, priority: 2 });
    }
  }
  for (const r of risks) {
    if (r.condition === 'POOR' || r.condition === 'CRITICAL') {
      if (alerts.some(a => a.asset === r.id)) continue;
      alerts.push({ level: 'orange', date, asset: r.id, message: `Coating Health ${Number(r.coating_health).toFixed(0)}% (${r.condition})\nRecoating recommended`, priority: 1 });
    }
  }
  for (const r of risks) {
    if (Number(r.remaining_life) < 10) {
      if (alerts.some(a => a.asset === r.id)) continue;
      alerts.push({ level: 'blue', date, asset: r.id, message: `Remaining Life ${Number(r.remaining_life).toFixed(1)} Years\nMonitor closely`, priority: 0 });
    }
  }

  return alerts.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

export function generateKeyTakeaways({ avgAhi, highExtremeCount, trendChart, coveragePct, pendingCount, topStrategy }) {
  const takeaways = [];

  const ahiLabel = avgAhi >= 90 ? 'EXCELLENT' : avgAhi >= 70 ? 'GOOD' : avgAhi >= 50 ? 'FAIR' : 'POOR';
  takeaways.push(`Asset Health Index rata-rata ${avgAhi.toFixed(0)} (${ahiLabel}) menunjukkan kondisi aset secara umum ${avgAhi >= 70 ? 'baik' : 'perlu perhatian'}.`);

  takeaways.push(
    highExtremeCount > 0
      ? `Terdapat ${highExtremeCount} aset dengan Risk Level EXTREME/HIGH yang membutuhkan perhatian segera.`
      : 'Tidak ada aset dengan Risk Level EXTREME/HIGH saat ini.'
  );

  if (trendChart?.length >= 2) {
    const first = trendChart[0].corrosionRate;
    const last = trendChart[trendChart.length - 1].corrosionRate;
    const direction = last < first ? 'menurun' : last > first ? 'meningkat' : 'stabil';
    takeaways.push(`Corrosion rate ${direction} dan berada di ${last.toFixed(3)} mm/year.`);
  }

  takeaways.push(`${coveragePct.toFixed(0)}% aset telah diinspeksi, masih ada ${pendingCount} aset yang pending.`);

  if (topStrategy) {
    takeaways.push(`Rekomendasi ${topStrategy.label} mendominasi dengan ${topStrategy.pct}% dari total strategi.`);
  }

  return takeaways;
}

export function generateNextActions({ highExtremeIds, pendingCount, topStrategies }) {
  const actions = [];

  actions.push(
    highExtremeIds.length > 0
      ? { icon: '🎯', text: `Focus on ${highExtremeIds.length} Extreme/High Risk Assets (${highExtremeIds.slice(0, 3).join(', ')}${highExtremeIds.length > 3 ? ', dst.' : ''})` }
      : { icon: '🎯', text: 'Tidak ada aset Extreme/High Risk — pertahankan monitoring rutin' }
  );

  actions.push(
    pendingCount > 0
      ? { icon: '🔍', text: `Lanjutkan program inspeksi untuk ${pendingCount} aset pending` }
      : { icon: '🔍', text: 'Inspeksi 100% selesai — lanjutkan siklus berikutnya' }
  );

  if (topStrategies?.length) {
    actions.push({ icon: '🛠', text: `Implementasi strategi ${topStrategies.join(' & ')}` });
  }

  actions.push({ icon: '📊', text: `Review budget & resource untuk ${quarterLabel()}` });

  return actions;
}

// Used by Report.jsx — same underlying data as Command Center, phrased as report prose.
export function generateReportSummary({ avgAhi, highExtremeCount, highExtremeIds, coveragePct, topStrategy }) {
  const ahiLabel = avgAhi >= 70 ? 'good' : avgAhi >= 50 ? 'fair' : 'concerning';

  const executiveSummary = highExtremeCount > 0
    ? `Pipeline portfolio is ${ahiLabel} (avg AHI ${avgAhi.toFixed(0)}) with focused risk on ${highExtremeCount} asset${highExtremeCount > 1 ? 's' : ''}.`
    : `Pipeline portfolio is ${ahiLabel} (avg AHI ${avgAhi.toFixed(0)}) with no assets currently at EXTREME/HIGH risk.`;

  const topPriority = highExtremeIds.length > 0
    ? `${highExtremeIds.join(' and ')} require${highExtremeIds.length === 1 ? 's' : ''} attention.`
    : 'No assets currently require urgent attention.';

  const recommendation = `Continue inspections${topStrategy ? `, ${topStrategy.label.toLowerCase()} program,` : ','} and risk-based monitoring. Inspection coverage is at ${coveragePct.toFixed(0)}%${coveragePct < 80 ? ' — below the 80% target, schedule remaining inspections.' : '.'}`;

  return { executiveSummary, topPriority, recommendation };
}
