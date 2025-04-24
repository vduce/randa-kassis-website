import React, { Fragment } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import PageTitle from "../../components/pagetitle/PageTitle";
import PortfolioSection from "../../components/PortfolioSection";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Donors from "../../components/Donors/Donors";
import PartnerSection from "../../components/PartnerSection/PartnerSection";
import Footer from "../../components/footer/Footer";

import pImg1 from "../../images/portfolio/1.jpg";
import Navbar from "../../components/Navbar/Navbar";

const Portfolios = [
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
  {
    Pimg: pImg1,
  },
];

const GalleryPage = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Gallery"} />
      <PortfolioSection props={Portfolios} />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default GalleryPage;
