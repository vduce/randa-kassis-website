/**
 * CDN JSON Service
 * Fetches JSON files from server's api folder (not from build)
 */

// Base URL for JSON files (served from /metadata/ folder on server)
const API_BASE_URL = process.env.REACT_APP_API_URL || '/metadata';

// Cache for JSON data to avoid repeated requests
const jsonCache = new Map();
const CACHE_DURATION = 10 * 1000; // 30 seconds (for easier testing)

/**
 * Fetch JSON file from server with caching
 * @param {string} filename - JSON filename (e.g., 'articles.json')
 * @param {boolean} forceRefresh - Skip cache and fetch fresh data
 * @returns {Promise<Array>} JSON data
 */
export const fetchJsonFromCdn = async (filename, forceRefresh = false) => {
  const cacheKey = filename;
  const now = Date.now();
  
  // Check cache first (unless force refresh)
  if (!forceRefresh && jsonCache.has(cacheKey)) {
    const cached = jsonCache.get(cacheKey);
    if (now - cached.timestamp < CACHE_DURATION) {
      console.log(`📋 Using cached ${filename}`);
      return cached.data;
    }
  }
  
  try {
    // Add cache busting parameter when force refresh
    const cacheBuster = forceRefresh ? `?t=${Date.now()}` : '';
    const url = `${API_BASE_URL}/${filename}${cacheBuster}`;
    console.log(`📥 Fetching ${filename} from server:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    jsonCache.set(cacheKey, {
      data,
      timestamp: now
    });
    
    console.log(`✅ Loaded ${filename}: ${data.length} items`);
    return data;
    
  } catch (error) {
    console.error(`❌ Failed to fetch ${filename}:`, error);
    
    // Return cached data if available, even if expired
    if (jsonCache.has(cacheKey)) {
      console.log(`⚠️ Using stale cache for ${filename}`);
      return jsonCache.get(cacheKey).data;
    }
    
    // Return empty array as fallback
    console.log(`🔄 Returning empty array for ${filename}`);
    return [];
  }
};

/**
 * Clear cache for a specific file or all files
 * @param {string} filename - Optional filename to clear, or clear all if not provided
 */
export const clearJsonCache = (filename = null) => {
  if (filename) {
    jsonCache.delete(filename);
    console.log(`🗑️ Cleared cache for ${filename}`);
  } else {
    jsonCache.clear();
    console.log('🗑️ Cleared all JSON cache');
  }
};

/**
 * Preload JSON files for better performance
 * @param {Array<string>} filenames - Array of JSON filenames to preload
 */
export const preloadJsonFiles = async (filenames) => {
  console.log('🚀 Preloading JSON files:', filenames);
  
  const promises = filenames.map(filename => 
    fetchJsonFromCdn(filename).catch(error => {
      console.warn(`Failed to preload ${filename}:`, error);
      return [];
    })
  );
  
  await Promise.all(promises);
  console.log('✅ JSON preloading complete');
};

/**
 * Specific functions for each content type
 */
export const fetchArticles = () => fetchJsonFromCdn('articles.json');
export const fetchEncounters = () => fetchJsonFromCdn('encounterAndDialogue.json');
export const fetchPoliticians = () => fetchJsonFromCdn('politicians.json');
export const fetchCritics = () => fetchJsonFromCdn('essayistandcritics.json');

/**
 * Refresh specific content type
 */
export const refreshArticles = () => fetchJsonFromCdn('articles.json', true);
export const refreshEncounters = () => fetchJsonFromCdn('encounterAndDialogue.json', true);
export const refreshPoliticians = () => fetchJsonFromCdn('politicians.json', true);
export const refreshCritics = () => fetchJsonFromCdn('essayistandcritics.json', true);

export default {
  fetchJsonFromCdn,
  clearJsonCache,
  preloadJsonFiles,
  fetchArticles,
  fetchEncounters,
  fetchPoliticians,
  fetchCritics,
  refreshArticles,
  refreshEncounters,
  refreshPoliticians,
  refreshCritics
};
