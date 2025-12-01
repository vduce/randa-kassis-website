import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import './MarkdownPreview.css';

// CDN URL mapping for different content categories
// Always use production CDN for images
const PRODUCTION_CDN = 'https://randa-kassis-website.b-cdn.net';

const getCdnPath = (categoryKey) => {
  const cdnPaths = {
    'encounters': `${PRODUCTION_CDN}/encounters/photos`,
    'interviews_politicians': `${PRODUCTION_CDN}/interviews/politicians/photos`,
    'interviews_painters': `${PRODUCTION_CDN}/interviews/painters/photos`,
    'interviews_critics': `${PRODUCTION_CDN}/interviews/essayistcritics/photos`,
    'story': `${PRODUCTION_CDN}/story/photos`,
    'paintings': `${PRODUCTION_CDN}/paintings/photos`,
    'exhibitions': `${PRODUCTION_CDN}/exhibitions/photos`,
    'throughMyEyes': `${PRODUCTION_CDN}/gallery/myeyes/photos`,
    'articles': `${PRODUCTION_CDN}/articles/photos`,
  };
  
  return cdnPaths[categoryKey] || null;
};

const MarkdownPreview = ({ content, category }) => {
  const cdnPath = category ? getCdnPath(category.key) : null;
  
  // Process content to fix image paths before rendering
  const renderedContent = useMemo(() => {
    if (!content) return '';
    
    // If we have a CDN path, replace relative image paths with CDN URLs
    if (cdnPath) {
      // Fix HTML img tags: <img src="image.jpg"> -> <img src="CDN_URL/image.jpg">
      let processedContent = content.replace(
        /<img([^>]*?)src=["'](?!http)(.*?)["']/gi,
        (match, attrs, src) => {
          const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
          return `<img${attrs}src="${cdnPath}/${cleanSrc}"`;
        }
      );
      
      // Fix markdown image syntax: ![alt](image.jpg) -> ![alt](CDN_URL/image.jpg)
      processedContent = processedContent.replace(
        /!\[([^\]]*)\]\((?!http)(.*?)\)/gi,
        (match, alt, src) => {
          const cleanSrc = src.startsWith('/') ? src.substring(1) : src;
          return `![${alt}](${cdnPath}/${cleanSrc})`;
        }
      );
      
      return processedContent;
    }
    
    // Fallback: use local paths if no CDN path is configured
    let processedContent = content.replace(
      /<img([^>]*?)src=["'](?!http|\/)(.*?)["']/gi,
      '<img$1src="/$2"'
    );
    
    processedContent = processedContent.replace(
      /!\[([^\]]*)\]\((?!http|\/)(.*?)\)/gi,
      '![$1](/$2)'
    );
    
    return processedContent;
  }, [content, cdnPath]);

  return (
    <div className="markdown-preview">
      <div className="preview-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom image renderer to handle paths correctly
            img: ({ src, alt, ...props }) => {
              // Images should be served from the public folder
              // If src doesn't start with http or /, it's a relative path
              let imageSrc = src;
              
              if (src && !src.startsWith('http') && !src.startsWith('/')) {
                // Add leading slash for absolute path from public folder
                imageSrc = `/${src}`;
              }
              
              return (
                <img 
                  src={imageSrc} 
                  alt={alt || 'Image'} 
                  loading="lazy"
                  onError={(e) => {
                    // If image fails to load, show a placeholder
                    e.target.style.display = 'none';
                    console.warn(`Failed to load image: ${imageSrc}`);
                  }}
                  {...props} 
                />
              );
            },
            // Custom link renderer for internal navigation
            a: ({ href, children, ...props }) => {
              // Handle markdown file links
              if (href && href.endsWith('.md')) {
                return (
                  <a 
                    href={href} 
                    onClick={(e) => e.preventDefault()}
                    title="Link to another article"
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
              // External links open in new tab
              if (href && (href.startsWith('http') || href.startsWith('https'))) {
                return (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
              return <a href={href} {...props}>{children}</a>;
            }
          }}
        >
          {renderedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownPreview;
