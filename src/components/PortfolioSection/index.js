import React from 'react'
import ReactFancyBox from 'react-fancybox'
import 'react-fancybox/lib/fancybox.css'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import SectionTitle from '../SectionTitle/SectionTitle'
import { Link } from 'react-router-dom'

const ClickHandler = () => {
    window.scrollTo(10, 0);
}


const PortfolioSection = ({props}) => {
    return (

        <section className={`wpo-portfolio-section section-padding1 `} id="gallery">
            <div className="container">
            {props.length<7?
            <SectionTitle subTitle={'Photos'} Title={'Gallery'} />: <></>}

                <div className="sortable-gallery">
                    <div className="gallery-filters"></div>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="portfolio-grids gallery-container clearfix">
                                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
                                    <Masonry columnsCount={3} gutter="15px">
                                        {props.map((image, i) => (
                                            <div className="grid" key={i}>
                                                    <Link to="/gallery">

                                                <div  className="img-holder">
                                                    <ReactFancyBox  thumbnail={image.Pimg} image={image.Pimg} style={{ width: "100%", display: "block" }} />
                                                </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </Masonry>
                                </ResponsiveMasonry>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default PortfolioSection;