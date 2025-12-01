/**
 * Main Website Server for randakassis.com
 * + Integrated Bunny Storage Proxy
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
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
      // Return the same status code from Bunny (e.g., 404 for not found)
      return res.status(response.status).json({ 
        error: `HTTP ${response.status}`,
        message: response.statusText 
      });
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
 * Helper function to extract file number from path
 * Supports multiple filename patterns: article1.md, ec1.md, po1.md, ed1.md, etc.
 */
function extractFileNumber(filePath) {
  // Match patterns like: article1.md, ec1.md, po1.md, ed1.md, etc.
  const match = filePath.match(/(?:article|ec|po|ed)(\d+)\.md$/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Helper function to get file prefix from path
 * Returns: 'article', 'ec', 'po', 'ed', etc.
 */
function getFilePrefix(filePath) {
  const match = filePath.match(/(article|ec|po|ed)\d+\.md$/);
  return match ? match[1] : null;
}

/**
 * Helper function to get category name from path
 */
function getCategoryFromPath(filePath) {
  if (filePath.includes('public/articles/')) return 'articles';
  if (filePath.includes('public/encounters/')) return 'encounterAndDialogue';
  if (filePath.includes('public/interviews/politicians/')) return 'politicians';
  if (filePath.includes('public/interviews/essayistcritics/')) return 'essayistandcritics';
  return null;
}

/**
 * Helper function to get metadata filename from category
 */
function getMetadataFilename(category) {
  const mapping = {
    'articles': 'articles.json',
    'encounterAndDialogue': 'encounterAndDialogue.json',
    'politicians': 'politicians.json',
    'essayistandcritics': 'essayistandcritics.json'
  };
  return mapping[category];
}

/**
 * Renumber files after deletion
 * Works with all file types: articles, encounters, politicians, essayist critics
 */
async function renumberFiles(deletedNumber, category, basePath, filePrefix) {
  const results = {
    success: true,
    deletedNumber,
    renamedFiles: [],
    metadataUpdated: false,
    errors: []
  };

  try {
    // Read metadata file
    const metadataFilename = getMetadataFilename(category);
    const metadataPath = path.join(__dirname, 'metadata', metadataFilename);
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found: ${metadataFilename}`);
    }

    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    let metadata = JSON.parse(metadataContent);

    // Find the maximum file number
    const maxNumber = Math.max(...metadata.map(item => {
      const num = extractFileNumber(item.filename);
      return num || 0;
    }));

    console.log(`📋 Renumbering: deleted=${deletedNumber}, max=${maxNumber}, prefix=${filePrefix}`);

    // Renumber files on Bunny Storage (from deletedNumber+1 to maxNumber)
    for (let i = deletedNumber + 1; i <= maxNumber; i++) {
      const oldFilename = `${filePrefix}${i}.md`;
      const newFilename = `${filePrefix}${i - 1}.md`;
      const oldPath = `${basePath}/${oldFilename}`;
      const newPath = `${basePath}/${newFilename}`;

      try {
        // Read the old file
        const readUrl = `${ENDPOINT}/${STORAGE_ZONE}/${oldPath}`;
        const readResponse = await makeRequest(readUrl, {
          headers: { AccessKey: API_KEY }
        });

        if (!readResponse.ok) {
          throw new Error(`Failed to read ${oldFilename}: HTTP ${readResponse.status}`);
        }

        const content = await readResponse.text();

        // Write to new filename
        const writeUrl = `${ENDPOINT}/${STORAGE_ZONE}/${newPath}`;
        const writeResponse = await makeRequest(writeUrl, {
          method: 'PUT',
          headers: {
            AccessKey: API_KEY,
            'Content-Type': 'text/markdown',
            'Content-Length': Buffer.byteLength(content)
          },
          body: content
        });

        if (!writeResponse.ok) {
          throw new Error(`Failed to write ${newFilename}: HTTP ${writeResponse.status}`);
        }

        // Delete the old file
        const deleteUrl = `${ENDPOINT}/${STORAGE_ZONE}/${oldPath}`;
        const deleteResponse = await makeRequest(deleteUrl, {
          method: 'DELETE',
          headers: { AccessKey: API_KEY }
        });

        if (!deleteResponse.ok) {
          throw new Error(`Failed to delete ${oldFilename}: HTTP ${deleteResponse.status}`);
        }

        results.renamedFiles.push({ from: oldFilename, to: newFilename });
        console.log(`✅ Renamed: ${oldFilename} → ${newFilename}`);

      } catch (err) {
        results.errors.push(`Error renaming ${oldFilename}: ${err.message}`);
        console.error(`❌ Error renaming ${oldFilename}:`, err.message);
      }
    }

    // Update metadata: remove deleted entry and renumber subsequent entries
    metadata = metadata.filter(item => {
      const num = extractFileNumber(item.filename);
      return num !== deletedNumber;
    });

    // Renumber the metadata entries
    metadata = metadata.map(item => {
      const num = extractFileNumber(item.filename);
      if (num && num > deletedNumber) {
        return {
          ...item,
          id: item.id - 1,
          filename: `${filePrefix}${num - 1}.md`
        };
      }
      return item;
    });

    // Sort by id to maintain order
    metadata.sort((a, b) => a.id - b.id);

    // Write updated metadata
    let jsonContent = JSON.stringify(metadata, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });

    fs.writeFileSync(metadataPath, jsonContent, 'utf8');
    results.metadataUpdated = true;
    console.log(`✅ Metadata updated: ${metadataFilename}`);

  } catch (err) {
    results.success = false;
    results.errors.push(`Metadata update error: ${err.message}`);
    console.error('❌ Renumbering error:', err.message);
  }

  return results;
}

/**
 * Delete file
 * DELETE /api/storage/delete?path=public/articles/article1.md
 * Supports automatic renumbering for articles, encounters, politicians, essayist critics
 */
app.delete('/api/storage/delete', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: "Path required" });

    // Check if this is a file that needs renumbering
    const fileNumber = extractFileNumber(filePath);
    const filePrefix = getFilePrefix(filePath);
    const category = getCategoryFromPath(filePath);

    if (fileNumber && filePrefix && category) {
      console.log(`🗑️  Delete with renumbering: ${filePrefix}${fileNumber}.md (category: ${category})`);

      // First, delete the target file
      const url = `${ENDPOINT}/${STORAGE_ZONE}/${filePath}`;
      const response = await makeRequest(url, {
        method: 'DELETE',
        headers: { AccessKey: API_KEY }
      });

      if (!response.ok) {
        console.error('Delete failed:', response.status);
        throw new Error(`HTTP ${response.status}`);
      }

      console.log(`✅ Deleted: ${filePrefix}${fileNumber}.md`);

      // Then renumber all subsequent files
      const basePath = filePath.substring(0, filePath.lastIndexOf('/'));
      const renumberResults = await renumberFiles(fileNumber, category, basePath, filePrefix);

      res.json({
        success: true,
        deleted: `${filePrefix}${fileNumber}.md`,
        category: category,
        renumbering: renumberResults
      });

    } else {
      // Simple delete for files that don't need renumbering
      const url = `${ENDPOINT}/${STORAGE_ZONE}/${filePath}`;
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
    }

  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// FRONTEND ROUTES
// ============================================

// Read JSON metadata file
app.get('/metadata/api/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Validate filename
    const allowedFiles = ['articles.json', 'encounterAndDialogue.json', 'politicians.json', 'essayistandcritics.json'];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'metadata', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Read JSON error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update JSON metadata file (add or update entry)
app.post('/metadata/api/:filename/update', (req, res) => {
  try {
    const filename = req.params.filename;
    const { entryFilename, metadata } = req.body;
    
    if (!entryFilename || !metadata) {
      return res.status(400).json({ error: 'Entry filename and metadata required' });
    }
    
    // Validate filename
    const allowedFiles = ['articles.json', 'encounterAndDialogue.json', 'politicians.json', 'essayistandcritics.json'];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'metadata', filename);
    console.log(`📝 Updating JSON entry in: ${filePath}`);
    
    // Read current data
    let data = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(content);
    }
    
    // Find existing entry
    const existingIndex = data.findIndex(item => item.filename === entryFilename);
    
    if (existingIndex >= 0) {
      // Update existing entry
      data[existingIndex] = {
        ...data[existingIndex],
        ...metadata,
        filename: entryFilename
      };
      console.log(`✏️  Updated entry for ${entryFilename}`);
    } else {
      // Add new entry
      const newId = data.length > 0 ? Math.max(...data.map(item => item.id || 0)) + 1 : 1;
      data.push({
        id: newId,
        filename: entryFilename,
        ...metadata
      });
      console.log(`➕ Added new entry for ${entryFilename} with id ${newId}`);
    }
    
    // Write back with Unicode escaping
    let jsonContent = JSON.stringify(data, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });
    
    fs.writeFileSync(filePath, jsonContent, 'utf8');
    
    console.log(`✅ Successfully updated ${filename}`);
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ Update JSON error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete entry from JSON metadata file
app.delete('/metadata/api/:filename/entry/:entryFilename', (req, res) => {
  try {
    const filename = req.params.filename;
    const entryFilename = req.params.entryFilename;
    
    // Validate filename
    const allowedFiles = ['articles.json', 'encounterAndDialogue.json', 'politicians.json', 'essayistandcritics.json'];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    const filePath = path.join(__dirname, 'metadata', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Read current data
    const content = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(content);
    
    // Filter out the entry
    const filteredData = data.filter(item => item.filename !== entryFilename);
    
    // Write back
    let jsonContent = JSON.stringify(filteredData, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return '\\u' + ('0000' + char.charCodeAt(0).toString(16)).slice(-4);
    });
    
    fs.writeFileSync(filePath, jsonContent, 'utf8');
    
    console.log(`🗑️  Deleted entry ${entryFilename} from ${filename}`);
    res.json({ success: true, data: filteredData });
    
  } catch (error) {
    console.error('❌ Delete JSON entry error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check for metadata API
app.get('/metadata/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Metadata API is ready' });
});

// Test route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: [
      'POST /metadata/sync - Sync JSON files',
      'GET /metadata/sync/health - Health check',
      'GET /api/storage/health',
      'GET /api/storage/list?path=public/articles',
      'GET /api/storage/read?path=public/articles/article1.md',
      'PUT /api/storage/write',
      'DELETE /api/storage/delete?path=public/articles/article1.md'
    ]
  });
});

// Serve JSON files from metadata folder (outside build)
const metadataDir = path.join(__dirname, 'metadata');
app.use('/metadata', express.static(metadataDir));

// Serve React build files
const publicDir = path.join(__dirname, 'build');
app.use(express.static(publicDir));

// Catch-all route for React Router (must be last)
// Only serve index.html for non-API and non-metadata routes
app.get(/.*/, (req, res) => {
  // Don't serve index.html for API or metadata routes
  if (req.path.startsWith('/api') || req.path.startsWith('/metadata')) {
    return res.status(404).json({ 
      error: 'Endpoint not found',
      path: req.path
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
