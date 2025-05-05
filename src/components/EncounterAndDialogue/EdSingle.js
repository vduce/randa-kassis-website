import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import encounterAndDialogues from "../../api/encounterAndDialogue.json";

const EdSingle = () => {
  const { id } = useParams(); // Get the encounter and dialogue ID from the URL
  const navigate = useNavigate();
  const [encounterAndDialogue, setEncounterAndDialogue] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const selectedEd = encounterAndDialogues.find((item) => item.id === parseInt(id));
    setEncounterAndDialogue(selectedEd);

    if (selectedEd && selectedEd.filename) {
      const fetchContent = async () => {
        try {
          const response = await fetch(`/encounters/${selectedEd.filename}`);
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

  if (!encounterAndDialogue) {
    return <p>Article not found.</p>;
  }
  return (
    <section className="wpo-blog-single-section section-padding-bottom">
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
                            // Extract the encounter and dialogue ID from the link
                            const edId = href.replace("ed", "").replace(".md", "");
                            return (
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/encounter-and-dialogue-single/${edId}`);
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

export default EdSingle;
