import React, { useState } from "react";
import ReactFancyBox from "react-fancybox";
import "react-fancybox/lib/fancybox.css";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import SectionTitle from "../SectionTitle/SectionTitle";
import { Link } from "react-router-dom";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import classnames from "classnames";

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

const arenaPics = [
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/1.JPG",
    caption:
      "Randa Kassis attending the third meeting of the Group of Friends of the Syrian People, alongside President François Hollande and Foreign Minister Laurent Fabius.",
    to: "/gallery/in-the-arena/1",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/2.JPG",
    caption:
      "Randa Kassis with Ugandan President Yoweri Museveni, First Lady Janet Museveni, and the CPFA delegation led by Fabien Baussart, during an official meeting in Uganda held amid the COVID-19 pandemic.",
    to: "/gallery/in-the-arena/2",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/6.jpeg",
    caption:
      "Randa Kassis and Fabien Baussart with President Kassym-Jomart Tokayev of Kazakhstan during an official reception.",
    to: "/gallery/in-the-arena/6",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/8.JPG",
    caption:
      "Randa Kassis and Fabien Baussart with Mahmoud al-Mashhadani, President of the Iraqi Parliament, during a meeting in Baghdad.",
    to: "/gallery/in-the-arena/8",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/13.JPG",
    caption:
      "Randa Kassis and Fabien Baussart taking part in high-level discussions alongside President Nursultan Nazarbayev, and Nobel Peace Laureates.",
    to: "/gallery/in-the-arena/13",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/5.JPG",
    caption:
      "Abdullah Gül, the 11th President of Turkey, with Randa Kassis and Syrian poet and writer Adonis.",
    to: "/gallery/in-the-arena/5",
  },
];

const companionPics = [
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/1.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/27.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/149.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/179.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/159.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/168.JPG" },
];

const throughMyEyesPics = [
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/intheirgaze/photos/3.jpeg",
    caption: "In Their Gaze",
    to: "/gallery/through-my-eyes/1",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/artinmotion/photos/11.jpeg",
    caption: "Art in Motion",
    to: "/gallery/through-my-eyes/2",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/testamentsinstone/photos/18.jpg",
    caption: "Ruins That Speak",
    to: "/gallery/through-my-eyes/3",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/testamentsinstone/photos/2.JPG",
    caption: "Testaments in Stone",
    to: "/gallery/through-my-eyes/4",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/pulseofearth/photos/88.jpg",
    caption: "The Pulse of the Earth",
    to: "/gallery/through-my-eyes/5",
  },
  {
    Pimg: "https://randa-kassis-website.b-cdn.net/gallery/throughmyeyes/tracyofatrocity/photos/1.jpeg",
    caption: "Traces of Atrocity",
    to: "/gallery/through-my-eyes/6",
  },
];

const PortfolioSection = ({ props }) => {
  const [activeTab, setActiveTab] = useState("1");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };
  return (
    <section
      className={`gallery-section wpo-portfolio-section section-padding1 wpo-campaign-area-s4 mt-4`}
      id="gallery"
    >
      <div className="container">
        <div className="wpo-campaign-wrap-gallery">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => {
                  toggle("1");
                }}
              >
                In the Arena
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => {
                  toggle("2");
                }}
              >
                {" "}
                My Four-Pawed Companions
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "3" })}
                onClick={() => {
                  toggle("3");
                }}
              >
                Through My Eyes
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                        <Masonry columnsCount={3} gutter="15px">
                          {arenaPics.map((image, i) => (
                            <div className="grid" key={i}>
                              <Link to="/gallery/in-the-arena/1">
                                <div className="img-holder">
                                  <img
                                    style={{
                                      width: "100%",
                                      display: "block",
                                      minHeight: "320px",
                                      objectFit: "cover",
                                    }}
                                    src={image.Pimg}
                                    alt={image.caption}
                                  />
                                  {image.caption && <div className="caption">{image.caption}</div>}
                                </div>
                              </Link>
                            </div>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tabId="2">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                        <Masonry columnsCount={3} gutter="15px">
                          {companionPics.map((image, i) => (
                            <div className="grid" key={i}>
                              <Link to="/gallery/my-four-pawed-companions/1">
                                <div className="img-holder">
                                  <img
                                    style={{
                                      width: "425px",
                                      display: "block",
                                      height: "320px",
                                      objectFit: "cover",
                                    }}
                                    src={image.Pimg}
                                    alt={`Gallery Image ${i + 1}`}
                                  />
                                </div>
                              </Link>
                            </div>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                        <Masonry columnsCount={3} gutter="15px">
                          {throughMyEyesPics.map((image, i) => (
                            <div className="grid" key={i}>
                              <Link to={image.to}>
                                <div className="img-holder">
                                  <img
                                    style={{
                                      width: "100%",
                                      display: "block",
                                      minHeight: "320px",
                                      objectFit: "cover",
                                    }}
                                    src={image.Pimg}
                                    alt={image.caption}
                                  />
                                  {image.caption && <div className="caption">{image.caption}</div>}
                                </div>
                              </Link>
                            </div>
                          ))}
                        </Masonry>
                      </ResponsiveMasonry>
                    </div>
                  </div>
                </div>
              </div>
            </TabPane>
          </TabContent>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
