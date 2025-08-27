import axios from "../api/axios";
import useAuth from "../auth/useAuth";
import { useCookies } from "react-cookie";

const useRefreshToken = () => {
  const { setAuth } = useAuth();
  const [cookies] = useCookies(["refreshToken"]);
  const refresh = async () => {
    const response = await axios.post(
      "/refresh",
      JSON.stringify({ refresh: cookies?.refreshToken })
    );
    setAuth((prev) => {
      return {
        ...prev,
        accessToken: response.data.access,
      };
    });
    return response.data.access;
  };
  return refresh;
};

export default useRefreshToken;
