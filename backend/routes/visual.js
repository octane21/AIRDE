const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalcAsset } = require('../lib/engine');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visual_inspections ORDER BY inspection_date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visual_inspections WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Visual inspection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { asset_id, inspection_date, kp_location, finding, severity, visual_score, leakage } = req.body;
  if (!asset_id) return res.status(400).json({ error: 'asset_id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO visual_inspections (asset_id, inspection_date, kp_location, finding, severity, visual_score, leakage)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [asset_id, inspection_date || null, kp_location, finding, severity, visual_score, leakage]
    );
    await recalcAsset(asset_id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A reading for this asset, date, and location already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { asset_id, inspection_date, kp_location, finding, severity, visual_score, leakage } = req.body;
  try {
    const result = await pool.query(
      `UPDATE visual_inspections SET asset_id=$1, inspection_date=$2, kp_location=$3, finding=$4,
        severity=$5, visual_score=$6, leakage=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [asset_id, inspection_date || null, kp_location, finding, severity, visual_score, leakage, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Visual inspection not found' });
    await recalcAsset(asset_id);
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A reading for this asset, date, and location already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM visual_inspections WHERE id = $1 RETURNING id, asset_id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Visual inspection not found' });
    await recalcAsset(result.rows[0].asset_id);
    res.json({ message: 'Visual inspection deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
