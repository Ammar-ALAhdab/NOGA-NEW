import { useEffect, useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
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

const formatting = (unFormattedData) => {
  const rawCategory =
    unFormattedData?.category_name || unFormattedData?.category || "";
  const isPhone =
    typeof rawCategory === "string" && rawCategory.toLowerCase() === "phone";
  const rowsData = {
    id: unFormattedData.id,
    profilePhoto: isPhone ? phone : accessor,
    barcode: unFormattedData.qr_code ? unFormattedData.qr_code : "لايوجد",
    productName: unFormattedData.product_name || unFormattedData.product,
    type: rawCategory,
    sellingPrice: currencyFormatting(unFormattedData.selling_price),
    wholesalePrice: currencyFormatting(unFormattedData.wholesale_price),
    totalQuantity: unFormattedData.quantity,
    sku:unFormattedData.sku,
    sendQuantity: 0,
    options: <ButtonComponent />,
  };
  return rowsData;
};

const formatBranches = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    title: `${d.number} ${d.city_name}`,
  }));
  return data;
};

function SendProducts() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const [branches, setBranches] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [rowSelectionID, setRowSelectionID] = useState([]);

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleSourceSelect = (e) => {
    const { value } = e;
    setSelectedSource(value);
  };

  const handleDestinationSelect = (e) => {
    const { value } = e;
    setSelectedDestination(value);
  };

  const handleClickBack = useGoToBack();

  const getSelectedProducts = async () => {
    if(!selectedSource){
      try {
        setLoadingProducts(true);
        setErrorProducts(null);
  
        for (let i = 0; i < rowSelectionID.length; i++) {
          const response = await axiosPrivate.get(
            `/products/variants/${rowSelectionID[i]}`
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
    }
    else{
      try {
        setLoadingProducts(true);
        setErrorProducts(null);
  
        for (let i = 0; i < rowSelectionID.length; i++) {
          const response = await axiosPrivate.get(
            `/products/variants/${rowSelectionID[i]}`
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
    }
  };

  const ShowSelectedProducts = () => {
    setSelectedProducts([]);
    getSelectedProducts();
  };

  const getBranches = async (url = "/branches") => {
    try {
      const response = await axiosPrivate.get(url);
      const formattedData = formatBranches(response.data.results);
      setBranches((prev) => [...prev, ...formattedData]);
      if (response.data.next) {
        getBranches(response.data.next);
      }
    } catch (error) {
      console.error(error);
    }
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

  const handleSendProducts = () => {
    const sendProducts = {
      source: selectedSource,
      destination : selectedDestination,
      transported_products: [
        ...selectedProducts.map((p) => {
          return {
            product: p.id,
            quantity: p.sendQuantity,
          };
        }),
      ],
    };
    const transportProducts = () => {
      Swal.fire({
        title: "هل أنت متأكد من عملية إرسال المنتجات",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        console.log(sendProducts);
        
        if (result.isConfirmed) {
          axiosPrivate
            .post("/products/transportations", sendProducts)
            .then(() => {
              Swal.fire({
                title: "تمت عملية الإرسال بنجاح",
                icon: "success",
              });
              setSelectedProducts([]);
            })
            .catch((error) => {
              console.error(error , error.message);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في إرسال المنتجات",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    transportProducts();
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
      field: "sku",
      headerName: "المعرف",
      width: 150,
    },
    {
      field: "type",
      headerName: "النوع",
      width: 100,
    },
    {
      field: "wholesalePrice",
      headerName: "سعر التكلفة",
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
      headerName: "الكمية المراد إرسالها",
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
      field: "sku",
      headerName: "المعرف",
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
      headerName: "الكمية المتوفرة",
      flex: 1,
    },
  ];

  useEffect(() => {
    getBranches();
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إرسال منتجات:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow">
        <div className="w-full">
          <SectionTitle text={"اختر الفرع:"} />
          <div className="flex items-start justify-center py-5">
            <DropDownComponent
              data={branches}
              label={"إرسال من فرع:"}
              ButtonText={"الفرع"}
              id={"product"}
              dataValue="id"
              dataTitle="title"
              onSelectEvent={handleSourceSelect}
            />
          </div>
          <div className="flex items-start justify-center py-5">
            <DropDownComponent
              data={branches}
              label={"إرسال إلى فرع:"}
              ButtonText={"الفرع"}
              id={"product"}
              dataValue="id"
              dataTitle="title"
              onSelectEvent={handleDestinationSelect}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-end justify-center mb-4">
          <SectionTitle text={"اختر المنتجات:"} />
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
        <div className="flex items-center justify-between gap-4 w-full mt-8">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"procedure"}
            onClick={handleSendProducts}
            disabled={selectedProducts.length == 0}
          />
        </div>
      </section>
    </main>
  );
}

export default SendProducts;
