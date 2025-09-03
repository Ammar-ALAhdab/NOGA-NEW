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
    date: "",
    status: "",
    check_in_status: "",
    check_out_status: "",
    orderingType: "",
};
const STATUS = [
    { id: "present", title: "حاضر" },
    { id: "absent", title: "غائب" },
    { id: "on_vecation", title: "في اجازة" },
]
const CHECK_IN_STATUS = [
    { id: "on_time", title: "على الوقت" },
    { id: "late", title: "متأخر" },
]
const CHECK_OUT_STATUS = [
    { id: "on_time", title: "على الوقت" },
    { id: "left_early", title: "خرج مبكراً" },
]
function Attendances() {
    const [attendances, setAttendances] = useState([])
    const [lodingAttendances, setLodingAttendances] = useState(true)
    const [getAttendancesError, setGetAttendancesError] = useState(null)
    const [filterShow, setFilterShow] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTerms, setFilterTerms] = useState("");
    const [state, dispatch] = useReducer(reducer, initialFilterState);
    const navigate = useNavigate();

    const ORDERING_FIELDS = [{ id: "created_at", title: "التاريخ" }];

    const handleFilterTerms = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "SET_FIELD", field: name, value });
    };

    const handleSearchClick = () => {
        let dateFilter = state.date ? `&date=${state.date}` : "";
        let statusFilter = state.status ? `&status=${state.status}` : "";
        let check_in_statusFilter = state.check_in_status ? `&check_in_status=${state.check_in_status}` : "";
        let check_out_statusFilter = state.check_out_status ? `&check_out_status=${state.check_out_status}` : "";
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = dateFilter + statusFilter + check_in_statusFilter + check_out_statusFilter + orderingFilter;
        setFilterTerms(filter);
        getAttendances(`/employees/attendance?${filter}&search=${searchQuery}`);
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
        let dateFilter = state.date ? `&date=${state.date}` : "";
        let statusFilter = state.status ? `&status=${state.status}` : "";
        let check_in_statusFilter = state.check_in_status ? `&check_in_status=${state.check_in_status}` : "";
        let check_out_statusFilter = state.check_out_status ? `&check_out_status=${state.check_out_status}` : "";
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = dateFilter + statusFilter + check_in_statusFilter + check_out_statusFilter + orderingFilter;
        setFilterTerms(filter);
        getAttendances(`/employees/attendance?${filter}&search=${searchQuery}`);
        handleCloseFilter();
    };
    const AttendancesColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "employee_name",
            headerName: "الموظف",
            flex: 1,
        },
        {
            field: "status",
            headerName: "الحضور",
            flex: 1,
        },
        {
            field: "check_in_status",
            headerName: "حالة تسجيل الدخول",
            flex: 1,
        },
        {
            field: "check_out_status",
            headerName: "حالة تسجيل الخروج",
            flex: 1,
        },
        {
            field: "date",
            headerName: "التاريخ",
            flex: 1,
        },

        {
            field: "created_at",
            headerName: "تاريخ الانشاء",
            flex: 1,
        },

    ];
    const logs_columns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: 'check_in',
            headerName: 'وقت الدخول',
            flex: 1
        },
        {
            field: 'check_out',
            headerName: 'وقت الخروج',
            flex: 1
        }
    ]

    const getAttendances = async (link = "/employees/attendance") => {
        console.log(link);

        try {
            setLodingAttendances(true);
            setGetAttendancesError(null);
            const response = await axiosPrivate.get(link);
            setAttendances(response.data);
        } catch (error) {
            console.log(error);

            setGetAttendancesError(error);
        } finally {
            setLodingAttendances(false);

        }
    };
    const handleClickSignAttendances = () => {
        navigate(`sign`)
    }

    useEffect(() => {
        getAttendances()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الحضور :" />
            <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
                <ButtonComponent variant={"add"} textButton="تسجيل" onClick={handleClickSignAttendances} />
            </div>
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <div className="flex items-center justify-center gap-8 w-full">
                    <ButtonComponent variant={"filter"} onClick={handleShowFilter} />
                    <SearchComponent
                        onChange={setSearchQuery}
                        value={searchQuery}
                        onClickSearch={handleSearchClick}
                    />
                </div>
                {lodingAttendances ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getAttendancesError ? (
                    <NoDataError error={getAttendancesError} />
                ) : (
                    <DataTableAccordion titleOfTable={""} detailColumns={logs_columns} detailRows={"logs"} columns={AttendancesColumns} rows={attendances} />
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
                                    handleFilterTerms({
                                        target: {
                                            name: 'date',
                                            value: value
                                        }
                                    })
                                }
                                }
                            />
                        </div>
                        <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                            <FilterDropDown
                                data={STATUS}
                                dataTitle={"title"}
                                value={state.status}
                                label={"فلترة حسب الحضور"}
                                name={"status"}
                                onChange={handleFilterTerms}
                            />
                        </div>
                        <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                            <FilterDropDown
                                data={CHECK_IN_STATUS}
                                dataTitle={"title"}
                                value={state.check_in_status}
                                label={"فلترة حسب حالة الدخول"}
                                name={"check_in_status"}
                                onChange={handleFilterTerms}
                            />
                        </div>
                        <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                            <FilterDropDown
                                data={CHECK_OUT_STATUS}
                                dataTitle={"title"}
                                value={state.check_out_status}
                                label={"فلترة حسب حالة الخروج"}
                                name={"check_out_status"}
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
            </section>
        </main>
    );
}

export default Attendances;
