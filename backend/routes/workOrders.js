const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_orders ORDER BY due_date');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:woNo', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM work_orders WHERE wo_no = $1', [req.params.woNo]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Work order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { wo_no, asset_id, work_type, description, priority, due_date, status } = req.body;
  if (!wo_no || !asset_id) return res.status(400).json({ error: 'wo_no and asset_id are required' });
  try {
    const result = await pool.query(
      `INSERT INTO work_orders (wo_no, asset_id, work_type, description, priority, due_date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [wo_no, asset_id, work_type, description, priority, due_date || null, status || 'Planned']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Work order number already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:woNo', verifyToken, async (req, res) => {
  const { asset_id, work_type, description, priority, due_date, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE work_orders SET asset_id=$1, work_type=$2, description=$3, priority=$4,
        due_date=$5, status=$6, updated_at=NOW()
       WHERE wo_no=$7 RETURNING *`,
      [asset_id, work_type, description, priority, due_date || null, status, req.params.woNo]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Work order not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:woNo', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM work_orders WHERE wo_no = $1 RETURNING wo_no', [req.params.woNo]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Work order not found' });
    res.json({ message: 'Work order deleted', wo_no: result.rows[0].wo_no });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
