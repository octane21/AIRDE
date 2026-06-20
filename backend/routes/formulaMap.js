const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/formula-map — public — sheet 22_Formula_Map
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM formula_map ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, requireAdmin, async (req, res) => {
  const { engine, sheet, formula, purpose, feeds_to } = req.body;
  if (!engine || !sheet) return res.status(400).json({ error: 'engine and sheet are required' });
  try {
    const result = await pool.query(
      `INSERT INTO formula_map (engine, sheet, formula, purpose, feeds_to) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [engine, sheet, formula, purpose, feeds_to]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, requireAdmin, async (req, res) => {
  const { engine, sheet, formula, purpose, feeds_to } = req.body;
  try {
    const result = await pool.query(
      `UPDATE formula_map SET engine=$1, sheet=$2, formula=$3, purpose=$4, feeds_to=$5 WHERE id=$6 RETURNING *`,
      [engine, sheet, formula, purpose, feeds_to, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Formula map entry not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM formula_map WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Formula map entry not found' });
    res.json({ message: 'Formula map entry deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
