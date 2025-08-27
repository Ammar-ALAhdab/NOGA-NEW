import ButtonComponent from "../../components/buttons/ButtonComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import NumberInputComponent from "../../components/inputs/NumberInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import CheckInputComponent from "../../components/inputs/CheckInputComponent";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import { useEffect, useReducer, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import useToast from "../../hooks/useToast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const dropDownData = [
  { id: 1, type: "موبايل" },
  { id: 2, type: "إكسسوار" },
];

const initDetailsSittings = {
  show: false,
  value: "",
  type: "",
  title: "",
  inputLabel: "",
};

const DETAILS_BODY_REQUEST = {
  phone_brands: "brand_name",
  cpus: "CPU_brand",
  colors: "color",
  accessories_categories: "category_name",
};

const productPhoneInfo = {
  product_name: "",
  wholesale_price: "",
  selling_price: "",
  quantity: 0,
  category_type: "",
  phone: {
    CPU_name: "",
    RAM: "",
    storage: "",
    battery: "",
    sim: 0,
    display_size: "",
    sd_card: false,
    description: "",
    release_date: "",
    brand_id: "",
    CPU_id: "",
    color_id: "",
    phone_cameras: [],
  },
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
    case "ADD_CAMERA":
      return {
        ...state,
        phone: {
          ...state.phone,
          phone_cameras: [...state.phone.phone_cameras, action.payload],
        },
      };
    default:
      return state;
  }
};

function AddProduct() {
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [frontCameraComponentCount, setFrontCameraComponentCount] = useState(0);
  const [backCameraComponentCount, setBackCameraComponentCount] = useState(0);
  //START: THIS STATES FOR ADDING BRAND MANUFACTURE, CPU OR COLOR
  const [addDetailsSettings, setDetailsSettings] =
    useState(initDetailsSittings);
  const [scrollTop, setScrollTop] = useState(0);
  const [brands, setBrands] = useState([]);
  const [CPUS, setCPUS] = useState([]);
  const [colors, setColors] = useState([]);
  const [accessoriesCategories, setAccessoriesCategories] = useState([]);
  //END: THIS STATES FOR ADDING BRAND MANUFACTURE, CPU OR COLOR

  //START: THIS LOGIC FOR ADDING BRAND MANUFACTURE, CPU OR COLOR

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

  const getDetails = async (link, storeData) => {
    try {
      const response = await axiosPrivate.get(link);
      if (storeData == "phone_brands") {
        setBrands((prev) => [...prev, ...response.data.results]);
      } else if (storeData == "cpus") {
        setCPUS((prev) => [...prev, ...response.data.results]);
      } else if (storeData == "colors") {
        setColors((prev) => [...prev, ...response.data.results]);
      } else if (storeData == "accessories_categories") {
        setAccessoriesCategories((prev) => [...prev, ...response.data.results]);
      }
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
        `/${detail.type}`,
        JSON.stringify({ [DETAILS_BODY_REQUEST[detail.type]]: detail.value })
      );
      if (detail.type == "phone_brands") {
        setBrands([]);
      } else if (detail.type == "cpus") {
        setCPUS([]);
      } else if (detail.type == "colors") {
        setColors([]);
      } else if (detail.type == "accessories_categories") {
        setAccessoriesCategories([]);
      }
      getDetails(`/${detail.type}`, detail.type);
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
    console.log(colors);
  };

  const handleCloseAddBox = () => {
    updateDetailsSettings({ show: false });
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  useEffect(() => {
    getDetails("/phone_brands", "phone_brands");
    getDetails("/cpus", "cpus");
    getDetails("/colors", "colors");
    getDetails("/accessories_categories", "accessories_categories");
  }, []);

  //END: THIS LOGIC FOR ADDING BRAND MANUFACTURE, CPU OR COLOR

  const [accessoryCategory, setAccessoryCategory] = useState("");
  const [phoneState, dispatch] = useReducer(reducer, productPhoneInfo);

  const [arrayOfFrontCameras, setArrayOfFrontCameras] = useState([
    { camera_resolution: "", main: false },
    { camera_resolution: "", main: false },
    { camera_resolution: "", main: false },
  ]);

  const [arrayOfBackCameras, setArrayOfBackCameras] = useState([
    { camera_resolution: "", main: true },
    { camera_resolution: "", main: true },
    { camera_resolution: "", main: true },
    { camera_resolution: "", main: true },
    { camera_resolution: "", main: true },
  ]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    dispatch({ type: `SET_${id.toUpperCase()}`, payload: value });
  };

  const handleProductTypeChange = (event) => {
    const { value } = event;
    dispatch({ type: "SET_CATEGORY_TYPE", payload: value });
  };

  const handleProductQuantity = (event) => {
    const { value } = event;
    dispatch({ type: "SET_QUANTITY", payload: value });
  };

  const handlePhoneDetailChange = (event) => {
    const { id, value } = event.target;
    dispatch({ type: "SET_PHONE_DETAIL", payload: { [id]: value } });
  };

  const handlePhoneEventData = (event) => {
    const { id, value } = event;
    dispatch({ type: `SET_PHONE_DETAIL`, payload: { [id]: value } });
  };

  const handleCamerasChange = (e, type, index) => {
    const newResolution = parseFloat(e.target.value);
    if (type === "front") {
      const updatedValue = arrayOfFrontCameras.map((camera, i) =>
        i === index ? { ...camera, camera_resolution: newResolution } : camera
      );
      setArrayOfFrontCameras(updatedValue);
    } else {
      const updatedValue = arrayOfBackCameras.map((camera, i) =>
        i === index ? { ...camera, camera_resolution: newResolution } : camera
      );
      setArrayOfBackCameras(updatedValue);
    }
  };

  const generateCameraCompo = (type) => {
    if (type === "front") {
      setFrontCameraComponentCount(frontCameraComponentCount + 1);
    } else {
      setBackCameraComponentCount(backCameraComponentCount + 1);
    }
  };

  const handleDeleteCamera = (type) => {
    if (type == "front") {
      setFrontCameraComponentCount(frontCameraComponentCount - 1);
      const updatedValue = arrayOfFrontCameras.map((camera, i) =>
        i === frontCameraComponentCount
          ? { ...camera, camera_resolution: "" }
          : camera
      );
      setArrayOfFrontCameras(updatedValue);
    } else {
      setBackCameraComponentCount(backCameraComponentCount - 1);
      const updatedValue = arrayOfBackCameras.map((camera, i) =>
        i === backCameraComponentCount
          ? { ...camera, camera_resolution: "" }
          : camera
      );
      setArrayOfBackCameras(updatedValue);
    }
  };

  const addProduct = async (addedProduct) => {
    let product = {};
    try {
      if (addedProduct.category_type == 1) {
        const frontCameras = arrayOfFrontCameras.filter(
          (c) => c.camera_resolution != ""
        );
        const backCameras = arrayOfBackCameras.filter(
          (c) => c.camera_resolution != ""
        );
        const phoneCameras = [...frontCameras, ...backCameras];
        addedProduct.phone.phone_cameras = phoneCameras;
        product = addedProduct;
      } else if (addedProduct.category_type == 2) {
        const productAccessory = {
          product_name: addedProduct.product_name,
          wholesale_price: addedProduct.wholesale_price,
          selling_price: addedProduct.selling_price,
          quantity: addedProduct.quantity,
          category_type: addedProduct.category_type,
          accessory: {
            description: addedProduct.phone.description,
            accessory_category: accessoryCategory,
          },
        };
        product = productAccessory;
      }
      await axiosPrivate.post("products", JSON.stringify(product));
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 400) {
        const errorMassage = error?.response?.data;
        const arr = [];
        Object.entries(errorMassage).forEach(([fieldName, messages]) => {
          if (fieldName != "phone") {
            const errorMessage = fieldName + " " + messages.join(" ");
            arr.push(errorMessage);
          }
        });
        Toast.fire({
          icon: "error",
          title: `${arr.join(" ") || "يرجى تعبئة جميع الحقول"}`,
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

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إضافة منتج:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
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
              <NumberInputComponent
                label={"الكمية:"}
                id={"quantity"}
                value={phoneState.quantity}
                onChange={handleProductQuantity}
                min={1}
              />
              <TextInputComponent
                label={"سعر التكلفة:"}
                id={"wholesale_price"}
                dir={"ltr"}
                value={phoneState.wholesale_price}
                onChangeEvent={handleInputChange}
              />
              <TextInputComponent
                label={"سعر المبيع:"}
                id={"selling_price"}
                dir={"ltr"}
                value={phoneState.selling_price}
                onChangeEvent={handleInputChange}
              />
            </div>
            <div className="flex flex-col items-start justify-start gap-4">
              <TextInputComponent
                label={"اسم المنتج:"}
                id={"product_name"}
                value={phoneState.product_name}
                onChangeEvent={handleInputChange}
              />
              <DropDownComponent
                data={dropDownData}
                dataValue={"id"}
                dataTitle={"type"}
                ButtonText={"اختر النوع"}
                label={"النوع:"}
                onSelectEvent={handleProductTypeChange}
                value={phoneState.category_type}
              />
            </div>
          </div>
        </div>
        {phoneState.category_type == 2 && (
          <div className="w-full">
            <SectionTitle text={"معلومات المنتج التفصيلية:"} />
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center justify-start gap-4">
                <ButtonComponent
                  textButton={"إضافة تصنيف جديد للإكسسوار"}
                  onClick={() =>
                    handleShowAddBox(
                      "إضافة تصنيف للإكسسوار:",
                      "التصنيف:",
                      "accessories_categories"
                    )
                  }
                />
              </div>
              <div className="flex flex-col items-center justify-start gap-4">
                <DropDownComponent
                  data={accessoriesCategories}
                  dataTitle={"category_name"}
                  dataValue={"id"}
                  label={"تصنيف الإكسسوار:"}
                  ButtonText="اختر التصنيف"
                  onSelect={setAccessoryCategory}
                />
              </div>
            </div>
          </div>
        )}
        {phoneState.category_type == 1 && (
          <>
            <div className="w-full">
              <SectionTitle text={"معلومات المنتج التفصيلية:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-start gap-4">
                  <ButtonComponent
                    textButton={"إضافة شركة مصنعة"}
                    onClick={() =>
                      handleShowAddBox(
                        "إضافة شركة مصنعة جديدة:",
                        "الشركة المصنعة:",
                        "phone_brands"
                      )
                    }
                  />
                </div>
                <div className="flex flex-col items-center justify-start gap-4">
                  <DropDownComponent
                    data={brands}
                    dataTitle={"brand_name"}
                    dataValue={"id"}
                    label={"الشركة المصنعة:"}
                    ButtonText="اختر الشركة"
                    id={"brand_id"}
                    value={phoneState.phone.brand_id}
                    onSelectEvent={handlePhoneEventData}
                  />
                  <DateInputComponent
                    label={"تاريخ الإصدار:"}
                    id={"release_date"}
                    value={phoneState.phone.release_date}
                    onChangeEvent={handlePhoneEventData}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"المعالج:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-start gap-4">
                  <ButtonComponent
                    textButton={"إضافة شركة مصنعة للمعالج"}
                    onClick={() =>
                      handleShowAddBox(
                        "إضافة شركة مصنعة للمعالج جديدة:",
                        "الشركة المصنعة:",
                        "cpus"
                      )
                    }
                  />
                </div>
                <div className="flex flex-col items-start justify-center gap-4">
                  <DropDownComponent
                    data={CPUS}
                    dataTitle={"CPU_brand"}
                    dataValue={"id"}
                    label={"الشركة المصنعة للمعالج:"}
                    ButtonText="اختر الشركة"
                    id={"CPU_id"}
                    value={phoneState.phone.CPU_id}
                    onSelectEvent={handlePhoneEventData}
                  />
                  <TextInputComponent
                    label={"اسم المعالج:"}
                    id={"CPU_name"}
                    dir="ltr"
                    value={phoneState.phone.CPU_name}
                    onChangeEvent={handlePhoneDetailChange}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"الذاكرة والتخزين:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-start gap-4">
                  <TextInputComponent
                    label={"سعة التخزين الداخلي:"}
                    id={"storage"}
                    dir="ltr"
                    value={phoneState.phone.storage}
                    onChangeEvent={handlePhoneDetailChange}
                  />
                </div>
                <div className="flex flex-col items-start justify-center gap-4">
                  <TextInputComponent
                    label={"سعة ذاكرة الوصول العشوائي:"}
                    id={"RAM"}
                    dir="ltr"
                    value={phoneState.phone.RAM}
                    onChangeEvent={handlePhoneDetailChange}
                  />
                  <CheckInputComponent
                    label={"دعم ذاكرة خارجية SD:"}
                    id={"sd_card"}
                    value={phoneState.phone.sd_card}
                    onChangeEvent={handlePhoneEventData}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"الكاميرا:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-end justify-start gap-4">
                  <TextInputComponent
                    label={"دقة الكاميرا الخلفية 1:"}
                    id={"frontCamera"}
                    dir="ltr"
                    onChangeEvent={(e) => handleCamerasChange(e, "back", 0)}
                    value={arrayOfBackCameras[0].camera_resolution}
                  />
                  <div className="flex flex-row-reverse items-center justify-center gap-4">
                    <ButtonComponent
                      textButton="إضافة كاميرا خلفية"
                      onClick={() => generateCameraCompo("back")}
                      disabled={backCameraComponentCount == 4}
                      small={true}
                    />
                    {backCameraComponentCount > 0 && (
                      <ButtonComponent
                        variant={"delete"}
                        onClick={() => handleDeleteCamera("back")}
                        small={true}
                      />
                    )}
                  </div>
                  {backCameraComponentCount >= 1 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الخلفية 2:"}
                      id={"frontCamera"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "back", 1)}
                      value={arrayOfBackCameras[1].camera_resolution}
                    />
                  )}
                  {backCameraComponentCount >= 2 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الخلفية 3:"}
                      id={"frontCamera"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "back", 2)}
                      value={arrayOfBackCameras[2].camera_resolution}
                    />
                  )}
                  {backCameraComponentCount >= 3 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الخلفية 4:"}
                      id={"frontCamera"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "back", 3)}
                      value={arrayOfBackCameras[3].camera_resolution}
                    />
                  )}
                  {backCameraComponentCount >= 4 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الخلفية 5:"}
                      id={"frontCamera"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "back", 4)}
                      value={arrayOfBackCameras[4].camera_resolution}
                    />
                  )}
                </div>
                <div className="flex flex-col items-end justify-start gap-4">
                  <TextInputComponent
                    label={"دقة الكاميرا الأمامية 1:"}
                    id={"phone_cameras"}
                    dir="ltr"
                    onChangeEvent={(e) => handleCamerasChange(e, "front", 0)}
                    value={arrayOfFrontCameras[0].camera_resolution}
                  />
                  <div className="flex flex-row-reverse items-center justify-center gap-4">
                    <ButtonComponent
                      textButton="إضافة كاميرا أمامية"
                      onClick={() => generateCameraCompo("front")}
                      disabled={frontCameraComponentCount == 2}
                      small={true}
                    />
                    {frontCameraComponentCount > 0 && (
                      <ButtonComponent
                        variant={"delete"}
                        onClick={() => handleDeleteCamera("front")}
                        small={true}
                      />
                    )}
                  </div>
                  {frontCameraComponentCount >= 1 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الأمامية 2:"}
                      id={"phone_cameras"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "front", 1)}
                      value={arrayOfFrontCameras[1].camera_resolution}
                    />
                  )}
                  {frontCameraComponentCount >= 2 && (
                    <TextInputComponent
                      label={"دقة الكاميرا الأمامية 3:"}
                      id={"phone_cameras"}
                      dir="ltr"
                      onChangeEvent={(e) => handleCamerasChange(e, "front", 2)}
                      value={arrayOfFrontCameras[2].camera_resolution}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"شاشة العرض:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-start gap-4"></div>
                <div className="flex flex-col items-start justify-center gap-4">
                  <TextInputComponent
                    label={"حجم الشاشة:"}
                    id={"display_size"}
                    dir="ltr"
                    value={phoneState.phone.display_size}
                    onChangeEvent={handlePhoneDetailChange}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"البطارية:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-start justify-center gap-4"></div>
                <div className="flex flex-col items-center justify-start gap-4">
                  <TextInputComponent
                    label={"سعة البطارية:"}
                    id={"battery"}
                    dir="ltr"
                    value={phoneState.phone.battery}
                    onChangeEvent={handlePhoneDetailChange}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"شرائح الاتصال:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-start justify-center gap-4"></div>
                <div className="flex flex-col items-end justify-center gap-4">
                  <NumberInputComponent
                    label={"عدد شرائح الاتصال:"}
                    id={"sim"}
                    dir="ltr"
                    min={1}
                    max={3}
                    value={phoneState.phone.sim}
                    onChange={handlePhoneEventData}
                  />
                </div>
              </div>
            </div>
            <div className="w-full">
              <SectionTitle text={"اللون:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center justify-start gap-4">
                  <ButtonComponent
                    textButton={"إضافة لون جديد"}
                    onClick={() =>
                      handleShowAddBox("إضافة لون جديد:", "اللون:", "colors")
                    }
                  />
                </div>
                <div className="flex flex-col items-start justify-center gap-4">
                  <DropDownComponent
                    data={colors}
                    dataTitle={"color"}
                    dataValue={"id"}
                    label={"اللون:"}
                    ButtonText="اختر اللون"
                    id={"color_id"}
                    value={phoneState.phone.color_id}
                    onSelectEvent={handlePhoneEventData}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        <div className="w-full">
          <SectionTitle text={"الوصف:"} />
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-start justify-center gap-4"></div>
            <div className="flex flex-col items-end justify-center gap-4">
              <TextAreaComponent
                id={"description"}
                value={phoneState.phone.description}
                onChange={handlePhoneDetailChange}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-full mt-8">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"add"}
            onClick={() => addProduct(phoneState)}
          />
        </div>
      </section>
    </main>
  );
}

export default AddProduct;
