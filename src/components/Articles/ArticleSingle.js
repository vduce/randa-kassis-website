import React from "react";
import articles from "../../api/articles.json";
import { useParams } from "react-router-dom";

const ArticleSingle = (props) => {
  const { slug } = useParams();

  const article = articles.articles.find((item) => item.slug === slug);

  return (
    <section className="wpo-blog-single-section section-padding">
      <div className="container">
        <div className="row">
          <div className={`col col-lg-12 col-12 `}>
            <div className="wpo-blog-content">
              <div className="post format-standard-image">
                <div className="entry-media">
                  <img src={article.screens} alt="" />
                </div>

                <div className="post2">
                  <h3 style={{ color: "#471d58" }}>{article.title}</h3>
                  <p className="d-flex" style={{ marginBottom: '0.5rem'}}>
                    <i
                      className="fi flaticon-house"
                      style={{ marginRight: "1rem" }}
                    ></i>{" "}
                    <label style={{ fontSize: "16px", color: "#848892" }}>
                      Published in
                    </label>
                    {"  "}
                    <label
                      className="mx-2"
                      style={{ fontSize: "16px", color: "#848892" }}
                    >
                      {article.publishedIn}{" "}
                    </label>
                  </p>
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
                  <>
                    <div className="max-w-2xl mx-auto mb-3" dangerouslySetInnerHTML={{__html: article.description}}>
                    </div>
                  </>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleSingle;
