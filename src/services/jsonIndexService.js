/**
 * JSON Index Service
 * Handles reading and updating JSON index files in src/api/
 */

import { getOrRequestDirectoryHandle, handleFileSystemError } from './fileSystemService';

// Map category keys to their JSON index file paths (relative to project root)
const JSON_INDEX_PATHS = {
  articles: 'src/api/articles.json',
  encounters: 'src/api/encounters.json',
  interviews_politicians: 'src/api/politicians.json',
  interviews_painters: 'src/api/painters.json',
  interviews_critics: 'src/api/critics.json',
  story: 'src/api/story.json',
  paintings: 'src/api/paintings.json',
  exhibitions: 'src/api/exhibitions.json',
  throughMyEyes: 'src/api/throughMyEyes.json'
};

/**
 * Read JSON index file using File System Access API
 */
export const readJSONIndex = async (categoryKey) => {
  const jsonPath = JSON_INDEX_PATHS[categoryKey];
  if (!jsonPath) {
    return {
      success: false,
      error: { message: `No JSON index path configured for category: ${categoryKey}` }
    };
  }

  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to src/api directory
    const srcHandle = await rootHandle.getDirectoryHandle('src');
    const apiHandle = await srcHandle.getDirectoryHandle('api');
    
    // Get the JSON file
    const filename = jsonPath.split('/').pop();
    const fileHandle = await apiHandle.getFileHandle(filename);
    const file = await fileHandle.getFile();
    const content = await file.text();
    
    const data = JSON.parse(content);
    return { success: true, data };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Write JSON index file using File System Access API
 */
export const writeJSONIndex = async (categoryKey, data) => {
  const jsonPath = JSON_INDEX_PATHS[categoryKey];
  if (!jsonPath) {
    return {
      success: false,
      error: { message: `No JSON index path configured for category: ${categoryKey}` }
    };
  }

  try {
    // Get root directory handle
    const rootResult = await getOrRequestDirectoryHandle();
    if (!rootResult.success) {
      return rootResult;
    }

    const rootHandle = rootResult.data.handle;

    // Navigate to src/api directory
    const srcHandle = await rootHandle.getDirectoryHandle('src');
    const apiHandle = await srcHandle.getDirectoryHandle('api');
    
    // Get or create the JSON file
    const filename = jsonPath.split('/').pop();
    const fileHandle = await apiHandle.getFileHandle(filename, { create: true });
    
    // Write the content with Unicode escaping
    const writable = await fileHandle.createWritable();
    
    // Convert to JSON with Unicode escaping
    let jsonContent = JSON.stringify(data, null, 2);
    
    // Replace non-ASCII characters with Unicode escape sequences
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });
    
    await writable.write(jsonContent);
    await writable.close();

    return { success: true };
  } catch (error) {
    return handleFileSystemError(error);
  }
};

/**
 * Update or add entry in JSON index
 */
export const updateJSONIndexEntry = async (categoryKey, filename, metadata) => {
  try {
    // Read current index
    const readResult = await readJSONIndex(categoryKey);
    if (!readResult.success) {
      return readResult;
    }

    let indexData = readResult.data;
    if (!Array.isArray(indexData)) {
      indexData = [];
    }

    // Find existing entry
    const existingIndex = indexData.findIndex(item => item.filename === filename);

    if (existingIndex >= 0) {
      // Update existing entry
      indexData[existingIndex] = {
        ...indexData[existingIndex],
        ...metadata,
        filename
      };
    } else {
      // Add new entry
      const newId = indexData.length > 0 
        ? Math.max(...indexData.map(item => item.id || 0)) + 1 
        : 1;
      
      indexData.push({
        id: newId,
        filename,
        ...metadata
      });
    }

    // Write updated index
    return await writeJSONIndex(categoryKey, indexData);
  } catch (error) {
    return {
      success: false,
      error: { message: `Failed to update JSON index: ${error.message}` }
    };
  }
};

/**
 * Remove entry from JSON index
 */
export const removeJSONIndexEntry = async (categoryKey, filename) => {
  try {
    // Read current index
    const readResult = await readJSONIndex(categoryKey);
    if (!readResult.success) {
      return readResult;
    }

    let indexData = readResult.data;
    if (!Array.isArray(indexData)) {
      return { success: true }; // Nothing to remove
    }

    // Filter out the entry
    const filteredData = indexData.filter(item => item.filename !== filename);

    // Write updated index
    return await writeJSONIndex(categoryKey, filteredData);
  } catch (error) {
    return {
      success: false,
      error: { message: `Failed to remove from JSON index: ${error.message}` }
    };
  }
};

/**
 * Get entry from JSON index
 */
export const getJSONIndexEntry = async (categoryKey, filename) => {
  try {
    const readResult = await readJSONIndex(categoryKey);
    if (!readResult.success) {
      return readResult;
    }

    const indexData = readResult.data;
    if (!Array.isArray(indexData)) {
      return {
        success: false,
        error: { message: 'Invalid JSON index format' }
      };
    }

    const entry = indexData.find(item => item.filename === filename);
    if (entry) {
      return { success: true, data: entry };
    }

    return {
      success: false,
      error: { message: 'Entry not found in index' }
    };
  } catch (error) {
    return {
      success: false,
      error: { message: `Failed to get JSON index entry: ${error.message}` }
    };
  }
};
