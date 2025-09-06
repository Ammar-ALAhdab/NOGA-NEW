import { useEffect, useReducer, useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DataTable from "../../components/table/DataTable";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import currencyFormatting from "../../util/currencyFormatting";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import TablePagination from "../../components/table/TablePagination";
import SearchComponent from "../../components/inputs/SearchComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import FilterInputComponent from "../../components/inputs/FilterInputComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";
import PropTypes from "prop-types";

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
  attributes: {},
};

const ORDERING_FIELDS = [
  { id: "product_name", title: "اسم المنتج" },
  { id: "totalQuantity", title: "إجمالي الكمية" },
  { id: "variantsCount", title: "عدد النسخ" },
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

// Format main products data from /products endpoint
const formatting = (unFormattedData) => {
  if (!unFormattedData?.results) return [];

  const rowsData = unFormattedData.results.map((product) => {
    const categoryData = product?.category?.category || "";
    const isPhone =
      typeof categoryData === "string" &&
      categoryData.toLowerCase() === "phone";

    // Calculate total quantities and prices from variants
    const totalQuantity =
      product.variants?.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0
      ) || 0;
    const minWholesalePrice =
      product.variants?.length > 0
        ? Math.min(...product.variants.map((v) => v.wholesale_price || 0))
        : 0;
    const minSellingPrice =
      product.variants?.length > 0
        ? Math.min(...product.variants.map((v) => v.selling_price || 0))
        : 0;
    const maxSellingPrice =
      product.variants?.length > 0
        ? Math.max(...product.variants.map((v) => v.selling_price || 0))
        : 0;

    return {
      id: product.id,
      profilePhoto: isPhone ? phone : accessor,
      productName: product.product_name || "Unknown Product",
      category: categoryData,
      totalQuantity,
      minWholesalePrice: currencyFormatting(minWholesalePrice),
      minSellingPrice: currencyFormatting(minSellingPrice),
      maxSellingPrice: currencyFormatting(maxSellingPrice),
      variantsCount: product.variants?.length || 0,
      qrCode: product.qr_code,
      variants: product.variants || [],
      // helper fields for client-side filtering/sorting
      isPhone,
      minWholesalePriceNumber: minWholesalePrice,
      minSellingPriceNumber: minSellingPrice,
      maxSellingPriceNumber: maxSellingPrice,
    };
  });
  return rowsData;
};

function MainProductsTable({
  handleSelectProduct,
  rowSelectionID,
  columns,
  link = "/products",
}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [page, setPage] = useState(1);
  const [state, dispatch] = useReducer(reducer, initialFilterState);
  const axiosPrivate = useAxiosPrivate();

  // Dynamic attribute filtering state
  const [attributes, setAttributes] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  const handleChangePage = (event, value) => {
    setPage(value);
    const baseUrl = link.includes("?") ? link.split("?")[0] : link;
    const pageParam = `page=${value}`;
    const searchParam = searchQuery ? `&search=${searchQuery}` : "";
    const newUrl = `${baseUrl}?${pageParam}${searchParam}`;
    getProducts(newUrl);
  };

  const getProducts = async (url = null) => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);

      const endpoint = url || link;
      console.log("MainProductsTable: Fetching from:", endpoint);

      const response = await axiosPrivate.get(endpoint);
      console.log("MainProductsTable: Raw response:", response?.data);

      const formattedData = formatting(response?.data);
      console.log("MainProductsTable: Formatted data:", formattedData);

      setProducts(formattedData);
      setPaginationSettings(response?.data);
    } catch (error) {
      console.error("MainProductsTable: Error fetching products:", error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [link]);

  // Fetch all available attributes for dynamic filtering
  const fetchAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const response = await axiosPrivate.get("/products/attributes");
      const fetchedAttributes = response.data.results || [];
      setAttributes(fetchedAttributes);

      // Fetch options for each attribute
      const optionsPromises = fetchedAttributes.map(async (attr) => {
        try {
          const optionsResponse = await axiosPrivate.get(
            `/products/options?attribute=${attr.attribute}`
          );
          return {
            attribute: attr.attribute,
            options: optionsResponse.data.results || [],
          };
        } catch (error) {
          console.error(`Error fetching options for ${attr.attribute}:`, error);
          return { attribute: attr.attribute, options: [] };
        }
      });

      const optionsResults = await Promise.all(optionsPromises);
      const optionsMap = {};
      optionsResults.forEach((result) => {
        optionsMap[result.attribute] = result.options;
      });
      setAttributeOptions(optionsMap);
    } catch (err) {
      console.error("Error fetching attributes:", err);
    } finally {
      setLoadingAttributes(false);
    }
  };

  // Fetch attributes when component mounts
  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    const baseUrl = link.includes("?") ? link.split("?")[0] : link;
    const searchParam = query ? `search=${query}` : "";
    const newUrl = query ? `${baseUrl}?${searchParam}` : baseUrl;
    getProducts(newUrl);
  };

  const handleFilter = () => {
    setPage(1);
    const baseUrl = link.includes("?") ? link.split("?")[0] : link;
    getProducts(baseUrl);
  };

  const handleShowFilter = () => {
    setFilterShow(true);
    document.body.style.overflow = "hidden";
    setScrollTop(document.documentElement.scrollTop);
    document.documentElement.scrollTop = 0;
  };

  const handleCloseFilter = () => {
    setFilterShow(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };

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
    <div className="w-full">
      <div className="flex items-end justify-between mb-4 flex-col">
        <div>
          <SectionTitle text="قائمة المنتجات الرئيسية" />
        </div>
        <div className="flex items-center justify-center mb-4 w-full">
          <div className="flex items-center gap-2">
            <ButtonComponent variant="filter" onClick={handleShowFilter} />
            <SearchComponent
              placeholder="البحث في المنتجات..."
              onSearch={handleSearch}
              value={searchQuery}
            />
          </div>
        </div>

        <div
          className="absolute my-filter-box flex flex-col items-center justify-center w-full h-full p-4 z-[200]"
          style={{
            opacity: filterShow ? 1 : 0,
            visibility: filterShow ? "visible" : "hidden",
          }}
        >
          <div className="flex flex-col items-center justify-start gap-2 relative w-fit max-w-4xl max-h-[90vh] pl-8 pr-8 pb-8 pt-4 rounded-3xl bg-white my-box-shadow overflow-y-auto">
            <SectionTitle text={"خيارات الفلترة:"} />
            <button
              className="absolute top-3 left-3 w-8 h-8 bg-halloweenOrange text-white z-100 rounded-full"
              onClick={handleCloseFilter}
            >
              <FontAwesomeIcon icon={faX} />
            </button>
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <FilterInputComponent
                name="name"
                placeholder="فتلرة حسب اسم المنتج"
                value={state.name}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "name", value })
                }
              />
              <FilterInputComponent
                name="minPrice"
                placeholder="فتلرة حسب أقل سعر تكلفة"
                type="number"
                value={state.minPrice}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "minPrice", value })
                }
              />
              <FilterInputComponent
                name="maxPrice"
                placeholder="فتلرة حسب أعلى سعر تكلفة"
                type="number"
                value={state.maxPrice}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "maxPrice", value })
                }
              />
            </div>
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <FilterDropDown
                data={PRODUCT_TYPE}
                dataTitle={"title"}
                value={state.productType}
                label={"فلترة حسب تصنيف المنتج"}
                name={"productType"}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "productType", value })
                }
              />
            </div>
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <FilterDropDown
                data={ORDERING_FIELDS}
                dataTitle={"title"}
                value={state.ordering}
                label={"ترتيب حسب حقل"}
                name={"ordering"}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "ordering", value })
                }
              />
              <FilterDropDown
                data={ORDERING_TYPE}
                dataTitle={"title"}
                value={state.orderingType}
                label={"نمط الترتيب"}
                name={"orderingType"}
                onChange={(value) =>
                  dispatch({ type: "SET_FIELD", field: "orderingType", value })
                }
              />
            </div>

            {/* Dynamic Attribute Filters */}
            {loadingAttributes ? (
              <div className="flex flex-col items-center justify-center gap-4 w-full py-4">
                <SectionTitle text="فلترة حسب الخصائص" />
                <div className="flex items-center gap-2 text-gray-500">
                  <LoadingSpinner />
                  <span className="text-sm">جاري تحميل الخصائص...</span>
                </div>
              </div>
            ) : attributes.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 w-full">
                <SectionTitle text="فلترة حسب الخصائص" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
                  {attributes.map((attr) => (
                    <div key={attr.id} className="flex flex-col gap-2 min-w-0">
                      <label className="text-sm font-medium text-gray-700 text-right truncate">
                        {attr.attribute}
                      </label>
                      <select
                        value={state.attributes?.[attr.attribute] || ""}
                        onChange={(e) =>
                          dispatch({
                            type: "SET_FIELD",
                            field: "attributes",
                            value: {
                              ...state.attributes,
                              [attr.attribute]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-sm"
                      >
                        <option value="">جميع القيم</option>
                        {attributeOptions[attr.attribute]?.map((option) => (
                          <option key={option.id} value={option.option}>
                            {option.option}{" "}
                            {option.unit ? `(${option.unit})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <ButtonComponent
                variant={"delete"}
                textButton="إزالة الفلتر"
                onClick={() => dispatch({ type: "RESET" })}
              />
              <ButtonComponent
                variant={"filter"}
                textButton="بحث حسب الفلتر"
                onClick={handleFilter}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mb-4 w-full">
        <DataTable
          rows={products}
          columns={columns}
          handleSelectProduct={handleSelectProduct}
          rowSelectionID={rowSelectionID}
          onScroll={handleScroll}
        />
      </div>

      {paginationSettings && (
        <TablePagination
          count={paginationSettings.count}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={10}
        />
      )}
    </div>
  );
}

MainProductsTable.propTypes = {
  handleSelectProduct: PropTypes.func.isRequired,
  rowSelectionID: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  link: PropTypes.string,
};

export default MainProductsTable;
