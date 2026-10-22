import { getContentNeighbors } from "../../../utils/contentNavigation";
import React, { useEffect, useState, Fragment } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { fetchCritics } from "../../../services/cdnJsonService";
import PageTitle from "../../../components/pagetitle/PageTitle";
import Footer from "../../../components/footer/Footer";
import Scrollbar from "../../../components/scrollbar/scrollbar";
import Navbar from "../../../components/Navbar/Navbar";
import PdfViewer from "../../../components/PdfViewer/PdfViewer";
import MarkdownContent from "../../../components/MarkdownContent/MarkdownContent";
import { getCdnUrl } from "../../../config/cdn";

const TheCriticsDetail = () => {
  const { id } = useParams(); // Get the article ID from the URL
  const [currentArticle, setCurrentArticle] = useState(Number(id) || 1);
  const [pageNumber, setPageNumber] = useState(null);
  const navigate = useNavigate();
  const [article, setArticle] = useState(undefined); // State to store the article
  const [articles, setArticles] = useState([]); // State to store all articles
  const [content, setContent] = useState(""); // State to store the article content
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCurrentArticle(Number(id));
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadCritic = async () => {
      setLoading(true);
      try {
        // Fetch critics from server
        const criticsData = await fetchCritics();
        setArticles(criticsData);
        
        // Find the article by ID
        const selectedArticle = criticsData.find((item) => item.id === parseInt(id ?? ""));
        setArticle(selectedArticle);

        // Fetch the content of the Markdown file
        if (selectedArticle && selectedArticle.filename) {
          const response = await fetch(getCdnUrl(`interviews/essayistcritics/${selectedArticle.filename}`));
          const text = await response.text();
          setContent(text);
        }
      } catch (error) {
        console.error("Error loading critic:", error);
        setContent("Error loading content.");
      } finally {
        setLoading(false);
      }
    };

    loadCritic();
  }, [id]);

  // calculate page number based on currentArticle
  useEffect(() => {
    if (articles.length > 0) {
      const index = articles.findIndex((item) => item.id === currentArticle);
      if (index !== -1) {
        const pageNum = Math.floor(index / 10) + 1; // Assuming 10 items per page
        setPageNumber(pageNum);
      }
    }
  }, [currentArticle, articles]);

  if (loading) {
    return (
      <Fragment>
        <Navbar hclass={"wpo-site-header-s1"} />
        <PageTitle pageTitle={""} pagesub={"Article"} />
        <section className="wpo-blog-single-section section-padding-bottom">
          <div className="container">
            <p>Loading...</p>
          </div>
        </section>
        <Footer />
        <Scrollbar />
      </Fragment>
    );
  }

  if (!article) {
    return (
      <Fragment>
        <Navbar hclass={"wpo-site-header-s1"} />
        <PageTitle pageTitle={""} pagesub={"Article"} />
        <section className="wpo-blog-single-section section-padding-bottom">
          <div className="container">
            <p>Article not found.</p>
          </div>
        </section>
        <Footer />
        <Scrollbar />
      </Fragment>
    );
  }

  const neighbors = getContentNeighbors(articles, id);
  const goToNeighbor = target => {
    if (!target) return;
    setCurrentArticle(target.id);
    navigate(`/critics-single/${target.id}`, { state: { pageNumber, currentArticle: target.id } });
  };
  const handlePrevious = () => goToNeighbor(neighbors.previous);
  const handleNext = () => goToNeighbor(neighbors.next);

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Article"} />
      <section className="wpo-blog-single-section section-padding-bottom">
        <div className="container">
          <div className="row mb-2">
            <div className={`col col-lg-2 col-2`}>
              <Link
                to="/interview/the-essayist-the-critic"
                state={{ pageNumber }}
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
                        <div className="max-w-2xl mx-auto p-3 break-words">
                          <MarkdownContent entries={articles} content={content} categoryKey="interviews_critics" filename={article.filename} />
                        </div>
                        <div className="d-flex mt-6" style={{ justifyContent: "space-between" }}>
                          <button
                            onClick={handlePrevious}
                            disabled={!neighbors.previous}
                            className={`btn btn-area ${
                              !neighbors.previous
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                            }`}
                          >
                            Previous
                          </button>
                          <button
                            onClick={handleNext}
                            disabled={!neighbors.next}
                            className={`btn btn-area ${
                              !neighbors.next
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                            }`}
                          >
                            {!neighbors.next ? "Completed" : "Next"}
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
      </section>
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default TheCriticsDetail;
