const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_strategy ORDER BY strategy');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { strategy, definition, typical_condition, example_actions, priority, due_days } = req.body;
  if (!strategy) return res.status(400).json({ error: 'strategy is required' });
  try {
    const result = await pool.query(
      `INSERT INTO maintenance_strategy (strategy, definition, typical_condition, example_actions, priority, due_days)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [strategy, definition, typical_condition, example_actions, priority, due_days]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Strategy already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:strategy', verifyToken, requireAdmin, async (req, res) => {
  const { definition, typical_condition, example_actions, priority, due_days } = req.body;
  try {
    const result = await pool.query(
      `UPDATE maintenance_strategy SET definition=$1, typical_condition=$2, example_actions=$3, priority=$4, due_days=$5
       WHERE strategy=$6 RETURNING *`,
      [definition, typical_condition, example_actions, priority, due_days, req.params.strategy]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Strategy not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:strategy', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_strategy WHERE strategy = $1 RETURNING strategy', [req.params.strategy]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Strategy not found' });
    res.json({ message: 'Strategy deleted', strategy: result.rows[0].strategy });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
