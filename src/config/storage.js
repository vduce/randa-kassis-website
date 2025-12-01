/**
 * Storage Configuration
 * Switch between local File System Access API and Bunny CDN Storage
 */

// Storage mode: 'local' or 'bunny'
// Set to 'bunny' to use Bunny CDN Storage API
// Set to 'local' to use File System Access API (current behavior)
export const STORAGE_MODE = process.env.REACT_APP_STORAGE_MODE || 'bunny';

// Check if Bunny Storage is configured
export const isBunnyStorageConfigured = () => {
  return !!(
    process.env.REACT_APP_BUNNY_STORAGE_ZONE &&
    process.env.REACT_APP_BUNNY_STORAGE_API_KEY
  );
};

// Get active storage mode
export const getStorageMode = () => {
  if (STORAGE_MODE === 'bunny' && isBunnyStorageConfigured()) {
    return 'bunny';
  }
  return 'local';
};

export default {
  STORAGE_MODE,
  isBunnyStorageConfigured,
  getStorageMode
};
