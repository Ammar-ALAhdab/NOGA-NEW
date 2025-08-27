import { useState } from "react";
import images from "../../assets/login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUnlockKeyhole, faUser } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../auth/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useCookies } from "react-cookie";
import useToast from "../../hooks/useToast";
import ScreenSizeAlert from "../../components/layout/ScreenSizeAlert.jsx";
import useScreenResize from "../../hooks/useScreenResize.js";

const LOGIN_URL = "/employees/login";

const LOGIN_PATH = {
  admin: "admin",
  CEO: "admin",
  Manager: "branchManager",
  HR: "HR",
  "Warehouse Administrator": "warehouseAdmin",
  "Sales Officer": "salesOfficer",
};

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["refreshToken"]);
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const Toast = useToast();
  const showScreenAlert = useScreenResize();

  // const validatePassword = (password) => {
  //   // Password must be at least 8 characters long, include upper case, lower case,
  //   //  and numeric characters
  //   // const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  //   const regex = /^[a-zA-z]+[0-9]+$/;
  //   return regex.test(password);
  // };

  const handlePasswordChange = (event) => {
    const newPassword = event.target.value;
    setPassword(newPassword);
    // setPasswordValid(validatePassword(newPassword));
    setPasswordValid(newPassword);
  };
  // ####################################### IMPORTANT #######################################
  // I will store refresh token and role in cookies :-(
  // because the back-end doesn't support store refresh token in Http only secure cookies
  // ####################################### IMPORTANT #######################################
  const handleSetCookie = (cookieName, cookieValue) => {
    setCookie(cookieName, cookieValue, { maxAge: 24 * 60 * 60 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        LOGIN_URL,
        JSON.stringify({ username, password })
      );

      console.log(response?.data);
      const accessToken = response?.data?.access;
      const refreshToken = response?.data?.refresh;
      const role = response?.data?.role;
      const branchID = response?.data?.branch ? response?.data?.branch : "";
      const name = response?.data?.name ? response?.data?.name : "";
      const branchName = response?.data?.branch_name
        ? response?.data?.branch_name
        : "";
      const image = response?.data?.image ? response?.data?.image : "";
      // Store user information in locale storage
      if (role == "Sales Officer" || role == "Manager") {
        localStorage.setItem("branchID", JSON.stringify(branchID));
        localStorage.setItem("branchName", JSON.stringify(branchName));
      }
      localStorage.setItem("name", JSON.stringify(name ? name : null));
      localStorage.setItem("image", JSON.stringify(image ? image : null));
      // delete the previous cookie
      cookies?.refreshToken ? removeCookie("refreshToken") : null;
      cookies?.role ? removeCookie("role") : null;
      handleSetCookie("refreshToken", refreshToken);
      handleSetCookie("role", role);
      await setAuth({ username, accessToken });
      setUsername("");
      setPassword("");
      const from = location.state?.from?.pathname || `/${LOGIN_PATH[role]}`;
      navigate(from, { replace: true });
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 400) {
        setUsername("");
        setPassword("");
        Toast.fire({
          icon: "error",
          title: "يرجى تعبئة حقل اسم المستخدم أو كلمة المرور",
        });
      }

      if (error?.response?.status === 401) {
        setUsername("");
        setPassword("");
        Toast.fire({
          icon: "error",
          title: "يرجى التحقق من اسم المستخدم أو كلمة المرور",
        });
      }
      if (error?.code === "ERR_NETWORK") {
        setUsername("");
        setPassword("");
        Toast.fire({
          icon: "error",
          title: "لا يوجد اتصال مع الخادم",
        });
      }
    }
  };
  return (
    <>
      <main className="w-full h-screen flex bg-white overflow-hidden">
        {showScreenAlert && <ScreenSizeAlert />}

        <div className="w-2/3 h-full flex justify-center items-center relative rectangle">
          <img
            src={images.img}
            alt="secure login"
            className="z-10 xlg:w-[500px] xlg:h-[500px] md:w-[400px] md:h-[400px]"
          />
        </div>
        <div className="xlg:w-1/3 md:w-1/2 h-full flex justify-between items-center flex-col px-8 pt-8 pb-4">
          <div className="flex justify-center items-center flex-col gap-8 w-full h-full">
            <img
              src={images.profile}
              alt="profile picture"
              width={100}
              height={100}
            />
            <h1 dir="rtl" className="text-[32px] text-primary ">
              مرحبا بك!
            </h1>
            <form
              onSubmit={handleSubmit}
              action=""
              className="flex justify-center items-center flex-col gap-8 w-full"
            >
              <div className="w-full relative">
                <input
                  type="text"
                  id="username"
                  value={username}
                  autoFocus
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="username"
                  className="relative w-full h-[50px] [border:none] [outline:none] bg-[#eee] rounded-[50px] py-2 px-12 placeholder:text-gray-400 text-[20px] focus:outline focus:outline-2 focus:outline-primary"
                />
                <FontAwesomeIcon
                  icon={faUser}
                  size="lg"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
                />
              </div>
              <div className="w-full">
                <div className="w-full relative mb-2">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    placeholder="password"
                    className={`w-full h-[50px]  [border:none] [outline:none] bg-[#eee] rounded-[50px] py-2 px-12 placeholder:text-gray-400 text-[20px] focus:outline focus:outline-2 ${
                      !passwordValid
                        ? "focus:outline-red-500"
                        : "focus:outline-primary"
                    } `}
                  />
                  <FontAwesomeIcon
                    icon={faUnlockKeyhole}
                    size="lg"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary"
                  />
                </div>

                {password && !passwordValid && (
                  <div className="text-red-500 text-[10px] w-full px-4">
                    Password must be at least 8 characters long and include a
                    number, and both uppercase and lowercase letters.
                  </div>
                )}
                {password && passwordValid && (
                  <div className="text-green-500 text-[12px] w-full px-4 text-left">
                    Password looks good!
                  </div>
                )}
              </div>
              <input
                type="button"
                value="تسجيل الدخول"
                className="w-full h-[50px] border-solid [outline:none] cursor-pointer bg-primary text-white rounded-[50px] py-2 px-4 text-lg disabled:bg-[#9ea9d1] focus:border-blue-800 hover:border-blue-800 hover:border-2  focus:border-2 "
                // disabled={!passwordValid || username == ""}
                onClick={handleSubmit}
              />
            </form>
          </div>
          <p className="text-[#aaa] text-sm">NOGA Software © 2024</p>
        </div>
      </main>
    </>
  );
}

export default Login;
