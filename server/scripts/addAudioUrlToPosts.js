const mysql = require('mysql2/promise');
require('dotenv').config();

async function addAudioUrlColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'website_lich_su',
    });

    console.log('Đang thêm cột audio_url vào bảng posts...');

    // Kiểm tra xem cột đã tồn tại chưa
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'posts' 
       AND COLUMN_NAME = 'audio_url'`,
      [process.env.DB_NAME || 'website_lich_su']
    );

    if (columns.length > 0) {
      console.log('Cột audio_url đã tồn tại trong bảng posts.');
      return;
    }

    // Thêm cột audio_url
    await connection.query(
      'ALTER TABLE posts ADD COLUMN audio_url LONGTEXT NULL AFTER image_url'
    );

    console.log('✅ Đã thêm cột audio_url vào bảng posts thành công!');
  } catch (error) {
    console.error('❌ Lỗi khi thêm cột audio_url:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Chạy migration
addAudioUrlColumn()
  .then(() => {
    console.log('Migration hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration thất bại:', error);
    process.exit(1);
  });
