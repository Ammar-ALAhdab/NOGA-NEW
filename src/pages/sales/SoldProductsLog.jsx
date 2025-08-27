import Title from "../../components/titles/Title";
import { useState, useEffect, useReducer } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DataTableAccordion from "../../components/table/DataTableAccordion";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import TablePagination from "../../components/table/TablePagination";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import SectionTitle from "../../components/titles/SectionTitle";
import SearchComponent from "../../components/inputs/SearchComponent";
import currencyFormatting from "../../util/currencyFormatting";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";

const columns = [
  { field: "id", headerName: "", width: 50 },
  {
    field: "idOfOrder",
    headerName: "معرف الفاتورة",
    flex: 1,
    valueGetter: (value, row) => `#${row.id}`,
  },
  { field: "customerName", headerName: "اسم المشتري", width: 200 },
  { field: "branch", headerName: "الفرع", flex: 1 },
  { field: "address", headerName: "العنوان", flex: 1 },
  { field: "date", headerName: "التاريخ", flex: 1 },
  { field: "productCount", headerName: "عدد المنتجات", flex: 1 },
];

const detailColumns = [
  { field: "id", headerName: "#", width: 50 },
  { field: "product_name", headerName: "اسم المنتج", flex: 1 },
  {
    field: "category_name",
    headerName: "النوع",
    align: "center",
    flex: 1,
  },
  {
    field: "purchased_quantity",
    headerName: "الكمية",
    flex: 1,
  },
  {
    field: "price",
    headerName: "السعر",
    flex: 1,
  },
  {
    field: "totalPrice",
    headerName: "المبلغ الإجمالي",
    flex: 1,
  },
];

const initialFilterState = {
  filter: false,
  branch: "",
  ordering: "",
  orderingType: "",
};

const ORDERING_FIELDS = [{ id: "date_of_purchase", title: "التاريخ" }];

const ORDERING_TYPE = [
  { id: 1, title: "تصاعدي" },
  { id: 2, title: "تنازلي" },
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

function SoldProductsLog({ customerRecords = false }) {
  const [productsSoldLog, setProductsSoldLog] = useState([]);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const axiosPrivate = useAxiosPrivate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [state, dispatch] = useReducer(reducer, initialFilterState);
  const [scrollTop, setScrollTop] = useState(0);
  const branchID = JSON.parse(localStorage.getItem("branchID"));
  const branchName = JSON.parse(localStorage.getItem("branchName"));
  const { customerID } = useParams();
  const LINK = customerRecords
    ? `customer_id=${customerID}`
    : `branch_id=${branchID}`;
  const TITLE = customerRecords
    ? `سجل مشتريات الزبون: ${productsSoldLog[0]?.customerName}`
    : `سجل المشتريات فرع ${branchName}: `;

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = () => {
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter = orderingFilter;
    setFilterTerms(filter);
    setPage(1);
    getPurchasedProducts(`/purchase?${LINK}${filter}`);
    handleCloseFilter();
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    getPurchasedProducts(
      `/purchase?${LINK}&page=${value}${
        searchQuery ? `&search=${searchQuery}` : ""
      }${state.filter ? `${filterTerms}` : ""}`
    );
  };

  const handleShowFilter = () => {
    setFilterShow(true);
    document.body.style.overflow = "hidden";
    setScrollTop(document.documentElement.scrollTop);
    document.documentElement.scrollTop = 0;
  };

  const handleSearchClick = () => {
    setPage(1);

    getPurchasedProducts(`/purchase?${LINK}&search=${searchQuery}`);
  };

  const formatting = (unFormattedData) => {
    const rowsData = unFormattedData?.map((row) => {
      return {
        id: row.purchase_id,
        idOfOrder: row.purchase_id,
        date: row.date_of_purchase,
        branch: row.branch_name,
        address: row.address,
        customerName: row.customer_name,
        productCount: row?.products?.length,
        purchasedProducts: row.products?.map((p) => {
          return {
            id: p.product_id,
            price: currencyFormatting(p.selling_price),
            totalPrice: currencyFormatting(
              Number(p.selling_price) * Number(p.purchased_quantity)
            ),
            purchased_quantity: p.purchased_quantity,
            product_name: p?.product_name,
            category_name: p?.category_type,
          };
        }),
      };
    });
    return rowsData;
  };

  const handleCloseFilter = () => {
    setFilterShow(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  const getPurchasedProducts = async (link = `/purchase?${LINK}`) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      const data = formatting(response?.data?.results);
      setProductsSoldLog(data);
      setPaginationSettings({
        count: response?.data?.count,
        next: response?.data?.next,
        previous: response?.data?.previous,
      });
    } catch (e) {
      console.log(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPurchasedProducts();
  }, []);

  useEffect(() => {
    getPurchasedProducts();
  }, [customerRecords]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={TITLE} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
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
                  page={page}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ################################### END SEARCH AND FILTER ################################### */}
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <DataTableAccordion
            columns={columns}
            rows={productsSoldLog}
            detailColumns={detailColumns}
            detailRows={"purchasedProducts"}
            titleOfTable="الفاتورة"
          />
        )}
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"السجلات"}
          page={page}
        />
      </section>
    </main>
  );
}

SoldProductsLog.propTypes = {
  customerRecords: PropTypes.bool,
};

export default SoldProductsLog;
