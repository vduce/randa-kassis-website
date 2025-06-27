import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import politicians from "../../api/politicians.json";

const PoliticianList = (props) => {
  const { state } = useLocation();
  const [currentPage, setCurrentPage] = useState(state?.pageNum || 1);
  const postsPerPage = 10;
  const [PoliticianContents, setPoliticianContents] = useState([]);

  // Fetch content from markdown files
  useEffect(() => {
    const fetchPoliticians = async () => {
      const fetched = await Promise.all(
        politicians.map(async (pol) => {
          try {
            const response = await fetch(`/encounters/${pol.filename}`);
            const content = await response.text();
            return { ...pol, content };
          } catch (error) {
            console.error(`Error fetching ${pol.filename}:`, error);
            return { ...pol, description: "Error loading content." };
          }
        })
      );
      setPoliticianContents(fetched);
    };

    fetchPoliticians();
  }, []);

  // Calculate the posts to show on the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPoliticians = PoliticianContents.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate the range of page numbers to show in pagination
  const totalPages = Math.ceil(PoliticianContents.length / postsPerPage);
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
    overflowX: "auto",
  };

  const pageLinkStyles = {
    display: "inline-block",
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

  const ClickHandler = () => {
    window.scrollTo(10, 0);
  };

  return (
    <section className="wpo-blog-pg-section section-padding-bottom">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-5 col-5 ${props.blRight} mt-1`}>
            <div className="wpo-blog-content">
              {currentPoliticians.map((currentPolitician, index) => (
                <div
                  className="post format-standard-image max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg"
                  key={index}
                >
                  <div
                    className="entry-details"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <h5 dangerouslySetInnerHTML={{ __html: currentPolitician.title }}></h5>
                    <label style={{ fontSize: "14px", color: "#848892" }}>
                      {currentPolitician.publishedIn}{" "}
                    </label>
                    {/* <br /> */}
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#848892",
                        marginBottom: "15px",
                      }}
                    >
                      {currentPolitician.publishedAt}{" "}
                    </label>
                    {/* <br /> */}
                    <p style={{ marginBottom: "10px", fontSize: "15px" }}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: currentPolitician.description.substring(0, 200),
                        }}
                      ></span>
                      {currentPolitician.description.length > 200 && "..."}
                    </p>
                    <Link
                      onClick={ClickHandler}
                      to={`/politician-single/${currentPolitician.id}`}
                      state={{ pageNumber: currentPage }}
                      className="read-more"
                      style={{ fontSize: "15px" }}
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
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
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
                      onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
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

export default PoliticianList;
