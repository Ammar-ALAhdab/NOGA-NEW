import { useEffect, useReducer, useState } from "react";
import Title from "../../components/titles/Title";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DataTable from "../../components/table/DataTable";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import TablePagination from "../../components/table/TablePagination";
import SearchComponent from "../../components/inputs/SearchComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import SectionTitle from "../../components/titles/SectionTitle";
import FilterDropDown from "../../components/inputs/FilterDropDown";

const formatting = (unFormattedData) => {
  console.log(unFormattedData);

  const rowsData = unFormattedData.map((row) => ({
    id: row.id,
    branchName: row.branch_name,
    date: row.created_at,
    productsRequest: row.requested_products,
    status: row.request_status,
    options: <ButtonComponent />,
  }));
  return rowsData;
};

const formatBranches = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    title: `${d.number} ${d.city_name}`,
  }));
  return data;
};

const initialFilterState = {
  filter: false,
  branch: "",
  status: "",
  ordering: "",
  orderingType: "",
};

const ORDERING_FIELDS = [{ id: "created_at", title: "تاريخ الطلب" }];

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

function ManageRequests() {
  const [requests, setRequests] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [branches, setBranches] = useState([]);
  const STATUSES = [
    {
      id:'fully-approved',
      title:'fully-approved'
    },
    {
      id:'partially-approved',
      title:'partially-approved'
    },
    {
      id:'waiting',
      title:'waiting'
    },
    {
      id:'rejected',
      title:'rejected'
    },
  ]
  const [scrollTop, setScrollTop] = useState(0);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const [state, dispatch] = useReducer(reducer, initialFilterState);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = () => {
    let branchFilter = state.branch ? `&branch=${state.branch}` : "";
    let statusFilter = state.status ? `&request_status=${state.status}` : "";
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter = branchFilter + orderingFilter + statusFilter;
    setFilterTerms(filter);
    setPage(1);

    getRequests(`/products/requests?${filter}`);
    handleCloseFilter();
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    getRequests(
      `/products/requests?&page=${value}${searchQuery ? `&search=${searchQuery}` : ""
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

    getRequests(`/products/requests?&search=${searchQuery}`);
  };

  const handleCloseFilter = () => {
    setFilterShow(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  const getRequests = async (link = "/products/requests") => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      console.log(response);
      const data = formatting(response.data.results);
      setRequests(data);
      setPaginationSettings({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
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

  const handleGoToBranchRequests = (request) => {
    console.log(request.row.productsRequest);
    
    navigate(`${request.row.id}`, {
      state: { products: request.row.productsRequest, status: request.row.status },
    });
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "branchName",
      headerName: "الفرع",
      flex: 1,
    },
    {
      field: "status",
      headerName: "حالة الطلب",
      flex: 1,
    },
    {
      field: "date",
      headerName: "تاريخ الطلب",
      flex: 1,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (
          <ButtonComponent
            variant={"show"}
            small={true}
            onClick={() => handleGoToBranchRequests(params)}
          />
        );
      },
    },
  ];

  useEffect(() => {
    getBranches();
    getRequests();
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إدارة طلبات المنتجات:"} />
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
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
                  data={STATUSES}
                  dataTitle={"title"}
                  value={state.status}
                  label={"فلترة حسب الحالة"}
                  name={"status"}
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
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <DataTable columns={columns} rows={requests} />
        )}
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"الطلبات"}
        />
      </section>
    </main>
  );
}

export default ManageRequests;
