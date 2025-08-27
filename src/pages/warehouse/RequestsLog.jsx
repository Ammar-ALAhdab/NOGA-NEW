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

const status = [
  { color: "#0000FF", status: "غير معروف" },
  {
    color: "#7049A3",
    status: "معلق",
  },
  {
    color: "#2DBDA8",
    status: "مقبول",
  },
  {
    color: "#D9A322",
    status: "مقبول جزئياً",
  },
  {
    color: "#E76D3B",
    status: "مرفوض",
  },
];

const columns = [
  { field: "id", headerName: "", width: 50 },
  {
    field: "idOfOrder",
    headerName: "معرف الطلب",
    width: 100,
    valueGetter: (value, row) => `#${row.id}`,
  },
  { field: "date", headerName: "التاريخ", flex: 1 },
  { field: "branch", headerName: "الفرع", flex: 1 },
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
    field: "wantedQuantity",
    headerName: "الكمية المطلوبة",
    flex: 1,
  },
  {
    field: "status",
    headerName: "الحالة",
    flex: 1,
    renderCell: (params) => {
      return (
        <span
          className="font-bold"
          style={{
            color: status[params.row.status].color,
          }}
        >
          {status[params.row.status].status}
        </span>
      );
    },
  },
];

const initialFilterState = {
  filter: false,
  branch: "",
  ordering: "",
  orderingType: "",
};

const formatBranches = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    title: `${d.number} ${d.city_name}`,
  }));
  return data;
};

const ORDERING_FIELDS = [{ id: "date_of_request", title: "التاريخ" }];

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

function ProductsLog() {
  const [productsTransportLog, setProductsTransportLog] = useState([]);
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
  const [branches, setBranches] = useState([]);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = () => {
    let branchFilter = state.branch ? `&branch_id=${state.branch}` : "";
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter = branchFilter + orderingFilter;
    setFilterTerms(filter);
    setPage(1);
    getProductsRequests(`/products/request?${filter}`);
    handleCloseFilter();
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    getProductsRequests(
      `/products/request?page=${value}${
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

    getProductsRequests(`/products/request?search=${searchQuery}`);
  };

  const formatting = (unFormattedData) => {
    const rowsData = unFormattedData?.map((row) => {
      return {
        id: row.id,
        idOfOrder: row.id,
        date: row.date_of_request,
        branch: row.branch_name,
        productCount: row?.requests?.length,
        RequestedProducts: row.requests?.map((rq) => {
          return {
            id: rq.id,
            status: rq.status,
            wantedQuantity: rq.quantity,
            product_name: rq.product.product_name,
            category_name: rq.product.category_name,
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

  const getProductsRequests = async (link = "/products/request") => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      const data = formatting(response?.data?.results);
      setProductsTransportLog(data);
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
    getBranches();
    getProductsRequests();
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"سجل حركة المنتجات:"} />
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
                  data={branches}
                  dataTitle={"title"}
                  value={state.branch}
                  label={"فلترة حسب الفرع"}
                  name={"branch"}
                  onChange={handleFilterTerms}
                />
              </div>
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
            rows={productsTransportLog}
            detailColumns={detailColumns}
            detailRows={"RequestedProducts"}
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

export default ProductsLog;
