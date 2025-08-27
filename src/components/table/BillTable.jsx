import PropTypes from "prop-types";
import currencyFormatting from "../../util/currencyFormatting";
import dayjs from "dayjs";

const BillTable = ({ data = { products: [], customer: "" } }) => {
  const employeeName = JSON?.parse(localStorage.getItem("name"));
  const branchName = JSON?.parse(localStorage.getItem("branchName"));
  let totalWantedQuantity = 0;
  let totalPrice = 0;
  data?.products.forEach((purchase) => {
    totalWantedQuantity += Number(purchase.wantedQuantity);
    totalPrice +=
      Number(purchase.wantedQuantity) *
      Number(purchase.sellingPrice.match(/[\d,]+/)[0].replace(/,/g, ""));
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 ar-txt">فاتورة الشراء:</h2>
      <div className="flex items-center justify-between w-full my-4">
        <p className="ar-txt ">تاريخ الشراء: {dayjs().format("YYYY-MM-DD")}</p>
        <p className="ar-txt  ">اسم المشتري: {data?.customer}</p>
      </div>
      <div className="flex items-center justify-between w-full my-4">
        <p className="ar-txt ">فرع: {branchName}</p>
        <p className="ar-txt  "> منظم الفاتورة: {employeeName}</p>
      </div>
      <table className="w-full border border-black" dir="rtl">
        <thead>
          <tr className="bg-gray-700 text-white">
            <th className="py-2 px-4 border border-black">اسم المنتج</th>
            <th className="py-2 px-4 border border-black">التصنيف</th>
            <th className="py-2 px-4 border border-black">السعر</th>
            <th className="py-2 px-4 border border-black">الكمية</th>
            <th className="py-2 px-4 border border-black">المبلغ الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {data?.products.map((purchase) => (
            <tr key={purchase.id}>
              <td className="py-2 px-4 border-b border-l border-black">
                {purchase.productName}
              </td>
              <td className="py-2 px-4 border-b border-l border-black">
                {purchase.type}
              </td>
              <td className="py-2 px-4 border-b border-l border-black">
                {purchase.sellingPrice}
              </td>
              <td className="py-2 px-4 border-b border-l border-black">
                {purchase.wantedQuantity}
              </td>
              <td className="py-2 px-4 border-b border-l border-black">
                {currencyFormatting(
                  Number(purchase.wantedQuantity) *
                    Number(
                      purchase.sellingPrice.match(/[\d,]+/)[0].replace(/,/g, "")
                    )
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-2 px-4 border-b border-l border-black"></td>
            <td className="py-2 px-4 border-b border-l border-black"></td>
            <td className="py-2 px-4 border-b border-l border-black"></td>
            <td className="py-2 px-4 border-b border-l border-black">
              {totalWantedQuantity}
            </td>
            <td className="py-2 px-4 border-b border-l border-black">
              {currencyFormatting(totalPrice)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

BillTable.propTypes = {
  data: PropTypes.object,
};

export default BillTable;
