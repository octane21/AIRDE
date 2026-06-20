const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/risks — public — mirrors 13_Risk_Intelligence (includes asset location)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, a.location FROM risk_data r LEFT JOIN assets a ON a.id = r.id ORDER BY r.id`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/risks/:id — public
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, a.location FROM risk_data r LEFT JOIN assets a ON a.id = r.id WHERE r.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Risk data not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/risks — protected
router.post('/', verifyToken, async (req, res) => {
  const { id, ahi, condition, coating_health, thickness_health, corrosion_rate,
          tmin, remaining_life, visual_score, pof, cof, risk_score, risk_level } = req.body;
  if (!id) return res.status(400).json({ error: 'Asset id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO risk_data (id,ahi,condition,coating_health,thickness_health,
        corrosion_rate,tmin,remaining_life,visual_score,pof,cof,risk_score,risk_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [id, ahi, condition, coating_health, thickness_health,
       corrosion_rate, tmin, remaining_life, visual_score, pof, cof, risk_score, risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Risk data for this asset already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/risks/:id — protected
router.put('/:id', verifyToken, async (req, res) => {
  const { ahi, condition, coating_health, thickness_health, corrosion_rate,
          tmin, remaining_life, visual_score, pof, cof, risk_score, risk_level } = req.body;
  try {
    const result = await pool.query(
      `UPDATE risk_data SET ahi=$1,condition=$2,coating_health=$3,thickness_health=$4,
        corrosion_rate=$5,tmin=$6,remaining_life=$7,visual_score=$8,pof=$9,cof=$10,risk_score=$11,
        risk_level=$12,updated_at=NOW()
       WHERE id=$13 RETURNING *`,
      [ahi, condition, coating_health, thickness_health, corrosion_rate,
       tmin, remaining_life, visual_score, pof, cof, risk_score, risk_level, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Risk data not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/risks/:id — admin only
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM risk_data WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Risk data not found' });
    res.json({ message: 'Risk data deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
