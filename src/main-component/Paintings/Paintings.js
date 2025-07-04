import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import Logo from "../../images/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

const paintingSections = [
  {
    id: 1,
    title: "On My Collections",
    markdownFile: "/paintings/painting1.md",
  },
  {
    id: 2,
    title: "On My Collections",
    markdownFile: "/paintings/painting2.md",
  },
  {
    id: 3,
    title: "On My Collections",
    markdownFile: "/paintings/painting3.md",
  },
  {
    id: 4,
    title: "On My Collections",
    markdownFile: "/paintings/painting4.md",
  },
  {
    id: 5,
    title: "On My Collections",
    markdownFile: "/paintings/painting5.md",
  },
  {
    id: 6,
    title: "On My Collections",
    markdownFile: "/paintings/painting6.md",
  },
  {
    id: 7,
    title: "On My Collections",
    markdownFile: "/paintings/painting7.md",
  },
];

const Paintings = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  // Calculate initial page and validate sectionId
  const getPageIndex = (id) => {
    if (!id || isNaN(id)) return 0; // Default to first page if invalid
    const index = parseInt(id) - 1; // Convert to zero-based index
    return Math.max(0, Math.min(paintingSections.length - 1, index)); // Clamp to valid range
  };

  const [currentPage, setCurrentPage] = useState(getPageIndex(sectionId));

  const [sections, setSections] = useState(paintingSections);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const updatedSections = await Promise.all(
        paintingSections.map(async (section) => {
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
      navigate(`/beyondPolitics/the-politician/${newPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      navigate(`/beyondPolitics/the-politician/${newPage + 1}`);
    }
  };

  let imageBuffer = [];

  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const imgs = imageBuffer.map(({ src, alt }, i) => (
      <figure key={i} className="w-full sm:w-1/2 md:w-1/3 p-2 text-center">
        <img
          src={`https://randa-kassis-website.b-cdn.net/paintings/photos/${src}`}
          alt={alt || ""}
          className="w-full mx-auto rounded shadow-sm"
          style={{ width: "250px", height: "300px" }}
        />
        {alt && <figcaption className="text-sm text-gray-500 mt-2">{alt}</figcaption>}
      </figure>
    ));
    imageBuffer = [];
    return (
      <div className="d-flex flex-wrap justify-content-center items-start mb-6 -mx-2">{imgs}</div>
    );
  };

  let lastWasMedia = false;

  const components = {
    img: ({ src, alt, ...props }) => {
      // console.log("Processing image:", { src, alt, props }); // Debug
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
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
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

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} Logo={Logo} />
      <PageTitle pageTitle={sections[currentPage]?.title} />
      <div className="wpo-service-single-area">
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

export default Paintings;
