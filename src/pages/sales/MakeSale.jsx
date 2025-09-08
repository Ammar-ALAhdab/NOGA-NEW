import { useEffect, useState, useCallback } from "react";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import currencyFormatting from "../../util/currencyFormatting";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import NoDataError from "../../components/actions/NoDataError";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import useGoToBack from "../../hooks/useGoToBack";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import SectionTitle from "../../components/titles/SectionTitle";
import SearchComponent from "../../components/inputs/SearchComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import useSaleContext from "../../hooks/useSaleContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BillTable from "../../components/table/BillTable";
import ReactDOMServer from "react-dom/server";

const formatting = (unFormattedData) => {
  const rowsData = {
    id: unFormattedData.product.id,
    profilePhoto:
      unFormattedData.product.category_name?.toLowerCase() === "phone"
        ? phone
        : accessor,
    barcode: unFormattedData.product.qr_code
      ? unFormattedData.product.qr_code
      : "لايوجد",
    productName: unFormattedData.product.product_name,
    type:
      unFormattedData.product.category_name?.toLowerCase() === "phone"
        ? "موبايل"
        : "إكسسوار",
    wholesalePrice: currencyFormatting(unFormattedData.product.wholesale_price),
    sellingPrice: currencyFormatting(unFormattedData.product.selling_price),
    quantity: unFormattedData.quantity,
    wantedQuantity: "",
    options: <ButtonComponent />,
  };
  return rowsData;
};

function MakeSale() {
  const { selectedProducts, setSelectedProducts } = useSaleContext();
  const uniqueIds = new Set();
  // Filter the original array to keep only unique objects based on the 'id' property
  const uniqueSelectedProducts = selectedProducts.filter((obj) => {
    if (!uniqueIds.has(obj.id)) {
      uniqueIds.add(obj.id);
      return true;
    }
    return false;
  });
  const productIDs = useLocationState("productsIDs");

  // Debug logging
  console.log("🔍 MakeSale Debug Info:");
  console.log("📦 productIDs from navigation state:", productIDs);
  console.log("🛒 selectedProducts from context:", selectedProducts);
  console.log("✨ uniqueSelectedProducts:", uniqueSelectedProducts);
  console.log("🔢 selectedProducts length:", selectedProducts.length);
  console.log(
    "🔢 uniqueSelectedProducts length:",
    uniqueSelectedProducts.length
  );
  const [customer, setCustomer] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [errorCustomer, setErrorCustomer] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [finalPrice, setFinalPrice] = useState(0);
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const branchID = JSON.parse(localStorage.getItem("branchID"));

  const updateFunction = (newRow) => {
    setSelectedProducts(
      uniqueSelectedProducts.map((row) => (row.id === newRow.id ? newRow : row))
    );
  };

  const deleteFunction = (id) => {
    setSelectedProducts(uniqueSelectedProducts.filter((p) => p.id != id));
  };

  const handleSearchClick = () => {
    getCustomers(`/sales/customers?search=${searchQuery}`);
  };

  const calculateTotalPrice = (rows) => {
    let total = 0;
    rows?.forEach((row) => {
      const quantity = row?.wantedQuantity === "" ? 0 : row?.wantedQuantity;
      const priceMatch = row?.sellingPrice?.match(/[\d,]+/);
      if (priceMatch && priceMatch[0]) {
        const price = parseFloat(priceMatch[0].replace(/,/g, ""));
        total += quantity * price;
      }
    });
    return total;
  };

  const getCustomers = async (link = "/sales/customers") => {
    try {
      setLoadingCustomer(true);
      setErrorCustomer(false);
      setCustomer({});
      const response = await axiosPrivate.get(link);
      console.log("MakeSale API Response:", response.data);

      // Handle both array response and paginated response
      const customersData = Array.isArray(response.data)
        ? response.data
        : response.data.results;

      if (customersData && customersData.length > 0) {
        const { first_name, last_name, national_number, id } = customersData[0];
        const customer = {
          fullName: `${first_name} ${last_name}`,
          id: id,
          nationalNumber: national_number,
        };
        setCustomer(customer);
      } else if (customersData.length === 0) {
        setErrorCustomer(true);
      }
    } catch (e) {
      console.log("Error in MakeSale getCustomers:", e);
    } finally {
      setLoadingCustomer(false);
    }
  };

  const getProducts = useCallback(async () => {
    console.log("🚀 getProducts called with productIDs:", productIDs);
    console.log("🏢 branchID:", branchID);

    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      if (!productIDs || productIDs.length === 0) {
        console.log("⚠️ No productIDs provided, skipping fetch");
        setLoadingProducts(false);
        return;
      }

      // Clear existing selected products before fetching new ones
      setSelectedProducts([]);

      for (let i = 0; i < productIDs?.length; i++) {
        console.log(
          `📡 Fetching product ${i + 1}/${productIDs.length}:`,
          productIDs[i]
        );
        const response = await axiosPrivate.get(
          `/branches/products?branch=${branchID}&product__id=${productIDs[i]}`
        );
        console.log(
          `📦 API Response for product ${productIDs[i]}:`,
          response.data
        );

        const p = response.data?.results;
        if (p && p.length > 0) {
          console.log(`✅ Found product data:`, p[0]);
          const formattedProduct = formatting(p[0]);
          console.log(`🎨 Formatted product:`, formattedProduct);

          setSelectedProducts((prev) => {
            const newProducts = [...prev, formattedProduct];
            console.log(`🔄 Updated selectedProducts:`, newProducts);
            return newProducts;
          });
        } else {
          console.log(`❌ No product data found for ID:`, productIDs[i]);
        }
      }
    } catch (error) {
      console.log("💥 Error in getProducts:", error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
      console.log("🏁 getProducts completed");
    }
  }, [productIDs, branchID, axiosPrivate, setSelectedProducts]);

  const handleMakeSale = () => {
    const saleProcess = {
      branch: branchID,
      customer: customer.id,
      purchased_products: [
        ...uniqueSelectedProducts.map((p) => {
          return {
            product: p.id,
            quantity: p.wantedQuantity,
          };
        }),
      ],
    };
    const purchaseProducts = () => {
      Swal.fire({
        title: "هل أنت متأكد من عملية الشراء",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          axiosPrivate
            .post("/sales/purchases", JSON.stringify(saleProcess))
            .then(() => {
              Swal.fire({
                title: "تمت عملية الشراء بنجاح",
                icon: "success",
              });
              setSelectedProducts([]);
              setTimeout(() => {
                handlePrintBill();
              }, 1500);
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في عملية الشراء",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    purchaseProducts();
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
      headerName: "الكمية المتوفرة",
      width: 150,
    },
    {
      field: "wantedQuantity",
      headerName: "الكمية المطلوبة",
      flex: 1,
      editable: true,
    },
    {
      field: "totalPrice",
      headerName: "المبلغ الإجمالي",
      width: 150,
      renderCell: (params) => {
        // Return Total Price
        return currencyFormatting(
          params?.row?.wantedQuantity *
            params?.row?.sellingPrice?.match(/[\d,]+/)[0].replace(/,/g, "")
        );
      },
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 150,
      sortable: false,
      renderCell: () => {
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            <ButtonComponent variant={"show"} small={true} />
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    setFinalPrice(calculateTotalPrice(uniqueSelectedProducts));
  }, [uniqueSelectedProducts]);

  useEffect(() => {
    console.log("🔄 useEffect triggered - calling getProducts");
    console.log("📋 Current productIDs:", productIDs);

    // Only call getProducts if we have productIDs
    if (productIDs && productIDs.length > 0) {
      getProducts();
    } else {
      console.log("⚠️ No productIDs, skipping getProducts call");
      setLoadingProducts(false);
    }
  }, [getProducts, productIDs]);

  const handlePrintBill = () => {
    // Create a new window
    const imageWindow = window.open("", "_blank");

    // Render the BillTable component to an HTML string
    const billTableHtml = ReactDOMServer.renderToStaticMarkup(
      <BillTable
        data={{
          products: uniqueSelectedProducts,
          customer: customer.fullName,
        }}
      />
    );

    // Write the HTML string to the new window with inline styles
    if (imageWindow) {
      imageWindow.document.write(`
            <html>
            <head>
                <style>
                    /* Include your Tailwind CSS styles here */
                    .max-w-4xl {
  max-width: 60rem;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.p-4 {
  padding: 1rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: bold;
}

.mb-4 {
  margin-bottom: 1rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.w-full {
  width: 100%;
}

.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.ar-txt {
  direction: rtl;
}

.border {
  border: 1px solid #000;
}

.border-black {
  border-color: #000;
}
  .border {
  border-width: 1px;
}
.border-b {
  border-bottom: 1px solid #000;
}

.border-l {
  border-left: 1px solid #000;
}
                    body {
                        font-family: "Cairo", sans-serif !important;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 8px;
                    }
                </style>
            </head>
            <body>
                ${billTableHtml}
            </body>
            </html>
        `);

      setTimeout(() => {
        imageWindow.print();
      }, 1500);
    } else {
      alert("Popup blocked! Please allow popups for this site.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إجراء عملية بيع:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
          <SectionTitle text={"معلومات المشتري:"} />
          <SearchComponent
            onChange={setSearchQuery}
            value={searchQuery}
            onClickSearch={handleSearchClick}
          />

          {!loadingCustomer ? (
            errorCustomer ? (
              <div className="flex items-center justify-center gap-4">
                <ButtonComponent
                  textButton="إنشاء"
                  onClick={() => navigate("/salesOfficer/addCustomer")}
                />
                <p className="font-bold">
                  لا يوجد سجل لللزبون المطلوب! هل تريد إنشاء سجل له؟
                </p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-end justify-end gap-4">
                  <TextInputComponent
                    label={"الرقم الوطني:"}
                    value={customer.nationalNumber}
                    disabled={true}
                  />
                </div>
                <div className="flex flex-col items-end justify-start gap-4">
                  <TextInputComponent
                    label={"الاسم الثلاثي:"}
                    value={customer.fullName}
                    disabled={true}
                  />
                </div>
              </div>
            )
          ) : null}
          {uniqueSelectedProducts.length > 0 && (
            <SectionTitle text={"المنتجات المختارة:"} />
          )}
          {loadingProducts ? (
            <div className="flex justify-center items-center h-[400px]">
              <LoadingSpinner />
            </div>
          ) : errorProducts ? (
            <NoDataError error={errorProducts} />
          ) : uniqueSelectedProducts.length > 0 ? (
            <div className="flex flex-col justify-start items-center gap-4 p-4">
              <DataTableEditRow
                columns={columns}
                rows={uniqueSelectedProducts}
                updateFunction={updateFunction}
                deleteFunction={deleteFunction}
                dir={"rtl"}
              />
              <p className="font-bold w-full text-right ar-txt">
                {`المبلغ الكلي: ${currencyFormatting(finalPrice)}`}
              </p>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-4 w-full">
            <ButtonComponent variant={"back"} onClick={handleClickBack} />
            <ButtonComponent
              variant={"procedure"}
              onClick={handleMakeSale}
              disabled={uniqueSelectedProducts.length == 0}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

export default MakeSale;
