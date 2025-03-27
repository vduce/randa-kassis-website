import React from "react";
import VideoModal from '../ModalVideo/VideoModal';
import hero from '../../images/slider/video.png'
import innerImg from '../../images/slider/4.png'

import Shape1 from '../../images/slider/back-shape-3.png'
import Shape2 from '../../images/slider/back-shape-4.png'
import randalogo from '../../components/hero4/randa-logo.png'

import smallthumb from '../../components/hero4/hero-video.png'
import Hero from '../../images/hero.png'
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
                                    <h2 className="notranslate" >My Story</h2>
                                </div>
                                <div data-swiper-parallax="400" className="slide-text">
                                    <p  >Randa Kassis is a Franco-Syrian politician. During the Syrian civil war, she was until 2012 a member of the Syrian National Council.</p>
                                    <Link className="text-white"  to={`/blog/a-rebel-at-heart-my-story`} style={{borderBottom:"2px solid white"}}>Continue Reading</Link>
                                </div>
                                <div className="clearfix"></div>
                                <div data-swiper-parallax="500" className="slide-video-content">
                                    <div className="slide-video-img">
                                        <img src={smallthumb} alt="" />
                                        <VideoModal props={"_Z7Pv7dNSao"} />
                                        {/* <VideoModal /> */}
                                    </div>
                                    <div className="slide-video-text">
                                        <div className="d-flex gap-2">
                                            <div><h4>Join The Party</h4></div>
                                            <div><a href="https://mspsy.com/" target="blank">
                                            <img src={randalogo} alt="" width={"40px"} style={{borderRadius:"20px"}}/></a></div>
                                        </div>
                                        <p>Movement for a pluralistic society</p>
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
    )
}
export default Hero4;