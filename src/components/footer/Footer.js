import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../images/logo.png";
import XLogo from "./xlogo";
import Services from "../../api/service";
import { useEffect } from "react";
import GoogleTranslate from "../translate/GoogleTranslate";
// import { Offcanvas, Nav, Navbar, Container, Dropdown, Button } from 'react-bootstrap';

const Footer = (props) => {
  const ClickHandler = () => {
    window.scrollTo(10, 0);
  };
  const SubmitHandler = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    if (!window.googleTranslateLoaded) {
      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateLoaded = true;

      window.googleTranslateElementInit = () => {
        if (window.google.translate) {
          new window.google.translate.TranslateElement(
            { pageLanguage: "en", autoDisplay: false },
            "google_translate_element"
          );
        }
      };
    }
  }, []);

  return (
    <footer className="wpo-site-footer">
      <div className="wpo-upper-footer">
        <div className="container">
          <div className="row">
            <div className="col col-lg-4 col-md-6 col-12 col-md-6 col-sm-12 col-12">
              <div className="widget about-widget">
                <div className="logo widget-title">
                  <Link onClick={ClickHandler} className="navbar-brand" to="/">
                    <img src={Logo} alt="" />
                  </Link>
                </div>
                <ul className="info">
                  <li>Email: contact@mail.com</li>
                  {/* <li>Address: 22/1 Melborane city austria,
                                        human resoerch, Canada</li> */}
                </ul>
                <div className="social">
                  <ul>
                    <li>
                      <a
                        href="https://www.facebook.com/share/1EsVifAg1M/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fi flaticon-facebook-app-symbol"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/in/randa-kassis?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fi flaticon-linkedin"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://youtube.com/@helene237?si=PfARWlPaQXcsDWwd"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fi flaticon-youtube"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://x.com/kassis_randa"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <XLogo />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col col-lg-4 col-md-6 col-12 col-md-6 col-sm-12 col-12">
              <div className="widget link-widget">
                <div className="widget-title">
                  <h3>Quick Links</h3>
                </div>
                <ul>
                  <li>
                    <Link onClick={ClickHandler} to="/">
                      Home{" "}
                    </Link>
                  </li>
                  <li>
                    <Link onClick={ClickHandler} to="/articles">
                      Articles
                    </Link>
                  </li>
                  <li>
                    <Link onClick={ClickHandler} to="/encounter-and-dialogue">
                      Encounters and Dialogues
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://mspsy.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={ClickHandler}
                    >
                      Movement for a Pluralistic Society
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col col-lg-4 col-md-6 col-12 col-md-6 col-sm-12 col-12">
              <div className="widget link-widget s2">
                <div className="widget-title">
                  <h3>Interviews</h3>
                </div>
                <ul>
                  <li>
                    <Link onClick={ClickHandler} to="/interview/the-politician">
                      The Politician
                    </Link>
                  </li>
                  <li>
                    <Link onClick={ClickHandler} to="/interview/the-essayist-the-critic">
                      The Essayist & The Critic
                    </Link>
                  </li>
                  <li>
                    <Link onClick={ClickHandler} to="/interview/the-painter">
                      The Painter
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="wpo-lower-footer">
        <div className="container">
          <div className="row align-items-center">
            <div className="d-flex justify-content-center">
              <ul className="list-unstyled text-center">
                <li>
                  &copy; 2025{" "}
                  <Link onClick={ClickHandler} to="/">
                    randa kassis
                  </Link>
                  . All rights reserved.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
