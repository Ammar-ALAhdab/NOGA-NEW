import { useEffect, useReducer, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import Title from "../../components/titles/Title";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import useGoToBack from "../../hooks/useGoToBack";
import TextShowBlue from "../../components/inputs/TextShowBlue";
import SectionTitle from "../../components/titles/SectionTitle";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import CheckInputComponent from "../../components/inputs/CheckInputComponent";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import { useParams } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DETAILS":
      return { ...action.payload };
    default:
      return state;
  }
};

function PhoneDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const { ProductId } = useParams();
  const [frontCameraComponentCount, setFrontCameraComponentCount] = useState(0);
  const [backCameraComponentCount, setBackCameraComponentCount] = useState(0);
  const [phoneState, dispatch] = useReducer(reducer, {});
  const branchID = JSON.parse(localStorage.getItem("branchID"));
  const handlePrintImage = () => {
    const imageWindow = window.open("", "_blank");
    imageWindow.document.write(
      `<img
        src=${phoneState.qr_codes_download}
        style="max-width: 100%; height: auto;"
      />`
    );
    setTimeout(() => {
      imageWindow.print();
    }, 1000);
  };

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

  const handleInitializeData = (productData) => {
    const backCameras = productData.phone.phone_cameras.filter(
      (c) => c.main == true
    );
    const frontCameras = productData.phone.phone_cameras.filter(
      (c) => c.main == false
    );
    setArrayOfBackCameras(backCameras);
    setBackCameraComponentCount(backCameras?.length - 1);
    setArrayOfFrontCameras(frontCameras);
    setFrontCameraComponentCount(frontCameras?.length - 1);
    dispatch({ type: `SET_INITIAL_DETAILS`, payload: productData });
  };

  const getProductDetails = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(
        `/products/branch?branch__id=${branchID}&product__id=${productId}`
      );
      const productData = response?.data?.results?.map((p) => p.product);
      const p = Object.assign(...productData);
      p.quantity = response?.data?.results[0]?.quantity;
      handleInitializeData(p);
    } catch (error) {
      console.log(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductDetails(ProductId);
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`معلومات المنتج ${phoneState?.product_name}:`} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <NoDataError />
        ) : (
          <>
            <div className="w-full">
              <SectionTitle text={"معلومات المنتج العامة:"} />
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-end justify-start gap-4">
                  <TextShowBlue
                    value={phoneState?.quantity}
                    label={"الكمية:"}
                  />
                  <TextInputComponent
                    disabled={true}
                    label={"سعر المبيع:"}
                    id={"selling_price"}
                    dir={"ltr"}
                    value={phoneState?.selling_price}
                  />
                </div>
                <div className="flex flex-col items-start justify-start gap-4">
                  <TextInputComponent
                    disabled={true}
                    label={"اسم المنتج:"}
                    id={"product_name"}
                    value={phoneState?.product_name}
                  />
                  <TextShowBlue label={"النوع:"} value={"موبايل"} />
                </div>
              </div>
            </div>
            {phoneState?.category_type == 1 && (
              <>
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
                        <img src={phoneState.qr_code} alt="الباركود" />
                        <p className="ar-txt">الباركود:</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center justify-start gap-4">
                      <DateInputComponent
                        label={"تاريخ الإصدار:"}
                        id={"release_date"}
                        disabled={true}
                        value={phoneState?.phone.release_date}
                      />
                    </div>
                    <div className="flex flex-col items-center justify-start gap-4">
                      <TextShowBlue
                        label={"الشركة المصنعة:"}
                        value={phoneState?.phone.brand}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <SectionTitle text={"المعالج:"} />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center justify-start gap-4">
                      {" "}
                      <TextInputComponent
                        disabled={true}
                        label={"اسم المعالج:"}
                        id={"CPU_name"}
                        dir="ltr"
                        value={phoneState?.phone.CPU_name}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center gap-4">
                      <TextShowBlue
                        label={"الشركة المصنعة للمعالج:"}
                        value={phoneState?.phone.CPU}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <SectionTitle text={"الذاكرة والتخزين:"} />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center justify-start gap-4">
                      <TextInputComponent
                        disabled={true}
                        label={"سعة التخزين الداخلي:"}
                        id={"storage"}
                        dir="ltr"
                        value={phoneState?.phone.storage}
                      />
                    </div>
                    <div className="flex flex-col items-start justify-center gap-4">
                      <TextInputComponent
                        disabled={true}
                        label={"سعة ذاكرة الوصول العشوائي:"}
                        id={"RAM"}
                        dir="ltr"
                        value={phoneState?.phone.RAM}
                      />
                      <CheckInputComponent
                        label={"دعم ذاكرة خارجية SD:"}
                        id={"sd_card"}
                        value={phoneState?.phone.sd_card}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <SectionTitle text={"الكاميرا:"} />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-end justify-start gap-4">
                      <TextInputComponent
                        disabled={true}
                        label={"دقة الكاميرا الخلفية 1:"}
                        id={"frontCamera"}
                        dir="ltr"
                        onChangeEvent={(e) => handleCamerasChange(e, "back", 0)}
                        value={arrayOfBackCameras[0]?.camera_resolution}
                      />

                      {backCameraComponentCount >= 1 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الخلفية 2:"}
                          id={"frontCamera"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "back", 1)
                          }
                          value={arrayOfBackCameras[1]?.camera_resolution}
                        />
                      )}
                      {backCameraComponentCount >= 2 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الخلفية 3:"}
                          id={"frontCamera"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "back", 2)
                          }
                          value={arrayOfBackCameras[2]?.camera_resolution}
                        />
                      )}
                      {backCameraComponentCount >= 3 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الخلفية 4:"}
                          id={"frontCamera"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "back", 3)
                          }
                          value={arrayOfBackCameras[3]?.camera_resolution}
                        />
                      )}
                      {backCameraComponentCount >= 4 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الخلفية 5:"}
                          id={"frontCamera"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "back", 4)
                          }
                          value={arrayOfBackCameras[4]?.camera_resolution}
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-end justify-start gap-4">
                      <TextInputComponent
                        disabled={true}
                        label={"دقة الكاميرا الأمامية 1:"}
                        id={"phone_cameras"}
                        dir="ltr"
                        onChangeEvent={(e) =>
                          handleCamerasChange(e, "front", 0)
                        }
                        value={arrayOfFrontCameras[0]?.camera_resolution}
                      />
                      {frontCameraComponentCount >= 1 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الأمامية 2:"}
                          id={"phone_cameras"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "front", 1)
                          }
                          value={arrayOfFrontCameras[1]?.camera_resolution}
                        />
                      )}
                      {frontCameraComponentCount >= 2 && (
                        <TextInputComponent
                          disabled={true}
                          label={"دقة الكاميرا الأمامية 3:"}
                          id={"phone_cameras"}
                          dir="ltr"
                          onChangeEvent={(e) =>
                            handleCamerasChange(e, "front", 2)
                          }
                          value={arrayOfFrontCameras[2]?.camera_resolution}
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
                        disabled={true}
                        label={"حجم الشاشة:"}
                        id={"display_size"}
                        dir="ltr"
                        value={phoneState?.phone.display_size}
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
                        disabled={true}
                        label={"سعة البطارية:"}
                        id={"battery"}
                        dir="ltr"
                        value={phoneState?.phone.battery}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <SectionTitle text={"شرائح الاتصال:"} />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-start justify-center gap-4"></div>
                    <div className="flex flex-col items-end justify-center gap-4">
                      <TextShowBlue
                        label={"عدد شرائح الاتصال:"}
                        value={phoneState?.phone.sim}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <SectionTitle text={"اللون:"} />
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="flex flex-col items-center justify-start gap-4"></div>
                    <div className="flex flex-col items-start justify-center gap-4">
                      <TextShowBlue
                        label={"اللون:"}
                        value={phoneState?.phone.color}
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
                    disabled={true}
                    id={"description"}
                    value={phoneState?.phone?.description}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 w-full mt-8">
              <ButtonComponent variant={"back"} onClick={handleClickBack} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default PhoneDetails;
