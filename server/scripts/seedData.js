const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Helper function to generate slug from Vietnamese text
function generateSlug(text) {
  const a = 'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ';
  const b = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeediiiiioooooooooooooooouuuuuuuuuuuyyyyy';
  return text
    .toLowerCase()
    .split('')
    .map((char, index) => {
      const pos = a.indexOf(char);
      return pos !== -1 ? b[pos] : char;
    })
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Fake data generators
const fakeProducts = [
  { name: 'Việt Nam - Những Tiếng Vọng Từ Quá Khứ', price: 124000 },
  { name: 'Bộ 30 Ảnh Bo Góc Chân Dung Lịch Sử Việt Nam', price: 60000 },
  { name: 'Việt Sử Kiêu Hùng - Quyển 2', price: 250000 },
  { name: 'Board Game Lịch Sử Việt Nam', price: 350000 },
  { name: 'Bộ Flashcard Học Lịch Sử Việt Nam', price: 120000 },
  { name: 'Mô Hình Lăng Chủ Tịch Hồ Chí Minh', price: 450000 },
  { name: 'Sách Lịch Sử Việt Nam Tập 1', price: 180000 },
  { name: 'Sách Lịch Sử Việt Nam Tập 2', price: 180000 },
  { name: 'Tranh Treo Tường Nhân Vật Lịch Sử', price: 95000 },
  { name: 'Bộ Tượng Nhân Vật Lịch Sử', price: 520000 },
  { name: 'Đồng Hồ Lịch Sử Việt Nam', price: 380000 },
  { name: 'Áo Phông In Nhân Vật Lịch Sử', price: 145000 },
  { name: 'Túi Vải Lịch Sử Việt Nam', price: 85000 },
  { name: 'Cốc Sứ In Hình Di Tích', price: 65000 },
  { name: 'Bút Bi Lịch Sử Cao Cấp', price: 120000 },
];

async function seedData() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '103.200.23.43',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'toilamanhdevhust',
      database: process.env.DB_NAME || 'website_lich_su',
    });

    console.log('✅ Đang kết nối database...\n');

    // 1. Seed Products (15 sản phẩm)
    console.log('🛍️ Đang thêm sản phẩm...');
    for (const product of fakeProducts) {
      const slug = generateSlug(product.name);
      const description = `${product.name} - Sản phẩm chất lượng cao, phù hợp cho những người yêu thích lịch sử Việt Nam.`;
      
      await connection.query(
        'INSERT IGNORE INTO products (name, slug, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
        [product.name, slug, description, product.price, `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=400&h=500&fit=crop`]
      );
    }
    console.log(`✅ Đã thêm ${fakeProducts.length} sản phẩm\n`);

    // 2. Seed Admin Users (người dùng)
    console.log('👤 Đang tạo người dùng admin...');
    
    const adminUsers = [
      { username: 'admin', email: 'admin@vietsuquan.com', firstName: 'Admin', lastName: 'User', password: 'admin123' },
      { username: 'manager', email: 'manager@vietsuquan.com', firstName: 'Manager', lastName: 'User', password: 'manager123' },
    ];
    
    for (const admin of adminUsers) {
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await connection.query(
        'INSERT IGNORE INTO admins (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
        [admin.username, hashedPassword, admin.email, admin.firstName, admin.lastName]
      );
      console.log(`   ✅ Đã tạo admin: ${admin.username} (password: ${admin.password})`);
    }
    console.log(`\n✅ Đã tạo ${adminUsers.length} người dùng admin\n`);

    console.log('🎉 Hoàn tất seed dữ liệu!');
    console.log('\n📊 Tóm tắt:');
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admins');

    console.log(`   - Sản phẩm: ${productCount[0].count}`);
    console.log(`   - Người dùng (Admin): ${adminCount[0].count}`);
    console.log('\n💡 Thông tin đăng nhập:');
    console.log('   - Username: admin, Password: admin123');
    console.log('   - Username: manager, Password: manager123');

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

seedData();
