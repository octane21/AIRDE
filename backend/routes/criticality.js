const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalcAsset } = require('../lib/engine');

// Safety/Environment/Operation/Financial scores AND the Criticality label (05_Criticality) are
// entered exclusively from this page — Asset Register no longer shows/edits Criticality.
// The Criticality label here is what the engine uses for CoF (see lib/engine.js).

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM criticality ORDER BY asset_id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:assetId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM criticality WHERE asset_id = $1', [req.params.assetId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Criticality data not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { asset_id, safety, environment, operation, financial, criticality } = req.body;
  if (!asset_id) return res.status(400).json({ error: 'asset_id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO criticality (asset_id, safety, environment, operation, financial, criticality)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [asset_id, safety, environment, operation, financial, criticality]
    );
    await recalcAsset(asset_id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Criticality data for this asset already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:assetId', verifyToken, async (req, res) => {
  const { safety, environment, operation, financial, criticality } = req.body;
  try {
    const result = await pool.query(
      `UPDATE criticality SET safety=$1, environment=$2, operation=$3, financial=$4, criticality=$5, updated_at=NOW()
       WHERE asset_id=$6 RETURNING *`,
      [safety, environment, operation, financial, criticality, req.params.assetId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Criticality data not found' });
    await recalcAsset(req.params.assetId);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:assetId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM criticality WHERE asset_id = $1 RETURNING asset_id', [req.params.assetId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Criticality data not found' });
    await recalcAsset(req.params.assetId);
    res.json({ message: 'Criticality data deleted', asset_id: result.rows[0].asset_id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
