import { useEffect, useState, useCallback } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import currencyFormatting from "../../util/currencyFormatting";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import ProductsTable from "../../components/table/ProductsTable";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import BranchSelectedProductsTable from "../../components/table/BranchSelectedProductsTable";
import Swal from "sweetalert2";

const formatting = (unFormattedData) => {
  console.log("Formatting function called with:", unFormattedData);

  // Handle different data structures from warehouse vs branch endpoints
  let productData, categoryData, quantityValue, productId;

  if (unFormattedData?.product && typeof unFormattedData.product === "object") {
    // Branch endpoint structure: data has nested product object
    productData = unFormattedData.product;
    categoryData = unFormattedData.product.category;
    quantityValue = unFormattedData.quantity; // Branch quantity
    productId = unFormattedData.product.id; // Use the MAIN PRODUCT ID, not branch product ID
    console.log("Branch product detected, using MAIN PRODUCT ID:", productId);
    console.log("Branch product ID (unFormattedData.id):", unFormattedData.id);
    console.log(
      "Main product ID (unFormattedData.product.id):",
      unFormattedData.product.id
    );
  } else {
    // Warehouse endpoint structure: data is direct product
    productData = unFormattedData;
    categoryData = unFormattedData.category;
    quantityValue = unFormattedData.quantity; // Warehouse quantity
    productId = unFormattedData.id; // Product ID
    console.log("Warehouse product detected, using ID:", productId);
  }

  // Ensure we have a valid ID
  if (!productId) {
    console.error("No valid ID found in product data:", unFormattedData);
    return null;
  }

  const isPhone =
    typeof categoryData === "string" && categoryData.toLowerCase() === "phone";

  const rowsData = {
    id: productId, // Always use the determined product ID
    profilePhoto: isPhone ? phone : accessor,
    barcode: productData.qr_code ? productData.qr_code : "لايوجد",
    productName: productData.product_name || productData.product,
    type: categoryData,
    sellingPrice: currencyFormatting(productData.selling_price || 0),
    wholesalePrice: currencyFormatting(productData.wholesale_price || 0),
    totalQuantity: quantityValue,
    sku: productData.sku,
    sendQuantity: 0,
    options: <ButtonComponent />,
  };

  console.log("Formatted rowsData:", rowsData);
  return rowsData;
};

const formatBranches = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    title: `${d.number} ${d.city_name}`,
  }));
  return data;
};

function SendProducts() {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const [branches, setBranches] = useState([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [rowSelectionID, setRowSelectionID] = useState([]);

  // New state for transfer type checkboxes
  const [isWarehouseToBranch, setIsWarehouseToBranch] = useState(false);
  const [isBranchToWarehouse, setIsBranchToWarehouse] = useState(false);
  const [isBranchToBranch, setIsBranchToBranch] = useState(false);

  // Products table will handle its own data fetching via link prop

  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  const handleSourceSelect = (e) => {
    const { value } = e;
    setSelectedSource(value);
    // Clear selections when source changes - ProductsTable will handle data fetching
    setRowSelectionID([]);
    setSelectedProducts([]);
  };

  const handleDestinationSelect = (e) => {
    const { value } = e;
    setSelectedDestination(value);
  };

  // ProductsTable component will handle its own data fetching via link prop

  // Handle warehouse to branch checkbox
  const handleWarehouseToBranch = (e) => {
    const checked = e.target.checked;
    setIsWarehouseToBranch(checked);

    if (checked) {
      // If warehouse to branch is selected, uncheck other options
      setIsBranchToWarehouse(false);
      setIsBranchToBranch(false);
      // Set source to null (warehouse) and clear destination
      setSelectedSource(null);
      setSelectedDestination("");
      // Clear selections - ProductsTable will handle data fetching
      setRowSelectionID([]);
      setSelectedProducts([]);
    } else {
      // If unchecked, clear both
      setSelectedSource("");
      setSelectedDestination("");
      setRowSelectionID([]);
      setSelectedProducts([]);
    }
  };

  // Handle branch to warehouse checkbox
  const handleBranchToWarehouse = (e) => {
    const checked = e.target.checked;
    setIsBranchToWarehouse(checked);

    if (checked) {
      // If branch to warehouse is selected, uncheck other options
      setIsWarehouseToBranch(false);
      setIsBranchToBranch(false);
      // Set destination to null (warehouse) and clear source
      setSelectedDestination(null);
      setSelectedSource("");
      // Clear selections - ProductsTable will handle data fetching
      setRowSelectionID([]);
      setSelectedProducts([]);
    } else {
      // If unchecked, clear both
      setSelectedSource("");
      setSelectedDestination("");
      setRowSelectionID([]);
      setSelectedProducts([]);
    }
  };

  // Handle branch to branch checkbox
  const handleBranchToBranch = (e) => {
    const checked = e.target.checked;
    setIsBranchToBranch(checked);

    if (checked) {
      // If branch to branch is selected, uncheck other options
      setIsWarehouseToBranch(false);
      setIsBranchToWarehouse(false);
      // Clear both source and destination to force user selection
      setSelectedSource("");
      setSelectedDestination("");
      // Clear selections - ProductsTable will handle data fetching
      setRowSelectionID([]);
      setSelectedProducts([]);
    } else {
      // If unchecked, clear both
      setSelectedSource("");
      setSelectedDestination("");
      setRowSelectionID([]);
      setSelectedProducts([]);
    }
  };

  const handleClickBack = useGoToBack();

  const getSelectedProducts = async () => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      for (let i = 0; i < rowSelectionID.length; i++) {
        let endpoint;
        let response;

        if (isWarehouseToBranch) {
          // Warehouse to Branch: fetch from warehouse endpoint
          endpoint = `/products/variants/${rowSelectionID[i]}`;
          console.log("Fetching warehouse product details from:", endpoint);
          response = await axiosPrivate.get(endpoint);
          // Warehouse endpoint returns direct product data
          const productData = response?.data;
          console.log("Warehouse product data:", productData);

          const formattedProduct = formatting(productData);
          console.log("Formatted warehouse product:", formattedProduct);

          if (formattedProduct && formattedProduct.id) {
            console.log(
              "Adding formatted warehouse product to selectedProducts:",
              formattedProduct
            );
            setSelectedProducts((prev) => [...prev, formattedProduct]);
          } else {
            console.error(
              "Failed to format warehouse product or missing ID:",
              productData,
              formattedProduct
            );
          }
        } else if (isBranchToWarehouse) {
          // Branch to Warehouse: fetch from branch endpoint to get branch-specific quantity
          // The rowSelectionID[i] is the branch product ID from the table
          endpoint = `/branches/products/${rowSelectionID[i]}?branch=${selectedSource}`;
          console.log("Fetching branch product details from:", endpoint);
          response = await axiosPrivate.get(endpoint);

          // Branch endpoint returns paginated response, extract the first result
          const branchProductData = response?.data?.results?.[0];
          console.log("Branch product data:", branchProductData);

          if (branchProductData) {
            const formattedProduct = formatting(branchProductData);
            console.log("Formatted branch product:", formattedProduct);

            if (formattedProduct && formattedProduct.id) {
              console.log(
                "Adding formatted branch product to selectedProducts:",
                formattedProduct
              );
              setSelectedProducts((prev) => [...prev, formattedProduct]);
            } else {
              console.error(
                "Failed to format branch product or missing ID:",
                branchProductData,
                formattedProduct
              );
            }
          } else {
            console.error(
              "No branch product data found in response:",
              response?.data
            );
          }
        } else if (isBranchToBranch) {
          // Branch to Branch: fetch from source branch endpoint to get branch-specific quantity
          endpoint = `/branches/products/${rowSelectionID[i]}?branch=${selectedSource}`;
          console.log(
            "Fetching branch product details for branch-to-branch from:",
            endpoint
          );
          response = await axiosPrivate.get(endpoint);

          // Branch endpoint returns paginated response, extract the first result
          const branchProductData = response?.data?.results?.[0];
          console.log(
            "Branch product data for branch-to-branch:",
            branchProductData
          );

          if (branchProductData) {
            const formattedProduct = formatting(branchProductData);
            console.log(
              "Formatted branch product for branch-to-branch:",
              formattedProduct
            );

            if (formattedProduct && formattedProduct.id) {
              console.log(
                "Adding formatted branch product to selectedProducts for branch-to-branch:",
                formattedProduct
              );
              setSelectedProducts((prev) => [...prev, formattedProduct]);
            } else {
              console.error(
                "Failed to format branch product or missing ID for branch-to-branch:",
                branchProductData,
                formattedProduct
              );
            }
          } else {
            console.error(
              "No branch product data found in response for branch-to-branch:",
              response?.data
            );
          }
        } else {
          // Fallback: fetch from warehouse endpoint
          endpoint = `/products/variants/${rowSelectionID[i]}`;
          console.log("Fetching product details from:", endpoint);
          response = await axiosPrivate.get(endpoint);
          // Warehouse endpoint returns direct product data
          const productData = response?.data;
          console.log("Branch-to-branch product data:", productData);

          const formattedProduct = formatting(productData);
          console.log("Formatted branch-to-branch product:", formattedProduct);

          if (formattedProduct && formattedProduct.id) {
            console.log(
              "Adding formatted branch-to-branch product to selectedProducts:",
              formattedProduct
            );
            setSelectedProducts((prev) => [...prev, formattedProduct]);
          } else {
            console.error(
              "Failed to format branch-to-branch product or missing ID:",
              productData,
              formattedProduct
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const ShowSelectedProducts = () => {
    setSelectedProducts([]);
    getSelectedProducts();
  };

  const getBranches = useCallback(
    async (url = "/branches") => {
      try {
        const response = await axiosPrivate.get(url);
        const formattedData = formatBranches(response.data.results);
        setBranches((prev) => [...prev, ...formattedData]);
        if (response.data.next) {
          getBranches(response.data.next);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [axiosPrivate]
  );

  const updateFunction = (newRow) => {
    console.log("SendProducts: updateFunction called with:", newRow);
    console.log(
      "SendProducts: Current selectedProducts before update:",
      selectedProducts
    );

    const updatedProducts = selectedProducts.map((row) =>
      row.id === newRow.id ? newRow : row
    );
    console.log("SendProducts: Updated selectedProducts:", updatedProducts);

    setSelectedProducts(updatedProducts);
  };

  const deleteFunction = (id) => {
    const updatedSelectedProducts = selectedProducts.filter((p) => p.id != id);
    setSelectedProducts(updatedSelectedProducts);
  };

  const handleSendProducts = () => {
    // Validation: Check if transfer type is selected
    if (
      !isWarehouseToBranch &&
      !isBranchToWarehouse &&
      !isBranchToBranch &&
      !selectedSource &&
      !selectedDestination
    ) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى اختيار نوع النقل أو تحديد الفرع المصدر والفرع الهدف",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    // Additional validation for branch-to-branch
    if (isBranchToBranch && (!selectedSource || !selectedDestination)) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى تحديد الفرع المصدر والفرع الهدف للنقل من فرع إلى فرع",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    // Validation: Check if products are selected
    if (selectedProducts.length === 0) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى اختيار المنتجات المراد إرسالها",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    // Validation: Check if quantities are valid
    const invalidProducts = selectedProducts.filter(
      (p) => !p.sendQuantity || p.sendQuantity <= 0
    );
    if (invalidProducts.length > 0) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى تحديد الكمية المراد إرسالها لجميع المنتجات المختارة",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    // Detailed logging for debugging
    console.log("=== SEND PRODUCTS DEBUG INFO ===");
    console.log("Selected Products Array:", selectedProducts);
    console.log("Selected Products Count:", selectedProducts.length);
    console.log("Row Selection IDs:", rowSelectionID);
    console.log("Selected Source:", selectedSource);
    console.log("Selected Destination:", selectedDestination);
    console.log("Transfer Types:");
    console.log("  - isWarehouseToBranch:", isWarehouseToBranch);
    console.log("  - isBranchToWarehouse:", isBranchToWarehouse);
    console.log("  - isBranchToBranch:", isBranchToBranch);

    // Log each selected product in detail
    selectedProducts.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        name: product.name,
        sendQuantity: product.sendQuantity,
        availableQuantity: product.quantity,
        wholesale_price: product.wholesale_price,
        selling_price: product.selling_price,
        fullProduct: product,
      });
    });

    const sendProducts = {
      source: isWarehouseToBranch ? null : selectedSource, // null for warehouse
      destination: isBranchToWarehouse ? null : selectedDestination, // null for warehouse
      transported_products: [
        ...selectedProducts.map((p) => {
          return {
            product: p.id,
            quantity: p.sendQuantity,
          };
        }),
      ],
    };

    console.log("=== FINAL PAYLOAD BEING SENT ===");
    console.log("Complete sendProducts object:", sendProducts);
    console.log("Transportation endpoint will be: /transportations/");
    console.log("=================================");

    const transportProducts = () => {
      Swal.fire({
        title: "هل أنت متأكد من عملية إرسال المنتجات",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          console.log("=== API REQUEST DETAILS ===");
          console.log("Making POST request to: /products/transportations");
          console.log("Request payload:", sendProducts);
          console.log("Request headers:", axiosPrivate.defaults.headers);
          console.log("===========================");

          axiosPrivate
            .post("/products/transportations", sendProducts)
            .then((response) => {
              console.log("=== API SUCCESS RESPONSE ===");
              console.log("Response status:", response.status);
              console.log("Response data:", response.data);
              console.log("=============================");

              Swal.fire({
                title: "تمت عملية الإرسال بنجاح",
                icon: "success",
              });
              setSelectedProducts([]);
              // Reset form
              setIsWarehouseToBranch(false);
              setIsBranchToWarehouse(false);
              setSelectedSource("");
              setSelectedDestination("");
            })
            .catch((error) => {
              console.log("=== API ERROR RESPONSE ===");
              console.error("Full error object:", error);
              console.error("Error message:", error.message);
              console.error("Error status:", error.response?.status);
              console.error("Error status text:", error.response?.statusText);
              console.error("Error response data:", error?.response?.data);
              console.error("Error request config:", error.config);
              console.log("==========================");

              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في إرسال المنتجات",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    transportProducts();
  };

  const selectedProductsColumns = [
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
      field: "sku",
      headerName: "المعرف",
      width: 150,
    },
    {
      field: "type",
      headerName: "النوع",
      width: 100,
    },
    {
      field: "wholesalePrice",
      headerName: "سعر التكلفة",
      width: 100,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
      width: 100,
    },

    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      flex: 1,
    },
    {
      field: "sendQuantity",
      headerName: "الكمية المراد إرسالها",
      flex: 1,
      editable: true,
      type: "number",
    },
  ];

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
      field: "sku",
      headerName: "المعرف",
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
      headerName: "الكمية المتوفرة",
      flex: 1,
    },
  ];

  useEffect(() => {
    getBranches();
  }, [getBranches]);

  // Debug effect to log state changes
  useEffect(() => {
    console.log("Transfer state changed:", {
      isWarehouseToBranch,
      isBranchToWarehouse,
      selectedSource,
      selectedDestination,
    });
  }, [
    isWarehouseToBranch,
    isBranchToWarehouse,
    selectedSource,
    selectedDestination,
  ]);

  // Clear selections when transfer type or source changes
  useEffect(() => {
    console.log("Clearing selections due to transfer type/source change");
    setRowSelectionID([]);
    setSelectedProducts([]);
  }, [isWarehouseToBranch, isBranchToWarehouse, selectedSource]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إرسال منتجات:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow">
        <div className="w-full">
          <SectionTitle text={"نوع النقل:"} />

          {/* Transfer Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
            {/* Branch to Warehouse Card */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isBranchToWarehouse
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() =>
                handleBranchToWarehouse({
                  target: { checked: !isBranchToWarehouse },
                })
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="branch-to-warehouse"
                    checked={isBranchToWarehouse}
                    onChange={handleBranchToWarehouse}
                    className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor="branch-to-warehouse"
                    className="text-lg font-semibold text-gray-800 cursor-pointer"
                  >
                    من الفرع إلى المستودع
                  </label>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isBranchToWarehouse ? "bg-primary" : "bg-gray-300"
                  }`}
                ></div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                نقل المنتجات من أحد الفروع إلى المستودع الرئيسي
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                فرع → مستودع رئيسي
              </div>
            </div>

            {/* Warehouse to Branch Card */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isWarehouseToBranch
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() =>
                handleWarehouseToBranch({
                  target: { checked: !isWarehouseToBranch },
                })
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="warehouse-to-branch"
                    checked={isWarehouseToBranch}
                    onChange={handleWarehouseToBranch}
                    className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor="warehouse-to-branch"
                    className="text-lg font-semibold text-gray-800 cursor-pointer"
                  >
                    من المستودع إلى الفرع
                  </label>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isWarehouseToBranch ? "bg-primary" : "bg-gray-300"
                  }`}
                ></div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                نقل المنتجات من المستودع الرئيسي إلى أحد الفروع
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                مستودع رئيسي → فرع
              </div>
            </div>

            {/* Branch to Branch Card */}
            <div
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                isBranchToBranch
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() =>
                handleBranchToBranch({ target: { checked: !isBranchToBranch } })
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="branch-to-branch"
                    checked={isBranchToBranch}
                    onChange={handleBranchToBranch}
                    className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor="branch-to-branch"
                    className="text-lg font-semibold text-gray-800 cursor-pointer"
                  >
                    من الفرع إلى الفرع
                  </label>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isBranchToBranch ? "bg-primary" : "bg-gray-300"
                  }`}
                ></div>
              </div>
              <div className="text-sm text-gray-600 leading-relaxed">
                نقل المنتجات مباشرة بين فرعين مختلفين
              </div>
              <div className="mt-3 flex items-center text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                فرع → فرع آخر
              </div>
            </div>
          </div>

          <SectionTitle text={"اختر الفرع:"} />

          {/* Source Dropdown - Show for branch-to-warehouse and branch-to-branch */}
          {!isWarehouseToBranch && (
            <div className="flex items-start justify-center py-5">
              <DropDownComponent
                data={branches}
                label={"إرسال من فرع:"}
                ButtonText={"الفرع"}
                id={"source"}
                dataValue="id"
                dataTitle="title"
                onSelectEvent={handleSourceSelect}
                disabled={isBranchToWarehouse}
              />
            </div>
          )}

          {/* Destination Dropdown - Show for warehouse-to-branch and branch-to-branch */}
          {!isBranchToWarehouse && (
            <div className="flex items-start justify-center py-5">
              <DropDownComponent
                data={branches}
                label={"إرسال إلى فرع:"}
                ButtonText={"الفرع"}
                id={"destination"}
                dataValue="id"
                dataTitle="title"
                onSelectEvent={handleDestinationSelect}
                disabled={isWarehouseToBranch}
              />
            </div>
          )}

          {/* Show current selection status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="text-center">
              {isWarehouseToBranch && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-primary font-semibold text-lg">
                    النقل: من المستودع الرئيسي إلى الفرع المحدد
                  </span>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
              )}
              {isBranchToWarehouse && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-primary font-semibold text-lg">
                    النقل: من الفرع المحدد إلى المستودع الرئيسي
                  </span>
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                </div>
              )}
              {isBranchToBranch && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-primary font-semibold text-lg">
                    النقل: من الفرع المصدر إلى الفرع الهدف
                  </span>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              )}
              {!isWarehouseToBranch &&
                !isBranchToWarehouse &&
                !isBranchToBranch && (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-500 font-medium text-lg">
                      النقل: من فرع إلى فرع آخر
                    </span>
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  </div>
                )}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col items-end justify-center mb-4">
          <SectionTitle text={"اختر المنتجات:"} />

          {/* Show transfer type instructions */}
          <div className="mb-6 p-4 rounded-lg border-l-4 border-l-primary bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">i</span>
              </div>
              <div className="flex-1">
                {isWarehouseToBranch && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-green-700 font-semibold">
                      عرض منتجات المستودع الرئيسي
                    </span>
                  </div>
                )}
                {isBranchToWarehouse && selectedSource && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-green-700 font-semibold">
                      عرض منتجات الفرع المحدد
                    </span>
                  </div>
                )}
                {isBranchToBranch && selectedSource && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-green-700 font-semibold">
                      عرض منتجات الفرع المصدر
                    </span>
                  </div>
                )}
                {!isWarehouseToBranch &&
                  !isBranchToWarehouse &&
                  !isBranchToBranch &&
                  selectedSource && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-lg">✓</span>
                      <span className="text-green-700 font-semibold">
                        عرض منتجات الفرع المصدر
                      </span>
                    </div>
                  )}
                {!isWarehouseToBranch &&
                  !isBranchToWarehouse &&
                  !isBranchToBranch &&
                  !selectedSource && (
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 text-lg">⚠</span>
                      <span className="text-orange-700 font-medium">
                        يرجى تحديد الفرع المصدر أولاً
                      </span>
                    </div>
                  )}
                {isBranchToWarehouse && !selectedSource && (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-lg">⚠</span>
                    <span className="text-orange-700 font-medium">
                      يرجى تحديد الفرع المصدر أولاً
                    </span>
                  </div>
                )}
                {isBranchToBranch && !selectedSource && (
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-lg">⚠</span>
                    <span className="text-orange-700 font-medium">
                      يرجى تحديد الفرع المصدر أولاً
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-4">
            {(() => {
              if (isWarehouseToBranch) {
                // Warehouse to Branch: use ProductsTable with warehouse endpoint
                console.log(
                  "SendProducts: Using ProductsTable for warehouse products"
                );
                return (
                  <ProductsTable
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link="/products/variants"
                  />
                );
              } else if (isBranchToWarehouse) {
                // Branch to Warehouse: always use ProductsTable with branch endpoint
                // This ensures we show branch products immediately when checkbox is checked
                const branchLink = selectedSource
                  ? `/branches/products?branch=${selectedSource}`
                  : "/products/variants"; // Fallback to warehouse if no branch selected

                console.log(
                  "SendProducts: Using ProductsTable for branch products with link:",
                  branchLink
                );
                return (
                  <ProductsTable
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link={branchLink}
                  />
                );
              } else if (isBranchToBranch) {
                // Branch to Branch: use ProductsTable with branch endpoint for source branch
                const branchLink = selectedSource
                  ? `/branches/products?branch=${selectedSource}`
                  : "/products/variants"; // Fallback to warehouse if no branch selected

                console.log(
                  "SendProducts: Using ProductsTable for branch-to-branch with source branch link:",
                  branchLink
                );
                return (
                  <ProductsTable
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link={branchLink}
                  />
                );
              } else if (
                !isWarehouseToBranch &&
                !isBranchToWarehouse &&
                !isBranchToBranch &&
                selectedSource
              ) {
                // Legacy Branch to Branch: use ProductsTable with warehouse endpoint
                console.log(
                  "SendProducts: Using ProductsTable for legacy branch-to-branch transfer"
                );
                return (
                  <ProductsTable
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link="/products/variants"
                  />
                );
              } else {
                // Default: show ProductsTable with warehouse endpoint
                console.log("SendProducts: Using default ProductsTable");
                return (
                  <ProductsTable
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link="/products/variants"
                  />
                );
              }
            })()}
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-4 pt-8">
            <ButtonComponent
              textButton="عرض المنتجات المختارة"
              variant={"show"}
              onClick={ShowSelectedProducts}
            />
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-start">
          {selectedProducts.length > 0 && (
            <SectionTitle text={"المنتجات المختارة:"} />
          )}
          {selectedProducts.length ? (
            loadingProducts ? (
              <div className="flex justify-center items-center h-[400px]">
                <LoadingSpinner />
              </div>
            ) : errorProducts ? (
              <NoDataError error={errorProducts} />
            ) : isBranchToWarehouse ? (
              // Use BranchSelectedProductsTable for branch products
              <BranchSelectedProductsTable
                rows={selectedProducts}
                updateFunction={updateFunction}
                deleteFunction={deleteFunction}
                dir={"rtl"}
              />
            ) : (
              // Use DataTableEditRow for warehouse products
              <DataTableEditRow
                columns={selectedProductsColumns}
                rows={selectedProducts}
                updateFunction={updateFunction}
                deleteFunction={deleteFunction}
                dir={"rtl"}
              />
            )
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-4 w-full mt-8">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"procedure"}
            onClick={handleSendProducts}
            disabled={selectedProducts.length == 0}
          />
        </div>
      </section>
    </main>
  );
}

export default SendProducts;
