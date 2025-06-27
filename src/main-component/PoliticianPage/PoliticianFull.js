import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle.js";
import Scrollbar from "../../components/scrollbar/scrollbar.js";
import Footer from "../../components/footer/Footer.js";
import Navbar from "../../components/Navbar/Navbar.js";
import politicians from "../../api/politicians.json";
import PoliticianList from "../../components/Politician/PoliticianList.js";

const PoliticianFullWidth = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Blog"} />
      <PoliticianList
        blLeft={"d-none"}
        blRight={"col-lg-10 offset-lg-1 col-12"}
        services={politicians.articles}
      />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default PoliticianFullWidth;
