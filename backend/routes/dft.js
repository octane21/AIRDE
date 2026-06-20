const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalcAsset, coatingStatusFromHealth } = require('../lib/engine');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dft_readings ORDER BY reading_date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dft_readings WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'DFT reading not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { asset_id, reading_date, kp_location, dft_target, dft_actual, coating_type } = req.body;
  if (!asset_id || dft_target == null || dft_actual == null) {
    return res.status(400).json({ error: 'asset_id, dft_target and dft_actual are required' });
  }
  try {
    const coating_health = Math.round((dft_actual / dft_target) * 10000) / 100;
    const coating_status = await coatingStatusFromHealth(coating_health);
    const result = await pool.query(
      `INSERT INTO dft_readings (asset_id, reading_date, kp_location, dft_target, dft_actual, coating_health, coating_status, coating_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [asset_id, reading_date || null, kp_location, dft_target, dft_actual, coating_health, coating_status, coating_type]
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
  const { asset_id, reading_date, kp_location, dft_target, dft_actual, coating_type } = req.body;
  try {
    const coating_health = Math.round((dft_actual / dft_target) * 10000) / 100;
    const coating_status = await coatingStatusFromHealth(coating_health);
    const result = await pool.query(
      `UPDATE dft_readings SET asset_id=$1, reading_date=$2, kp_location=$3, dft_target=$4,
        dft_actual=$5, coating_health=$6, coating_status=$7, coating_type=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [asset_id, reading_date || null, kp_location, dft_target, dft_actual, coating_health, coating_status, coating_type, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'DFT reading not found' });
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
    const result = await pool.query('DELETE FROM dft_readings WHERE id = $1 RETURNING id, asset_id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'DFT reading not found' });
    await recalcAsset(result.rows[0].asset_id);
    res.json({ message: 'DFT reading deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
