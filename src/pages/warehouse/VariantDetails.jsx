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
  const [productId, setProductId] = useState(null); // Store product ID separately

  // Editable fields
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [images, setImages] = useState([]);
  const [options, setOptions] = useState([]);

  const getVariant = async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching variant with ID:", id);

      // Fetch variant data
      const variantRes = await axiosPrivate.get(`/products/variants/${id}`);
      const res = { data: variantRes.data };
      setVariant(res.data);
      console.log("=== VARIANT DATA ANALYSIS ===");
      console.log("Received variant data:", res.data);
      console.log("Full variant object keys:", Object.keys(res.data));
      console.log("Product field:", res.data?.product);
      console.log("Product field type:", typeof res.data?.product);
      console.log("All variant data:", JSON.stringify(res.data, null, 2));

      // Extract product ID using the correct field: main_product
      let extractedProductId = res.data?.main_product;

      console.log("=== PRODUCT ID EXTRACTION (UPDATED) ===");
      console.log("Using main_product field:", res.data?.main_product);
      console.log("Extracted product ID:", extractedProductId);
      console.log("Product ID type:", typeof extractedProductId);

      // Check if we have the product ID from main_product field
      if (!extractedProductId) {
        console.error("No main_product field found in variant data!");
        console.log("Available fields:", Object.keys(res.data));
      }

      setProductId(extractedProductId);

      console.log("=== OPTIONS ANALYSIS ===");
      console.log("Options array:", res.data?.options);
      console.log("Options length:", res.data?.options?.length);

      if (res.data?.options?.length > 0) {
        res.data.options.forEach((opt, index) => {
          console.log(`Option ${index}:`, {
            id: opt.id,
            option: opt.option,
            attribute: opt.attribute,
            attribute_id: opt.attribute_id,
            attribute_name: opt.attribute_name,
            unit: opt.unit,
            full_option: opt,
            all_keys: Object.keys(opt),
          });
        });
      }

      // Try to infer editable fields from response
      const product =
        res?.data?.product_name || res?.data?.product || res?.data?.name || "";
      const q = res?.data?.quantity;
      const wp = res?.data?.wholesale_price ?? res?.data?.wholesalePrice;
      const sp = res?.data?.selling_price ?? res?.data?.sellingPrice;
      const opts = res?.data?.options || [];

      console.log("=== EXTRACTING EDITABLE FIELDS ===");
      console.log("Product name for display:", product);
      console.log("Quantity:", q);
      console.log("Wholesale price:", wp);
      console.log("Selling price:", sp);
      console.log("Options:", opts);

      setProductName(product);
      if (typeof q !== "undefined") setQuantity(q);
      if (typeof wp !== "undefined") setWholesalePrice(String(wp));
      if (typeof sp !== "undefined") setSellingPrice(String(sp));
      setOptions([...opts]); // Create a copy of options array
    } catch (err) {
      console.error("Error fetching variant:", err);
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

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  const buildUpdateData = () => {
    console.log("=== BUILDING UPDATE DATA ===");
    console.log("Current state values:");
    console.log("- productId:", productId, "type:", typeof productId);
    console.log("- productName:", productName, "type:", typeof productName);
    console.log("- quantity:", quantity, "type:", typeof quantity);
    console.log(
      "- wholesalePrice:",
      wholesalePrice,
      "type:",
      typeof wholesalePrice
    );
    console.log("- sellingPrice:", sellingPrice, "type:", typeof sellingPrice);
    console.log("- options:", options);

    if (!productId) {
      console.error("No product ID available for update!");
      Toast.fire({
        icon: "error",
        title: "خطأ: لا يمكن العثور على معرف المنتج",
      });
      return null;
    }

    // CRITICAL: Ensure we're using productId, not productName
    console.log("=== CRITICAL CHECK ===");
    console.log(
      "productId (should be used):",
      productId,
      "type:",
      typeof productId
    );
    console.log(
      "productName (should NOT be used):",
      productName,
      "type:",
      typeof productName
    );

    if (typeof productId === "string" && productId === productName) {
      console.error(
        "ERROR: productId is the same as productName! This will cause the API error!"
      );
    }

    const updateData = {
      product: productId, // Use stored product ID
      quantity: parseInt(quantity),
      wholesale_price: parseFloat(wholesalePrice) || 0,
      selling_price: parseFloat(sellingPrice) || 0,
    };

    // Add options data with proper ID mapping
    if (options.length > 0) {
      console.log("=== PROCESSING OPTIONS FOR UPDATE ===");
      updateData.options = options.map((option, index) => {
        console.log(`=== PROCESSING OPTION ${index} ===`);
        console.log("Original option:", option);
        console.log("Option keys:", Object.keys(option));

        // Use the correct field: attribute_id
        const attributeId = option.attribute_id;
        const unitId = option.unit_id;

        console.log(`Option ${index} - Using correct fields:`, {
          "option.attribute_id": option.attribute_id,
          "option.unit_id": option.unit_id,
          "option.option": option.option,
          final_attributeId: attributeId,
          final_unitId: unitId,
        });

        // Validate that we have the required fields
        if (!attributeId) {
          console.error(`No attribute_id found for option ${index}:`, option);
          console.error("This will cause the API to reject the request!");
        }
        if (!unitId) {
          console.warn(`No unit_id found for option ${index}:`, option);
        }

        const processedOption = {
          // Don't include id field as requested
          option: option.option,
          attribute: attributeId, // Use attribute_id from the option
          unit: unitId, // Use unit_id from the option
        };

        console.log(`Option ${index} processed:`, processedOption);
        return processedOption;
      });
    }

    // If there are images, we'll need to handle them separately
    // For now, we'll focus on the text/JSON data
    if (images && images.length > 0) {
      console.log("Images detected but not included in JSON update");
    }

    console.log("=== FINAL UPDATE DATA ===");
    console.log("Complete update data:", updateData);
    console.log("Update data JSON:", JSON.stringify(updateData, null, 2));
    console.log(
      "Product field value:",
      updateData.product,
      "type:",
      typeof updateData.product
    );
    console.log("Options count:", updateData.options?.length);
    if (updateData.options) {
      updateData.options.forEach((opt, idx) => {
        console.log(`Final option ${idx}:`, opt);
      });
    }
    return updateData;
  };

  const updateVariant = async () => {
    try {
      const updateData = buildUpdateData();

      if (!updateData) {
        console.error("Cannot proceed with update - no valid data");
        return;
      }

      console.log("Sending update request with data:", updateData);
      console.log("Request URL:", `/products/variants/${VariantId}`);

      const response = await axiosPrivate.put(
        `/products/variants/${VariantId}`,
        updateData
      );
      console.log("Update response:", response.data);

      Toast.fire({ icon: "success", title: "تم حفظ التعديلات" });
      getVariant(VariantId);
    } catch (err) {
      console.error("Update error:", err);
      console.error("Error response:", err?.response?.data);
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
                  <TextInputComponent
                    label={"اسم المنتج:"}
                    id={"product_name"}
                    value={productName}
                    onChange={setProductName}
                  />
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
                  {Array.isArray(options) && options.length > 0 ? (
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
                          {options.map((opt, idx) => (
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
                                <input
                                  type="text"
                                  value={opt?.option || ""}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      idx,
                                      "option",
                                      e.target.value
                                    )
                                  }
                                  className="w-full text-center border border-gray-300 rounded px-2 py-1 text-sm"
                                  dir="ltr"
                                />
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
