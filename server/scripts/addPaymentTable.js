const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPaymentTable() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vietsuquan',
    });

    console.log('Đang thêm bảng payments và cập nhật bảng orders...');

    // Add payment_status column to orders table if not exists
    try {
      // Check if column exists
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'orders' 
        AND COLUMN_NAME = 'payment_status'
      `, [process.env.DB_NAME || 'vietsuquan']);
      
      if (columns.length === 0) {
        await connection.query(`
          ALTER TABLE orders 
          ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid' AFTER status
        `);
        console.log('✓ Đã thêm cột payment_status vào bảng orders');
      } else {
        console.log('✓ Cột payment_status đã tồn tại trong bảng orders');
      }
    } catch (error) {
      console.error('Lỗi khi thêm cột payment_status:', error.message);
      throw error;
    }

    // Create payments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        transaction_id VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        vnpay_transaction_no VARCHAR(255),
        vnpay_response_code VARCHAR(10),
        payment_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order_id (order_id),
        INDEX idx_transaction_id (transaction_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Đã tạo bảng payments');

    console.log('Hoàn thành!');
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addPaymentTable();
