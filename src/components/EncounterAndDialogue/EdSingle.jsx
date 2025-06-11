import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgAutoplay from "lightgallery/plugins/autoplay";
import lgVideo from "lightgallery/plugins/video";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Document, Page, pdfjs } from "react-pdf";
import PhotoGalleryEd from "../PhotoGalleryEd/PhotoGalleryEd"; // Import PhotoGallery component
import encounterAndDialogues from "../../api/encounterAndDialogue.json";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PdfThumbnail({ file, fileName, onClick }) {
  const [numPages, setNumPages] = useState(null);
  const [fileSize, setFileSize] = useState(null);

  useEffect(() => {
    const computeFileSize = async () => {
      try {
        const response = await fetch(
          `https://randa-kassis-website.b-cdn.net/encounters/pdfs/${file}`
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
          file={`https://randa-kassis-website.b-cdn.net/encounters/pdfs/${file}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={1} width={300} />
        </Document>
      </div>
      <figcaption className="pdf-info">PDF · {fileSize ? fileSize : "Loading..."}</figcaption>
    </figure>
  );
}

const EdSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentElement, setCurrentElement] = useState(Number(id) || 1);
  const [pageNumber, setPageNumber] = useState(state?.pageNumber || 1);
  const [encounterAndDialogue, setEncounterAndDialogue] = useState(null);
  const [content, setContent] = useState("");
  const [pdfToShow, setPdfToShow] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const lightGalleryRef = useRef(null);
  const imageSrcsRef = useRef([]);
  const [currentPageImages, setCurrentPageImages] = useState([]);
  let mediaBuffer = [];
  let photoBuffer = []; // Buffer for consecutive images
  const lastElementType = useRef(null); // Track the last rendered element type

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
    const index = encounterAndDialogues.findIndex((item) => item.id === currentElement);
    if (index !== -1) {
      const pageNum = Math.floor(index / 10) + 1;
      setPageNumber(pageNum);
    }
  }, [currentElement]);

  useEffect(() => {
    imageSrcsRef.current = [];
    setTimeout(() => {
      setCurrentPageImages(
        imageSrcsRef.current.map((src) => ({
          src,
          thumb: src,
          subHtml: "",
        }))
      );
    }, 0);
  }, [content]);

  const flushMedia = () => {
    if (mediaBuffer.length === 0 && photoBuffer.length === 0) return null;
    const nodes = [...mediaBuffer];
    if (photoBuffer.length > 0) {
      console.log("Flushing PhotoGallery with photos:", photoBuffer); // Debug log
      nodes.push(<PhotoGalleryEd key={`gallery-${Date.now()}`} photos={photoBuffer} />);
      photoBuffer = []; // Clear the buffer after flushing
    }
    mediaBuffer = [];
    return (
      <div className="d-flex flex-wrap justify-content-center items-start -mx-2" style={{ gap: "6px" }}>
        {nodes.map((node, i) => (
          <React.Fragment key={i}>{node}</React.Fragment>
        ))}
      </div>
    );
  };

  const components = {
    img: ({ src, alt }) => {
      if (src?.endsWith(".pdf")) {
        if (photoBuffer.length > 0) {
          mediaBuffer.push(<PhotoGalleryEd key={`gallery-${Date.now()}`} photos={photoBuffer} />);
          photoBuffer = [];
        }
        mediaBuffer.push(
          <PdfThumbnail
            key={src}
            file={src}
            filename={src}
            onClick={() => {
              setPdfToShow(src);
              setNumPages(null);
            }}
            className="w-full sm:w-1/2 md:w-1/3 p-2 text-center"
            style={{ width: 300, height: 300 }}
          />
        );
        lastElementType.current = "pdf";
        return null;
      }

      // Flush buffer if the last element was not an image
      if (photoBuffer.length > 0 && lastElementType.current !== "img") {
        mediaBuffer.push(<PhotoGalleryEd key={`gallery-${Date.now()}`} photos={photoBuffer} />);
        photoBuffer = [];
      }

      const imageSrc = `https://randa-kassis-website.b-cdn.net/encounters/photos/${src}`;
      imageSrcsRef.current.push(imageSrc);
      photoBuffer.push({ src: imageSrc, alt: alt || "" });
      lastElementType.current = "img";
      return null; // Will be flushed later
    },

    p: ({ children }) => {
      const media = flushMedia();
      const hasText = React.Children.toArray(children).some(
        (c) => typeof c === "string" || (React.isValidElement(c) && c.type !== "img")
      );
      if (hasText) {
        lastElementType.current = "p";
        return (
          <>
            {media}
            <p className="mb-4">{children}</p>
          </>
        );
      }
      return media;
    },

    a: ({ href, children }) => {
      if (href.endsWith(".md")) {
        const edId = href.replace("ed", "").replace(".md", "");
        lastElementType.current = "a";
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
      lastElementType.current = "a";
      return <a href={href}>{children}</a>;
    },

    h4: ({ children }) => {
      lastElementType.current = "h4";
      return <h4>{children}</h4>;
    },

    b: ({ children }) => {
      lastElementType.current = "b";
      return <b>{children}</b>;
    },

    text: ({ value }) => {
      if (value.trim()) {
        lastElementType.current = "text";
        return <span>{value}</span>;
      }
      return null;
    },

    center: ({ children }) => {
      lastElementType.current = "center";
      return <center>{children}</center>;
    },

    iframe: ({ src, ...props }) => {
      lastElementType.current = "iframe";
      return <iframe src={src} {...props} />;
    },
  };

  const renderMarkdown = (content) => {
    mediaBuffer = [];
    photoBuffer = []; // Reset photo buffer for each render
    lastElementType.current = null; // Reset last element type
    const rendered = (
      <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    );
    const flushedMedia = flushMedia(); // Flush any remaining photos
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

  const handlePrevious = () => {
    if (currentElement > 1) {
      setCurrentElement(currentElement - 1);
      navigate(`/encounter-and-dialogue-single/${currentElement - 1}`, {
        state: { pageNumber, currentElement: currentElement - 1 },
      });
    }
  };

  const handleNext = () => {
    console.log("Current Element:", currentElement);
    console.log("Total Elements:", encounterAndDialogues.length);
    if (currentElement < encounterAndDialogues.length) {
      setCurrentElement(currentElement + 1);
      navigate(`/encounter-and-dialogue-single/${currentElement + 1}`, {
        state: { pageNumber, currentElement: currentElement + 1 },
      });
    }
  };

  const calculatePageWidth = () => {
    const screenWidth = window.innerWidth;
    const isMobile = screenWidth <= 768;
    return isMobile ? screenWidth : 800;
  };

  return (
    <section className="wpo-blog-single-section section-padding-bottom">
      <div className="container">
        <div className="row mb-2">
          <div className={`col col-lg-2 col-2`}>
            <Link
              to="/encounter-and-dialogue"
              state={{ pageNum: pageNumber, currentElement }}
              className="btn btn-area"
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
                      <div className="d-flex mt-6" style={{ justifyContent: "space-between" }}>
                        <button
                          onClick={handlePrevious}
                          disabled={currentElement === 1}
                          className={`btn btn-area ${
                            currentElement === 1
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          Previous
                        </button>
                        <button
                          onClick={handleNext}
                          disabled={currentElement === encounterAndDialogues.length}
                          className={`btn btn-area ${
                            currentElement === encounterAndDialogues.length
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {currentElement === encounterAndDialogues.length ? "Completed" : "Next"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LightGallery
        dynamic
        dynamicEl={currentPageImages}
        onInit={(detail) => {
          lightGalleryRef.current = detail.instance;
        }}
        plugins={[lgZoom, lgThumbnail, lgAutoplay, lgVideo]}
        speed={500}
        autoplay={false}
        settings={{
          closable: true,
          backdropDuration: 300,
        }}
        zoom={true}
      />
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
            file={`https://randa-kassis-website.b-cdn.net/encounters/pdfs/${pdfToShow}`}
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
  );
};

export default EdSingle;