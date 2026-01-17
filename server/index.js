const express = require('express');
const cors = require('cors');
const path = require('path');
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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
