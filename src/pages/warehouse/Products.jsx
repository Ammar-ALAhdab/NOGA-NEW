import { useState } from "react";
import Title from "../../components/titles/Title";
import ProductsTable from "../../components/table/ProductsTable";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

function ProductsCopy() {
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleClickAdd = () => {
    navigate("addProduct");
  };

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleClickGotoVariant = (variantId) => {
    navigate(`variant/${variantId}`);
  };

  const handleDeleteVariant = (variantId, refresh) => {
    Swal.fire({
      title: "هل أنت متأكد من عملية الحذف؟",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/products/variants/${variantId}`)
          .then(() => {
            Swal.fire({ title: "تم الحذف", icon: "success" });
            if (typeof refresh === "function") refresh();
          })
          .catch(() => {
            Swal.fire({
              title: "خطأ",
              text: "لا يمكن حذف هذه النسخة",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
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
      width: 200,
      sortable: false,
      renderCell: (params) => {
        // params.id corresponds to variant id from /products/variants
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            <ButtonComponent
              variant={"show"}
              small={true}
              onClick={() => handleClickGotoVariant(params.id)}
            />
            <ButtonComponent
              variant={"delete"}
              small={true}
              onClick={() =>
                handleDeleteVariant(params.id, () => window.location.reload())
              }
            />
          </div>
        );
      },
    },
  ];

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={" قائمة منتجات المستودع المركزي:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <ButtonComponent variant={"add"} onClick={handleClickAdd} />
        <ButtonComponent
          textButton="عرض المنتجات الرئيسية"
          variant={"show"}
          onClick={() => navigate("/warehouseAdmin/mainProducts")}
        />
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
