import { Navigate, useLocation, Outlet } from "react-router-dom";
import useAuth from "./useAuth";
import { useCookies } from "react-cookie";
import PropTypes from "prop-types";

function RequireAuth({ allowedRole }) {
  const { auth } = useAuth();
  const location = useLocation();
  const [cookies, ,] = useCookies(["role"]);
  return allowedRole.includes(cookies?.role) ? (
    <Outlet />
  ) : auth?.username ? (
    <Navigate to={"/unauthorized"} state={{ from: location }} replace />
  ) : (
    <Navigate to={"/"} state={{ from: location }} replace />
  );
}

RequireAuth.propTypes = {
  allowedRole: PropTypes.array,
};

export default RequireAuth;
