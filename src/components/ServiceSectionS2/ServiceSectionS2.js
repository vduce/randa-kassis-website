import React, { useState } from "react";
import { TabContent, TabPane, Nav, NavItem, NavLink, Row } from "reactstrap";
import classnames from "classnames";
import { Link } from "react-router-dom";
import Services from "../../api/service";

const Interviews = [
  {
    id: 1,
    filename: "po1.md",
    title: "Al-Joulani Endorsed by Macron and Trump: “A Deeply Irresponsible Act”",
    publishedIn: "Omerta",
    publishedAt: "26 May 2025",
    src: "/politician-single/1",
    description:
      "Randa Kassis, a Franco-Syrian anthropologist, politician, and writer, and president of the Movement for a Pluralistic Society, is a leading figure in the opposition—initially to the former Ba’athist regime of Bashar al-Assad, and now to that of Ahmed al-Charaa, also known as Abu Mohammed al-Joulani, the head of the so-called “moderate butchers” of HTS, who has just been endorse...",
  },
  {
    id: 14,
    filename: "ec14.md",
    title: "Randa Kassis in Conversation with al-Mutawassit on The Crypts of the Gods",
    publishedIn: "Al-Mutawassit",
    publishedAt: "15 June 2012",
    src: "/critics-single/14",
    description:
      "London – Syrian author and researcher Randa Kassis has published a bold and thought-provoking book entitled The Crypts of the Gods, which has attracted considerable attention for the cultural challenge it poses...",
  },
  {
    id: 108,
    filename: "po108.md",
    title: "Opinions on the Protests in Syria",
    publishedIn: "France 24",
    publishedAt: "29 March 2011",
    src: "/politician-single/108",
    description:
      "Guests: Ammar al-Qurabi & Randa Kassis The discussion addresses the deepening political unrest in Syria, rooted in long-standing repression, unfulfilled promises of reform, and the absence of democratic legitimacy under Bashar al-Assad. While early demonstrations were driven by hopes for change—such as lifting the emergency law, releasing political prisoners, an...",
  },
];

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
    id: 3,
    title: "Randa Kassis and Fabien Baussart Meet Druze Spiritual Leader",
    description:
      "Randa Kassis, President of the Astana Platform and the Movement for a Pluralistic Society, together with Fabien Baussart, President of the Centre for Political and Foreign Affairs (CPFA), met with His Eminence Sheikh Hikmat al-Hijri, the spiritual leader of the Druze community, at his residence in the town of Qanawat.",
  },
  {
    id: 32,
    title: "Kazakhstan Peace Talks",
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
                {Interviews.slice(0, 3).map((service, srv) => (
                  <div className="col-lg-4 col-md-6 col-12" key={srv}>
                    <div className="wpo-campaign-single">
                      <div className="wpo-campaign-item">
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link onClick={ClickHandler} to={service.src}>
                                {service.title.slice(0, 50)}...
                              </Link>
                            </h2>
                            <p>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link className="more" onClick={ClickHandler} to={service.src}>
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
                                {service.title.slice(0, 50)}...
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
                {Encounters.map((service) => (
                  <div className="col-lg-4 col-md-6 col-12" key={service.id}>
                    <div className="wpo-campaign-single" style={{ height: "309px" }}>
                      <div className="wpo-campaign-item h-100">
                        <div className="wpo-campaign-content">
                          <div className="wpo-campaign-text-top">
                            <h2>
                              <Link
                                onClick={ClickHandler}
                                to={`/encounter-and-dialogue-single/${service.id}`}
                              >
                                {service.title.slice(0, 27)}...
                              </Link>
                            </h2>
                            <p style={{ height: "161px" }}>{service.description.slice(0, 150)} </p>
                            <span>
                              <Link
                                className="more"
                                onClick={ClickHandler}
                                to={`/encounter-and-dialogue-single/${service.id}`}
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
