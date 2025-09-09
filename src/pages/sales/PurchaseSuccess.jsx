import { useState } from "react";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate, useLocation } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import currencyFormatting from "../../util/currencyFormatting";
import Swal from "sweetalert2";

function PurchaseSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  // Get purchase data from navigation state
  const purchaseData = location.state?.purchaseData;

  const [couponCode, setCouponCode] = useState("");
  const [processingCoupon, setProcessingCoupon] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  if (!purchaseData) {
    navigate("/salesOfficer");
    return null;
  }

  const handleProcessCoupon = async () => {
    try {
      setProcessingCoupon(true);
      console.log("🎫 Processing purchase:", purchaseData.id);
      console.log("🎫 Coupon code:", couponCode || "No coupon");

      // Send empty object {} if no coupon, otherwise send coupon code
      const requestData = couponCode.trim() ? { coupon: couponCode } : {};

      const response = await axiosPrivate.post(
        `/sales/purchase/${purchaseData.id}/process`,
        JSON.stringify(requestData)
      );

      console.log("✅ Purchase processed successfully!");
      console.log("📦 Process response:", response.data);

      Swal.fire({
        title: "تم معالجة الطلب بنجاح!",
        text: couponCode.trim()
          ? "تم تطبيق الكوبون بنجاح"
          : "تم معالجة الطلب بدون كوبون",
        icon: "success",
        confirmButtonText: "حسناً",
      }).then(() => {
        // Update the purchase data with the new status
        const updatedPurchaseData = {
          ...purchaseData,
          status: "processing",
        };

        // Navigate to the same page with updated data
        navigate("/salesOfficer/purchaseSuccess", {
          state: { purchaseData: updatedPurchaseData },
          replace: true,
        });
      });
    } catch (error) {
      console.error("❌ Error processing purchase:", error);
      console.error("❌ Error response:", error.response?.data);

      // Handle specific error cases
      let errorMessage = "حدث خطأ أثناء معالجة الطلب";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // If purchase was already processed, refresh the page to show updated status
        if (
          errorMessage.includes("processed") ||
          errorMessage.includes("معالجة")
        ) {
          Swal.fire({
            title: "تم معالجة الطلب مسبقاً",
            text: "سيتم تحديث الصفحة لعرض الحالة الحالية",
            icon: "info",
            confirmButtonText: "حسناً",
          }).then(() => {
            window.location.reload();
          });
          return;
        }
      }

      Swal.fire({
        title: "خطأ!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      setProcessingCoupon(false);
    }
  };

  const handleCancelPurchase = async () => {
    try {
      setProcessingAction(true);
      console.log("❌ Cancelling purchase:", purchaseData.id);

      const response = await axiosPrivate.post(
        `/sales/purchase/${purchaseData.id}/cancel`
      );

      console.log("✅ Purchase cancelled successfully!");
      console.log("📦 Cancel response:", response.data);

      Swal.fire({
        title: "تم إلغاء الطلب!",
        text: "تم إلغاء الطلب بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      }).then(() => {
        navigate("/salesOfficer");
      });
    } catch (error) {
      console.error("❌ Error cancelling purchase:", error);
      console.error("❌ Error response:", error.response?.data);

      // Handle specific error cases
      let errorMessage = "حدث خطأ أثناء إلغاء الطلب";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // If purchase was already processed/completed, refresh the page
        if (
          errorMessage.includes("processed") ||
          errorMessage.includes("completed") ||
          errorMessage.includes("معالجة") ||
          errorMessage.includes("مكتمل")
        ) {
          Swal.fire({
            title: "لا يمكن إلغاء الطلب",
            text: "الطلب تم معالجته أو إكماله مسبقاً. سيتم تحديث الصفحة",
            icon: "warning",
            confirmButtonText: "حسناً",
          }).then(() => {
            window.location.reload();
          });
          return;
        }
      }

      Swal.fire({
        title: "خطأ!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleCompletePurchase = async () => {
    try {
      setProcessingAction(true);
      console.log("✅ Completing purchase:", purchaseData.id);

      const response = await axiosPrivate.post(
        `/sales/purchase/${purchaseData.id}/complete`
      );

      console.log("✅ Purchase completed successfully!");
      console.log("📦 Complete response:", response.data);

      Swal.fire({
        title: "تم إكمال الطلب!",
        text: "تم إكمال الطلب بنجاح",
        icon: "success",
        confirmButtonText: "حسناً",
      }).then(() => {
        // Update the purchase data with the new status
        const updatedPurchaseData = {
          ...purchaseData,
          status: "completed",
        };

        // Navigate to the same page with updated data
        navigate("/salesOfficer/purchaseSuccess", {
          state: { purchaseData: updatedPurchaseData },
          replace: true,
        });
      });
    } catch (error) {
      console.error("❌ Error completing purchase:", error);
      console.error("❌ Error response:", error.response?.data);

      // Handle specific error cases
      let errorMessage = "حدث خطأ أثناء إكمال الطلب";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // If purchase was already completed, refresh the page
        if (
          errorMessage.includes("completed") ||
          errorMessage.includes("مكتمل")
        ) {
          Swal.fire({
            title: "تم إكمال الطلب مسبقاً",
            text: "الطلب مكتمل بالفعل. سيتم تحديث الصفحة",
            icon: "info",
            confirmButtonText: "حسناً",
          }).then(() => {
            window.location.reload();
          });
          return;
        }
      }

      Swal.fire({
        title: "خطأ!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "حسناً",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleBackToSales = () => {
    navigate("/salesOfficer");
  };

  const handlePrintBill = () => {
    // Create a nice bill HTML
    const billHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: right; direction: rtl; max-width: 400px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #3457D5; padding-bottom: 15px; margin-bottom: 20px;">
          <h1 style="color: #3457D5; margin: 0; font-size: 24px;">فاتورة البيع</h1>
          <p style="margin: 5px 0; color: #666;">${purchaseData.branch_name}</p>
          <p style="margin: 5px 0; color: #666;">${
            purchaseData.date_of_purchase
          }</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>رقم الفاتورة:</strong> #${
            purchaseData.id
          }</p>
          <p style="margin: 5px 0;"><strong>الزبون:</strong> ${
            purchaseData.customer_name
          }</p>
          <p style="margin: 5px 0;"><strong>الحالة:</strong> ${
            purchaseData.status
          }</p>
        </div>
        
        <div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; margin: 15px 0;">
          <h3 style="margin: 0 0 10px 0; color: #3457D5;">المنتجات:</h3>
          ${purchaseData.purchased_products
            .map(
              (product) => `
            <div style="display: flex; justify-content: space-between; margin: 8px 0; padding: 5px; background: #f8f9fa; border-radius: 5px;">
              <div>
                <div style="font-weight: bold;">${product.product_name}</div>
                <div style="font-size: 12px; color: #666;">الكمية: ${
                  product.quantity
                }</div>
              </div>
              <div style="text-align: left;">
                <div>${currencyFormatting(product.selling_price)}</div>
                <div style="font-weight: bold; color: #3457D5;">${currencyFormatting(
                  product.total_price
                )}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div style="text-align: left; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin: 5px 0;">
            <span>المجموع الفرعي:</span>
            <span>${currencyFormatting(purchaseData.subtotal_price)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 5px 0; font-weight: bold; font-size: 18px; color: #3457D5; border-top: 2px solid #3457D5; padding-top: 10px;">
            <span>المجموع الإجمالي:</span>
            <span>${currencyFormatting(purchaseData.total_price)}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>شكراً لاختياركم خدماتنا</p>
          <p>NOGA COMPANY</p>
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(billHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text="تمت عملية البيع بنجاح! 🎉" />

      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-6 my-box-shadow gap-6">
        {/* Purchase Summary */}
        <div className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <SectionTitle text="ملخص الفاتورة" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">:رقم الفاتورة</p>
              <p className="font-bold text-lg">#{purchaseData.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">:الزبون</p>
              <p className="font-bold text-lg">{purchaseData.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">:الفرع</p>
              <p className="font-bold text-lg">{purchaseData.branch_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">:التاريخ</p>
              <p className="font-bold text-lg">
                {purchaseData.date_of_purchase}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">:الحالة</p>
              <p
                className={`font-bold text-lg ${
                  purchaseData.status === "pending"
                    ? "text-yellow-600"
                    : purchaseData.status === "processing"
                    ? "text-orange-600"
                    : purchaseData.status === "completed"
                    ? "text-green-600"
                    : purchaseData.status === "cancelled"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {purchaseData.status === "pending"
                  ? "معلق"
                  : purchaseData.status === "processing"
                  ? "قيد المعالجة"
                  : purchaseData.status === "completed"
                  ? "مكتمل"
                  : purchaseData.status === "cancelled"
                  ? "ملغي"
                  : purchaseData.status}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">:المجموع الإجمالي</p>
              <p className="font-bold text-xl text-green-600">
                {currencyFormatting(purchaseData.total_price)}
              </p>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="w-full">
          <SectionTitle text="المنتجات المشتراة" />
          <div className="space-y-3 mt-4">
            {purchaseData.purchased_products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">
                      {product.product_name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      الكمية: {product.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      سعر الوحدة: {currencyFormatting(product.selling_price)}
                    </p>
                    {product.has_discount && (
                      <p className="text-sm text-green-600">✓ خصم مطبق</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg text-blue-600">
                      {currencyFormatting(product.total_price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase Actions Section */}
        {(purchaseData.status === "pending" ||
          purchaseData.status === "processing") && (
          <div className="w-full bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <SectionTitle text="إجراءات الطلب" />

            {/* Coupon input - only show for pending status */}
            {purchaseData.status === "pending" && (
              <div className="flex items-center gap-4 mt-4">
                <TextInputComponent
                  id="couponCode"
                  label="كود الكوبون (اختياري):"
                  value={couponCode}
                  onChange={setCouponCode}
                  placeholder="أدخل كود الكوبون أو اتركه فارغاً"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <ButtonComponent
                variant={
                  purchaseData.status === "pending" ? "procedure" : "confirm"
                }
                textButton={
                  purchaseData.status === "pending"
                    ? "معالجة الطلب"
                    : "إكمال الطلب"
                }
                onClick={
                  purchaseData.status === "pending"
                    ? handleProcessCoupon
                    : handleCompletePurchase
                }
                disabled={
                  purchaseData.status === "pending"
                    ? processingCoupon
                    : processingAction
                }
              />
              <ButtonComponent
                variant="delete"
                textButton="إلغاء الطلب"
                onClick={handleCancelPurchase}
                disabled={processingAction}
              />
            </div>

            {purchaseData.status === "pending" && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                يمكنك إضافة كوبون خصم أو المتابعة بدون كوبون
              </p>
            )}
          </div>
        )}

        {/* Completed/Cancelled Status Messages */}
        {purchaseData.status === "completed" && (
          <div className="w-full bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <SectionTitle text="تم إكمال الطلب بنجاح" />
            <p className="text-center text-green-600 font-bold">
              ✅ تم إكمال الطلب بنجاح
            </p>
          </div>
        )}

        {purchaseData.status === "cancelled" && (
          <div className="w-full bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <SectionTitle text="تم إلغاء الطلب" />
            <p className="text-center text-red-600 font-bold">
              ❌ تم إلغاء الطلب
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 w-full">
          <ButtonComponent
            variant="show"
            onClick={handlePrintBill}
            textButton="طباعة الفاتورة"
          />
          <ButtonComponent
            variant="back"
            textButton="العودة للبيع"
            onClick={handleBackToSales}
          />
        </div>
      </section>
    </main>
  );
}

export default PurchaseSuccess;
