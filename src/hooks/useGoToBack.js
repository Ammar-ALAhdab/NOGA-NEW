import { useNavigate } from "react-router-dom";

const useGoToBack = () => {
  const navigate = useNavigate();
  const handleClickBack = () => {
    navigate(-1);
  };
  return handleClickBack;
};

export default useGoToBack;
