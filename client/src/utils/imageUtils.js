// Placeholder image as data URI to avoid network requests
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMGY0YzgxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

// Handle image error and prevent infinite loop
export const handleImageError = (e, customPlaceholder = null) => {
  const img = e.target;
  
  // Prevent infinite loop: if already using placeholder, stop
  if (img.src === PLACEHOLDER_IMAGE || img.src === customPlaceholder || img.dataset.errorHandled === 'true') {
    img.style.display = 'none';
    return;
  }
  
  // Mark as handled to prevent re-triggering
  img.dataset.errorHandled = 'true';
  
  // Use custom placeholder if provided, otherwise use default
  img.src = customPlaceholder || PLACEHOLDER_IMAGE;
};

// Get safe image URL with fallback
export const getSafeImageUrl = (imageUrl, fallback = null) => {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallback || PLACEHOLDER_IMAGE;
  }
  
  // If it's already a data URI, return as is
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // If it's a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If it's a relative path, construct full URL
  if (imageUrl.startsWith('/')) {
    const SERVER_BASE_URL = process.env.REACT_APP_API_URL?.replace(/\/api\/?$/, '') || 'https://vietsuquan.io.vn';
    return `${SERVER_BASE_URL}${imageUrl}`;
  }
  
  return imageUrl;
};

export default {
  handleImageError,
  getSafeImageUrl,
  PLACEHOLDER_IMAGE
};
