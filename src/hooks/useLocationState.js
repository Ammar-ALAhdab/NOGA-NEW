import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const useLocationState = (stateKey) => {
  const location = useLocation();
  const stateValue = location.state ? location.state[stateKey] : undefined;
  const [state, setState] = useState(stateValue);

  useEffect(() => {
    setState(stateValue);
  }, [stateValue]);

  return state;
};

export default useLocationState;
