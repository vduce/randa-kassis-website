import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Markdown from "react-markdown";
import Logo from "../../images/logo.png";
import Navbar from "../../components/Navbar/Navbar";
import PageTitle from "../../components/pagetitle/PageTitle";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import PhotoGallery from "../../components/PhotoGallery/PhotoGallery";

const InTheArenaSections = [
  {
    id: 1,
    title: "In The Arena",
    markdownFile: "/gallery/arena/arena1.md",
  },
];

const InTheArena = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();

  // Calculate initial page and validate sectionId
  const getPageIndex = (id) => {
    if (!id || isNaN(id)) return 0; // Default to first page if invalid
    const index = parseInt(id) - 1; // Convert to zero-based index
    return Math.max(0, Math.min(InTheArenaSections.length - 1, index)); // Clamp to valid range
  };

  const [currentPage, setCurrentPage] = useState(getPageIndex(sectionId));
  const [sections, setSections] = useState(InTheArenaSections);

  useEffect(() => {
    const fetchMarkdown = async () => {
      const updatedSections = await Promise.all(
        InTheArenaSections.map(async (section) => {
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
    if (!sectionId || isNaN(sectionId) || parseInt(sectionId) < 1) {
      setCurrentPage(newPage);
    } else if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [sectionId, navigate, currentPage]);

  let imageBuffer = [];

  const flushImages = () => {
    if (imageBuffer.length === 0) return null;

    const imgs = imageBuffer.map(({ src, alt }, i) => ({
      key: i,
      src: `https://randa-kassis-website.b-cdn.net/gallery/inthearena/${src}`,
      alt: alt || "",
      caption: alt ? <span className="text-sm text-gray-500 mt-2">{alt}</span> : null,
      className: "w-full mx-auto rounded shadow-sm",
      style: { width: "250px", height: "300px", objectFit: "cover" },
    }));
    imageBuffer = [];
    return (
      <div className="d-flex flex-wrap gap-4 mb-3">
        <PhotoGallery photos={imgs} />
      </div>
    );
  };

  const components = {
    img: ({ src, alt }) => {
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

export default InTheArena;
