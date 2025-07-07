import React from "react";
import Header from "../header/Header";
import Logo from "../../images/logo.png";
import { useMenu } from "../../context/MenuContext";

export default function Navbar(props) {
  const [scroll, setScroll] = React.useState(0);
  const { menuActive, setMenuActive } = useMenu();

  const handleScroll = () => setScroll(document.documentElement.scrollTop);

  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const className = scroll > 80 ? "fixed-navbar active" : "fixed-navbar";

  return (
    <div className={className}>
      <Header hclass={props.hclass} Logo={Logo} topbarNone={props.topbarNone} />
    </div>
  );
}
