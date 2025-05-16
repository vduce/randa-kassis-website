import React from "react";
import AnchorLink from "react-anchor-link-smooth-scroll";
import "./style.css";

const Scrollbar = () => {
  return (
    <div className="col-lg-12">
      <div className="header-menu">
        <ul className="smothscroll">
          <li>
            <AnchorLink href="#scrool" className="d-flex align-items-center justify-content-center">
              <i className="ti-arrow-up"></i>
            </AnchorLink>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Scrollbar;
