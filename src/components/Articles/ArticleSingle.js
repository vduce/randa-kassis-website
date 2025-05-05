import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import articles from "../../api/articles.json";

const ArticleSingle = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const navigate = useNavigate();
  const [article, setArticle] = useState(null); // State to store the article
  const [content, setContent] = useState(""); // State to store the article content

  useEffect(() => {
    // Scroll to the top of the page when the component mounts
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Find the article by ID
    const selectedArticle = articles.find((item) => item.id === parseInt(id));
    setArticle(selectedArticle);

    // Fetch the content of the article's Markdown file
    if (selectedArticle && selectedArticle.filename) {
      const fetchContent = async () => {
        try {
          const response = await fetch(`/articles/${selectedArticle.filename}`);
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

  if (!article) {
    return <p>Article not found.</p>;
  }

  return (
    <section className="wpo-blog-single-section section-padding">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-12 col-12`}>
            <div className="wpo-blog-content">
              <div className="post format-standard-image">
                <div className="post2">
                  <div className="max-w-2xl mx-auto mb-3">
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
