import React, { Fragment, useState, useRef, useEffect } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import { NavLink } from "react-router-dom";
import "./style.css";
import { useMenu } from "../../context/MenuContext";

const menus = [
  {
    id: 1,
    title: "Home",
    link: "/",
  },
  {
    id: 2,
    title: "Articles",
    link: "/articles",
  },
  {
    id: 3,
    title: "Interviews",
    link: "/interview/the-painter",
    submenu: [
      {
        id: 1,
        title: "The Politician",
        link: "/interview/the-politician", // The Critics
      },
      {
        id: 2,
        title: "The Essayist & The Critic",
        link: "/interview/the-essayist-the-critic", // The Essayist & The Critic
      },
      {
        id: 3,
        title: "The Painter",
        link: "/interview/the-painter", // The Painter
      },
    ],
  },
  {
    id: 4,
    title: "Encounters & dialogues",
    link: "/encounter-and-dialogue",
  },
  {
    id: 5,
    title: "Beyond Politics",
    link: "/beyondPolitics",
    submenu: [
      {
        id: 1,
        title: "Paintings",
        link: "/beyondPolitics/the-politician/1",
      },
      {
        id: 2,
        title: "Exhibitions & Moments",
        link: "/beyondPolitics/the-essayist-the-critic/1",
      },
    ],
  },
  {
    id: 6,
    title: "My Story",
    submenu: [
      {
        id: 1,
        title: "Prologue",
        link: "/story/1",
      },
      {
        id: 2,
        title: "I was not born a rebel",
        link: "/story/2",
      },
      {
        id: 3,
        title: "The First Battle",
        link: "/story/3",
      },
      {
        id: 4,
        title: "Back to Syria",
        link: "/story/4",
      },
      {
        id: 5,
        title: "Painting",
        link: "/story/5",
      },
      {
        id: 6,
        title: "A Life of Art",
        link: "/story/6",
      },
      {
        id: 7,
        title: "The Turning Point",
        link: "/story/7",
      },
      {
        id: 8,
        title: "Political Fight: A Struggle",
        link: "/story/8",
      },
      {
        id: 9,
        title: "Looking Back",
        link: "/story/9",
      },
      {
        id: 10,
        title: "AD-HOC Organisation",
        link: "/story/10",
      },
      {
        id: 11,
        title: "Loss, Grief, and...",
        link: "/story/11",
      },
      {
        id: 12,
        title: "The Contradiction That...",
        link: "/story/12",
      },
      {
        id: 13,
        title: "The Absurdity of Emotions",
        link: "/story/13",
      },
      {
        id: 14,
        title: "A Life Without Meaning",
        link: "/story/14",
      },
      {
        id: 15,
        title: "Moving Forward",
        link: "/story/15",
      },
    ],
  },
  {
    id: 7,
    title: "Gallery",
    submenu: [
      {
        id: 1,
        title: "In the Arena",
        link: "/gallery/in-the-arena/1",
      },
      {
        id: 2,
        title: "My Four-Pawed Companions",
        subsubmenu: [
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
      {
        id: 3,
        title: "Through My Eyes",
        subsubmenu: [
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
    ],
  },
  {
    id: 8,
    title: "Contact",
    link: "/Contact",
  },
];

const MobileMenu = () => {
  const [openMainId, setOpenMainId] = useState(0);
  const [openSubId, setOpenSubId] = useState(0);
  const { menuActive, setMenuActive } = useMenu();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const ClickHandler = () => {
    window.scrollTo(10, 0);
    setMenuActive(false);
  };

  useEffect(() => {
    if (!menuActive) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setMenuActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuActive]);

  return (
    <div>
      <div className={`mobileMenu ${menuActive ? "show" : ""}`} ref={menuRef}>
        <div className="menu-close">
          <div className="clox" onClick={() => setMenuActive(!menuActive)}>
            <i className="ti-close"></i>
          </div>
        </div>
        <ul className="responsivemenu">
          {menus.map((item, mn) => {
            return (
              <ListItem className={item.id === openMainId ? "active" : null} key={mn}>
                {item.submenu ? (
                  <Fragment>
                    <p onClick={() => setOpenMainId(item.id === openMainId ? 0 : item.id)} style={{ marginBottom: "0px" }}>
                      {item.title}
                      <i className={item.id === openMainId ? "fa fa-angle-up" : "fa fa-angle-down"}></i>
                    </p>
                    <Collapse in={item.id === openMainId} timeout="auto" unmountOnExit>
                      <List className="subMenu">
                        <Fragment>
                          {item.submenu.map((submenu, i) => {
                            return (
                              <ListItem key={i}>
                                {submenu.subsubmenu ? (
                                  <Fragment>
                                    <p onClick={() => setOpenSubId(submenu.id === openSubId ? 0 : submenu.id)} style={{ marginBottom: "0px" }}>
                                      {submenu.title}
                                      <i className={submenu.id === openSubId ? "fa fa-angle-up" : "fa fa-angle-down"}></i>
                                    </p>
                                    <Collapse in={submenu.id === openSubId} timeout="auto" unmountOnExit>
                                      <List className="ps-4 pe-0">
                                        {submenu.subsubmenu.map((subsubmenu, j) => (
                                          <ListItem key={j} className="px-0">
                                            <NavLink to={subsubmenu.link} onClick={ClickHandler}>
                                              {subsubmenu.title}
                                            </NavLink>
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Collapse>
                                  </Fragment>
                                ) : (
                                  <NavLink to={submenu.link} onClick={ClickHandler}>
                                    {submenu.title}
                                  </NavLink>
                                )}
                              </ListItem>
                            );
                          })}
                        </Fragment>
                      </List>
                    </Collapse>
                  </Fragment>
                ) : (
                  <NavLink className="active" to={item.link} onClick={() => setMenuActive(!menuActive)}>
                    {item.title}
                  </NavLink>
                )}
              </ListItem>
            );
          })}
        </ul>
      </div>
      <div className="showmenu" onClick={() => setMenuActive(!menuActive)} ref={buttonRef}>
        <button type="button" className="navbar-toggler open-btn">
          <span className="icon-bar first-angle"></span>
          <span className="icon-bar middle-angle"></span>
          <span className="icon-bar last-angle"></span>
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;
