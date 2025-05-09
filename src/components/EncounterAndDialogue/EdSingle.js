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

const EdSingle = () => {
  const { id } = useParams(); // Get the encounter and dialogue ID from the URL
  const navigate = useNavigate();
  const { state } = useLocation();
  const [encounterAndDialogue, setEncounterAndDialogue] = useState(null);
  const [content, setContent] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);
  // const defaultLayoutPluginInstance = defaultLayoutPlugin();

  console.log(state); // Debug

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

  let imageBuffer = [];
  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const images = imageBuffer.map((img, index) => (
      <figure key={index} className="w-full sm:w-1/2 md:w-1/3 p-2 text-center">
        <img
          src={`/encounters/photos/${img.src}`}
          alt={img.alt}
          className="w-full rounded-lg shadow-lg"
          style={{ width: "250px", height: "300px", objectFit: "cover" }}
        />
        {img.alt && <figcaption className="text-sm text-gray-500 mt-2">{img.alt}</figcaption>}
      </figure>
    ));
    imageBuffer = [];
    return (
      <div className="d-flex flex-wrap justify-content-center items-start mb-6 -mx-2">{images}</div>
    );
  };

  let pdfBuffer = [];

  const flushPDFs = () => {
    if (pdfBuffer.length === 0) return null;

    const pdfs = pdfBuffer.map((pdf, index) => (
      <div
        key={index}
        className="pdf-preview"
        style={{ width: "250px", height: "300px", cursor: "pointer" }}
        onClick={() => setPdfToShow(pdf.data)}
      >
        <Document
          file={`/encounters/pdfs/${pdf.data}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={1} width={250} />
        </Document>
      </div>
    ));

    return <div className="pdf-grid">{pdfs}</div>;
  };

  const components = {
    img: ({ src, alt, ...props }) => {
      // console.log("Processing image:", { src, alt, props }); // Debug
      if (src && src.endsWith(".pdf")) {
        console.log("Processing PDF:", { src, alt, props }); // Debug
        pdfBuffer.push({ data: src });
        return null;
      }
      imageBuffer.push({ src, alt });
      return null;
    },
    p: ({ children }) => {
      const flushImagesResult = flushImages();
      const flushPDFsResult = flushPDFs();
      const hasText = React.Children.toArray(children).some(
        (child) => typeof child === "string" || (child?.type && child.type !== "img")
      );
      if (hasText) {
        return (
          <>
            {flushImagesResult}
            {flushPDFsResult}
            <p className="mb-4">{children}</p>
          </>
        );
      }
      return flushImagesResult || flushPDFsResult || null; // Flush images for empty paragraphs
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
    pdfBuffer = [];
    const rendered = (
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
        {content}
      </Markdown>
    );
    // console.log("pdf buffer before flush:", pdfBuffer);
    const flushedImages = flushImages();
    const flushedPDFs = flushPDFs();
    return (
      <>
        {rendered}
        {flushedImages}
        {flushedPDFs}
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
              state={{ pageNum: state.pageNumber }}
              className="theme-btn"
            >
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
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={800}
                  className="pdf-page"
                />
              ))}
            </div>
          </Document>
        </div>
      )}
    </section>
  );
};

export default EdSingle;
