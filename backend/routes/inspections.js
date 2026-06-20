const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspections ORDER BY inspection_date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inspections WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Inspection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { inspection_code, asset_id, inspection_date, inspector, method, kp_location, status, remarks } = req.body;
  if (!inspection_code || !asset_id) {
    return res.status(400).json({ error: 'inspection_code and asset_id are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO inspections (inspection_code, asset_id, inspection_date, inspector, method, kp_location, status, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [inspection_code, asset_id, inspection_date || null, inspector, method, kp_location, status || 'Pending', remarks]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Inspection code already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { asset_id, inspection_date, inspector, method, kp_location, status, remarks } = req.body;
  try {
    const result = await pool.query(
      `UPDATE inspections SET asset_id=$1, inspection_date=$2, inspector=$3, method=$4,
        kp_location=$5, status=$6, remarks=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [asset_id, inspection_date || null, inspector, method, kp_location, status, remarks, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Inspection not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inspections WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Inspection not found' });
    res.json({ message: 'Inspection deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
