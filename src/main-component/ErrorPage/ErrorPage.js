import React, { Fragment } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import PageTitle from "../../components/pagetitle/PageTitle";
import Error from "../../components/404/404";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar/Navbar";

const ErrorPage = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"404"} />
      <Error />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default ErrorPage;
