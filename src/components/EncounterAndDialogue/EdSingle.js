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
import encounterAndDialogues from "../../api/encounterAndDialogue.json";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import PhotoGallery from "../PhotoGallery/PhotoGallery";

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
        const response = await fetch(`/encounters/pdfs/${file}`);
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
          file={`/encounters/pdfs/${file}`}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          <Page pageNumber={1} width={300} />
        </Document>
      </div>
      <figcaption className="pdf-info">
        PDF · {fileSize ? fileSize : "Loading..."}
      </figcaption>
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
  const [galleryPhotos, setGalleryPhotos] = useState([]); // State to store photos for PhotoGallery

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

  const openGallery = (index) => {
    if (lightGalleryRef.current) {
      lightGalleryRef.current.openGallery(index);
    }
  };

  const flushMedia = () => {
    if (mediaBuffer.length === 0) return null;
    const nodes = mediaBuffer;
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
        return null;
      }

      const imageSrc = `/encounters/photos/${src}`;
      imageSrcsRef.current.push(imageSrc);
      // Collect photos for PhotoGallery
      setGalleryPhotos((prevPhotos) => {
        const photo = { src: imageSrc, alt: alt || "" };
        return prevPhotos.some((p) => p.src === photo.src) ? prevPhotos : [...prevPhotos, photo];
      });
      return null; // PhotoGallery will render the images
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
      <Markdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </Markdown>
    );
    const flushedMedia = flushMedia();
    return (
      <>
        {rendered}
        {flushedMedia}
        {galleryPhotos.length > 0 && <PhotoGallery photos={galleryPhotos} />}
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
    if (currentElement < encounterAndDialogues.length - 1) {
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
            file={`/encounters/pdfs/${pdfToShow}`}
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