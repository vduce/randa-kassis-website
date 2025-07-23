import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import MobileMenu from "../MobileMenu/MobileMenu";
import Logo from "../../images/logo.png";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Collapse from "@material-ui/core/Collapse";

const Header = (props) => {
  const [openSubId, setOpenSubId] = useState(0);

  const storyList = {
    1: "Prologue",
    2: "I was not born a rebel...",
    3: "The First Battle..",
    4: "Back to Syria...",
    5: "Painting...",
    6: "A Life of Art...",
    7: "The Turning Point...",
    8: "Political Fight: A Struggle...",
    9: "Looking Back: The...",
    10: "AD-HOC Organisation",
    11: "Loss, Grief, and the...",
    12: "The Contradiction That...",
    13: "The Absurdity of Emotions...",
    14: "A Life Without Meaning...",
    15: "Moving Forward...",
  };
  const interviewList = {
    "the-politician": "The Politician",
    "the-essayist-the-critic": "The Essayist & The Critic",
    "the-painter": "The Painter",
  };

  const galleryList = {
    "in-the-arena/1": {
      id: 1,
      title: "In the Arena",
      submenu: null,
    },
    "my-four-pawed-companions/1": {
      id: 2,
      title: "My Four-Pawed Companions",
      submenu: [
        {
          id: 1,
          title: "Nestor",
          link: "/gallery/my-four-pawed-companions/1",
        },
        {
          id: 2,
          title: "Bianca & Roxy",
          link: "/gallery/my-four-pawed-companions/2",
        },
        {
          id: 3,
          title: "Socrates",
          link: "/gallery/my-four-pawed-companions/3",
        },
        {
          id: 4,
          title: "Aristotle",
          link: "/gallery/my-four-pawed-companions/4",
        },
        {
          id: 5,
          title: "Nietzsche",
          link: "/gallery/my-four-pawed-companions/5",
        },
        {
          id: 6,
          title: "Damascius",
          link: "/gallery/my-four-pawed-companions/6",
        },
        {
          id: 7,
          title: "The Litter of Nine",
          link: "/gallery/my-four-pawed-companions/7",
        },
        {
          id: 8,
          title: "Countess Bonnie",
          link: "/gallery/my-four-pawed-companions/8",
        },
        {
          id: 9,
          title: "Tequila—the resident",
          link: "/gallery/my-four-pawed-companions/9",
        },
        {
          id: 10,
          title: "Ah, Agathe. Marvellous character",
          link: "/gallery/my-four-pawed-companions/10",
        },
        {
          id: 11,
          title: "Grace—the household’s",
          link: "/gallery/my-four-pawed-companions/11",
        },
        {
          id: 12,
          title: "Vodka, strategist—the war planner",
          link: "/gallery/my-four-pawed-companions/12",
        },
        {
          id: 13,
          title: "Whitty—the last male",
          link: "/gallery/my-four-pawed-companions/13",
        },
        {
          id: 14,
          title: "Winston and Solaia",
          link: "/gallery/my-four-pawed-companions/14",
        },
        {
          id: 15,
          title: "Clyde",
          link: "/gallery/my-four-pawed-companions/15",
        },
        {
          id: 16,
          title: "Greco and Bobbie",
          link: "/gallery/my-four-pawed-companions/16",
        },
      ],
    },
    "through-my-eyes/1": {
      id: 3,
      title: "Through My Eyes",
      submenu: [
        {
          id: 1,
          title: "In Their Gaze",
          link: "/gallery/through-my-eyes/1",
        },
        {
          id: 2,
          title: "Art in Motion",
          link: "/gallery/through-my-eyes/2",
        },
        {
          id: 3,
          title: "Ruins That Speak",
          link: "/gallery/through-my-eyes/3",
        },
        {
          id: 4,
          title: "Testaments in Stone",
          link: "/gallery/through-my-eyes/4",
        },
        {
          id: 5,
          title: "The Pulse of the Earth",
          link: "/gallery/through-my-eyes/5",
        },
        {
          id: 6,
          title: "Traces of Atrocity",
          link: "/gallery/through-my-eyes/6",
        },
      ],
    },
  };

  const beyondPolitics = {
    "the-politician": "Paintings",
    "the-essayist-the-critic": "Exhibitions & Moments",
  };

  const ClickHandler = () => {
    window.scrollTo(10, 0);
  };

  return (
    <header id="header">
      <div className={`wpo-site-header ${props.hclass}`}>
        <nav className="navigation navbar navbar-expand-lg navbar-light">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-lg-3 col-md-4 col-3 d-lg-none dl-block">
                <div className="mobail-menu">
                  <MobileMenu />
                </div>
              </div>
              <div className="col-lg-2 col-md-4 col-6">
                <div className="navbar-header">
                  <Link onClick={ClickHandler} className="navbar-brand" to="/">
                    <img src={Logo} alt="logo" />
                  </Link>
                </div>
              </div>
              <div className="col-lg-8 col-md-1 col-1">
                <div id="navbar" className="collapse navbar-collapse navigation-holder">
                  <button className="menu-close">
                    <i className="ti-close"></i>
                  </button>
                  <ul className="nav navbar-nav mb-2 mb-lg-0 text-capitalize">
                    <li className="menu-item-has-children">
                      <Link className="text-capitalize" onClick={ClickHandler} to="/">
                        Home
                      </Link>
                    </li>

                    <li>
                      <Link className="text-capitalize" onClick={ClickHandler} to="/articles">
                        Articles
                      </Link>
                    </li>
                    <li className="menu-item-has-children">
                      <Link onClick={ClickHandler} className="text-capitalize">
                        Interviews
                      </Link>
                      <ul className="sub-menu">
                        {Object.entries(interviewList).map(([key, value]) => (
                          <li key={key}>
                            <Link onClick={ClickHandler} className="text-capitalize" to={`/interview/${key}`}>
                              {value}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <Link className="text-capitalize" onClick={ClickHandler} to="/encounter-and-dialogue">
                        Encounters & Dialogues
                      </Link>
                    </li>
                    <li className="menu-item-has-children">
                      <Link onClick={ClickHandler} className="text-capitalize">
                        Beyond Politics
                      </Link>
                      <ul className="sub-menu">
                        {Object.entries(beyondPolitics).map(([key, value]) => (
                          <li key={key}>
                            <Link onClick={ClickHandler} className="text-capitalize" to={`/beyondPolitics/${key}/${1}`}>
                              {value}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <Link onClick={ClickHandler} className="text-capitalize">
                        My Story
                      </Link>
                      <ul className="sub-menu">
                        {Object.entries(storyList).map(([key, value]) => (
                          <li key={key}>
                            <Link onClick={ClickHandler} className="text-capitalize" to={`/story/${key}`} replace={true}>
                              {value}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="menu-item-has-children">
                      <Link onClick={ClickHandler} className="text-capitalize">
                        Gallery
                      </Link>
                      <ul className="sub-menu">
                        {Object.entries(galleryList).map(([key, value]) => (
                          <li key={key}>
                            <Link onClick={() => setOpenSubId(value.id === openSubId ? 0 : value.id)} className="text-capitalize">
                              {value.title}
                              {value?.submenu && (
                                <i
                                  className={`${value.id === openSubId ? "fa fa-angle-up" : "fa fa-angle-down"} position-absolute`}
                                  style={{
                                    right: "10px",
                                    top: "15px",
                                  }}
                                />
                              )}
                            </Link>
                            {value?.submenu && (
                              <Collapse
                                className=" overflow-y-auto"
                                style={{
                                  maxHeight: "60vh",
                                }}
                                in={value.id === openSubId}
                                timeout="auto"
                                unmountOnExit
                              >
                                <List className="ps-4 pe-0 py-0">
                                  {value?.submenu?.map((m, i) => (
                                    <ListItem key={i} className="px-0 py-1">
                                      <NavLink to={m.link} onClick={ClickHandler} className="py-1 text-capitalize">
                                        {m.title}
                                      </NavLink>
                                    </ListItem>
                                  ))}
                                </List>
                              </Collapse>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-3 col-2">
                <div className="header-right">
                  <div className="header-search-form-wrapper"></div>
                  <div className="close-form">
                    <Link onClick={ClickHandler} className="theme-btn" to="/contact">
                      <span className="text">Contact</span>
                      <span className="mobile">
                        <i className="fi flaticon-charity"></i>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
