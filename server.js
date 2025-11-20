/**
 * Main Website Server for randakassis.com
 * + Integrated Bunny Storage Proxy
 */

const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Trust proxy (important on shared hosting)
app.set('trust proxy', 1);

// CORS - Allow requests from your domains
app.use(cors({
  origin: ['http://localhost:3036', 'https://randakassis.com', 'https://dev.randakassis.com'],
  credentials: true
}));

// Parse JSON and text
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ limit: "10mb", type: "text/markdown" }));

// Bunny Storage Config
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const API_KEY = process.env.REACT_APP_BUNNY_STORAGE_API_KEY;
const ENDPOINT = process.env.REACT_APP_BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com';

/**
 * Helper function to make HTTP requests to Bunny Storage
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

// ============================================
// BUNNY STORAGE API ROUTES
// ============================================

/**
 * Health Check
 */
app.get('/api/storage/health', (req, res) => {
  res.json({
    status: "ok",
    zone: STORAGE_ZONE,
    endpoint: ENDPOINT,
    timestamp: new Date().toISOString()
  });
});

/**
 * List files in a directory
 * GET /api/storage/list?path=public/articles
 */
app.get('/api/storage/list', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}/`;
    console.log('📂 List request:', url);
    
    const response = await makeRequest(url, { 
      headers: { AccessKey: API_KEY } 
    });

    if (!response.ok) {
      console.error('List failed:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Listed ${data.length} items`);
    res.json(data);
  } catch (err) {
    console.error('❌ List error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Read file content
 * GET /api/storage/read?path=public/articles/article1.md
 */
app.get('/api/storage/read', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    console.log('📖 Read request:', url);
    
    const response = await makeRequest(url, { 
      headers: { AccessKey: API_KEY } 
    });

    if (!response.ok) {
      console.error('Read failed:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    console.log(`✅ Read file (${content.length} bytes)`);

    res.json({
      content,
      lastModified: response.headers.get('last-modified'),
      size: content.length
    });
  } catch (err) {
    console.error('❌ Read error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Write/Update file
 * PUT /api/storage/write
 * Body: { path: 'public/articles/article1.md', content: '...' }
 */
app.put('/api/storage/write', async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path || content === undefined) {
      return res.status(400).json({ error: "Path and content required" });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    console.log('✏️  Write request:', url);
    
    const response = await makeRequest(url, {
      method: 'PUT',
      headers: { 
        AccessKey: API_KEY, 
        'Content-Type': 'text/markdown',
        'Content-Length': Buffer.byteLength(content)
      },
      body: content
    });

    if (!response.ok) {
      console.error('Write failed:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    console.log(`✅ File written (${content.length} bytes)`);
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Write error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete file
 * DELETE /api/storage/delete?path=public/articles/article1.md
 */
app.delete('/api/storage/delete', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    console.log('🗑️  Delete request:', url);
    
    const response = await makeRequest(url, {
      method: 'DELETE',
      headers: { AccessKey: API_KEY }
    });

    if (!response.ok) {
      console.error('Delete failed:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    console.log('✅ File deleted');
    res.json({ success: true });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// FRONTEND ROUTES
// ============================================

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: [
      'GET /api/storage/health',
      'GET /api/storage/list?path=public/articles',
      'GET /api/storage/read?path=public/articles/article1.md',
      'PUT /api/storage/write',
      'DELETE /api/storage/delete?path=public/articles/article1.md'
    ]
  });
});

// Serve React build files
const publicDir = path.join(__dirname, 'build');
app.use(express.static(publicDir));

// Catch-all route for React Router (must be last)
// Only serve index.html for non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      availableEndpoints: [
        'GET /api',
        'GET /api/storage/health',
        'GET /api/storage/list?path=public/articles',
        'GET /api/storage/read?path=public/articles/article1.md',
        'PUT /api/storage/write',
        'DELETE /api/storage/delete?path=public/articles/article1.md'
      ]
    });
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Bunny Storage Zone: ${STORAGE_ZONE}`);
  console.log(`🔑 API Key: ${API_KEY ? '***configured***' : '❌ MISSING'}`);
  console.log(`📂 Serving from: ${publicDir}`);
});
