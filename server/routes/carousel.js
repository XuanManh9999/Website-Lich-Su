const express = require('express');
const router = express.Router();
const db = require('../config/database');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách carousel slides (public - chỉ lấy active)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM carousel_slides WHERE is_active = TRUE ORDER BY display_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy tất cả carousel slides (admin only - kể cả inactive) - PHẢI đặt TRƯỚC /:id
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM carousel_slides ORDER BY display_order ASC, created_at ASC'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy carousel slide theo ID (admin only) - PHẢI đặt SAU /all
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM carousel_slides WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Carousel slide not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo carousel slide mới (admin only)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { quote, author, image_url, display_order, is_active } = req.body;
    
    console.log('Creating carousel slide with:', {
      body: req.body,
      hasFile: !!req.file,
      file: req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : null,
    });
    // Đảm bảo quote không null để tránh lỗi DB (cho phép rỗng)
    const safeQuote = (quote && quote.toString().trim()) || '';

    // Convert is_active to boolean
    const isActiveValue = is_active === 'true' || is_active === true || is_active === undefined;

    // Xử lý đường dẫn ảnh: ưu tiên file upload, fallback image_url text nếu có
    let savedImageUrl = null;
    if (req.file) {
      savedImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url && image_url.trim() !== '') {
      savedImageUrl = image_url.trim();
    }

    const [result] = await db.query(
      'INSERT INTO carousel_slides (quote, author, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [safeQuote, author || 'Thiên Sử Ký', savedImageUrl, parseInt(display_order) || 0, isActiveValue]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Carousel slide created successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật carousel slide (admin only)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quote, author, image_url, display_order, is_active } = req.body;

    console.log('Updating carousel slide', id, 'with:', {
      body: req.body,
      hasFile: !!req.file,
      file: req.file ? { filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } : null,
    });

    // Lấy bản ghi hiện tại để giữ lại các field nếu FE không gửi lên
    const [existingRows] = await db.query(
      'SELECT id, quote, author, image_url, display_order, is_active FROM carousel_slides WHERE id = ?',
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Carousel slide not found' });
    }
    const existing = existingRows[0];
    
    // Convert is_active to boolean (nếu FE có gửi)
    const isActiveValue = is_active === 'true' || is_active === true;

    // Nếu FE không gửi quote thì giữ nguyên DB
    const safeQuote =
      quote !== undefined && quote !== null
        ? (quote && quote.toString().trim()) || ''
        : existing.quote || '';

    const finalAuthor =
      author !== undefined && author !== null
        ? author || 'Thiên Sử Ký'
        : existing.author || 'Thiên Sử Ký';

    let finalImageUrl = existing.image_url || null;
    if (req.file) {
      // Nếu upload ảnh mới → dùng đường dẫn mới
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url !== undefined && image_url !== null && image_url !== '') {
      // Nếu gửi image_url text → dùng text đó
      finalImageUrl = image_url.trim();
    }

    const finalDisplayOrder =
      display_order !== undefined && display_order !== null
        ? parseInt(display_order) || 0
        : existing.display_order || 0;

    const finalIsActive =
      is_active !== undefined && is_active !== null
        ? isActiveValue
        : !!existing.is_active;

    await db.query(
      'UPDATE carousel_slides SET quote = ?, author = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
      [safeQuote, finalAuthor, finalImageUrl, finalDisplayOrder, finalIsActive, id]
    );

    res.json({ message: 'Carousel slide updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Xóa carousel slide (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM carousel_slides WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Carousel slide not found' });
    }

    res.json({ message: 'Carousel slide deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
