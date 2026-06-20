const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const pool = require('../db');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!/^image\//.test(file.mimetype)) return cb(new Error('Only image files are allowed'));
    cb(null, true);
  },
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos ORDER BY created_at DESC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM photos WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Photo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', verifyToken, upload.single('photo'), async (req, res) => {
  const { asset_id, kp_location, photo_type, geo_tagged, finding } = req.body;
  if (!asset_id) {
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: 'asset_id is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO photos (asset_id, kp_location, photo_file, original_name, photo_type, geo_tagged, finding)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [asset_id, kp_location, req.file ? req.file.filename : null, req.file ? req.file.originalname : null,
       photo_type, geo_tagged === 'true' || geo_tagged === true, finding]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (err.code === '23503') return res.status(400).json({ error: 'Asset ID does not exist' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', verifyToken, upload.single('photo'), async (req, res) => {
  const { asset_id, kp_location, photo_type, geo_tagged, finding } = req.body;
  try {
    const existing = await pool.query('SELECT photo_file FROM photos WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ error: 'Photo not found' });
    }

    let photoFile = existing.rows[0].photo_file;
    let originalName;
    if (req.file) {
      if (photoFile) fs.unlink(path.join(UPLOAD_DIR, photoFile), () => {});
      photoFile = req.file.filename;
      originalName = req.file.originalname;
    }

    const result = await pool.query(
      `UPDATE photos SET asset_id=$1, kp_location=$2, photo_file=$3,
        original_name=COALESCE($4, original_name), photo_type=$5, geo_tagged=$6, finding=$7
       WHERE id=$8 RETURNING *`,
      [asset_id, kp_location, photoFile, originalName || null, photo_type,
       geo_tagged === 'true' || geo_tagged === true, finding, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM photos WHERE id = $1 RETURNING id, photo_file', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Photo not found' });
    if (result.rows[0].photo_file) {
      fs.unlink(path.join(UPLOAD_DIR, result.rows[0].photo_file), () => {});
    }
    res.json({ message: 'Photo deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
