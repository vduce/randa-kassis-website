import React from "react";
import PhotoGalleryEd from "../components/PhotoGalleryEd/PhotoGalleryEd";
import PdfViewer from "../components/PdfViewer/PdfViewer";
import { CDN_PATHS } from "../config/cdn";

/**
 * Get CDN paths for a specific category
 * @param {string} categoryKey - Category identifier
 * @returns {{ photos: string, pdfs: string | null }}
 */
export const getCategoryPaths = (categoryKey) => {
  const pathMap = {
    encounters: {
      photos: CDN_PATHS.encounters.photos,
      pdfs: CDN_PATHS.encounters.pdfs,
    },
    story: {
      photos: CDN_PATHS.story.photos,
      pdfs: CDN_PATHS.story.pdfs,
    },
    paintings: {
      photos: CDN_PATHS.paintings.photos,
      pdfs: null,
    },
    exhibitions: {
      photos: CDN_PATHS.exhibitions.photos,
      pdfs: CDN_PATHS.exhibitions.pdfs,
    },
    interviews_politicians: {
      photos: CDN_PATHS.politicians.photos,
      pdfs: CDN_PATHS.politicians.pdfs,
    },
    interviews_painters: {
      photos: CDN_PATHS.painters.photos,
      pdfs: CDN_PATHS.painters.pdfs,
    },
    interviews_critics: {
      photos: CDN_PATHS.critics.photos,
      pdfs: CDN_PATHS.critics.pdfs,
    },
    articles: {
      photos: CDN_PATHS.articles.photos,
      pdfs: null,
    },
    throughMyEyes: {
      photos: CDN_PATHS.throughMyEyes.photos,
      pdfs: null,
    },
    arena: {
      photos: CDN_PATHS.arena.photos,
      pdfs: null,
    },
  };

  return pathMap[categoryKey] || { photos: null, pdfs: null };
};

/**
 * Creates a markdown renderer with media buffering support
 * @param {string} categoryKey - Category identifier
 * @param {Object} options - Rendering options
 * @param {boolean} options.isPreview - Whether rendering in preview mode
 * @param {Function} options.onNavigate - Custom navigation handler for .md links
 * @param {React.MutableRefObject} options.imageSrcsRef - Ref to collect image sources (for lightbox)
 * @returns {{ components: Object, renderMarkdown: Function }}
 */
export const createMarkdownRenderer = (categoryKey, options = {}) => {
  const { isPreview = false, onNavigate = null, imageSrcsRef = null } = options;
  const paths = getCategoryPaths(categoryKey);

  // Buffers for media grouping
  let mediaBuffer = [];
  let photoBuffer = [];
  let lastElementType = null;

  const flushMedia = () => {
    if (mediaBuffer.length === 0 && photoBuffer.length === 0) return null;

    const nodes = [...mediaBuffer];
    if (photoBuffer.length > 0) {
      nodes.push(
        <PhotoGalleryEd
          key={`gallery-${Date.now()}-${Math.random()}`}
          photos={[...photoBuffer]}
        />,
      );
      photoBuffer = [];
    }
    mediaBuffer = [];

    return (
      <div
        className="d-flex flex-wrap justify-content-center items-start -mx-2"
        style={{ gap: "6px" }}
      >
        {nodes.map((node, i) => (
          <React.Fragment key={i}>{node}</React.Fragment>
        ))}
      </div>
    );
  };

  const components = {
    img: ({ src, alt }) => {
      // Handle PDF files
      if (src?.endsWith(".pdf")) {
        if (photoBuffer.length > 0) {
          mediaBuffer.push(
            <PhotoGalleryEd
              key={`gallery-${Date.now()}-${Math.random()}`}
              photos={[...photoBuffer]}
            />,
          );
          photoBuffer = [];
        }

        if (paths.pdfs) {
          mediaBuffer.push(
            <PdfViewer key={src} file={src} cdnUrlPrefix={paths.pdfs} />,
          );
        }
        lastElementType = "pdf";
        return null;
      }

      // Flush buffer if last element was not an image
      if (photoBuffer.length > 0 && lastElementType !== "img") {
        mediaBuffer.push(
          <PhotoGalleryEd
            key={`gallery-${Date.now()}-${Math.random()}`}
            photos={[...photoBuffer]}
          />,
        );
        photoBuffer = [];
      }

      // Build image source with CDN path
      const imageSrc = paths.photos ? `${paths.photos}/${src}` : src;

      // Track image sources for lightbox if ref provided
      if (imageSrcsRef) {
        imageSrcsRef.current.push(imageSrc);
      }

      photoBuffer.push({ src: imageSrc, alt: alt || "" });
      lastElementType = "img";
      return null; // Will be flushed later
    },

    p: ({ children }) => {
      const media = flushMedia();
      const hasText = React.Children.toArray(children).some(
        (c) =>
          typeof c === "string" ||
          (React.isValidElement(c) && c.type !== "img"),
      );

      if (hasText) {
        lastElementType = "p";
        return (
          <>
            {media}
            <p className="mb-4">{children}</p>
          </>
        );
      }
      return media;
    },

    a: ({ href, children }) => {
      // Handle internal .md links
      if (href?.endsWith(".md")) {
        if (onNavigate) {
          return (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(href);
              }}
            >
              {children}
            </a>
          );
        }
        // In preview mode, just show as non-clickable link
        if (isPreview) {
          return (
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="Link to another article"
              style={{ cursor: "pointer" }}
            >
              {children}
            </a>
          );
        }
      }

      // External links
      if (href?.startsWith("http")) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      }

      return <a href={href}>{children}</a>;
    },

    b: ({ children }) => {
      lastElementType = "b";
      return <b>{children}</b>;
    },

    h4: ({ children }) => {
      lastElementType = "h4";
      return <h4>{children}</h4>;
    },

    center: ({ children }) => {
      lastElementType = "center";
      return (
        <div className="d-flex justify-content-center mb-3">{children}</div>
      );
    },

    iframe: ({ src, ...props }) => {
      lastElementType = "iframe";
      return <iframe src={src} {...props} />;
    },
  };

  /**
   * Render markdown content with proper media handling
   * @param {string} content - Markdown content
   * @param {Function} MarkdownComponent - The Markdown component to use
   * @param {Array} rehypePlugins - Rehype plugins
   * @param {Array} remarkPlugins - Remark plugins
   * @returns {JSX.Element}
   */
  const renderMarkdown = (
    content,
    MarkdownComponent,
    rehypePlugins = [],
    remarkPlugins = [],
  ) => {
    // Reset buffers for each render
    mediaBuffer = [];
    photoBuffer = [];
    lastElementType = null;

    if (imageSrcsRef) {
      imageSrcsRef.current = [];
    }

    const rendered = (
      <MarkdownComponent
        rehypePlugins={rehypePlugins}
        remarkPlugins={remarkPlugins}
        components={components}
      >
        {content}
      </MarkdownComponent>
    );

    const flushedMedia = flushMedia();

    return (
      <>
        {rendered}
        {flushedMedia}
      </>
    );
  };

  return { components, renderMarkdown, flushMedia };
};

export default { getCategoryPaths, createMarkdownRenderer };
