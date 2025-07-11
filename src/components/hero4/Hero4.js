import VideoModal from "../ModalVideo/VideoModal";
import randalogo from "../../components/hero4/randa-logo.png";
import Hero from "../../images/hero.png";
import { Link } from "react-router-dom";

const Hero4 = () => {
  return (
    <section className="static-hero-s3">
      <div className="hero-container">
        <div className="hero-inner">
          <div className="container-fluid">
            <div className="hero-content">
              <div className="hero-content-wrap">
                <div data-swiper-parallax="300" className="slide-title">
                  <h3 className="notranslate text-white" style={{ fontSize: "35px" }}>
                    My Story: A Rebel at Heart
                  </h3>
                </div>
                <div data-swiper-parallax="400" className="slide-text">
                  <p style={{ fontSize: "22px", lineHeight: "40px" }}>
                    This is not a tale of triumph, but of resistance—a personal journey shaped by
                    questions, defiance, and the courage to walk alone...
                  </p>
                  <Link
                    className="text-white"
                    to={`/story/1`}
                    style={{ borderBottom: "2px solid white" }}
                  >
                    Continue Reading
                  </Link>
                </div>
                <div className="clearfix"></div>
                <div data-swiper-parallax="500" className="slide-video-content">
                  <div className="slide-video-img">
                    <img
                      src={
                        "https://vz-378d27f5-9f9.b-cdn.net/abf67748-e633-4be3-8cea-20d94216cfb2/thumbnail_c6e39dc4.jpg"
                      }
                      alt=""
                    />
                    <VideoModal props={"abf67748-e633-4be3-8cea-20d94216cfb2"} />
                    {/* <VideoModal /> */}
                  </div>
                  <div className="slide-video-text">
                    <div className="d-flex gap-2">
                      <div>
                        <h4>Join the Party</h4>
                      </div>
                      <div>
                        <a href="https://mspsy.com/" target="blank">
                          <img
                            src={randalogo}
                            alt=""
                            width={"40px"}
                            style={{ borderRadius: "20px" }}
                          />
                        </a>
                      </div>
                    </div>
                    <p>Movement for a Pluralistic Society</p>
                  </div>
                </div>
              </div>
              <div className="politian-pic">
                <div className="inner">
                  <img src={Hero} alt="" />
                </div>
                <div className="back-shape"></div>
                {/* <div className="back-shape-2"><img src={Shape1} alt="" /></div> */}
                {/* <div className="back-shape-3"><img src={Shape2} alt="" /></div> */}
              </div>
              {/* <div className="right-shape"><img src={Shape3} alt="" /></div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero4; 
