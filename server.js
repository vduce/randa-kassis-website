/**
 * Main Website Server for randakassis.com
 * + Integrated Bunny Storage Proxy
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const cors = require("cors");
require("dotenv").config({ path: process.env.RANDA_ENV_FILE || path.join(__dirname, '.env') });

const { atomicWrite, createMutationLock, deleteContent, rememberHighWater } = require('./server/contentTransactions');
const app = express();
app.disable('x-powered-by');
const metadataDir = process.env.METADATA_DIR ? path.resolve(__dirname, process.env.METADATA_DIR) : (fs.existsSync(path.join(__dirname, "metadata"))
  ? path.join(__dirname, "metadata")
  : path.join(__dirname, "public", "metadata"));

const withMutationLock = createMutationLock(metadataDir);

// Trust proxy (important on shared hosting)
app.set("trust proxy", 1);

// CORS - Allow requests from your domains
app.use(
  cors({
    origin: [
      "http://localhost:3004",
      "http://localhost:3036",
      "https://randakassis.com",
      "https://dev.randakassis.com",
    ],
    credentials: true,
  }),
);

// Parse JSON and text
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ limit: "10mb", type: "text/markdown" }));
require('./server/adminAuth')(app);
const READ_ONLY = process.env.CONTENT_READ_ONLY === 'true' || Boolean(process.env.METADATA_SOURCE_URL) || Boolean(process.env.CONTENT_OVERRIDE_DIR);
app.use(['/api/storage', '/metadata/api'], (req, res, next) => {
  if (READ_ONLY && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return res.status(403).json({ error: 'Production preview is read-only' });
  }
  next();
});

// Bunny Storage Config
const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || process.env.REACT_APP_BUNNY_STORAGE_ZONE;
const API_KEY = process.env.BUNNY_STORAGE_API_KEY || process.env.APP_BUNNY_STORAGE_API_KEY || process.env.REACT_APP_BUNNY_STORAGE_API_KEY;
const ENDPOINT =
  process.env.BUNNY_STORAGE_ENDPOINT || process.env.APP_BUNNY_STORAGE_ENDPOINT ||
  process.env.REACT_APP_BUNNY_STORAGE_ENDPOINT ||
  "https://storage.bunnycdn.com";
const CONTENT_ROOT = process.env.BUNNY_CONTENT_ROOT || 'public/public';
const contentDirectories = ['articles', 'encounters', 'interviews/politicians',
  'interviews/painters', 'interviews/essayistcritics', 'story', 'paintings',
  'exhibitions', 'gallery/myeyes', 'gallery/companion', 'gallery/arena'];
const metadataFiles = ['articles.json', 'encounterAndDialogue.json', 'politicians.json', 'essayistandcritics.json'];
const metadataSource = (process.env.METADATA_SOURCE_URL || '').replace(/\/$/, '');
const overrideDir = process.env.CONTENT_OVERRIDE_DIR && path.resolve(__dirname, process.env.CONTENT_OVERRIDE_DIR);

function validContentPath(relativePath) {
  return typeof relativePath === 'string' && contentDirectories.some(directory =>
    relativePath.startsWith(`${directory}/`) && /^[a-zA-Z0-9_-]+\.md$/.test(relativePath.slice(directory.length + 1)));
}

async function readMetadata(filename) {
  if (!metadataFiles.includes(filename)) throw new Error('Invalid metadata filename');
  if (!metadataSource) return JSON.parse(fs.readFileSync(path.join(metadataDir, filename), 'utf8'));
  const response = await makeRequest(`${metadataSource}/${filename}`);
  if (!response.ok) throw new Error(`Metadata source returned HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error('Metadata source did not return an array');
  return data;
}

// Published Markdown is readable without admin credentials; the storage key stays on the server.
app.get(/^\/api\/content\/(.+)$/, async (req, res) => {
  const relativePath = req.params[0];
  if (!validContentPath(relativePath)) return res.status(400).json({ error: 'Invalid content path' });
  res.set('Cache-Control', 'no-cache');
  try {
    const override = overrideDir && path.join(overrideDir, relativePath);
    if (override && fs.existsSync(override)) return res.type('text/markdown').send(fs.readFileSync(override, 'utf8'));
    const response = await makeRequest(`${ENDPOINT}/${STORAGE_ZONE}/${CONTENT_ROOT}/${relativePath}`, { headers: { AccessKey: API_KEY } });
    if (!response.ok) return res.status(response.status).json({ error: `Content returned HTTP ${response.status}` });
    res.type('text/markdown').send(await response.text());
  } catch (err) { res.status(502).json({ error: err.message }); }
});

if (metadataSource) app.get('/metadata/:filename', async (req, res) => {
  if (!metadataFiles.includes(req.params.filename)) return res.status(404).json({ error: 'File not found' });
  try { res.set('Cache-Control', 'no-cache').json(await readMetadata(req.params.filename)); }
  catch (err) { res.status(502).json({ error: err.message }); }
});

app.use('/api/storage', (req, res, next) => {
  if (req.path === '/health') return next();
  const requested = req.method === 'PUT' ? req.body?.path : req.query.path;
  const valid = typeof requested === 'string' && contentDirectories.some(directory => {
    const base = `${CONTENT_ROOT}/${directory}`;
    return req.path === '/list' ? requested === base :
      requested.startsWith(`${base}/`) && /^[a-zA-Z0-9_-]+\.md$/.test(requested.slice(base.length + 1));
  });
  if (!valid) return res.status(400).json({ error: 'Invalid content path' });
  if (!STORAGE_ZONE || !API_KEY) return res.status(503).json({ error: 'Bunny storage is not configured' });
  next();
});

/**
 * Helper function to make HTTP requests to Bunny Storage
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const lib = isHttps ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = lib.request(reqOptions, (res) => {
      let data = "";
      res.setEncoding('utf8');

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => res.headers[name.toLowerCase()],
          },
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data)),
        });
      });
    });

    req.on("error", reject);
    req.setTimeout(20000, () => req.destroy(new Error('Bunny storage request timed out')));

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
app.get("/api/storage/health", (req, res) => {
  res.json({
    status: "ok",
    zone: STORAGE_ZONE,
    endpoint: ENDPOINT,
    contentRoot: CONTENT_ROOT,
    readOnly: READ_ONLY,
    metadataSource: metadataSource ? 'remote' : 'local',
    timestamp: new Date().toISOString(),
  });
});

/**
 * List files in a directory
 * GET /api/storage/list?path=public/articles
 */
app.get("/api/storage/list", async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}/`;
    console.log("📂 List request:", url);

    const response = await makeRequest(url, {
      headers: { AccessKey: API_KEY },
    });

    if (!response.ok) {
      console.error("List failed:", response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Listed ${data.length} items`);
    res.json(data);
  } catch (err) {
    console.error("❌ List error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Read file content
 * GET /api/storage/read?path=public/articles/article1.md
 */
app.get("/api/storage/read", async (req, res) => {
  try {
    const path = req.query.path;
    if (!path) return res.status(400).json({ error: "Path required" });

    const relativePath = path.slice(CONTENT_ROOT.length + 1);
    const override = overrideDir && require('path').join(overrideDir, relativePath);
    if (override && fs.existsSync(override)) {
      const content = fs.readFileSync(override, 'utf8');
      return res.json({ content, size: Buffer.byteLength(content), lastModified: fs.statSync(override).mtime.toISOString(), source: 'preserved-production' });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    console.log("📖 Read request:", url);

    const response = await makeRequest(url, {
      headers: { AccessKey: API_KEY },
    });

    if (!response.ok) {
      console.error("Read failed:", response.status);
      // Return the same status code from Bunny (e.g., 404 for not found)
      return res.status(response.status).json({
        error: `HTTP ${response.status}`,
        message: response.statusText,
      });
    }

    const content = await response.text();
    console.log(`✅ Read file (${content.length} bytes)`);

    res.json({
      content,
      lastModified: response.headers.get("last-modified"),
      size: content.length,
    });
  } catch (err) {
    console.error("❌ Read error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Write/Update file
 * PUT /api/storage/write
 * Body: { path: 'public/articles/article1.md', content: '...' }
 */
app.put("/api/storage/write", withMutationLock(async (req, res) => {
  try {
    const { path, content } = req.body;
    if (!path || typeof content !== 'string') {
      return res.status(400).json({ error: "Path and content required" });
    }

    const url = `${ENDPOINT}/${STORAGE_ZONE}/${path}`;
    console.log("✏️  Write request:", url);

    const response = await makeRequest(url, {
      method: "PUT",
      headers: {
        AccessKey: API_KEY,
        "Content-Type": "text/markdown",
        "Content-Length": Buffer.byteLength(content),
      },
      body: content,
    });

    if (!response.ok) {
      console.error("Write failed:", response.status);
      throw new Error(`HTTP ${response.status}`);
    }

    console.log(`✅ File written (${content.length} bytes)`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Write error:", err.message);
    res.status(500).json({ error: err.message });
  }
}));

/**
 * Helper function to get category name from path
 */
function getCategoryFromPath(filePath) {
  if (filePath.includes("public/articles/")) return "articles";
  if (filePath.includes("public/encounters/")) return "encounterAndDialogue";
  if (filePath.includes("public/interviews/politicians/")) return "politicians";
  if (filePath.includes("public/interviews/essayistcritics/"))
    return "essayistandcritics";
  return null;
}

/**
 * Helper function to get metadata filename from category
 */
function getMetadataFilename(category) {
  const mapping = {
    articles: "articles.json",
    encounterAndDialogue: "encounterAndDialogue.json",
    politicians: "politicians.json",
    essayistandcritics: "essayistandcritics.json",
  };
  return mapping[category];
}

// Delete only the selected document; preserve other filenames and public IDs.
app.delete("/api/storage/delete", withMutationLock(async (req, res) => {
  try {
    const category = getCategoryFromPath(req.query.path);
    const result = await deleteContent({
      filePath: req.query.path,
      metadataFilename: category ? getMetadataFilename(category) : null,
      metadataDir,
      backupDir: process.env.CONTENT_BACKUP_DIR || path.join(__dirname, '.content-backups'),
      request: makeRequest,
      baseUrl: `${ENDPOINT}/${STORAGE_ZONE}`,
      apiKey: API_KEY,
    });
    res.json(result);
  } catch (err) {
    if (err.code === 'RECOVERY_REQUIRED') res.locals.keepContentLock = true;
    res.status(err.status || 500).json({ error: err.message, code: err.code, backupId: err.backupId });
  }
}));

// ============================================
// FRONTEND ROUTES
// ============================================

app.get("/metadata/api/health", (req, res) => {
  res.json({ status: "ok", message: "Metadata API is ready" });
});

// Read JSON metadata file
app.get("/metadata/api/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;

    // Validate filename
    const allowedFiles = [
      "articles.json",
      "encounterAndDialogue.json",
      "politicians.json",
      "essayistandcritics.json",
    ];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    if (metadataSource) return res.json({ success: true, data: await readMetadata(filename) });
    const filePath = path.join(metadataDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Read JSON error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update JSON metadata file (add or update entry)
app.post("/metadata/api/:filename/update", withMutationLock((req, res) => {
  try {
    const filename = req.params.filename;
    const { entryFilename, metadata } = req.body;

    if (!entryFilename || !metadata) {
      return res
        .status(400)
        .json({ error: "Entry filename and metadata required" });
    }

    // Validate filename
    const allowedFiles = [
      "articles.json",
      "encounterAndDialogue.json",
      "politicians.json",
      "essayistandcritics.json",
    ];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(metadataDir, filename);
    console.log(`📝 Updating JSON entry in: ${filePath}`);

    // Read current data
    let data = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      data = JSON.parse(content);
    }

    // Find existing entry
    const existingIndex = data.findIndex(
      (item) => item.filename === entryFilename,
    );

    if (existingIndex >= 0) {
      // Update existing entry
      data[existingIndex] = {
        ...data[existingIndex],
        ...metadata,
        id: data[existingIndex].id,
        filename: entryFilename,
      };
      console.log(`✏️  Updated entry for ${entryFilename}`);
    } else {
      // Add new entry
      const newId =
        rememberHighWater(metadataDir, filename, data, true);
      data.push({
        ...metadata,
        id: newId,
        filename: entryFilename,
      });
      console.log(`➕ Added new entry for ${entryFilename} with id ${newId}`);
    }

    // Write back with Unicode escaping
    let jsonContent = JSON.stringify(data, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
    });

    atomicWrite(filePath, jsonContent);

    console.log(`✅ Successfully updated ${filename}`);
    res.json({ success: true, data });
  } catch (error) {
    console.error("❌ Update JSON error:", error);
    res.status(500).json({ error: error.message });
  }
}));

// Delete entry from JSON metadata file
app.delete("/metadata/api/:filename/entry/:entryFilename", withMutationLock((req, res) => {
  try {
    const filename = req.params.filename;
    const entryFilename = req.params.entryFilename;

    // Validate filename
    const allowedFiles = [
      "articles.json",
      "encounterAndDialogue.json",
      "politicians.json",
      "essayistandcritics.json",
    ];
    if (!allowedFiles.includes(filename)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(metadataDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    // Read current data
    const content = fs.readFileSync(filePath, "utf8");
    let data = JSON.parse(content);

    rememberHighWater(metadataDir, filename, data);
    // Filter out the entry
    const filteredData = data.filter((item) => item.filename !== entryFilename);

    // Write back
    let jsonContent = JSON.stringify(filteredData, null, 2);
    jsonContent = jsonContent.replace(/[\u007F-\uFFFF]/g, (char) => {
      return "\\u" + ("0000" + char.charCodeAt(0).toString(16)).slice(-4);
    });

    atomicWrite(filePath, jsonContent);

    console.log(`🗑️  Deleted entry ${entryFilename} from ${filename}`);
    res.json({ success: true, data: filteredData });
  } catch (error) {
    console.error("❌ Delete JSON entry error:", error);
    res.status(500).json({ error: error.message });
  }
}));

// Test route
app.get("/api", (req, res) => {
  res.json({
    message: "API is running",
    endpoints: [
      "POST /metadata/sync - Sync JSON files",
      "GET /metadata/sync/health - Health check",
      "GET /api/storage/health",
      "GET /api/storage/list?path=public/articles",
      "GET /api/storage/read?path=public/articles/article1.md",
      "PUT /api/storage/write",
      "DELETE /api/storage/delete?path=public/articles/article1.md",
    ],
  });
});

// Serve JSON files from metadata folder (outside build)
app.use("/metadata", express.static(metadataDir, {
  setHeaders: res => res.setHeader('Cache-Control', 'no-cache'),
}));

// Serve React build files
const publicDir = path.resolve(__dirname, process.env.BUILD_DIR || 'build');
app.use(express.static(publicDir));

// Catch-all route for React Router (must be last)
// Only serve index.html for non-API and non-metadata routes
app.get(/.*/, (req, res) => {
  // Don't serve index.html for API or metadata routes
  if (req.path.startsWith("/api") || req.path.startsWith("/metadata")) {
    return res.status(404).json({
      error: "Endpoint not found",
      path: req.path,
    });
  }

  // Serve React app for all other routes
  res.sendFile(path.join(publicDir, "index.html"));
});

// Start server
const PORT = process.env.PORT || 8000;
if (process.env.NODE_ENV !== 'test') app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Bunny Storage Zone: ${STORAGE_ZONE}`);
  console.log(`🔑 API Key: ${API_KEY ? "***configured***" : "❌ MISSING"}`);
  console.log(`📂 Serving from: ${publicDir}`);
});
module.exports = app;
