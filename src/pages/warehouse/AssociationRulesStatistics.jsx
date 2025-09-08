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
import { rule } from "postcss";
import dayjs from "dayjs";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import StatisticsBox from "../../components/layout/StatisticsBox";
import BarChartComponent from "../../components/charts/BarChartComponent";

const time = [
    { id: 1, value: "year", title: "سنوية" },
    { id: 2, value: "month", title: "شهرية" },
    { id: 3, value: "day", title: "يومية" },
];
function roundTo(num, digits) {
    const factor = Math.pow(10, digits);
    return Math.round(num * factor) / factor;
}
function calculatePercentage(number, percentage) {
    number = number
    return roundTo((number * 100) / percentage, 2);
}
const formatting = (unFormattedData) => {
    console.log(unFormattedData);

    const rowsData = unFormattedData.map((row) => ({
        id: row.id,
        rule: `${row.consequents_list.join(",")} ==> ${row.antecedents_list.join(",")}`,
        support: `% ${calculatePercentage(row.support, 1)}`,
        confidence: `% ${calculatePercentage(row.confidence, 1)}`,
        lift: roundTo(row.lift, 2),
        rule_strength: row.rule_strength,
        created_at: row.created_at,
        options: <ButtonComponent />,
    }));
    return rowsData;
};


const initialFilterState = {
    filter: false,
    branch: "",
    status: "",
    ordering: "",
    orderingType: "",
};
const ORDERING_FIELDS = [
    { id: "lift", title: "معامل الرفع" },
    { id: "confidence", title: "الثقة" },
    { id: "support", title: "الدعم" },
    { id: "created_at", title: "تاريخ انشاء القاعدة" }
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

function AssociationRulesStatistics() {
    const [associationRules, setAssociationRules] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterShow, setFilterShow] = useState(false);
    const [filterTerms, setFilterTerms] = useState("");
    const [purchacedproducts, setPurchacedproducts] = useState({});
    const [allPurchacedproducts, setAllPurchacedproducts] = useState([]);
    const [periodTime, setPeriodTime] = useState("year");
    const [dateTime, setDateTime] = useState(`${dayjs().format("YYYY-MM-DD")}`);
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
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = orderingFilter;
        setFilterTerms(filter);
        setPage(1);

        getAssociationRules(`/products/associationRules?${filter}`);
        handleCloseFilter();
    };



    const handleShowFilter = () => {
        setFilterShow(true);
        document.body.style.overflow = "hidden";
        setScrollTop(document.documentElement.scrollTop);
        document.documentElement.scrollTop = 0;
    };

    const handleSearchClick = () => {
        setPage(1);
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = orderingFilter;
        getAssociationRules(`/sales/assoication-rules?${filter}&search=${searchQuery}`);
    };

    const handleCloseFilter = () => {
        setFilterShow(false);
        document.body.style.overflow = "auto";
        setTimeout(() => {
            document.documentElement.scrollTop = scrollTop;
        }, 300);
    };

    const getAssociationRules = async (link = "/sales/assoication-rules") => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosPrivate.get(link);
            console.log(response);
            const data = formatting(response.data);
            setAssociationRules(data);
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    };


    const handleGoToBranchAssociationRules = (request) => {
        console.log(request.row.productsRequest);

        navigate(`${request.row.id}`, {
            state: { products: request.row.productsRequest, status: request.row.status },
        });
    };

    const columns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "rule",
            headerName: "القاعدة",
            flex: 1,
            renderCell: (params) => <div className="relative w-full">
                {params.row.rule}
            </div>
        },
        {
            field: "support",
            headerName: "الدعم",
            flex: 1,
        },
        {
            field: "confidence",
            headerName: "الثقة",
            flex: 1,
        },
        {
            field: "lift",
            headerName: "معامل الرفع",
            flex: 1,
        },
        {
            field: "rule_strength",
            headerName: "قوة القاعدة",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "تاريخ انشاء القاعدة",
            flex: 1,
        },
    ];
    const [totalEarnings, setTotalEarnings] = useState({ total_earning: 0 });
    const [newCustomersCounter, setNewCustomersCounter] = useState({
        customers_number: 0,
    });
    const [totalBranchesVisitors, setTotalBranchesVisitors] = useState({
        total_visitors: 0,
    });







    const getTotalBrachVisitors = async (link) => {
        try {
            const response = await axiosPrivate.get(link);
            setTotalBranchesVisitors(response.data);
        } catch (error) {
            console.log(error);
        }
    };


    const getBrachVisitors = async (link) => {
        try {
            const response = await axiosPrivate.get(link);
            setBranchesVisitors(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const getPurchacedproducts = async (link) => {
        try {
            let highestTotal = 0;
            let total = 0;
            let productWithHighestTotal = null;
            const response = await axiosPrivate.get(link);
            setAllPurchacedproducts(response.data)
            response.data.forEach((item) => {
                total += item.total;
                if (item.total > highestTotal) {
                    highestTotal = item.total;
                    productWithHighestTotal = item.product_name;
                }
            });
            setPurchacedproducts({
                popularProduct: productWithHighestTotal,
                countPurchased: highestTotal.toString(),
                total: total.toString(),
            });
        } catch (error) {
            console.log(error);
        }
    };

    const showStatistics = () => {

        getPurchacedproducts(
            `sales/purchaced-products-quantities?${periodTime}=${dateTime}`
        );
        getTotalBrachVisitors(
            `branches/total-branch-visitors?${periodTime}=${dateTime}`
        )
        getBrachVisitors(
            `branches/branch-visitors?${periodTime}=${dateTime}`
        )
    };

    useEffect(() => {
        showStatistics();
    }, []);

    useEffect(() => {
        showStatistics();
    }, [periodTime, dateTime]);
    useEffect(() => {
        getAssociationRules();
    }, []);
console.log(allPurchacedproducts);

    return (
        <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-3">
            <Title text="الإحصائيات:" />
            <section className="flex flex-col items-center justify-center gap-8 w-full bg-white rounded-[30px] p-4 my-box-shadow ">
                <div className="flex flex-row-reverse items-center justify-end w-full gap-4">
                    <DateInputComponent
                        label={"التاريخ:"}
                        value={dateTime}
                        onChange={setDateTime}
                    />
                    <DropDownComponent
                        label="الفترة الزمنية:"
                        data={time}
                        dataTitle={"title"}
                        dataValue={"value"}
                        ButtonText={"اختر الفترة"}
                        value={periodTime}
                        onSelect={setPeriodTime}
                    />
                </div>
                <div className="flex flex-row-reverse items-center justify-center w-full gap-4">
                    <StatisticsBox
                        type={"totalPurchasedProducts"}
                        value={purchacedproducts.total}
                    />
                    <StatisticsBox
                        type={"PopularProduct"}
                        value={purchacedproducts.popularProduct}
                    />
                </div>
                <SectionTitle text={"المخططات البيانية:"} />
                <div className="w-full flex flex-wrap items-center justify-center">
                    <div className="flex-1 flex items-center justify-center">
                        <BarChartComponent
                            data={allPurchacedproducts}
                            fill="#7049A3"
                            hoverFill="#D9A322"
                            dataKey="total"
                            XdataKey ="product_name"
                            Xvalue="المنتجات"
                            title="المنتجات المباعة"
                        />
                    </div>
                </div>
            </section>
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
                    <DataTable columns={columns} rows={associationRules} />
                )}

            </section>
        </main>
    );
}

export default AssociationRulesStatistics;
