import { useEffect, useReducer, useState } from "react";
import Title from "../../../components/titles/Title";
import SectionTitle from "../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../api/axios";
import LoadingSpinner from "../../../components/actions/LoadingSpinner";
import NoDataError from "../../../components/actions/NoDataError";
import DataTable from "../../../components/table/DataTable";
import ButtonComponent from "../../../components/buttons/ButtonComponent";
import TablePagination from "../../../components/table/TablePagination";
import CheckInputComponent from "../../../components/inputs/CheckInputComponent";
import { useNavigate } from "react-router-dom";
import CameraCapture from "../../../components/inputs/CameraCapture";
import DataTableAccordion from "../../../components/table/DataTableAccordion";
import SearchComponent from "../../../components/inputs/SearchComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterDropDown from "../../../components/inputs/FilterDropDown";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DateInputComponent from "../../../components/inputs/DateInputComponent";
import dayjs from "dayjs";
import DateInputComponent2 from "../../../components/inputs/DateInputComponent2";

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
const ORDERING_TYPE = [
    { id: 1, title: "تصاعدي" },
    { id: 2, title: "تنازلي" },
];
const initialFilterState = {
    filter: false,
    month: "",
    year: "",
    orderingType: "",
};

function Salaries() {
    const [salaries, setSalaries] = useState([])
    const [lodingSalaries, setLodingSalaries] = useState(true)
    const [getSalariesError, setGetSalariesError] = useState(null)
    const [filterShow, setFilterShow] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTerms, setFilterTerms] = useState("");
    const [state, dispatch] = useReducer(reducer, initialFilterState);
    const navigate = useNavigate();

    const ORDERING_FIELDS = [
        { id: "generated_at", title: "التاريخ" },
        { id: "month", title: "الشهر" },
        { id: "year", title: "السنة" },
        { id: "base_salary", title: "الراتب الاساسي" },
        { id: "final_salary", title: "الراتب النهائي" },
        { id: "absent_days", title: "ايام الغياب" },
        { id: "unpaid_vecation_days", title: "الاجازات غير المدفوعة" },
        { id: "late_or_left_early_count", title: "ايام التأخير او الخروج المبكر" },
    ];

    const handleFilterTerms = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "SET_FIELD", field: name, value });
    };

    const handleSearchClick = () => {
        let dateFilter = (state.month && state.year) ? `&month=${state.month}&year=${state.year}` : "";

        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = dateFilter + orderingFilter;
        setFilterTerms(filter);
        getSalaries(`/employees/salaries?${filter}&search=${searchQuery}`);
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
    const handleFilterClick = () => {
        let dateFilter = (state.month && state.year) ? `&month=${state.month}&year=${state.year}` : "";
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = dateFilter + orderingFilter;
        setFilterTerms(filter);
        getSalaries(`/employees/salaries?${filter}&search=${searchQuery}`);
        handleCloseFilter();
    };
    
    const SalariesColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "employee_name",
            headerName: "الموظف",
            flex: 1,
        },
        {
            field: "base_salary",
            headerName: "الراتب الاساسي",
            flex: 1,
        },
        {
            field: "final_salary",
            headerName: "الراتب النهائي",
            flex: 1,
        },
        {
            field: "unpaid_vecation_days",
            headerName: "الاجازات غير المدفوعة",
            flex: 1,
        },
        {
            field: "late_or_left_early_count",
            headerName: "ايام التأخير او الخروج المبكر",
            flex: 1,
        },
        {
            field: "absent_days",
            headerName: "ايام الغياب",
            flex: 1,
        },
        {
            field: "generated_at",
            headerName: "تاريخ الانشاء",
            flex: 1,
        },

    ];


    const getSalaries = async (link = "/employees/salaries") => {
        console.log(link);

        try {
            setLodingSalaries(true);
            setGetSalariesError(null);
            const response = await axiosPrivate.get(link);
            setSalaries(response.data);
        } catch (error) {
            console.log(error);

            setGetSalariesError(error);
        } finally {
            setLodingSalaries(false);

        }
    };
    const handleClickSignSalaries = () => {
        navigate(`sign`)
    }
console.log(state.month , state.year);

    useEffect(() => {
        getSalaries()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الرواتب :" />
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <div className="flex items-center justify-center gap-8 w-full">
                    <ButtonComponent variant={"filter"} onClick={handleShowFilter} />
                    <SearchComponent
                        onChange={setSearchQuery}
                        value={searchQuery}
                        onClickSearch={handleSearchClick}
                    />
                </div>
                {lodingSalaries ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getSalariesError ? (
                    <NoDataError error={getSalariesError} />
                ) : (
                    <DataTable  columns={SalariesColumns} rows={salaries} />
                    // <p>test</p>
                )}
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
                        <div className="flex flex-row-reverse items-center justify-end gap-2 w-full">
                            <DateInputComponent2
                                value={dayjs(state.date, "YYYY:MM:DD")}
                                onChange={value => {
                                    console.log(value.split('-')[0]);
                                    console.log(parseInt(value.split('-')[1]));
                                    handleFilterTerms({
                                        target: {
                                            name: 'year',
                                            value: parseInt(value.split('-')[0])
                                        }
                                    })
                                    handleFilterTerms({
                                        target: {
                                            name: 'month',
                                            value: parseInt(value.split('-')[1])
                                        }
                                    })
                                }
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
            </section>
        </main>
    );
}

export default Salaries;
