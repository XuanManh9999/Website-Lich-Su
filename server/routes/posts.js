const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách bài viết
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy bài viết theo slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query('SELECT * FROM posts WHERE slug = ?', [slug]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy bài viết theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo bài viết mới (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, slug, content, image_url } = req.body;
    const [result] = await db.query(
      'INSERT INTO posts (title, slug, content, image_url) VALUES (?, ?, ?, ?)',
      [title, slug, content, image_url]
    );
    res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật bài viết (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, image_url } = req.body;
    
    // Kiểm tra bài viết có tồn tại không
    const [existing] = await db.query('SELECT id FROM posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    await db.query(
      'UPDATE posts SET title = ?, slug = ?, content = ?, image_url = ? WHERE id = ?',
      [title, slug, content, image_url, id]
    );
    
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Xóa bài viết (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM posts WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
