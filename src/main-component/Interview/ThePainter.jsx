import React, { Fragment, useEffect, useState } from "react";
import Logo from "../../images/logo.png";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfThumbnail({ file, alt, onClick }) {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  useEffect(() => {
    const computeFileSize = async () => {
      try {
        const response = await fetch(
          `https://randa-kassis-website.b-cdn.net/interviews/painters/${file}`
        );
        const blob = await response.blob();
        const sizeInBytes = blob.size;
        const sizeInMB = sizeInBytes / (1024 * 1024); // Convert to MB
        setFileSize(`${sizeInMB.toFixed(2)} MB`);
      } catch (error) {
        console.error("Error fetching file size:", error);
        setFileSize("Unknown size");
      }
    };
    computeFileSize();
  }, [file]);

  return (
    <figure className="pdf-thumbnail" style={{ height: '346px' }}>
      <div className="pdf-preview" onClick={onClick}>
        <Document
          file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${file}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={1} width={230} />
        </Document>
      </div>
      <figcaption className="pdf-info">
        <h5 className="pdf-title">{alt || file}</h5>
        <p style={{ fontSize: '15px', color: '#666' }}>
          PDF · {fileSize ? fileSize : "Loading..."}
        </p>
      </figcaption>
    </figure>
  );
}

const ThePainter = () => {
  const [content, setContent] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);
  let mediaBuffer = [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/interviews/painters/painters1.md`);
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error fetching painter content:", error);
        setContent("Error loading painter content.");
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (pdfToShow) {
      document.body.classList.add("pdf-open");
      window.history.pushState({ pdfOpen: true }, "");
      const handlePopState = (event) => {
        if (pdfToShow) {
          setPdfToShow(null);
          window.history.pushState({ pdfOpen: true }, "");
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        document.body.classList.remove("pdf-open");
        window.removeEventListener("popstate", handlePopState);
      };
    } else {
      document.body.classList.remove("pdf-open");
    }
  }, [pdfToShow, setPdfToShow]);

  const flushMedia = () => {
    if (mediaBuffer.length === 0) return null;
    const nodes = [...mediaBuffer];
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
      if (src?.endsWith(".pdf")) {
        mediaBuffer.push(
          <PdfThumbnail
            key={src}
            file={src}
            filename={src}
            onClick={() => {
              setPdfToShow(src);
              setNumPages(null);
            }}
            alt={alt}
            className="w-full sm:w-1/2 md:w-1/3 p-2 text-center"
            style={{ width: 300, height: 300 }}
          />
        );
        return null;
      }
      return <img src={src} alt={alt} />;
    },

    p: ({ children }) => {
      const media = flushMedia();
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
      return media;
    },

    h4: ({ children }) => {
      return <h4>{children}</h4>;
    },

    b: ({ children }) => {
      return <b>{children}</b>;
    },

    center: ({ children }) => {
      return <div className="d-flex justify-content-center mb-3">{children}</div>;
    },
  };

  const renderMarkdown = (content) => {
    mediaBuffer = [];
    const rendered = (
      <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    );
    const flushedMedia = flushMedia(); // Flush any remaining PDFs
    return (
      <>
        {rendered}
        {flushedMedia}
      </>
    );
  };

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    return isMobile ? screenWidth : 800;
  };

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} Logo={Logo} />
      <PageTitle pageTitle="The Painter - Press Coverage" />
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
              overflowY: "auto",
              zIndex: 1001,
            }}
          >
            <Document
              file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${pdfToShow}`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              <style>
                {`
                .react-pdf__Page__canvas {
                  height: auto !important;
                }
              `}
              </style>
              <div className="pdf-pages-container">
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <Page
                    key={i}
                    pageNumber={i + 1}
                    width={calculatePageWidth()}
                    className="pdf-page"
                  />
                ))}
              </div>
            </Document>
          </div>
        )}
      </section>
    </Fragment>
  );
};

export default ThePainter;
