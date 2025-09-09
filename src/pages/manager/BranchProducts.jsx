import Title from "../../components/titles/Title";
import ProductsTable from "../../components/table/ProductsTable";
import { useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import PropTypes from "prop-types";

function BranchProducts({ manager = false }) {
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const branchID = JSON.parse(localStorage.getItem("branchID"));
  const branchName = JSON.parse(localStorage.getItem("branchName"));

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleShowProductDetails = async (variantId) => {
    try {
      // Fetch product variant details
      const response = await axiosPrivate.get(
        `/products/variants/${variantId}`
      );
      const productData = response.data;

      // Create a beautiful modal to display product details
      const productDetailsHtml = `
        <div class="product-details-modal" style="text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <div style="flex: 1;">
              <img src="${
                productData.images?.[0]?.image || "/default-product.png"
              }" 
                   alt="Product Image" 
                   style="width: 100%; max-width: 300px; height: 250px; object-fit: cover; border-radius: 12px; border: 2px solid #3457D5;">
            </div>
            <div style="flex: 2;">
              <h2 style="color: #3457D5; margin-bottom: 15px; font-size: 24px;">${
                productData.product || "غير محدد"
              }</h2>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>SKU:</strong> ${
                  productData.sku || "غير محدد"
                }</p>
                <p style="margin: 5px 0;"><strong>الكمية:</strong> ${
                  productData.quantity || 0
                }</p>
                <p style="margin: 5px 0;"><strong>سعر التكلفة:</strong> ${
                  productData.wholesale_price
                    ? productData.wholesale_price.toLocaleString()
                    : "غير محدد"
                }</p>
                <p style="margin: 5px 0;"><strong>سعر المبيع:</strong> ${
                  productData.selling_price
                    ? productData.selling_price.toLocaleString()
                    : "غير محدد"
                }</p>
                <p style="margin: 5px 0;"> ${
                  productData.category || "غير محدد"
                } <strong>:التصنيف</strong></p>
              </div>
            </div>
          </div>
          
          ${
            productData.options && productData.options.length > 0
              ? `
            <div style="margin-top: 20px;">
              <h3 style="color: #3457D5; margin-bottom: 15px; font-size: 20px;">خصائص المنتج</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                ${productData.options
                  .map(
                    (option) => `
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 10px; text-align: center;">
                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">${
                      option.attribute || "خاصية"
                    }</div>
                    <div style="font-size: 18px; font-weight: bold;">${
                      option.option || "قيمة"
                    }</div>
                    ${
                      option.unit
                        ? `<div style="font-size: 12px; opacity: 0.8; margin-top: 5px;">${option.unit}</div>`
                        : ""
                    }
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
          
          ${
            productData.qr_code
              ? `
            <div style="margin-top: 20px; text-align: center;">
              <h3 style="color: #3457D5; margin-bottom: 15px;">رمز QR</h3>
              <img src="${productData.qr_code}" alt="QR Code" style="max-width: 150px; border: 1px solid #ddd; border-radius: 8px;">
            </div>
          `
              : ""
          }
        </div>
      `;

      Swal.fire({
        title: "تفاصيل المنتج",
        html: productDetailsHtml,
        width: "800px",
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
          popup: "product-details-popup",
        },
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      Swal.fire({
        title: "خطأ",
        text: "حدث خطأ أثناء جلب تفاصيل المنتج",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
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
        // params.id corresponds to variant id from /products/variants
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            <ButtonComponent
              variant={"show"}
              small={true}
              onClick={() => handleShowProductDetails(params.id)}
            />
          </div>
        );
      },
    },
  ];
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={`قائمة منتجات فرع ${branchName}:`} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">

        {rowSelectionID.length > 0 && (
          <ButtonComponent
            textButton="إجراء عملية بيع"
            variant={"purchases"}
            onClick={() => {
              navigate("/salesOfficer/makeSale", {
                state: { productsIDs: rowSelectionID },
              });
            }}
          />
        )}
      </div>
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        <ProductsTable
          handleSelectProduct={handleSelectProduct}
          rowSelectionID={rowSelectionID}
          columns={columns}
          link={`/branches/products?branch=${branchID}`}
        />
      </section>
    </main>
  );
}

BranchProducts.propTypes = {
  manager: PropTypes.bool,
};

export default BranchProducts;
