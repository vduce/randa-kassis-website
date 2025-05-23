import React, { useState } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Row } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import Services from "../../api/service";

const ClickHandler = () => {
  window.scrollTo(10, 0);
};

const ServiceSectionS2 = () => {
  const [activeTab, setActiveTab] = useState("1");

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <div className="wpo-campaign-area-s4 mt-5">
      <div className="container">
        <div className="wpo-campaign-wrap">
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "1" })}
                onClick={() => {
                  toggle("1");
                }}
              >
                Interviews
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "2" })}
                onClick={() => {
                  toggle("2");
                }}
              >
                Articles
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: activeTab === "3" })}
                onClick={() => {
                  toggle("3");
                }}
              >
                Encounters and Dialogues
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <div className="row">
                {Services.slice(0, 3).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <div className="wpo-campaign-single">
                      <div className="wpo-campaign-item">
                        <div className="wpo-campaign-img">
                          <img src={service.screens} alt="" />
                        </div>
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link onClick={ClickHandler} to={`/blog-single/${service.slug}`}>
                                {service.title.slice(0, 30)}...
                              </Link>
                            </h2>
                            <p>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link
                                className="more"
                                onClick={ClickHandler}
                                to={`/blog-single/${service.slug}`}
                              >
                                Read more...
                              </Link>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPane>
            <TabPane tabId="2">
              <div className="row">
                {Services.slice(1, 4).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <div className="wpo-campaign-single">
                      <div className="wpo-campaign-item">
                        <div className="wpo-campaign-img">
                          <img src={service.screens} alt="" />
                        </div>
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link onClick={ClickHandler} to={`/blog-single/${service.slug}`}>
                                {service.title.slice(0, 30)}...
                              </Link>
                            </h2>
                            <p>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link
                                className="more"
                                onClick={ClickHandler}
                                to={`/blog-single/${service.slug}`}
                              >
                                Read more...
                              </Link>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabPane>
            <TabPane tabId="3">
              <Row>
                {Services.slice(4, 7).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <div className="wpo-campaign-single">
                      <div className="wpo-campaign-item">
                        <div className="wpo-campaign-img">
                          <img src={service.screens} alt="" />
                        </div>
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link onClick={ClickHandler} to={`/blog-single/${service.slug}`}>
                                {service.title.slice(0, 30)}...
                              </Link>
                            </h2>
                            <p>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link
                                className="more"
                                onClick={ClickHandler}
                                to={`/blog-single/${service.slug}`}
                              >
                                Read more...
                              </Link>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Row>
            </TabPane>
          </TabContent>
        </div>
      </div>
    </div>
  );
};

export default ServiceSectionS2;
