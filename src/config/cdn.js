/**
 * CDN Configuration
 * Centralized configuration for content delivery
 */

// Production CDN for images, PDFs, and videos
export const PRODUCTION_CDN = 'https://randa-kassis-website.b-cdn.net';

// Temporary CDN for markdown content files
export const CONTENT_CDN = 'https://pgcdn.b-cdn.net/public/public';

// When ready to move markdown to production, change CONTENT_CDN to:
// export const CONTENT_CDN = 'https://randa-kassis-website.b-cdn.net';

/**
 * Get full CDN URL for markdown content
 * @param {string} path - Relative path (e.g., 'articles/article1.md')
 * @returns {string} Full CDN URL
 */
export const getCdnUrl = (path) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${CONTENT_CDN}/${cleanPath}`;
};

/**
 * CDN paths for different content types
 * Content (.md files) uses CONTENT_CDN
 * Media (photos, PDFs, videos) uses PRODUCTION_CDN
 */
export const CDN_PATHS = {
  articles: {
    content: `${CONTENT_CDN}/articles`,
    photos: `${PRODUCTION_CDN}/articles/photos`,
  },
  encounters: {
    content: `${CONTENT_CDN}/encounters`,
    photos: `${PRODUCTION_CDN}/encounters/photos`,
    pdfs: `${PRODUCTION_CDN}/encounters/pdfs`,
  },
  politicians: {
    content: `${CONTENT_CDN}/interviews/politicians`,
    photos: `${PRODUCTION_CDN}/interviews/politicians/photos`,
    pdfs: `${PRODUCTION_CDN}/interviews/politicians/pdfs`,
  },
  painters: {
    content: `${CONTENT_CDN}/interviews/painters`,
    photos: `${PRODUCTION_CDN}/interviews/painters/photos`,
    pdfs: `${PRODUCTION_CDN}/interviews/painters/pdfs`,
  },
  critics: {
    content: `${CONTENT_CDN}/interviews/essayistcritics`,
    photos: `${PRODUCTION_CDN}/interviews/essayistcritics/photos`,
    pdfs: `${PRODUCTION_CDN}/interviews/essayistcritics/pdfs`,
  },
  story: {
    content: `${CONTENT_CDN}/story`,
    photos: `${PRODUCTION_CDN}/mystory/photos`,
    pdfs: `${PRODUCTION_CDN}/mystory/pdf`,
  },
  paintings: {
    content: `${CONTENT_CDN}/paintings`,
    photos: `${PRODUCTION_CDN}/paintings/photos`,
  },
  exhibitions: {
    content: `${CONTENT_CDN}/exhibitions`,
    photos: `${PRODUCTION_CDN}/exhibitions/photos`,
    pdfs: `${PRODUCTION_CDN}/exhibitions/pdfs`,
  },
  throughMyEyes: {
    content: `${CONTENT_CDN}/gallery/myeyes`,
    photos: `${PRODUCTION_CDN}/gallery/throughmyeyes`, // Base path for subsections
  },
};

export default {
  PRODUCTION_CDN,
  CONTENT_CDN,
  getCdnUrl,
  CDN_PATHS,
};
