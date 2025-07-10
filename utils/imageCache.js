// Simple image caching configuration for better performance
const imageCache = new Map();
const CACHE_SIZE_LIMIT = 50; // Limit cache to 50 images
const CACHE_TIME = 1000 * 60 * 30; // 30 minutes

export const getCachedImage = (uri) => {
  const cached = imageCache.get(uri);
  if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
    return cached.data;
  }
  return null;
};

export const setCachedImage = (uri, data) => {
  // Clean old cache if size limit exceeded
  if (imageCache.size >= CACHE_SIZE_LIMIT) {
    const oldestKey = imageCache.keys().next().value;
    imageCache.delete(oldestKey);
  }
  
  imageCache.set(uri, {
    data,
    timestamp: Date.now()
  });
};

export const clearImageCache = () => {
  imageCache.clear();
};

export const preloadImages = async (imageUris) => {
  if (!Array.isArray(imageUris)) return;
  
  const promises = imageUris.map(uri => {
    if (!uri || getCachedImage(uri)) return Promise.resolve();
    
    return new Promise((resolve) => {
      Image.prefetch(uri)
        .then(() => {
          setCachedImage(uri, true);
          resolve();
        })
        .catch(() => resolve()); // Don't fail if one image fails
    });
  });
  
  await Promise.all(promises);
};

// Image optimization settings
export const imageConfig = {
  // Default image quality for uploads
  quality: 0.7,
  // Maximum dimensions
  maxWidth: 1080,
  maxHeight: 1080,
  // Compression format
  compressFormat: 'JPEG',
};

export default {
  getCachedImage,
  setCachedImage,
  clearImageCache,
  preloadImages,
  imageConfig
};
