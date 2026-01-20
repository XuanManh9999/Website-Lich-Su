/**
 * Utility functions for file handling
 */

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Base64 string
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateImage = (file, maxSizeMB = 5) => {
  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file!' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Vui lòng chọn file ảnh!' };
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Ảnh không được vượt quá ${maxSizeMB}MB!` };
  }

  return { valid: true, error: null };
};

/**
 * Validate audio file
 * @param {File} file - The file to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default: 10MB)
 * @returns {Object} { valid: boolean, error: string }
 */
export const validateAudio = (file, maxSizeMB = 10) => {
  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file!' };
  }

  if (!file.type.startsWith('audio/')) {
    return { valid: false, error: 'Vui lòng chọn file audio!' };
  }

  const maxSize = maxSizeMB * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: `Audio không được vượt quá ${maxSizeMB}MB!` };
  }

  return { valid: true, error: null };
};

/**
 * Format file size to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generate slug from Vietnamese text
 * @param {string} text - Text to convert to slug
 * @returns {string} Slug string
 */
export const generateSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};
