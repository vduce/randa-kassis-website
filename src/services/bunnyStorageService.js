/**
 * Bunny Storage Service
 * Handles file operations with Bunny CDN Storage API via proxy
 */

// Use proxy server to avoid CORS issues
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';

/**
 * Build proxy API URL
 */
const buildProxyUrl = (endpoint, params = {}) => {
  const url = new URL(`${PROXY_URL}/api/storage/${endpoint}`);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

/**
 * Get headers for proxy requests
 */
const getHeaders = (contentType = 'application/json') => {
  return {
    'Content-Type': contentType,
  };
};

/**
 * Handle API errors
 */
const handleApiError = (error, operation) => {
  console.error(`Bunny Storage ${operation} error:`, error);
  
  if (error.response) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: `Storage API error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: 'NETWORK_ERROR',
      message: `Network error during ${operation}: ${error.message}`
    }
  };
};

export {
  PROXY_URL,
  buildProxyUrl,
  getHeaders,
  handleApiError
};
