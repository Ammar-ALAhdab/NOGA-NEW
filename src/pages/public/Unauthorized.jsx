import { useLocation, useNavigate } from "react-router-dom";
import unauthorized from "../../assets/general/unauthorized.svg";
import { useState, useEffect } from "react";

function Unauthorized() {
  const location = useLocation();
  const [counter, setCounter] = useState(10);
  const navigate = useNavigate();
  const from = location.state?.from?.pathname;
  useEffect(() => {
    const timer = setInterval(() => {
      if (counter > 0) {
        setCounter((prevCounter) => prevCounter - 1);
      } else {
        navigate("/", { replace: true });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [counter, navigate]);
  return (
    <div
      id="error-page"
      className="flex justify-center items-center errBg bg-center w-full h-svh flex-col text-gray-800 gap-4 bg-[#af91d6]"
    >
      <img src={unauthorized} alt="error_icon" width={300} height={300} />
      <div className="flex justify-center items-center flex-col gap-2">
        <h1 className="ar-txt text-6xl">ماذا يحدث!</h1>
        <p className="text-lg">
          ! <span className="font-bold">{from}</span> المعذرة، لا يحق لك الوصول
          إلى هذه الصفحة
        </p>
        <p className="text-lg">
          <span className="font-bold">{counter}</span>
          {"  "}سوف يتم إعادة توجهيك إلى صفحة تسجيل الدخول بعد
        </p>
      </div>
    </div>
  );
}

export default Unauthorized;
