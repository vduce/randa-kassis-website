/**
 * Bunny Storage Proxy Router (Express Router)
 */

const express = require('express');
const router = express.Router();
const https = require('https');
const http = require('http');
const cors = require('cors');

require('dotenv').config();

// Config
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const API_KEY = process.env.REACT_APP_BUNNY_STORAGE_API_KEY;
const ENDPOINT = process.env.REACT_APP_BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com';

/**
 * Helper function to make HTTP requests (replaces fetch)
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = lib.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => res.headers[name.toLowerCase()]
          },
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Allow CORS for local testing + production
router.use(cors({
  origin: ['http://localhost:3036', 'https://randakassis.com', 'https://dev.randakassis.com'],
  credentials: true
}));

// Body parsers
router.use(express.json({ limit: "10mb" }));
router.use(express.text({ limit: "10mb", type: "text/markdown" }));

/**
 * List files
 * GET /api/storage/list?path=public/articles
 */
router.get('/api/storage/list', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}/`;
    
    const response = await makeRequest(url, { 
      headers: { AccessKey: API_KEY } 
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    res.json(await response.json());
  } catch (err) {
    console.error('List error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Read file
 */
router.get('/api/storage/read', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await makeRequest(url, { 
      headers: { AccessKey: API_KEY } 
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const content = await response.text();

    res.json({
      content,
      lastModified: response.headers.get('last-modified'),
      size: content.length
    });
  } catch (err) {
    console.error('Read error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Write file
 */
router.put('/api/storage/write', async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path || content === undefined)
      return res.status(400).json({ error: "Path and content required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await makeRequest(url, {
      method: 'PUT',
      headers: { 
        AccessKey: API_KEY, 
        'Content-Type': 'text/markdown',
        'Content-Length': Buffer.byteLength(content)
      },
      body: content
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    res.json({ success: true });
  } catch (err) {
    console.error('Write error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete file
 */
router.delete('/api/storage/delete', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await makeRequest(url, {
      method: 'DELETE',
      headers: { AccessKey: API_KEY }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Health Check
 */
router.get('/api/storage/health', (req, res) => {
  res.json({
    status: "ok",
    zone: STORAGE_ZONE,
    endpoint: ENDPOINT
  });
});

module.exports = router;
