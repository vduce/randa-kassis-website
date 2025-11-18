/**
 * Bunny Storage Operations
 * CRUD operations for files on Bunny CDN Storage via proxy
 */

import { buildProxyUrl, getHeaders, handleApiError } from './bunnyStorageService';

/**
 * List files in a directory
 */
export const listFiles = async (categoryPath) => {
  try {
    const url = buildProxyUrl('list', { path: `public/${categoryPath}` });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Filter only .md files and format the response
    const files = data
      .filter(item => item.IsDirectory === false && item.ObjectName.endsWith('.md'))
      .map(item => ({
        name: item.ObjectName,
        size: item.Length,
        modified: new Date(item.LastChanged).getTime(),
        modifiedDate: item.LastChanged,
        type: 'text/markdown'
      }));

    return {
      success: true,
      data: { files, count: files.length }
    };
  } catch (error) {
    return handleApiError(error, 'list files');
  }
};

/**
 * Read file content
 */
export const readFile = async (categoryPath, filename) => {
  try {
    const url = buildProxyUrl('read', { path: `public/${categoryPath}/${filename}` });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        filename,
        content: data.content,
        size: data.size,
        modified: data.lastModified ? new Date(data.lastModified).getTime() : Date.now(),
        modifiedDate: data.lastModified || new Date().toISOString(),
        type: 'text/markdown'
      }
    };
  } catch (error) {
    return handleApiError(error, 'read file');
  }
};

/**
 * Create a new file
 */
export const createFile = async (categoryPath, filename, content) => {
  try {
    // Check if file exists first
    const existsCheck = await readFile(categoryPath, filename);
    if (existsCheck.success) {
      return {
        success: false,
        error: {
          code: 'FILE_EXISTS',
          message: `File "${filename}" already exists.`
        }
      };
    }

    // Create the file
    return await writeFile(categoryPath, filename, content);
  } catch (error) {
    return handleApiError(error, 'create file');
  }
};

/**
 * Write/Update file content
 */
export const writeFile = async (categoryPath, filename, content) => {
  try {
    const url = buildProxyUrl('write');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: getHeaders('application/json'),
      body: JSON.stringify({
        path: `public/${categoryPath}/${filename}`,
        content
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return {
      success: true,
      data: {
        filename,
        size: content.length,
        modified: Date.now(),
        modifiedDate: new Date().toISOString()
      }
    };
  } catch (error) {
    return handleApiError(error, 'write file');
  }
};

/**
 * Update existing file
 */
export const updateFile = async (categoryPath, filename, content) => {
  try {
    // Check if file exists
    const existsCheck = await readFile(categoryPath, filename);
    if (!existsCheck.success) {
      return {
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: `File "${filename}" does not exist.`
        }
      };
    }

    // Update the file
    return await writeFile(categoryPath, filename, content);
  } catch (error) {
    return handleApiError(error, 'update file');
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (categoryPath, filename) => {
  try {
    const url = buildProxyUrl('delete', { path: `public/${categoryPath}/${filename}` });
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return {
      success: true,
      data: {
        filename,
        deleted: true
      }
    };
  } catch (error) {
    return handleApiError(error, 'delete file');
  }
};

/**
 * Generate next filename for a category
 */
export const generateNextFilename = async (categoryPath, pattern, prefix) => {
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
 * Sort, filter, and paginate helpers
 */
export const sortFiles = (files, sortBy = 'name', order = 'asc') => {
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

export const filterFiles = (files, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return files;
  }
  const term = searchTerm.toLowerCase();
  return files.filter(file => file.name.toLowerCase().includes(term));
};

export const paginateFiles = (files, page = 1, pageSize = 20) => {
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
