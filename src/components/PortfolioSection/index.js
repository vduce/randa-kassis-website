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
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/1.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/2.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/6-.jpeg" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/8.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/13.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/inthearena/5.JPG" },
];

const companionPics = [
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/1.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/27.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/149.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/179.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/159.JPG" },
  { Pimg: "https://randa-kassis-website.b-cdn.net/gallery/my4pawedcompanion/photos/168.JPG" },
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
                              <Link to="/gallery">
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
                          {props.map((image, i) => (
                            <div className="grid" key={i}>
                              <Link to="/gallery">
                                <div className="img-holder">
                                  <ReactFancyBox
                                    thumbnail={image.Pimg}
                                    image={image.Pimg}
                                    style={{ width: "100%", display: "block" }}
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
          </TabContent>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
