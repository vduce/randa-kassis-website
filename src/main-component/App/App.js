import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllRoute from "../router";
const App = () => {
  return (
    <div className="App" id="scrool">
      <AllRoute />
      <ToastContainer />
    </div>
  );
};

export default App;
