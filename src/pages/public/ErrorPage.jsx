import { useLocation } from "react-router-dom";
import error_icon from "../../assets/general/error_icon.svg";

export default function ErrorPage() {
  const location = useLocation();

  return (
    <div
      id="error-page"
      className="flex justify-center items-center errBg bg-center w-full h-svh flex-col text-gray-800 gap-4 bg-[#7c96f7]"
    >
      <img src={error_icon} alt="error_icon" width={300} height={300} />
      <div className="flex justify-center items-center flex-col gap-2">
        <h1 className="ar-txt text-6xl">ماذا يحدث!</h1>
        <p className="text-lg">
          !لأنه غير موجود على الخادم{" "}
          <span className="font-bold">{location.pathname}</span>{" "}
          المعذرة لا يمكن الوصول إلى
        </p>
      </div>
    </div>
  );
}
