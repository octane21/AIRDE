const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { recalcAll } = require('../lib/engine');

// POST /api/engine/recalculate — operator or admin
router.post('/recalculate', verifyToken, async (req, res) => {
  try {
    const summary = await recalcAll();
    res.json({ message: 'Recalculation complete', ...summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
