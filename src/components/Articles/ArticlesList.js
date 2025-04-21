import React, { useState } from "react";
import { Link } from "react-router-dom";
import articles from "../../api/articles.json";

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

const ArticlesList = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Calculate the posts to show on the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentArticles = articles.articles.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate the range of page numbers to show in pagination
  const totalPages = Math.ceil(articles.articles.length / postsPerPage);
  let pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Inline styles for pagination
  const paginationWrapperStyles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
    marginBottom: "2rem",
  };

  const paginationStyles = {
    listStyle: "none",
    padding: 0,
    margin: "0",
    display: "flex",
    gap: "10px",
  };

  const pageLinkStyles = {
    color: "black",
    fontSize: "14px",
    padding: "8px 16px",
    borderRadius: "5px",
    textDecoration: "none",
    background: "white",
    transition: "background-color 0.3s ease, color 0.3s ease",
    border: "1px solid #773093",
    minWidth: "30px",
    textAlign: "center",
  };

  const activePageStyles = {
    background: "linear-gradient(to bottom, #773093, #2C1237)",
    color: "white",
    fontWeight: "bold",
    borderColor: "#ff8024",
  };

  return (
    <section className="wpo-blog-pg-section section-padding">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-5 col-5 ${props.blRight} mt-2`}>
            <div className="wpo-blog-content">
              {currentArticles.map((article, sitem) => (
                <div
                  className="post format-standard-image max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg"
                  key={sitem}
                >
                  <div className="entry-details">
                    <h4
                      dangerouslySetInnerHTML={{ __html: article.title }}
                    ></h4>

                    <p className="d-flex">
                      <i
                        className="fi flaticon-calendar"
                        style={{ marginRight: "1rem" }}
                      ></i>{" "}
                      <label style={{ fontSize: "16px", color: "#848892" }}>
                        Published on:
                      </label>
                      {"  "}
                      <label
                        className="mx-2"
                        style={{ fontSize: "16px", color: "#848892" }}
                      >
                        {article.publishedDate}{" "}
                      </label>
                    </p>
                    <p>
                      {article.description.substring(0, 200)}
                      {article.description.length > 200 && "..."}
                    </p>
                    <Link
                      onClick={ClickHandler}
                      to={`/article-single/${article.slug}`}
                      className="read-more"
                    >
                      Read more...
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div
                className="pagination-wrapper pagination-wrapper-left"
                style={paginationWrapperStyles}
              >
                <ul style={paginationStyles}>
                  <li>
                    <Link
                      to="#"
                      aria-label="Previous"
                      onClick={() =>
                        currentPage > 1 && paginate(currentPage - 1)
                      }
                      style={pageLinkStyles}
                    >
                      <i className="fi ti-angle-left"></i>
                    </Link>
                  </li>
                  {pageNumbers.map((number) => (
                    <li key={number}>
                      <Link
                        to="#"
                        onClick={() => paginate(number)}
                        style={
                          currentPage === number
                            ? { ...pageLinkStyles, ...activePageStyles }
                            : pageLinkStyles
                        }
                      >
                        {number}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="#"
                      aria-label="Next"
                      onClick={() =>
                        currentPage < totalPages && paginate(currentPage + 1)
                      }
                      style={pageLinkStyles}
                    >
                      <i className="fi ti-angle-right"></i>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticlesList;
