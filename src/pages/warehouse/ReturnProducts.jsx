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
import DataTableEditRow from "../../components/table/DataTableEditRow";
import Swal from "sweetalert2";
import ProductsSalesTable from "../../components/table/ProductsSalesTable";

const formatting = (unFormattedData) => {
  const rowsData = unFormattedData?.map((p) => {
    return {
      id: p.product.id,
      profilePhoto: p.product.category_name == "Phone" ? phone : accessor,
      barcode: p.product.qr_code ? p.product.qr_code : "لايوجد",
      productName: p.product.product_name,
      type: p.product.category_name == "Phone" ? "موبايل" : "إكسسوار",
      sellingPrice: currencyFormatting(p.product.selling_price),
      wholesalePrice: currencyFormatting(p.product.wholesale_price),
      totalQuantity: p.quantity,
      retrievedQuantity: 0,
      options: <ButtonComponent />,
    };
  });
  return rowsData;
};

const formatBranches = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    title: `${d.number} ${d.city_name}`,
  }));
  return data;
};

function ReturnProducts() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [rowSelectionID, setRowSelectionID] = useState([]);

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleBranchSelect = (e) => {
    const { value } = e;
    setSelectedBranch(value);
  };

  const handleClickBack = useGoToBack();

  const getSelectedProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      for (let i = 0; i < rowSelectionID.length; i++) {
        const response = await axiosPrivate.get(
          `/products/branch?branch__id=${selectedBranch}&product__id=${rowSelectionID[i]}`
        );
        const formattedProduct = formatting(response?.data?.results);
        setSelectedProducts((prev) => [...prev, ...formattedProduct]);
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
      branch: selectedBranch,
      movement_type: false,
      transported_product: [
        ...selectedProducts.map((p) => {
          return {
            product: p.id,
            quantity: p.retrievedQuantity,
          };
        }),
      ],
    };
    const transportProducts = () => {
      Swal.fire({
        title: "هل أنت متأكد من عملية إستعادة المنتجات",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          axiosPrivate
            .post("/products/transport", JSON.stringify(sendProducts))
            .then(() => {
              Swal.fire({
                title: "تمت عملية الإستعادة بنجاح",
                icon: "success",
              });
              setSelectedProducts([]);
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في إستعادة المنتجات",
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
      field: "retrievedQuantity",
      headerName: "الكمية المراد إستعادتها",
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
      headerName: "الكمية",
      flex: 1,
    },
  ];

  useEffect(() => {
    getBranches();
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إعادة منتجات:"} />
      <section
        className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow"
        onClick={() => {
          console.log(selectedBranch, branches);
        }}
      >
        <div className="w-full">
          <SectionTitle text={"اختر الفرع:"} />
          <div className="flex items-start justify-center">
            <DropDownComponent
              data={branches}
              label={"إستعادة من فرع:"}
              ButtonText={"الفرع"}
              id={"product"}
              dataValue="id"
              dataTitle="title"
              onSelectEvent={handleBranchSelect}
            />
          </div>
        </div>
        {selectedBranch && (
          <div className="w-full flex flex-col items-end justify-center mb-4">
            <SectionTitle text={"اختر منتجات الفرع المراد إستعادتها:"} />
            <div className="w-full flex flex-col items-center justify-center gap-4">
              <ProductsSalesTable
                columns={columns}
                handleSelectProduct={handleSelectProduct}
                rowSelectionID={rowSelectionID}
                branchID={selectedBranch}
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
        )}
        <div className="w-full flex flex-col items-center justify-start">
          {selectedProducts.length > 0 && (
            <SectionTitle
              text={`المنتجات المختارة: فرع ${
                branches.filter((b) => b.id == selectedBranch)[0]?.title
              }`}
            />
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
            disabled={selectedProducts.length <= 0}
          />
        </div>
      </section>
    </main>
  );
}

export default ReturnProducts;
