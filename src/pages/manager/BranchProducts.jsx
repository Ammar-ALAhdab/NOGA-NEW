import Title from "../../components/titles/Title";
import ProductsSalesTable from "../../components/table/ProductsSalesTable";
import { useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function BranchProducts({ manager = false }) {
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const navigate = useNavigate();
  const branchID = JSON.parse(localStorage.getItem("branchID"));
  const branchName = JSON.parse(localStorage.getItem("branchName"));
  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleClickGotoProductById = (productId, type) => {
    const toProduct =
      type == "موبايل" ? `phone/${productId}` : `accessory/${productId}`;
    navigate(toProduct, {
      state: { product: productId },
    });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "profilePhoto",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <img
              src={params.row.profilePhoto}
              alt="profile"
              width={60}
              height={60}
              className="rounded-[50%] border-2 border-primary"
            />
          </div>
        );
      },
    },
    {
      field: "productName",
      headerName: "اسم المنتج",
      width: 150,
    },
    {
      field: "type",
      headerName: "النوع",
      flex: 1,
    },
    {
      field: "sellingPrice",
      headerName: "السعر",
      width: 150,
    },
    {
      field: "quantity",
      headerName: "الكمية",
      flex: 1,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (
          <ButtonComponent
            variant={"show"}
            small={true}
            onClick={() =>
              handleClickGotoProductById(params.id, params.row.type)
            }
          />
        );
      },
    },
  ];
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={`قائمة منتجات فرع ${branchName}:`} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        {rowSelectionID.length > 0 && (
          <ButtonComponent
            textButton="إجراء عملية بيع"
            variant={"purchases"}
            onClick={() => {
              navigate("/salesOfficer/makeSale", {
                state: { productsIDs: rowSelectionID },
              });
            }}
          />
        )}
      </div>
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        <ProductsSalesTable
          columns={columns}
          hideSelectRows={manager}
          handleSelectProduct={handleSelectProduct}
          rowSelectionID={rowSelectionID}
          branchID={branchID}
        />
      </section>
    </main>
  );
}

BranchProducts.propTypes = {
  manager: PropTypes.bool,
};

export default BranchProducts;
