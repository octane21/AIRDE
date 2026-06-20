const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/trend — public — sheet 16_Trend
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trend_snapshots ORDER BY snapshot_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count } = req.body;
  if (!snapshot_date) return res.status(400).json({ error: 'snapshot_date is required' });
  try {
    const result = await pool.query(
      `INSERT INTO trend_snapshots (snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count } = req.body;
  try {
    const result = await pool.query(
      `UPDATE trend_snapshots SET snapshot_date=$1, avg_corrosion_rate=$2, avg_ahi=$3, high_extreme_count=$4
       WHERE id=$5 RETURNING *`,
      [snapshot_date, avg_corrosion_rate, avg_ahi, high_extreme_count, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Trend snapshot not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM trend_snapshots WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Trend snapshot not found' });
    res.json({ message: 'Trend snapshot deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
