import React, { Fragment } from 'react';
import PageTitle from '../../components/pagetitle/PageTitle'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Navbar from '../../components/Navbar/Navbar';
import ServiceSectionS4 from '../../components/ServiceSectionS4/ServiceSectionS4';

const Media = () => {
    return (
        <Fragment>
                       <Navbar hclass={'wpo-site-header-s1'} />
           
            <PageTitle pageTitle={''} pagesub={'Media'} />
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

