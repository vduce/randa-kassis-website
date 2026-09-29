import React from "react";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import "./MarkdownPreview.css";

const BLOG_CATEGORIES = new Set([
  "articles",
  "encounters",
  "interviews_politicians",
  "interviews_painters",
  "interviews_critics",
]);

const ContentSurface = ({ content, categoryKey, filename, isBlogLayout }) => {
  const surface = (
    <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
      <div className="max-w-2xl mx-auto p-3">
        <MarkdownContent content={content} categoryKey={categoryKey} filename={filename} />
      </div>
    </div>
  );

  return isBlogLayout ? <div className="max-w-2xl mx-auto mb-3">{surface}</div> : surface;
};

const MarkdownPreview = ({ content, category, filename }) => {
  const categoryKey = category?.key;
  const isBlogLayout = BLOG_CATEGORIES.has(categoryKey);

  return (
    <div className="markdown-preview">
      <div className="markdown-preview-page">
        {isBlogLayout ? (
          <div className="wpo-blog-single-section">
            <div className="container">
              <div className="row">
                <div className="col col-lg-12 col-12">
                  <div className="wpo-blog-content">
                    <div className="post format-standard-image">
                      <div className="post2">
                        <ContentSurface
                          content={content}
                          categoryKey={categoryKey}
                          filename={filename}
                          isBlogLayout
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="wpo-service-single-area">
            <div className="container">
              <div className="row">
                <div className="col-lg-12 col-12">
                  <div className="wpo-service-single-wrap">
                    <div className="wpo-service-single-item">
                      <ContentSurface
                        content={content}
                        categoryKey={categoryKey}
                        filename={filename}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownPreview;
