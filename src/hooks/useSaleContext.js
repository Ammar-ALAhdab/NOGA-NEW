import { useContext } from "react";
import SaleContext from "../context/SaleProvider";

const useSaleContext = () => {
  return useContext(SaleContext);
};

export default useSaleContext;
