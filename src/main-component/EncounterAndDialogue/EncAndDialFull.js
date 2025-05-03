import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle.js";
import Scrollbar from "../../components/scrollbar/scrollbar.js";
import Footer from "../../components/footer/Footer.js";
import Navbar from "../../components/Navbar/Navbar.js";
import articles from "../../api/articles.json";
import ArticlesList from "../../components/Articles/ArticlesList.js";

const EncAndDialFullWidth = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Blog"} />
      <ArticlesList
        blLeft={"d-none"}
        blRight={"col-lg-10 offset-lg-1 col-12"}
        services={articles.articles}
      />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default EncAndDialFullWidth;
