import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Logo from "../../../images/logo.png";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import Navbar from "../../../components/Navbar/Navbar";
import PageTitle from "../../../components/pagetitle/PageTitle";
import { useInView } from "react-intersection-observer";
import { useSwipeable } from "react-swipeable";
import { getCdnUrl } from "../../../config/cdn";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// Detect mobile devices
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const PDF_OPTIONS = {
  disableAutoFetch: false,
  disableStream: false,
  verbosity: 0,
  cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
  cMapPacked: true,
  standardFontDataUrl: "https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/",
};

function PdfThumbnail({ file, alt, onClick }) {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [hasError, setHasError] = useState(false);
  const isMountedRef = useRef(true);

  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px 0px",
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!inView) return; // Don't do anything until it's in view

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
        if (contentLength && isMountedRef.current) {
          const sizeInMB = parseInt(contentLength) / (1024 * 1024);
          setFileSize(`${sizeInMB.toFixed(2)} MB`);
        } else if (isMountedRef.current) {
          setFileSize("Unknown size");
        }
      } catch (error) {
        console.error("Error fetching file size:", error);
        if (isMountedRef.current) {
          setFileSize("Unknown size");
        }
      }
    };
    computeFileSize();
  }, [file, inView]);

  const handleLoadSuccess = useCallback(({ numPages }) => {
    if (isMountedRef.current) {
      setNumPages(numPages);
      setHasError(false);
    }
  }, []);

  const handleLoadError = useCallback((error) => {
    console.error("PDF thumbnail load error:", error);
    if (isMountedRef.current) {
      setHasError(true);
    }
  }, []);

  const Placeholder = () => (
    <div
      style={{
        height: "346px",
        width: "230px",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        borderRadius: "4px",
      }}
    >
      <div style={{ color: "#888" }}>Loading PDF...</div>
    </div>
  );

  return (
    <figure ref={ref} className="pdf-thumbnail" style={{ height: "346px" }}>
      {!inView ? (
        <Placeholder />
      ) : hasError ? (
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
            <div style={{ fontSize: "48px" }}>📄</div>
            <div style={{ fontSize: "12px", marginTop: "5px" }}>Click to view PDF</div>
          </div>
        </div>
      ) : (
        <div className="pdf-preview" onClick={onClick}>
          <Document
            key={file}
            file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${file}`}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={<Placeholder />}
            options={PDF_OPTIONS}
          >
            <Page
              pageNumber={1}
              width={230}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      )}
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
  const isMountedRef = useRef(true);
  const [pdfList, setPdfList] = useState([]);
  const [currentPdfIndex, setCurrentPdfIndex] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!content) return;
    const pdfSources = (content.match(/!\[.*?\]\((.*?\.pdf)\)/g) || []).map(
      (line) => line.match(/\((.*?\.pdf)\)/)[1]
    );
    setPdfList(pdfSources);
  }, [content]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(getCdnUrl(`interviews/painters/painters1.md`));
        const text = await response.text();
        if (isMountedRef.current) {
          setContent(text);
        }
      } catch (error) {
        console.error("Error fetching painter content:", error);
        if (isMountedRef.current) {
          setContent("Error loading painter content.");
        }
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    if (pdfToShow) {
      document.body.classList.add("pdf-open");
      document.body.style.overflow = "hidden";

      const handleKeyDown = (event) => {
        if (event.key === "Escape") {
          setPdfToShow(null);
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.classList.remove("pdf-open");
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [pdfToShow, currentPdfIndex, pdfList]);

  const handleThumbnailClick = useCallback(
    (src) => {
      const index = pdfList.findIndex((p) => p === src);
      if (index !== -1) {
        setCurrentPdfIndex(index);
        setPdfToShow(src);
        setNumPages(null);
      }
    },
    [pdfList]
  );

  const renderedContent = useMemo(() => {
    let mediaBuffer = [];
    let pdfIndex = 0;

    const flushMedia = () => {
      if (mediaBuffer.length === 0) return null;
      const nodes = [...mediaBuffer];
      mediaBuffer = [];
      return (
        <div
          className="d-flex flex-wrap justify-content-center items-start"
          style={{ gap: "15px", margin: "20px 0" }}
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
              key={`pdf-${pdfIndex++}-${src}`} // More unique key
              file={src}
              onClick={() => handleThumbnailClick(src)}
              alt={alt}
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
  }, [content, handleThumbnailClick]);

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const mobile = isMobile();
    if (mobile) {
      return Math.min(screenWidth - 40, 350);
    }
    return Math.min(screenWidth - 100, 800);
  };

  const handlePdfClose = useCallback((e) => {
    e?.stopPropagation();
    setPdfToShow(null);
    setCurrentPdfIndex(null);
  }, []);

  const handleNextPdf = useCallback(() => {
    if (currentPdfIndex === null || currentPdfIndex >= pdfList.length - 1) return;
    const nextIndex = currentPdfIndex + 1;
    setCurrentPdfIndex(nextIndex);
    setPdfToShow(pdfList[nextIndex]);
  }, [currentPdfIndex, pdfList]);

  const handlePreviousPdf = useCallback(() => {
    if (currentPdfIndex === null || currentPdfIndex <= 0) return;
    const prevIndex = currentPdfIndex - 1;
    setCurrentPdfIndex(prevIndex);
    setPdfToShow(pdfList[prevIndex]);
  }, [currentPdfIndex, pdfList]);

  // Setup swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleNextPdf(),
    onSwipedRight: () => handlePreviousPdf(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  const handleFullscreenLoadSuccess = useCallback(({ numPages }) => {
    if (isMountedRef.current) {
      setNumPages(numPages);
    }
  }, []);

  const handleFullscreenLoadError = useCallback((error) => {
    console.error("Fullscreen PDF load error:", error);
    if (isMountedRef.current) {
      alert("Error loading PDF. Please try again.");
      setPdfToShow(null);
    }
  }, []);

  const arrowButtonStyles = {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.3)",
    color: "white",
    border: "none",
    fontSize: "48px",
    cursor: "pointer",
    zIndex: 10001,
    padding: "10px",
    userSelect: "none",
  };

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
            {...swipeHandlers} // Apply swipe handlers to the container
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
              zIndex: 9999,
            }}
          >
            {/* Close Button */}
            <div
              style={{
                position: "fixed",
                top: "20px",
                right: "20px",
                color: "white",
                fontSize: "30px",
                cursor: "pointer",
                zIndex: 10001,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
              }}
              onClick={handlePdfClose}
            >
              ✕
            </div>

            {/* Previous/Next Arrow Buttons for Desktop */}
            {!isMobile() && (
              <>
                <button
                  style={{ ...arrowButtonStyles, left: "20px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousPdf();
                  }}
                  disabled={currentPdfIndex <= 0}
                >
                  &#8249;
                </button>
                <button
                  style={{ ...arrowButtonStyles, right: "20px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextPdf();
                  }}
                  disabled={currentPdfIndex >= pdfList.length - 1}
                >
                  &#8250;
                </button>
              </>
            )}

            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                padding: "60px 20px 20px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Document
                key={pdfToShow}
                file={`https://randa-kassis-website.b-cdn.net/interviews/painters/${pdfToShow}`}
                onLoadSuccess={handleFullscreenLoadSuccess}
                onLoadError={handleFullscreenLoadError}
                options={PDF_OPTIONS}
                loading={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "50vh",
                      color: "white",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "18px", marginBottom: "10px" }}>Loading PDF...</div>
                      <div style={{ fontSize: "14px", opacity: 0.7 }}>Please wait</div>
                    </div>
                  </div>
                }
              >
                <style>
                  {`
                  .react-pdf__Page__canvas {
                    max-width: 100% !important;
                    height: auto !important;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                    margin-bottom: 20px;
                  }
                  .pdf-pages-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                  }
                `}
                </style>
                <div className="pdf-pages-container">
                  {Array.from({ length: numPages || 0 }, (_, i) => (
                    <Page
                      key={`fullscreen-page-${i}-${pdfToShow}`}
                      pageNumber={i + 1}
                      width={calculatePageWidth()}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <div
                          style={{
                            width: calculatePageWidth(),
                            height: "400px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            marginBottom: "20px",
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
          </div>
        )}
      </section>
    </Fragment>
  );
};

export default ThePainter;
