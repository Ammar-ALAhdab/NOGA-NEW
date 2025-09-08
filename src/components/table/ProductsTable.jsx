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

const formatting = (unFormattedData) => {
  const rowsData = unFormattedData.map((row) => {
    // Handle different data structures from warehouse vs branch endpoints
    let productData = row;
    let categoryData =
      row?.category_name || row?.category || row?.category?.category;

    // If this is from warehouse endpoint (has nested product object)
    if (row?.product && typeof row.product === "object") {
      productData = row.product;
      categoryData =
        row.product?.category_name ||
        row.product?.category ||
        row.product?.category?.category;
    }

    const isPhone =
      typeof categoryData === "string" &&
      categoryData.toLowerCase() === "phone";

    // Determine product image: use actual product image if available, otherwise use default
    const productImage =
      productData?.images?.[0]?.image ||
      productData?.image ||
      (isPhone ? phone : accessor);

    // Determine prices: prefer top-level, else derive from variants
    const variantSellingPrices = Array.isArray(productData?.variants)
      ? productData.variants
          .map((v) =>
            Number(
              v?.selling_price ??
                v?.sellingPrice ??
                // sometimes price might be embedded in options; ignore non-numeric
                NaN
            )
          )
          .filter((n) => !Number.isNaN(n) && Number.isFinite(n))
      : [];
    const variantWholesalePrices = Array.isArray(productData?.variants)
      ? productData.variants
          .map((v) => Number(v?.wholesale_price ?? v?.wholesalePrice ?? NaN))
          .filter((n) => !Number.isNaN(n) && Number.isFinite(n))
      : [];

    const sellingPriceValue =
      typeof productData?.selling_price === "number"
        ? productData.selling_price
        : variantSellingPrices.length
        ? Math.min(...variantSellingPrices)
        : null;
    const wholesalePriceValue =
      typeof productData?.wholesale_price === "number"
        ? productData.wholesale_price
        : variantWholesalePrices.length
        ? Math.min(...variantWholesalePrices)
        : null;

    // For warehouse endpoint, use the branch quantity, for branch endpoint use product quantity
    const quantityValue = row?.quantity || productData?.quantity || 0;

    return {
      id: productData.id,
      profilePhoto: productImage,
      barcode: productData.qr_code ? productData.qr_code : "لايوجد",
      productName: productData.product_name || productData.product,
      type: categoryData,
      sku: productData.sku,
      sellingPrice:
        sellingPriceValue != null
          ? currencyFormatting(sellingPriceValue)
          : "لايوجد",
      wholesalePrice:
        wholesalePriceValue != null
          ? currencyFormatting(wholesalePriceValue)
          : "لايوجد",
      quantity: quantityValue,
      // helper fields for client-side filtering/sorting
      isPhone,
      sellingPriceNumber: sellingPriceValue ?? null,
      wholesalePriceNumber: wholesalePriceValue ?? null,
      options: <ButtonComponent />,
    };
  });
  return rowsData;
};

function Products({
  handleSelectProduct,
  rowSelectionID,
  columns,
  link = "/products/variants",
}) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [brands, setBrands] = useState([]);
  const [CPUS, setCPUS] = useState([]);
  const [colors, setColors] = useState([]);
  const [accessoriesCategories, setAccessoriesCategories] = useState([]);
  const [page, setPage] = useState(1);
  const axiosPrivate = useAxiosPrivate();

  const handleChangePage = (event, value) => {
    setPage(value);
    const baseUrl = link.includes("?") ? link.split("?")[0] : link;
    const existingParams = link.includes("?") ? link.split("?")[1] : "";
    const pageParam = `page=${value}`;
    const searchParam = searchQuery ? `&search=${searchQuery}` : "";
    const filterParam = state.filter ? `${filterTerms}` : "";

    const fullUrl = `${baseUrl}?${pageParam}${searchParam}${filterParam}${
      existingParams ? `&${existingParams}` : ""
    }`;
    getProducts(fullUrl, state.filter);
  };

  const handleSearchClick = () => {
    setPage(1);
    const baseUrl = link.includes("?") ? link.split("?")[0] : link;
    const existingParams = link.includes("?") ? link.split("?")[1] : "";
    const searchParam = `search=${searchQuery}`;

    const fullUrl = `${baseUrl}?${searchParam}${
      existingParams ? `&${existingParams}` : ""
    }`;
    getProducts(fullUrl);
  };

  const [state, dispatch] = useReducer(reducer, initialFilterState);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = () => {
    let nameFilter = state.name ? `&search=${state.name}` : "";
    let minPriceFilter = state.minPrice ? `&min_price=${state.minPrice}` : "";
    let maxPriceFilter = state.maxPrice ? `&max_price=${state.maxPrice}` : "";
    let productTypeFilter = state.productType
      ? `&category_type=${state.productType}`
      : "";
    let brandFilter = state.brand ? `&phone__brand_id=${state.brand}` : "";
    let cpuFilter = state.cpu ? `&phone__CPU_id=${state.cpu}` : "";
    let colorFilter = state.color ? `&phone__color_id=${state.color}` : "";
    let accessoriesCategoryFilter = state.accessoriesCategory
      ? `&accessory__accessory_category=${state.accessoriesCategory}`
      : "";
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter =
      nameFilter +
      minPriceFilter +
      maxPriceFilter +
      productTypeFilter +
      brandFilter +
      cpuFilter +
      colorFilter +
      accessoriesCategoryFilter +
      orderingFilter;
    setFilterTerms(filter);
    setPage(1);
    // Use client-side filter to respect derived prices from variants
    getProducts(`/products/variants?${filter}`, true);
    handleCloseFilter();
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

  const getProducts = async (customLink = link, applyLocalFilter = false) => {
    try {
      setLoadingProducts(true);
      setErrorProducts(null);
      const response = await axiosPrivate.get(customLink);
      let formattedProducts = formatting(response?.data?.results);
      if (applyLocalFilter) {
        // Apply client-side filtering/sorting for correctness with derived prices
        if (state.productType) {
          const wantPhone = state.productType == 1;
          formattedProducts = formattedProducts.filter(
            (p) => p.isPhone === wantPhone
          );
        }
        if (state.minPrice) {
          const min = Number(state.minPrice);
          formattedProducts = formattedProducts.filter(
            (p) =>
              p.wholesalePriceNumber != null && p.wholesalePriceNumber >= min
          );
        }
        if (state.maxPrice) {
          const max = Number(state.maxPrice);
          formattedProducts = formattedProducts.filter(
            (p) =>
              p.wholesalePriceNumber != null && p.wholesalePriceNumber <= max
          );
        }
        if (state.ordering) {
          const field = state.ordering; // 'product_name' | 'wholesale_price' | 'selling_price' | 'quantity'
          const desc = state.orderingType == 2;
          formattedProducts = [...formattedProducts].sort((a, b) => {
            let av, bv;
            if (field === "product_name") {
              av = a.productName || "";
              bv = b.productName || "";
              return desc ? bv.localeCompare(av) : av.localeCompare(bv);
            }
            if (field === "wholesale_price") {
              av = a.wholesalePriceNumber ?? (desc ? -Infinity : Infinity);
              bv = b.wholesalePriceNumber ?? (desc ? -Infinity : Infinity);
            } else if (field === "selling_price") {
              av = a.sellingPriceNumber ?? (desc ? -Infinity : Infinity);
              bv = b.sellingPriceNumber ?? (desc ? -Infinity : Infinity);
            } else if (field === "quantity") {
              av = a.quantity ?? 0;
              bv = b.quantity ?? 0;
            } else {
              av = 0;
              bv = 0;
            }
            return desc ? bv - av : av - bv;
          });
        }
        setProducts(formattedProducts);
        setPaginationSettings({
          count: formattedProducts.length,
          next: null,
          previous: null,
        });
      } else {
        setProducts(formattedProducts);
        setPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      }
    } catch (error) {
      console.log(error);
      setErrorProducts(error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getFilterSettings = async (link, storeData) => {
    try {
      const response = await axiosPrivate.get(link);
      if (storeData == "phone_brands") {
        setBrands((prevData) => [...prevData, ...response.data.results]);
      } else if (storeData == "cpus") {
        setCPUS((prevData) => [...prevData, ...response.data.results]);
      } else if (storeData == "colors") {
        setColors((prevData) => [...prevData, ...response.data.results]);
      } else if (storeData == "accessories_categories") {
        setAccessoriesCategories((prevData) => [
          ...prevData,
          ...response.data.results,
        ]);
      }
      if (response.data.next) {
        getFilterSettings(response.data.next, storeData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getFilterSettings("/phone_brands", "phone_brands");
    getFilterSettings("/cpus", "cpus");
    getFilterSettings("/colors", "colors");
    getFilterSettings("/accessories_categories", "accessories_categories");
    getProducts();
  }, []);

  // Refetch products when link prop changes
  useEffect(() => {
    console.log("ProductsTable: Link prop changed to:", link);
    if (link) {
      setPage(1);
      getProducts(link);
    }
  }, [link]);

  return (
    <>
      {/* ################################### START SEARCH AND FILTER ################################### */}
      <div className="flex flex-col items-center justify-center gap-2 w-full">
        <div className="flex items-center justify-center gap-8 w-full">
          <ButtonComponent variant={"filter"} onClick={handleShowFilter} />
          <SearchComponent
            onChange={setSearchQuery}
            value={searchQuery}
            onClickSearch={handleSearchClick}
          />
        </div>

        <div
          className="absolute my-filter-box flex flex-col items-center justify-center w-full h-full p-4 z-[200]"
          style={{
            opacity: filterShow ? 1 : 0,
            visibility: filterShow ? "visible" : "hidden",
          }}
        >
          <div className="flex flex-col items-center justify-center gap-2 relative w-fit pl-8 pr-8 pb-8 pt-4 rounded-3xl bg-white my-box-shadow">
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
                onChange={handleFilterTerms}
              />
              <FilterInputComponent
                name="minPrice"
                placeholder="فتلرة حسب أقل سعر تكلفة"
                value={state.minPrice}
                onChange={handleFilterTerms}
              />
              <FilterInputComponent
                name="maxPrice"
                placeholder="فتلرة حسب أكبر سعر تكلفة"
                value={state.maxPrice}
                onChange={handleFilterTerms}
              />
            </div>
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <FilterDropDown
                data={PRODUCT_TYPE}
                dataTitle={"title"}
                value={state.productType}
                label={"فلترة حسب تصنيف المنتج"}
                name={"productType"}
                onChange={handleFilterTerms}
              />
            </div>
            {state.productType == 1 && (
              <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                <FilterDropDown
                  data={brands}
                  dataTitle={"brand_name"}
                  value={state.brand}
                  label={"فرز حسب الشركة المصنعة"}
                  name={"brand"}
                  onChange={handleFilterTerms}
                />
                <FilterDropDown
                  data={CPUS}
                  dataTitle={"CPU_brand"}
                  value={state.cpu}
                  label={"فرز حسب المعالج"}
                  name={"cpu"}
                  onChange={handleFilterTerms}
                />
                <FilterDropDown
                  data={colors}
                  dataTitle={"color"}
                  value={state.color}
                  label={"فرز حسب اللون"}
                  name={"color"}
                  onChange={handleFilterTerms}
                />
              </div>
            )}
            {state.productType == 2 && (
              <FilterDropDown
                data={accessoriesCategories}
                dataTitle={"category_name"}
                value={state.accessoriesCategory}
                label={"فرز حسب نوع الإكسسوار"}
                name={"accessoriesCategory"}
                onChange={handleFilterTerms}
              />
            )}
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <FilterDropDown
                data={ORDERING_FIELDS}
                dataTitle={"title"}
                value={state.ordering}
                label={"ترتيب حسب حقل"}
                name={"ordering"}
                onChange={handleFilterTerms}
              />
              <FilterDropDown
                data={ORDERING_TYPE}
                dataTitle={"title"}
                value={state.orderingType}
                label={"نمط الترتيب"}
                name={"orderingType"}
                onChange={handleFilterTerms}
              />
            </div>
            <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
              <ButtonComponent
                variant={"delete"}
                textButton="إزالة الفلتر"
                onClick={() => dispatch({ type: "RESET" })}
              />
              <ButtonComponent
                variant={"filter"}
                textButton="بحث حسب الفلتر"
                onClick={handleFilterClick}
              />
            </div>
          </div>
        </div>
      </div>
      {/* ################################### END SEARCH AND FILTER ################################### */}

      {loadingProducts ? (
        <div className="flex justify-center items-center h-[400px]">
          <LoadingSpinner />
        </div>
      ) : errorProducts ? (
        <NoDataError error={errorProducts} />
      ) : (
        <DataTable
          columns={columns}
          rows={products}
          hideSelectRows={false}
          onRowSelectionModelChange={handleSelectProduct}
          rowSelectionModel={rowSelectionID}
          hideFooter={false}
        />
      )}
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

Products.propTypes = {
  handleSelectProduct: PropTypes.func,
  rowSelectionID: PropTypes.array,
  columns: PropTypes.array,
  link: PropTypes.string,
};

export default Products;
