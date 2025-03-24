import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Testimonial from '../../components/Testimonial/Testimonial';
import Scrollbar from '../../components/scrollbar/scrollbar'
import Donors from '../../components/Donors/Donors';
import PartnerSection from '../../components/PartnerSection/PartnerSection';
import Footer from '../../components/footer/Footer';
import ServiceSectionS2 from '../../components/ServiceSectionS2/ServiceSectionS2';
import About2 from '../../components/about2/about2';
import Navbar from '../../components/Navbar/Navbar';
import ServiceSectionS3 from '../../components/ServiceSectionS3/ServiceSectionS3';
import ServiceSectionS4 from '../../components/ServiceSectionS4/ServiceSectionS4';

const Media = () => {
    return (
        <Fragment>
                       <Navbar hclass={'wpo-site-header-s1'} />
           
            <PageTitle pageTitle={'Media'} pagesub={'Media'} />
            {/* <About2 /> */}
            <ServiceSectionS4/>
            {/* <Donors /> */}
            {/* <PartnerSection/> */}
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default Media;

