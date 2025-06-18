import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
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

// Detect iOS devices
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

// Configure PDF.js options based on device
const getPdfOptions = () => {
  const iOS = isIOS();
  return {
    cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
    cMapPacked: true,
    standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
    disableWorker: iOS,
    verbosity: 0,
    disableFontFace: iOS, // Disable font face on iOS
    maxImageSize: iOS ? 1024 * 1024 : -1, // Limit image size on iOS
    isEvalSupported: !iOS, // Disable eval on iOS
  };
};

function PdfThumbnail({ file, alt, onClick, index }) {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Lazy loading with delay for iOS
  useEffect(() => {
    const iOS = isIOS();
    const delay = iOS ? index * 400 : index * 150; // Longer delay for iOS

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!shouldRender) return;
    const computeFileSize = async () => {
      try {
        const response = await fetch(
          `https://randa-kassis-website.b-cdn.net/interviews/painters/${file}`,
          {
            method: "HEAD",
            cache: "force-cache",
          }
        );
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          setFileSize(`${sizeInMB.toFixed(2)} MB`);
        } else {
          setFileSize("Unknown size");
        }
      } catch (error) {
        console.error("Error fetching file size:", error);
        setFileSize("Unknown size");
      }
    };
    computeFileSize();
  }, [file, shouldRender]);

  const handleLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleLoadError = useCallback((error) => {
    console.error("PDF load error:", error);
    setHasError(true);
    setIsLoading(false);
  }, []);

  if (!shouldRender) {
    return (
      <figure className="pdf-thumbnail" style={{ height: "346px" }}>
        <div
          className="pdf-preview"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
            height: "230px",
          }}
        >
          <div>Loading...</div>
        </div>
        <figcaption className="pdf-info">
          <h5 className="pdf-title">{alt || file}</h5>
          <p style={{ fontSize: "15px", color: "#666" }}>PDF · Loading...</p>
        </figcaption>
      </figure>
    );
  }

  if (hasError) {
    return (
      <figure className="pdf-thumbnail" style={{ height: "346px" }}>
        <div
          className="pdf-preview"
          onClick={onClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f5f5f5",
            height: "230px",
            cursor: "pointer",
            border: "2px solid #ddd",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div>📄</div>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>Click to view PDF</div>
          </div>
        </div>
        <figcaption className="pdf-info">
          <h5 className="pdf-title">{alt || file}</h5>
          <p style={{ fontSize: "15px", color: "#666" }}>PDF · {fileSize || "Loading..."}</p>
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="pdf-thumbnail" style={{ height: "346px" }}>
      <div className="pdf-preview" onClick={onClick}>
        <Document
          file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${file}`}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={
            <div
              style={{
                height: "230px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Loading PDF...
            </div>
          }
          options={getPdfOptions()}
        >
          <Page
            pageNumber={1}
            width={230}
            renderTextLayer={false} // Disable text layer for better performance
            renderAnnotationLayer={false} // Disable annotation layer
            loading={
              <div
                style={{
                  height: "230px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Rendering...
              </div>
            }
          />
        </Document>
      </div>
      <figcaption className="pdf-info">
        <h5 className="pdf-title">{alt || file}</h5>
        <p style={{ fontSize: "15px", color: "#666" }}>PDF · {fileSize || "Loading..."}</p>
      </figcaption>
    </figure>
  );
}

const ThePainter = () => {
  const [content, setContent] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);

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

  const renderedContent = useMemo(() => {
    let mediaBuffer = [];
    let pdfIndex = 0;

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
          const currentIndex = pdfIndex++;
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
              index={currentIndex}
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
  }, [content]);

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    return isMobile ? screenWidth : 800;
  };

  const handlePdfClose = useCallback(() => {
    setPdfToShow(null);
  }, []);

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} Logo={Logo} />
      <PageTitle pageTitle="The Painter" />
      <section className="wpo-blog-single-section section-padding-bottom">
        <div className="container">
          <div className="row">
            <div className={`col col-lg-12 col-12`}>
              <div className="wpo-blog-content">
                <div className="post format-standard-image">
                  <div className="post2">
                    <div className="max-w-2xl mx-auto mb-3">
                      <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
                        <div className="max-w-2xl mx-auto p-3">{renderedContent}</div>
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
            onClick={handlePdfClose}
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
            <div
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
                zIndex: 1002,
                background: "rgba(0,0,0,0.5)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={handlePdfClose}
            >
              ×
            </div>
            <Document
              file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${pdfToShow}`}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(error) => {
                console.error("Fullscreen PDF load error:", error);
                setPdfToShow(null);
              }}
              options={getPdfOptions()}
              loading={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    color: "white",
                  }}
                >
                  Loading PDF...
                </div>
              }
            >
              <style>
                {`
                .react-pdf__Page__canvas {
                  height: auto !important;
                  max-width: 100% !important;
                }
                .pdf-pages-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  padding: 20px;
                  gap: 20px;
                }
              `}
              </style>
              <div className="pdf-pages-container">
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <Page
                    key={`page-${i}`}
                    pageNumber={i + 1}
                    width={calculatePageWidth()}
                    className="pdf-page"
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div
                        style={{
                          width: calculatePageWidth(),
                          height: "600px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f0f0f0",
                          color: "#666",
                        }}
                      >
                        Loading page {i + 1}...
                      </div>
                    }
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
