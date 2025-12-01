/**
 * JSON Server Sync Service
 * Syncs JSON index files to server's metadata folder (not CDN)
 */

const API_SYNC_URL = process.env.REACT_APP_API_SYNC_URL || 'http://localhost:8000/metadata/sync';

// Map category keys to their filenames
const JSON_FILENAMES = {
  articles: 'articles.json',
  encounters: 'encounterAndDialogue.json',
  interviews_politicians: 'politicians.json',
  interviews_critics: 'essayistandcritics.json'
};

/**
 * Upload JSON data to server's api folder
 */
export const syncJSONToCDN = async (categoryKey, jsonData) => {
  const filename = JSON_FILENAMES[categoryKey];
  
  if (!filename) {
    console.warn(`⚠️ No filename configured for category: ${categoryKey}`);
    return { success: false, error: { message: 'No filename configured' } };
  }

  try {
    console.log(`📤 Syncing ${categoryKey} JSON to server...`);
    console.log(`   Category: ${categoryKey}`);
    console.log(`   Filename: ${filename}`);
    console.log(`   Items count: ${jsonData.length}`);
    
    // Convert to JSON with Unicode escaping (same as local)
    let jsonContent = JSON.stringify(jsonData, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });

    console.log(`   Content size: ${jsonContent.length} bytes`);
    console.log(`   Sync URL: ${API_SYNC_URL}`);

    const response = await fetch(API_SYNC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filename: filename,
        content: jsonContent
      })
    });

    console.log(`   Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`   Error data:`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ Successfully synced ${categoryKey} to server`);
    console.log(`   Result:`, result);
    
    return { success: true, data: result };
  } catch (error) {
    console.error(`❌ Failed to sync ${categoryKey} to server:`, error);
    console.error(`   Error details:`, error.message);
    return {
      success: false,
      error: { message: `Server sync failed: ${error.message}` }
    };
  }
};

/**
 * Check if server sync is available
 */
export const isCDNSyncAvailable = async () => {
  try {
    const response = await fetch(`${API_SYNC_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('Server sync not available:', error.message);
    return false;
  }
};

/**
 * Get server URL for a JSON file
 */
export const getCDNJsonUrl = (categoryKey) => {
  const filename = JSON_FILENAMES[categoryKey];
  if (!filename) return null;
  
  return `${'/metadata'}/${filename}`;
};
