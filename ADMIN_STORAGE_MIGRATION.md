# Admin Panel Storage Migration Summary

## ✅ What Was Implemented

The admin panel now supports **dual storage modes**:

### 1. **Local Mode** (Original)
- Uses File System Access API
- Files stored locally in `public/` folder
- Requires browser permission to access local files
- Works offline

### 2. **Bunny Mode** (New)
- Uses Bunny CDN Storage API
- Files stored on Bunny CDN cloud storage
- No browser permissions needed
- Works from anywhere with internet

---

## 📁 New Files Created

### Configuration
- `.env` - Environment variables (with dummy credentials)
- `.env.example` - Template for environment variables
- `src/config/storage.js` - Storage mode configuration

### Services
- `src/services/bunnyStorageService.js` - Bunny API utilities
- `src/services/bunnyStorageOperations.js` - Bunny CRUD operations
- `src/services/unifiedFileOperations.js` - Unified interface for both modes

### Documentation
- `BUNNY_STORAGE_SETUP.md` - Complete setup guide
- `ADMIN_STORAGE_MIGRATION.md` - This file

---

## 🔄 Files Modified

### Admin Components
- `src/components/admin/MarkdownEditor.js` - Uses unified operations
- `src/components/admin/FileList.js` - Uses unified operations
- `src/components/admin/AdminDashboard.js` - Uses unified operations

### Configuration
- `.gitignore` - Added `.env` to prevent committing credentials

---

## 🎯 How It Works

### Architecture

```
Admin Components
       ↓
Unified File Operations (src/services/unifiedFileOperations.js)
       ↓
   [Checks STORAGE_MODE]
       ↓
   ┌───────────┴───────────┐
   ↓                       ↓
Local Operations      Bunny Operations
(fileOperations.js)   (bunnyStorageOperations.js)
   ↓                       ↓
File System API      Bunny Storage API
```

### Switching Modes

The system automatically detects which mode to use based on `.env`:

```javascript
// In .env
REACT_APP_STORAGE_MODE=bunny  // Use Bunny Storage
// or
REACT_APP_STORAGE_MODE=local  // Use Local File System
```

---

## 🔧 Setup Instructions

### Quick Start

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Add your Bunny credentials** to `.env`:
   ```env
   REACT_APP_STORAGE_MODE=bunny
   REACT_APP_BUNNY_STORAGE_ZONE=pgcdn
   REACT_APP_BUNNY_STORAGE_API_KEY=your-real-api-key-here
   ```

3. **Restart dev server**:
   ```bash
   npm start
   ```

4. **Test**: Open admin panel and check console for:
   ```
   Using storage mode: bunny
   ```

### Get Bunny Credentials

1. Go to [Bunny Panel](https://panel.bunny.net/)
2. Navigate to **Storage** → Your Zone
3. Click **FTP & API Access**
4. Copy the **Password** (this is your API key)

---

## 🧪 Testing Checklist

- [ ] List files from Bunny Storage
- [ ] Create new markdown file
- [ ] Edit existing file
- [ ] Delete file
- [ ] Switch between categories
- [ ] Preview images (should still work from production CDN)
- [ ] Save metadata to JSON index

---

## ⚠️ Important Notes

### Security

- **API Key Exposure**: The Bunny API key is in the frontend code
- **For Production**: Implement a backend proxy to hide credentials
- **Alternative**: Use IP whitelisting in Bunny panel

### File Paths

Files must be in `public/` folder on Bunny:
```
pgcdn/
└── public/
    ├── articles/
    ├── encounters/
    └── ...
```

### CORS

Make sure Bunny Storage allows requests from your domain.

---

## 🚀 Production Deployment

### Environment Variables

Set in your hosting platform (Vercel/Netlify):

```
REACT_APP_STORAGE_MODE=bunny
REACT_APP_BUNNY_STORAGE_ZONE=pgcdn
REACT_APP_BUNNY_STORAGE_API_KEY=your-production-key
```

### Build

```bash
npm run build
```

---

## 🔄 Rollback to Local Mode

If you need to go back to local file system:

1. Change `.env`:
   ```env
   REACT_APP_STORAGE_MODE=local
   ```

2. Restart server

That's it! The admin panel will use File System Access API again.

---

## 📊 Feature Comparison

| Feature | Local Mode | Bunny Mode |
|---------|-----------|------------|
| Storage Location | Local computer | Bunny CDN |
| Browser Permission | Required | Not required |
| Works Offline | ✅ Yes | ❌ No |
| Multi-device | ❌ No | ✅ Yes |
| Backup | Manual | Automatic (Bunny) |
| Collaboration | ❌ No | ✅ Yes |
| Setup Complexity | Low | Medium |

---

## 📝 Next Steps

1. **Test with real credentials**: Replace dummy API key
2. **Verify file operations**: Create, edit, delete files
3. **Check CORS**: Ensure no CORS errors
4. **Consider backend proxy**: For production security
5. **Monitor usage**: Check Bunny panel for API calls

---

## 🆘 Support

For issues:
1. Check `BUNNY_STORAGE_SETUP.md` for detailed troubleshooting
2. Verify credentials in `.env`
3. Check browser console for errors
4. Review Bunny Storage API docs

---

## ✨ Benefits

- **No more browser permissions**: Works immediately
- **Cloud storage**: Access from anywhere
- **Automatic backup**: Files stored on Bunny CDN
- **Easy collaboration**: Multiple users can edit
- **Seamless switch**: Toggle between local and cloud with one line
