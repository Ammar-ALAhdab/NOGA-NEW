import { useState, useEffect, useCallback, useReducer } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useGoToBack from "../../hooks/useGoToBack";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import Swal from "sweetalert2";
import DataTable from "../../components/table/DataTable";
import TablePagination from "../../components/table/TablePagination";
import SearchComponent from "../../components/inputs/SearchComponent";
import FilterInputComponent from "../../components/inputs/FilterInputComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";
import PropTypes from "prop-types";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import currencyFormatting from "../../util/currencyFormatting";

// Custom formatting function for main products
const formatMainProducts = (unFormattedData) => {
  const rowsData = unFormattedData.map((product) => {
    const isPhone = product.category?.category?.toLowerCase() === "phone";

    // Calculate total quantity from all variants
    const totalQuantity =
      product.variants?.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0
      ) || 0;

    // Get min/max prices from variants
    const variantPrices =
      product.variants?.map((v) => ({
        selling: v.selling_price || 0,
        wholesale: v.wholesale_price || 0,
      })) || [];

    const minSellingPrice =
      variantPrices.length > 0
        ? Math.min(...variantPrices.map((v) => v.selling))
        : 0;
    const minWholesalePrice =
      variantPrices.length > 0
        ? Math.min(...variantPrices.map((v) => v.wholesale))
        : 0;

    // Get the first variant's SKU or create a default one
    const firstVariant = product.variants?.[0];
    const sku = firstVariant?.sku || `${product.product_name}-default`;

    return {
      id: product.id,
      profilePhoto: isPhone ? phone : accessor,
      barcode: product.qr_code || "لايوجد",
      productName: product.product_name,
      type: product.category?.category || "غير محدد",
      sku: sku,
      sellingPrice:
        minSellingPrice > 0 ? currencyFormatting(minSellingPrice) : "لايوجد",
      wholesalePrice:
        minWholesalePrice > 0
          ? currencyFormatting(minWholesalePrice)
          : "لايوجد",
      quantity: totalQuantity,
      // Helper fields for filtering/sorting
      isPhone,
      sellingPriceNumber: minSellingPrice,
      wholesalePriceNumber: minWholesalePrice,
      options: null, // No options needed for linking
    };
  });
  return rowsData;
};

// Custom MainProductsTable component for linking products
const initialFilterState = {
  filter: false,
  name: "",
  minPrice: "",
  maxPrice: "",
  productType: "",
  brand: "",
  cpu: "",
  color: "",
  accessoriesCategory: "",
  ordering: "",
  orderingType: "",
};

const ORDERING_FIELDS = [
  { id: "product_name", title: "اسم المنتج" },
  { id: "wholesale_price", title: "سعر التكلفة" },
  { id: "selling_price", title: "سعر المبيع" },
  { id: "quantity", title: "الكمية" },
];

const ORDERING_TYPE = [
  { id: 1, title: "تصاعدي" },
  { id: 2, title: "تنازلي" },
];

const PRODUCT_TYPE = [
  { id: 1, title: "موبايل" },
  { id: 2, title: "إكسسوار" },
];

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value, filter: true };
    case "RESET":
      return initialFilterState;
    default:
      return state;
  }
};

function MainProductsTable({
  handleSelectProduct,
  rowSelectionID,
  columns,
  link = "/products/",
  excludeProductId = null,
}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [page, setPage] = useState(1);
  const axiosPrivate = useAxiosPrivate();

  const handleChangePage = async (event, value) => {
    setPage(value);
    setLoadingSearch(true);
    try {
      const baseUrl = link.includes("?") ? link.split("?")[0] : link;
      const existingParams = link.includes("?") ? link.split("?")[1] : "";
      const pageParam = `page=${value}`;
      const searchParam = searchQuery ? `&search=${searchQuery}` : "";
      const filterParam = state.filter ? `${filterTerms}` : "";

      const fullUrl = `${baseUrl}?${pageParam}${searchParam}${filterParam}${
        existingParams ? `&${existingParams}` : ""
      }`;
      await getProducts(fullUrl);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSearchClick = async () => {
    setPage(1);
    setLoadingSearch(true);
    try {
      const baseUrl = link.includes("?") ? link.split("?")[0] : link;
      const existingParams = link.includes("?") ? link.split("?")[1] : "";
      const searchParam = `search=${searchQuery}`;

      const fullUrl = `${baseUrl}?${searchParam}${
        existingParams ? `&${existingParams}` : ""
      }`;
      await getProducts(fullUrl);
    } finally {
      setLoadingSearch(false);
    }
  };

  const [state, dispatch] = useReducer(reducer, initialFilterState);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = async () => {
    setLoadingSearch(true);
    try {
      let nameFilter = state.name ? `&search=${state.name}` : "";
      let minPriceFilter = state.minPrice ? `&min_price=${state.minPrice}` : "";
      let maxPriceFilter = state.maxPrice ? `&max_price=${state.maxPrice}` : "";
      let productTypeFilter = state.productType
        ? `&product_type=${state.productType}`
        : "";
      let brandFilter = state.brand ? `&brand=${state.brand}` : "";
      let cpuFilter = state.cpu ? `&cpu=${state.cpu}` : "";
      let colorFilter = state.color ? `&color=${state.color}` : "";
      let accessoriesCategoryFilter = state.accessoriesCategory
        ? `&accessories_category=${state.accessoriesCategory}`
        : "";
      let orderingFilter = state.ordering ? `&ordering=${state.ordering}` : "";
      let orderingTypeFilter = state.orderingType
        ? `&ordering_type=${state.orderingType}`
        : "";

      const filterTerms = `${nameFilter}${minPriceFilter}${maxPriceFilter}${productTypeFilter}${brandFilter}${cpuFilter}${colorFilter}${accessoriesCategoryFilter}${orderingFilter}${orderingTypeFilter}`;
      setFilterTerms(filterTerms);
      setPage(1);
      const baseUrl = link.includes("?") ? link.split("?")[0] : link;
      const existingParams = link.includes("?") ? link.split("?")[1] : "";
      const fullUrl = `${baseUrl}?${filterTerms}${
        existingParams ? `&${existingParams}` : ""
      }`;
      await getProducts(fullUrl);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleResetFilter = async () => {
    setLoadingSearch(true);
    try {
      dispatch({ type: "RESET" });
      setFilterTerms("");
      setPage(1);
      await getProducts(link);
    } finally {
      setLoadingSearch(false);
    }
  };

  const getProducts = useCallback(
    async (url = null) => {
      try {
        setLoadingProducts(true);
        setErrorProducts(null);

        const endpoint = url || link;
        console.log("MainProductsTable: Fetching from:", endpoint);

        const response = await axiosPrivate.get(endpoint);
        console.log("MainProductsTable: Raw response:", response?.data);

        let productsData = response?.data?.results || response?.data || [];

        // Filter out the excluded product if specified
        if (excludeProductId) {
          productsData = productsData.filter(
            (product) => product.id !== parseInt(excludeProductId)
          );
        }

        const formattedData = formatMainProducts(productsData);
        console.log("MainProductsTable: Formatted data:", formattedData);

        setProducts(formattedData);
        setPaginationSettings(response?.data);
      } catch (error) {
        console.error("MainProductsTable: Error fetching products:", error);
        setErrorProducts(error);
      } finally {
        setLoadingProducts(false);
      }
    },
    [axiosPrivate, link, excludeProductId]
  );

  // Only fetch data once when component mounts or when link/excludeProductId changes
  useEffect(() => {
    getProducts();
  }, [link, excludeProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loadingProducts) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (errorProducts) {
    return <NoDataError error={errorProducts} />;
  }

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SearchComponent
              placeholder="البحث عن منتج..."
              onSearch={setSearchQuery}
              onSearchClick={handleSearchClick}
            />
            <ButtonComponent
              textButton={filterShow ? "إخفاء الفلتر" : "إظهار الفلتر"}
              variant="show"
              onClick={() => setFilterShow(!filterShow)}
            />
          </div>
        </div>

        {filterShow && (
          <div className="w-full bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FilterInputComponent
                label="اسم المنتج"
                name="name"
                value={state.name}
                onChange={handleFilterTerms}
              />
              <FilterInputComponent
                label="أقل سعر"
                name="minPrice"
                type="number"
                value={state.minPrice}
                onChange={handleFilterTerms}
              />
              <FilterInputComponent
                label="أعلى سعر"
                name="maxPrice"
                type="number"
                value={state.maxPrice}
                onChange={handleFilterTerms}
              />
              <FilterDropDown
                data={PRODUCT_TYPE}
                label="نوع المنتج"
                ButtonText="جميع الأنواع"
                id="productType"
                dataValue="id"
                dataTitle="title"
                onSelectEvent={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "productType",
                    value: e.value,
                  })
                }
              />
              <FilterDropDown
                data={ORDERING_FIELDS}
                label="ترتيب حسب"
                ButtonText="اختر الحقل"
                id="ordering"
                dataValue="id"
                dataTitle="title"
                onSelectEvent={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "ordering",
                    value: e.value,
                  })
                }
              />
              <FilterDropDown
                data={ORDERING_TYPE}
                label="نوع الترتيب"
                ButtonText="اختر النوع"
                id="orderingType"
                dataValue="id"
                dataTitle="title"
                onSelectEvent={(e) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "orderingType",
                    value: e.value,
                  })
                }
              />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              <ButtonComponent
                textButton="تطبيق الفلتر"
                variant="procedure"
                onClick={handleFilterClick}
              />
              <ButtonComponent
                textButton="إعادة تعيين"
                variant="delete"
                onClick={handleResetFilter}
              />
            </div>
          </div>
        )}

        <div className="relative">
          {loadingSearch && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex justify-center items-center z-10">
              <LoadingSpinner />
            </div>
          )}
          <DataTable
            rows={products}
            columns={columns}
            onRowSelectionModelChange={handleSelectProduct}
            rowSelectionModel={rowSelectionID}
            hideSelectRows={false}
            rowCount={paginationSettings?.count || 0}
          />
        </div>
      </div>
      {!state.filter && (
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"المنتجات"}
          page={page}
        />
      )}
    </>
  );
}

MainProductsTable.propTypes = {
  handleSelectProduct: PropTypes.func,
  rowSelectionID: PropTypes.array,
  columns: PropTypes.array,
  link: PropTypes.string,
  excludeProductId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

function LinkProducts() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();

  // State management
  const [mainProduct, setMainProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAddProducts, setLoadingAddProducts] = useState(false);
  const [error, setError] = useState(null);
  const [rowSelectionID, setRowSelectionID] = useState([]);

  // Fetch main product details
  const fetchMainProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching main product with ID:", productId);
      const response = await axiosPrivate.get(`/products/${productId}`);
      console.log("Main product response:", response.data);
      setMainProduct(response.data);
    } catch (error) {
      console.error("Error fetching main product:", error);
      setError("Failed to fetch main product details");
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, productId]);

  // Handle product selection
  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
  };

  // Add selected products to linked products
  const addSelectedProducts = async () => {
    try {
      setLoadingAddProducts(true);

      // Fetch details for each selected product
      const productsToAdd = [];
      for (const selectedProductId of rowSelectionID) {
        // Skip if already selected
        if (
          selectedProducts.some((selected) => selected.id === selectedProductId)
        ) {
          continue;
        }

        // Skip if it's the same as the main product
        if (selectedProductId === parseInt(productId)) {
          continue;
        }

        try {
          const response = await axiosPrivate.get(
            `/products/${selectedProductId}`
          );
          const product = response.data;

          const formattedProduct = {
            id: product.id,
            profilePhoto:
              product.category.category.toLowerCase() === "phone"
                ? phone
                : accessor,
            productName: product.product_name,
            category: product.category.category,
            linkedProducts: product.linked_products || [],
          };

          productsToAdd.push(formattedProduct);
        } catch (error) {
          console.error(`Error fetching product ${selectedProductId}:`, error);
        }
      }

      setSelectedProducts((prev) => [...prev, ...productsToAdd]);
      setRowSelectionID([]);
    } catch (error) {
      console.error("Error adding selected products:", error);
    } finally {
      setLoadingAddProducts(false);
    }
  };

  // Remove product from selected list
  const removeSelectedProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        title: "خطأ",
        text: "يرجى اختيار منتجات للربط",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const linkedProductIds = selectedProducts.map((product) => product.id);

    const linkData = {
      product_name: mainProduct.product_name,
      category: mainProduct.category.id,
      linked_products: linkedProductIds,
    };

    Swal.fire({
      title: "هل أنت متأكد من ربط المنتجات؟",
      text: `سيتم ربط ${selectedProducts.length} منتج(ات) مع ${mainProduct.product_name}`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .patch(`/products/${productId}/`, linkData)
          .then(() => {
            Swal.fire({
              title: "تم ربط المنتجات بنجاح",
              icon: "success",
            });
            navigate("/warehouseAdmin/mainProducts");
          })
          .catch((error) => {
            console.error("Error linking products:", error);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ في ربط المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  // Table columns for available products (matching SendProducts structure)
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
    fetchMainProduct();
  }, [fetchMainProduct]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full">
        <LoadingSpinner />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full">
        <NoDataError error={error} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`ربط منتجات مع ${mainProduct?.product_name || "المنتج"}`} />

      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow">
        {/* Main Product Info */}
        <div className="w-full">
          <SectionTitle text="المنتج الرئيسي:" />
          <div className="flex items-center justify-end gap-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={
                mainProduct?.category.category.toLowerCase() === "phone"
                  ? phone
                  : accessor
              }
              alt="main product"
              width={80}
              height={80}
              className="rounded-[50%] border-2 border-primary"
            />
            <div>
              <h3 className="text-xl font-bold text-primary">
                {mainProduct?.product_name}
              </h3>
              <p className="text-gray-600">
                {mainProduct?.category.category} :النوع
              </p>
              <p className="text-gray-600">
                عدد النسخ: {mainProduct?.variants?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Product Selection */}
        <div className="w-full flex flex-col items-end justify-center mb-4">
          <SectionTitle text="اختيار المنتجات للربط:" />

          <div className="w-full flex flex-col items-center justify-center gap-4">
            <MainProductsTable
              handleSelectProduct={handleSelectProduct}
              rowSelectionID={rowSelectionID}
              columns={columns}
              link="/products/"
              excludeProductId={productId}
            />
          </div>

          <div className="w-full flex flex-col items-center justify-center gap-4 pt-8">
            <ButtonComponent
              textButton={
                loadingAddProducts
                  ? "جاري الإضافة..."
                  : "إضافة المنتجات المختارة"
              }
              variant="add"
              onClick={addSelectedProducts}
              disabled={rowSelectionID.length === 0 || loadingAddProducts}
            />
          </div>
        </div>

        {/* Selected Products */}
        {selectedProducts.length > 0 && (
          <div className="w-full">
            <SectionTitle text="المنتجات المختارة للربط:" />
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.profilePhoto}
                        alt="product"
                        width={50}
                        height={50}
                        className="rounded-[50%] border-2 border-primary"
                      />
                      <div>
                        <h4 className="font-semibold text-primary">
                          {product.productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSelectedProduct(product.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="إزالة المنتج"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 w-full mt-8">
          <ButtonComponent variant="back" onClick={handleClickBack} />
          <ButtonComponent
            textButton="ربط المنتجات"
            variant="procedure"
            onClick={handleSubmit}
            disabled={selectedProducts.length === 0}
          />
        </div>
      </section>
    </main>
  );
}

export default LinkProducts;
