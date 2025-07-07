import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AllRoute from "../router";
import { useSwipeable } from "react-swipeable";
import { MenuProvider, useMenu } from "../../context/MenuContext";

const AppContent = () => {
  const { menuActive, setMenuActive } = useMenu();

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!menuActive) setMenuActive(true);
    },
    onSwipedLeft: () => {
      if (menuActive) setMenuActive(false);
    },
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="App" id="scrool" {...swipeHandlers} style={{ minHeight: "100vh" }}>
      <AllRoute />
      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <MenuProvider>
      <AppContent />
    </MenuProvider>
  );
};

export default App;
