import React, { Fragment } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Hero4 from "../../components/hero4/Hero4";
import About2 from "../../components/about2/about2";
import ServiceSectionS2 from "../../components/ServiceSectionS2/ServiceSectionS2";
import FunFactVideo from "../../components/FunFactVideo/FunFactVideo";
import Footer from "../../components/footer/Footer";
import Scrollbar from "../../components/scrollbar/scrollbar";
import Logo from "../../images/logo.png";

import BookSection from "../../components/BookSection/BookSection";
import PortfolioSection from "../../components/PortfolioSection";

import pImg1 from "../../images/portfolio/1.jpg";

const HomePage2 = () => {
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
  ];
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <Hero4 />
      <About2 />
      <ServiceSectionS2 />
      <FunFactVideo props={"/blog1.pmh"} />
      <PortfolioSection props={Portfolios} />
      <BookSection />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default HomePage2;
