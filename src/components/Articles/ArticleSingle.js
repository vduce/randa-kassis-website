import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import articles from "../../api/articles.json";
import { getCdnUrl } from "../../config/cdn";

const ArticleSingle = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [currentArticle, setCurrentArticle] = useState(Number(id) || 1);
  const [pageNumber, setPageNumber] = useState(null);
  const navigate = useNavigate();
  const [article, setArticle] = useState(null); // State to store the article
  const [content, setContent] = useState(""); // State to store the article content

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    // Find the article by ID
    const selectedArticle = articles.find((item) => item.id === parseInt(id));
    setArticle(selectedArticle);

    // Fetch the content of the article's Markdown file
    if (selectedArticle && selectedArticle.filename) {
      const fetchContent = async () => {
        try {
          const response = await fetch(getCdnUrl(`articles/${selectedArticle.filename}`));
          const text = await response.text();
          setContent(text);
        } catch (error) {
          console.error("Error fetching article content:", error);
          setContent("Error loading article content.");
        }
      };

      fetchContent();
    }
  }, [id]);

  // calculate page number based on currentArticle
  useEffect(() => {
    const index = articles.findIndex((item) => item.id === currentArticle);
    if (index !== -1) {
      const pageNum = Math.floor(index / 10) + 1; // Assuming 10 items per page
      setPageNumber(pageNum);
    }
  }, [currentArticle]);

  if (!article) {
    return <p>Article not found.</p>;
  }

  const handlePrevious = () => {
    if (currentArticle > 1) {
      setCurrentArticle(currentArticle - 1);
      navigate(`/article-single/${currentArticle - 1}`, {
        state: { pageNumber, currentArticle: currentArticle - 1 },
      });
    }
  };

  const handleNext = () => {
    if (currentArticle < articles.length) {
      setCurrentArticle(currentArticle + 1);
      navigate(`/article-single/${currentArticle + 1}`, {
        state: { pageNumber, currentArticle: currentArticle + 1 },
      });
    }
  };

  return (
    <section className="wpo-blog-single-section section-padding-bottom">
      <div className="container">
        <div className="row mb-2">
          <div className={`col col-lg-2 col-2`}>
            <Link to="/articles" state={{ pageNumber }} className="btn btn-area">
              Back
            </Link>
          </div>
        </div>
        <div className="row">
          <div className={`col col-lg-12 col-12`}>
            <div className="wpo-blog-content">
              <div className="post format-standard-image">
                <div className="post2">
                  <div className="max-w-2xl mx-auto mb-3">
                    <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
                      <div className="max-w-2xl mx-auto p-3">
                        <Markdown
                          rehypePlugins={[rehypeRaw]}
                          remarkPlugins={[remarkGfm]} // Enable GFM support
                          components={{
                            a: ({ href, children }) => {
                              // Check if the link is a Markdown file
                              if (href.endsWith(".md")) {
                                // Extract the article ID from the filename
                                const articleId = href.replace("article", "").replace(".md", "");
                                return (
                                  <a
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(`/article-single/${articleId}`);
                                      window.scrollTo(0, 0);
                                    }}
                                  >
                                    {children}
                                  </a>
                                );
                              }
                              // Default behavior for other links
                              return <a href={href}>{children}</a>;
                            },
                          }}
                        >
                          {content}
                        </Markdown>
                      </div>
                      <div className="d-flex mt-6" style={{ justifyContent: "space-between" }}>
                        <button
                          onClick={handlePrevious}
                          disabled={currentArticle === 1}
                          className={`btn btn-area ${
                            currentArticle === 1
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={currentArticle === articles.length}
                          className={`btn btn-area ${
                            currentArticle === articles.length
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {currentArticle === articles.length ? "Completed" : "Next"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleSingle;
