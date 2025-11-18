# Bunny Storage Proxy Server

This proxy server solves CORS issues when accessing Bunny CDN Storage API from the browser.

## Why Do We Need This?

Bunny Storage API doesn't allow direct browser requests due to CORS restrictions. This proxy:
- Handles CORS headers
- Keeps API keys secure (server-side only)
- Forwards requests to Bunny Storage API

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Start the Proxy

```bash
npm start
```

The proxy will run on `http://localhost:3001`

### 3. Start React App (in another terminal)

```bash
cd ..
npm start
```

## Or Use the Batch Script (Windows)

```bash
start-with-proxy.bat
```

This starts both the proxy and React app automatically.

## API Endpoints

### List Files
```
GET /api/storage/list?path=public/articles
```

### Read File
```
GET /api/storage/read?path=public/articles/article1.md
```

### Write File
```
PUT /api/storage/write
Body: { "path": "public/articles/article1.md", "content": "..." }
```

### Delete File
```
DELETE /api/storage/delete?path=public/articles/article1.md
```

### Health Check
```
GET /health
```

## Configuration

The proxy reads configuration from the root `.env` file:

```env
REACT_APP_BUNNY_STORAGE_ZONE=parallelglobe
REACT_APP_BUNNY_STORAGE_API_KEY=your-api-key
REACT_APP_BUNNY_STORAGE_ENDPOINT=https://storage.bunnycdn.com
PROXY_PORT=3001
```

## Development

Use nodemon for auto-restart on changes:

```bash
npm run dev
```

## Troubleshooting

### Port Already in Use

Change the port in `.env`:
```env
PROXY_PORT=3002
```

And update React app's proxy URL:
```env
REACT_APP_PROXY_URL=http://localhost:3002
```

### Connection Refused

Make sure the proxy server is running before starting the React app.

### API Key Invalid

Check your Bunny Storage API key in `.env` file.

## Production Deployment

For production, deploy this proxy to:
- Heroku
- Vercel Serverless Functions
- AWS Lambda
- Any Node.js hosting

Update `REACT_APP_PROXY_URL` to point to your deployed proxy.
