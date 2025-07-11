import React, { useState, useEffect, Fragment, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import Logo from "../../images/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm"; // Added for GFM support
import PhotoGalleryEd from "../../components/PhotoGalleryEd/PhotoGalleryEd";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import PdfViewer from "../../components/PdfViewer/PdfViewer";

const companionSections = [
  {
    id: 1,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion1.md",
  },
  {
    id: 2,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion2.md",
  },
  {
    id: 3,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion3.md",
  },
  {
    id: 4,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion4.md",
  },
  {
    id: 5,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion5.md",
  },
  {
    id: 6,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion6.md",
  },
  {
    id: 7,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion7.md",
  },
  {
    id: 8,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion8.md",
  },
  {
    id: 9,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion9.md",
  },
  {
    id: 10,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion10.md",
  },
  {
    id: 11,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion11.md",
  },
  {
    id: 12,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion12.md",
  },
  {
    id: 13,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion13.md",
  },
  {
    id: 14,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion14.md",
  },
  {
    id: 15,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion15.md",
  },
  {
    id: 16,
    title: "My Four-Pawed Companions",
    markdownFile: "/gallery/companion/companion16.md",
  },
];

const MyCompanion = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const imageSrcsRef = useRef([]);
  let mediaBuffer = [];
  let photoBuffer = []; // Buffer for consecutive images
  const lastElementType = useRef(null); // Track the last rendered element type

  // Calculate initial page and validate sectionId
  const getPageIndex = (id) => {
    if (!id || isNaN(id)) return 0; // Default to first page if invalid
    const index = parseInt(id) - 1; // Convert to zero-based index
    return Math.max(0, Math.min(companionSections.length - 1, index)); // Clamp to valid range
  };

  const [currentPage, setCurrentPage] = useState(getPageIndex(sectionId));

  const [sections, setSections] = useState(companionSections);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const updatedSections = await Promise.all(
        companionSections.map(async (section) => {
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
    const newPage = getPageIndex(sectionId);
    if (
      !sectionId ||
      isNaN(sectionId) ||
      parseInt(sectionId) !== sectionId ||
      parseInt(sectionId) < 1
    ) {
      // Redirect to /story/1 if sectionId is invalid or missing
      // navigate("/story/1", { replace: true });
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
      navigate(`/gallery/my-four-pawed-companions/${newPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      navigate(`/gallery/my-four-pawed-companions/${newPage + 1}`);
    }
  };

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
            cdnUrlPrefix="https://randa-kassis-website.b-cdn.net/mystory/pdf"
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

      const imageSrc = `https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/${src}`;
      imageSrcsRef.current.push(imageSrc);
      photoBuffer.push({ src: imageSrc, alt: alt || "" });
      lastElementType.current = "img";
      return null; // Will be flushed later
    },
    p: ({ children }) => {
      const flush = flushMedia();
      const hasText = React.Children.toArray(children).some(
        (child) => typeof child === "string" || (child?.type && child.type !== "img")
      );
      if (hasText) {
        lastElementType.current = "p";
        return (
          <>
            {flush}
            <p className="mb-4">{children}</p>
          </>
        );
      }
      return flush || null; // Flush images for empty paragraphs
    },
    center: ({ children }) => {
      lastElementType.current = "center";
      return (
        <div
          className="d-flex flex-column flex-md-row justify-content-center mb-4 align-items-center"
          style={{ gap: "1rem" }}
        >
          {children}
        </div>
      );
    },
  };

  const renderMarkdown = (content) => {
    mediaBuffer = [];
    photoBuffer = []; // Reset photo buffer for each render
    const rendered = (
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
        {content}
      </Markdown>
    );
    const flushed = flushMedia();
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
      <div className="wpo-service-single-area section-padding" style={{ paddingTop: "0px" }}>
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
    </Fragment>
  );
};

export default MyCompanion;
