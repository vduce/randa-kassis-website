import React from 'react';
import {Link} from 'react-router-dom'
import BlogSidebar from '../BlogSidebar/BlogSidebar.js'
import VideoModal from '../ModalVideo/VideoModal'

import blogs from '../../api/blogs'


const ClickHandler = () =>{
    window.scrollTo(10, 0);
 }

const BlogList = (props) => {
    return(
        <section className="wpo-blog-pg-section section-padding">
            <div className="container">
                <div className="row">
                    <div className={`col col-lg-5 col-5 ${props.blRight}`}>
                        <div className="wpo-blog-content">
                            {blogs.slice(0,23).map((blog, bitem) => (
                                <div className={`post  ${blog.blClass} max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg`}key={bitem}>
                                    {/* <div className="entry-media video-holder">
                                        <img src={blog.screens} alt=""/>
                                        <VideoModal/>
                                    </div> */}
                                    <div className="entry-meta">
                                        <ul>
                                            {/* <li><i className="fi flaticon-user"></i> By <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`}>{blog.authorTitle}</Link> </li> */}
                                            <li><i className="fi flaticon-comment-white-oval-bubble"></i> Comments {blog.comment} </li>
                                            <li><i className="fi flaticon-calendar"></i> {blog.date}</li>
                                        </ul>
                                    </div>
                                    <div className="entry-details">
                                        <h3>{blog.title}</h3>
                                        <p className=''>{blog.description}</p>
                                        <Link onClick={ClickHandler} to={`/blog-single/${blog.slug}`} className="read-more">READ MORE...</Link>
                                    </div>
                                </div>
                            ))}

                            {/* <div className="pagination-wrapper pagination-wrapper-left">
                                <ul className="pg-pagination">
                                    <li>
                                        <Link to="/blog-left-sidebar" aria-label="Previous">
                                            <i className="fi ti-angle-left"></i>
                                        </Link>
                                    </li>
                                    <li className="active"><Link to="/blog-left-sidebar">1</Link></li>
                                    <li><Link to="/blog-left-sidebar">2</Link></li>
                                    <li><Link to="/blog-left-sidebar">3</Link></li>
                                    <li>
                                        <Link to="/blog-left-sidebar" aria-label="Next">
                                            <i className="fi ti-angle-right"></i>
                                        </Link>
                                    </li>
                                </ul>
                            </div> */}
                        </div>
                    </div>
                    {/* <BlogSidebar blLeft={props.blLeft}/> */}
                </div>
            </div>
        </section>

     )
        
}

export default BlogList;
