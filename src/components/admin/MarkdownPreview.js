import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { createMarkdownRenderer } from "../../utils/markdownRenderer";
import "./MarkdownPreview.css";

const MarkdownPreview = ({ content, category }) => {
  // Create renderer for this category
  const renderer = useMemo(() => {
    if (category?.key) {
      return createMarkdownRenderer(category.key, { isPreview: true });
    }
    return null;
  }, [category?.key]);

  // Render content using shared renderer or fallback
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Use shared renderer if available
    if (renderer) {
      return renderer.renderMarkdown(
        content,
        ReactMarkdown,
        [rehypeRaw],
        [remarkGfm],
      );
    }

    // Fallback: basic markdown rendering
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    );
  }, [content, renderer]);

  return (
    <div className="markdown-preview">
      <div className="preview-content">
        <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
          <div className="max-w-2xl mx-auto p-3">{renderedContent}</div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview;
