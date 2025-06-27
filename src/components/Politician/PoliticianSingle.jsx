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
import PhotoGalleryEd from "../PhotoGalleryEd/PhotoGalleryEd";
import PdfViewer from "../PdfViewer/PdfViewer";
import politicians from "../../api/politicians.json";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

const PoliticianSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentElement, setCurrentElement] = useState(Number(id) || 1);
  const [pageNumber, setPageNumber] = useState(state?.pageNumber || 1);
  const [politician, setPolitician] = useState(null);
  const [content, setContent] = useState("");
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
    const selectedPolitician = politicians.find((item) => item.id === parseInt(id));
    setPolitician(selectedPolitician);
    if (selectedPolitician && selectedPolitician.filename) {
      const fetchContent = async () => {
        try {
          const response = await fetch(`/interviews/politicians/${selectedPolitician.filename}`);
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
    const index = politicians.findIndex((item) => item.id === currentElement);
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
      nodes.push(<PhotoGalleryEd key={`gallery-${Date.now()}`} photos={photoBuffer} />);
      photoBuffer = []; // Clear the buffer after flushing
    }
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
        if (photoBuffer.length > 0) {
          mediaBuffer.push(<PhotoGalleryEd key={`gallery-${Date.now()}`} photos={photoBuffer} />);
          photoBuffer = [];
        }
        mediaBuffer.push(
          <PdfViewer
            key={src}
            file={src}
            cdnUrlPrefix="https://randa-kassis-website.b-cdn.net/interviews/politicians/pdfs"
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

      const imageSrc = `https://randa-kassis-website.b-cdn.net/interviews/politicians/photos/${src}`;
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
              navigate(`/politician-single/${edId}`);
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
      return <div className="d-flex justify-content-center mb-3">{children}</div>;
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

  if (!politician) {
    return <p>Politician not found.</p>;
  }

  const handlePrevious = () => {
    if (currentElement > 1) {
      setCurrentElement(currentElement - 1);
      navigate(`/politician-single/${currentElement - 1}`, {
        state: { pageNumber, currentElement: currentElement - 1 },
      });
    }
  };

  const handleNext = () => {
    console.log("Current Element:", currentElement);
    console.log("Total Elements:", politicians.length);
    if (currentElement < politicians.length) {
      setCurrentElement(currentElement + 1);
      navigate(`/politician-single/${currentElement + 1}`, {
        state: { pageNumber, currentElement: currentElement + 1 },
      });
    }
  };

  return (
    <section className="wpo-blog-single-section section-padding-bottom">
      <div className="container">
        <div className="row mb-2">
          <div className={`col col-lg-2 col-2`}>
            <Link
              to="/interview/the-politician"
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
                      <div className="max-w-2xl mx-auto p-3">
                        {renderMarkdown(content || "")}
                      </div>
                      <div
                        className="d-flex mt-6"
                        style={{ justifyContent: "space-between" }}
                      >
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
                          disabled={currentElement === politicians.length}
                          className={`btn btn-area ${
                            currentElement === politicians.length
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {currentElement === politicians.length
                            ? "Completed"
                            : "Next"}
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
    </section>
  );
};

export default PoliticianSingle;
