import React from "react";
import ContactForm from "../ContactFrom/ContactForm";

const Contactpage = () => {
  return (
    <section className="wpo-contact-pg-section section-padding">
      <div className="container">
        <div className="row">
          <div className="col col-lg-10 offset-lg-1">
            <div className="wpo-contact-title">
              <h2>Have Any Question?</h2>
              <p>It is a long established fact that a reader will be distracted content of a page when looking.</p>
            </div>
            <div className="wpo-contact-form-area mb-5">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contactpage;
