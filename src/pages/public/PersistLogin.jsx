import { useState, useEffect } from "react";
import useRefreshToken from "../../hooks/useRefreshToken";
import useAuth from "../../auth/useAuth";
import { Outlet } from "react-router-dom";
import LoadingPage from "../../components/actions/LoadingPage";

function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth } = useAuth();
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);
  }, [auth?.accessToken, refresh]);

  return <>{isLoading ? <LoadingPage /> : <Outlet />}</>;
}

export default PersistLogin;
