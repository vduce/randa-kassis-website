import React, { Fragment } from "react";
import PageTitle from "../../../components/pagetitle/PageTitle.js";
import Footer from "../../../components/footer/Footer.js";
import Scrollbar from "../../../components/scrollbar/scrollbar.js";
import Navbar from "../../../components/Navbar/Navbar.js";
import TheCriticsList from "./TheCriticsList.jsx";

const TheCriticsLayout = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Blog"} />
      <TheCriticsList
        blLeft={"d-none"}
        blRight={"col-lg-10 offset-lg-1 col-12"}
      />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default TheCriticsLayout;
