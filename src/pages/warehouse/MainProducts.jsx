import { useState } from "react";
import Title from "../../components/titles/Title";
import MainProductsTable from "../../components/table/MainProductsTable";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

function MainProducts() {
  const [rowSelectionID, setRowSelectionID] = useState([]);

  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const handleClickAdd = () => {
    navigate("addProduct");
  };

  const handleDeleteProduct = (productId, refresh) => {
    Swal.fire({
      title: "هل أنت متأكد من عملية حذف المنتج؟",
      text: "سيتم حذف جميع النسخ المرتبطة بهذا المنتج",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/products/${productId}`)
          .then(() => {
            Swal.fire({ title: "تم الحذف", icon: "success" });
            if (typeof refresh === "function") refresh();
          })
          .catch(() => {
            Swal.fire({
              title: "خطأ",
              text: "لا يمكن حذف هذا المنتج",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "profilePhoto",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center items-center h-full">
          <img
            src={params.row.profilePhoto}
            alt="profile"
            width={60}
            height={60}
            className="rounded-[50%] border-2 border-primary"
          />
        </div>
      ),
    },
    {
      field: "productName",
      headerName: "اسم المنتج",
      width: 130,
    },
    {
      field: "category",
      headerName: "النوع",
      width: 110,
    },
    {
      field: "totalQuantity",
      headerName: "إجمالي الكمية",
      width: 110,
    },
    {
      field: "minWholesalePrice",
      headerName: "أقل سعر تكلفة",
      width: 110,
    },
    {
      field: "minSellingPrice",
      headerName: "أقل سعر مبيع",
      width: 110,
    },
    {
      field: "maxSellingPrice",
      headerName: "أعلى سعر مبيع",
      width: 110,
    },
    {
      field: "variantsCount",
      headerName: "عدد النسخ",
      width: 80,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 350,
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center justify-center gap-2 h-full">
          <ButtonComponent
            textButton="عرض النسخ"
            variant="show"
            small={true}
            onClick={() =>
              navigate(`/warehouseAdmin/mainProducts/${params.row.id}`)
            }
          />
          <ButtonComponent
            textButton="ربط منتجات"
            variant="add"
            small={true}
            onClick={() => navigate(`linkProducts/${params.row.id}`)}
          />
          {/* <ButtonComponent
            textButton="إضافة نسخة"
            variant="add"
            small={true}
            onClick={() => navigate(`addProduct?product=${params.row.id}`)}
          /> */}
          <ButtonComponent
            textButton="حذف"
            variant="delete"
            small={true}
            onClick={() =>
              handleDeleteProduct(params.row.id, () => {
                // Refresh the table
                window.location.reload();
              })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"المنتجات الرئيسية:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <ButtonComponent variant={"add"} onClick={handleClickAdd} />
        {rowSelectionID.length > 0 && (
          <ButtonComponent
            textButton="حذف المنتجات المحددة"
            variant={"delete"}
            onClick={() => {
              // Handle bulk delete
              Swal.fire({
                title: "هل أنت متأكد من عملية الحذف؟",
                text: `سيتم حذف ${rowSelectionID.length} منتج(ات)`,
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "لا",
                confirmButtonColor: "#E76D3B",
                cancelButtonColor: "#3457D5",
                confirmButtonText: "نعم",
              }).then((result) => {
                if (result.isConfirmed) {
                  // Implement bulk delete logic here
                  console.log("Deleting products:", rowSelectionID);
                }
              });
            }}
          />
        )}
      </div>
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        <MainProductsTable
          handleSelectProduct={handleSelectProduct}
          rowSelectionID={rowSelectionID}
          columns={columns}
          link="/products"
        />
      </section>
    </main>
  );
}

export default MainProducts;
