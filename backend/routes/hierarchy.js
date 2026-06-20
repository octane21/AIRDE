const router = require('express').Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/hierarchy — public — derived from assets (04_Hierarchy: System/Sub-System/Line/Asset ID)
// System/Sub-System/Line/Status are derived from Asset Register (edit there). Segment is the
// only field native to this sheet (manually assigned, not computed) — editable below.
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id AS asset_id, location AS system, service AS sub_system, line, segment, status
       FROM assets ORDER BY location, service, line, id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/hierarchy/:assetId — protected — edit Segment only
router.put('/:assetId', verifyToken, async (req, res) => {
  const { segment } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assets SET segment = $1, updated_at = NOW() WHERE id = $2
       RETURNING id AS asset_id, location AS system, service AS sub_system, line, segment, status`,
      [segment, req.params.assetId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Asset not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
