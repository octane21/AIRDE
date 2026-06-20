const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/report — public — sheet 21_Report
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM report_sections ORDER BY section');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { section, summary } = req.body;
  if (!section) return res.status(400).json({ error: 'section is required' });
  try {
    const result = await pool.query(
      `INSERT INTO report_sections (section, summary) VALUES ($1,$2) RETURNING *`,
      [section, summary]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Section already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:section', verifyToken, async (req, res) => {
  const { summary } = req.body;
  try {
    const result = await pool.query(
      `UPDATE report_sections SET summary=$1, updated_at=NOW() WHERE section=$2 RETURNING *`,
      [summary, req.params.section]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Section not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:section', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM report_sections WHERE section = $1 RETURNING section', [req.params.section]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Section not found' });
    res.json({ message: 'Section deleted', section: result.rows[0].section });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
