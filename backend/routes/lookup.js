const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/lookup — public — sheet 98_Lookup
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lookup_reference ORDER BY category, id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { category, value, description, min_value, max_value } = req.body;
  if (!category || !value) return res.status(400).json({ error: 'category and value are required' });
  try {
    const result = await pool.query(
      `INSERT INTO lookup_reference (category, value, description, min_value, max_value) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [category, value, description, min_value, max_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { category, value, description, min_value, max_value } = req.body;
  try {
    const result = await pool.query(
      `UPDATE lookup_reference SET category=$1, value=$2, description=$3, min_value=$4, max_value=$5 WHERE id=$6 RETURNING *`,
      [category, value, description, min_value, max_value, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Lookup entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM lookup_reference WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Lookup entry not found' });
    res.json({ message: 'Lookup entry deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
