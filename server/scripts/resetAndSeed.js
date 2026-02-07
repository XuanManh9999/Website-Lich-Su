const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
const fakeCharacters = [
  { name: 'Trần Hưng Đạo', timeline: '1228 - 1300' },
  { name: 'Lý Thái Tổ', timeline: '974 - 1028' },
  { name: 'Lê Lợi', timeline: '1385 - 1433' },
  { name: 'Nguyễn Huệ', timeline: '1753 - 1792' },
  { name: 'Hồ Chí Minh', timeline: '1890 - 1969' },
  { name: 'Võ Nguyên Giáp', timeline: '1911 - 2013' },
  { name: 'Lê Thánh Tông', timeline: '1442 - 1497' },
  { name: 'Quang Trung', timeline: '1753 - 1792' },
  { name: 'Ngô Quyền', timeline: '897 - 944' },
  { name: 'Đinh Bộ Lĩnh', timeline: '924 - 979' },
  { name: 'Lý Thường Kiệt', timeline: '1019 - 1105' },
  { name: 'Trần Quốc Tuấn', timeline: '1228 - 1300' },
  { name: 'Lê Đại Hành', timeline: '941 - 1005' },
  { name: 'Phạm Ngũ Lão', timeline: '1255 - 1320' },
  { name: 'Lê Văn Duyệt', timeline: '1763 - 1832' },
];

const fakePostTitles = [
  'Lịch sử Việt Nam qua các thời kỳ',
  'Những trận đánh oai hùng trong lịch sử',
  'Văn hóa và truyền thống Việt Nam',
  'Các triều đại phong kiến Việt Nam',
  'Cuộc kháng chiến chống Pháp',
  'Cuộc kháng chiến chống Mỹ',
  'Văn học Việt Nam qua các thời đại',
  'Kiến trúc cổ Việt Nam',
  'Âm nhạc dân tộc Việt Nam',
  'Ẩm thực truyền thống Việt Nam',
  'Trang phục dân tộc Việt Nam',
  'Lễ hội truyền thống Việt Nam',
  'Di tích lịch sử nổi tiếng',
  'Danh nhân văn hóa Việt Nam',
  'Nghệ thuật thủ công truyền thống',
];

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

async function resetAndSeed() {
  let connection;

  try {
    // Kết nối database (không chọn database trước)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('🔄 Đang kết nối database...\n');

    // Tạo database nếu chưa có
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'vietsuquan'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE ${process.env.DB_NAME || 'vietsuquan'}`);

    console.log('🗑️  Đang xóa dữ liệu cũ...\n');

    // Xóa dữ liệu từ các bảng (theo thứ tự để tránh lỗi foreign key)
    // Kiểm tra và xóa từng bảng nếu tồn tại
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = ['order_items', 'orders', 'quiz_questions', 'password_reset_tokens', 'products', 'posts', 'characters', 'admins'];
    
    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`  ✓ Đã xóa dữ liệu từ bảng: ${table}`);
      } catch (error) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`  ⚠ Bảng ${table} chưa tồn tại, bỏ qua`);
        } else {
          console.log(`  ⚠ Lỗi khi xóa ${table}: ${error.message}`);
        }
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('\n✅ Đã xóa tất cả dữ liệu cũ\n');

    // 1. Seed Characters (15 nhân vật)
    console.log('📚 Đang thêm nhân vật lịch sử...');
    for (const char of fakeCharacters) {
      const slug = generateSlug(char.name);
      const summary = `${char.name} là một trong những nhân vật quan trọng trong lịch sử Việt Nam thời kỳ ${char.timeline}.`;
      const content = `# ${char.name} (${char.timeline})\n\n## Tiểu sử\n\n${char.name} là một nhân vật lịch sử nổi tiếng của Việt Nam trong giai đoạn ${char.timeline}.\n\n## Đóng góp\n\nNhững đóng góp của ${char.name} đã góp phần quan trọng trong việc xây dựng và phát triển đất nước.\n\n## Ý nghĩa lịch sử\n\n${char.name} đã để lại những bài học quý giá cho các thế hệ sau.`;
      
      await connection.query(
        'INSERT INTO characters (name, slug, timeline, summary, content, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [char.name, slug, char.timeline, summary, content, `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=400&h=500&fit=crop`]
      );
    }
    console.log(`✅ Đã thêm ${fakeCharacters.length} nhân vật lịch sử\n`);

    // 2. Seed Posts (15 bài viết)
    console.log('📝 Đang thêm bài viết blog...');
    for (const title of fakePostTitles) {
      const slug = generateSlug(title);
      const content = `# ${title}\n\n## Giới thiệu\n\n${title} là một chủ đề quan trọng trong lịch sử và văn hóa Việt Nam.\n\n## Nội dung chính\n\nBài viết này sẽ giúp bạn hiểu rõ hơn về ${title}.\n\n## Kết luận\n\nHy vọng bài viết đã cung cấp những thông tin hữu ích về ${title}.`;
      
      await connection.query(
        'INSERT INTO posts (title, slug, content, image_url) VALUES (?, ?, ?, ?)',
        [title, slug, content, `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=800&h=600&fit=crop`]
      );
    }
    console.log(`✅ Đã thêm ${fakePostTitles.length} bài viết blog\n`);

    // 3. Seed Products (15 sản phẩm)
    console.log('🛍️  Đang thêm sản phẩm...');
    for (const product of fakeProducts) {
      const slug = generateSlug(product.name);
      const description = `${product.name} - Sản phẩm chất lượng cao, phù hợp cho những người yêu thích lịch sử Việt Nam.`;
      
      await connection.query(
        'INSERT INTO products (name, slug, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
        [product.name, slug, description, product.price, `https://images.unsplash.com/photo-${Math.random().toString(36).substring(2, 15)}?w=400&h=500&fit=crop`]
      );
    }
    console.log(`✅ Đã thêm ${fakeProducts.length} sản phẩm\n`);

    // 4. Seed Quiz Questions (30 câu hỏi)
    console.log('❓ Đang thêm câu hỏi quiz...');
    const [characters] = await connection.query('SELECT id, name FROM characters LIMIT 10');
    const quizTemplates = [
      { q: 'Ai là vị vua đầu tiên của triều Lý?', a: 'Lý Thái Tổ', b: 'Lý Thánh Tông', c: 'Lý Nhân Tông', d: 'Lý Thần Tông', correct: 'A' },
      { q: 'Trận Bạch Đằng năm 1288 do ai chỉ huy?', a: 'Trần Hưng Đạo', b: 'Lý Thường Kiệt', c: 'Ngô Quyền', d: 'Lê Lợi', correct: 'A' },
      { q: 'Ai là người dời đô về Thăng Long?', a: 'Lý Thái Tổ', b: 'Lê Lợi', c: 'Nguyễn Huệ', d: 'Trần Hưng Đạo', correct: 'A' },
      { q: 'Khởi nghĩa Lam Sơn do ai lãnh đạo?', a: 'Lê Lợi', b: 'Nguyễn Huệ', c: 'Trần Hưng Đạo', d: 'Ngô Quyền', correct: 'A' },
      { q: 'Ai là Chủ tịch đầu tiên của nước Việt Nam Dân chủ Cộng hòa?', a: 'Hồ Chí Minh', b: 'Võ Nguyên Giáp', c: 'Trần Phú', d: 'Lê Duẩn', correct: 'A' },
      { q: 'Chiến thắng Điện Biên Phủ diễn ra năm nào?', a: '1954', b: '1945', c: '1975', d: '1950', correct: 'A' },
      { q: 'Ngô Quyền đánh bại quân Nam Hán trên sông nào?', a: 'Bạch Đằng', b: 'Cửa Lục', c: 'Sông Hồng', d: 'Sông Đà', correct: 'A' },
      { q: 'Triều Nguyễn được thành lập năm nào?', a: '1802', b: '1789', c: '1858', d: '1884', correct: 'A' },
      { q: 'Ai là tác giả của "Hịch tướng sĩ"?', a: 'Trần Hưng Đạo', b: 'Lý Thường Kiệt', c: 'Nguyễn Trãi', d: 'Lê Lợi', correct: 'A' },
      { q: 'Quốc hiệu "Đại Việt" được sử dụng từ triều đại nào?', a: 'Nhà Lý', b: 'Nhà Trần', c: 'Nhà Lê', d: 'Nhà Nguyễn', correct: 'A' },
    ];

    for (let i = 0; i < 30; i++) {
      const template = quizTemplates[i % quizTemplates.length];
      const character = characters[i % characters.length];
      
      await connection.query(
        'INSERT INTO quiz_questions (question, option_a, option_b, option_c, option_d, correct_answer, character_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [template.q, template.a, template.b, template.c, template.d, template.correct, character.id]
      );
    }
    console.log('✅ Đã thêm 30 câu hỏi quiz\n');

    // 5. Seed Admin (1 admin mặc định)
    console.log('👤 Đang tạo admin mặc định...');
    const defaultPassword = await bcrypt.hash('admin123', 10);
    await connection.query(
      'INSERT INTO admins (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      ['admin', defaultPassword, 'admin@example.com', 'Admin', 'User']
    );
    console.log('✅ Đã tạo admin mặc định (username: admin, password: admin123)\n');

    console.log('🎉 Hoàn tất reset và seed dữ liệu!');
    console.log('\n📊 Tóm tắt:');
    const [charCount] = await connection.query('SELECT COUNT(*) as count FROM characters');
    const [postCount] = await connection.query('SELECT COUNT(*) as count FROM posts');
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [quizCount] = await connection.query('SELECT COUNT(*) as count FROM quiz_questions');
    const [adminCount] = await connection.query('SELECT COUNT(*) as count FROM admins');

    console.log(`   - Nhân vật: ${charCount[0].count}`);
    console.log(`   - Bài viết: ${postCount[0].count}`);
    console.log(`   - Sản phẩm: ${productCount[0].count}`);
    console.log(`   - Câu hỏi Quiz: ${quizCount[0].count}`);
    console.log(`   - Admin: ${adminCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetAndSeed();
