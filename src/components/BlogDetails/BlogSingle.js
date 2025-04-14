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
                                    {/* <div className="gallery">
                                    <div>
                                        <img src={BlogDetails.screens} alt="" />
                                    </div>
                                    <div>
                                        <img src={BlogDetails.otherimg} alt="" />
                                    </div>
                                </div> */}
                                {/* <div className="tag-share clearfix">
                                    <div className="tag">
                                        <span>Tag: </span>
                                        <ul>
                                            <li><Link to="/blog-single/support-progressive-change">Election</Link></li>
                                            <li><Link to="/blog-single/support-progressive-change">Vote</Link></li>
                                            <li><Link to="/blog-single/support-progressive-change">Political</Link></li>
                                        </ul>
                                    </div>
                                </div> */}
                                </div>

                                
                            </div>

                            {/* <div className="tag-share-s2 clearfix">
                                <div className="tag">
                                    <span>Share: </span>
                                    <ul>
                                        <li><Link to="/blog-single/support-progressive-change">facebook</Link></li>
                                        <li><Link to="/blog-single/support-progressive-change">twitter</Link></li>
                                        <li><Link to="/blog-single/support-progressive-change">linkedin</Link></li>
                                        <li><Link to="/blog-single/support-progressive-change">pinterest</Link></li>
                                    </ul>
                                </div>
                            </div> */}

                            {/* <div className="author-box">
                                <div className="author-avatar">
                                    <Link to="/blog-single/support-progressive-change" target="_blank"><img src={blog6} alt="" /></Link>
                                </div>
                                <div className="author-content">
                                    <Link to="/blog-single/support-progressive-change" className="author-name">Author: Randa Kassis </Link>
                                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.</p>
                                    <div className="socials">
                                        <ul className="social-link">
                                            <li><Link to="/blog-single/support-progressive-change"><i className="ti-facebook"></i></Link></li>
                                            <li><Link to="/blog-single/support-progressive-change"><i className="ti-twitter-alt"></i></Link></li>
                                            <li><Link to="/blog-single/support-progressive-change"><i className="ti-linkedin"></i></Link></li>
                                            <li><Link to="/blog-single/support-progressive-change"><i className="ti-instagram"></i></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div> */}

                            {/* <div className="more-posts">
                                <div className="previous-post">
                                    <Link to="/blog">
                                        <span className="post-control-link">Previous Post</span>
                                        <span className="post-name">At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.</span>
                                    </Link>
                                </div>
                                <div className="next-post">
                                    <Link to="/blog-left-sidebar">
                                        <span className="post-control-link">Next Post</span>
                                        <span className="post-name">Dignissimos ducimus qui blanditiis praesentiu deleniti atque corrupti quos dolores</span>
                                    </Link>
                                </div>
                            </div> */}

                            {/* <div className="comments-area">
                                <div className="comments-section">
                                    <h3 className="comments-title">Comments</h3>
                                    <ol className="comments">
                                        <li className="comment even thread-even depth-1" id="comment-1">
                                            <div id="div-comment-1">
                                                <div className="comment-theme">
                                                    <div className="comment-image"><img src={blog3} alt="" /></div>
                                                </div>
                                                <div className="comment-main-area">
                                                    <div className="comment-wrapper">
                                                        <div className="comments-meta">
                                                            <h4>John Abraham <span className="comments-date">January 12,2022
                                                                At 9.00am</span></h4>
                                                        </div>
                                                        <div className="comment-area">
                                                            <p>I will give you a complete account of the system, and
                                                                expound the actual teachings of the great explorer of
                                                                the truth, </p>
                                                            <div className="comments-reply">
                                                                <Link className="comment-reply-link" to="/blog-single/support-progressive-change"><span>Reply</span></Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <ul className="children">
                                                <li className="comment">
                                                    <div>
                                                        <div className="comment-theme">
                                                            <div className="comment-image"><img src={blog4} alt="" /></div>
                                                        </div>
                                                        <div className="comment-main-area">
                                                            <div className="comment-wrapper">
                                                                <div className="comments-meta">
                                                                    <h4>Lily Watson <span className="comments-date">January
                                                                        12,2022 At 9.00am</span></h4>
                                                                </div>
                                                                <div className="comment-area">
                                                                    <p>I will give you a complete account of the system,
                                                                        and expound the actual teachings of the great
                                                                        explorer of the truth, </p>
                                                                    <div className="comments-reply">
                                                                        <Link className="comment-reply-link" to="/blog-single/support-progressive-change"><span>Reply</span></Link>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ul>
                                                        <li className="comment">
                                                            <div>
                                                                <div className="comment-theme">
                                                                    <div className="comment-image"><img src={blog5} alt="" /></div>
                                                                </div>
                                                                <div className="comment-main-area">
                                                                    <div className="comment-wrapper">
                                                                        <div className="comments-meta">
                                                                            <h4>John Abraham <span className="comments-date">January
                                                                                12,2022 At 9.00am</span></h4>
                                                                        </div>
                                                                        <div className="comment-area">
                                                                            <p>I will give you a complete account of the
                                                                                system, and expound the actual teachings
                                                                                of the great explorer of the truth, </p>
                                                                            <div className="comments-reply">
                                                                                <Link className="comment-reply-link" to="/blog-single/support-progressive-change"><span>Reply</span></Link>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                        <li className="comment">
                                            <div>
                                                <div className="comment-theme">
                                                    <div className="comment-image"><img src={blog3} alt="" /></div>
                                                </div>
                                                <div className="comment-main-area">
                                                    <div className="comment-wrapper">
                                                        <div className="comments-meta">
                                                            <h4>John Abraham <span className="comments-date">January 12,2022
                                                                At 9.00am</span></h4>
                                                        </div>
                                                        <div className="comment-area">
                                                            <p>I will give you a complete account of the system, and
                                                                expound the actual teachings of the great explorer of
                                                                the truth, </p>
                                                            <div className="comments-reply">
                                                                <Link className="comment-reply-link" to="/blog-single/support-progressive-change"><span>Reply</span></Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    </ol>
                                </div>
                                <div className="comment-respond">
                                    <h3 className="comment-reply-title">Post Comments</h3>
                                    <form onSubmit={submitHandler} id="commentform" className="comment-form">
                                        <div className="form-textarea">
                                            <textarea id="comment" placeholder="Write Your Comments..."></textarea>
                                        </div>
                                        <div className="form-inputs">
                                            <input placeholder="Website" type="url" />
                                            <input placeholder="Name" type="text" />
                                            <input placeholder="Email" type="email" />
                                        </div>
                                        <div className="form-submit">
                                            <input id="submit" value="Post Comment" type="submit" />
                                        </div>
                                    </form>
                                </div>
                            </div> */}
                        </div>
                    </div>
                    {/* <BlogSidebar blLeft={props.blLeft}/> */}
                </div>
            </div>
        </section>
    )

}

export default BlogSingle;
