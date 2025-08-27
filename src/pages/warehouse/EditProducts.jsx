import { useEffect, useReducer, useState } from "react";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import currencyFormatting from "../../util/currencyFormatting";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import NoDataError from "../../components/actions/NoDataError";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import DataTablePagination from "../../components/table/DataTablePagination";
import SectionTitle from "../../components/titles/SectionTitle";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import NumberInputComponent from "../../components/inputs/NumberInputComponent";
import TextShowBlue from "../../components/inputs/TextShowBlue";
import Swal from "sweetalert2";
import useGoToBack from "../../hooks/useGoToBack";

const formatting = (unFormattedData) => {
  const rowsData = {
    id: unFormattedData.id,
    profilePhoto: unFormattedData.category_name == "Phone" ? phone : accessor,
    barcode: unFormattedData.qr_code ? unFormattedData.qr_code : "لايوجد",
    productName: unFormattedData.product_name,
    type: unFormattedData.category_name == "Phone" ? "موبايل" : "إكسسوار",
    sellingPrice: currencyFormatting(unFormattedData.selling_price),
    wholesalePrice: currencyFormatting(unFormattedData.wholesale_price),
    quantity: unFormattedData.quantity,
    options: <ButtonComponent />,
  };
  return rowsData;
};

const initProductInfo = {
  product: null,
  wholesale_price: "",
  selling_price: "",
  quantity: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCT":
      return { ...state, product: action.payload };
    case "SET_WHOLESALE_PRICE":
      return { ...state, wholesale_price: action.payload };
    case "SET_SELLING_PRICE":
      return { ...state, selling_price: action.payload };
    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };
    case "SET_ALL":
      return { ...action.payload };
    default:
      return state;
  }
};

function EditProducts() {
  const productIDs = useLocationState("productsIDs");
  const [products, setProducts] = useState([]);
  const [productQuantity, setProductQuantity] = useState("");
  const [productTotalQuantity, setProductTotalQuantity] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const [productInfo, dispatch] = useReducer(reducer, initProductInfo);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    dispatch({ type: `SET_${id.toUpperCase()}`, payload: value });
  };

  const handleProductQuantity = (event) => {
    const { value } = event;
    dispatch({ type: "SET_QUANTITY", payload: value });
  };

  const updateProduct = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد من عملية تعديل البيانات؟",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedProductInfo = { entered_products: [productInfo] };
        axiosPrivate
          .post(`/products/enter_products`, JSON.stringify(updatedProductInfo))
          .then(() => {
            Swal.fire({
              title: "تمت عملية التعديل بنجاح",
              icon: "success",
            });
            setProducts(products.filter((p) => p.id != id));
            dispatch({ type: "SET_ALL", payload: initProductInfo });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "خطأ في تعديل بيانات هذا المنتج",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const getProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      for (let i = 0; i < productIDs.length; i++) {
        const response = await axiosPrivate.get(`/products/${productIDs[i]}`);
        const formattedProduct = formatting(response?.data);
        setProducts((prev) => [...prev, formattedProduct]);
      }
    } catch (error) {
      console.log(error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
    }
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
            variant={"edit"}
            textButton="تعديل"
            small={true}
            onClick={() => handleClickEdit(params.row)}
          />
        );
      },
    },
  ];

  const handleClickEdit = (rowInfo) => {
    const productInfo = {
      product: rowInfo.id,
      wholesale_price: rowInfo.wholesalePrice
        .match(/[\d,]+/)[0]
        .replace(/,/g, ""),
      selling_price: rowInfo.sellingPrice.match(/[\d,]+/)[0].replace(/,/g, ""),
      quantity: "",
    };
    setProductQuantity(rowInfo.quantity);
    dispatch({ type: "SET_ALL", payload: productInfo });
  };

  useEffect(() => {
    const totalQuantity = productInfo.quantity + productQuantity;
    setProductTotalQuantity(totalQuantity);
  }, [productInfo.quantity, productQuantity]);

  useEffect(() => {
    getProducts();
  }, []);
  
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={" تعديل المنتجات :"} />
      <div
        className="w-full flex items-center flex-row-reverse gap-2 mb-4"
        onClick={() => console.log(productInfo)}
      >
        <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-[400px]">
              <LoadingSpinner />
            </div>
          ) : errorProducts ? (
            <NoDataError error={errorProducts} />
          ) : (
            <DataTablePagination columns={columns} rows={products} />
          )}
          {productInfo.product != null && (
            <>
              <SectionTitle
                text={`تعديل المنتج: ${
                  products?.find((p) => p?.id == productInfo?.product)
                    ?.productName
                }`}
              />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-start justify-between gap-4">
                  <TextShowBlue label="الكمية:" value={productQuantity} />
                  <NumberInputComponent
                    label={"إضافة كمية:"}
                    id={"quantity"}
                    value={productInfo?.quantity}
                    onChange={handleProductQuantity}
                  />
                  <TextShowBlue
                    label="الكمية الإجمالية:"
                    value={productTotalQuantity}
                  />
                </div>
                <div className="flex flex-col items-start justify-start gap-4">
                  <TextInputComponent
                    label={"سعر التكلفة:"}
                    id={"wholesale_price"}
                    dir={"ltr"}
                    value={productInfo?.wholesale_price}
                    onChangeEvent={handleInputChange}
                  />
                  <TextInputComponent
                    label={"سعر المبيع:"}
                    id={"selling_price"}
                    dir={"ltr"}
                    value={productInfo?.selling_price}
                    onChangeEvent={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex items-center justify-end gap-4 w-full">
            <ButtonComponent variant={"back"} onClick={handleClickBack} />
            {productInfo.product != null && (
              <ButtonComponent
                variant={"edit"}
                onClick={() => {
                  updateProduct(productInfo?.product);
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default EditProducts;
