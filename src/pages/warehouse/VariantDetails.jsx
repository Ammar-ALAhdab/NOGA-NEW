import { useEffect, useState } from "react";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import NumberInputComponent from "../../components/inputs/NumberInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useToast from "../../hooks/useToast";
import useGoToBack from "../../hooks/useGoToBack";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

function VariantDetails() {
  const { VariantId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();
  const handleClickBack = useGoToBack();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variant, setVariant] = useState(null);

  // Editable fields
  const [quantity, setQuantity] = useState(1);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [images, setImages] = useState([]);

  const getVariant = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosPrivate.get(`/products/variants/${id}`);
      setVariant(res.data);
      // Try to infer editable fields from response
      const q = res?.data?.quantity;
      const wp = res?.data?.wholesale_price ?? res?.data?.wholesalePrice;
      const sp = res?.data?.selling_price ?? res?.data?.sellingPrice;
      if (typeof q !== "undefined") setQuantity(q);
      if (typeof wp !== "undefined") setWholesalePrice(String(wp));
      if (typeof sp !== "undefined") setSellingPrice(String(sp));
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVariant(VariantId);
  }, [VariantId]);

  const variantName = (
    variant?.product_name ||
    variant?.product ||
    variant?.product?.product_name ||
    variant?.name ||
    ""
  ).toString();

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("quantity", String(quantity));
    fd.append("wholesale_price", String(wholesalePrice));
    fd.append("selling_price", String(sellingPrice));
    const files = Array.from(images || []);
    for (let i = 0; i < files.length; i++) fd.append("images", files[i]);
    // Note: options editing is not included here to keep the editor focused on core fields
    return fd;
  };

  const updateVariant = async () => {
    try {
      const fd = buildFormData();
      await axiosPrivate.put(`/products/variants/${VariantId}`, fd);
      Toast.fire({ icon: "success", title: "تم حفظ التعديلات" });
      getVariant(VariantId);
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      const msg = typeof data === "string" ? data : "تعذر حفظ التعديلات";
      Toast.fire({ icon: "error", title: msg });
    }
  };

  const deleteVariant = async () => {
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
          .delete(`/products/variants/${VariantId}`)
          .then(() => {
            Swal.fire({ title: "تم الحذف", icon: "success" });
            navigate(-1, { replace: true });
          })
          .catch((err) => {
            console.error(err);
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

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`تفاصيل المنتج: ${variantName}`} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <NoDataError />
        ) : (
          <>
            <div className="w-full">
              <SectionTitle text={`معلومات المنتج: ${variantName}`} />
              <div className="grid grid-cols-1 gap-4 w-full">
                <div className="flex flex-col items-end justify-start gap-4">
                  <NumberInputComponent
                    label={"الكمية:"}
                    id={"quantity"}
                    value={quantity}
                    min={0}
                    onChange={(e) => setQuantity(e.value)}
                  />
                  <TextInputComponent
                    label={"سعر التكلفة:"}
                    id={"wholesale_price"}
                    dir="ltr"
                    value={wholesalePrice}
                    onChange={setWholesalePrice}
                  />
                  <TextInputComponent
                    label={"سعر المبيع:"}
                    id={"selling_price"}
                    dir="ltr"
                    value={sellingPrice}
                    onChange={setSellingPrice}
                  />
                  <div className="flex items-center justify-between gap-8 w-[500px]">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setImages(e.target.files)}
                      className="w-[250px] h-[40px]"
                    />
                    <label className="text-base" htmlFor="images">
                      :الصور
                    </label>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-3 w-full">
                  <SectionTitle text={"خصائص المنتج:"} />
                  {Array.isArray(variant?.options) &&
                  variant.options.length > 0 ? (
                    <div className="max-h-[300px] overflow-auto w-full pr-2 flex items-center justify-center">
                      <table className="w-[600px] text-sm border border-primary rounded-2xl overflow-hidden">
                        <thead className="bg-primary text-white *:text-center">
                          <tr>
                            <th className="py-2 px-3">الوحدة</th>
                            <th className="py-2 px-3">القيمة</th>
                            <th className="py-2 px-3">الخاصية</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variant.options.map((opt, idx) => (
                            <tr
                              key={`opt-${idx}`}
                              className={
                                idx % 2 === 0
                                  ? "bg-white"
                                  : "bg-[#f5f7ff] *:text-center"
                              }
                            >
                              <td className="py-2 px-3 text-xs text-center opacity-80">
                                {opt?.unit ? String(opt.unit) : "-"}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {String(opt?.option ?? "-")}
                              </td>

                              <td className="py-2 px-3 text-center">
                                {opt?.attribute_name ||
                                  opt?.attribute ||
                                  "خاصية"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <span className="text-sm">لا توجد خصائص لهذه النسخة.</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 w-full mt-8">
              <ButtonComponent variant={"back"} onClick={handleClickBack} />
              <ButtonComponent variant={"delete"} onClick={deleteVariant} />
              <ButtonComponent
                variant={"edit"}
                textButton="حفظ التعديلات"
                onClick={updateVariant}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default VariantDetails;
