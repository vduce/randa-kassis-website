import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import Logo from "../../images/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm"; // Added for GFM support
import StyledVideo from "./StoryVideo";
import PhotoGalleryEd from "../../components/PhotoGalleryEd/PhotoGalleryEd";

const storySections = [
  {
    id: 1,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story1.md",
  },
  {
    id: 2,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story2.md",
  },
  {
    id: 3,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story3.md",
  },
  {
    id: 4,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story4.md",
  },
  {
    id: 5,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story5.md",
  },
  {
    id: 6,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story6.md",
  },
  {
    id: 7,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story7.md",
  },
  {
    id: 8,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story8.md",
  },
  {
    id: 9,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story9.md",
  },
  {
    id: 10,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story10.md",
  },
  {
    id: 11,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story11.md",
  },
  {
    id: 12,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story12.md",
  },
  {
    id: 13,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story13.md",
  },
  {
    id: 14,
    title: "A Rebel at Heart: My Story",
    markdownFile: "/story/story14.md",
  },
];

const MyStory = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  // Calculate initial page and validate sectionId
  const getPageIndex = (id) => {
    if (!id || isNaN(id)) return 0; // Default to first page if invalid
    const index = parseInt(id) - 1; // Convert to zero-based index
    return Math.max(0, Math.min(storySections.length - 1, index)); // Clamp to valid range
  };

  const [currentPage, setCurrentPage] = useState(getPageIndex(sectionId));

  const [sections, setSections] = useState(storySections);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const updatedSections = await Promise.all(
        storySections.map(async (section) => {
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
      navigate(`/story/${newPage + 1}`);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      navigate(`/story/${newPage + 1}`);
    }
  };

  let imageBuffer = [];

  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const imgs = imageBuffer.map(({ src, alt }, i) =>
      // <figure key={i} className="w-full sm:w-1/2 md:w-1/3 p-2 text-center">
      //   <img
      //     src={`/photos/${src}`} // Ensure this path is correct
      //     alt={alt || ""}
      //     className="w-full mx-auto rounded shadow-sm"
      //     style={{ width: "250px", height: "300px", objectFit: "cover" }} // Adjust size as needed
      //   />
      //   {alt && <figcaption className="text-sm text-gray-500 mt-2">{alt}</figcaption>}
      // </figure>
      ({
        key: i,
        src: `https://randa-kassis-website.b-cdn.net/mystory/photos/${src}`,
        alt: alt || "",
        caption: alt ? <span className="text-sm text-gray-500 mt-2">{alt}</span> : null,
        className: "w-full mx-auto rounded shadow-sm",
        style: { width: "250px", height: "300px", objectFit: "cover" },
      })
    );
    imageBuffer = [];
    return (
      <div
        className="d-flex flex-wrap justify-content-center items-start mb-6 mx-2"
      >
        <PhotoGalleryEd photos={imgs} />
      </div>
    );
  };

  let lastWasMedia = false;

  const components = {
    img: ({ src, alt, ...props }) => {
      // console.log("Processing image:", { src, alt, props }); // Debug
      const isVideo = /\.(mp4|webm|ogg)$/i.test(src);
      if (isVideo) {
        lastWasMedia = true;
        return <StyledVideo url={src} />;
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
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]} // Added GFM support
        components={components}
      >
        {content}
      </Markdown>
    );
    console.log("Image buffer before flush:", imageBuffer); // Debug
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

export default MyStory;
