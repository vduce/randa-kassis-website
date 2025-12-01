import React, { useState } from "react";
import SimpleReactValidator from "simple-react-validator";

const ContactForm = () => {
  const [forms, setForms] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });
  const [validator] = useState(
    new SimpleReactValidator({
      className: "errorMessage",
    })
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const changeHandler = (e) => {
    setForms({ ...forms, [e.target.name]: e.target.value });
    if (validator.allValid()) {
      validator.hideMessages();
    } else {
      validator.showMessages();
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validator.allValid()) {
      validator.showMessages();
      return;
    }

    setSubmitting(true);
    setResult(null);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/office@randakassis.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (response.ok) {
        setResult({ success: true, message: "Message sent successfully!" });
        setForms({
          name: "",
          email: "",
          subject: "",
          phone: "",
          message: "",
        });
        validator.hideMessages();
      } else {
        setResult({ success: false, message: json.message || "An error occurred." });
      }
    } catch (error) {
      console.error("Submission error:", error);
      setResult({ success: false, message: "An error occurred while sending the message." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="contact-validation-active" noValidate>
      <div className="row">
        <input type="hidden" name="_subject" value={`New submission from ${forms.name}`}></input>
        <input type="hidden" name="_template" value="basic"></input>
        <input type="hidden" name="_captcha" value="false"></input>

        <div className="col col-lg-6 col-12">
          <div className="form-field">
            <input
              value={forms.name}
              type="text"
              name="name"
              onBlur={(e) => changeHandler(e)}
              onChange={(e) => changeHandler(e)}
              placeholder="Your Name"
            />
            {validator.message("name", forms.name, "required|alpha_space")}
          </div>
        </div>
        <div className="col col-lg-6 col-12">
          <div className="form-field">
            <input
              value={forms.email}
              type="email"
              name="email"
              onBlur={(e) => changeHandler(e)}
              onChange={(e) => changeHandler(e)}
              placeholder="Your Email"
            />
            {validator.message("email", forms.email, "required|email")}
          </div>
        </div>
        <div className="col col-lg-6 col-12">
          <div className="form-field">
            <input
              value={forms.phone}
              type="phone"
              name="phone"
              onBlur={(e) => changeHandler(e)}
              onChange={(e) => changeHandler(e)}
              placeholder="Your phone"
            />
            {validator.message("phone", forms.phone, "required|phone")}
          </div>
        </div>
        <div className="col col-lg-12 col-12">
          <textarea
            onBlur={(e) => changeHandler(e)}
            onChange={(e) => changeHandler(e)}
            value={forms.message}
            type="text"
            name="message"
            placeholder="Message"
          ></textarea>
          {validator.message("message", forms.message, "required")}
        </div>
      </div>
      <div className="submit-area">
        <button type="submit" className="theme-btn" disabled={submitting}>
          {submitting ? "Sending..." : "Submit Now"}
        </button>
        {result && <p className={`result-message ${result.success ? "success" : "error"}`}>{result.message}</p>}
      </div>
    </form>
  );
};

export default ContactForm;
