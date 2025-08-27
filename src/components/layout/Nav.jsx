// import { faBell } from "@fortawesome/free-solid-svg-icons";
// import { faMoon } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import noga_logo from "../../assets/general/noga_logo_white.svg";

function Nav() {
  return (
    <nav className="w-full h-[54px] bg-primary flex justify-between items-center pl-8 pr-2 py-2">
      <img src={noga_logo} alt="NOGA Logo" height={40} width={100} />
      <div className="w-[15%] flex justify-center items-center gap-8 text-white">
        {/* <FontAwesomeIcon icon={faBell} size="lg" className="cursor-pointer" />
        <FontAwesomeIcon icon={faMoon} size="lg" className="cursor-pointer" /> */}
      </div>
    </nav>
  );
}

export default Nav;
