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
router.post(
  '/',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      const { quote, author, display_order, is_active } = req.body;
      const imageFile = req.file;

      const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;
      
      // Convert is_active từ string (FormData) sang boolean
      // FormData checkbox: checked = "true", unchecked = undefined (không gửi field)
      const isActiveValue = is_active === 'true' || is_active === true || is_active === undefined;

      const [result] = await db.query(
        'INSERT INTO carousel_slides (quote, author, image_url, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
        [quote, author || 'Thiên Sử Ký', imageUrl, parseInt(display_order) || 0, isActiveValue]
      );

      res.status(201).json({
        id: result.insertId,
        message: 'Carousel slide created successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// Cập nhật carousel slide (admin only)
router.put(
  '/:id',
  authenticateToken,
  upload.single('image'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { quote, author, display_order, is_active } = req.body;
      const imageFile = req.file;

      // Kiểm tra slide có tồn tại không
      const [existing] = await db.query('SELECT id, image_url FROM carousel_slides WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: 'Carousel slide not found' });
      }

      // Nếu có ảnh mới, dùng ảnh mới; nếu không, giữ ảnh cũ
      const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : existing[0].image_url;
      
      // Convert is_active từ string (FormData) sang boolean
      // FormData checkbox: checked = "true", unchecked = undefined (không gửi field)
      // Khi update, nếu không gửi is_active, giữ giá trị cũ; nếu gửi, dùng giá trị mới
      const isActiveValue = is_active !== undefined 
        ? (is_active === 'true' || is_active === true)
        : existing[0].is_active;

      await db.query(
        'UPDATE carousel_slides SET quote = ?, author = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = NOW() WHERE id = ?',
        [quote, author || 'Thiên Sử Ký', imageUrl, parseInt(display_order) || 0, isActiveValue, id]
      );

      res.json({ message: 'Carousel slide updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

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
