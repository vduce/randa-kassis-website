import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2';
import PageTitle from '../../components/pagetitle/PageTitle'
import Contactpage from '../../components/Contactpage/Contactpage'
import Scrollbar from '../../components/scrollbar/scrollbar'
import Footer from '../../components/footer/Footer';
import Navbar from '../../components/Navbar/Navbar';

const ContactPage = () => {
    return (
        <Fragment>
            <Navbar hclass={'wpo-site-header-s1'} />
            <PageTitle pageTitle={'Contact Us'} pagesub={'Contact'} />
            <Contactpage />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default ContactPage;

