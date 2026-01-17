const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const { sendResetPasswordEmail } = require("../config/email");

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const admin = rows[0];
    const validPassword = await bcrypt.compare(password, admin.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login error" });
  }
});

// Kiểm tra token
router.get("/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Đăng ký admin mới
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: "Username, email and password required" });
    }

    // Kiểm tra username đã tồn tại
    const [existingUsername] = await db.query("SELECT id FROM admins WHERE username = ?", [username]);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: "Username đã tồn tại" });
    }

    // Kiểm tra email đã tồn tại
    const [existingEmail] = await db.query("SELECT id FROM admins WHERE email = ?", [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO admins (username, password, email, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email, first_name || null, last_name || null]
    );

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username hoặc email đã tồn tại" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Quên mật khẩu - Gửi email reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find admin by email
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);

    if (rows.length === 0) {
      // Don't reveal if email exists for security
      return res.json({ message: "If email exists, a reset link will be sent" });
    }

    const admin = rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save token to database
    try {
      await db.query(
        "INSERT INTO password_reset_tokens (admin_id, token, expires_at) VALUES (?, ?, ?)",
        [admin.id, resetToken, expiresAt]
      );
    } catch (error) {
      // If token exists, update it
      if (error.code === "ER_DUP_ENTRY") {
        await db.query(
          "UPDATE password_reset_tokens SET token = ?, expires_at = ?, used = FALSE WHERE admin_id = ?",
          [resetToken, expiresAt, admin.id]
        );
      } else {
        throw error;
      }
    }

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    
    try {
      await sendResetPasswordEmail(admin.email, resetToken, resetUrl);
      res.json({ message: "If email exists, a reset link will be sent" });
    } catch (emailError) {
      console.error("Email error:", emailError);
      // Still return success for security (don't reveal email issues)
      res.json({ message: "If email exists, a reset link will be sent" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Reset mật khẩu
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    // Find token in database
    const [tokenRows] = await db.query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()",
      [token]
    );

    if (tokenRows.length === 0) {
      return res.status(400).json({ error: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const tokenData = tokenRows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await db.query("UPDATE admins SET password = ? WHERE id = ?", [
      hashedPassword,
      tokenData.admin_id,
    ]);

    // Mark token as used
    await db.query("UPDATE password_reset_tokens SET used = TRUE WHERE token = ?", [token]);

    res.json({ message: "Mật khẩu đã được đặt lại thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Tạo admin mới (chỉ chạy một lần để setup)
router.post("/create", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query("INSERT INTO admins (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Lấy danh sách tất cả admins (admin only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, username, email, first_name, last_name, created_at FROM admins ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Lấy admin theo ID (admin only)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, username, email, first_name, last_name, created_at FROM admins WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Cập nhật admin (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, first_name, last_name, password } = req.body;

    // Kiểm tra admin có tồn tại không
    const [existing] = await db.query("SELECT id FROM admins WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Nếu có password mới, hash nó
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "UPDATE admins SET username = ?, email = ?, first_name = ?, last_name = ?, password = ? WHERE id = ?",
        [username, email, first_name || null, last_name || null, hashedPassword, id]
      );
    } else {
      await db.query(
        "UPDATE admins SET username = ?, email = ?, first_name = ?, last_name = ? WHERE id = ?",
        [username, email, first_name || null, last_name || null, id]
      );
    }

    res.json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// Xóa admin (admin only) - Không được xóa chính mình
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Không cho phép xóa chính mình
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Bạn không thể xóa chính mình" });
    }

    const [result] = await db.query("DELETE FROM admins WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
