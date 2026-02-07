const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// Quiz Categories Routes
// ============================================

// Lấy danh sách tất cả categories
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM quiz_categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo category mới (admin only)
router.post('/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }
    const [result] = await db.query(
      'INSERT INTO quiz_categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Category created successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật category (admin only)
router.put('/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Tên danh mục là bắt buộc' });
    }
    
    const [existing] = await db.query('SELECT id FROM quiz_categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    await db.query(
      'UPDATE quiz_categories SET name = ?, description = ? WHERE id = ?',
      [name, description || null, id]
    );
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Tên danh mục đã tồn tại' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Xóa category (admin only)
router.delete('/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra xem có câu hỏi nào đang sử dụng category này không
    const [questions] = await db.query('SELECT COUNT(*) as count FROM quiz_questions WHERE category_id = ?', [id]);
    if (questions[0].count > 0) {
      return res.status(400).json({ 
        error: `Không thể xóa danh mục này vì có ${questions[0].count} câu hỏi đang sử dụng` 
      });
    }
    
    const [result] = await db.query('DELETE FROM quiz_categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ============================================
// Quiz Questions Routes
// ============================================

// Lấy danh sách câu hỏi
router.get('/', async (req, res) => {
  try {
    const { character_id, category_id } = req.query;
    let query = `
      SELECT q.*, 
             c.name as character_name,
             cat.name as category_name
      FROM quiz_questions q
      LEFT JOIN characters c ON q.character_id = c.id
      LEFT JOIN quiz_categories cat ON q.category_id = cat.id
    `;
    let params = [];
    const conditions = [];
    
    if (character_id) {
      conditions.push('q.character_id = ?');
      params.push(character_id);
    }
    
    if (category_id) {
      conditions.push('q.category_id = ?');
      params.push(category_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY q.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Lấy câu hỏi theo ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM quiz_questions WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Tạo câu hỏi mới (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { question, option_a, option_b, option_c, option_d, correct_answer, character_id, category_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, character_id, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [question, option_a, option_b, option_c, option_d, correct_answer, character_id || null, category_id || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Question created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Cập nhật câu hỏi (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, option_a, option_b, option_c, option_d, correct_answer, character_id, category_id } = req.body;
    
    // Kiểm tra câu hỏi có tồn tại không
    const [existing] = await db.query('SELECT id FROM quiz_questions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    await db.query(
      'UPDATE quiz_questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, character_id = ?, category_id = ? WHERE id = ?',
      [question, option_a, option_b, option_c, option_d, correct_answer, character_id || null, category_id || null, id]
    );
    
    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Xóa câu hỏi (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query('DELETE FROM quiz_questions WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
