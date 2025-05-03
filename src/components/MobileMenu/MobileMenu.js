import React, { Fragment, useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/List";
import Collapse from "@material-ui/core/Collapse";
import { NavLink } from "react-router-dom";
import "./style.css";


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
    link: "/media",
  },
  {
    id: 4,
    title: "Encounters & dialogues",
    link: "/404",
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
    link: "/gallery",
  },
  {
    id: 8,
    title: "Contact",
    link: "/Contact",
  },
];

const MobileMenu = () => {
  const [openId, setOpenId] = useState(0);
  const [menuActive, setMenuState] = useState(false);

  const ClickHandler = () => {
    window.scrollTo(10, 0);
    setMenuState(false);
  };

  return (
    <div>
      <div className={`mobileMenu ${menuActive ? "show" : ""}`}>
        <div className="menu-close">
          <div className="clox" onClick={() => setMenuState(!menuActive)}>
            <i className="ti-close"></i>
          </div>
        </div>

        <ul className="responsivemenu">
          {menus.map((item, mn) => {
            return (
              <ListItem className={item.id === openId ? "active" : null} key={mn}>
                {item.submenu ? (
                  <Fragment>
                    <p
                      onClick={() => setOpenId(item.id === openId ? 0 : item.id)}
                      style={{ marginBottom: "0px" }}
                    >
                      {item.title}
                      <i className={item.id === openId ? "fa fa-angle-up" : "fa fa-angle-down"}></i>
                    </p>
                    <Collapse in={item.id === openId} timeout="auto" unmountOnExit>
                      <List className="subMenu">
                        <Fragment>
                          {item.submenu.map((submenu, i) => {
                            return (
                              <ListItem key={i}>
                                <NavLink
                                  onClick={ClickHandler}
                                  className="active"
                                  to={submenu.link}
                                >
                                  {submenu.title}
                                </NavLink>
                              </ListItem>
                            );
                          })}
                        </Fragment>
                      </List>
                    </Collapse>
                  </Fragment>
                ) : (
                  <NavLink className="active" to={item.link}>
                    {item.title}
                  </NavLink>
                )}
              </ListItem>
            );
          })}
        </ul>
      </div>

      <div className="showmenu" onClick={() => setMenuState(!menuActive)}>
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
