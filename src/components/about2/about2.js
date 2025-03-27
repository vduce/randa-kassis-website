import React from 'react'
import abimg from '../../images/about-s4.jpg'
import sign from '../../images/sign.png'
import VideoModal from '../ModalVideo/VideoModal'
import FunFactVideo from '../FunFactVideo/FunFactVideo'
import { Link } from "react-router-dom";

import Hero2 from '../../components/about2/about-photo.png'
const About2 = (props) => {
    return (
        <section className="wpo-about-section-s4 section-padding">
            <div className="container">
                <div className="wpo-about-wrap">
                    <div className="row align-items-center">
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="wpo-about-img">
                 
                                <div className="funfact-video mt-0">
                                    <img src={Hero2} alt="" />
                                    <VideoModal props={"MizSgMy-Fxs"} />
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-12">
                            <div className="wpo-about-text">
                                <div className="wpo-section-title">
                                <span className="notranslate">Consilium & Vision</span>
                                    {/* <h2>Kassis meets Rayburn, US Special Envoy for Syria.</h2> */}
                                </div>
                                <p>My political beliefs have been shaped by a lifetime of intellectual rebellion, activism, and a deep engagement with history, philosophy, and the realities of power. I reject all forms of ideological rigidity, recognising that dogma—no matter its source—inevitably leads to oppression. </p>        
                                <p>At my core, I believe in the primacy of individual freedom over collective identity. I have dedicated my life to challenging the dogmas that shape the Arab world, advocating for a state that protects personal freedoms rather than imposing outdated moral codes. </p>                 
                                <p>
                                Yet, I am not naive about politics. The pursuit of a utopian system is futile; history has shown that every ideological promise of salvation ends in disillusionment. Instead, I believe in pragmatism—seeking solutions that work, adapting to realities without sacrificing core principles. Politics, like life, is fluid, and those who fail to adapt are doomed to irrelevance</p>                    
                                <Link className="more"  to={`/blog/political-beliefs`}>Continue Reading</Link>
                                

                                {/* <div className="quote">
                                    <p>“We can start by taking small steps and making small changes that can have a big
                                        impact on the world.”</p>
                                </div> */}
                                <div className="wpo-about-left-info">
                                    <div className="wpo-about-left-inner">
                                        <div className="wpo-about-left-text">
                                            <h5 className="notranslate" >Randa Kassis</h5>
                                            <span>Founder and President of Astana Platform</span>
                                        </div>
                                    </div>
                                    <div className="signeture">
                                        <img src={sign} alt="" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </section>

    )
}

export default About2;