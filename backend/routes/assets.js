const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/assets — public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/assets/:id — public
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/assets/:id/full — public — Asset 360° aggregate view
router.get('/:id/full', async (req, res) => {
  const { id } = req.params;
  try {
    const [asset, criticality, risk, action, plan, photos, inspections, dftHistory, utHistory, visualHistory, findings, workOrders] = await Promise.all([
      pool.query('SELECT * FROM assets WHERE id = $1', [id]),
      pool.query('SELECT * FROM criticality WHERE asset_id = $1', [id]),
      pool.query('SELECT r.*, a.location FROM risk_data r LEFT JOIN assets a ON a.id = r.id WHERE r.id = $1', [id]),
      pool.query('SELECT * FROM action_register WHERE id = $1', [id]),
      pool.query('SELECT * FROM maintenance_action_plan WHERE asset_id = $1 ORDER BY id DESC', [id]),
      pool.query('SELECT * FROM photos WHERE asset_id = $1 ORDER BY created_at DESC', [id]),
      pool.query('SELECT * FROM inspections WHERE asset_id = $1 ORDER BY inspection_date DESC', [id]),
      pool.query('SELECT * FROM dft_readings WHERE asset_id = $1 ORDER BY reading_date DESC', [id]),
      pool.query('SELECT * FROM ut_readings WHERE asset_id = $1 ORDER BY reading_date DESC', [id]),
      pool.query('SELECT * FROM visual_inspections WHERE asset_id = $1 ORDER BY inspection_date DESC', [id]),
      pool.query("SELECT * FROM findings WHERE asset_id = $1 ORDER BY finding_date DESC", [id]),
      pool.query('SELECT * FROM work_orders WHERE asset_id = $1 ORDER BY due_date DESC', [id]),
    ]);

    if (!asset.rows[0]) return res.status(404).json({ error: 'Asset not found' });

    res.json({
      asset: asset.rows[0],
      criticality: criticality.rows[0] || null,
      risk: risk.rows[0] || null,
      action: action.rows[0] || null,
      plans: plan.rows,
      workOrders: workOrders.rows,
      photos: photos.rows,
      inspections: inspections.rows,
      dftHistory: dftHistory.rows,
      utHistory: utHistory.rows,
      visualHistory: visualHistory.rows,
      findings: findings.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/assets — protected (admin or operator)
// T Design is owned by the UT page (08_UT, per reading) and DFT Target by the DFT page
// (07_DFT, per reading) — not collected here, to avoid two places editing the same concept.
router.post('/', verifyToken, async (req, res) => {
  const { id, line, location, service, nps, od, material, install_year,
          op_pressure, des_pressure, ca, status } = req.body;
  if (!id || !line || !location) {
    return res.status(400).json({ error: 'id, line, and location are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO assets (id,line,location,service,nps,od,material,install_year,
        op_pressure,des_pressure,ca,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, line, location, service, nps, od, material, install_year,
       op_pressure, des_pressure, ca, status || 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Asset ID already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/assets/:id — protected (admin or operator)
router.put('/:id', verifyToken, async (req, res) => {
  const { line, location, service, nps, od, material, install_year,
          op_pressure, des_pressure, ca, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assets SET line=$1,location=$2,service=$3,nps=$4,od=$5,material=$6,
        install_year=$7,op_pressure=$8,des_pressure=$9,ca=$10,
        status=$11,updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [line, location, service, nps, od, material, install_year,
       op_pressure, des_pressure, ca, status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/assets/:id — admin only
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json({ message: 'Asset deleted', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
