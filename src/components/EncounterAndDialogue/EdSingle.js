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
    console.log("Selected encounter and dialogue:", selectedEd); // Debug
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

  let imageBuffer = [];
  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const images = imageBuffer.map((img, index) => (
      <figure key={index} className="w-full sm:w-1/2 md:w-1/3 p-2 text-center">
        <img
          src={`/encounters/photos/${img.src}`}
          alt={img.alt}
          className="w-full h-auto rounded-lg shadow-lg"
          style={{ width: "350px", height: "400px" }}
        />
        {img.alt && <figcaption className="text-sm text-gray-500 mt-2">{img.alt}</figcaption>}
      </figure>
    ));
    imageBuffer = [];
    return (
      <div className="d-flex flex-wrap justify-content-center items-start mb-6 -mx-2">{images}</div>
    );
  };

  const components = {
    img: ({ src, alt, ...props }) => {
      console.log("Processing image:", { src, alt, props }); // Debug
      imageBuffer.push({ src, alt });
      return null;
    },
    p: ({ children }) => {
      const flush = flushImages();
      const hasText = React.Children.toArray(children).some(
        (child) => typeof child === "string" || (child?.type && child.type !== "img")
      );
      if (hasText) {
        return (
          <>
            {flush}
            <p className="mb-4">{children}</p>
          </>
        );
      }
      return flush || null; // Flush images for empty paragraphs
    },
    a: ({ href, children }) => {
      if (href.endsWith(".md")) {
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
      return <a href={href}>{children}</a>;
    },
  };

  const renderMarkdown = (content) => {
    imageBuffer = [];
    const rendered = (
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
        {content}
      </Markdown>
    );
    // console.log("Image buffer before flush:", imageBuffer); // Debug
    const flushed = flushImages();
    return (
      <>
        {rendered}
        {flushed}
      </>
    );
  };

  if (!encounterAndDialogue) {
    return <p>Encounter and dialogue not found.</p>;
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
                    <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
                      <div className="max-w-2xl mx-auto p-3">
                        {renderMarkdown(content || "")}
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

export default EdSingle;
