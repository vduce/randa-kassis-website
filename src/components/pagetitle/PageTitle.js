import React from "react";

const PageTitle = (props) => {
  const height = props.pageTitle !== "" ? "200px" : "100px";
  const marginBottom = props.pageTitle !== "" ? "1rem" : "4rem";
  return (
    <section
      className="wpo-page-title"
      style={{ minHeight: height, marginBottom }}
    >
      <div className="container">
        <div className="row">
          <div className="col col-xs-12">
            <div className="wpo-breadcumb-wrap">
              <h2 className="mt-5">{props.pageTitle}</h2>
              <ol className="wpo-breadcumb-wrap">
                {/* <li><Link to="/home">Home</Link></li> */}
                {/* <li><span>{props.pagesub}</span></li> */}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
