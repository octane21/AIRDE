import {
  assetsApi, risksApi, actionsApi, dftApi, findingsApi,
  inspectionsApi, statsApi, maintenanceStrategyApi, teamsApi,
  maintenancePlanApi, workOrdersApi, configApi, lookupApi, formulaMapApi,
} from '../services/api';

// Builds the AI Assistant's system-prompt context straight from the live Postgres database
// (via the same REST API the dashboard pages use) instead of a stale bundled JSON snapshot.
// Keyword-based retrieval keeps each request small: only the sections relevant to the user's
// question are fetched and included, plus a portfolio overview is always prepended for general
// grounding.

export function extractAssetIds(text) {
  const matches = String(text).toUpperCase().match(/PL[-\s]?\d{2,4}/g) || [];
  return [...new Set(matches.map((m) => {
    const num = m.replace(/[^\d]/g, '').padStart(3, '0');
    return `PL-${num}`;
  }))];
}

export function extractInspectionTeam(text) {
  const match = String(text).toUpperCase().match(/\b(?:TEAM|TIM)\s*([A-Z])\b/);
  return match ? `Team ${match[1]}` : null;
}

function fmtNum(v, d = 1) {
  return v == null ? '-' : Number(v).toFixed(d);
}

function locationMap(assets) {
  return Object.fromEntries(assets.map((a) => [a.id, a.location]));
}

// === Per-asset full detail (one API call already aggregates everything) ===
export async function formatAssetDetail(assetId) {
  let full;
  try {
    full = await assetsApi.getFull(assetId);
  } catch {
    return `Asset ${assetId} tidak ditemukan.`;
  }
  const { asset, criticality, risk, action, dftHistory, utHistory, visualHistory, findings, inspections, plans, workOrders } = full;
  const dft = dftHistory?.[0];
  const ut = utHistory?.[0];
  const visual = visualHistory?.[0];
  const lastInspection = inspections?.[0];
  const lastPlan = plans?.[0];
  const lastWorkOrder = workOrders?.[0];
  const openFindings = (findings || []).filter((f) => f.status === 'Open');

  const lines = [
    `=== DETAIL ASET ${asset.id} ===`,
    `Line: ${asset.line} | Lokasi: ${asset.location} | Service: ${asset.service} | Status: ${asset.status} | Segment (Hierarchy): ${asset.segment || '-'}`,
    `Spesifikasi: NPS ${asset.nps}", OD ${asset.od}mm, Material ${asset.material}, Install Year ${asset.install_year}, Operating Pressure ${asset.op_pressure} bar, Design Pressure ${asset.des_pressure} bar, CA ${asset.ca}mm`,
    criticality
      ? `Criticality: ${criticality.criticality} (Safety ${criticality.safety}, Environment ${criticality.environment}, Operation ${criticality.operation}, Financial ${criticality.financial})`
      : 'Criticality: belum dinilai.',
    risk
      ? `Asset Health Index (AHI): ${risk.ahi} - Condition: ${risk.condition} | PoF ${fmtNum(risk.pof, 2)}, CoF ${risk.cof}, Risk Score ${fmtNum(risk.risk_score, 2)}, Risk Level ${risk.risk_level}`
      : 'Risk: belum dihitung.',
    dft
      ? `Coating (DFT terakhir, ${String(dft.reading_date).slice(0, 10)}): Aktual ${dft.dft_actual}µm / Target ${dft.dft_target}µm, Health ${fmtNum(dft.coating_health)}%, Status ${dft.coating_status}`
      : 'Coating: belum ada data DFT.',
    ut
      ? `Thickness (UT terakhir, ${String(ut.reading_date).slice(0, 10)}): T Actual Min ${ut.t_actual_min}mm, Tmin Required ${ut.tmin_required}mm, Health ${fmtNum(ut.thickness_health)}%, Corrosion Rate ${fmtNum(ut.corrosion_rate, 3)} mm/tahun, Remaining Life ${fmtNum(ut.remaining_life)} tahun, Status ${ut.ut_status}`
      : 'Thickness: belum ada data UT.',
    visual
      ? `Visual Inspection terakhir (${String(visual.inspection_date).slice(0, 10)}): ${visual.finding} (Severity ${visual.severity}, Score ${visual.visual_score}, Leakage: ${visual.leakage})`
      : 'Visual Inspection: belum ada data.',
    lastInspection
      ? `Inspeksi terakhir: ${String(lastInspection.inspection_date).slice(0, 10)} oleh ${lastInspection.inspector}, metode ${lastInspection.method}, status ${lastInspection.status}`
      : 'Inspeksi: belum ada data.',
    action
      ? `Rekomendasi: Strategi ${action.strategy}, Aksi "${action.action}", Priority ${action.priority}, Due Date ${String(action.due_date).slice(0, 10)}, Status ${action.status}`
      : 'Rekomendasi: belum ada action register.',
    lastPlan
      ? `Maintenance Action Plan: "${lastPlan.action}", Owner ${lastPlan.owner}, Target ${String(lastPlan.target_date).slice(0, 10)}, Status ${lastPlan.status}`
      : 'Maintenance Action Plan: belum ada.',
    lastWorkOrder
      ? `Work Order: ${lastWorkOrder.wo_no} - ${lastWorkOrder.work_type} "${lastWorkOrder.description}", Due ${String(lastWorkOrder.due_date).slice(0, 10)}, Status ${lastWorkOrder.status}`
      : 'Work Order: belum ada.',
  ];

  if (openFindings.length) {
    lines.push('Findings terbuka:');
    openFindings.forEach((f) => lines.push(`  - ${f.finding_code} (${String(f.finding_date).slice(0, 10)}): ${f.finding}, Severity ${f.severity}`));
  } else {
    lines.push('Findings: tidak ada temuan terbuka.');
  }

  return lines.join('\n');
}

// === Portfolio-wide overview (always included for general grounding) ===
export async function formatPortfolioOverview() {
  const [kpi, overview] = await Promise.all([statsApi.kpi(), statsApi.overview()]);
  const kpiLines = kpi.map((k) => `  - ${k.kpi}: ${k.actual} (target ${k.target}, status ${k.status})`).join('\n');
  const riskLines = overview.riskLevels.map((r) => `${r.risk_level}: ${r.cnt}`).join(', ');
  const conditionLines = overview.conditions.map((c) => `${c.condition}: ${c.cnt}`).join(', ');
  return [
    '=== RINGKASAN PORTFOLIO AIRDE PIPELINE INTEGRITY (data live dari database) ===',
    `Distribusi Risk Level: ${riskLines}`,
    `Distribusi Condition (AHI): ${conditionLines}`,
    `KPI Utama:\n${kpiLines}`,
  ].join('\n');
}

async function topCriticalSection() {
  const [risks, assets] = await Promise.all([risksApi.list(), assetsApi.list()]);
  const loc = locationMap(assets);
  const top = [...risks].sort((a, b) => b.risk_score - a.risk_score).slice(0, 5);
  const lines = top.map((r) => `  - ${r.id} (${loc[r.id] || '-'}) | AHI ${r.ahi} (${r.condition}) | Risk Score ${fmtNum(r.risk_score, 2)} (${r.risk_level}) | Remaining Life ${fmtNum(r.remaining_life)} thn`);
  return '=== TOP 5 ASET PALING KRITIS (berdasarkan Risk Score) ===\n' + lines.join('\n');
}

async function recoatingSection() {
  const dftRows = await dftApi.list();
  // dft list is ordered by reading_date DESC — first occurrence per asset_id is the latest reading.
  const latestByAsset = {};
  for (const d of dftRows) {
    if (!latestByAsset[d.asset_id]) latestByAsset[d.asset_id] = d;
  }
  const poor = Object.values(latestByAsset).filter((d) => d.coating_status === 'POOR' || d.coating_status === 'FAIR')
    .sort((a, b) => Number(a.coating_health) - Number(b.coating_health));
  if (!poor.length) return '=== ASET YANG PERLU PERHATIAN COATING ===\nTidak ada aset dengan Coating Status POOR/FAIR saat ini.';
  const lines = poor.slice(0, 15).map((d) => `  - ${d.asset_id} | Coating Health ${fmtNum(d.coating_health)}% | Status ${d.coating_status} | Reading terakhir ${String(d.reading_date).slice(0, 10)}`);
  return `=== ASET YANG PERLU PERHATIAN COATING (status POOR/FAIR), total ${poor.length} ===\n` + lines.join('\n');
}

async function remainingLifeSection() {
  const [risks, assets] = await Promise.all([risksApi.list(), assetsApi.list()]);
  const loc = locationMap(assets);
  const sorted = [...risks].sort((a, b) => Number(a.remaining_life) - Number(b.remaining_life)).slice(0, 5);
  const lines = sorted.map((r) => `  - ${r.id} (${loc[r.id] || '-'}) | Remaining Life ${fmtNum(r.remaining_life)} thn | Corrosion Rate ${fmtNum(r.corrosion_rate, 3)} mm/y | AHI ${r.ahi}`);
  return '=== 5 ASET DENGAN REMAINING LIFE TERPENDEK ===\n' + lines.join('\n');
}

async function maintenanceSection() {
  const [definitions, actions] = await Promise.all([maintenanceStrategyApi.list(), actionsApi.list()]);
  const urgent = actions.filter((a) => a.priority === 'P0' || a.priority === 'P1');
  const defLines = definitions.map((s) => `  - ${s.strategy}: ${s.definition} (kondisi tipikal: ${s.typical_condition})`).join('\n');
  const urgentLines = urgent.slice(0, 15).map((a) => `  - ${a.id} | ${a.strategy} | "${a.action}" | Priority ${a.priority} | Due ${String(a.due_date).slice(0, 10)} | Status ${a.status}`).join('\n');
  return [
    '=== DEFINISI STRATEGI MAINTENANCE ===',
    defLines,
    `=== ACTION REGISTER PRIORITAS P0/P1 (total ${urgent.length}) ===`,
    urgentLines || '  (tidak ada)',
  ].join('\n');
}

async function trendSection() {
  const trend = await statsApi.trend();
  const sorted = [...trend].sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));
  const lines = sorted.map((t) => `  - ${String(t.snapshot_date).slice(0, 10)}: Corrosion Rate ${fmtNum(t.avg_corrosion_rate, 3)} mm/y, AHI ${fmtNum(t.avg_ahi, 0)}, High/Extreme Count ${t.high_extreme_count}`);
  return '=== TREN (Corrosion Rate, AHI, Risk Count) ===\n' + lines.join('\n');
}

async function findingsSection() {
  const findings = await findingsApi.list();
  const open = findings.filter((f) => f.status === 'Open');
  const lines = open.slice(0, 20).map((f) => `  - ${f.finding_code} | Asset ${f.asset_id} (${String(f.finding_date).slice(0, 10)}): ${f.finding}, Severity ${f.severity}`);
  return `=== TEMUAN TERBUKA (Open Findings), total ${open.length} ===\n` + (lines.join('\n') || '  (tidak ada)');
}

// === Inspection Teams (roster) — who leads each team, how many members, notes ===
async function teamsSection() {
  const teams = await teamsApi.list();
  if (!teams.length) return '=== INSPECTION TEAM ===\nBelum ada tim terdaftar.';
  const lines = teams.map((t) => `  - ${t.name} | Lead: ${t.lead || '-'} | Anggota: ${t.member_count ?? '-'} | Catatan: ${t.notes || '-'}`);
  return '=== INSPECTION TEAM (roster) ===\n' + lines.join('\n');
}

async function workOrderSection() {
  const orders = await workOrdersApi.list();
  const statusCount = {};
  for (const o of orders) statusCount[o.status] = (statusCount[o.status] || 0) + 1;
  const statusLines = Object.entries(statusCount).map(([s, c]) => `${s}: ${c}`).join(', ');
  const openOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Closed').slice(0, 15);
  const lines = openOrders.map((o) => `  - ${o.wo_no} | Asset ${o.asset_id} | ${o.work_type} | "${o.description}" | Priority ${o.priority} | Due ${String(o.due_date).slice(0, 10)} | Status ${o.status}`);
  return [
    `=== WORK ORDER, total ${orders.length} (${statusLines}) ===`,
    lines.join('\n') || '  (tidak ada work order terbuka)',
  ].join('\n');
}

async function maintenancePlanSection() {
  const plans = await maintenancePlanApi.list();
  const open = plans.filter((p) => p.status !== 'Completed' && p.status !== 'Closed').slice(0, 15);
  const lines = open.map((p) => `  - Asset ${p.asset_id} | Priority ${p.priority} | "${p.action}" | Owner ${p.owner} | Target ${String(p.target_date).slice(0, 10)} | Status ${p.status}`);
  return [
    `=== MAINTENANCE ACTION PLAN, total ${plans.length} ===`,
    lines.join('\n') || '  (tidak ada rencana terbuka)',
  ].join('\n');
}

async function configSection() {
  const config = await configApi.list();
  const lines = config.map((c) => `  - ${c.param}: ${c.value}${c.notes ? ` (${c.notes})` : ''}`);
  return '=== CONFIG ENGINE (bobot/parameter kalkulasi AHI/PoF/CoF) ===\n' + lines.join('\n');
}

async function lookupSection() {
  const lookup = await lookupApi.list();
  const byCategory = {};
  for (const l of lookup) {
    if (!byCategory[l.category]) byCategory[l.category] = [];
    byCategory[l.category].push(l);
  }
  const lines = Object.entries(byCategory).map(([cat, rows]) => {
    const bands = rows.sort((a, b) => Number(b.min_value) - Number(a.min_value))
      .map((r) => `${r.value} (${r.min_value}-${r.max_value})`).join(', ');
    return `  - ${cat}: ${bands}`;
  });
  return '=== LOOKUP REFERENCE (ambang batas kategori) ===\n' + lines.join('\n');
}

async function formulaMapSection() {
  const formulas = await formulaMapApi.list();
  const lines = formulas.map((f) => `  - [${f.sheet}] ${f.engine}: ${f.formula} — Tujuan: ${f.purpose}${f.feeds_to ? `, mengalir ke: ${f.feeds_to}` : ''}`);
  return '=== FORMULA MAP (definisi rumus engine) ===\n' + lines.join('\n');
}

async function inspectionSection(userMessage, msg) {
  const inspections = await inspectionsApi.list();
  const team = extractInspectionTeam(userMessage);

  if (team) {
    const teamRows = inspections.filter((i) => i.inspector?.toUpperCase() === team.toUpperCase());
    const lines = teamRows.slice(0, 20).map((i) => `  - ${i.asset_id} | ${i.inspection_code} | ${String(i.inspection_date).slice(0, 10)} | ${i.method} | Status ${i.status}`);
    return `=== ASET YANG DIINSPEKSI OLEH ${team.toUpperCase()}, total ${teamRows.length} ===\n` + (lines.join('\n') || '  (tidak ada)');
  }
  if (/pending|belum/.test(msg)) {
    const pending = inspections.filter((i) => i.status === 'Pending');
    const lines = pending.slice(0, 20).map((i) => `  - ${i.asset_id} | ${i.inspection_code} | ${String(i.inspection_date).slice(0, 10)}`);
    return `=== INSPEKSI STATUS PENDING, total ${pending.length} ===\n` + (lines.join('\n') || '  (tidak ada)');
  }
  if (/selesai|completed|sudah/.test(msg)) {
    const completed = inspections.filter((i) => i.status === 'Completed');
    const lines = completed.slice(0, 20).map((i) => `  - ${i.asset_id} | ${i.inspection_code} | ${String(i.inspection_date).slice(0, 10)} | Inspector ${i.inspector}`);
    return `=== INSPEKSI STATUS COMPLETED, total ${completed.length} ===\n` + (lines.join('\n') || '  (tidak ada)');
  }
  const summary = {};
  for (const i of inspections) {
    const t = i.inspector || 'Unknown';
    if (!summary[t]) summary[t] = { total: 0, completed: 0, pending: 0 };
    summary[t].total += 1;
    if (i.status === 'Completed') summary[t].completed += 1;
    if (i.status === 'Pending') summary[t].pending += 1;
  }
  const lines = Object.entries(summary).map(([t, s]) => `  - ${t}: menangani ${s.total} aset (Completed: ${s.completed}, Pending: ${s.pending})`);
  return '=== RINGKASAN TIM INSPEKSI ===\n' + lines.join('\n');
}

/**
 * Main entry point: given the user's latest message, fetch only the live-data sections
 * relevant to it and return a single text block ready to inject into the system prompt.
 */
export async function buildLiveContext(userMessage) {
  const msg = String(userMessage || '').toLowerCase();
  const sections = [];

  const ids = extractAssetIds(userMessage);
  if (ids.length) {
    const details = await Promise.all(ids.map((id) => formatAssetDetail(id)));
    sections.push(...details);
  }

  const tasks = [];
  if (/kritis|paling.*(risiko|risk)|top.*(risk|critical)/.test(msg)) tasks.push(topCriticalSection());
  if (/recoat|coating/.test(msg)) tasks.push(recoatingSection());
  if (/remaining life|umur (sisa|pakai)|sisa umur/.test(msg) && !ids.length) tasks.push(remainingLifeSection());
  if (/prioritas|maintenance|strategi/.test(msg)) tasks.push(maintenanceSection());
  if (/tren|trend|corrosion rate/.test(msg)) tasks.push(trendSection());
  if (/temuan|finding/.test(msg) && !ids.length) tasks.push(findingsSection());
  if (/inspeksi|inspect|inspector|inspektor|\btim\b|\bteam\b/.test(msg) && !ids.length) {
    tasks.push(inspectionSection(userMessage, msg));
    tasks.push(teamsSection());
  }
  if (/work order|\bwo\b/.test(msg)) tasks.push(workOrderSection());
  if (/maintenance plan|rencana (pemeliharaan|tindakan|aksi)/.test(msg)) tasks.push(maintenancePlanSection());
  if (/\bconfig\b|bobot|weight|parameter (engine|kalkulasi)/.test(msg)) tasks.push(configSection());
  if (/lookup|ambang batas|threshold|kategori (risk|health|coating|thickness)/.test(msg)) tasks.push(lookupSection());
  if (/formula|rumus/.test(msg)) tasks.push(formulaMapSection());

  if (tasks.length) sections.push(...(await Promise.all(tasks)));

  const overview = await formatPortfolioOverview();
  if (sections.length === 0) sections.push(overview);
  else sections.unshift(overview);

  return sections.join('\n\n');
}
