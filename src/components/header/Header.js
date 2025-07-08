import React, { useState } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "../MobileMenu/MobileMenu";
import Logo from "../../images/logo.png";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../../context/MenuContext";

const Header = (props) => {
  const navigate = useNavigate();
  const { menuActive, setMenuActive } = useMenu();

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
    "in-the-arena": "In the Arena",
    "my-four-pawed-companions/1": "My Four-Pawed Companions",
    "through-my-eyes": "Through My Eyes",
  };

  const beyondPolitics = {
    "the-politician": "Paintings",
    "the-essayist-the-critic": "Exhibitions & Moments",
  };

  const SubmitHandler = (e) => {
    e.preventDefault();
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
                            <Link
                              onClick={ClickHandler}
                              className="text-capitalize"
                              to={`/interview/${key}`}
                            >
                              {value}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <Link
                        className="text-capitalize"
                        onClick={ClickHandler}
                        to="/encounter-and-dialogue"
                      >
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
                            <Link
                              onClick={ClickHandler}
                              className="text-capitalize"
                              to={`/beyondPolitics/${key}/${1}`}
                            >
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
                            <Link
                              onClick={ClickHandler}
                              className="text-capitalize"
                              to={`/story/${key}`}
                              replace={true}
                            >
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
                            <Link
                              onClick={ClickHandler}
                              className="text-capitalize"
                              to={`/gallery/${key}`}
                            >
                              {value}
                            </Link>
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
