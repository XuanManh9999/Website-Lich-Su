const mysql = require('mysql2/promise');

async function addAddressColumns() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '103.200.23.43',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'toilamanhdevhust',
      database: process.env.DB_NAME || 'vietsuquan',
    });

    console.log('✅ Đang kết nối database...\n');

    // Check if columns exist
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'orders' 
       AND COLUMN_NAME IN ('province', 'district', 'ward', 'address_detail')`,
      [process.env.DB_NAME || 'vietsuquan']
    );

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Add province column
    if (!existingColumns.includes('province')) {
      await connection.query(
        'ALTER TABLE orders ADD COLUMN province VARCHAR(255) NULL AFTER customer_address'
      );
      console.log('✅ Đã thêm cột province');
    } else {
      console.log('✓ Cột province đã tồn tại');
    }

    // Add district column
    if (!existingColumns.includes('district')) {
      await connection.query(
        'ALTER TABLE orders ADD COLUMN district VARCHAR(255) NULL AFTER province'
      );
      console.log('✅ Đã thêm cột district');
    } else {
      console.log('✓ Cột district đã tồn tại');
    }

    // Add ward column
    if (!existingColumns.includes('ward')) {
      await connection.query(
        'ALTER TABLE orders ADD COLUMN ward VARCHAR(255) NULL AFTER district'
      );
      console.log('✅ Đã thêm cột ward');
    } else {
      console.log('✓ Cột ward đã tồn tại');
    }

    // Add address_detail column
    if (!existingColumns.includes('address_detail')) {
      await connection.query(
        'ALTER TABLE orders ADD COLUMN address_detail VARCHAR(500) NULL AFTER ward'
      );
      console.log('✅ Đã thêm cột address_detail');
    } else {
      console.log('✓ Cột address_detail đã tồn tại');
    }

    console.log('\n🎉 Hoàn tất cập nhật bảng orders!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAddressColumns();
