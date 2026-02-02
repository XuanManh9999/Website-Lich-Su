const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const db = require('./config/database');
require('dotenv').config();

const characterRoutes = require('./routes/characters');
const adminRoutes = require('./routes/admin');
const postRoutes = require('./routes/posts');
const productRoutes = require('./routes/products');
const quizRoutes = require('./routes/quiz');
const paymentRoutes = require('./routes/payment');
const chatbotRoutes = require('./routes/chatbot');
const orderRoutes = require('./routes/orders');
const carouselRoutes = require('./routes/carousel');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://vietsuquan.io.vn',
    'https://www.vietsuquan.io.vn',
    'http://localhost:3000', // For local development
    'http://localhost:5000'  // For local development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Increase payload size limit to 50MB for base64 images and large content
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure database schema supports large base64 images for carousel
(async () => {
  try {
    await db.query('ALTER TABLE carousel_slides MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ Ensured carousel_slides.image_url is LONGTEXT');
  } catch (err) {
    // Nếu cột đã là LONGTEXT hoặc bảng chưa tồn tại, chỉ log cảnh báo rồi bỏ qua
    console.warn('ℹ️ Could not alter carousel_slides.image_url to LONGTEXT (may already be LONGTEXT):', err.code);
  }
})();

// Routes
app.use('/api/characters', characterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/carousel', carouselRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  console.error('Error stack:', err.stack);
  
  // Nếu là lỗi từ multer (file upload)
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File quá lớn. Audio tối đa 10MB, ảnh tối đa 5MB.' });
    }
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ 
        error: 'Field value quá dài. Có thể do image_url hoặc content chứa base64 quá lớn.',
        details: err.message,
        suggestion: 'Hãy giảm kích thước ảnh hoặc tách ảnh ra upload riêng.'
      });
    }
    if (err.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({ error: 'Quá nhiều fields trong form.', details: err.message });
    }
    if (err.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({ error: 'Tên field quá dài.', details: err.message });
    }
    return res.status(400).json({ error: 'Lỗi upload file', details: err.message, code: err.code });
  }
  
  // Trả về lỗi chi tiết hơn để debug
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    code: err.code || 'UNKNOWN_ERROR'
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
