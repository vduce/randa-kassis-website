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
    id: 5,
    title: "Media",
    link: "/media",
  },
  {
    id: 6,
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
    id: 7,
    title: "My Story",
    link: "/story/1",
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
