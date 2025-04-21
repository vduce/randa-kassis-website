import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar/Navbar.js";
import ArticleSingle from "../../components/Articles/ArticleSingle.js";

const ArticleDetails = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Article"} />
      <ArticleSingle />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default ArticleDetails;
