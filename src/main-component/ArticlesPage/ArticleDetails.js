import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import { useParams } from "react-router-dom";
import articles from "../../api/articles.json";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar/Navbar.js";
import ArticleSingle from "../../components/Articles/ArticleSingle.js";

const ArticleDetails = () => {
  const { slug } = useParams();

  const article = articles.articles.find((item) => item.slug === slug);

  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={article.title} pagesub={"Blog"} />
      <ArticleSingle />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default ArticleDetails;
