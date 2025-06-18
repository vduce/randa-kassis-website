import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage4 from "../HomePage4/HomePage4";
import AboutPage from "../AboutPage/AboutPage";
import CampaignPage from "../CampaignPage/CampaignPage";
import CampaignPageS2 from "../CampaignPageS2/CampaignPageS2";
import CampaignPageS3 from "../CampaignPageS3/CampaignPageS3";
import CampaignSinglePage from "../CampaignSinglePage/CampaignSinglePage";
import TestimonialPage from "../TestimonialPage/TestimonialPage";
import TeamPage from "../TeamPage/TeamPage";
import TeamSinglePage from "../TeamSinglePage/TeamSinglePage";
import ServicePage from "../ServicePage/ServicePage";
import ServiceSinglePage from "../ServiceSinglePage/ServiceSinglePage";
import GalleryPage from "../GalleryPage/GalleryPage";
import BlogPage from "../BlogPage/BlogPage";
import BlogPageLeft from "../BlogPageLeft/BlogPageLeft";
import BlogDetails from "../BlogDetails/BlogDetails";
import BlogDetailsFull from "../BlogDetailsFull/BlogDetailsFull";
import BlogDetailsLeftSiide from "../BlogDetailsLeftSiide/BlogDetailsLeftSiide";
import ContactPage from "../ContactPage/ContactPage";
import ErrorPage from "../ErrorPage/ErrorPage";
import FaqPage from "../FaqPage";
import VolunteerPage from "../VolunteerPage/VolunteerPage";
import DonatePage from "../DonatePage/DonatePage";
import PrivacyPage from "../PrivacyPage/PrivacyPage";
import TermsPage from "../TermsPage/TermsPage";
import Media from "../Media/Media";
import ServicePageFullwidth from "../BlogPageFullwidth copy/servicePageFullwidth";
import ArticlesFullwidth from "../ArticlesPage/ArticlesFull";
import ArticleDetails from "../ArticlesPage/ArticleDetails";
import MyStory from "../MyStory/MyStory";
import Paintings from "../Paintings/Paintings";
import ExibitionMoments from "../ExhibitionMoment/ExibitionMoments";
import EncAndDialFullWidth from "../EncounterAndDialoguePage/EncAndDialFull";
import EncAndDialDetails from "../EncounterAndDialoguePage/EncAndDialDetails";
import ThePainter from "../Interview/ThePainter";
import TheCriticsLayout from "../Interview/TheCritics/TheCriticsLayout";
import TheCriticsDetail from "../Interview/TheCritics/TheCriticsDetail";

const AllRoute = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage4 />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="campaign" element={<CampaignPage />} />
          <Route path="campaign-2" element={<CampaignPageS2 />} />
          <Route path="campaign-3" element={<CampaignPageS3 />} />
          <Route path="campaign-single/:slug" element={<CampaignSinglePage />} />
          <Route path="service" element={<ServicePage />} />
          <Route path="blog/:slug" element={<ServiceSinglePage />} />
          <Route path="story/:sectionId" element={<MyStory />} />
          <Route path="beyondPolitics/the-politician/:sectionId" element={<Paintings />} />
          <Route
            path="beyondPolitics/the-essayist-the-critic/:sectionId"
            element={<ExibitionMoments />}
          />
          <Route path="my-story" element={<MyStory />} />
          <Route path="testimonial" element={<TestimonialPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="team-single/:slug" element={<TeamSinglePage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="volunteer" element={<VolunteerPage />} />
          <Route path="donate" element={<DonatePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog-left-sidebar" element={<BlogPageLeft />} />
          <Route path="articles" element={<ArticlesFullwidth />} />
          <Route path="encounter-and-dialogue" element={<EncAndDialFullWidth />} />
          <Route path="conference-and-symposium" element={<ServicePageFullwidth />} />
          <Route path="blog-single/:slug" element={<BlogDetails />} />
          <Route path="article-single/:id" element={<ArticleDetails />} />
          <Route path="encounter-and-dialogue-single/:id" element={<EncAndDialDetails />} />
          <Route path="blog-single-left-sidebar/:slug" element={<BlogDetailsLeftSiide />} />
          <Route path="blog-single-fullwidth/:slug" element={<BlogDetailsFull />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="media" element={<Media />} />
          <Route path="interview/the-painter" element={<ThePainter />} />
          <Route path="interview/the-essayist-the-critic" element={<TheCriticsLayout />} />
          <Route path="critics-single/:id" element={<TheCriticsDetail />} />
          <Route path="404" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default AllRoute;
