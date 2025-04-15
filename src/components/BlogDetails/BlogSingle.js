import React from 'react';
import { Link } from 'react-router-dom'
import blog3 from '../../images/blog-details/comments-author/img-1.jpg'
import blog4 from '../../images/blog-details/comments-author/img-2.jpg'
import blog5 from '../../images/blog-details/comments-author/img-3.jpg'
import blog6 from '../../images/blog-details/author.jpg'
import gl1 from '../../images/blog/img-3.jpg'
import gl2 from '../../images/blog/img-2.jpg'
import blogs from '../../api/blogs';
import { useParams } from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar.js'

const BlogSingle = (props) => {

    const { slug } = useParams()

    const BlogDetails = blogs.find(item => item.slug === slug)

    const submitHandler = (e) => {
        e.preventDefault()
    }

    const images = {
        "Photo 1": "../../images/blog/1.jpeg",

    };
    const videos = {
        "Video 1": "https://www.youtube.com/watch?v=7_WxOdeCv9k",
    };
    const renderContent = (text) => {
        return text.split(/(Photo \d+|Video \d+)/).map((part, index) => {
            if (images[part]) {
                return <img key={index} src={images[part]} alt={part} className="w-full my-4 rounded-lg shadow-md" />;
            } else if (videos[part]) {
                return (
                    <video key={index} controls className="w-full my-4 rounded-lg shadow-md">
                        <source src={videos[part]} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            } else {
                return <p key={index} className="text-gray-800">{part}</p>;
            }
        });
    };


    return (
        <section className="wpo-blog-single-section section-padding">
            <div className="container">
                <div className="row">
                    <div className={`col col-lg-12 col-12 `}>
                        <div className="wpo-blog-content">
                            <div className="post format-standard-image">
                                <div className="entry-media">
                                    <img src={BlogDetails.screens} alt="" />

                                </div>

                                <div className='post2' >

                                    {/* <div className="entry-meta p-2 mt-3">
                                        <ul>
                                            <li><i className="fi flaticon-user"></i> By <Link to="/blog-single/support-progressive-change">{BlogDetails.author}</Link> </li>
                                            <li><i className="fi flaticon-comment-white-oval-bubble"></i> Comments {BlogDetails.comment}</li>
                                            <li><i className="fi flaticon-calendar"></i> {BlogDetails.date}</li>
                                        </ul>
                                    </div> */}
                                    <h2 className='pt-5'>{BlogDetails.title}</h2>

                                    {/* <p>{BlogDetails.description}</p> */}
                                    {/* <blockquote>
                                    Combined with a handful of model sentence structures, generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.
                                </blockquote> */}<>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.description}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2 ">
                                        {BlogDetails.des2}
                                    </div>
                                   <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des3}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des4}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des5}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des7}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des8}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des9}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des10}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des11}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des12}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des13}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des14}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des15}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des16}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des17}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des18}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des19}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des20}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des21}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des22}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des23}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des24}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des25}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des26}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des27}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des28}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des29}
                                    </div>
                                    <div className="max-w-2xl mx-auto p-2">
                                        {BlogDetails.des30}
                                    </div>
                                    </>
                                    
                                </div>

                                
                            </div>

                           

                       

                       

                           
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )

}

export default BlogSingle;
