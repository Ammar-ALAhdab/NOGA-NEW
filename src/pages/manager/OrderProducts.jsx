import { useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import currencyFormatting from "../../util/currencyFormatting";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import ProductsTable from "../../components/table/ProductsTable";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import Swal from "sweetalert2";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";

const formatting = (unFormattedData) => {
  const rowsData = {
    id: unFormattedData.id,
    profilePhoto: unFormattedData.category_name == "Phone" ? phone : accessor,
    barcode: unFormattedData.qr_code ? unFormattedData.qr_code : "لايوجد",
    productName: unFormattedData.product_name,
    type: unFormattedData.category_name == "Phone" ? "موبايل" : "إكسسوار",
    sellingPrice: currencyFormatting(unFormattedData.selling_price),
    wholesalePrice: currencyFormatting(unFormattedData.wholesale_price),
    totalQuantity: unFormattedData.quantity,
    sendQuantity: 0,
    options: <ButtonComponent />,
  };
  return rowsData;
};

function OrderProducts() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const [description, setDescription] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const branchID = JSON.parse(localStorage.getItem("branchID"));

  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleClickBack = useGoToBack();

  const getSelectedProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      for (let i = 0; i < rowSelectionID.length; i++) {
        const response = await axiosPrivate.get(
          `/products/${rowSelectionID[i]}`
        );
        const formattedProduct = formatting(response?.data);
        setSelectedProducts((prev) => [...prev, formattedProduct]);
      }
    } catch (error) {
      console.log(error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const ShowSelectedProducts = () => {
    setSelectedProducts([]);
    getSelectedProducts();
  };

  const updateFunction = (newRow) => {
    setSelectedProducts(
      selectedProducts.map((row) => (row.id === newRow.id ? newRow : row))
    );
  };

  const deleteFunction = (id) => {
    const updatedSelectedProducts = selectedProducts.filter((p) => p.id != id);
    setSelectedProducts(updatedSelectedProducts);
  };

  const handleOrderProducts = () => {
    const OrderedProducts = {
      branch_id: branchID,
      note: description,
      requests: [
        ...selectedProducts.map((p) => {
          return {
            product_id: p.id,
            quantity: p.sendQuantity,
          };
        }),
      ],
    };
    const orderProducts = () => {
      Swal.fire({
        title: "هل أنت متأكد من عملية طلب المنتجات",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          axiosPrivate
            .post("/products/request", JSON.stringify(OrderedProducts))
            .then(() => {
              Swal.fire({
                title: "تمت عملية الطلب بنجاح، في انتظار المعالجة",
                icon: "success",
              });
              console.log(OrderedProducts);
              setSelectedProducts([]);
              setDescription("");
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في إرسال الطلب",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    orderProducts();
  };

  const selectedProductsColumns = [
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
      width: 100,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
      width: 100,
    },

    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      flex: 1,
    },
    {
      field: "sendQuantity",
      headerName: "الكمية المطلوبة",
      flex: 1,
      editable: true,
      type: "number",
    },
  ];

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
      headerName: "سعر المبيع",
      width: 150,
    },

    {
      field: "quantity",
      headerName: "الكمية المتوفرة",
      flex: 1,
    },
  ];

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"طلب المنتجات:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow">
        <div className="w-full flex flex-col items-end justify-center mb-4">
          <SectionTitle text={"اختر المنتجات من المستودع المركزي:"} />
          <div className="w-full flex flex-col items-center justify-center gap-4">
            <ProductsTable
              handleSelectProduct={handleSelectProduct}
              rowSelectionID={rowSelectionID}
              columns={columns}
            />
          </div>
          <div className="w-full flex flex-col items-center justify-center gap-4 pt-8">
            <ButtonComponent
              textButton="عرض المنتجات المختارة"
              variant={"show"}
              onClick={ShowSelectedProducts}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-start">
          {selectedProducts.length > 0 && (
            <SectionTitle text={"المنتجات المختارة:"} />
          )}
          {selectedProducts.length ? (
            loadingProducts ? (
              <div className="flex justify-center items-center h-[400px]">
                <LoadingSpinner />
              </div>
            ) : errorProducts ? (
              <NoDataError error={errorProducts} />
            ) : (
              <DataTableEditRow
                columns={selectedProductsColumns}
                rows={selectedProducts}
                updateFunction={updateFunction}
                deleteFunction={deleteFunction}
                dir={"rtl"}
              />
            )
          ) : null}
        </div>
        <div className="w-full">
          <SectionTitle text={"إضافة ملاحظة:"} />
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-start justify-center gap-4"></div>
            <div className="flex flex-col items-end justify-center gap-4">
              <TextAreaComponent
                id={"description"}
                value={description}
                onChange={handleChangeDescription}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 w-full mt-8">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"procedure"}
            onClick={handleOrderProducts}
            disabled={selectedProducts.length <= 0}
          />
        </div>
      </section>
    </main>
  );
}

export default OrderProducts;
