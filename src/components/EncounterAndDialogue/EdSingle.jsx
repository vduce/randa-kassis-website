import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgAutoplay from "lightgallery/plugins/autoplay";
import lgVideo from "lightgallery/plugins/video";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { fetchEncounters } from "../../services/cdnJsonService";
import { getCdnUrl } from "../../config/cdn";
import { createMarkdownRenderer } from "../../utils/markdownRenderer";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";

const EdSingle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentElement, setCurrentElement] = useState(Number(id) || 1);
  const [pageNumber, setPageNumber] = useState(state?.pageNumber || 1);
  const [encounterAndDialogue, setEncounterAndDialogue] = useState(null);
  const [encounterAndDialogues, setEncounterAndDialogues] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const lightGalleryRef = useRef(null);
  const imageSrcsRef = useRef([]);
  const [currentPageImages, setCurrentPageImages] = useState([]);

  // Navigation handler for .md links
  const handleMdNavigation = (href) => {
    const edId = href.replace("ed", "").replace(".md", "");
    navigate(`/encounter-and-dialogue-single/${edId}`);
    window.scrollTo(0, 0);
  };

  // Create markdown renderer with shared logic
  const renderer = useMemo(() => {
    return createMarkdownRenderer("encounters", {
      onNavigate: handleMdNavigation,
      imageSrcsRef: imageSrcsRef,
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadEncounter = async () => {
      setLoading(true);
      try {
        const encountersData = await fetchEncounters();
        setEncounterAndDialogues(encountersData);

        const selectedEd = encountersData.find(
          (item) => item.id === parseInt(id),
        );
        setEncounterAndDialogue(selectedEd);

        if (selectedEd && selectedEd.filename) {
          const response = await fetch(
            getCdnUrl(`encounters/${selectedEd.filename}`),
          );
          const text = await response.text();
          setContent(text);
        }
      } catch (error) {
        console.error("Error loading encounter:", error);
        setContent("Error loading content.");
      } finally {
        setLoading(false);
      }
    };

    loadEncounter();
  }, [id]);

  useEffect(() => {
    if (encounterAndDialogues.length > 0) {
      const index = encounterAndDialogues.findIndex(
        (item) => item.id === currentElement,
      );
      if (index !== -1) {
        const pageNum = Math.floor(index / 10) + 1;
        setPageNumber(pageNum);
      }
    }
  }, [currentElement, encounterAndDialogues]);

  useEffect(() => {
    imageSrcsRef.current = [];
    setTimeout(() => {
      setCurrentPageImages(
        imageSrcsRef.current.map((src) => ({
          src,
          thumb: src,
          subHtml: "",
        })),
      );
    }, 0);
  }, [content]);

  const renderMarkdown = (markdownContent) => {
    return renderer.renderMarkdown(
      markdownContent,
      Markdown,
      [rehypeRaw],
      [remarkGfm],
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

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
    if (currentElement < encounterAndDialogues.length) {
      setCurrentElement(currentElement + 1);
      navigate(`/encounter-and-dialogue-single/${currentElement + 1}`, {
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
                          disabled={
                            currentElement === encounterAndDialogues.length
                          }
                          className={`btn btn-area ${
                            currentElement === encounterAndDialogues.length
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          {currentElement === encounterAndDialogues.length
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

export default EdSingle;
