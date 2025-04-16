import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import MobileMenu from '../MobileMenu/MobileMenu'
import Logo from '../../images/logo.png'

const Header = (props) => {

    const [menuActive, setMenuState] = useState(false);

    const storyList = {
      "a-rebel-at-heart-my-story": "Prologue",
      "a-rebel-at-heart-my-story1": "I was not born a rebel...",
      "a-rebel-at-heart-my-story2": "Returning to Syria...",
      "a-rebel-at-heart-my-story3": "Painting-a style of life",
      "a-rebel-at-heart-my-story4": "A Life of Art, Motherhood...",
      "a-rebel-at-heart-my-story5": "Political Fight: A Struggle...",
      "a-rebel-at-heart-my-story6": "Fighting for Secularism Against",
      "a-rebel-at-heart-my-story7": "Looking Back: The Unyielding...",
      "a-rebel-at-heart-my-story8": "The Contradiction That Defines Me",
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
                    <Link
                      onClick={ClickHandler}
                      className="navbar-brand"
                      to="/"
                    >
                      <img src={Logo} alt="logo" />
                    </Link>
                  </div>
                </div>
                <div className="col-lg-8 col-md-1 col-1">
                  <div
                    id="navbar"
                    className="collapse navbar-collapse navigation-holder"
                  >
                    <button className="menu-close">
                      <i className="ti-close"></i>
                    </button>
                    <ul className="nav navbar-nav mb-2 mb-lg-0 text-capitalize">
                      <li className="menu-item-has-children">
                        <Link
                          className="text-capitalize"
                          onClick={ClickHandler}
                          to="/"
                        >
                          Home
                        </Link>

                        {/* <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/home">Main Home</Link></li>
                                                <li><Link onClick={ClickHandler} to="/home2">Election Home</Link></li>
                                                <li><Link onClick={ClickHandler} to="/home3">Male Candidate</Link></li>
                                                <li><Link onClick={ClickHandler} to="/home4">Female Candidate</Link></li>
                                            </ul> */}
                      </li>
                      {/* <li><Link onClick={ClickHandler} to="/about">About us</Link></li> */}
                      <li>
                        <Link
                          className="text-capitalize"
                          onClick={ClickHandler}
                          to="/media"
                        >
                          Media
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="text-capitalize"
                          onClick={ClickHandler}
                          to="/articles"
                        >
                          Articles
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="text-capitalize"
                          onClick={ClickHandler}
                          to="/conference-and-symposium"
                        >
                          Conference And Symposiums
                        </Link>
                      </li>
                      <li>
                        <Link
                          className="text-capitalize"
                          onClick={ClickHandler}
                          to="/gallery"
                        >
                          Gallery
                        </Link>
                      </li>

                      <li className="menu-item-has-children">
                        <Link
                          onClick={ClickHandler}
                          className="text-capitalize"
                          to="/"
                        >
                          My Story
                        </Link>
                        <ul className="sub-menu">
                          {Object.entries(storyList).map(([key, value]) => (
                            <li key={key}>
                              <Link
                                onClick={ClickHandler}
                                className="text-capitalize"
                                to={`/blog/${key}`}
                              >
                                {value}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      {/* <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/">Pages</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/gallery">Gallery</Link></li>
                                                <li><Link onClick={ClickHandler} to="/testimonial">Testimonial</Link></li>
                                                <li><Link onClick={ClickHandler} to="/team">Team</Link></li>
                                                <li><Link onClick={ClickHandler} to="/team-single/Esther-Howard">Team Single</Link></li>
                                                <li className="menu-item-has-children">
                                                    <Link onClick={ClickHandler} to="/">Services</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link onClick={ClickHandler} to="/service">Services</Link></li>
                                                        <li><Link onClick={ClickHandler} to="/service-single/Economic-Establishment">Services Single</Link></li>
                                                    </ul>
                                                </li>
                                                <li><Link onClick={ClickHandler} to="/shop">Shop</Link></li>
                                                <li><Link onClick={ClickHandler} to="/product-single/The-Audacity-of-Hope">Shop Single</Link></li>
                                                <li><Link onClick={ClickHandler} to="/cart">Cart</Link></li>
                                                <li><Link onClick={ClickHandler} to="/checkout">Checkout</Link></li>
                                                <li><Link onClick={ClickHandler} to="/faq">FAQ</Link></li>
                                                <li><Link onClick={ClickHandler} to="/volunteer">Volunteer</Link></li>
                                                <li><Link onClick={ClickHandler} to="/404">404 Error</Link></li>
                                                <li><Link onClick={ClickHandler} to="/login">Login</Link></li>
                                                <li><Link onClick={ClickHandler} to="/register">Register</Link></li>
                                            </ul>
                                        </li> */}
                      {/* <li className="menu-item-has-children">
                                            <Link onClick={ClickHandler} to="/blog-fullwidth">Blog</Link>
                                            <ul className="sub-menu">
                                                <li><Link onClick={ClickHandler} to="/blog">Blog right sidebar</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog-left-sidebar">Blog left sidebar</Link></li>
                                                <li><Link onClick={ClickHandler} to="/blog-fullwidth">Blog fullwidth</Link></li>
                                                <li className="menu-item-has-children">
                                                    <Link onClick={ClickHandler} to="/">Blog details</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link onClick={ClickHandler} to="/blog-single/support-progressive-change">Blog details right sidebar</Link>
                                                        </li>
                                                        <li><Link onClick={ClickHandler} to="/blog-single-left-sidebar/support-progressive-change">Blog details left
                                                            sidebar</Link></li>
                                                        <li><Link onClick={ClickHandler} to="/blog-single-fullwidth/support-progressive-change">Blog details
                                                            fullwidth</Link></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li> */}
                      {/* <li><Link onClick={ClickHandler} to="/contact">Contact</Link></li> */}
                    </ul>
                  </div>
                </div>
                <div className="col-lg-2 col-md-3 col-2">
                  <div className="header-right">
                    <div className="header-search-form-wrapper">
                      {/* <div className="cart-search-contact">
                                            <button onClick={() => setMenuState(!menuActive)} className="search-toggle-btn"><i
                                                className={`fi ti-search ${menuActive ? "ti-close" : "fi "}`}></i></button>
                                            <div className={`header-search-form ${menuActive ? "header-search-content-toggle" : ""}`}>
                                                <form onSubmit={SubmitHandler}>
                                                    <div>
                                                        <input type="text" className="form-control"
                                                            placeholder="Search here..." />
                                                        <button type="submit"><i
                                                            className="fi flaticon-search"></i></button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div> */}
                    </div>
                    <div className="close-form">
                      <Link
                        onClick={ClickHandler}
                        className="theme-btn"
                        to="/contact"
                      >
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
}

export default Header;