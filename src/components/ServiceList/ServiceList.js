import React from 'react';
import { Link } from "react-router-dom";
import articles from "../../api/articles.json";

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

const ServiceList = (props) => {
  return (
    <section className="wpo-blog-pg-section section-padding">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-5 col-5 ${props.blRight}`}>
            <div className="wpo-blog-content ">
              {articles.articles.slice(0, 3).map((article, sitem) => (
                <div
                  className="post format-standard-image max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg"
                  key={sitem}
                >
                  <div className="entry-media video-holder"></div>
                  <div className="entry-meta">
                    <ul>
                      <li>
                        <i className="fi flaticon-user"></i> By{" "}
                        <Link
                          onClick={ClickHandler}
                          to={`/blog-single/${article.slug}`}
                        >
                          {article.screens}
                        </Link>{" "}
                      </li>
                      <li>
                        <i className="fi flaticon-comment-white-oval-bubble"></i>{" "}
                        Date{" "}
                        {new Date(article.publishedDate).toLocaleDateString()}{" "}
                      </li>
                    </ul>
                  </div>
                  <div className="entry-details">
                    <h3>{article.title}</h3>
                    <p>
                      <i className="fi flaticon-comment-white-oval-bubble"></i>{" "}
                      Date{" "}
                      {new Date(article.publishedDate).toLocaleDateString()}{" "}
                    </p>
                    <p>{article.description}</p>
                    <Link
                      onClick={ClickHandler}
                      to={`/blog-single/${article.slug}`}
                      className="read-more"
                    >
                      READ MORE...
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceList;
