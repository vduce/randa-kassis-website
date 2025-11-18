/**
 * Simple Express proxy server for Bunny Storage API
 * This handles CORS and keeps API keys secure
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PROXY_PORT || 8000;

// Bunny Storage configuration
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const API_KEY = process.env.REACT_APP_BUNNY_STORAGE_API_KEY;
const ENDPOINT = process.env.REACT_APP_BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com';

// Enable CORS for your React app
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3036', 'randakassis.com'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb', type: 'text/markdown' }));

/**
 * List files in a directory
 * GET /api/storage/list?path=public/articles
 */
app.get('/api/storage/list', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) {
      return res.status(400).json({ error: 'Path parameter required' });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}/`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Read file content
 * GET /api/storage/read?path=public/articles/article1.md
 */
app.get('/api/storage/read', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) {
      return res.status(400).json({ error: 'Path parameter required' });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();
    const lastModified = response.headers.get('last-modified');
    
    res.json({
      content,
      lastModified,
      size: content.length
    });
  } catch (error) {
    console.error('Read error:', error);
    res.status(500).json({ error: error.message });
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
      return res.status(400).json({ error: 'Path and content required' });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': 'text/markdown'
      },
      body: content
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Write error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete file
 * DELETE /api/storage/delete?path=public/articles/article1.md
 */
app.delete('/api/storage/delete', async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) {
      return res.status(400).json({ error: 'Path parameter required' });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'AccessKey': API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', zone: STORAGE_ZONE });
});

app.listen(PORT, () => {
  console.log(`🚀 Bunny Storage Proxy running on http://localhost:${PORT}`);
  console.log(`📦 Storage Zone: ${STORAGE_ZONE}`);
  console.log(`🔑 API Key: ${API_KEY ? '***configured***' : '❌ MISSING'}`);
});
