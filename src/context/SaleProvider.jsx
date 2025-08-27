import { createContext, useState } from "react";
import PropTypes from "prop-types";

const SaleContext = createContext();

export const SaleProvider = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  return (
    <SaleContext.Provider
      value={{
        selectedProducts,
        setSelectedProducts,
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};

SaleProvider.propTypes = {
  children: PropTypes.any,
};

export default SaleContext;
