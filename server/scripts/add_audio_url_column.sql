-- Script SQL để thêm cột audio_url vào bảng posts
-- Chạy script này trực tiếp trong MySQL/MariaDB

-- Kiểm tra và thêm cột audio_url nếu chưa có
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS audio_url LONGTEXT NULL AFTER image_url;

-- Hoặc nếu MySQL version không hỗ trợ IF NOT EXISTS, dùng cách này:
-- ALTER TABLE posts ADD COLUMN audio_url LONGTEXT NULL AFTER image_url;

-- Kiểm tra kết quả
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME = 'audio_url';
