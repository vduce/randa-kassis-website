/**
 * Bunny Storage Proxy Router (Express Router)
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const cors = require('cors');

require('dotenv').config();

// Config
const STORAGE_ZONE = process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const API_KEY = process.env.REACT_APP_BUNNY_STORAGE_API_KEY;
const ENDPOINT = process.env.REACT_APP_BUNNY_STORAGE_ENDPOINT || 'https://storage.bunnycdn.com';

// Allow CORS for local testing + production
router.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3036', 'https://randakassis.com'],
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
    const response = await fetch(url, { headers: { AccessKey: API_KEY } });

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
    const response = await fetch(url, { headers: { AccessKey: API_KEY } });

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
    const response = await fetch(url, {
      method: 'PUT',
      headers: { AccessKey: API_KEY, 'Content-Type': 'text/markdown' },
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
    const response = await fetch(url, {
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
