const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM findings ORDER BY finding_date DESC, finding_code DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM findings WHERE finding_code = $1', [req.params.code]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Finding not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { finding_code, asset_id, finding_date, kp_location, finding, severity, status, evidence } = req.body;
  if (!finding_code || !asset_id) return res.status(400).json({ error: 'finding_code and asset_id are required' });
  try {
    const result = await pool.query(
      `INSERT INTO findings (finding_code, asset_id, finding_date, kp_location, finding, severity, status, evidence)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [finding_code, asset_id, finding_date || null, kp_location, finding, severity, status || 'Open', evidence]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Finding code already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:code', verifyToken, async (req, res) => {
  const { asset_id, finding_date, kp_location, finding, severity, status, evidence } = req.body;
  try {
    const result = await pool.query(
      `UPDATE findings SET asset_id=$1, finding_date=$2, kp_location=$3, finding=$4,
        severity=$5, status=$6, evidence=$7, updated_at=NOW()
       WHERE finding_code=$8 RETURNING *`,
      [asset_id, finding_date || null, kp_location, finding, severity, status, evidence, req.params.code]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Finding not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:code', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM findings WHERE finding_code = $1 RETURNING finding_code', [req.params.code]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Finding not found' });
    res.json({ message: 'Finding deleted', finding_code: result.rows[0].finding_code });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
