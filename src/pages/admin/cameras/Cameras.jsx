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
import CopyToClipboard from "../../../components/buttons/CopyToClipboard";
import SearchComponent from "../../../components/inputs/SearchComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import FilterDropDown from "../../../components/inputs/FilterDropDown";



const ORDERING_FIELDS = [{ id: "created_at", title: "تاريخ الطلب" }];

const ORDERING_TYPE = [
    { id: 1, title: "تصاعدي" },
    { id: 2, title: "تنازلي" },
];

const CAMERA_TYPES = [
    {
        id: 'monitoring',
        title: 'مراقبة'
    },
    {
        id: 'visitors',
        title: 'احصائية الزوار'
    }
]
const IS_ACTIVE = [
    {
        id: 'true',
        title: 'نعم'
    },
    {
        id: 'false',
        title: 'لا'
    }
]


function Cameras() {
    const initialFilterState = {
        filter: false,
        branch: "",
        camera_type: "",
        is_active: "",
        ordering: "",
        orderingType: "",
    };
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
    const [cameras, setCameras] = useState([])
    const [lodingCameras, setLodingCameras] = useState(true)
    const [getCamerasError, setGetCamerasError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [filterShow, setFilterShow] = useState(false);
    const [page, setPage] = useState(1);
    const [paginationSettings, setPaginationSettings] = useState(null);
    const [filterTerms, setFilterTerms] = useState("");
    const [branches, setBranches] = useState([]);
    const navigate = useNavigate();
    const [scrollTop, setScrollTop] = useState(0);
    const [state, dispatch] = useReducer(reducer, initialFilterState);

    const handleFilterTerms = (e) => {
        const { name, value } = e.target;
        dispatch({ type: "SET_FIELD", field: name, value });
    };

    const handleFilterClick = async () => {
        let branchFilter = state.branch ? `&branch=${state.branch}` : "";
        let cameraTypeFilter = state.camera_type ? `&camera_type=${state.camera_type}` : "";
        let isActiveTypeFilter = state.is_active ? `&is_active=${state.is_active}` : "";
        let orderingTypeFilter =
            state.orderingType == 1 || state.orderingType == "" ? "" : "-";
        let orderingFilter = state.ordering
            ? `&ordering=${orderingTypeFilter}${state.ordering}`
            : "";
        let filter = branchFilter + cameraTypeFilter + isActiveTypeFilter + orderingFilter;
        console.log(branchFilter);
        console.log(cameraTypeFilter);
        console.log(isActiveTypeFilter);
        console.log(orderingFilter);
        setFilterTerms(filter);
        setPage(1);

        await getCameras(`/branches/cameras?${filter}`);
        handleCloseFilter();
    };
    const formatBranches = (unFormattedData) => {
        const data = unFormattedData.map((d) => ({
            id: d.id,
            title: `${d.number} ${d.city_name}`,
        }));
        return data;
    };
    const CamerasColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "branch_name",
            headerName: "الفرع",
            flex: 1,
        },
        {
            field: "camera_type",
            headerName: "نوع الكاميرا",
            flex: 1,
        },
        {
            field: "is_active",
            headerName: "فعالة",
            flex: 1,
            renderCell: (params) => {
                return (
                    params.row.is_active ?
                        <p>نعم</p>
                        :
                        <p>لا</p>
                )
            }
        },
        {
            field: "source_url",
            headerName: "رابط الارسال",
            flex: 1,
            renderCell: (params) => {

                return (
                    <CopyToClipboard text={params.row.source_url} />
                );
            },
        },
        {
            field: "view_url",
            headerName: "المشاهدة",
            flex: 1,
            renderCell: (params) => {

                return (
                    <ButtonComponent
                        variant={"watch"}
                        titleButton="مشاهدة البث"
                        small={true}
                        onClick={() => { navigate(`watch/${params.row.id}`, { 'CameraId': params.row.id }) }}
                    />
                );
            },
        },

        {
            field: "",
            headerName: "عرض التفاصيل",
            width: 150,
            sortable: false,
            renderCell: (params) => {
                return (
                    <ButtonComponent
                        variant={"show"}
                        small={true}
                        onClick={() => { navigate(`${params.row.id}`, { 'CameraId': params.row.id }) }}
                    />
                );
            },
        },
    ];
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
    const getCameras = async (link = "/branches/cameras") => {
        try {
            setLodingCameras(true);
            setGetCamerasError(null);
            const response = await axiosPrivate.get(link);
            setCameras(response.data.results);
            setPaginationSettings({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
            });
        } catch (error) {
            setGetCamerasError(error);
        } finally {
            setLodingCameras(false);

        }
    };
    const handleCloseFilter = () => {
        setFilterShow(false);
        document.body.style.overflow = "auto";
        setTimeout(() => {
            document.documentElement.scrollTop = scrollTop;
        }, 300);
    };
    const handleShowFilter = () => {
        setFilterShow(true);
        document.body.style.overflow = "hidden";
        setScrollTop(document.documentElement.scrollTop);
        document.documentElement.scrollTop = 0;
    };
    const handleSearchClick = () => {
        setPage(1);

        getCameras(`/branches/cameras?&search=${searchQuery}`);
    };
    const handleClickAddCameras = () => {
        navigate(`addCamera`)
    }
    const handleChangePage = (event, value) => {
        setPage(value);
        getCameras(
            `/branches/cameras?&page=${value}${searchQuery ? `&search=${searchQuery}` : ""
            }${state.filter ? `${filterTerms}` : ""}`
        );
    };
    useEffect(() => {
        getBranches();

        getCameras()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الكاميرات :" />
            <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
                <ButtonComponent variant={"add"} onClick={handleClickAddCameras} />
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
                            data={CAMERA_TYPES}
                            dataTitle={"title"}
                            value={state.status}
                            label={"فلترة حسب نوع الكاميرا"}
                            name={"camera_type"}
                            onChange={handleFilterTerms}
                        />
                    </div>
                    <div className="flex flex-row-reverse items-center justify-center gap-2 w-full">
                        <FilterDropDown
                            data={IS_ACTIVE}
                            dataTitle={"title"}
                            value={state.is_active}
                            label={"فلترة حسب  فعالية الكاميرا"}
                            name={"is_active"}
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
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text=" قائمة الكاميرات" />
                <div className="flex items-center justify-center gap-8 w-full">
                    <ButtonComponent variant={"filter"} onClick={handleShowFilter} />
                    <SearchComponent
                        onChange={setSearchQuery}
                        value={searchQuery}
                        onClickSearch={handleSearchClick}
                    />
                </div>
                {lodingCameras ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getCamerasError ? (
                    <NoDataError error={getCamerasError} />
                ) : (
                    <DataTable columns={CamerasColumns} rows={cameras} />
                    // <p>test</p>
                )}
                <TablePagination
                    count={paginationSettings?.count}
                    handleChangePage={handleChangePage}
                    rowsName={"الكاميرات"}
                />
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                </div>
            </section>
        </main>
    );
}

export default Cameras;
