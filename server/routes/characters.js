const express = require("express");
const router = express.Router();
const db = require("../config/database");
const upload = require("../middleware/upload");
const { authenticateToken } = require("../middleware/auth");

// Lấy danh sách nhân vật
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM characters ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Lấy nhân vật theo slug (cho NFC)
router.get("/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await db.query("SELECT * FROM characters WHERE slug = ?", [
      slug,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Lấy nhân vật theo ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM characters WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Tạo nhân vật mới (admin only)
router.post(
  "/",
  authenticateToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, slug, timeline, summary, content } = req.body;
      const imageFile = req.files?.image?.[0];
      const audioFile = req.files?.audio?.[0];

      const imageUrl = imageFile ? `/uploads/${imageFile.filename}` : null;
      const audioUrl = audioFile ? `/uploads/${audioFile.filename}` : null;

      const [result] = await db.query(
        "INSERT INTO characters (name, slug, timeline, image_url, summary, content, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [name, slug, timeline, imageUrl, summary, content, audioUrl]
      );

      res.status(201).json({
        id: result.insertId,
        message: "Character created successfully",
      });
    } catch (error) {
      console.error(error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Slug already exists" });
      }
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Cập nhật nhân vật (admin only)
router.put(
  "/:id",
  authenticateToken,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, slug, timeline, summary, content } = req.body;
      const imageFile = req.files?.image?.[0];
      const audioFile = req.files?.audio?.[0];

      // Lấy thông tin hiện tại
      const [current] = await db.query(
        "SELECT image_url, audio_url FROM characters WHERE id = ?",
        [id]
      );
      if (current.length === 0) {
        return res.status(404).json({ error: "Character not found" });
      }

      const imageUrl = imageFile
        ? `/uploads/${imageFile.filename}`
        : current[0].image_url;
      const audioUrl = audioFile
        ? `/uploads/${audioFile.filename}`
        : current[0].audio_url;

      await db.query(
        "UPDATE characters SET name = ?, slug = ?, timeline = ?, image_url = ?, summary = ?, content = ?, audio_url = ? WHERE id = ?",
        [name, slug, timeline, imageUrl, summary, content, audioUrl, id]
      );

      res.json({ message: "Character updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Database error" });
    }
  }
);

// Xóa nhân vật (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM characters WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Character not found" });
    }

    res.json({ message: "Character deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
