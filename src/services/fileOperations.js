/**
 * File Operations Service
 * Handles CRUD operations for markdown files using File System Access API
 */

import { getOrRequestDirectoryHandle, handleFileSystemError } from './fileSystemService';

/**
 * Get subdirectory handle from a path
 */
const getSubdirectoryHandle = async (rootHandle, path) => {
  try {
    const parts = path.split('/').filter(p => p);
    let currentHandle = rootHandle;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part, { create: false });
    }

    return { success: true, data: { handle: currentHandle } };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * List all markdown files in a category directory
 */
const listFiles = async (categoryPath, forceNewPermission = false) => {
  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle(forceNewPermission);
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to category directory (e.g., 'public/articles')
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;
    const files = [];

    // Iterate through directory entries
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.md')) {
        try {
          const file = await entry.getFile();
          files.push({
            name: entry.name,
            size: file.size,
            modified: file.lastModified,
            modifiedDate: new Date(file.lastModified).toISOString(),
            type: file.type || 'text/markdown'
          });
        } catch (error) {
          console.warn(`Could not read file ${entry.name}:`, error);
        }
      }
    }

    // Sort files by name by default
    files.sort((a, b) => a.name.localeCompare(b.name));

    return {
      success: true,
      data: { files, count: files.length }
    };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Sort files by different criteria
 */
const sortFiles = (files, sortBy = 'name', order = 'asc') => {
  const sorted = [...files];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.modified - b.modified;
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

/**
 * Filter files by search term
 */
const filterFiles = (files, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return files;
  }

  const term = searchTerm.toLowerCase();
  return files.filter(file => 
    file.name.toLowerCase().includes(term)
  );
};

/**
 * Paginate files
 */
const paginateFiles = (files, page = 1, pageSize = 20) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    files: files.slice(startIndex, endIndex),
    totalFiles: files.length,
    totalPages: Math.ceil(files.length / pageSize),
    currentPage: page,
    pageSize: pageSize,
    hasNextPage: endIndex < files.length,
    hasPreviousPage: page > 1
  };
};

/**
 * Read file content from the file system
 */
const readFile = async (categoryPath, filename) => {
  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to category directory
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;

    // Get file handle
    const fileHandle = await dirHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const content = await file.text();

    return {
      success: true,
      data: {
        filename: filename,
        content: content,
        size: file.size,
        modified: file.lastModified,
        modifiedDate: new Date(file.lastModified).toISOString(),
        type: file.type || 'text/markdown'
      }
    };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Cache for file handles to improve performance
 */
const fileHandleCache = new Map();

/**
 * Get cached file handle or fetch new one
 */
const getCachedFileHandle = async (categoryPath, filename) => {
  const cacheKey = `${categoryPath}/${filename}`;
  
  if (fileHandleCache.has(cacheKey)) {
    return fileHandleCache.get(cacheKey);
  }

  try {
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return null;
    }

    const rootHandle = rootResult.data.handle;
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return null;
    }

    const dirHandle = dirResult.data.handle;
    const fileHandle = await dirHandle.getFileHandle(filename);
    
    fileHandleCache.set(cacheKey, fileHandle);
    return fileHandle;
  } catch (error) {
    console.error('Error getting cached file handle:', error);
    return null;
  }
};

/**
 * Clear file handle cache
 */
const clearFileHandleCache = () => {
  fileHandleCache.clear();
};

/**
 * Read file with caching
 */
const readFileWithCache = async (categoryPath, filename) => {
  try {
    const fileHandle = await getCachedFileHandle(categoryPath, filename);
    if (!fileHandle) {
      return await readFile(categoryPath, filename);
    }

    const file = await fileHandle.getFile();
    const content = await file.text();

    return {
      success: true,
      data: {
        filename: filename,
        content: content,
        size: file.size,
        modified: file.lastModified,
        modifiedDate: new Date(file.lastModified).toISOString(),
        type: file.type || 'text/markdown'
      }
    };
  } catch (error) {
    // If cached handle fails, try without cache
    fileHandleCache.delete(`${categoryPath}/${filename}`);
    return await readFile(categoryPath, filename);
  }
};

/**
 * Write content to a file (create or update)
 */
const writeFile = async (categoryPath, filename, content) => {
  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to category directory
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;

    // Check if file exists and get its modification time
    let existingModified = null;
    try {
      const existingHandle = await dirHandle.getFileHandle(filename);
      const existingFile = await existingHandle.getFile();
      existingModified = existingFile.lastModified;
    } catch (error) {
      // File doesn't exist, which is fine for creation
    }

    // Get or create file handle
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    
    // Create writable stream
    const writable = await fileHandle.createWritable();
    
    // Write content
    await writable.write(content);
    
    // Close the stream
    await writable.close();

    // Clear cache for this file
    fileHandleCache.delete(`${categoryPath}/${filename}`);

    // Get updated file info
    const file = await fileHandle.getFile();

    return {
      success: true,
      data: {
        filename: filename,
        size: file.size,
        modified: file.lastModified,
        modifiedDate: new Date(file.lastModified).toISOString(),
        wasUpdated: existingModified !== null,
        previousModified: existingModified
      }
    };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Create a new file with content
 */
const createFile = async (categoryPath, filename, content) => {
  try {
    // Check if file already exists
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;

    // Check if file exists
    try {
      await dirHandle.getFileHandle(filename);
      return {
        success: false,
        error: {
          code: 'FILE_EXISTS',
          message: `File "${filename}" already exists. Use updateFile to modify existing files.`
        }
      };
    } catch (error) {
      // File doesn't exist, proceed with creation
    }

    // Create the file
    return await writeFile(categoryPath, filename, content);
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Update an existing file with new content
 */
const updateFile = async (categoryPath, filename, content, expectedModified = null) => {
  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;

    // Check if file exists and detect concurrent modifications
    try {
      const existingHandle = await dirHandle.getFileHandle(filename);
      const existingFile = await existingHandle.getFile();
      
      // Detect concurrent modifications
      if (expectedModified && existingFile.lastModified !== expectedModified) {
        return {
          success: false,
          error: {
            code: 'CONCURRENT_MODIFICATION',
            message: 'The file has been modified by another process. Please reload and try again.',
            details: {
              expected: expectedModified,
              actual: existingFile.lastModified
            }
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: `File "${filename}" does not exist. Use createFile to create new files.`
        }
      };
    }

    // Update the file
    return await writeFile(categoryPath, filename, content);
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Generate next filename for a category
 */
const generateNextFilename = async (categoryPath, pattern, prefix) => {
  try {
    const listResult = await listFiles(categoryPath);
    if (!listResult.success) {
      return `${prefix}1.md`;
    }

    const files = listResult.data.files;
    const numbers = files
      .map(f => {
        const match = f.name.match(pattern);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => !isNaN(n));

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `${prefix}${maxNumber + 1}.md`;
  } catch (error) {
    return `${prefix}1.md`;
  }
};

/**
 * Delete a file from the file system
 */
const deleteFile = async (categoryPath, filename) => {
  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to category directory
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return dirResult;
    }

    const dirHandle = dirResult.data.handle;

    // Check if file exists
    try {
      await dirHandle.getFileHandle(filename);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: `File "${filename}" does not exist.`
        }
      };
    }

    // Delete the file
    await dirHandle.removeEntry(filename);

    // Clear cache for this file
    fileHandleCache.delete(`${categoryPath}/${filename}`);

    return {
      success: true,
      data: {
        filename: filename,
        deleted: true
      }
    };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Check if a file exists
 */
const fileExists = async (categoryPath, filename) => {
  try {
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return { success: true, data: { exists: false } };
    }

    const rootHandle = rootResult.data.handle;
    const dirResult = await getSubdirectoryHandle(rootHandle, categoryPath);
    if (!dirResult.success) {
      return { success: true, data: { exists: false } };
    }

    const dirHandle = dirResult.data.handle;

    try {
      await dirHandle.getFileHandle(filename);
      return { success: true, data: { exists: true } };
    } catch (error) {
      return { success: true, data: { exists: false } };
    }
  } catch (error) {
    return handleFileSystemError(error);
  }
};

export {
  listFiles,
  sortFiles,
  filterFiles,
  paginateFiles,
  getSubdirectoryHandle,
  readFile,
  readFileWithCache,
  getCachedFileHandle,
  clearFileHandleCache,
  writeFile,
  createFile,
  updateFile,
  generateNextFilename,
  deleteFile,
  fileExists
};
