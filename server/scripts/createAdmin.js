const bcrypt = require('bcryptjs');
const db = require('../config/database');
require('dotenv').config();

async function createAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    
    console.log(`Creating admin user: ${username}`);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.query(
      'INSERT INTO admins (username, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?',
      [username, hashedPassword, hashedPassword]
    );
    
    console.log(`Admin user "${username}" created/updated successfully!`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
