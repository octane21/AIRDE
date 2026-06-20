const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/actions — public
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM action_register ORDER BY priority, id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/actions/:id — public
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM action_register WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Action not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/actions — protected
router.post('/', verifyToken, async (req, res) => {
  const { id, strategy, action, priority, due_date, status, risk_level } = req.body;
  if (!id) return res.status(400).json({ error: 'Asset id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO action_register (id,strategy,action,priority,due_date,status,risk_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, strategy, action, priority, due_date, status, risk_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Action for this asset already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/actions/:id — protected
router.put('/:id', verifyToken, async (req, res) => {
  const { strategy, action, priority, due_date, status, risk_level } = req.body;
  try {
    const result = await pool.query(
      `UPDATE action_register SET strategy=$1,action=$2,priority=$3,due_date=$4,
        status=$5,risk_level=$6,updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [strategy, action, priority, due_date, status, risk_level, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Action not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/actions/:id — admin only
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM action_register WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Action not found' });
    res.json({ message: 'Action deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
