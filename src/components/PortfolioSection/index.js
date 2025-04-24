import React, { useState } from "react";
import ReactFancyBox from "react-fancybox";
import "react-fancybox/lib/fancybox.css";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import SectionTitle from "../SectionTitle/SectionTitle";
import { Link } from "react-router-dom";
import { TabContent, TabPane, Nav, NavItem, NavLink, Row } from "reactstrap";
import classnames from "classnames";

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

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
        <div className="wpo-campaign-wrap">
          {props.length < 7 ? (
            <SectionTitle subTitle={"Photos"} Title={"Gallery"} />
          ) : (
            <></>
          )}
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => {
                  toggle("1");
                }}
              >
                Section 1
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => {
                  toggle("2");
                }}
              >
                Section 2
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "3" })}
                onClick={() => {
                  toggle("3");
                }}
              >
                Section 3
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "4" })}
                onClick={() => {
                  toggle("4");
                }}
              >
                Section 4
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
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
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
            <TabPane tabId="2">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
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
            <TabPane tabId="3">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
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
            <TabPane tabId="4">
              <div className="sortable-gallery">
                <div className="gallery-filters"></div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="portfolio-grids gallery-container clearfix">
                      <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
                      >
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
