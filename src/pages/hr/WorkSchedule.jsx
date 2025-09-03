import { useEffect, useState } from "react";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import { axiosPrivate } from "../../api/axios";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import DataTable from "../../components/table/DataTable";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TablePagination from "../../components/table/TablePagination";
import CheckInputComponent from "../../components/inputs/CheckInputComponent";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TimeInputComponent from '../../components/inputs/TimeInputComponent'
import TextInputComponent from "../../components/inputs/TextInputComponent";
import dayjs from "dayjs";
import Swal from "sweetalert2";


function WorkSchedule() {
    const [workSchedule, setWorkSchedule] = useState()
    const [lodingWorkSchedule, setLodingWorkSchedule] = useState(true)
    const [getWorkScheduleError, setGetWorkScheduleError] = useState(null)
    const { workScheduleID } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const WorkSchedulesDayesColumns = [
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
                        <TimeInputComponent
                            value={dayjs(params.row.start_time, "hh:mm:ss")}
                            onChange={value => {
                                let newWorkDays = workSchedule
                                let work_day = newWorkDays.work_days.find(wd => wd.id == params.row.id)
                                work_day.start_time = value
                                setWorkSchedule(newWorkDays)
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
                        <TimeInputComponent
                            value={dayjs(params.row.end_time, "hh:mm:ss")}
                            onChange={value => {
                                let newWorkDays = workSchedule
                                let work_day = newWorkDays.work_days.find(wd => wd.id == params.row.id)
                                work_day.end_time = value
                                setWorkSchedule(newWorkDays)
                            }
                            }
                        />
                    </div>
                );
            },
        }, {
            field: "is_working_day",
            headerName: "يوم عمل",
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="relative w-full h-full flex justify-center items-center ">
                        <CheckInputComponent
                            value={params.row.is_working_day}
                            onChange={() => {
                                let newWorkDays = workSchedule
                                let work_day = newWorkDays.work_days.find(wd => wd.id == params.row.id)
                                work_day.is_working_day = !work_day.is_working_day
                                setWorkSchedule(newWorkDays)
                            }}
                        />



                    </div>
                );
            },
        },

    ];
    const editWorkSchedule = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية تعديل جدول الأعمال",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .put(`/employees/work_schedules/${workScheduleID}`, workSchedule)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية التعديل بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/workSchedules/${workScheduleID}`, { replace: true })
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
    const deleteWorkSchedule = async () => {
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
                    .delete(`/employees/work_schedules/${workScheduleID}`)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الحذف بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/workSchedules`, { replace: true })
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
        editWorkSchedule()
    }
    const getWorkSchedule = async (link = `/employees/work_schedules/${workScheduleID}`) => {
        try {
            setLodingWorkSchedule(true);
            setGetWorkScheduleError(null);
            const response = await axiosPrivate.get(link);
            setWorkSchedule(response.data);

        } catch (error) {
            setGetWorkScheduleError(error);
        } finally {
            setLodingWorkSchedule(false);

        }
    };
    useEffect(() => {
        getWorkSchedule()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="جدول الأعمال:" />
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {/* <SectionTitle text="تعديل قائمة المسميات الوظيفية:" /> */}

                {lodingWorkSchedule ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getWorkScheduleError ? (
                    <NoDataError error={getWorkScheduleError} />
                ) : (
                    <div className="relative w-full flex flex-col justify-center items-center">
                        <div className="relative w-full justify-start items-center">

                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{workSchedule.name}</p> */}
                                <TextInputComponent value={workSchedule.name} onChange={text => setWorkSchedule(prev => ({
                                    ...prev,
                                    name: text
                                }))} />
                                <p className="relative text-end w-[250px]">:اسم الجدول</p>
                            </div>
                            <div className="flex items-start justify-end py-5">
                                <p className="relative text-center">{workSchedule.created_at}</p>
                                <p className="relative text-end w-[250px]">:تاريخ الانشاء</p>
                            </div>
                            <div className="flex items-start justify-end py-5">
                                <p className="relative text-center">{workSchedule.updated_at}</p>
                                <p className="relative text-end w-[250px]">:تاريخ التعديل</p>
                            </div>
                            <div className="flex items-start justify-end py-5">

                                <CheckInputComponent value={workSchedule.is_active} onChange={() => setWorkSchedule(prev => ({
                                    ...prev,
                                    is_active: !prev.is_active
                                }))} />


                                <p className="relative text-end w-[250px]">:مفعّل</p>
                            </div>
                        </div>
                        <div className="relative w-full flex justify-end ">
                            <p className="relative text-end w-[250px]">:ايام الدوام</p>
                        </div>
                        <DataTable columns={WorkSchedulesDayesColumns} rows={workSchedule.work_days} />
                    </div>
                )}
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"delete"} onClick={() => { deleteWorkSchedule() }} />
                    <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} />
                </div>
            </section>
        </main>
    );
}

export default WorkSchedule;
