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
import FilterInputComponent from "../../components/inputs/FilterInputComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";

const formatting = (unFormattedData) => {
  const rowsData = unFormattedData.map((row) => ({
    id: row.id,
    branchName: `${row.city_name} ${row.number}`,
    address: `${row.street}, ${row.area}, ${row.city_name}`,
    branchManager: row.manager_name,
    options: <ButtonComponent />,
  }));
  return rowsData;
};

const formatManagers = (unFormattedData) => {
  const data = unFormattedData.map((d) => ({
    id: d.id,
    managerName: `${d.first_name} ${d.middle_name} ${d.last_name}`,
  }));
  return data;
};

const initialFilterState = {
  filter: false,
  managerName: "",
  city: "",
  ordering: "",
  orderingType: "",
};

const ORDERING_FIELDS = [
  { id: "manager", title: "اسم المدير" },
  { id: "city", title: "المدينة" },
];

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

function Branches() {
  const [formattedData, setFormattedData] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [page, setPage] = useState(1);

  const navigate = useNavigate();
  const navigateToBranchByID = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const [state, dispatch] = useReducer(reducer, initialFilterState);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleFilterClick = () => {
    let managerID = managers.find((obj) =>
      obj.managerName.includes(state.managerName)
    );
    let managerFilter =
      state.managerName && managerID != undefined
        ? `&manager=${managerID?.id}`
        : "";
    let cityFilter = state.city ? `&city=${state.city}` : "";
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter = managerFilter + cityFilter + orderingFilter;
    setFilterTerms(filter);
    setPage(1);

    getBranches(`/branches?${filter}`);
    handleCloseFilter();
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    getBranches(
      `/branches?page=${value}${searchQuery ? `&search=${searchQuery}` : ""}${
        state.filter ? `${filterTerms}` : ""
      }`
    );
  };

  const handleAddClick = () => {
    navigate("AddBranch");
  };

  const handleShowFilter = () => {
    setFilterShow(true);
    document.body.style.overflow = "hidden";
    setScrollTop(document.documentElement.scrollTop);
    document.documentElement.scrollTop = 0;
  };

  const handleSearchClick = () => {
    setPage(1);

    getBranches(`/branches?search=${searchQuery}`);
  };

  const handleCloseFilter = () => {
    setFilterShow(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      document.documentElement.scrollTop = scrollTop;
    }, 300);
  };

  const getCities = async (link = "/branches/cities") => {
    try {
      const response = await axiosPrivate.get(link);
      setCities((prev) => [...prev, ...response.data.results]);
      if (response.data.next) {
        getCities(response.data.next);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getManagers = async (link = "employees?job_type=4") => {
    try {
      const response = await axiosPrivate.get(link);
      const Managers = formatManagers(response.data.results);
      setManagers((prevData) => [...prevData, ...Managers]);
      if (response.data.next) {
        getManagers(response.data.next);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getBranches = async (link = "/branches") => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      const data = formatting(response.data.results);
      setFormattedData(data);
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
  useEffect(() => {
    getCities();
    getManagers();
    getBranches();
  }, []);

  const handleGetBranchById = async (branchId) => {
    try {
      const response = await axiosPrivate.get(`/branches?id=${branchId}`);
      const branchData = response?.data?.results;
      navigateToBranchByID(`${branchId}`, {
        state: { branch: branchData },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "branchName",
      headerName: "الفرع",
      flex: 1,
    },
    {
      field: "address",
      headerName: "العنوان",
      flex: 1,
    },
    {
      field: "branchManager",
      headerName: "مدير الفرع",
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
            onClick={() => handleGetBranchById(params.id)}
          />
        );
      },
    },
  ];

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إدارة الأفرع:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <ButtonComponent variant={"add"} onClick={handleAddClick} />
      </div>
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
                <FilterInputComponent
                  name="managerName"
                  placeholder="فتلرة حسب اسم المدير"
                  value={state.managerName}
                  onChange={handleFilterTerms}
                />
                <FilterDropDown
                  data={cities}
                  dataTitle={"city_name"}
                  value={state.city}
                  label={"فلترة حسب المدينة"}
                  name={"city"}
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
          <DataTable columns={columns} rows={formattedData} />
        )}
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"الأفرع"}
        />
      </section>
    </main>
  );
}

export default Branches;
