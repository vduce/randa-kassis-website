import React from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import PhotoGalleryEd from "../PhotoGalleryEd/PhotoGalleryEd";
import PdfViewer from "../PdfViewer/PdfViewer";
import { PRODUCTION_CDN } from "../../config/cdn";
import "./MarkdownContent.css";

const CDN_BASE_URL = PRODUCTION_CDN;

const THROUGH_MY_EYES_SECTIONS = {
  myeyes1: "intheirgaze/compressed",
  myeyes2: "artinmotion/photos",
  myeyes3: "ruinsthatspeaks/compressed",
  myeyes4: "testamentsinstone/compressed",
  myeyes5: "pulseofearth/compressed",
  myeyes6: "tracyofatrocity/photos",
};

const CATEGORY_CONFIG = {
  articles: { imageBase: `${CDN_BASE_URL}/articles/photos` },
  encounters: {
    imageBase: `${CDN_BASE_URL}/encounters/photos`,
    pdfBase: `${CDN_BASE_URL}/encounters/pdfs`,
    gallery: true,
  },
  interviews_politicians: {
    imageBase: `${CDN_BASE_URL}/interviews/politicians/photos`,
    pdfBase: `${CDN_BASE_URL}/interviews/politicians/pdfs`,
    gallery: true,
  },
  interviews_painters: {
    imageBase: `${CDN_BASE_URL}/interviews/painters/photos`,
    pdfBase: `${CDN_BASE_URL}/interviews/painters`,
  },
  interviews_critics: {
    imageBase: `${CDN_BASE_URL}/interviews/essayistcritics/photos`,
    pdfBase: `${CDN_BASE_URL}/interviews/essayistcritics/pdfs`,
  },
  story: {
    imageBase: `${CDN_BASE_URL}/mystory/photos`,
    pdfBase: `${CDN_BASE_URL}/mystory/pdf`,
    gallery: true,
  },
  paintings: {
    imageBase: `${CDN_BASE_URL}/paintings/photos`,
    paintingGrid: true,
  },
  exhibitions: {
    imageBase: `${CDN_BASE_URL}/exhibitions/photos`,
    pdfBase: `${CDN_BASE_URL}/exhibitions/pdfs`,
    gallery: true,
  },
  throughMyEyes: { gallery: true },
  companion: { imageBase: `${CDN_BASE_URL}/gallery/my4pawedcompanion/photos`, gallery: true },
  arena: { imageBase: `${CDN_BASE_URL}/gallery/inthearena`, gallery: true },
};

const isMediaParagraph = (node) =>
  node?.type === "element" &&
  node.tagName === "p" &&
  node.children?.length > 0 &&
  node.children.every(
    (child) =>
      (child.type === "text" && !child.value.trim()) ||
      (child.type === "element" && child.tagName === "img")
  ) &&
  node.children.some((child) => child.type === "element" && child.tagName === "img");

// Convert adjacent Markdown image paragraphs into one explicit media group before React renders it.
const rehypeGroupMedia = () => (tree) => {
  const visit = (parent) => {
    if (!parent?.children) return;

    const grouped = [];
    let mediaChildren = [];
    const flush = () => {
      if (!mediaChildren.length) return;
      grouped.push({
        type: "element",
        tagName: "markdown-media-group",
        properties: {},
        children: mediaChildren,
      });
      mediaChildren = [];
    };

    parent.children.forEach((child) => {
      if (isMediaParagraph(child)) {
        mediaChildren.push(
          ...child.children.filter((item) => item.type === "element" && item.tagName === "img")
        );
        return;
      }

      flush();
      visit(child);
      grouped.push(child);
    });
    flush();
    parent.children = grouped;
  };

  visit(tree);
};

const isAbsoluteUrl = (value = "") => /^(?:https?:|data:|blob:|\/)/i.test(value);

const resolveAssetUrl = (base, src) => {
  if (!src || isAbsoluteUrl(src) || !base) return src;
  return `${base}/${src.replace(/^\.\//, "")}`;
};

const getFilenameStem = (filename = "") =>
  filename.split("/").pop().replace(/\.md$/i, "");

const getConfig = (categoryKey, filename) => {
  const config = { ...(CATEGORY_CONFIG[categoryKey] || {}) };
  if (categoryKey === "throughMyEyes") {
    const section = THROUGH_MY_EYES_SECTIONS[getFilenameStem(filename)];
    config.imageBase = section
      ? `${CDN_BASE_URL}/gallery/throughmyeyes/${section}`
      : null;
  }
  return config;
};

const getInternalRoute = (categoryKey, href) => {
  const stem = getFilenameStem(href);
  const id = stem.replace(/^(?:article|ed|po|painters|ec|story|painting|em|myeyes|companion|arena)/i, "");
  const routes = {
    articles: `/article-single/${id}`,
    encounters: `/encounter-and-dialogue-single/${id}`,
    interviews_politicians: `/politician-single/${id}`,
    interviews_critics: `/critics-single/${id}`,
    story: `/story/${id}`,
    paintings: `/beyondPolitics/the-politician/${id}`,
    exhibitions: `/beyondPolitics/the-essayist-the-critic/${id}`,
    throughMyEyes: `/gallery/through-my-eyes/${id}`,
    companion: `/gallery/my-four-pawed-companions/${id}`,
    arena: `/gallery/in-the-arena/${id}`,
  };
  return routes[categoryKey] || null;
};

const MarkdownContent = ({ content = "", categoryKey, filename = "" }) => {
  const navigate = useNavigate();
  const config = getConfig(categoryKey, filename);

  const renderPhotos = (photos, key) => {
    if (!photos.length) return null;
    if (config.paintingGrid) {
      return (
        <div className="markdown-painting-grid" key={key}>
          {photos.map(({ src, alt }, index) => (
            <figure key={`${src}-${index}`} className="markdown-painting-item">
              <img src={src} alt={alt || ""} />
              {alt && <figcaption>{alt}</figcaption>}
            </figure>
          ))}
        </div>
      );
    }
    if (config.gallery) return <PhotoGalleryEd key={key} photos={photos} />;
    return photos.map(({ src, alt }, index) => (
      <img key={`${src}-${index}`} src={src} alt={alt || ""} loading="lazy" />
    ));
  };

  const MediaGroup = ({ node }) => {
    const items = (node?.children || [])
      .filter((child) => child.type === "element" && child.tagName === "img")
      .map((child) => ({ src: child.properties?.src, alt: child.properties?.alt || "" }));
    const output = [];
    let photos = [];

    const flushPhotos = () => {
      if (!photos.length) return;
      output.push(renderPhotos(photos, `photos-${output.length}`));
      photos = [];
    };

    items.forEach(({ src, alt }) => {
      if (src?.toLowerCase().endsWith(".pdf")) {
        flushPhotos();
        output.push(
          <div className="markdown-pdf" key={`pdf-${output.length}`}>
            <PdfViewer file={src} cdnUrlPrefix={config.pdfBase || config.imageBase || ""} />
          </div>
        );
      } else {
        photos.push({ src: resolveAssetUrl(config.imageBase, src), alt });
      }
    });
    flushPhotos();

    return <div className="markdown-media-group">{output}</div>;
  };

  const components = {
    "markdown-media-group": MediaGroup,
    img: ({ src, alt, ...props }) => {
      if (src?.toLowerCase().endsWith(".pdf")) {
        return (
          <div className="markdown-pdf">
            <PdfViewer file={src} cdnUrlPrefix={config.pdfBase || config.imageBase || ""} />
          </div>
        );
      }
      return (
        <img
          src={resolveAssetUrl(config.imageBase, src)}
          alt={alt || ""}
          loading="lazy"
          {...props}
        />
      );
    },
    p: ({ children }) => <p className="mb-4">{children}</p>,
    center: ({ children }) => (
      <div className="d-flex flex-column flex-md-row justify-content-center align-items-center mb-3 markdown-center">
        {children}
      </div>
    ),
    a: ({ href = "", children, ...props }) => {
      if (href.toLowerCase().endsWith(".md")) {
        const route = getInternalRoute(categoryKey, href);
        if (route) {
          return (
            <a
              href={route}
              onClick={(event) => {
                event.preventDefault();
                navigate(route);
                window.scrollTo(0, 0);
              }}
              {...props}
            >
              {children}
            </a>
          );
        }
      }
      if (/^https?:/i.test(href)) {
        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
      }
      return <a href={href} {...props}>{children}</a>;
    },
  };

  return (
    <div className={`shared-markdown-content shared-markdown-${categoryKey || "default"}`}>
      <Markdown
        rehypePlugins={[rehypeRaw, rehypeGroupMedia]}
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default MarkdownContent;
