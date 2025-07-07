import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle.js";
import Scrollbar from "../../components/scrollbar/scrollbar.js";
import Footer from "../../components/footer/Footer.js";
import Navbar from "../../components/Navbar/Navbar.js";
import PoliticianSingle from "../../components/Politician/PoliticianSingle.jsx";

const PoliticianDetails = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Politician"} />
      <PoliticianSingle />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default PoliticianDetails;
