import Title from "../../components/titles/Title";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import useGoToBack from "../../hooks/useGoToBack";
import TextShowBlue from "../../components/inputs/TextShowBlue";

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DETAILS":
      return { ...action.payload };
    default:
      return state;
  }
};

function AccessoryDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const { ProductId } = useParams();
  const branchID = JSON.parse(localStorage.getItem("branchID"));
  const [accessoryState, dispatch] = useReducer(reducer, {});

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
      dispatch({ type: `SET_INITIAL_DETAILS`, payload: p });
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
      <Title text={`معلومات المنتج ${accessoryState?.product_name}:`} />
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
                    value={accessoryState?.quantity}
                    label={"الكمية:"}
                  />
                  <TextInputComponent
                    disabled={true}
                    label={"سعر المبيع:"}
                    id={"selling_price"}
                    dir={"ltr"}
                    value={accessoryState?.selling_price}
                  />
                </div>
                <div className="flex flex-col items-start justify-start gap-4">
                  <TextInputComponent
                    disabled={true}
                    label={"اسم المنتج:"}
                    id={"product_name"}
                    value={accessoryState?.product_name}
                  />
                  <TextShowBlue label={"النوع:"} value={"إكسسوار"} />
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
                <div className="flex flex-col items-center justify-start gap-4"></div>
                <div className="flex flex-col items-center justify-start gap-4">
                  <TextShowBlue
                    value={accessoryState?.accessory?.category_name}
                    label={"تصنيف الإكسسوار:"}
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
                    disabled={true}
                    id={"description"}
                    value={accessoryState?.accessory?.description}
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

export default AccessoryDetails;
