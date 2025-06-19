import React, { useState } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Row } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import Services from "../../api/service";

const Articles = [
  {
    id: 14,
    title: "Political Islam and Ideology: Two Faces of Tyranny",
    description:
      "At a time when popular uprisings across the Arab world intensify in their call for freedom, social justice, and an end to the tyranny and exploitation practised by authoritarian regimes, we are confronted with a striking contradiction in how different movements and ideologies understand the very notion of freedom. Among these, political Islam presents itself as the most fitting project for societies where the majority profess the Islamic faith.",
  },
  {
    id: 8,
    title: "Syria\u2019s Identity: The Richness of Minorities",
    description:
      "In light of the fierce battle waged by the regime against its own people, it has become increasingly evident that the opposition\u2019s leadership is struggling to respond effectively. There are several reasons for this: foremost among them is the absence of a diverse foundation of political parties with",
  },
  {
    id: 45,
    title: "An Anthropological Perspective on the Origins of Morality",
    description:
      "We continue to chase after words, manuscripts, and myths in pursuit of a history steeped in mystery. Few things are more essential to the human condition than the thirst for knowledge. It is this yearning that prevents us from halting midway or reconciling religion with science\u2014for science marks an ",
  },
];

const Encounters = [
  {
    id: 58,
    title: "Reshaping Society",
    description:
      "Tunisia is facing numerous challenges one year after the revolution. TEDxENSI will present new ideas aimed at addressing these issues and contributing to the construction of a renewed society—one grounded in a strong social fabric and civic values.",
  },
  {
    id: 32,
    filename: "ed32.md",
    title: "Kazakhstan Peace Talks",
    publishedIn: "Presidential Palace, Senate and Rixos Hotel, Astana",
    publishedAt: "17\u201318 September 2015",
    description:
      "The Kazakhstan Peace Talks, organised by the Centre of Political and Foreign Affairs (CPFA) in cooperation with the Kazakh authorities, took place in September 2015 in Astana. This event was distinct from the later formal Astana II meeting.",
  },
];

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
                {Articles.map((service) => (
                  <div className="col-lg-4 col-md-6 col-12" key={service.id}>
                    <div className="wpo-campaign-single">
                      <div className="wpo-campaign-item">
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link onClick={ClickHandler} to={`/article-single/${service.id}`}>
                                {service.title.slice(0, 30)}...
                              </Link>
                            </h2>
                            <p>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link
                                className="more"
                                onClick={ClickHandler}
                                to={`/article-single/${service.id}`}
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
