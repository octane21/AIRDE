const router = require('express').Router();
const pool = require('../db');
const { getInspectionCoverage } = require('../lib/engine');

function kpiStatus(actual, target, comparator) {
  return comparator(actual, target) ? 'On Track' : 'Need Action';
}

// Most recent CRUD activity across every table that tracks a timestamp — drives the
// header's "LAST UPDATE" so it reflects any change anywhere, not just on `assets`.
router.get('/last-update', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT MAX(ts) AS last_update FROM (
        SELECT MAX(updated_at) AS ts FROM action_register
        UNION ALL SELECT MAX(updated_at) FROM assets
        UNION ALL SELECT MAX(updated_at) FROM criticality
        UNION ALL SELECT MAX(updated_at) FROM dft_readings
        UNION ALL SELECT MAX(updated_at) FROM findings
        UNION ALL SELECT MAX(updated_at) FROM inspections
        UNION ALL SELECT MAX(updated_at) FROM maintenance_action_plan
        UNION ALL SELECT MAX(updated_at) FROM report_sections
        UNION ALL SELECT MAX(updated_at) FROM risk_data
        UNION ALL SELECT MAX(updated_at) FROM ut_readings
        UNION ALL SELECT MAX(updated_at) FROM visual_inspections
        UNION ALL SELECT MAX(updated_at) FROM work_orders
        UNION ALL SELECT MAX(created_at) FROM photos
        UNION ALL SELECT MAX(created_at) FROM trend_snapshots
      ) t
    `);
    res.json({ lastUpdate: result.rows[0].last_update });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/kpi', async (req, res) => {
  try {
    const [avgAhiResult, highExtremeResult, openActionsResult, coverage] = await Promise.all([
      pool.query('SELECT ROUND(AVG(ahi), 0) AS avg_ahi FROM risk_data'),
      pool.query(`SELECT COUNT(*)::int AS cnt FROM risk_data WHERE risk_level IN ('HIGH','EXTREME')`),
      pool.query(`SELECT COUNT(*)::int AS cnt FROM action_register WHERE priority IN ('P0','P1') AND status = 'Open'`),
      getInspectionCoverage(),
    ]);

    const avgAhi = Number(avgAhiResult.rows[0].avg_ahi) || 0;
    const highExtreme = highExtremeResult.rows[0].cnt;
    const openActions = openActionsResult.rows[0].cnt;
    const coveragePct = Math.round(coverage * 1000) / 10;

    res.json([
      { kpi: 'Average AHI', actual: avgAhi, target: '>=75', status: kpiStatus(avgAhi, 75, (a, t) => a >= t) },
      { kpi: 'High/Extreme Risk Assets', actual: highExtreme, target: '<=3', status: kpiStatus(highExtreme, 3, (a, t) => a <= t) },
      { kpi: 'Inspection Coverage', actual: `${coveragePct}%`, target: '>=80%', status: kpiStatus(coveragePct, 80, (a, t) => a >= t) },
      { kpi: 'Open P0/P1 Actions', actual: openActions, target: '<=5', status: kpiStatus(openActions, 5, (a, t) => a <= t) },
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/trend', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trend_snapshots ORDER BY snapshot_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/analytics', async (req, res) => {
  try {
    const [topRisk, avgAhi, criticalityBreakdown] = await Promise.all([
      pool.query(`SELECT id, risk_score, risk_level FROM risk_data ORDER BY risk_score DESC LIMIT 3`),
      pool.query('SELECT ROUND(AVG(ahi), 0) AS avg_ahi FROM risk_data'),
      pool.query('SELECT criticality, COUNT(*)::int AS cnt FROM criticality GROUP BY criticality'),
    ]);

    const insights = [];
    const ahi = Number(avgAhi.rows[0].avg_ahi) || 0;
    insights.push({
      category: 'Asset Health',
      insight: `Average AHI is ${ahi >= 70 ? 'GOOD' : ahi >= 50 ? 'FAIR' : 'POOR'} at ${ahi}`,
      follow_up: 'Maintain inspection program',
    });

    const riskAssets = topRisk.rows.filter(r => r.risk_level === 'HIGH' || r.risk_level === 'EXTREME');
    insights.push({
      category: 'Risk',
      insight: `${riskAssets.length} assets are High/Extreme`,
      follow_up: riskAssets.length
        ? `Focus mitigation on ${riskAssets.map(r => r.id).join(' and ')}`
        : 'No immediate action required',
    });

    const breakdown = criticalityBreakdown.rows.map(r => `${r.criticality}: ${r.cnt}`).join(', ');
    insights.push({
      category: 'Criticality',
      insight: `Asset criticality distribution — ${breakdown}`,
      follow_up: 'Prioritize HIGH criticality assets for inspection scheduling',
    });

    res.json(insights);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/overview', async (req, res) => {
  try {
    const [riskLevels, conditions, criticalities, byLocation, byService] = await Promise.all([
      pool.query(`SELECT risk_level, COUNT(*)::int AS cnt FROM risk_data GROUP BY risk_level`),
      pool.query(`SELECT condition, COUNT(*)::int AS cnt FROM risk_data GROUP BY condition`),
      pool.query(`SELECT criticality, COUNT(*)::int AS cnt FROM criticality GROUP BY criticality`),
      pool.query(`SELECT a.location, ROUND(AVG(r.ahi), 1) AS avg_ahi, COUNT(*)::int AS cnt
                  FROM assets a LEFT JOIN risk_data r ON r.id = a.id GROUP BY a.location ORDER BY a.location`),
      pool.query(`SELECT a.service, ROUND(AVG(r.ahi), 1) AS avg_ahi, COUNT(*)::int AS cnt
                  FROM assets a LEFT JOIN risk_data r ON r.id = a.id GROUP BY a.service ORDER BY a.service`),
    ]);

    res.json({
      riskLevels: riskLevels.rows,
      conditions: conditions.rows,
      criticalities: criticalities.rows,
      byLocation: byLocation.rows,
      byService: byService.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
