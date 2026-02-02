const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/database');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY');

// Helper function to strip HTML tags and decode HTML entities
function stripHtml(html) {
  if (!html) return '';
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

// Helper function to query database for historical information
async function queryDatabase(userQuery) {
  try {
    const lowerQuery = userQuery.toLowerCase();
    let results = [];

    // Query characters table - Always query for general history questions
    const searchTerm = `%${userQuery}%`;
    const [characters] = await db.query(
      'SELECT name, timeline, summary, content FROM characters WHERE name LIKE ? OR summary LIKE ? OR content LIKE ? LIMIT 5',
      [searchTerm, searchTerm, searchTerm]
    );
    if (characters && characters.length > 0) {
      results.push(...characters.map(c => ({
        type: 'character',
        name: c.name,
        timeline: c.timeline,
        summary: stripHtml(c.summary || ''),
        content: stripHtml(c.content || '').substring(0, 500),
      })));
    }

    // Query posts table
    const [posts] = await db.query(
      'SELECT title, content FROM posts WHERE title LIKE ? OR content LIKE ? LIMIT 3',
      [searchTerm, searchTerm]
    );
    if (posts && posts.length > 0) {
      results.push(...posts.map(p => ({
        type: 'post',
        title: p.title,
        content: stripHtml(p.content || '').substring(0, 500),
      })));
    }

    // Query quiz questions for context (if specifically asking about questions)
    if (lowerQuery.includes('câu hỏi') || lowerQuery.includes('quiz') || lowerQuery.includes('trắc nghiệm')) {
      const [questions] = await db.query(
        'SELECT question, option_a, option_b, option_c, option_d, correct_answer FROM quiz_questions LIMIT 3'
      );
      if (questions && questions.length > 0) {
        results.push(...questions.map(q => ({
          type: 'question',
          question: q.question,
          options: [q.option_a, q.option_b, q.option_c, q.option_d].filter(Boolean),
          correct_answer: q.correct_answer,
        })));
      }
    }

    return results;
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}

// Chat with Gemini AI
router.post('/chat', async (req, res) => {
  try {
    const { message, mode = 'explore' } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Query database for relevant information
    const dbResults = await queryDatabase(message);

    // Prepare context for Gemini
    let context = 'Bạn là một chatbot chuyên về lịch sử Việt Nam. Trả lời các câu hỏi về lịch sử Việt Nam một cách chính xác và chi tiết.\n\n';

    if (dbResults.length > 0) {
      context += 'Thông tin từ cơ sở dữ liệu:\n';
      dbResults.forEach((result, index) => {
        if (result.type === 'character') {
          context += `${index + 1}. Nhân vật: ${result.name} (${result.timeline})\n   Tóm tắt: ${result.summary}\n\n`;
        } else if (result.type === 'post') {
          context += `${index + 1}. Sự kiện: ${result.title}\n   Nội dung: ${result.content}\n\n`;
        } else if (result.type === 'question') {
          context += `${index + 1}. Câu hỏi: ${result.question}\n   Đáp án đúng: ${result.correct_answer}\n\n`;
        }
      });
    }

    context += `Chế độ tương tác: ${mode}\n`;
    context += `Câu hỏi của người dùng: ${message}\n`;
    context += 'Hãy trả lời câu hỏi dựa trên thông tin từ cơ sở dữ liệu và kiến thức của bạn. Nếu thông tin từ cơ sở dữ liệu có liên quan, hãy tham khảo và sử dụng nó.';

    // Get Gemini model - use gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 

    // Generate response
    const result = await model.generateContent(context);
    const response = await result.response;
    const text = response.text();

    res.json({
      response: text,
      sources: dbResults.length > 0 ? dbResults : null,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Fallback response if Gemini fails - create a better formatted response
    const { message } = req.body;
    const dbResults = await queryDatabase(message || '');
    
    let fallbackResponse = '';
    
    if (dbResults.length > 0) {
      // Create a well-formatted response from database
      fallbackResponse = 'Dựa trên thông tin trong cơ sở dữ liệu của chúng tôi:\n\n';
      
      dbResults.slice(0, 3).forEach((result, index) => {
        if (result.type === 'character') {
          const cleanSummary = stripHtml(result.summary || '');
          const cleanContent = stripHtml(result.content || '');
          const fullText = cleanSummary || cleanContent;
          
          fallbackResponse += `**${result.name}**`;
          if (result.timeline) {
            fallbackResponse += ` (${result.timeline})`;
          }
          fallbackResponse += '\n\n';
          
          if (fullText) {
            fallbackResponse += fullText.substring(0, 400);
            if (fullText.length > 400) {
              fallbackResponse += '...';
            }
            fallbackResponse += '\n\n';
          }
        } else if (result.type === 'post') {
          const cleanContent = stripHtml(result.content || '');
          fallbackResponse += `**${result.title}**\n\n`;
          if (cleanContent) {
            fallbackResponse += cleanContent.substring(0, 300);
            if (cleanContent.length > 300) {
              fallbackResponse += '...';
            }
            fallbackResponse += '\n\n';
          }
        }
      });
      
      fallbackResponse += '\nĐể biết thêm chi tiết, vui lòng xem các trang nhân vật và blog lịch sử trên website.';
    } else {
      fallbackResponse = 'Xin lỗi, tôi không tìm thấy thông tin liên quan đến câu hỏi của bạn trong cơ sở dữ liệu. ';
      fallbackResponse += 'Vui lòng thử lại với câu hỏi khác hoặc xem thông tin chi tiết tại các trang nhân vật và blog lịch sử.';
    }

    res.json({ response: fallbackResponse, sources: dbResults.length > 0 ? dbResults : null });
  }
});

module.exports = router;
