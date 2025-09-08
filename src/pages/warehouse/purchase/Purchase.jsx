import { useEffect, useReducer, useState } from "react";
import Title from "../../../components/titles/Title";
import SectionTitle from "../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../api/axios";
import LoadingSpinner from "../../../components/actions/LoadingSpinner";
import NoDataError from "../../../components/actions/NoDataError";
import DataTable from "../../../components/table/DataTable";
import DataTableAccordion from "../../../components/table/DataTableAccordion";
import ButtonComponent from "../../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import SearchComponent from "../../../components/inputs/SearchComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterDropDown from "../../../components/inputs/FilterDropDown";
import { faX } from "@fortawesome/free-solid-svg-icons";
import DateInputComponent2 from "../../../components/inputs/DateInputComponent2";
import dayjs from "dayjs";
import TablePagination from "../../../components/table/TablePagination";

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

const PURCHASE_STATUS = [
    { id: "pending", title: "قيد الانتظار" },
    { id: "completed", title: "مكتمل" },
    { id: "cancelled", title: "ملغي" },
];

const initialFilterState = {
    filter: false,
    date_of_purchase: "",
    status: "",
    orderingType: "",
    ordering: "",
};

function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [loadingPurchases, setLoadingPurchases] = useState(true);
    const [getPurchasesError, setGetPurchasesError] = useState(null);
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
        { id: "date_of_purchase", title: "تاريخ الشراء" },
        { id: "created_at", title: "تاريخ الإنشاء" },
        { id: "subtotal_price", title: "السعر الإجمالي" },
        { id: "total_price", title: "السعر النهائي" },
        { id: "status", title: "الحالة" },
    ];

    const handleFilterTerms = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "SET_FIELD", field: name, value });
    };

    const handleSearchClick = () => {
        setPage(1); // Reset to first page when searching
        let dateFilter = state.date_of_purchase ? `&date_of_purchase=${state.date_of_purchase}` : "";
        let statusFilter = state.status ? `&status=${state.status}` : "";
        
        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";
        
        let filter = dateFilter + statusFilter + orderingFilter;
        setFilterTerms(filter);
        getPurchases(`sales/purchases?page=1${filter}&search=${searchQuery}`);
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
        let dateFilter = state.date_of_purchase ? `&date_of_purchase=${state.date_of_purchase}` : "";
        let statusFilter = state.status ? `&status=${state.status}` : "";
        
        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";
        
        let filter = dateFilter + statusFilter + orderingFilter;
        setFilterTerms(filter);
        getPurchases(`sales/purchases?page=1${filter}&search=${searchQuery}`);
        handleCloseFilter();
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        let dateFilter = state.date_of_purchase ? `&date_of_purchase=${state.date_of_purchase}` : "";
        let statusFilter = state.status ? `&status=${state.status}` : "";
        
        let orderingTypeFilter = state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering ? `&ordering=${orderingTypeFilter}${state.ordering}` : "";
        
        let filter = dateFilter + statusFilter + orderingFilter;
        getPurchases(`sales/purchases?page=${newPage}${filter}&search=${searchQuery}`);
    };

    const PurchasesColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "branch_name",
            headerName: "الفرع",
            flex: 1,
        },
        {
            field: "customer_name",
            headerName: "العميل",
            flex: 1,
            // renderCell: (params) => {
            //     return params.row.customer ? `${params.row.customer.first_name} ${params.row.customer.last_name}` : "زائر";
            // }
        },
        {
            field: "status",
            headerName: "الحالة",
            flex: 1,
            renderCell: (params) => {
                const statusMap = {
                    "pending": "قيد الانتظار",
                    "completed": "مكتمل",
                    "cancelled": "ملغي"
                };
                return statusMap[params.row.status] || params.row.status;
            }
        },
        {
            field: "date_of_purchase",
            headerName: "تاريخ الشراء",
            flex: 1,
        },
        {
            field: "subtotal_price",
            headerName: "السعر الإجمالي",
            flex: 1,
        },
        {
            field: "total_price",
            headerName: "السعر النهائي",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "تاريخ الإنشاء",
            flex: 1,
        },
    ];

    const ProductsColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "product",
            headerName: "المنتج",
            flex: 1,
            renderCell: (params) => {
                return params.row.product_name || "منتج محذوف";
            }
        },
        {
            field: "quantity",
            headerName: "الكمية",
            flex: 1,
        },
        {
            field: "selling_price",
            headerName: "سعر البيع",
            flex: 1,
        },
        {
            field: "total_price",
            headerName: "السعر الإجمالي",
            flex: 1,
        },
        {
            field: "has_discount",
            headerName: "يحتوي على خصم",
            flex: 1,
            renderCell: (params) => {
                return params.row.has_discount ? "نعم" : "لا";
            }
        },
    ];
console.log(purchases);

    const getPurchases = async (link = "sales/purchases") => {
        try {
            setLoadingPurchases(true);
            setGetPurchasesError(null);
            const response = await axiosPrivate.get(link);
            setPurchases(response.data.results);
            setCount(response.data.count);
        } catch (error) {
            console.log(error);
            setGetPurchasesError(error);
        } finally {
            setLoadingPurchases(false);
        }
    };



    useEffect(() => {
        getPurchases();
    }, []);

    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <div className="flex justify-between items-center w-full">
                <Title text="المبيعات :" />
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
                
                {loadingPurchases ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getPurchasesError ? (
                    <NoDataError error={getPurchasesError} />
                ) : (
                    <>
                        <DataTableAccordion 
                            titleOfTable={"المنتجات المشتراة"} 
                            detailColumns={ProductsColumns} 
                            detailRows={"purchased_products"} 
                            columns={PurchasesColumns} 
                            rows={purchases} 
                        />
                        <TablePagination 
                            count={count} 
                            page={page} 
                            handleChangePage={handleChangePage} 
                            rowsName="المبيعات"
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
                                label="تاريخ الشراء"
                                value={state.date_of_purchase}
                                onChange={value => {
                                    handleFilterTerms({
                                        target: {
                                            name: 'date_of_purchase',
                                            value: value
                                        }
                                    })
                                }}
                            />
                        </div>
                        
                        <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                            <FilterDropDown
                                data={PURCHASE_STATUS}
                                dataTitle={"title"}
                                value={state.status}
                                label={"حالة الشراء"}
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
                            />
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Purchases;