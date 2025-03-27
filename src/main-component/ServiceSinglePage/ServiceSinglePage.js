import React, { Fragment } from "react";
// import Navbar2 from '../../components/Navbar2/Navbar2'
import PageTitle from "../../components/pagetitle/PageTitle";
import Scrollbar from "../../components/scrollbar/scrollbar";
import { useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";

import Services from "../../api/service";
import ServiceSidebar from "./sidebar";
import Contact from "./contact";
import Footer from "../../components/footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import Logo from "../../images/logo.png";
import blogs2 from "../../api/blogs2";

import Photo1 from "../../images/blog/1.jpeg";
import Photo2 from "../../images/blog/2.jpeg";
import Photo3 from "../../images/blog/3.jpeg";
import Photo4 from "../../images/blog/4.jpeg";
import Photo5 from "../../images/blog/5.jpeg";
import Photo6 from "../../images/blog/6.jpeg";
import Photo7 from "../../images/blog/7.jpeg";
import Photo8 from "../../images/blog/8.jpeg";
import Photo9 from "../../images/blog/9.jpeg";
import Photo10 from "../../images/blog/10.jpeg";
import Photo11 from "../../images/blog/11.jpeg";
import Photo12 from "../../images/blog/12.jpeg";
import Photo13 from "../../images/blog/13.jpeg";
import Photo14 from "../../images/blog/14.jpeg";
import Photo15 from "../../images/blog/15.jpeg";
import Photo16 from "../../images/blog/16.jpeg";
import Photo17 from "../../images/blog/17.jpeg";
import Photo18 from "../../images/blog/18.jpeg";
import Photo19 from "../../images/blog/19.jpeg";
import Photo20 from "../../images/blog/20.jpeg";
import Photo21 from "../../images/blog/21.jpeg";
import Photo22 from "../../images/blog/22.jpeg";
import Photo23 from "../../images/blog/23.jpeg";
import Photo24 from "../../images/blog/24.jpeg";
import Photo25 from "../../images/blog/25.jpeg";
import Photo26 from "../../images/blog/26.jpeg";
import Photo27 from "../../images/blog/27.jpeg";
import Photo28 from "../../images/blog/28.jpeg";
import Photo29 from "../../images/blog/29.jpeg";
import Photo30 from "../../images/blog/30.jpeg";
import Photo31 from "../../images/blog/31.jpeg";
import Photo32 from "../../images/blog/32.jpeg";
import Photo33 from "../../images/blog/33.jpeg";
import Photo34 from "../../images/blog/34.jpeg";
import Photo35 from "../../images/blog/35.jpeg";
import Photo36 from "../../images/blog/36.jpeg";
import Photo37 from "../../images/blog/37.jpeg";
import Photo38 from "../../images/blog/38.jpeg";
import Photo39 from "../../images/blog/39.jpeg";
import Photo40 from "../../images/blog/40.jpeg";
import Photo41 from "../../images/blog/41.jpeg";
import Photo42 from "../../images/blog/42.jpeg";
import Photo43 from "../../images/blog/43.jpeg";
import Photo44 from "../../images/blog/44.jpeg";
import Photo45 from "../../images/blog/45.jpeg";
import Photo46 from "../../images/blog/46.jpeg";
import Photo47 from "../../images/blog/47.jpeg";
import Photo48 from "../../images/blog/48.jpeg";
import Photo49 from "../../images/blog/49.jpeg";
import Photo50 from "../../images/blog/50.jpeg";
import Photo51 from "../../images/blog/51.jpeg";
import Photo52 from "../../images/blog/52.jpeg";
import Photo53 from "../../images/blog/53.jpeg";
import Photo54 from "../../images/blog/54.jpeg";
import Photo55 from "../../images/blog/55.jpeg";
import Photo56 from "../../images/blog/56.jpeg";
import Photo57 from "../../images/blog/57.jpeg";
import Photo58 from "../../images/blog/58.jpeg";
import Photo59 from "../../images/blog/59.jpeg";
import Photo60 from "../../images/blog/60.jpeg";
import Photo61 from "../../images/blog/61.jpeg";
import Photo62 from "../../images/blog/62.jpeg";
import Photo63 from "../../images/blog/63.jpeg";
import Photo64 from "../../images/blog/64.jpeg";
import Photo65 from "../../images/blog/65.jpeg";
import Photo66 from "../../images/blog/66.jpeg";
import Photo67 from "../../images/blog/67.jpeg";
import Photo68 from "../../images/blog/68.jpeg";
import Photo69 from "../../images/blog/69.jpeg";
import Photo70 from "../../images/blog/70.jpeg";
import Photo71 from "../../images/blog/71.jpeg";
import Photo72 from "../../images/blog/72.jpeg";
import Photo73 from "../../images/blog/73.jpeg";
import Photo74 from "../../images/blog/74.jpeg";
import Photo75 from "../../images/blog/75.jpeg";
import Photo76 from "../../images/blog/76.jpeg";
import Photo77 from "../../images/blog/77.jpeg";
import Photo78 from "../../images/blog/78.jpeg";
import Photo79 from "../../images/blog/79.jpeg";

const ServiceSinglePage = (props) => {
  const { slug } = useParams();
  const location = useLocation();

  const serviceDetails = blogs2.find((item) => item.slug === slug);
  const images = {
    "Photo 1": Photo1,
    "Photo 2": Photo2,
    "Photo 3": Photo3,
    "Photo 4": Photo4,
    "Photo 5": Photo5,
    "Photo 6": Photo6,
    "Photo 7": Photo7,
    "Photo 8": Photo8,
    "Photo 9": Photo9,
    "Photo 10": Photo10,
    "Photo 11": Photo11,
    "Photo 12": Photo12,
    "Photo 13": Photo13,
    "Photo 14": Photo14,
    "Photo 15": Photo15,
    "Photo 16": Photo16,
    "Photo 17": Photo17,
    "Photo 18": Photo18,
    "Photo 19": Photo19,
    "Photo 20": Photo20,
    "Photo 21": Photo21,
    "Photo 22": Photo22,
    "Photo 23": Photo23,
    "Photo 24": Photo24,
    "Photo 25": Photo25,
    "Photo 26": Photo26,
    "Photo 27": Photo27,
    "Photo 28": Photo28,
    "Photo 29": Photo29,
    "Photo 30": Photo30,
    "Photo 31": Photo31,
    "Photo 32": Photo32,
    "Photo 33": Photo33,
    "Photo 34": Photo34,
    "Photo 35": Photo35,
    "Photo 36": Photo36,
    "Photo 37": Photo37,
    "Photo 38": Photo38,
    "Photo 39": Photo39,
    "Photo 40": Photo40,
    "Photo 41": Photo41,
    "Photo 42": Photo42,
    "Photo 43": Photo43,
    "Photo 44": Photo44,
    "Photo 45": Photo45,
    "Photo 46": Photo46,
    "Photo 47": Photo47,
    "Photo 48": Photo48,
    "Photo 49": Photo49,
    "Photo 50": Photo50,
    "Photo 51": Photo51,
    "Photo 52": Photo52,
    "Photo 53": Photo53,
    "Photo 54": Photo54,
    "Photo 55": Photo55,
    "Photo 56": Photo56,
    "Photo 57": Photo57,
    "Photo 58": Photo58,
    "Photo 59": Photo59,
    "Photo 60": Photo60,
    "Photo 61": Photo61,
    "Photo 62": Photo62,
    "Photo 63": Photo63,
    "Photo 64": Photo64,
    "Photo 65": Photo65,
    "Photo 66": Photo66,
    "Photo 67": Photo67,
    "Photo 68": Photo68,
    "Photo 69": Photo69,
    "Photo 70": Photo70,
    "Photo 71": Photo71,
    "Photo 72": Photo72,
    "Photo 73": Photo73,
    "Photo 74": Photo74,
    "Photo 75": Photo75,
    "Photo 76": Photo76,
    "Photo 77": Photo77,
    "Photo 78": Photo78,
    "Photo 79": Photo79,
  };
  const videos = {
    "Video 1": "https://www.youtube.com/embed/XYN2H_2E5W4",
    "Video 2": "https://www.youtube.com/embed/_BDVw_0xXIo",
    "Video 3": "https://www.youtube.com/embed/nIbriciFyRo",
    "Video 4": "https://www.youtube.com/embed/ElS1l1VMr5A",
  };
  const renderContent = (text) => {
    if (typeof text !== "string") return null; // Prevents errors if text is undefined or not a string

    const content = text.split(/(Photo \d+|Video \d+)/).map((part, index) => {
      if (images[part]) {
        // Render image
        return (
          <img
            key={index}
            src={images[part]}
            alt={part}
            style={{
              height: "auto",
              width: "250px",
              height:"350px",
              margin: "10px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
            className="img-fluid"
          />
        );
      } else if (videos[part]) {
        const videoUrl = videos[part];
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "600px",
              minHeight: "200px",
              borderRadius: "15px",
              overflow: "hidden",
              transition: "transform 0.3s, box-shadow 0.3s",
            }}
            className="youtube-container"
          >
            <iframe
              src={videoUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                width: "100%",
                height: "50vh",
                borderRadius: "12px",
                transition: "all 0.3s ease-in-out",
              }}
            />
          </div>
        );
      } else {
        return (
          <div style={{textAlign:"start"}} key={index} dangerouslySetInnerHTML={{ __html: part }} />
        );
      }
    });

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "center" }}>
        {content}
      </div>
    );
  };

  const currentPath = location.pathname;
  const basePath = "/blog/a-rebel-at-heart-my-story";

  // Extract the page number from pathname
  const match = currentPath.match(/\/blog\/a-rebel-at-heart-my-story(\d*)$/);
  const currentPage = match && match[1] !== "" ? parseInt(match[1]) : 0;

  // Previous and Next page paths
  const prevPage =
    currentPage > 0 ? `${basePath}${currentPage - 1 || ""}` : null;
  const nextPage = currentPage < 8 ? `${basePath}${currentPage + 1}` : null;

  return (
    <Fragment>
      {/* <Navbar2 /> */}
      <Navbar hclass={"wpo-site-header-s1"} Logo={Logo} />

      <PageTitle pageTitle={serviceDetails.title} pagesub={"Service"} />

      <div className="wpo-service-single-area section-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-12">
              <div className="wpo-service-single-wrap">
                <div className="wpo-service-single-item">
                  <div className="wpo-service-single-main-img row">
                    {/* {serviceDetails &&
                                            [serviceDetails.otherimg1, serviceDetails.otherimg2, serviceDetails.otherimg3]
                                                .filter((image) => image) // Remove undefined/null values
                                                .length > 1 && ( // Only apply map if there are at least 2 images
                                                <div className="wpo-service-single-main-img row">
                                                    {[serviceDetails.otherimg1, serviceDetails.otherimg2, serviceDetails.otherimg3]
                                                        .filter((image) => image) // Remove undefined/null values
                                                        .map((image, index) => (
                                                            <div className="col-md-4" key={index}>
                                                                <img
                                                                    src={image}
                                                                    alt={`Service ${index + 1}`}
                                                                    style={{ width: "100%", height: "450px", objectFit: "cover" }}
                                                                />
                                                            </div>
                                                        ))}
                                                </div>
                                            )} */}
                  </div>

                  <div className="wpo-service-single-title">
                    {/* <h3>{serviceDetails.title}</h3> */}
                  </div>
                  <div className="max-w-2xl mx-auto p-3 bg-white shadow-lg rounded-lg">
                    <>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.description)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des2)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des3)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des4)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des5)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des6)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des7)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des8)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des9)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des10)}
                      </div>
                      <div className="max-w-2xl mx-auto p-3">
                        {renderContent(serviceDetails.des11)}
                      </div>
                    </>
                  </div>
                  {serviceDetails.slug !== "political-beliefs" && (
                    <div className="pagination-wrapper pagination-wrapper-left">
                      <ul className="pg-pagination">
                        {/* Previous Button */}
                        {/* Previous Button */}
                        <li className={prevPage ? "" : "disabled"}>
                          {prevPage ? (
                            <Link to={prevPage} aria-label="Previous">
                              <i className="fi ti-angle-left"></i>
                            </Link>
                          ) : (
                            <span
                              aria-label="Previous"
                              style={{ pointerEvents: "none", opacity: 0.5 }}
                            >
                              <i className="fi ti-angle-left"></i>
                            </span>
                          )}
                        </li>

                        {/* Next Button */}
                        <li className={nextPage ? "" : "disabled"}>
                          {nextPage ? (
                            <Link to={nextPage} aria-label="Next">
                              <i className="fi ti-angle-right"></i>
                            </Link>
                          ) : (
                            <span
                              aria-label="Next"
                              style={{ pointerEvents: "none", opacity: 0.5 }}
                            >
                              <i className="fi ti-angle-right"></i>
                            </span>
                          )}
                        </li>
                      </ul>
                    </div>
                  )}
                  <style jsx>{`
        .pagination-wrapper {
          display: flex;
          justify-content: start;
          padding: 20px 0;
        }
        .pg-pagination {
          list-style: none;
          display: flex;
          gap: 10px;
        }
        .pg-pagination li {
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          background-color: #F9F9F9;
          transition: background-color 0.3s, transform 0.2s;
        }
        .pg-pagination li a, .pg-pagination li span {
          color: #2C1237;
          font-size: 18px;
        }
        .pg-pagination li.disabled {
          background-color: #f5f5f5;
          color: #A0A0A0;
          cursor: not-allowed;
                    border-radius: 8px;

        }
      `}</style>
                  {/* <div className="row mt-4">
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="wpo-p-details-img">
                                                <img src={serviceDetails.ssImg1} alt="" />
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-6 col-12">
                                            <div className="wpo-p-details-img">
                                                <img src={serviceDetails.ssImg2} alt="" />
                                            </div>
                                        </div>
                                    </div> */}
                </div>
                {/* <div className="wpo-service-single-item list-widget">
                                    <div className="wpo-service-single-title">
                                        <h3>Our Capabilities</h3>
                                    </div>
                                    <p>Massa volutpat odio facilisis purus sit elementum. Non, sed velit dictum quam. Id
                                        risus pharetra est, at rhoncus, nec ullamcorper tincidunt. Id aliquet duis
                                        sollicitudin diam.</p>
                                    <ul>
                                        <li>Non saed velit dictum quam risus pharetra esta.</li>
                                        <li>Id risus pharetra est, at rhoncus, nec ullamcorper tincidunt.</li>
                                        <li>Hac nibh fermentum nisi, platea condimentum cursus.</li>
                                        <li>Massa volutpat odio facilisis purus sit elementum.</li>
                                        <li>Elit curabitur amet risus bibendum.</li>
                                    </ul>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-title">
                                        <h3>Our approach</h3>
                                    </div>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Consequat suspendisse aenean
                                        tellus augue morbi risus. Sit morbi vitae morbi sed urna sed purus. Orci facilisi
                                        eros sed pellentesque. Risus id sed tortor sed scelerisque. Vestibulum elit
                                        elementum, magna id viverra non, velit. Pretium, eros, porttitor fusce auctor vitae
                                        id. Phasellus scelerisque nibh eleifend vel enim mauris purus. Rutrum vel sem
                                        adipiscing nisi vulputate molestie scelerisque molestie ultrices. Eu, fusce
                                        vulputate diam interdum morbi ac a.</p>
                                </div>
                                <div className="wpo-service-single-item list-widget">
                                    <div className="wpo-service-single-title">
                                        <h3>Our Work Process</h3>
                                    </div>
                                    <ul>
                                        <li>Non saed velit dictum quam risus pharetra esta.</li>
                                        <li>Id risus pharetra est, at rhoncus, nec ullamcorper tincidunt.</li>
                                        <li>Hac nibh fermentum nisi, platea condimentum cursus.</li>
                                        <li>Massa volutpat odio facilisis purus sit elementum.</li>
                                    </ul>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-single-title">
                                        <h3>Related Service</h3>
                                    </div>
                                    <div className="wpo-service-area">
                                        <div className="row align-items-center">
                                            {Services.slice(0,3).map((service, srv) => (
                                                <div className="col-lg-4 col-md-6 col-12" key={srv}>
                                                    <div className="wpo-service-item">
                                                        <i className={`fi ${service.icon}`} ></i>
                                                        <h2>{service.title}</h2>
                                                        <p>Lacus, etiam sed est eu tempus need Temer diam congue.</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="wpo-service-single-item">
                                    <div className="wpo-service-contact-area">
                                        <div className="wpo-contact-title">
                                            <h2>Have project in mind? Let's discuss</h2>
                                            <p>Get in touch with us to see how we can help you with your project</p>
                                        </div>
                                        <div className="wpo-contact-form-area">
                                            <Contact/>
                                        </div>
                                    </div>
                                </div> */}
              </div>
            </div>
            {/* <ServiceSidebar/> */}
          </div>
        </div>
      </div>
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default ServiceSinglePage;
