import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import blogs from '../../api/blogs';

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

const BlogList = (props) => {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  // Calculate the posts to show on the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  // Ensure that the last page only shows the remaining posts (e.g., 5 blogs for page 6)
  const currentBlogs = currentPage === 6 ? blogs.slice(indexOfFirstPost, 52) : blogs.slice(indexOfFirstPost, indexOfLastPost);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate the range of page numbers to show in pagination (6 pages max)
  const totalPages = Math.ceil(blogs.length / postsPerPage);
  let pageNumbers = [];

  // Display 6 page numbers or fewer if less than 6 pages exist
  for (let i = 1; i <= totalPages && i <= 6; i++) {
    pageNumbers.push(i);
  }

  // Inline styles for pagination box
  const paginationWrapperStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
  };

  const paginationStyles = {
    listStyle: 'none',
    padding: 0,
    margin: '0',
    display: 'flex',
    gap: '10px', // Adding space between page numbers
  };

  const pageLinkStyles = {
    color: 'black',
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '5px',
    textDecoration: 'none',
    background: 'white', // Gradient background
    transition: 'background-color 0.3s ease, color 0.3s ease',
    border: '1px solid #773093', // Border with gradient color
    minWidth: '30px', // To make all pagination buttons equal width
    textAlign: 'center', // To center-align text inside the button
  };

  const activePageStyles = {
    background: 'linear-gradient(to bottom, #773093, #2C1237)', // Gradient background
    color: 'white',
    fontWeight: 'bold',
    borderColor: '#ff8024', // Matching border color
  };

  return (
    <section className="wpo-blog-pg-section section-padding">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-5 col-5 ${props.blRight}`}>
            <div className="wpo-blog-content">
              {currentBlogs.map((blog, bitem) => (
                <div
                  className={`post ${blog.blClass} max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg`}
                  key={bitem}
                >
                  <div className="entry-details p-3">
                    <h3>{blog.title}</h3>
                    <p>{blog.description}</p>
                    <Link
                      onClick={ClickHandler}
                      to={`/blog-single/${blog.slug}`}
                      className="read-more"
                    >
                      READ MORE...
                    </Link>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="pagination-wrapper pagination-wrapper-left" style={paginationWrapperStyles}>
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
                  {/* Display page numbers */}
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
                        currentPage < totalPages &&
                        paginate(currentPage + 1)
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

export default BlogList;
