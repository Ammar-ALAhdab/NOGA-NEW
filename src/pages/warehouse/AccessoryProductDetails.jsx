import Title from "../../components/titles/Title";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useReducer, useState } from "react";
import Swal from "sweetalert2";
import useToast from "../../hooks/useToast";
import { useNavigate, useParams } from "react-router-dom";
import useGoToBack from "../../hooks/useGoToBack";
import TextShowBlue from "../../components/inputs/TextShowBlue";

const dropDownData = [{ id: 2, type: "إكسسوار" }];

const initDetailsSittings = {
  show: false,
  value: "",
  title: "",
  inputLabel: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCT_NAME":
      return { ...state, product_name: action.payload };
    case "SET_WHOLESALE_PRICE":
      return { ...state, wholesale_price: action.payload };
    case "SET_SELLING_PRICE":
      return { ...state, selling_price: action.payload };
    case "SET_QUANTITY":
      return { ...state, quantity: action.payload };
    case "SET_CATEGORY_TYPE":
      return { ...state, category_type: action.payload };
    case "SET_PHONE_DETAIL":
      return { ...state, phone: { ...state.phone, ...action.payload } };
    case "SET_INITIAL_DETAILS":
      return { ...action.payload };
    default:
      return state;
  }
};

function AccessoryProductDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState([]);
  const [addDetailsSettings, setDetailsSettings] =
    useState(initDetailsSittings);
  const [scrollTop, setScrollTop] = useState(0);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const { ProductId } = useParams();
  const navigate = useNavigate();

  const updateDetailsSettings = (settingObject) => {
    setDetailsSettings((prevState) => ({
      ...prevState,
      ...settingObject,
    }));
  };

  const updateDetailsValue = (value) => {
    setDetailsSettings((prevState) => ({
      ...prevState,
      value,
    }));
  };

  const handleAddingDetails = () => {
    addDetails(addDetailsSettings);
    handleCloseAddBox();
  };

  const getDetails = async () => {
    try {
      const response = await axiosPrivate.get("/accessories_categories");
      setCategory((prev) => [...prev, ...response.data.results]);
      if (response.data.next) {
        getDetails(response.data.next);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addDetails = async (detail) => {
    try {
      await axiosPrivate.post(
        `/accessories_categories`,
        JSON.stringify({ category_name: detail.value })
      );
      setCategory([]);
      getDetails();
      setDetailsSettings(initDetailsSittings);
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 400) {
        const errorMassage = error?.response?.data;
        const arr = [];
        Object.entries(errorMassage).forEach(([fieldName, messages]) => {
          const errorMessage = fieldName + " " + messages.join(" ");
          arr.push(errorMessage);
        });
        Toast.fire({
          icon: "error",
          title: `${arr.join(" ")}`,
        });
      }
      if (error?.response?.status === 403) {
        const errorMassage = error?.response?.data?.detail;
        Toast.fire({
          icon: "error",
          title: `${errorMassage}`,
        });
      }
    }
  };

  const handleShowAddBox = (title, inputLabel, type) => {
    updateDetailsSettings({ show: true, title, inputLabel, type });
    document.body.style.overflow = "hidden";
    setScrollTop(document.documentElement.scrollTop);
    document.documentElement.scrollTop = 0;
  };

  const handleCloseAddBox = () => {
    updateDetailsSettings({ show: false });
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  const [accessoryState, dispatch] = useReducer(reducer, {});

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    dispatch({ type: `SET_${id.toUpperCase()}`, payload: value });
  };

  const handleProductTypeChange = (event) => {
    const { value } = event;
    dispatch({ type: "SET_CATEGORY_TYPE", payload: value });
  };

  const handlePhoneDetailChange = (event) => {
    const { id, value } = event.target;
    dispatch({ type: "SET_PHONE_DETAIL", payload: { [id]: value } });
  };

  const handlePhoneEventData = (event) => {
    const { id, value } = event;
    dispatch({ type: `SET_PHONE_DETAIL`, payload: { [id]: value } });
  };

  const getProductDetails = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(`/products/${productId}`);
      const productData = response?.data;
      delete productData.phone;
      console.log(productData);
      dispatch({ type: `SET_INITIAL_DETAILS`, payload: productData });
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
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
          .delete(`/products/${ProductId}`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
            navigate(-1, { replace: true });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذا المنتج",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const updateProduct = async () => {
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
        axiosPrivate
          .put(`/products/${ProductId}`, JSON.stringify(accessoryState))
          .then(() => {
            Swal.fire({
              title: "تمت عملية التعديل بنجاح",
              icon: "success",
            });
            console.log(accessoryState);
            navigate(-1, { replace: true });
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

  useEffect(() => {
    getDetails();
    getProductDetails(ProductId);
  }, []);

  const handlePrintImage = () => {
    const imageWindow = window.open("", "_blank");
    imageWindow.document.write(
      `<img
        src=${accessoryState.qr_codes_download}
        style="max-width: 100%; height: auto;"
      />`
    );
    setTimeout(() => {
      imageWindow.print();
    }, 1000);
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`معلومات المنتج ${accessoryState?.product_name}:`} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <NoDataError />
        ) : (
          <>
            {/* ################################### Start Add Box ################################### */}
            <div
              className="absolute my-filter-box flex flex-col items-center justify-center w-full h-full p-4 z-[200]"
              style={{
                opacity: addDetailsSettings.show ? 1 : 0,
                visibility: addDetailsSettings.show ? "visible" : "hidden",
              }}
            >
              <div className="flex flex-col items-center justify-center gap-2 relative w-fit pl-8 pr-8 pb-8 pt-4 rounded-3xl bg-white my-box-shadow">
                <SectionTitle text={addDetailsSettings?.title} />
                <button
                  className="absolute top-3 left-3 w-8 h-8 bg-halloweenOrange text-white z-100 rounded-full"
                  onClick={handleCloseAddBox}
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
                <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
                  <TextInputComponent
                    label={addDetailsSettings?.inputLabel}
                    value={addDetailsSettings.value}
                    onChange={updateDetailsValue}
                  />
                  <ButtonComponent onClick={handleAddingDetails} />
                </div>
              </div>
            </div>
            {/* ################################### END Add Box ################################### */}
            <div className="w-full">
              <SectionTitle text={"معلومات المنتج العامة:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-end justify-start gap-4">
                  <TextShowBlue
                    value={accessoryState?.quantity}
                    label={"الكمية:"}
                  />
                  <TextInputComponent
                    label={"سعر التكلفة:"}
                    id={"wholesale_price"}
                    dir={"ltr"}
                    value={accessoryState?.wholesale_price}
                    onChangeEvent={handleInputChange}
                  />
                  <TextInputComponent
                    label={"سعر المبيع:"}
                    id={"selling_price"}
                    dir={"ltr"}
                    value={accessoryState?.selling_price}
                    onChangeEvent={handleInputChange}
                  />
                </div>
                <div className="flex flex-col items-start justify-start gap-4">
                  <TextInputComponent
                    label={"اسم المنتج:"}
                    id={"product_name"}
                    value={accessoryState?.product_name}
                    onChangeEvent={handleInputChange}
                  />
                  <DropDownComponent
                    data={dropDownData}
                    dataValue={"id"}
                    dataTitle={"type"}
                    ButtonText={"اختر النوع"}
                    label={"النوع:"}
                    onSelectEvent={handleProductTypeChange}
                    value={accessoryState?.category_type}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"معلومات المنتج التفصيلية:"} />
              {/* Barcode */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex items-center justify-end w-full gap-4">
                  <ButtonComponent
                    variant={"show"}
                    textButton={"طباعة ملصقات الباركود"}
                    onClick={handlePrintImage}
                  />
                </div>
                <div className="flex items-center justify-end w-full gap-4">
                  <div className="flex items-center justify-end w-full gap-4">
                    <img src={accessoryState.qr_code} alt="الباركود" />
                    <p className="ar-txt">الباركود:</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-end gap-4">
                  <ButtonComponent
                    textButton={"إضافة تصنيف جديد للإكسسوار"}
                    onClick={() =>
                      handleShowAddBox(
                        "إضافة تصنيف للإكسسوار:",
                        "التصنيف:",
                        "category_name"
                      )
                    }
                  />
                </div>
                <div className="flex flex-col items-center justify-start gap-4">
                  <DropDownComponent
                    data={category}
                    dataTitle={"category_name"}
                    dataValue={"id"}
                    label={"تصنيف الإكسسوار:"}
                    ButtonText="اختر التصنيف"
                    value={accessoryState?.accessory?.accessory_category}
                    onSelectEvent={handlePhoneEventData}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"الوصف:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-start justify-center gap-4"></div>
                <div className="flex flex-col items-end justify-center gap-4">
                  <TextAreaComponent
                    id={"description"}
                    value={accessoryState?.accessory?.description}
                    onChange={handlePhoneDetailChange}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 w-full mt-8">
              <ButtonComponent variant={"back"} onClick={handleClickBack} />
              <ButtonComponent variant={"delete"} onClick={deleteProduct} />
              <ButtonComponent
                variant={"edit"}
                textButton="حفظ التعديلات"
                onClick={updateProduct}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default AccessoryProductDetails;
