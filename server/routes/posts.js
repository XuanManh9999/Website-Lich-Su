const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

let postsSchemaCache = {
  checked: false,
  hasAudioUrl: false,
};

async function ensurePostsSchemaCache() {
  if (postsSchemaCache.checked) return postsSchemaCache;
  try {
    const [rows] = await db.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'posts'
         AND COLUMN_NAME = 'audio_url'`
    );
    postsSchemaCache = {
      checked: true,
      hasAudioUrl: rows.length > 0,
    };
  } catch (e) {
    // If schema check fails, don't block requests; fall back to previous behavior
    postsSchemaCache = { checked: true, hasAudioUrl: false };
  }
  return postsSchemaCache;
}

function respondDbError(res, error) {
  // Provide actionable errors instead of a generic 500
  if (error?.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({
      error: 'Database schema thiếu cột. Hãy chạy migration (addAudioUrlToPosts / updateColumnsForBase64).',
      code: error.code,
      details: error.message,
    });
  }
  if (error?.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({
      error: 'Dữ liệu quá dài cho cột DB (thường do image_url/content đang là VARCHAR/TEXT). Hãy chạy updateColumnsForBase64.',
      code: error.code,
      details: error.message,
    });
  }
  return res.status(500).json({ error: 'Database error', code: error?.code, details: error?.message });
}

// Lấy danh sách bài viết
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    respondDbError(res, error);
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
    respondDbError(res, error);
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
    respondDbError(res, error);
  }
});

// Tạo bài viết mới (admin only)
router.post('/', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const schema = await ensurePostsSchemaCache();
    const { title, slug, content, image_url, audio_url } = req.body;
    
    // Log để debug
    console.log('Creating post:', { title, slug, hasAudioFile: !!req.file, audio_url });
    
    const savedAudioUrl = req.file ? `/uploads/${req.file.filename}` : (audio_url || null);
    
    if (schema.hasAudioUrl) {
      const [result] = await db.query(
        'INSERT INTO posts (title, slug, content, image_url, audio_url) VALUES (?, ?, ?, ?, ?)',
        [title, slug, content, image_url || null, savedAudioUrl]
      );
      res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
    } else {
      // Nếu chưa có cột audio_url, chỉ insert các cột cơ bản
      const [result] = await db.query(
        'INSERT INTO posts (title, slug, content, image_url) VALUES (?, ?, ?, ?)',
        [title, slug, content, image_url || null]
      );
      console.warn('⚠️ Cột audio_url chưa tồn tại trong DB. Hãy chạy migration: node server/scripts/addAudioUrlToPosts.js');
      res.status(201).json({ 
        id: result.insertId, 
        message: 'Post created successfully (audio_url not saved - column missing)',
        warning: 'Cột audio_url chưa tồn tại. Hãy chạy migration để thêm cột.'
      });
    }
  } catch (error) {
    console.error('❌ Error creating post:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      message: error.message
    });
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    // Trả về lỗi chi tiết hơn
    respondDbError(res, error);
  }
});

// Cập nhật bài viết (admin only)
router.put('/:id', authenticateToken, upload.single('audio'), async (req, res) => {
  try {
    const schema = await ensurePostsSchemaCache();
    const { id } = req.params;
    const { title, slug, content, image_url, audio_url } = req.body;
    
    // Nếu có file mới upload → dùng file mới
    // Nếu không có file mới nhưng có audio_url trong body → giữ nguyên audio_url cũ
    // Nếu không có cả hai → set null
    let savedAudioUrl = null;
    if (req.file) {
      savedAudioUrl = `/uploads/${req.file.filename}`;
    } else if (audio_url !== undefined && audio_url !== null && audio_url !== '') {
      savedAudioUrl = audio_url;
    }
    
    // Kiểm tra bài viết có tồn tại không
    const [existing] = await db.query('SELECT id FROM posts WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (schema.hasAudioUrl) {
      await db.query(
        'UPDATE posts SET title = ?, slug = ?, content = ?, image_url = ?, audio_url = ? WHERE id = ?',
        [title, slug, content, image_url || null, savedAudioUrl, id]
      );
    } else {
      await db.query(
        'UPDATE posts SET title = ?, slug = ?, content = ?, image_url = ? WHERE id = ?',
        [title, slug, content, image_url || null, id]
      );
    }
    
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    respondDbError(res, error);
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
    respondDbError(res, error);
  }
});

module.exports = router;
