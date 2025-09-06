import { useEffect, useState } from "react";
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
    productId = unFormattedData.id; // Branch product ID (unique)
    console.log("Branch product detected, using ID:", productId);
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
      // If warehouse to branch is selected, uncheck branch to warehouse
      setIsBranchToWarehouse(false);
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
      // If branch to warehouse is selected, uncheck warehouse to branch
      setIsWarehouseToBranch(false);
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
        } else {
          // Regular Branch to Branch: fetch from warehouse endpoint
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

  const getBranches = async (url = "/branches") => {
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
  };

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

    const sendProducts = {
      source: selectedSource,
      destination: selectedDestination,
      transported_products: [
        ...selectedProducts.map((p) => {
          return {
            product: p.id,
            quantity: p.sendQuantity,
          };
        }),
      ],
    };

    console.log("Sending products with data:", sendProducts);
    console.log("Transfer type - Warehouse to Branch:", isWarehouseToBranch);
    console.log("Transfer type - Branch to Warehouse:", isBranchToWarehouse);

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
        console.log(sendProducts);
        
        if (result.isConfirmed) {
          axiosPrivate
            .post("/products/transportations", sendProducts)
            .then(() => {
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
              console.error("Transportation error:", error);
              console.error("Error response:", error?.response?.data);
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
  }, []);

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

          {/* Transfer Type Checkboxes */}
          <div className="flex items-center justify-center gap-8 py-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="branch-to-warehouse"
                checked={isBranchToWarehouse}
                onChange={handleBranchToWarehouse}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="branch-to-warehouse"
                className="text-sm font-medium text-gray-700"
              >
                من الفرع إلى المستودع الرئيسي
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="warehouse-to-branch"
                checked={isWarehouseToBranch}
                onChange={handleWarehouseToBranch}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
              />
              <label
                htmlFor="warehouse-to-branch"
                className="text-sm font-medium text-gray-700"
              >
                من المستودع الرئيسي إلى الفرع
              </label>
            </div>
          </div>

          <SectionTitle text={"اختر الفرع:"} />

          {/* Source Dropdown - Only show if not warehouse to branch */}
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

          {/* Destination Dropdown - Only show if not branch to warehouse */}
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
          <div className="text-center py-2 text-sm text-gray-600">
            {isWarehouseToBranch && (
              <span className="text-primary font-medium">
                النقل: من المستودع الرئيسي إلى الفرع المحدد
              </span>
            )}
            {isBranchToWarehouse && (
              <span className="text-primary font-medium">
                النقل: من الفرع المحدد إلى المستودع الرئيسي
              </span>
            )}
            {!isWarehouseToBranch && !isBranchToWarehouse && (
              <span className="text-gray-500">النقل: من فرع إلى فرع آخر</span>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col items-end justify-center mb-4">
          <SectionTitle text={"اختر المنتجات:"} />

          {/* Show transfer type instructions */}
          <div className="text-center py-2 text-sm text-gray-600 mb-4">
            {isWarehouseToBranch && (
              <span className="text-green-600 font-medium">
                ✓ عرض منتجات المستودع الرئيسي
              </span>
            )}
            {isBranchToWarehouse && selectedSource && (
              <span className="text-green-600 font-medium">
                ✓ عرض منتجات الفرع المحدد
              </span>
            )}
            {!isWarehouseToBranch && !isBranchToWarehouse && selectedSource && (
              <span className="text-green-600 font-medium">
                ✓ عرض منتجات الفرع المصدر
              </span>
            )}
            {!isWarehouseToBranch &&
              !isBranchToWarehouse &&
              !selectedSource && (
                <span className="text-gray-500">
                  يرجى تحديد الفرع المصدر أولاً
                </span>
              )}
            {isBranchToWarehouse && !selectedSource && (
              <span className="text-gray-500">
                يرجى تحديد الفرع المصدر أولاً
              </span>
            )}
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
                    key={`warehouse-${Date.now()}`}
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
                    key={`branch-${selectedSource}-${Date.now()}`}
                    handleSelectProduct={handleSelectProduct}
                    rowSelectionID={rowSelectionID}
                    columns={columns}
                    link={branchLink}
                  />
                );
              } else if (
                !isWarehouseToBranch &&
                !isBranchToWarehouse &&
                selectedSource
              ) {
                // Regular Branch to Branch: use ProductsTable with warehouse endpoint
                console.log(
                  "SendProducts: Using ProductsTable for branch-to-branch transfer"
                );
                return (
                  <ProductsTable
                    key={`branch-branch-${Date.now()}`}
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
                    key={`default-${Date.now()}`}
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
