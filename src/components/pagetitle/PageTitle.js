const PageTitle = (props) => {
  const isMobile = window.innerWidth <= 768;
  const height = props.pageTitle !== "" ? "100px" : "0px";
  const marginBottom = props.pageTitle !== "" ? "1rem" : "1rem";
  return (
    <section className="wpo-page-title" style={{ minHeight: height, marginBottom }}>
      <div className={`${isMobile ? "container" : "mt-5"}`}>
        <div className="row">
          <div className="col col-xs-12">
            <div className="wpo-breadcumb-wrap">
              <h2 className={`${isMobile ? "m-0" : "mt-5"}`}>{props.pageTitle}</h2>
              <ol className="wpo-breadcumb-wrap"></ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
