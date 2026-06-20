const pool = require('../db');

// Hardcoded fallbacks only used if the `config`/`lookup_reference`/`maintenance_strategy`
// tables are ever empty — normal operation always reads from the DB so every number and
// category boundary below can be changed from the Config / Lookup / Maintenance Strategy pages.
const DEFAULT_WEIGHTS = { coating: 0.3, thickness: 0.35, remaining_life: 0.2, visual: 0.15 };
const DEFAULT_POF = { ahiWeight: 0.55, corrosionCap: 0.3, lifePenalty5: 0.15, lifePenalty10: 0.08, coverageWeight: 0.05 };
const DEFAULT_COF = { high: 4, medium: 3, low: 2 };
const DEFAULT_REMAINING_LIFE_CAP = 20;

async function getConfig() {
  const result = await pool.query('SELECT param, value FROM config');
  const map = Object.fromEntries(result.rows.map(r => [r.param, Number(r.value)]));
  return {
    weights: {
      coating: map['Coating Weight'] ?? DEFAULT_WEIGHTS.coating,
      thickness: map['Thickness Weight'] ?? DEFAULT_WEIGHTS.thickness,
      remaining_life: map['Remaining Life Weight'] ?? DEFAULT_WEIGHTS.remaining_life,
      visual: map['Visual Weight'] ?? DEFAULT_WEIGHTS.visual,
    },
    remainingLifeCapYears: map['Remaining Life Cap Years'] ?? DEFAULT_REMAINING_LIFE_CAP,
    pof: {
      ahiWeight: map['PoF AHI Weight'] ?? DEFAULT_POF.ahiWeight,
      corrosionCap: map['PoF Corrosion Cap'] ?? DEFAULT_POF.corrosionCap,
      lifePenalty5: map['PoF Life Penalty Under 5y'] ?? DEFAULT_POF.lifePenalty5,
      lifePenalty10: map['PoF Life Penalty Under 10y'] ?? DEFAULT_POF.lifePenalty10,
      coverageWeight: map['PoF Coverage Weight'] ?? DEFAULT_POF.coverageWeight,
    },
    cof: {
      high: map['CoF High'] ?? DEFAULT_COF.high,
      medium: map['CoF Medium'] ?? DEFAULT_COF.medium,
      low: map['CoF Low'] ?? DEFAULT_COF.low,
    },
  };
}

async function getLookupBands() {
  const result = await pool.query('SELECT category, value, min_value FROM lookup_reference WHERE min_value IS NOT NULL ORDER BY category, min_value DESC');
  const bands = {};
  for (const row of result.rows) {
    if (!bands[row.category]) bands[row.category] = [];
    bands[row.category].push({ value: row.value, min: Number(row.min_value) });
  }
  return bands;
}

function categorize(bands, category, score, fallback) {
  const list = bands[category];
  if (!list || !list.length) return fallback;
  for (const band of list) {
    if (score >= band.min) return band.value;
  }
  return list[list.length - 1].value;
}

function conditionFromAhiSync(ahi) {
  if (ahi >= 90) return 'EXCELLENT';
  if (ahi >= 70) return 'GOOD';
  if (ahi >= 50) return 'FAIR';
  if (ahi >= 30) return 'POOR';
  return 'CRITICAL';
}

function riskLevelFromScoreSync(score) {
  if (score > 2.5) return 'EXTREME';
  if (score > 1.5) return 'HIGH';
  if (score > 0.5) return 'MEDIUM';
  return 'LOW';
}

// Async, DB-driven versions — bands come from the Lookup page (98_Lookup). Fall back to the
// hardcoded thresholds above only if no bands are configured at all.
async function conditionFromAhi(ahi) {
  const bands = await getLookupBands();
  return categorize(bands, 'Health Status', ahi, conditionFromAhiSync(ahi));
}

async function riskLevelFromScore(score) {
  const bands = await getLookupBands();
  return categorize(bands, 'Risk Level', score, riskLevelFromScoreSync(score));
}

async function coatingStatusFromHealth(health) {
  const bands = await getLookupBands();
  return categorize(bands, 'Coating Status', health, health >= 80 ? 'GOOD' : health >= 60 ? 'FAIR' : 'POOR');
}

// UT's per-reading Status — its own Lookup category ("Thickness Status"), separate from
// "Health Status" (which is reserved for AHI/Condition) so tuning one never silently affects
// the other even though they may start out with the same default thresholds.
async function thicknessStatusFromHealth(health) {
  const bands = await getLookupBands();
  return categorize(bands, 'Thickness Status', health, conditionFromAhiSync(health));
}

// AHI = weighted score from Coating Health, Thickness Health, Remaining Life (capped per Config), Visual Score
function computeAssetIntelligence({ coating_health, thickness_health, remaining_life, visual_score, tmin, corrosion_rate }, weights, remainingLifeCapYears) {
  const ch = coating_health ?? 0;
  const th = thickness_health ?? 0;
  const rl = remaining_life ?? 0;
  const vs = visual_score ?? 0;
  const rlScore = Math.min(100, (rl / remainingLifeCapYears) * 100);
  const ahi = Math.round(
    weights.coating * ch + weights.thickness * th + weights.remaining_life * rlScore + weights.visual * vs
  );
  return {
    coating_health: ch,
    thickness_health: th,
    corrosion_rate: corrosion_rate ?? 0,
    tmin: tmin ?? 0,
    remaining_life: rl,
    ahi,
  };
}

// PoF = MIN(1, MAX(0.01, (100-AHI)/100*ahiWeight + MIN(corrosionCap, CorrosionRate) + life-penalty + coverage-penalty))
function computePof({ ahi, corrosion_rate, remaining_life, inspectionCoverage }, pofConfig) {
  const lifePenalty = remaining_life < 5 ? pofConfig.lifePenalty5 : remaining_life < 10 ? pofConfig.lifePenalty10 : 0;
  const coveragePenalty = ((100 - inspectionCoverage * 100) / 100) * pofConfig.coverageWeight;
  const raw = ((100 - ahi) / 100) * pofConfig.ahiWeight + Math.min(pofConfig.corrosionCap, corrosion_rate ?? 0) + lifePenalty + coveragePenalty;
  return Math.min(1, Math.max(0.01, raw));
}

function computeCof(criticality, cofConfig) {
  if (criticality === 'HIGH') return cofConfig.high;
  if (criticality === 'MEDIUM') return cofConfig.medium;
  return cofConfig.low;
}

// Strategy chosen from Risk Level + AHI (structural decision tree, not user-configurable);
// the resulting Action/Priority/DueDays for that strategy ARE configurable via the
// Maintenance Strategy page (18_Maintenance_Strategy).
function strategyFromRisk({ riskLevel, ahi }) {
  if (riskLevel === 'EXTREME') return 'Replacement';
  if (riskLevel === 'HIGH') return ahi < 70 ? 'Predictive' : 'Corrective';
  if (riskLevel === 'MEDIUM') return 'Preventive';
  return 'Monitoring';
}

async function getStrategyDefinitions() {
  const result = await pool.query('SELECT strategy, example_actions, priority, due_days FROM maintenance_strategy');
  return Object.fromEntries(result.rows.map(r => [r.strategy, r]));
}

const FALLBACK_STRATEGY_DEFS = {
  Replacement: { example_actions: 'Pipe/Spool Replacement Study', priority: 'P0', due_days: 30 },
  Predictive: { example_actions: 'Recoating + UT Monitoring', priority: 'P1', due_days: 90 },
  Corrective: { example_actions: 'Clamp Repair / Hotspot Repair', priority: 'P1', due_days: 90 },
  Preventive: { example_actions: 'UT Monitoring + Visual Inspection', priority: 'P2', due_days: 180 },
  Monitoring: { example_actions: 'Routine Monitoring', priority: 'P3', due_days: 365 },
};

function computeActionPlan({ riskLevel, ahi }, strategyDefs) {
  const strategy = strategyFromRisk({ riskLevel, ahi });
  const def = strategyDefs[strategy] || FALLBACK_STRATEGY_DEFS[strategy] || FALLBACK_STRATEGY_DEFS.Monitoring;
  const action = def.example_actions || FALLBACK_STRATEGY_DEFS[strategy]?.example_actions || 'Routine Monitoring';
  const priority = def.priority || FALLBACK_STRATEGY_DEFS[strategy]?.priority || 'P3';
  const dueDays = def.due_days ?? FALLBACK_STRATEGY_DEFS[strategy]?.due_days ?? 365;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + Number(dueDays));

  const status = priority === 'P0' || priority === 'P1' ? 'Open' : 'Planned';

  return { strategy, action, priority, due_date: dueDate.toISOString().slice(0, 10), status };
}

async function getInspectionCoverage() {
  const totalResult = await pool.query('SELECT COUNT(*)::int AS total FROM assets');
  const total = totalResult.rows[0].total || 1;
  const inspectedResult = await pool.query(
    `SELECT COUNT(DISTINCT asset_id)::int AS inspected FROM inspections WHERE status = 'Completed'`
  );
  return inspectedResult.rows[0].inspected / total;
}

// Recompute Asset Intelligence -> Risk Intelligence -> Action Register for one asset
// from its latest DFT / UT / Visual readings, then upsert into risk_data & action_register.
// `shared` (optional) lets recalcAll() fetch config/lookup/strategy once instead of per-asset.
async function recalcAsset(assetId, shared) {
  const [dftResult, utResult, visualResult, assetResult, criticalityResult, cfg, inspectionCoverage, lookupBands, strategyDefs] = await Promise.all([
    pool.query('SELECT * FROM dft_readings WHERE asset_id = $1 ORDER BY reading_date DESC, id DESC LIMIT 1', [assetId]),
    pool.query('SELECT * FROM ut_readings WHERE asset_id = $1 ORDER BY reading_date DESC, id DESC LIMIT 1', [assetId]),
    pool.query('SELECT * FROM visual_inspections WHERE asset_id = $1 ORDER BY inspection_date DESC, id DESC LIMIT 1', [assetId]),
    pool.query('SELECT * FROM assets WHERE id = $1', [assetId]),
    pool.query('SELECT criticality FROM criticality WHERE asset_id = $1', [assetId]),
    shared?.cfg ?? getConfig(),
    shared?.inspectionCoverage ?? getInspectionCoverage(),
    shared?.lookupBands ?? getLookupBands(),
    shared?.strategyDefs ?? getStrategyDefinitions(),
  ]);

  const asset = assetResult.rows[0];
  if (!asset) return null;

  const dft = dftResult.rows[0];
  const ut = utResult.rows[0];
  const visual = visualResult.rows[0];
  // Criticality label (HIGH/MEDIUM/LOW) is entered exclusively on the Criticality page
  // (05_Criticality) — that is the single source of truth CoF reads from.
  const criticalityLabel = criticalityResult.rows[0]?.criticality;

  const intelBase = computeAssetIntelligence({
    coating_health: dft ? Number(dft.coating_health) : 0,
    thickness_health: ut ? Number(ut.thickness_health) : 0,
    corrosion_rate: ut ? Number(ut.corrosion_rate) : 0,
    tmin: ut ? Number(ut.tmin_required) : 0,
    remaining_life: ut ? Number(ut.remaining_life) : 0,
    visual_score: visual ? Number(visual.visual_score) : 0,
  }, cfg.weights, cfg.remainingLifeCapYears);

  const condition = categorize(lookupBands, 'Health Status', intelBase.ahi, conditionFromAhiSync(intelBase.ahi));
  const intel = { ...intelBase, condition };

  const pof = computePof({
    ahi: intel.ahi,
    corrosion_rate: intel.corrosion_rate,
    remaining_life: intel.remaining_life,
    inspectionCoverage,
  }, cfg.pof);
  const cof = computeCof(criticalityLabel, cfg.cof);
  const riskScore = Math.round(pof * cof * 100) / 100;
  const riskLevel = categorize(lookupBands, 'Risk Level', riskScore, riskLevelFromScoreSync(riskScore));

  const visualScore = visual ? Number(visual.visual_score) : 0;

  await pool.query(
    `INSERT INTO risk_data (id, ahi, condition, coating_health, thickness_health, corrosion_rate, tmin, remaining_life, visual_score, pof, cof, risk_score, risk_level, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
     ON CONFLICT (id) DO UPDATE SET
       ahi=$2, condition=$3, coating_health=$4, thickness_health=$5, corrosion_rate=$6,
       tmin=$7, remaining_life=$8, visual_score=$9, pof=$10, cof=$11, risk_score=$12, risk_level=$13, updated_at=NOW()`,
    [assetId, intel.ahi, intel.condition, intel.coating_health, intel.thickness_health,
     intel.corrosion_rate, intel.tmin, intel.remaining_life, visualScore, pof, cof, riskScore, riskLevel]
  );

  const plan = computeActionPlan({ riskLevel, ahi: intel.ahi }, strategyDefs);
  await pool.query(
    `INSERT INTO action_register (id, strategy, action, priority, due_date, status, risk_level, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     ON CONFLICT (id) DO UPDATE SET
       strategy=$2, action=$3, priority=$4, due_date=$5, status=$6, risk_level=$7, updated_at=NOW()`,
    [assetId, plan.strategy, plan.action, plan.priority, plan.due_date, plan.status, riskLevel]
  );

  // Cascade: 19_Maintenance_Action_Plan and 20_Work_Order are mechanically "Linked from Action Register"
  // in the original workbook (one row per asset) — keep them in sync automatically.
  await pool.query(
    `INSERT INTO maintenance_action_plan (asset_id, priority, action, owner, target_date, status, notes, updated_at)
     VALUES ($1,$2,$3,'Integrity Team',$4,$5,'Generated from V20 engine',NOW())
     ON CONFLICT (asset_id) DO UPDATE SET
       priority=$2, action=$3, target_date=$4, status=$5, notes='Generated from V20 engine', updated_at=NOW()`,
    [assetId, plan.priority, plan.action, plan.due_date, plan.status]
  );

  const woStatus = plan.priority === 'P0' ? 'Draft - Urgent' : plan.priority === 'P1' ? 'Draft' : 'Planned';
  const existingWo = await pool.query('SELECT wo_no FROM work_orders WHERE asset_id = $1', [assetId]);
  const woNo = existingWo.rows[0]?.wo_no || `WO-${assetId}`;
  await pool.query(
    `INSERT INTO work_orders (wo_no, asset_id, work_type, description, priority, due_date, status, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
     ON CONFLICT (asset_id) DO UPDATE SET
       work_type=$3, description=$4, priority=$5, due_date=$6, status=$7, updated_at=NOW()`,
    [woNo, assetId, plan.strategy, plan.action, plan.priority, plan.due_date, woStatus]
  );

  return { ahi: intel.ahi, condition: intel.condition, riskScore, riskLevel };
}

async function recalcAll() {
  const assetsResult = await pool.query('SELECT id FROM assets ORDER BY id');
  // Fetch config/lookup/strategy once for the whole batch instead of once per asset.
  const shared = {
    cfg: await getConfig(),
    inspectionCoverage: await getInspectionCoverage(),
    lookupBands: await getLookupBands(),
    strategyDefs: await getStrategyDefinitions(),
  };
  for (const row of assetsResult.rows) {
    await recalcAsset(row.id, shared);
  }

  const summary = await pool.query(`
    SELECT
      ROUND(AVG(ahi), 2) AS avg_ahi,
      ROUND(AVG(corrosion_rate), 4) AS avg_corrosion_rate,
      COUNT(*) FILTER (WHERE risk_level IN ('HIGH','EXTREME'))::int AS high_extreme_count
    FROM risk_data
  `);
  const s = summary.rows[0];
  await pool.query(
    `INSERT INTO trend_snapshots (snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count)
     VALUES (CURRENT_DATE, $1, $2, $3)
     ON CONFLICT (snapshot_date) DO UPDATE SET
       avg_corrosion_rate=$1, avg_ahi=$2, high_extreme_count=$3`,
    [s.avg_corrosion_rate, s.avg_ahi, s.high_extreme_count]
  );

  return { assetsProcessed: assetsResult.rows.length, ...s };
}

module.exports = {
  recalcAsset, recalcAll, getInspectionCoverage,
  computeCof, riskLevelFromScore, conditionFromAhi, coatingStatusFromHealth, thicknessStatusFromHealth,
};
