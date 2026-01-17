const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Lấy danh sách câu hỏi
router.get('/', async (req, res) => {
  try {
    const { character_id } = req.query;
    let query = 'SELECT * FROM quiz_questions';
    let params = [];
    
    if (character_id) {
      query += ' WHERE character_id = ?';
      params.push(character_id);
    }
    
    query += ' ORDER BY created_at DESC';
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
    const { question, option_a, option_b, option_c, option_d, correct_answer, character_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, character_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [question, option_a, option_b, option_c, option_d, correct_answer, character_id || null]
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
    const { question, option_a, option_b, option_c, option_d, correct_answer, character_id } = req.body;
    
    // Kiểm tra câu hỏi có tồn tại không
    const [existing] = await db.query('SELECT id FROM quiz_questions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    await db.query(
      'UPDATE quiz_questions SET question = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_answer = ?, character_id = ? WHERE id = ?',
      [question, option_a, option_b, option_c, option_d, correct_answer, character_id || null, id]
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
