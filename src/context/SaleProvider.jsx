import { createContext, useState } from "react";
import PropTypes from "prop-types";

const SaleContext = createContext();

export const SaleProvider = ({ children }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Debug logging for context changes
  console.log("🏪 SaleProvider - selectedProducts updated:", selectedProducts);
  console.log(
    "🏪 SaleProvider - selectedProducts length:",
    selectedProducts.length
  );

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
