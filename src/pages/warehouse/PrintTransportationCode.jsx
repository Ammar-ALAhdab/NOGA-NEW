import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";

function PrintTransportationCode() {
  const { transportationId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [transportationData, setTransportationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleReceviedProducts = (unFormattedData) => {
    if (unFormattedData.received_products.length > 0) {
      let rp = unFormattedData.received_products?.map((rp) => {
        delete rp.product.quantity;
        rp.product.quantity = rp.quantity;
        return rp.product;
      });
      return rp;
    } else {
      let rp = unFormattedData.transported_products?.map((tp) => {
        delete tp.product.quantity;
        tp.product.quantity = tp.quantity;
        return tp.product;
      });
      return rp;
    }
  };

  const formatting = (unFormattedData) => {
    const formattedData = {
      id: unFormattedData.id,
      idOfOrder: unFormattedData.id,
      date: unFormattedData.created_at,
      transported_at: unFormattedData.transported_at,
      received_at: unFormattedData.received_at,
      source: unFormattedData.source,
      destination: unFormattedData.destination,
      productCount: unFormattedData?.transported_products?.length,
      status: unFormattedData.transportation_status,
      code: unFormattedData.code,
      transportedProduct: unFormattedData.transported_products?.map((tp) => {
        delete tp.product.quantity;
        tp.product.quantity = tp.quantity;
        return tp.product;
      }),
      receviedProduct: handleReceviedProducts(unFormattedData),
    };
    return formattedData;
  };

  useEffect(() => {
    const fetchTransportationData = async () => {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(
          `/products/transportations/${transportationId}`
        );
        const data = formatting(response?.data);
        setTransportationData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransportationData();
  }, [transportationId, axiosPrivate]);

  useEffect(() => {
    // Auto-print after 3 seconds
    const timer = setTimeout(() => {
      window.print();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <NoDataError error={error} />;
  }

  if (!transportationData) {
    return <NoDataError error={{ message: "No transportation data found" }} />;
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          نظام إدارة المستودعات
        </h1>
        <p className="text-gray-600">NOGA Warehouse Management System</p>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto bg-white border-2 border-gray-300 rounded-lg p-8 print:border-none print:p-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">كود التوصيل</h2>
          <p className="text-xl text-gray-600">Delivery Code</p>
        </div>

        {/* Code Display */}
        <div className="text-center mb-8">
          <div className="bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg p-6 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              كود التوصيل / Delivery Code
            </p>
            <p className="text-4xl font-bold text-gray-800 tracking-wider font-mono">
              {transportationData.code}
            </p>
          </div>
        </div>

        {/* Transportation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              تفاصيل النقل
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">معرف النقل:</span>
                <span className="font-semibold">#{transportationData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الإنشاء:</span>
                <span className="font-semibold">{transportationData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الحالة:</span>
                <span className="font-semibold text-green-600">
                  {transportationData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              تفاصيل الفرع
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الفرع الهدف:</span>
                <span className="font-semibold">
                  {transportationData.destination || "المستودع الرئيسي"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد المنتجات:</span>
                <span className="font-semibold">
                  {transportationData.transportedProduct?.length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        {transportationData.transportedProduct &&
          transportationData.transportedProduct.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                المنتجات المرسلة
              </h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-right border-b">#</th>
                      <th className="px-4 py-2 text-right border-b">
                        اسم المنتج
                      </th>
                      <th className="px-4 py-2 text-right border-b">المعرف</th>
                      <th className="px-4 py-2 text-right border-b">النوع</th>
                      <th className="px-4 py-2 text-right border-b">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportationData.transportedProduct.map(
                      (product, index) => (
                        <tr
                          key={product.id}
                          className="border-b border-gray-200"
                        >
                          <td className="px-4 py-2 text-center">{index + 1}</td>
                          <td className="px-4 py-2 text-right">
                            {product.product}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {product.sku}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {product.category}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {product.quantity}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 print:mt-4">
          <p>تم إنشاء هذا الكود في {new Date().toLocaleDateString("ar-SA")}</p>
          <p className="mt-1">
            This code was generated on {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
      </div>

      {/* Back Button - Only visible on screen */}
      <div className="hidden print:hidden text-center mt-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          العودة
        </button>
      </div>
    </div>
  );
}

export default PrintTransportationCode;
