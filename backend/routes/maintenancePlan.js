const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_action_plan ORDER BY target_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_action_plan WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Plan item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { asset_id, priority, action, owner, target_date, status, notes } = req.body;
  if (!asset_id) return res.status(400).json({ error: 'asset_id is required' });
  try {
    const result = await pool.query(
      `INSERT INTO maintenance_action_plan (asset_id, priority, action, owner, target_date, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [asset_id, priority, action, owner || 'Integrity Team', target_date || null, status || 'Planned', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { asset_id, priority, action, owner, target_date, status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE maintenance_action_plan SET asset_id=$1, priority=$2, action=$3, owner=$4,
        target_date=$5, status=$6, notes=$7, updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [asset_id, priority, action, owner, target_date || null, status, notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Plan item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM maintenance_action_plan WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Plan item not found' });
    res.json({ message: 'Plan item deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
