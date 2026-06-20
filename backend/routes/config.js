const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM config ORDER BY param');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:param', verifyToken, requireAdmin, async (req, res) => {
  const { value, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE config SET value=$1, notes=COALESCE($2, notes) WHERE param=$3 RETURNING *`,
      [value, notes || null, req.params.param]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Config param not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
