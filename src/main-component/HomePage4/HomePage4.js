import React, { Fragment } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Hero4 from '../../components/hero4/Hero4';
import About2 from '../../components/about2/about2';
import ServiceSectionS2 from '../../components/ServiceSectionS2/ServiceSectionS2';
import ServiceSectionS3 from '../../components/ServiceSectionS3/ServiceSectionS3';


import FunFactS2 from '../../components/FunFactS2/FunFactS2';
import FunFactVideo from '../../components/FunFactVideo/FunFactVideo';
import BlogSection from '../../components/BlogSection/BlogSection';
import Footer from '../../components/footer/Footer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import Logo from '../../images/logo.png'

import ShopProduct from '../../components/ShopProduct';
import api from '../../api';
import { addToCart } from '../../store/actions/action';
import BookSection from '../../components/BookSection/BookSection';
import PortfolioSection from '../../components/PortfolioSection';

import pImg1 from '../../images/blog/85.png'
import pImg2 from'../../images/blog/83.png'
import pImg3 from'../../images/blog/82.png'
import pImg4 from'../../images/blog/84.png'
import pImg5 from'../../images/blog/81.png'
import pImg6 from '../../images/blog/86.png'

const HomePage2 = () => {

    const productsArray = api();

    const addToCartProduct = (product, qty = 1) => {
        addToCart(product, qty);
    };

    const products = productsArray
    const Portfolios = [
    
        {
            Pimg: pImg1,
        },
        {
            Pimg: pImg2,
        },
        {
            Pimg: pImg3,
        },
        {
            Pimg: pImg4,
        },
        {
            Pimg: pImg5,
        },
        {
            Pimg: pImg6,
        }
     ]
    return (
        <Fragment>
            <Navbar hclass={'wpo-site-header-s1'} />
            <Hero4 />
            <About2 />
            <ServiceSectionS2 />
            {/* <FunFactS2 fnTpClass={'funfact-wrap-sec'} fnClass={'wpo-fun-fact-section-s4'}/> */}
            <FunFactVideo props={"/blog1.pmh"} />         
            {/* <BlogSection /> */}
            <ServiceSectionS3 />
            <PortfolioSection props={Portfolios} />
            <BookSection />
            <Footer />
            <Scrollbar />
        </Fragment>
    )
};
export default HomePage2;