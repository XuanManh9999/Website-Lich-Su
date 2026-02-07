# Hướng dẫn thêm cột audio_url vào bảng posts

## Vấn đề
Bảng `posts` trong database chưa có cột `audio_url`, nên không thể lưu link audio vào DB.

## Giải pháp

### Cách 1: Chạy SQL trực tiếp (Khuyến nghị)

Mở MySQL client (phpMyAdmin, MySQL Workbench, hoặc command line) và chạy:

```sql
ALTER TABLE posts ADD COLUMN audio_url LONGTEXT NULL AFTER image_url;
```

### Cách 2: Chạy script Node.js

```bash
cd /usr/local/app/Website-Lich-Su
node server/scripts/addAudioUrlToPosts.js
```

**Lưu ý:** Đảm bảo file `.env` có đúng thông tin database:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (thường là `vietsuquan`)

### Cách 3: Chạy file SQL

```bash
mysql -u root -p vietsuquan < server/scripts/add_audio_url_column.sql
```

## Kiểm tra kết quả

Sau khi chạy, kiểm tra bằng SQL:

```sql
SHOW COLUMNS FROM posts LIKE 'audio_url';
```

Hoặc:

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'vietsuquan' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'audio_url';
```

Nếu thấy cột `audio_url` với `DATA_TYPE = 'longtext'` thì đã thành công!
