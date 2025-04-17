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
                    <div className="max-w-2xl mx-auto mb-3">
                      {article.description}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des1}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des2}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des3}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des4}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des5}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des6}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des7}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des8}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des9}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des10}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des11}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des12}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des13}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des14}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des15}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des16}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des17}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des18}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des19}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des20}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des21}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des22}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des23}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des24}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des25}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des26}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des27}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des28}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des29}
                    </div>
                    <div className="max-w-2xl mx-auto  mb-3">
                      {article.des30}
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
