import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { Document, Page, pdfjs } from "react-pdf";

import encounterAndDialogues from "../../api/encounterAndDialogue.json";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfThumbnail({ file, onClick }) {
  const [numPages, setNumPages] = useState(null);

  return (
    <div
      className="pdf-preview pdf-grid"
      style={{ width: 250, height: 300, cursor: "pointer" }}
      onClick={onClick}
    >
      <Document
        file={`/encounters/pdfs/${file}`}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={1} width={250} />
      </Document>
    </div>
  );
}

const EdSingle = () => {
  const { id } = useParams(); // Get the encounter and dialogue ID from the URL
  const navigate = useNavigate();
  const { state } = useLocation();
  const [encounterAndDialogue, setEncounterAndDialogue] = useState(null);
  const [content, setContent] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const selectedEd = encounterAndDialogues.find((item) => item.id === parseInt(id));
    // console.log("Selected encounter and dialogue:", selectedEd); // Debug
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

  useEffect(() => {
    if (pdfToShow) {
      document.body.classList.add("pdf-open");
    } else {
      document.body.classList.remove("pdf-open");
    }
  }, [pdfToShow]);

  let mediaBuffer = [];

  const flushMedia = () => {
    if (mediaBuffer.length === 0) return null;

    const nodes = mediaBuffer;
    mediaBuffer = [];

    return (
      <div className="d-flex flex-wrap justify-content-center items-start mb-6 -mx-2">
        {nodes.map((node, i) => (
          <React.Fragment key={i}>{node}</React.Fragment>
        ))}
      </div>
    );
  };

  const components = {
    img: ({ src, alt }) => {
      if (src?.endsWith(".pdf")) {
        // wrap PdfThumbnail in exactly the same figure classes:
        mediaBuffer.push(
          <PdfThumbnail
            key={src}
            file={src}
            onClick={() => {
              setPdfToShow(src);
              setNumPages(null);
            }}
            className="w-full sm:w-1/2 md:w-1/3 p-2 text-center"
            style={{ width: 250, height: 300 }}
          />
        );
        return null;
      }

      // a normal image:
      mediaBuffer.push(
        <figure className="w-full sm:w-1/2 md:w-1/3 p-2 text-center">
          <img
            src={`/encounters/photos/${src}`}
            alt={alt}
            className="w-full rounded-lg shadow-lg object-cover"
            style={{ width: 250, height: 300 }}
          />
          {alt && <figcaption className="text-sm text-gray-500 mt-2">{alt}</figcaption>}
        </figure>
      );
      return null;
    },

    p: ({ children }) => {
      // flush *all* media (imgs + pdfs) at once
      const media = flushMedia();

      // check if there's any real text in this paragraph:
      const hasText = React.Children.toArray(children).some(
        (c) => typeof c === "string" || (React.isValidElement(c) && c.type !== "img")
      );

      if (hasText) {
        return (
          <>
            {media}
            <p className="mb-4">{children}</p>
          </>
        );
      }

      // no real text? just spit out the media container
      return media;
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
    mediaBuffer = [];
    const rendered = (
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
        {content}
      </Markdown>
    );
    const flushedMedia = flushMedia();
    return (
      <>
        {rendered}
        {flushedMedia}
      </>
    );
  };

  if (!encounterAndDialogue) {
    return <p>Encounter and dialogue not found.</p>;
  }

  return (
    <section className="wpo-blog-single-section section-padding-bottom">
      <div className="container">
        <div className="row mb-2">
          <div className={`col col-lg-2 col-2`}>
            <Link
              to="/encounter-and-dialogue"
              state={{ pageNum: state?.pageNumber || 1 }}
              className="btn btn-area"
            >
              Previous
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
                      <div className="max-w-2xl mx-auto p-3">{renderMarkdown(content || "")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {pdfToShow && (
        <div
          className="pdf-fullscreen"
          onClick={() => setPdfToShow(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001, // Higher than navbar
            overflowY: "auto",
          }}
        >
          <Document
            file={`/encounters/pdfs/${pdfToShow}`}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            <div className="pdf-pages-container">
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <Page key={i} pageNumber={i + 1} width={800} className="pdf-page" />
              ))}
            </div>
          </Document>
        </div>
      )}
    </section>
  );
};

export default EdSingle;
