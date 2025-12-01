/**
 * File System Access API Service
 * Handles all file system operations using the browser's File System Access API
 */

const DB_NAME = 'AdminCMS_FileSystem';
const DB_VERSION = 1;
const STORE_NAME = 'directoryHandles';

/**
 * Initialize IndexedDB for storing directory handles
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Save directory handle to IndexedDB
 */
const saveDirectoryHandle = async (handle) => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.put({
      id: 'rootDirectory',
      handle: handle,
      timestamp: Date.now()
    });

    return { success: true };
  } catch (error) {
    console.error('Error saving directory handle:', error);
    return { success: false, error };
  }
};

/**
 * Get directory handle from IndexedDB
 */
const getDirectoryHandle = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get('rootDirectory');
      request.onsuccess = () => resolve(request.result?.handle || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting directory handle:', error);
    return null;
  }
};

/**
 * Request permission to access a directory
 */
const requestDirectoryAccess = async () => {
  try {
    // Check if File System Access API is supported
    if (!('showDirectoryPicker' in window)) {
      return {
        success: false,
        error: {
          code: 'NOT_SUPPORTED',
          message: 'File System Access API is not supported in this browser. Please use Chrome, Edge, or a compatible browser.'
        }
      };
    }

    // Show directory picker
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    // Verify permission
    const permission = await verifyPermission(handle);
    if (!permission) {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Permission to access the directory was denied.'
        }
      };
    }

    // Save handle to IndexedDB
    await saveDirectoryHandle(handle);

    return {
      success: true,
      data: { handle }
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'USER_CANCELLED',
          message: 'Directory selection was cancelled.'
        }
      };
    }

    return {
      success: false,
      error: {
        code: error.name || 'UNKNOWN_ERROR',
        message: error.message || 'An unknown error occurred while accessing the directory.'
      }
    };
  }
};

/**
 * Verify permission to access a directory handle
 */
const verifyPermission = async (handle, readWrite = true) => {
  const options = { mode: readWrite ? 'readwrite' : 'read' };

  // Check if permission was already granted
  if ((await handle.queryPermission(options)) === 'granted') {
    return true;
  }

  // Request permission
  if ((await handle.requestPermission(options)) === 'granted') {
    return true;
  }

  return false;
};

/**
 * Get or request directory handle
 */
const getOrRequestDirectoryHandle = async (forceNew = false) => {
  try {
    if (!forceNew) {
      // Try to get existing handle
      let handle = await getDirectoryHandle();

      if (handle) {
        // Verify permission is still valid
        const hasPermission = await verifyPermission(handle);
        if (hasPermission) {
          return { success: true, data: { handle } };
        }
      }
    }

    // Request new directory access
    return await requestDirectoryAccess();
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ACCESS_ERROR',
        message: error.message || 'Failed to access directory.'
      }
    };
  }
};

/**
 * Clear stored directory handle
 */
const clearDirectoryHandle = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.delete('rootDirectory');
    return { success: true };
  } catch (error) {
    console.error('Error clearing directory handle:', error);
    return { success: false, error };
  }
};

/**
 * Check if File System Access API is supported
 */
const isFileSystemAccessSupported = () => {
  return 'showDirectoryPicker' in window;
};

/**
 * Handle file system errors and return user-friendly messages
 */
const handleFileSystemError = (error) => {
  const errorMap = {
    'NotAllowedError': 'Permission denied. Please grant access to the directory.',
    'NotFoundError': 'File or directory not found.',
    'InvalidModificationError': 'The file is locked or in use by another application.',
    'QuotaExceededError': 'Storage quota exceeded.',
    'SecurityError': 'Access to this path is not allowed for security reasons.',
    'AbortError': 'Operation was cancelled.',
    'TypeError': 'Invalid operation or parameter.'
  };

  return {
    success: false,
    error: {
      code: error.name || 'UNKNOWN_ERROR',
      message: errorMap[error.name] || error.message || 'An unknown error occurred.',
      details: error
    }
  };
};

export {
  initDB,
  saveDirectoryHandle,
  getDirectoryHandle,
  requestDirectoryAccess,
  verifyPermission,
  getOrRequestDirectoryHandle,
  clearDirectoryHandle,
  isFileSystemAccessSupported,
  handleFileSystemError
};
