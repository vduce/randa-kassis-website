import React, { Fragment } from "react";
import PageTitle from "../../components/pagetitle/PageTitle.js";
import Scrollbar from "../../components/scrollbar/scrollbar.js";
import Footer from "../../components/footer/Footer.js";
import Navbar from "../../components/Navbar/Navbar.js";
import encounterAndDialogues from "../../api/encounterAndDialogue.json";
import EdList from "../../components/EncounterAndDialogue/EdList.js";

const EncAndDialFullWidth = () => {
  return (
    <Fragment>
      <Navbar hclass={"wpo-site-header-s1"} />
      <PageTitle pageTitle={""} pagesub={"Blog"} />
      <EdList
        blLeft={"d-none"}
        blRight={"col-lg-10 offset-lg-1 col-12"}
        services={encounterAndDialogues.articles}
      />
      <Footer />
      <Scrollbar />
    </Fragment>
  );
};
export default EncAndDialFullWidth;
