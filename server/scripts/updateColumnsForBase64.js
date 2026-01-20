const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateColumnsForBase64() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'website_lich_su',
    });

    console.log('Connected to database');

    // Update products table
    console.log('Updating products.image_url to LONGTEXT...');
    await connection.query('ALTER TABLE products MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ products.image_url updated');

    // Update posts table
    console.log('Updating posts.image_url to LONGTEXT...');
    await connection.query('ALTER TABLE posts MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ posts.image_url updated');

    // Update posts.content to LONGTEXT (for ReactQuill HTML + inline images)
    console.log('Updating posts.content to LONGTEXT...');
    await connection.query('ALTER TABLE posts MODIFY COLUMN content LONGTEXT');
    console.log('✅ posts.content updated');

    // Update characters table
    console.log('Updating characters.image_url to LONGTEXT...');
    await connection.query('ALTER TABLE characters MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ characters.image_url updated');

    console.log('Updating characters.audio_url to LONGTEXT...');
    await connection.query('ALTER TABLE characters MODIFY COLUMN audio_url LONGTEXT');
    console.log('✅ characters.audio_url updated');

    // Update carousel table
    console.log('Updating carousel_slides.image_url to LONGTEXT...');
    await connection.query('ALTER TABLE carousel_slides MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ carousel_slides.image_url updated');

    console.log('\n🎉 All columns updated successfully for base64 storage!');
    
  } catch (error) {
    console.error('❌ Error updating columns:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

updateColumnsForBase64();
