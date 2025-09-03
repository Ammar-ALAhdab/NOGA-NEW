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
import { useNavigate } from "react-router-dom";


function Vecations() {
    const [vecations, setVecations] = useState([])
    const [lodingVecations, setLodingVecations] = useState(true)
    const [getVecationsError, setGetVecationsError] = useState(null)
    const navigate = useNavigate();

    const VecationsColumns = [
        { field: "id", headerName: "ID", width: 50 },
        {
            field: "vecation_type",
            headerName: "نوع الاجازة",
            flex: 1,
        },
        {
            field: "duration_type",
            headerName: "فترة الاجازة",
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
            headerName: "تاريخ الانشاء",
            flex: 1,
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

    const getVecations = async (link = "/employees/vecations") => {
        try {
            setLodingVecations(true);
            setGetVecationsError(null);
            const response = await axiosPrivate.get(link);
            setVecations(response.data);
        } catch (error) {
            setGetVecationsError(error);
        } finally {
            setLodingVecations(false);

        }
    };
    const handleClickAddVecations = () => {
        navigate(`addVecation`)
    }
    useEffect(() => {
        getVecations()
    }, [])
    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الاجازات :" />
            <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
                <ButtonComponent variant={"add"} onClick={handleClickAddVecations} />
            </div>
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text=" قائمة الاجازات" />
                {lodingVecations ? (
                    <div className="flex justify-center items-center h-[400px]">
                        <LoadingSpinner w="64px" h="64px" />
                    </div>
                ) : getVecationsError ? (
                    <NoDataError error={getVecationsError} />
                ) : (
                    <DataTable columns={VecationsColumns} rows={vecations} />
                    // <p>test</p>
                )}

            </section>
        </main>
    );
}

export default Vecations;
