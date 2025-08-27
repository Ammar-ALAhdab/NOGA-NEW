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
import FilterInputComponent from "../../components/inputs/FilterInputComponent";
import FilterDropDown from "../../components/inputs/FilterDropDown";
import SectionTitle from "../../components/titles/SectionTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import noProfilePhoto from "../../assets/demo/no_profile_img.jpg";

const initialFilterState = {
  filter: false,
  name: "",
  jobType: "",
  branch: "",
  ordering: "",
  orderingType: "",
};

const ORDERING_FIELDS = [
  { id: "first_name", title: "الاسم الأول" },
  { id: "jop_type", title: "المسمى الوظيفي" },
  { id: "branch", title: "الفرع" },
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

function Employees() {
  const [employeeRows, setEmployeeRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationSettings, setPaginationSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterShow, setFilterShow] = useState(false);
  const [filterTerms, setFilterTerms] = useState("");
  const [jobsTypes, setJobsTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const [, setPage] = useState(1);
  const navigate = useNavigate();
  const navigateToEmployeeByID = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const [state, dispatch] = useReducer(reducer, initialFilterState);

  const handleFilterTerms = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_FIELD", field: name, value });
  };

  const handleSearchClick = () => {
    getEmployees(`/employees?search=${searchQuery}`);
  };

  const handleFilterClick = () => {
    let nameFilter = state.name ? `&search=${state.name}` : "";
    let jobFilter = state.jobType ? `&job_type=${state.jobType}` : "";
    let branchFilter = state.branch ? `&branch=${state.branch}` : "";
    let orderingTypeFilter =
      state.orderingType == 1 || state.orderingType == "" ? "" : "-";
    let orderingFilter = state.ordering
      ? `&ordering=${orderingTypeFilter}${state.ordering}`
      : "";
    let filter = nameFilter + jobFilter + branchFilter + orderingFilter;
    setFilterTerms(filter);
    getEmployees(`/employees?${filter}`);
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

  const handleClickAddEmployee = () => {
    navigate("AddEmployee");
  };

  const handleChangePage = (event, value) => {
    setPage(value);
    getEmployees(
      `/employees?page=${value}${searchQuery ? `&search=${searchQuery}` : ""}${
        state.filter ? `${filterTerms}` : ""
      }`
    );
  };

  const formatEmployeesRows = (unFormattedData) => {
    const rowsData = unFormattedData.map((row) => ({
      id: row.id,
      profilePhoto: row?.image ? row?.image : noProfilePhoto,
      fullName: `${row.first_name} ${row.middle_name} ${row.last_name}`,
      jopTitle: `${row.job_type_title}`,
      branch: row.branch == null ? "لا يوجد" : `${row.branch_name}`,
      nationalId: `${row.national_number}`,
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

  const getEmployees = async (link = "/employees") => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      const data = formatEmployeesRows(response.data.results);
      setEmployeeRows(data);
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

  const getJobsTypes = async (url = "/employees/job_types") => {
    try {
      const response = await axiosPrivate.get(url);
      setJobsTypes((prev) => [...prev, ...response.data.results]);
      if (response.data.next) {
        getJobsTypes(response.data.next);
      }
    } catch (error) {
      console.error(error);
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

  useEffect(() => {
    getJobsTypes();
    getBranches();
    getEmployees();
  }, []);

  const handleGetEmployeeById = async (employeeId) => {
    try {
      const response = await axiosPrivate.get(`/employees?id=${employeeId}`);
      const employeeData = response?.data?.results;
      navigateToEmployeeByID(`${employeeId}`, {
        state: { employee: employeeData },
      });
    } catch (error) {
      console.error(error);
    }
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
      field: "fullName",
      headerName: "الاسم",
      flex: 1,
    },
    {
      field: "jopTitle",
      headerName: "المسمى الوظيفي",
      flex: 1,
    },
    {
      field: "branch",
      headerName: "الفرع",
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
            onClick={() => handleGetEmployeeById(params.id)}
          />
        );
      },
    },
  ];

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إدارة الموظفين:"} />
      <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
        <ButtonComponent variant={"add"} onClick={handleClickAddEmployee} />
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
                  name="name"
                  placeholder="فتلرة حسب الاسم"
                  value={state.name}
                  onChange={handleFilterTerms}
                />
                <div className="custom-select">
                  <FilterDropDown
                    data={jobsTypes}
                    dataTitle={"job_type"}
                    value={state.jobType}
                    label={"فلترة حسب الوظيفة"}
                    name={"jobType"}
                    onChange={handleFilterTerms}
                  />
                </div>
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
                />
              </div>
            </div>
          </div>
        </div>
        {/* ################################### END SEARCH AND FILTER ################################### */}

        {loading ? (
          <div className="flex items-center justify-center w-full h-[400px]">
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <DataTable columns={columns} rows={employeeRows} />
        )}
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"الموظفين"}
        />
      </section>
    </main>
  );
}

export default Employees;
