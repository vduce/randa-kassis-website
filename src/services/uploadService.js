/**
 * Upload Service
 * Handles file upload processing including reading, metadata extraction, and file creation
 */

import { createFile, generateNextFilename, fileExists } from './fileOperations';

/**
 * Extract metadata from markdown content
 * Supports both HTML tags and frontmatter formats
 */
const extractMetadata = (content, filename) => {
  const metadata = {
    title: '',
    publishedIn: '',
    publishedAt: '',
    date: '',
    location: '',
    chapter: '',
    year: '',
    medium: ''
  };

  // Extract title from <h4> tag
  const titleMatch = content.match(/<h4>(.*?)<\/h4>/);
  if (titleMatch) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract publication info (format: "Published in [publication]")
  const publishedInMatch = content.match(/Published in ([^\n<]+)/i);
  if (publishedInMatch) {
    metadata.publishedIn = publishedInMatch[1].trim();
  }

  // Extract date from various formats
  // Format 1: "10 June 2008" (standalone line)
  const dateMatch1 = content.match(/\n(\d{1,2}\s+\w+\s+\d{4})\s*\n/);
  if (dateMatch1) {
    metadata.publishedAt = dateMatch1[1].trim();
    metadata.date = dateMatch1[1].trim();
  }

  // Format 2: Date after <br> tag
  const dateMatch2 = content.match(/<br>\s*\n([^\n]+\d{4})/);
  if (dateMatch2 && !metadata.date) {
    metadata.date = dateMatch2[1].trim();
    metadata.publishedAt = dateMatch2[1].trim();
  }

  // Extract location (if present)
  const locationMatch = content.match(/Location:\s*([^\n]+)/i);
  if (locationMatch) {
    metadata.location = locationMatch[1].trim();
  }

  // Extract chapter (for story content)
  const chapterMatch = content.match(/Chapter:\s*([^\n]+)/i);
  if (chapterMatch) {
    metadata.chapter = chapterMatch[1].trim();
  }

  // Extract year (for paintings)
  const yearMatch = content.match(/Year:\s*(\d{4})/i);
  if (yearMatch) {
    metadata.year = yearMatch[1].trim();
  }

  // Extract medium (for paintings)
  const mediumMatch = content.match(/Medium:\s*([^\n]+)/i);
  if (mediumMatch) {
    metadata.medium = mediumMatch[1].trim();
  }

  // If no title found, use filename as fallback
  if (!metadata.title) {
    metadata.title = filename.replace(/\.md$/, '').replace(/[-_]/g, ' ');
  }

  return metadata;
};

/**
 * Generate appropriate filename based on category and existing files
 */
const generateFilename = async (categoryPath, categoryKey, originalFilename = null) => {
  // Define filename patterns for each category
  const patterns = {
    articles: { pattern: /article(\d+)\.md/, prefix: 'article' },
    encounters: { pattern: /ed(\d+)\.md/, prefix: 'ed' },
    interviews_politicians: { pattern: /politician(\d+)\.md/, prefix: 'politician' },
    interviews_painters: { pattern: /painter(\d+)\.md/, prefix: 'painter' },
    interviews_critics: { pattern: /critic(\d+)\.md/, prefix: 'critic' },
    story: { pattern: /story(\d+)\.md/, prefix: 'story' },
    paintings: { pattern: /painting(\d+)\.md/, prefix: 'painting' },
    exhibitions: { pattern: /em(\d+)\.md/, prefix: 'em' },
    throughMyEyes: { pattern: /tme(\d+)\.md/, prefix: 'tme' }
  };

  const config = patterns[categoryKey];
  if (!config) {
    // Fallback: use original filename or generate generic one
    return originalFilename || `file${Date.now()}.md`;
  }

  // Generate next filename in sequence
  return await generateNextFilename(categoryPath, config.pattern, config.prefix);
};

/**
 * Validate uploaded file
 */
const validateFile = (file) => {
  const errors = [];

  // Check file type
  if (!file.name.endsWith('.md')) {
    errors.push('Only .md (markdown) files are allowed');
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push(`File size exceeds maximum limit of 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  // Check if file is empty
  if (file.size === 0) {
    errors.push('File is empty');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Read file content from File object
 */
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(new Error(`Failed to read file: ${error.message}`));
    };

    reader.readAsText(file);
  });
};

/**
 * Process a single file upload
 */
const processFileUpload = async (file, categoryPath, categoryKey) => {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        filename: file.name,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.join(', ')
        }
      };
    }

    // Read file content
    let content;
    try {
      content = await readFileContent(file);
    } catch (error) {
      return {
        success: false,
        filename: file.name,
        error: {
          code: 'READ_ERROR',
          message: error.message
        }
      };
    }

    // Extract metadata from content
    const metadata = extractMetadata(content, file.name);

    // Generate appropriate filename
    let targetFilename = file.name;
    
    // Check if file already exists
    const existsResult = await fileExists(categoryPath, targetFilename);
    if (existsResult.success && existsResult.data.exists) {
      // Generate new filename to avoid overwriting
      targetFilename = await generateFilename(categoryPath, categoryKey, file.name);
    }

    // Create the file
    const createResult = await createFile(categoryPath, targetFilename, content);
    
    if (!createResult.success) {
      return {
        success: false,
        filename: file.name,
        targetFilename: targetFilename,
        error: createResult.error
      };
    }

    return {
      success: true,
      filename: file.name,
      targetFilename: targetFilename,
      metadata: metadata,
      size: createResult.data.size,
      created: true
    };
  } catch (error) {
    return {
      success: false,
      filename: file.name,
      error: {
        code: 'PROCESSING_ERROR',
        message: error.message || 'An unexpected error occurred during file processing'
      }
    };
  }
};

/**
 * Process batch file upload
 */
const processBatchUpload = async (files, categoryPath, categoryKey, onProgress = null) => {
  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Process file
    const result = await processFileUpload(file, categoryPath, categoryKey);
    results.push(result);

    // Call progress callback if provided
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: totalFiles,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        currentFile: file.name,
        result: result
      });
    }
  }

  // Calculate summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    success: failed === 0,
    results: results,
    summary: {
      total: totalFiles,
      successful: successful,
      failed: failed,
      successRate: totalFiles > 0 ? Math.round((successful / totalFiles) * 100) : 0
    }
  };
};

/**
 * Validate multiple files before upload
 */
const validateBatchUpload = (files) => {
  const validFiles = [];
  const invalidFiles = [];

  files.forEach(file => {
    const validation = validateFile(file);
    if (validation.valid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file: file,
        errors: validation.errors
      });
    }
  });

  return {
    valid: invalidFiles.length === 0,
    validFiles: validFiles,
    invalidFiles: invalidFiles,
    summary: {
      total: files.length,
      valid: validFiles.length,
      invalid: invalidFiles.length
    }
  };
};

export {
  extractMetadata,
  generateFilename,
  validateFile,
  readFileContent,
  processFileUpload,
  processBatchUpload,
  validateBatchUpload
};
