import { risksApi, dftApi, actionsApi, statsApi } from '../services/api';

// Deterministic answers for the AI Assistant's "Quick Question" buttons — these query the
// live database directly (not the LLM) so the numbers are always correct, and each comes
// with a link to the page that has the full picture.

async function mostCriticalAsset() {
  const risks = await risksApi.list();
  if (!risks.length) return { text: 'Belum ada data risk intelligence.', link: null };
  const top = [...risks].sort((a, b) => b.risk_score - a.risk_score)[0];
  const second = [...risks].sort((a, b) => b.risk_score - a.risk_score)[1];
  return {
    text: `Berdasarkan data terkini, aset paling kritis adalah **${top.id}** (${top.location || '-'}) dengan Risk Score ${Number(top.risk_score).toFixed(2)} (${top.risk_level}) dan AHI ${top.ahi} (${top.condition}).` +
      (second ? ` Disusul **${second.id}** dengan Risk Score ${Number(second.risk_score).toFixed(2)} (${second.risk_level}).` : ''),
    link: { to: `/asset/${top.id}`, label: `Buka Asset 360° — ${top.id}` },
  };
}

async function recoatingCandidates() {
  const dftRows = await dftApi.list();
  const poor = dftRows.filter(d => d.coating_status === 'POOR').sort((a, b) => Number(a.coating_health) - Number(b.coating_health));
  if (!poor.length) return { text: 'Tidak ada aset dengan Coating Status POOR saat ini.', link: { to: '/dft', label: 'Buka DFT (Coating)' } };
  const list = poor.slice(0, 5).map(d => `${d.asset_id} (${Number(d.coating_health).toFixed(1)}%)`).join(', ');
  return {
    text: `Aset yang memerlukan recoating segera berdasarkan Coating Status POOR: ${list}${poor.length > 5 ? `, dan ${poor.length - 5} lainnya` : ''}.`,
    link: { to: '/dft', label: 'Buka DFT (Coating)' },
  };
}

async function remainingLifeFor(question) {
  const match = question.match(/PL-\d+/i);
  if (!match) return { text: 'Sebutkan Asset ID, contoh: "Berapa remaining life asset PL-001?"', link: null };
  const assetId = match[0].toUpperCase();
  const risks = await risksApi.list();
  const r = risks.find(x => x.id === assetId);
  if (!r) return { text: `Data untuk ${assetId} tidak ditemukan.`, link: { to: '/asset', label: 'Buka Asset Register' } };
  return {
    text: `**${assetId}** (${r.location || '-'}) memiliki Remaining Life **${Number(r.remaining_life).toFixed(1)} tahun** berdasarkan Corrosion Rate ${Number(r.corrosion_rate).toFixed(3)} mm/year. AHI = ${r.ahi} (${r.condition}), Risk Score = ${Number(r.risk_score).toFixed(2)} (${r.risk_level}).`,
    link: { to: `/asset/${assetId}`, label: `Buka Asset 360° — ${assetId}` },
  };
}

async function maintenancePriorities() {
  const actions = await actionsApi.list();
  const urgent = actions.filter(a => a.priority === 'P0' || a.priority === 'P1');
  if (!urgent.length) return { text: 'Tidak ada action dengan priority P0/P1 saat ini.', link: { to: '/maintenance', label: 'Buka Action Register' } };
  const list = urgent.slice(0, 5).map(a => `${a.id} (${a.priority} - ${a.strategy})`).join(', ');
  return {
    text: `Prioritas maintenance saat ini (P0/P1): ${list}${urgent.length > 5 ? `, dan ${urgent.length - 5} lainnya` : ''}. Total ${urgent.length} action terbuka.`,
    link: { to: '/maintenance', label: 'Buka Action Register' },
  };
}

async function corrosionTrendSummary() {
  const trend = await statsApi.trend();
  if (!trend.length) return { text: 'Belum ada data tren.', link: { to: '/trend', label: 'Buka Trend' } };
  const sorted = [...trend].sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));
  const last = sorted[sorted.length - 1];
  const first = sorted[0];
  const direction = Number(last.avg_corrosion_rate) < Number(first.avg_corrosion_rate) ? 'menurun' : 'meningkat';
  return {
    text: `Tren Corrosion Rate ${direction} dari ${Number(first.avg_corrosion_rate).toFixed(3)} mm/yr menjadi ${Number(last.avg_corrosion_rate).toFixed(3)} mm/yr (${sorted.length} titik data).`,
    link: { to: '/trend', label: 'Buka Trend' },
  };
}

const MATCHERS = [
  { test: q => /paling kritis/i.test(q), run: mostCriticalAsset },
  { test: q => /recoating/i.test(q), run: recoatingCandidates },
  { test: q => /remaining life/i.test(q), run: remainingLifeFor },
  { test: q => /prioritas maintenance/i.test(q), run: maintenancePriorities },
  { test: q => /tren corrosion|trend corrosion/i.test(q), run: corrosionTrendSummary },
];

// Returns null if the question doesn't match a canonical pattern (caller should fall back to the LLM).
export async function answerDataQuestion(question) {
  const matcher = MATCHERS.find(m => m.test(question));
  if (!matcher) return null;
  try {
    return await matcher.run(question);
  } catch (err) {
    return { text: `Gagal mengambil data: ${err.message}`, link: null };
  }
}
