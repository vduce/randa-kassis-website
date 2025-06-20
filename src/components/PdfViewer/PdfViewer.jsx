import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PdfViewer = ({ file, cdnUrlPrefix }) => {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerNumPages, setViewerNumPages] = useState(null);

  const pdfUrl = `${cdnUrlPrefix}/${file}`;

  useEffect(() => {
    const computeFileSize = async () => {
      try {
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const sizeInBytes = blob.size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        setFileSize(`${sizeInMB.toFixed(2)} MB`);
      } catch (error) {
        console.error("Error fetching file size:", error);
        setFileSize("Unknown size");
      }
    };
    computeFileSize();
  }, [pdfUrl]);

  const openViewer = () => setShowViewer(true);
  const closeViewer = () => setShowViewer(false);

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    return isMobile ? screenWidth : 800;
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeViewer();
      }
    };

    if (showViewer) {
      document.body.classList.add("pdf-open");
      window.history.pushState({ pdfOpen: true }, "");
      const handlePopState = () => {
        if (showViewer) {
          closeViewer();
          window.history.pushState({ pdfOpen: true }, "");
        }
      };
      window.addEventListener("popstate", handlePopState);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.classList.remove("pdf-open");
        window.removeEventListener("popstate", handlePopState);
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.classList.remove("pdf-open");
    }
  }, [showViewer]);

  return (
    <>
      <figure className="pdf-thumbnail">
        <div className="pdf-preview" onClick={openViewer}>
          <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            <Page pageNumber={1} width={230} />
          </Document>
        </div>
        <figcaption className="pdf-info">PDF · {fileSize || "Loading..."}</figcaption>
      </figure>

      {showViewer && (
        <div
          className="pdf-fullscreen"
          onClick={closeViewer}
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
            zIndex: 1001,
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
              zIndex: 1002,
              background: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              userSelect: "none",
            }}
            onClick={(e) => {
              e.stopPropagation();
              closeViewer();
            }}
          >
            ✕
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              padding: "60px 20px 20px",
            }}
          >
            <Document file={pdfUrl} onLoadSuccess={({ numPages }) => setViewerNumPages(numPages)}>
              <style>
                {`
                .react-pdf__Page__canvas {
                  max-width: 100% !important;
                  height: auto !important;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                  margin-bottom: 20px;
                }
              `}
              </style>
              <div className="pdf-pages-container">
                {Array.from({ length: viewerNumPages || 0 }, (_, i) => (
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
        </div>
      )}
    </>
  );
};

export default PdfViewer;
