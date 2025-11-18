/**
 * Unified File Operations
 * Automatically switches between local and Bunny storage based on configuration
 */

import { getStorageMode } from '../config/storage';
import * as localOps from './fileOperations';
import * as bunnyOps from './bunnyStorageOperations';

/**
 * Get the appropriate storage operations based on configuration
 */
const getStorageOps = () => {
  const mode = getStorageMode();
  console.log(`Using storage mode: ${mode}`);
  return mode === 'bunny' ? bunnyOps : localOps;
};

/**
 * List files in a category directory
 */
export const listFiles = async (categoryPath, forceNewPermission = false) => {
  const ops = getStorageOps();
  return await ops.listFiles(categoryPath, forceNewPermission);
};

/**
 * Read file content
 */
export const readFile = async (categoryPath, filename) => {
  const ops = getStorageOps();
  return await ops.readFile(categoryPath, filename);
};

/**
 * Create a new file
 */
export const createFile = async (categoryPath, filename, content) => {
  const ops = getStorageOps();
  return await ops.createFile(categoryPath, filename, content);
};

/**
 * Update an existing file
 */
export const updateFile = async (categoryPath, filename, content, expectedModified = null) => {
  const ops = getStorageOps();
  // Bunny storage doesn't support concurrent modification checks
  if (getStorageMode() === 'bunny') {
    return await ops.updateFile(categoryPath, filename, content);
  }
  return await ops.updateFile(categoryPath, filename, content, expectedModified);
};

/**
 * Delete a file
 */
export const deleteFile = async (categoryPath, filename) => {
  const ops = getStorageOps();
  return await ops.deleteFile(categoryPath, filename);
};

/**
 * Generate next filename
 */
export const generateNextFilename = async (categoryPath, pattern, prefix) => {
  const ops = getStorageOps();
  return await ops.generateNextFilename(categoryPath, pattern, prefix);
};

/**
 * Sort files
 */
export const sortFiles = (files, sortBy, order) => {
  const ops = getStorageOps();
  return ops.sortFiles(files, sortBy, order);
};

/**
 * Filter files
 */
export const filterFiles = (files, searchTerm) => {
  const ops = getStorageOps();
  return ops.filterFiles(files, searchTerm);
};

/**
 * Paginate files
 */
export const paginateFiles = (files, page, pageSize) => {
  const ops = getStorageOps();
  return ops.paginateFiles(files, page, pageSize);
};

// Export storage mode info
export { getStorageMode }