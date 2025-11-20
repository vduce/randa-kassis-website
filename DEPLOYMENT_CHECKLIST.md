# Deployment Checklist for Crystal Hosting

## ✅ Files Fixed

### 1. `server.js`
- ✅ Catch-all route now excludes `/api/*` paths
- ✅ Returns proper 404 JSON for invalid API endpoints
- ✅ Serves `index.html` for all React routes

### 2. `.htaccess`
- ✅ Added condition to NOT rewrite `/api/*` requests
- ✅ Allows Express to handle API routes directly
- ✅ Still rewrites all other routes to `index.html` for React Router

---

## 🚀 Deployment Steps

### Step 1: Upload Updated Files

Upload these files to your server:

1. **`server.js`** (updated)
2. **`.htaccess`** (updated - rename from `htaccess` to `.htaccess`)
3. **`build/`** folder (if changed)

### Step 2: Restart Node.js Application

In cPanel:
1. Go to **Setup Node.js App**
2. Find your application
3. Click **Restart**

Or via SSH:
```bash
touch tmp/restart.txt
# or
pm2 restart all
```

### Step 3: Test All Routes

#### Test API Routes:
```
✅ https://dev.randakassis.com/api
✅ https://dev.randakassis.com/api/storage/health
✅ https://dev.randakassis.com/api/storage/list?path=public/articles
```

#### Test React Routes (with refresh):
```
✅ https://dev.randakassis.com/
✅ https://dev.randakassis.com/contact
✅ https://dev.randakassis.com/story/1
✅ https://dev.randakassis.com/articles
✅ https://dev.randakassis.com/admin
```

**Important**: Test by:
1. Clicking links (should work)
2. **Refreshing the page** (should still work - this was broken before!)
3. Directly typing URL in browser (should work)

---

## 🔍 What Was Fixed

### Problem 1: API Routes Returning Blank Page

**Before**:
```
Request: /api/storage/health
   ↓
.htaccess: RewriteRule . /index.html
   ↓
Express: app.get('*') → serves index.html
   ↓
Result: Blank page ❌
```

**After**:
```
Request: /api/storage/health
   ↓
.htaccess: Skip rewrite (API route)
   ↓
Express: app.get('/api/storage/health') → returns JSON
   ↓
Result: {"status":"ok",...} ✅
```

### Problem 2: Nested Routes Blank on Refresh

**Before**:
```
Request: /story/1 (refresh)
   ↓
.htaccess: RewriteRule . /index.html
   ↓
Express: app.get('*') → res.sendFile('index.html')
   ↓
Result: File not found (wrong path) ❌
```

**After**:
```
Request: /story/1 (refresh)
   ↓
.htaccess: RewriteRule . /index.html
   ↓
Express: app.get('*') → res.sendFile(path.join(publicDir, 'index.html'))
   ↓
Result: React app loads correctly ✅
```

---

## 🧪 Testing Checklist

### API Endpoints
- [ ] `/api` - Shows list of endpoints
- [ ] `/api/storage/health` - Returns JSON status
- [ ] `/api/storage/list?path=public/articles` - Lists files
- [ ] Invalid API route (e.g., `/api/invalid`) - Returns 404 JSON

### React Routes (Test with Refresh!)
- [ ] `/` - Homepage loads
- [ ] `/contact` - Contact page loads
- [ ] `/articles` - Articles page loads
- [ ] `/story/1` - Story page loads (nested route!)
- [ ] `/admin` - Admin panel loads
- [ ] `/admin/editor` - Editor loads (nested route!)
- [ ] Invalid route (e.g., `/nonexistent`) - Shows 404 page

### Admin Panel
- [ ] Can login
- [ ] Can list files from Bunny Storage
- [ ] Can edit files
- [ ] Can save files
- [ ] Can delete files

---

## 🐛 Troubleshooting

### Still Getting Blank Pages?

1. **Clear browser cache**: Ctrl+Shift+R (hard refresh)
2. **Check .htaccess**: Make sure it's named `.htaccess` (with dot)
3. **Check file location**: `.htaccess` should be in the same directory as `server.js`
4. **Restart Node app**: In cPanel or via `touch tmp/restart.txt`

### API Routes Still Not Working?

1. **Check server logs**: 
   ```bash
   tail -f logs/nodejs.log
   ```
2. **Test directly**:
   ```bash
   curl https://dev.randakassis.com/api/storage/health
   ```
3. **Check CORS**: Make sure your domain is in the CORS whitelist in `server.js`

### 404 on All Routes?

1. **Check Passenger config**: Make sure `PassengerStartupFile` is `server.js`
2. **Check Node.js version**: Should be 14+ or latest
3. **Check build folder**: Make sure `build/index.html` exists

---

## 📝 Key Changes Summary

### server.js
```javascript
// OLD (WRONG)
app.get('*', (req, res) => {
  res.sendFile('index.html');  // ❌ Wrong path, catches API routes
});

// NEW (CORRECT)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(publicDir, 'index.html'));  // ✅ Correct path
});
```

### .htaccess
```apache
# OLD (WRONG)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]  # ❌ Rewrites API routes too

# NEW (CORRECT)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/  # ✅ Skip API routes
RewriteRule . /index.html [L]
```

---

## ✨ Expected Results

After deployment:

✅ **API routes work**: `/api/storage/health` returns JSON
✅ **Nested routes work**: `/story/1` loads even on refresh
✅ **Admin panel works**: Can manage content via Bunny Storage
✅ **React Router works**: All client-side routes work correctly
✅ **No blank pages**: Everything loads properly

---

## 🎉 You're Done!

Once deployed and tested, your website should work perfectly with:
- React Router for client-side navigation
- Express API routes for Bunny Storage
- Proper handling of page refreshes
- No more blank pages!

If you encounter any issues, check the troubleshooting section above.
