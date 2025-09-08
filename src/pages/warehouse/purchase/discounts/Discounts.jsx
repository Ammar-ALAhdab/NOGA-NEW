import { useEffect, useReducer, useState } from "react";
import Title from "../../../../components/titles/Title";
import SectionTitle from "../../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../../api/axios";
import LoadingSpinner from "../../../../components/actions/LoadingSpinner";
import NoDataError from "../../../../components/actions/NoDataError";
import DataTable from "../../../../components/table/DataTable";
import ButtonComponent from "../../../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import SearchComponent from "../../../../components/inputs/SearchComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterDropDown from "../../../../components/inputs/FilterDropDown";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DateInputComponent2 from "../../../../components/inputs/DateInputComponent2";
import dayjs from "dayjs";
import TablePagination from "../../../../components/table/TablePagination";

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

const DISCOUNT_TYPES = [
    { id: "percentage", title: "نسبة مئوية" },
    { id: "fixed", title: "مبلغ ثابت" },
];

const initialFilterState = {
    filter: false,
    start_date: "",
    end_date: "",
    discount_type: "",
    orderingType: "",
    ordering: "",
};

function Discounts() {
    const [discounts, setDiscounts] = useState([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(true);
    const [getDiscountsError, setGetDiscountsError] = useState(null);
    const [filterShow, setFilterShow] = useState(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterTerms, setFilterTerms] = useState("");
    const [state, dispatch] = useReducer(reducer, initialFilterState);

    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);

    const ORDERING_FIELDS = [
        { id: "id", title: "ID" },
        { id: "start_date", title: "تاريخ البداية" },
        { id: "end_date", title: "تاريخ النهاية" },
        { id: "created_at", title: "تاريخ الإنشاء" },
        { id: "amount", title: "كمية الحسم" },
        { id: "discount_type", title: "نوع الخصم" },
    ];

    const handleFilterTerms = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "SET_FIELD", field: name, value });
    };

    const handleSearchClick = () => {
        setPage(1); // Reset to first page when searching
        let dateFilter = state.start_date ? `&start_date=${state.start_date}` : "";
        dateFilter += state.end_date ? `&end_date=${state.end_date}` : "";

        let discountTypeFilter = state.discount_type ? `&discount_type=${state.discount_type}` : "";

        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";

        let filter = dateFilter + discountTypeFilter + orderingFilter;
        setFilterTerms(filter);
        getDiscounts(`sales/discounts?page=1${filter}&search=${searchQuery}`);
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
        setPage(1); // Reset to first page when filtering
        let dateFilter = state.start_date ? `&start_date=${state.start_date}` : "";
        dateFilter += state.end_date ? `&end_date=${state.end_date}` : "";

        let discountTypeFilter = state.discount_type ? `&discount_type=${state.discount_type}` : "";

        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";

        let filter = dateFilter + discountTypeFilter + orderingFilter;
        setFilterTerms(filter);
        getDiscounts(`sales/discounts?page=1${filter}&search=${searchQuery}`);
        handleCloseFilter();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        let dateFilter = state.start_date ? `&start_date=${state.start_date}` : "";
        dateFilter += state.end_date ? `&end_date=${state.end_date}` : "";

        let discountTypeFilter = state.discount_type ? `&discount_type=${state.discount_type}` : "";

        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";

        let filter = dateFilter + discountTypeFilter + orderingFilter;
        getDiscounts(`sales/discounts?page=${newPage}${filter}&search=${searchQuery}`);
    };

    const DiscountsColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "discount_type",
            headerName: "نوع الخصم",
            flex: 1,
            renderCell: (params) => {
                return params.row.discount_type === "percentage" ? "نسبة مئوية" : "مبلغ ثابت";
            }
        },
        {
            field: "amount",
            headerName: "كمية الحسم",
            flex: 1,
        },
        {
            field: "start_date",
            headerName: "تاريخ البداية",
            flex: 1,
        },
        {
            field: "end_date",
            headerName: "تاريخ النهاية",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "تاريخ الإنشاء",
            flex: 1,
        },
        {
            field: "has_products",
            headerName: "يحتوي على منتجات",
            flex: 1,
            renderCell: (params) => {
                return params.row.has_products ? "نعم" : "لا";
            }
        },
        {
            field: "has_categories",
            headerName: "يحتوي على فئات",
            flex: 1,
            renderCell: (params) => {
                return params.row.has_categories ? "نعم" : "لا";
            }
        },
        {
            field: "options",
            headerName: "خيارات",
            flex: 1,
            renderCell: (params) => {
                return <ButtonComponent small variant={"show"} onClick={() => {
                    console.log(params.row.id);

                    navigate(`${params.row.id}`)
                }} />
            }
        },
    ];

    const getDiscounts = async (link = "sales/discounts") => {
        try {
            setLoadingDiscounts(true);
            setGetDiscountsError(null);
            const response = await axiosPrivate.get(link);
            setDiscounts(response.data.results);
            setCount(response.data.count);
        } catch (error) {
            console.log(error);
            setGetDiscountsError(error);
        } finally {
            setLoadingDiscounts(false);
        }
    };

    const handleCreateDiscount = () => {
        navigate("addDiscount");
    };

    useEffect(() => {
        getDiscounts();
    }, []);

    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <div className="flex flex-col justify-end items-end w-full">
                <Title text="الخصومات :" />
                <div className="relative py-5">
                    <ButtonComponent
                        variant={"primary"}
                        textButton="إضافة خصم"
                        onClick={handleCreateDiscount}
                    />
                </div>
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

                {loadingDiscounts ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getDiscountsError ? (
                    <NoDataError error={getDiscountsError} />
                ) : (
                    <>
                        <DataTable columns={DiscountsColumns} rows={discounts} />
                        <TablePagination
                            count={count}
                            page={page}
                            handleChangePage={handleChangePage}
                            rowsName="الخصومات"
                        />
                    </>
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
                                label="تاريخ البداية"
                                value={state.start_date}
                                onChange={value => {
                                    handleFilterTerms({
                                        target: {
                                            name: 'start_date',
                                            value: value
                                        }
                                    })
                                }}
                            />
                            <DateInputComponent2
                                label="تاريخ النهاية"
                                value={state.end_date}
                                onChange={value => {
                                    handleFilterTerms({
                                        target: {
                                            name: 'end_date',
                                            value: value
                                        }
                                    })
                                }}
                            />
                        </div>

                        <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                            <FilterDropDown
                                data={DISCOUNT_TYPES}
                                dataTitle={"title"}
                                value={state.discount_type}
                                label={"نوع الخصم"}
                                name={"discount_type"}
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

export default Discounts;