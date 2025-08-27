import Nav from "../../components/layout/Nav.jsx";
import SideBar from "../../components/layout/SideBar.jsx";
import { Outlet } from "react-router-dom";
import ScreenSizeAlert from "../../components/layout/ScreenSizeAlert.jsx";
import useScreenResize from "../../hooks/useScreenResize.js";

function Admin() {
  const showScreenAlert = useScreenResize();
  return (
    <div className="bg-primary z-10 ">
      {showScreenAlert && <ScreenSizeAlert />}
      <Nav />
      <main className="w-full h-full bg-[#EEE] rounded-t-[30px] flex items-start justify-end px-2 py-4 gap-4">
        <Outlet />
        <SideBar role="admin" />
      </main>
    </div>
  );
}

export default Admin;
