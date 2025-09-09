import { useEffect, useState, useCallback } from "react";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import currencyFormatting from "../../util/currencyFormatting";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import useGoToBack from "../../hooks/useGoToBack";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import SectionTitle from "../../components/titles/SectionTitle";
import SearchComponent from "../../components/inputs/SearchComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BillTable from "../../components/table/BillTable";
import ReactDOMServer from "react-dom/server";

// Simple formatting function that handles the data structure from BranchProducts
const formatProduct = (productData) => {
  console.log("🎨 Formatting product data:", productData);

  // Check if we have the required fields
  if (!productData || !productData.id) {
    console.log("❌ Missing product ID in data:", productData);
    return null;
  }

  // The data is already in the correct format from BranchProducts
  // Just add the wantedQuantity field for the sales table
  const formattedProduct = {
    id: productData.id,
    profilePhoto: productData.profilePhoto,
    productName: productData.productName,
    sellingPrice: productData.sellingPrice, // Already formatted with currency
    quantity: productData.quantity,
    wantedQuantity: "", // Add this field for user input
  };

  console.log("✅ Formatted product:", formattedProduct);

  return formattedProduct;
};

function MakeSale() {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const branchID = JSON.parse(localStorage.getItem("branchID"));

  // Get data from navigation state
  const productsFromState = useLocationState("selectedProducts");

  // State
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);

  // Initialize products from navigation state
  useEffect(() => {
    console.log("🔄 MakeSale: Initializing products");
    console.log("📦 productsFromState:", productsFromState);

    if (productsFromState && productsFromState.length > 0) {
      console.log("✅ Products received from navigation state");

      // Format all products
      const formattedProducts = productsFromState
        .map((product) => {
          console.log("🎨 Formatting product from state:", product);
          const formatted = formatProduct(product);
          console.log("🎨 Formatted product from state:", formatted);
          return formatted;
        })
        .filter(Boolean);

      console.log("✨ Formatted products from state:", formattedProducts);
      setSelectedProducts(formattedProducts);
      setLoadingProducts(false);
    } else {
      console.log("❌ No products provided from navigation state");
      setLoadingProducts(false);
    }
  }, [productsFromState]);

  // Get customers
  const getCustomers = useCallback(
    async (link = "/sales/customers") => {
      try {
        setLoadingCustomers(true);
        const response = await axiosPrivate.get(link);
        console.log("MakeSale API Response:", response.data);

        const customersData = Array.isArray(response.data)
          ? response.data
          : response.data.results;

        // Format customers for the table
        const formattedCustomers = customersData.map((customer) => ({
          id: customer.id,
          fullName: `${customer.first_name} ${customer.last_name}`,
          nationalNumber: customer.national_number,
          phone: customer.phone_number,
        }));

        setCustomers(formattedCustomers);
        console.log("📋 Formatted customers:", formattedCustomers);
      } catch (e) {
        console.log("Error in MakeSale getCustomers:", e);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    },
    [axiosPrivate]
  );

  // Search customers
  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      getCustomers(`/sales/customers?search=${searchQuery}`);
    } else {
      getCustomers();
    }
  };

  // Handle customer selection
  const handleSelectCustomer = (customer) => {
    console.log("👤 Customer selected:", customer);
    setSelectedCustomer(customer);
  };

  // Calculate total price
  const calculateTotalPrice = (products) => {
    return products.reduce((total, row) => {
      const wantedQty = parseInt(row.wantedQuantity) || 0;
      const price =
        row.sellingPrice?.match(/[\d,]+/)?.[0]?.replace(/,/g, "") || 0;
      return total + wantedQty * parseInt(price);
    }, 0);
  };

  // Update product quantity
  const updateFunction = (id, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  // Delete product
  const deleteFunction = (id) => {
    setSelectedProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // Make sale
  const handleMakeSale = () => {
    if (!selectedCustomer) {
      Swal.fire({
        title: "خطأ!",
        text: "يرجى اختيار زبون أولاً",
        icon: "error",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const purchasedProducts = selectedProducts.filter(
      (p) => p.wantedQuantity && parseInt(p.wantedQuantity) > 0
    );

    if (purchasedProducts.length === 0) {
      Swal.fire({
        title: "خطأ!",
        text: "يرجى تحديد الكميات المطلوبة للمنتجات",
        icon: "error",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const saleProcess = {
      branch: branchID,
      customer: selectedCustomer.id,
      purchased_products: purchasedProducts.map((p) => ({
        product: p.id,
        quantity: parseInt(p.wantedQuantity),
      })),
    };

    console.log("🛒 Making sale with data:", saleProcess);

    axiosPrivate
      .post("/sales/purchases", JSON.stringify(saleProcess))
      .then(() => {
        Swal.fire({
          title: "تمت العملية بنجاح!",
          text: "تم إجراء عملية البيع بنجاح",
          icon: "success",
          confirmButtonText: "حسناً",
        }).then(() => {
          navigate("/salesOfficer");
        });
      })
      .catch((error) => {
        console.error("❌ Error making sale:", error);
        Swal.fire({
          title: "خطأ!",
          text: "حدث خطأ أثناء إجراء عملية البيع",
          icon: "error",
          confirmButtonText: "حسناً",
        });
      });
  };

  // Print bill
  const handlePrintBill = () => {
    if (!selectedCustomer) {
      Swal.fire({
        title: "خطأ!",
        text: "يرجى اختيار زبون أولاً",
        icon: "error",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const imageWindow = window.open("", "_blank");
    const billHTML = ReactDOMServer.renderToStaticMarkup(
      <BillTable
        customer={selectedCustomer}
        products={selectedProducts.filter(
          (p) => p.wantedQuantity && parseInt(p.wantedQuantity) > 0
        )}
        finalPrice={finalPrice}
      />
    );
    imageWindow.document.write(billHTML);
    imageWindow.document.close();
    imageWindow.print();
  };

  // Product table columns
  const productColumns = [
    {
      field: "id",
      headerName: "الرقم",
      width: 80,
    },
    {
      field: "profilePhoto",
      headerName: "الصورة",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="Product"
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      field: "productName",
      headerName: "اسم المنتج",
      width: 200,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
      width: 150,
    },
    {
      field: "quantity",
      headerName: "الكمية المتاحة",
      width: 150,
    },
    {
      field: "wantedQuantity",
      headerName: "الكمية المطلوبة",
      width: 150,
      renderCell: (params) => (
        <input
          type="number"
          value={params.value}
          onChange={(e) =>
            updateFunction(params.id, "wantedQuantity", e.target.value)
          }
          className="w-full p-2 border rounded"
          min="0"
          max={params.row.quantity}
        />
      ),
    },
    {
      field: "totalPrice",
      headerName: "المبلغ الإجمالي",
      width: 150,
      renderCell: (params) => {
        const wantedQty = parseInt(params.row.wantedQuantity) || 0;
        const price =
          params.row.sellingPrice?.match(/[\d,]+/)?.[0]?.replace(/,/g, "") || 0;
        return currencyFormatting(wantedQty * parseInt(price));
      },
    },
  ];

  // Customer table columns
  const customerColumns = [
    {
      field: "id",
      headerName: "الرقم",
      width: 180,
    },
    {
      field: "fullName",
      headerName: "اسم الزبون",
      width: 380,
    },
    {
      field: "nationalNumber",
      headerName: "الرقم الوطني",
      width: 200,
    },
    {
      field: "phone",
      headerName: "رقم الهاتف",
      width: 220,
    },
    {
      field: "select",
      headerName: "اختيار",
      width: 100,
      renderCell: (params) => (
        <button
          onClick={() => handleSelectCustomer(params.row)}
          disabled={selectedCustomer?.id === params.row.id}
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            selectedCustomer?.id === params.row.id
              ? "bg-green-500 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
          }`}
        >
          +
        </button>
      ),
    },
  ];

  // Calculate final price when products change
  useEffect(() => {
    setFinalPrice(calculateTotalPrice(selectedProducts));
  }, [selectedProducts]);

  // Load customers on mount
  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إجراء عملية بيع:"} />

      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        {/* Customer Search */}
        <SectionTitle text={"البحث عن الزبون:"} />
        <div className="flex items-center justify-center gap-4 w-full">
          <SearchComponent
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ابحث عن الزبون..."
          />
          <ButtonComponent variant={"search"} onClick={handleSearchClick} />
        </div>

        {/* Customer Table */}
        {loadingCustomers ? (
          <div className="flex justify-center items-center h-[200px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="w-full flex justify-center items-center">
            <DataTableEditRow
              columns={customerColumns}
              rows={customers}
              dir={"rtl"}
              showActions={false}
            />
          </div>
        )}
        {/* Selected Customer Info */}
        {selectedCustomer && (
          <div className="w-full p-4 bg-green-100 rounded-lg border-2 border-green-300">
            <div className="space-y-3">
              <TextInputComponent
                id="selectedCustomerName"
                label="الزبون المختار:"
                value={selectedCustomer.fullName}
                readOnly
              />
              <TextInputComponent
                id="selectedCustomerNationalNumber"
                label="الرقم الوطني:"
                value={selectedCustomer.nationalNumber}
                readOnly
              />
              <TextInputComponent
                id="selectedCustomerPhone"
                label="رقم الهاتف:"
                value={selectedCustomer.phone}
                readOnly
              />
            </div>
          </div>
        )}

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <SectionTitle text={"المنتجات المختارة:"} />
        )}

        {loadingProducts ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner />
          </div>
        ) : selectedProducts.length > 0 ? (
          <div className="flex flex-col justify-start items-center gap-4 p-4 w-full">
            <DataTableEditRow
              columns={productColumns}
              rows={selectedProducts}
              updateFunction={updateFunction}
              deleteFunction={deleteFunction}
              dir={"rtl"}
            />
            <p className="font-bold w-full text-right ar-txt">
              {`المبلغ الكلي: ${currencyFormatting(finalPrice)}`}
            </p>
          </div>
        ) : (
          <div className="text-gray-500 text-center py-8">
            لم يتم اختيار أي منتجات
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          {selectedProducts.length > 0 && (
            <ButtonComponent variant={"print"} onClick={handlePrintBill} />
          )}
          <ButtonComponent
            variant={"procedure"}
            onClick={handleMakeSale}
            disabled={selectedProducts.length === 0 || !selectedCustomer}
          />
        </div>
      </section>
    </main>
  );
}

export default MakeSale;
