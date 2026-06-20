const router = require('express').Router();
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalcAsset, thicknessStatusFromHealth } = require('../lib/engine');

async function computeUtFields({ asset_id, reading_date, t_design, deg0, deg90, deg180, deg270, tmin_required }) {
  const assetResult = await pool.query('SELECT install_year FROM assets WHERE id = $1', [asset_id]);
  const installYear = assetResult.rows[0]?.install_year;
  const years = Math.max(1, new Date(reading_date || Date.now()).getFullYear() - (installYear || new Date().getFullYear()));

  const t_actual_min = Math.min(deg0, deg90, deg180, deg270);
  const thickness_health = Math.round(((t_actual_min - tmin_required) / (t_design - tmin_required)) * 10000) / 100;
  const corrosion_rate = Math.round(((t_design - t_actual_min) / years) * 10000) / 10000;
  const remaining_life = corrosion_rate > 0
    ? Math.round(((t_actual_min - tmin_required) / corrosion_rate) * 10) / 10
    : 999;
  const ut_status = await thicknessStatusFromHealth(thickness_health);

  return { t_actual_min, thickness_health, corrosion_rate, remaining_life, ut_status };
}

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ut_readings ORDER BY reading_date DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ut_readings WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'UT reading not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { asset_id, reading_date, kp_location, t_design, deg0, deg90, deg180, deg270, tmin_required } = req.body;
  if (!asset_id || t_design == null || deg0 == null || deg90 == null || deg180 == null || deg270 == null || tmin_required == null) {
    return res.status(400).json({ error: 'asset_id, t_design, deg0/90/180/270 and tmin_required are required' });
  }
  try {
    const fields = await computeUtFields(req.body);
    const result = await pool.query(
      `INSERT INTO ut_readings (asset_id, reading_date, kp_location, t_design, deg0, deg90, deg180, deg270,
        t_actual_min, tmin_required, thickness_health, corrosion_rate, remaining_life, ut_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [asset_id, reading_date || null, kp_location, t_design, deg0, deg90, deg180, deg270,
       fields.t_actual_min, tmin_required, fields.thickness_health, fields.corrosion_rate, fields.remaining_life, fields.ut_status]
    );
    await recalcAsset(asset_id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A reading for this asset, date, and location already exists' });
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { asset_id, reading_date, kp_location, t_design, deg0, deg90, deg180, deg270, tmin_required } = req.body;
  try {
    const fields = await computeUtFields(req.body);
    const result = await pool.query(
      `UPDATE ut_readings SET asset_id=$1, reading_date=$2, kp_location=$3, t_design=$4, deg0=$5, deg90=$6,
        deg180=$7, deg270=$8, t_actual_min=$9, tmin_required=$10, thickness_health=$11, corrosion_rate=$12,
        remaining_life=$13, ut_status=$14, updated_at=NOW()
       WHERE id=$15 RETURNING *`,
      [asset_id, reading_date || null, kp_location, t_design, deg0, deg90, deg180, deg270,
       fields.t_actual_min, tmin_required, fields.thickness_health, fields.corrosion_rate, fields.remaining_life, fields.ut_status,
       req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'UT reading not found' });
    await recalcAsset(asset_id);
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A reading for this asset, date, and location already exists' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ut_readings WHERE id = $1 RETURNING id, asset_id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'UT reading not found' });
    await recalcAsset(result.rows[0].asset_id);
    res.json({ message: 'UT reading deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
