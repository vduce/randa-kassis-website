import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../images/logo.png'
import Services from '../../api/service';
import { useEffect } from "react";
import GoogleTranslate from '../translate/GoogleTranslate';
// import { Offcanvas, Nav, Navbar, Container, Dropdown, Button } from 'react-bootstrap';

const Footer = (props) => {

    const ClickHandler = () => {
        window.scrollTo(10, 0);
    }
    const SubmitHandler = (e) => {
        e.preventDefault()
    }
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
              <div className="col col-lg-3 col-md-6 col-12 col-md-6 col-sm-12 col-12">
                <div className="widget about-widget">
                  <div className="logo widget-title">
                    <Link
                      onClick={ClickHandler}
                      className="navbar-brand"
                      to="/"
                    >
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
                          href="https://www.facebook.com/randakassis.co"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fi flaticon-facebook-app-symbol"></i>
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.youtube.com/user/helene237"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <i className="fi flaticon-youtube"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col col-lg-3 col-md-6 col-12 col-md-6 col-sm-12 col-12">
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
                      <Link onClick={ClickHandler} to="/media">
                        Media
                      </Link>
                    </li>
                    <li>
                      <Link onClick={ClickHandler} to="/articles">
                        Articles
                      </Link>
                    </li>
                    {/* <li><Link onClick={ClickHandler} to="/service-fullwidth">Conference And Symposiums</Link></li> */}
                    <li>
                      <Link onClick={ClickHandler} to="/gallery">
                        Gallery
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col col-lg-3 col-md-6 col-12 col-md-6 col-sm-12 col-12">
                <div className="widget link-widget s2">
                  <div className="widget-title">
                    <h3>Media</h3>
                  </div>
                  <ul>
                    <li>
                      <Link onClick={ClickHandler} to="/media">
                        News
                      </Link>
                    </li>
                    <li>
                      <Link onClick={ClickHandler} to="/media">
                        Interviews
                      </Link>
                    </li>
                    <li>
                      <Link onClick={ClickHandler} to="/media">
                        Program Tv
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="col col-lg-3 col-md-6 col-12 col-md-6 col-sm-12 col-12">
                <div className="widget link-widget s2">
                  <div className="widget-title">
                    <h3>Language</h3>
                  </div>
                  <GoogleTranslate />
                </div>
              </div>
              {/* <div className="col col-lg-3 col-md-6 col-12 col-md-6 col-sm-12 col-12">
                            <div className="widget newsletter-widget">
                                <div className="widget-title">
                                    <h3>Subscribe Newsletter</h3>
                                </div>
                                <p>Get timely updates ! We only send interesting and relevant emails.</p>
                                <form onSubmit={SubmitHandler}>
                                    <div className="input-1">
                                        <input type="email" className="form-control" placeholder="Your Email Address..."
                                            required="" />
                                    </div>
                                    <div className="submit clearfix">
                                        <button type="submit">Subscribe now</button>
                                    </div>
                                </form>
                            </div>
                        </div> */}
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
}

export default Footer;