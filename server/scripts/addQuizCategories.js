const mysql = require('mysql2/promise');
require('dotenv').config();

async function addQuizCategories() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vietsuquan',
    });

    console.log('✅ Đang kết nối database...\n');

    // Tạo bảng quiz_categories
    console.log('📋 Đang tạo bảng quiz_categories...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quiz_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name NVARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Đã tạo bảng quiz_categories\n');

    // Kiểm tra xem cột category_id đã tồn tại chưa
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'quiz_questions' 
      AND COLUMN_NAME = 'category_id'
    `, [process.env.DB_NAME || 'vietsuquan']);

    if (columns.length === 0) {
      console.log('📝 Đang thêm cột category_id vào bảng quiz_questions...');
      await connection.query(`
        ALTER TABLE quiz_questions 
        ADD COLUMN category_id INT NULL AFTER character_id,
        ADD FOREIGN KEY (category_id) REFERENCES quiz_categories(id) ON DELETE SET NULL,
        ADD INDEX idx_category_id (category_id)
      `);
      console.log('✅ Đã thêm cột category_id\n');
    } else {
      console.log('ℹ️ Cột category_id đã tồn tại\n');
    }

    // Thêm một số danh mục mẫu
    console.log('📚 Đang thêm danh mục quiz mẫu...');
    const sampleCategories = [
      { name: 'Lịch Sử Thế Giới', description: 'Câu hỏi về lịch sử các nước trên thế giới' },
      { name: 'Lịch Sử Cận Đại Việt Nam', description: 'Câu hỏi về lịch sử Việt Nam thời cận đại' },
      { name: 'Lịch Sử Cổ Đại Việt Nam', description: 'Câu hỏi về lịch sử Việt Nam thời cổ đại' },
      { name: 'Lịch Sử Trung Đại Việt Nam', description: 'Câu hỏi về lịch sử Việt Nam thời trung đại' },
      { name: 'Nhân Vật Lịch Sử Việt Nam', description: 'Câu hỏi về các nhân vật lịch sử Việt Nam' },
      { name: 'Văn Hóa Việt Nam', description: 'Câu hỏi về văn hóa, phong tục Việt Nam' },
    ];

    for (const category of sampleCategories) {
      await connection.query(
        'INSERT IGNORE INTO quiz_categories (name, description) VALUES (?, ?)',
        [category.name, category.description]
      );
      console.log(`   ✅ Đã thêm danh mục: ${category.name}`);
    }

    console.log('\n🎉 Hoàn tất cập nhật quiz categories!');
    console.log('\n📊 Tóm tắt:');
    const [categoryCount] = await connection.query('SELECT COUNT(*) as count FROM quiz_categories');
    console.log(`   - Danh mục quiz: ${categoryCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addQuizCategories();

