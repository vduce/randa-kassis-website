/**
 * Server-Side JSON Service
 * Manages JSON metadata files via server API (for production)
 */

const API_URL = process.env.REACT_APP_API_URL || '';

// Map category keys to their JSON filenames
const JSON_FILENAMES = {
  articles: 'articles.json',
  encounters: 'encounterAndDialogue.json',
  interviews_politicians: 'politicians.json',
  interviews_critics: 'essayistandcritics.json'
};

/**
 * Read JSON index from server
 */
export const readJSONIndex = async (categoryKey) => {
  const filename = JSON_FILENAMES[categoryKey];
  if (!filename) {
    return {
      success: false,
      error: { message: `No JSON filename configured for category: ${categoryKey}` }
    };
  }

  try {
    const response = await fetch(`${API_URL}/metadata/api/${filename}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Failed to read JSON for ${categoryKey}:`, error);
    return {
      success: false,
      error: { message: `Failed to read JSON: ${error.message}` }
    };
  }
};

/**
 * Update or add entry in JSON index
 */
export const updateJSONIndexEntry = async (categoryKey, entryFilename, metadata) => {
  const filename = JSON_FILENAMES[categoryKey];
  if (!filename) {
    return {
      success: false,
      error: { message: `No JSON filename configured for category: ${categoryKey}` }
    };
  }

  try {
    console.log(`📝 Updating JSON entry for ${categoryKey}/${entryFilename}`);
    
    const response = await fetch(`${API_URL}/metadata/api/${filename}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        entryFilename,
        metadata
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully updated JSON entry`);
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Failed to update JSON entry:`, error);
    return {
      success: false,
      error: { message: `Failed to update JSON: ${error.message}` }
    };
  }
};

/**
 * Remove entry from JSON index
 */
export const removeJSONIndexEntry = async (categoryKey, entryFilename) => {
  const filename = JSON_FILENAMES[categoryKey];
  if (!filename) {
    return {
      success: false,
      error: { message: `No JSON filename configured for category: ${categoryKey}` }
    };
  }

  try {
    const response = await fetch(`${API_URL}/metadata/api/${filename}/entry/${entryFilename}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Failed to remove JSON entry:`, error);
    return {
      success: false,
      error: { message: `Failed to remove JSON entry: ${error.message}` }
    };
  }
};

/**
 * Get entry from JSON index
 */
export const getJSONIndexEntry = async (categoryKey, entryFilename) => {
  try {
    const readResult = await readJSONIndex(categoryKey);
    if (!readResult.success) {
      return readResult;
    }

    const data = readResult.data;
    if (!Array.isArray(data)) {
      return {
        success: false,
        error: { message: 'Invalid JSON index format' }
      };
    }

    const entry = data.find(item => item.filename === entryFilename);
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
