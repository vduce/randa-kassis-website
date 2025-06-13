import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import Logo from "../../images/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import PhotoGalleryEd from "../../components/PhotoGalleryEd/PhotoGalleryEd";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const ExibitionMomentSections = [
  {
    id: 1,
    title: "Exhibitions & Moments",
    markdownFile: "/exhibitions/em1.md",
  },
];

function PdfThumbnail({ file, fileName, onClick }) {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  useEffect(() => {
    const computeFileSize = async () => {
      try {
        const response = await fetch(
          `https://randa-kassis-website.b-cdn.net/exhibitions/pdfs/${file}`
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
    <figure className="pdf-thumbnail">
      <div className="pdf-preview" onClick={onClick}>
        <Document
          file={`https://randa-kassis-website.b-cdn.net/exhibitions/pdfs/${file}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={1} width={230} />
        </Document>
      </div>
      <figcaption className="pdf-info">PDF · {fileSize ? fileSize : "Loading..."}</figcaption>
    </figure>
  );
}

const ExibitionMoments = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);

  // Calculate initial page and validate sectionId
  const getPageIndex = (id) => {
    if (!id || isNaN(id)) return 0; // Default to first page if invalid
    const index = parseInt(id) - 1; // Convert to zero-based index
    return Math.max(0, Math.min(ExibitionMomentSections.length - 1, index)); // Clamp to valid range
  };

  const [currentPage, setCurrentPage] = useState(getPageIndex(sectionId));

  const [sections, setSections] = useState(ExibitionMomentSections);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const updatedSections = await Promise.all(
        ExibitionMomentSections.map(async (section) => {
          try {
            const response = await fetch(section.markdownFile);
            const content = await response.text();
            return { ...section, content };
          } catch (error) {
            console.error(`Error fetching ${section.markdownFile}:`, error);
            return { ...section, content: "Error loading content." };
          }
        })
      );
      setSections(updatedSections);
    };
    fetchMarkdown();
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

  useEffect(() => {
    const newPage = getPageIndex(sectionId);
    if (
      !sectionId ||
      isNaN(sectionId) ||
      parseInt(sectionId) !== sectionId ||
      parseInt(sectionId) < 1
    ) {
      // Redirect to /paintings/1 if sectionId is invalid or missing
      // navigate("/paintings/1", { replace: true });
      setCurrentPage(newPage);
    } else if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [sectionId, navigate, currentPage]);

  const handleNext = () => {
    if (currentPage < sections.length - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
      navigate(`/beyondPolitics/the-essayist-the-critic/${newPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      navigate(`/beyondPolitics/the-essayist-the-critic/${newPage + 1}`);
    }
  };

  let imageBuffer = [];

  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const imgs = imageBuffer.map(({ src, alt }, i) => ({
      key: i,
      src: `https://randa-kassis-website.b-cdn.net/exhibitions/photos/${src}`,
      alt: alt || "",
      caption: alt ? <span className="text-sm text-gray-500 mt-2">{alt}</span> : null,
      className: "w-full mx-auto rounded shadow-sm",
      style: { width: "250px", height: "300px", objectFit: "cover" },
    }));
    imageBuffer = [];
    return (
      <div className="d-flex flex-wrap justify-content-center items-start mb-6 -mx-2">
        <PhotoGalleryEd photos={imgs} />
      </div>
    );
  };

  let lastWasMedia = false;

  const components = {
    img: ({ src, alt }) => {
      // console.log("Image component called with src:", src); // Debug
      if (src?.endsWith(".pdf")) {
        return (
          <div
            onClick={() => setPdfToShow(src)}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <PdfThumbnail file={src} fileName={alt} onClick={() => setPdfToShow(src)} />
          </div>
        );
      }
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
  };

  const renderMarkdown = (content) => {
    imageBuffer = [];
    const rendered = (
      <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={components}>
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

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    return isMobile ? screenWidth : 800;
  };

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} Logo={Logo} />
      <PageTitle pageTitle={sections[currentPage]?.title} />
      <div className="wpo-service-single-area section-padding-bottom">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="wpo-service-single-wrap">
                <div className="wpo-service-single-item">
                  <div className="wpo-service-single-main-img row"></div>
                  <div className="wpo-service-single-title"></div>
                  <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
                    <div className="max-w-2xl mx-auto p-3">
                      {renderMarkdown(sections[currentPage]?.content || "")}
                    </div>
                    <div className="d-flex mt-6" style={{ justifyContent: "space-between" }}>
                      <button
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                        className={`btn btn-area ${
                          currentPage === 0
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentPage === sections.length - 1}
                        className={`btn btn-area ${
                          currentPage === sections.length - 1
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {currentPage === sections.length - 1 ? "Completed" : "Next"}
                      </button>
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
            file={`https://randa-kassis-website.b-cdn.net/exhibitions/pdfs/${pdfToShow}`}
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
    </Fragment>
  );
};

export default ExibitionMoments;
