import { useEffect, useState } from "react";
import Title from "../../../components/titles/Title";
import SectionTitle from "../../../components/titles/SectionTitle";
import { axiosPrivate } from "../../../api/axios";
import LoadingSpinner from "../../../components/actions/LoadingSpinner";
import NoDataError from "../../../components/actions/NoDataError";
import DataTable from "../../../components/table/DataTable";
import ButtonComponent from "../../../components/buttons/ButtonComponent";
import TablePagination from "../../../components/table/TablePagination";
import CheckInputComponent from "../../../components/inputs/CheckInputComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TimeInputComponent from '../../../components/inputs/TimeInputComponent'
import TextInputComponent from "../../../components/inputs/TextInputComponent";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import DropDownComponent from "../../../components/inputs/DropDownComponent";
import DateInputComponent from "../../../components/inputs/DateInputComponent";
import SearchComponent from "../../../components/inputs/SearchComponent";


function Vecation() {
    const [vecation, setVecation] = useState()
    const [lodingVecation, setLodingVecation] = useState(true)
    const [getVecationError, setGetVecationError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [employee, setEmployee] = useState()
    const [loadingEmployee, setLoadingEmployee] = useState(true)
    const [errorEmployee, setErrorEmployee] = useState(null)


    const { vecationID } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const VECATOIN_TYPES = [
        { id: 1, title: "مدفوعة", vecation_type: "paid" },
        { id: 2, title: "غير مدفوعة", vecation_type: "unpaid" },
    ];
    const DURATION_TYPE = [
        { id: 1, title: "يومية", duration_type: "daily" },
        { id: 2, title: "شهرية", duration_type: "monthly" },
    ];
    const VecationsDayesColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "day_name",
            headerName: "اليوم",
            flex: 1,
        },
        {
            field: "start_time",
            headerName: "بدء الدوام",
            flex: 1,
            editable: true,
            renderCell: (params) => {
                return (
                    <div className="relative w-full h-full flex justify-center items-center ">
                        <DateInputComponent
                            value={dayjs(params.row.start_time, "hh:mm:ss")}
                            onChange={value => {
                                setVecation(prev => ({
                                    ...prev,
                                    start_time: value
                                }))
                            }
                            }
                        />
                    </div>
                );
            },
        },
        {
            field: "end_time",
            headerName: "نهاية الدوام",
            flex: 1,
            editable: true,
            renderCell: (params) => {
                return (
                    <div className="relative w-full h-full flex justify-center items-center ">
                        <DateInputComponent
                            value={dayjs(params.row.end_time, "hh:mm:ss")}
                            onChange={value => {
                                setVecation(prev => ({
                                    ...prev,
                                    end_time: value
                                }))
                            }
                            }
                        />
                    </div>
                );
            },
        }

    ];
    const editVecation = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية تعديل الاجازة",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .put(`/employees/vecations/${vecationID}`, vecation)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية التعديل بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/vecations/${vecationID}`, { replace: true })
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في التعديل",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }
    const deleteVecation = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية حذف جدول الأعمال",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .delete(`/employees/vecations/${vecationID}`)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الحذف بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/vecations`, { replace: true })
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في الحذف",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }
    const handleEditButton = async () => {
        editVecation()
    }
    const getVecation = async (link = `/employees/vecations/${vecationID}`) => {
        try {
            setLodingVecation(true);
            setGetVecationError(null);
            const response = await axiosPrivate.get(link);
            setVecation(response.data);
            const employee = {
                fullName: response.data.employee_name,
                id: response.data.id,
                nationalNumber: response.data.national_number,
            };
            setEmployee(employee);
            setLoadingEmployee(false)
        } catch (error) {
            setGetVecationError(error);
        } finally {
            setLodingVecation(false);

        }
    };
    const getEmployee = async (link = "/employees") => {
        try {
            setLoadingEmployee(true);
            setErrorEmployee(false);
            setEmployee({});
            const response = await axiosPrivate.get(link);
            console.log(response.data);
            if (response.data.results[0]) {
                const { first_name, middle_name, last_name, national_number, id } =
                    response.data.results[0];
                const employee = {
                    fullName: `${first_name} ${middle_name} ${last_name}`,
                    id: id,
                    nationalNumber: national_number,
                };
                console.log(vecation);

                setVecation(prev => ({
                    ...prev,
                    employee: employee.id
                }))
                setEmployee(employee);
            } else if (response.data.results.length == 0) {
                setErrorEmployee(true);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingEmployee(false);
        }
    };

    const handleSearchClick = () => {
        getEmployee(`/employees?search=${searchQuery}`);
    };
    useEffect(() => {
        getVecation()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الاجازات:" />
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {/* <SectionTitle text="تعديل قائمة المسميات الوظيفية:" /> */}

                {lodingVecation ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getVecationError ? (
                    <NoDataError error={getVecationError} />
                ) : (
                    <div className="relative w-full flex flex-col justify-center items-center">
                        <div className="relative w-full justify-start items-center">
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                <SearchComponent
                                    onChange={setSearchQuery}
                                    value={searchQuery}
                                    onClickSearch={handleSearchClick}
                                />
                            </div>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                {!loadingEmployee ? (
                                    errorEmployee ? (
                                        <div className="flex items-center justify-center gap-4">
                                            <p className="font-bold">
                                                لا يوجد سجل للموظف المطلوب
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid lg:grid-cols-2 gap-4 w-full">
                                            <div className="flex flex-col items-end justify-end gap-4">
                                                <TextInputComponent
                                                    label={"الرقم الوطني:"}
                                                    value={employee.nationalNumber}
                                                    disabled={true}
                                                />
                                            </div>
                                            <div className="flex flex-col items-end justify-start gap-4">
                                                <TextInputComponent
                                                    label={"اسم الموظف:"}
                                                    value={employee.fullName}
                                                    disabled={true}
                                                />
                                            </div>
                                        </div>
                                    )
                                ) : null}

                            </div>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                <DropDownComponent
                                    data={VECATOIN_TYPES}
                                    dataValue={"vecation_type"}
                                    dataTitle={"title"}
                                    ButtonText={"اختر نوع الاجازة"}
                                    label={"نوع الاجازة:"}
                                    value={vecation.vecation_type}
                                    onSelect={value => setVecation(prev => ({
                                        ...prev,
                                        vecation_type: value
                                    }))} />
                            </div>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                <DropDownComponent
                                    data={DURATION_TYPE}
                                    dataValue={"duration_type"}
                                    dataTitle={"title"}
                                    ButtonText={"اختر فترة الاجازة"}
                                    label={"فترة الاجازة:"}
                                    value={vecation.duration_type}
                                    onSelect={value => setVecation(prev => ({
                                        ...prev,
                                        duration_type: value
                                    }))} />
                            </div>
                            <div className="flex items-start justify-end py-5">
                                <p className="relative text-center">{vecation.created_at}</p>
                                <p className="relative text-end w-[250px]">:تاريخ الانشاء</p>
                            </div>
                            <div className="flex items-start justify-end py-5">
                                <DateInputComponent
                                    onChange={date => {
                                        setVecation(prev => ({
                                            ...prev,
                                            start_date: date
                                        }))
                                    }}
                                    value={dayjs(vecation.start_date, "YYYY-MM-DD")} />
                                <p className="relative text-end w-[250px]">:تاريخ البداية</p>
                            </div>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.end_date}</p> */}
                                <DateInputComponent
                                    onChange={date => {
                                        setVecation(prev => ({
                                            ...prev,
                                            end_date: date
                                        }))
                                    }}
                                    value={dayjs(vecation.end_date, "YYYY-MM-DD")} />
                                <p className="relative text-end w-[250px]">:تاريخ النهاية</p>
                            </div>

                        </div>

                    </div>
                )}
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"delete"} onClick={() => { deleteVecation() }} />
                    <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} />
                </div>
            </section>
        </main>
    );
}

export default Vecation;
