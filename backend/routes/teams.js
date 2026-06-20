const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { name, lead, member_count, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await pool.query(
      `INSERT INTO teams (name, lead, member_count, notes) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, lead, member_count, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Team already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:name', verifyToken, requireAdmin, async (req, res) => {
  const { lead, member_count, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE teams SET lead=$1, member_count=$2, notes=$3, updated_at=NOW() WHERE name=$4 RETURNING *`,
      [lead, member_count, notes, req.params.name]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Team not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:name', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM teams WHERE name = $1 RETURNING name', [req.params.name]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Team not found' });
    res.json({ message: 'Team deleted', name: result.rows[0].name });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
