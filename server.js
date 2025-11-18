/**
 * Main Website Server for randakassis.com
 * + Integrated Bunny Storage Proxy Routes
 */

const express = require('express');
const path = require('path');
const proxyRoutes = require('./proxy/proxy');

const app = express();

// Trust proxy (important on shared hosting)
app.set('trust proxy', 1);

// Parse JSON and text globally
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ limit: "10mb", type: "text/markdown" }));

// Mount Bunny Proxy routes WITHOUT /proxy prefix
// All routes in proxy.js start with /api/storage/*
app.use('/', proxyRoutes);

// Serve your frontend files (if using static HTML/build)
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Default homepage route (adjust based on your website needs)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Website running on port ${PORT}`);
});
