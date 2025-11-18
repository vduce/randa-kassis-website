# Bunny Storage Integration Setup

## Overview

The admin panel now supports two storage modes:
1. **Local Mode**: Uses File System Access API (browser-based, local files)
2. **Bunny Mode**: Uses Bunny CDN Storage API (cloud-based, remote files)

---

## 🔧 Configuration

### Step 1: Get Bunny Storage Credentials

1. Log in to [Bunny.net Panel](https://panel.bunny.net/)
2. Go to **Storage** → Select your storage zone (e.g., `pgcdn`)
3. Click on **FTP & API Access**
4. Copy the following:
   - **Storage Zone Name**: (e.g., `pgcdn`)
   - **Password**: This is your API key
   - **Region**: (e.g., `ny`, `la`, `sg` - or leave empty for default)

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   REACT_APP_STORAGE_MODE=bunny
   REACT_APP_BUNNY_STORAGE_ZONE=pgcdn
   REACT_APP_BUNNY_STORAGE_API_KEY=your-actual-api-key-here
   REACT_APP_BUNNY_STORAGE_REGION=
   REACT_APP_BUNNY_STORAGE_ENDPOINT=https://storage.bunnycdn.com
   ```

3. **Important**: Never commit `.env` to version control!

### Step 3: Restart Development Server

After changing `.env`, restart your development server:
```bash
npm start
```

---

## 🔄 Switching Between Storage Modes

### Use Bunny Storage (Cloud)
```env
REACT_APP_STORAGE_MODE=bunny
```

### Use Local Storage (File System Access API)
```env
REACT_APP_STORAGE_MODE=local
```

---

## 📁 File Structure on Bunny Storage

Files are stored in the `public/` folder on Bunny CDN:

```
pgcdn (Storage Zone)
└── public/
    ├── articles/
    │   ├── article1.md
    │   ├── article2.md
    │   └── ...
    ├── encounters/
    │   ├── ed1.md
    │   └── ...
    ├── interviews/
    │   ├── politicians/
    │   ├── painters/
    │   └── essayistcritics/
    └── ... (other categories)
```

---

## 🔐 Security Notes

### CORS Configuration

Bunny Storage API requires proper CORS configuration. Make sure your storage zone allows requests from your domain.

### API Key Security

⚠️ **Important**: The API key is exposed in the frontend code. For production:

1. **Option A**: Use IP whitelisting in Bunny panel
2. **Option B**: Create a backend proxy (recommended)
3. **Option C**: Use read-only API keys where possible

### Recommended: Backend Proxy

For production, create a simple backend API:

```javascript
// backend/api/storage.js
app.post('/api/storage/upload', async (req, res) => {
  const { path, content } = req.body;
  // Forward to Bunny Storage API with server-side API key
  // Return result to frontend
});
```

---

## 🧪 Testing

### Test Bunny Storage Connection

1. Open admin panel: `http://localhost:3000/admin`
2. Log in
3. Select a category
4. Check browser console for: `Using storage mode: bunny`
5. Try listing files - should fetch from Bunny CDN

### Verify File Operations

- **List**: Should show files from Bunny Storage
- **Create**: Creates new `.md` file on Bunny
- **Edit**: Updates existing file on Bunny
- **Delete**: Removes file from Bunny

---

## 🐛 Troubleshooting

### "Storage API error: 401"
- Check your API key is correct
- Verify the storage zone name matches

### "Storage API error: 404"
- Ensure the `public/` folder exists in your storage zone
- Check the category path is correct

### "CORS error"
- Configure CORS in Bunny panel
- Add your domain to allowed origins

### Files not showing
- Verify files are in `public/[category]/` path
- Check files have `.md` extension
- Look at browser console for errors

---

## 📊 API Endpoints Used

### List Files
```
GET https://storage.bunnycdn.com/{zone}/public/{category}/
```

### Read File
```
GET https://storage.bunnycdn.com/{zone}/public/{category}/{filename}
```

### Create/Update File
```
PUT https://storage.bunnycdn.com/{zone}/public/{category}/{filename}
Body: file content
```

### Delete File
```
DELETE https://storage.bunnycdn.com/{zone}/public/{category}/{filename}
```

---

## 🚀 Deployment

### Environment Variables for Production

Set these in your hosting platform (Vercel, Netlify, etc.):

```
REACT_APP_STORAGE_MODE=bunny
REACT_APP_BUNNY_STORAGE_ZONE=your-zone
REACT_APP_BUNNY_STORAGE_API_KEY=your-key
REACT_APP_BUNNY_STORAGE_REGION=
REACT_APP_BUNNY_STORAGE_ENDPOINT=https://storage.bunnycdn.com
```

### Build

```bash
npm run build
```

The build will include the environment variables.

---

## 📝 Notes

- Bunny Storage API has rate limits - check your plan
- File operations are immediate (no caching)
- Large files may take longer to upload
- Consider implementing retry logic for production
- Monitor API usage in Bunny panel

---

## 🔗 Resources

- [Bunny Storage API Documentation](https://docs.bunny.net/reference/storage-api)
- [Bunny Panel](https://panel.bunny.net/)
- [Storage Pricing](https://bunny.net/pricing/)
