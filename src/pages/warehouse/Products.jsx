import { useState } from "react";
import Title from "../../components/titles/Title";
import ProductsTable from "../../components/table/ProductsTable";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";

function ProductsCopy() {
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const navigate = useNavigate();
  const handleClickAdd = () => {
    navigate("addProduct");
  };

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
      field: "wholesalePrice",
      headerName: "سعر التكلفة",
      width: 150,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
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
      <Title text={" قائمة منتجات المستودع المركزي:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <ButtonComponent variant={"add"} onClick={handleClickAdd} />
        {rowSelectionID.length > 0 && (
          <ButtonComponent
            textButton="تعديل المنتجات المحددة"
            variant={"edit"}
            onClick={() => {
              navigate("editProducts", {
                state: { productsIDs: rowSelectionID },
              });
            }}
          />
        )}
      </div>
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        <ProductsTable
          handleSelectProduct={handleSelectProduct}
          rowSelectionID={rowSelectionID}
          columns={columns}
        />
      </section>
    </main>
  );
}

export default ProductsCopy;
