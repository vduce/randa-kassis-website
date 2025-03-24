import React, { Fragment } from 'react';
import Navbar2 from '../../components/Navbar2/Navbar2.js';
import PageTitle from '../../components/pagetitle/PageTitle.js'
import BlogList from '../../components/BlogList/BlogList.js'
import Scrollbar from '../../components/scrollbar/scrollbar.js'
import Footer from '../../components/footer/Footer.js';
import Navbar from '../../components/Navbar/Navbar.js';

const BlogPageFullwidth = () => {
    return (
        <Fragment>
            <Navbar hclass={'wpo-site-header-s1'} />
            <PageTitle pageTitle={'Latest News'} pagesub={'Blog'} />
            <BlogList blLeft={'d-none'} blRight={'col-lg-10 offset-lg-1 col-12'} />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default BlogPageFullwidth;

