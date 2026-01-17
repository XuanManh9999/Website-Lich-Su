const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy sản phẩm theo slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query('SELECT * FROM products WHERE slug = ?', [slug]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy sản phẩm theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo sản phẩm mới (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description, price, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO products (name, slug, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, slug, description, price, image_url]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật sản phẩm (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, image_url } = req.body;
    
    // Kiểm tra sản phẩm có tồn tại không
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await db.query(
      'UPDATE products SET name = ?, slug = ?, description = ?, price = ?, image_url = ? WHERE id = ?',
      [name, slug, description, price, image_url, id]
    );
    
    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Xóa sản phẩm (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
