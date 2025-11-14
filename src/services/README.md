# File System Services

This directory contains services for interacting with the local file system using the File System Access API.

## Overview

The File System Access API allows web applications to read and write files on the user's local file system with their permission. This implementation provides a complete CRUD interface for managing markdown content files.

## Services

### fileSystemService.js

Core service for managing File System Access API permissions and directory handles.

**Key Functions:**

- `requestDirectoryAccess()` - Request user permission to access a directory
- `getOrRequestDirectoryHandle()` - Get existing handle or request new access
- `verifyPermission(handle)` - Check if permission is still valid
- `saveDirectoryHandle(handle)` - Store handle in IndexedDB for persistence
- `getDirectoryHandle()` - Retrieve stored handle from IndexedDB
- `clearDirectoryHandle()` - Remove stored handle
- `isFileSystemAccessSupported()` - Check browser compatibility
- `handleFileSystemError(error)` - Convert errors to user-friendly messages

**IndexedDB Storage:**

Directory handles are stored in IndexedDB to persist across sessions:
- Database: `AdminCMS_FileSystem`
- Store: `directoryHandles`
- Key: `rootDirectory`

### fileOperations.js

Service for performing file operations (CRUD) on markdown files.

**File Listing:**

- `listFiles(categoryPath)` - List all .md files in a category directory
- `sortFiles(files, sortBy, order)` - Sort files by name, date, or size
- `filterFiles(files, searchTerm)` - Filter files by search term
- `paginateFiles(files, page, pageSize)` - Paginate file list

**File Reading:**

- `readFile(categoryPath, filename)` - Read file content
- `readFileWithCache(categoryPath, filename)` - Read with handle caching
- `getCachedFileHandle(categoryPath, filename)` - Get cached file handle
- `clearFileHandleCache()` - Clear all cached handles

**File Writing:**

- `writeFile(categoryPath, filename, content)` - Write/update file
- `createFile(categoryPath, filename, content)` - Create new file (fails if exists)
- `updateFile(categoryPath, filename, content, expectedModified)` - Update with concurrent modification detection
- `generateNextFilename(categoryPath, pattern, prefix)` - Generate sequential filename

**File Deletion:**

- `deleteFile(categoryPath, filename)` - Delete a file
- `fileExists(categoryPath, filename)` - Check if file exists

**Utilities:**

- `getSubdirectoryHandle(rootHandle, path)` - Navigate to subdirectory

## Usage Examples

### Request Directory Access

```javascript
import { requestDirectoryAccess } from './services/fileSystemService';

const result = await requestDirectoryAccess();
if (result.success) {
  console.log('Access granted!');
} else {
  console.error(result.error.message);
}
```

### List Files

```javascript
import { listFiles } from './services/fileOperations';

const result = await listFiles('public/articles');
if (result.success) {
  console.log(`Found ${result.data.count} files`);
  result.data.files.forEach(file => {
    console.log(`- ${file.name} (${file.size} bytes)`);
  });
}
```

### Read File

```javascript
import { readFile } from './services/fileOperations';

const result = await readFile('public/articles', 'article1.md');
if (result.success) {
  console.log('Content:', result.data.content);
  console.log('Modified:', result.data.modifiedDate);
}
```

### Create File

```javascript
import { createFile } from './services/fileOperations';

const content = '# My New Article\n\nThis is the content...';
const result = await createFile('public/articles', 'article5.md', content);

if (result.success) {
  console.log('File created successfully!');
} else if (result.error.code === 'FILE_EXISTS') {
  console.log('File already exists');
}
```

### Update File with Concurrent Modification Detection

```javascript
import { readFile, updateFile } from './services/fileOperations';

// Read file first
const readResult = await readFile('public/articles', 'article1.md');
const originalModified = readResult.data.modified;

// User edits content...
const newContent = '# Updated Article\n\nNew content...';

// Update with modification check
const updateResult = await updateFile(
  'public/articles',
  'article1.md',
  newContent,
  originalModified
);

if (updateResult.success) {
  console.log('File updated!');
} else if (updateResult.error.code === 'CONCURRENT_MODIFICATION') {
  console.log('File was modified by another process!');
}
```

### Delete File

```javascript
import { deleteFile } from './services/fileOperations';

const result = await deleteFile('public/articles', 'article1.md');
if (result.success) {
  console.log('File deleted successfully!');
}
```

### Sort and Filter Files

```javascript
import { listFiles, sortFiles, filterFiles } from './services/fileOperations';

const result = await listFiles('public/articles');
if (result.success) {
  let files = result.data.files;
  
  // Filter by search term
  files = filterFiles(files, 'syria');
  
  // Sort by date (newest first)
  files = sortFiles(files, 'date', 'desc');
  
  console.log('Filtered and sorted files:', files);
}
```

### Paginate Files

```javascript
import { listFiles, paginateFiles } from './services/fileOperations';

const result = await listFiles('public/articles');
if (result.success) {
  const page = paginateFiles(result.data.files, 1, 10);
  
  console.log(`Page ${page.currentPage} of ${page.totalPages}`);
  console.log(`Showing ${page.files.length} of ${page.totalFiles} files`);
  console.log('Has next page:', page.hasNextPage);
}
```

## Error Handling

All functions return a consistent response format:

**Success Response:**
```javascript
{
  success: true,
  data: { /* operation-specific data */ }
}
```

**Error Response:**
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'User-friendly error message',
    details: { /* additional context */ }
  }
}
```

**Common Error Codes:**

- `NOT_SUPPORTED` - File System Access API not supported in browser
- `PERMISSION_DENIED` - User denied directory access permission
- `USER_CANCELLED` - User cancelled directory picker
- `FILE_NOT_FOUND` - File or directory doesn't exist
- `FILE_EXISTS` - File already exists (when creating)
- `CONCURRENT_MODIFICATION` - File was modified by another process
- `INVALID_MODIFICATION` - File is locked or in use
- `QUOTA_EXCEEDED` - Storage quota exceeded
- `SECURITY_ERROR` - Access not allowed for security reasons

## Browser Compatibility

**Supported Browsers:**
- Chrome/Edge 86+ (full support)
- Safari 15.2+ (partial support)

**Not Supported:**
- Firefox (behind flag, not recommended)
- Older browsers

Always check compatibility before using:

```javascript
import { isFileSystemAccessSupported } from './services/fileSystemService';

if (!isFileSystemAccessSupported()) {
  alert('Your browser does not support the File System Access API');
}
```

## Performance Considerations

**File Handle Caching:**

File handles are cached in memory to improve performance for repeated reads:

```javascript
// First read - fetches handle
await readFileWithCache('public/articles', 'article1.md');

// Second read - uses cached handle (faster)
await readFileWithCache('public/articles', 'article1.md');

// Clear cache when needed
clearFileHandleCache();
```

**IndexedDB Persistence:**

Directory handles are stored in IndexedDB so users don't need to re-grant permission on every page load.

## Security Notes

- Users must explicitly grant permission to access directories
- Permission is scoped to the selected directory only
- Browser enforces security boundaries
- Cannot access files outside granted directory
- Users can revoke permission at any time via browser settings

## Future Enhancements

- Batch file operations
- File watching for external changes
- Conflict resolution UI
- Undo/redo functionality
- File versioning
- Backup and restore
