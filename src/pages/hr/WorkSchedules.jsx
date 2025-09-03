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
import { useNavigate } from "react-router-dom";


function WorkSchedules() {
    const [workSchedules, setWorkSchedules] = useState([])
    const [lodingWorkSchedules, setLodingWorkSchedules] = useState(true)
    const [getWorkSchedulesError, setGetWorkSchedulesError] = useState(null)
    const navigate = useNavigate();

    const WorkSchedulesColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "name",
            headerName: "اسم الجدول",
            flex: 1,
        },
        {
            field: "created_at",
            headerName: "تاريخ الانشاء",
            flex: 1,
        },
        {
            field: "updated_at",
            headerName: "تاريخ التعديل",
            flex: 1,
        }, {
            field: "is_active",
            headerName: "فعال",
            flex: 1,
            renderCell: (params) => {
                return (
                    <div className="relative w-full h-full flex justify-center items-center ">
                       {
                            params.row.is_active ?
                                <p className="relative text-center text-green-500">نعم</p>
                                :
                                <p className="relative text-center text-red-500">لا</p>
                       }
                    </div>
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
                        onClick={() => { navigate(`${params.row.id}`) }}
                    />
                );
            },
        },
    ];

    const getWorkSchedules = async (link = "/employees/work_schedules") => {
        try {
            setLodingWorkSchedules(true);
            setGetWorkSchedulesError(null);
            const response = await axiosPrivate.get(link);
            setWorkSchedules(response.data);
        } catch (error) {
            setGetWorkSchedulesError(error);
        } finally {
            setLodingWorkSchedules(false);

        }
    };
    const handleClickAddWorkSchedule = () => {
        navigate(`addWorkSchedule`)
    }
    useEffect(() => {
        getWorkSchedules()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="جداول الأعمال:" />
            <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
                <ButtonComponent variant={"add"} onClick={handleClickAddWorkSchedule} />
            </div>
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text=" قائمة جداول الأعمال في الشركة:" />
                {lodingWorkSchedules ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getWorkSchedulesError ? (
                    <NoDataError error={getWorkSchedulesError} />
                ) : (
                    <DataTable columns={WorkSchedulesColumns} rows={workSchedules} />
                    // <p>test</p>
                )}

            </section>
        </main>
    );
}

export default WorkSchedules;
