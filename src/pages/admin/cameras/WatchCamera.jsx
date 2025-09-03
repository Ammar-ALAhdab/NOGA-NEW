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
import WebSocketImageViewer from "../../../components/WebSocketImageViewer";

const CAMERA_TYPES = [
    { id: 1, title: "مراقبة", camera_type: "monitoring" },
    { id: 2, title: "احصائية الزوار", camera_type: "visitors" },
];


function WatchCamera() {
    const [camera, setCamera] = useState()
    const [lodingCamera, setLodingCamera] = useState(true)
    const [getCameraError, setGetCameraError] = useState(null)


    const { CameraId } = useParams();
    const navigate = useNavigate();




    const getCamera = async (link = `/branches/cameras/${CameraId}`) => {
        try {
            setLodingCamera(true);
            setGetCameraError(null);
            const response = await axiosPrivate.get(link);
            setCamera(response.data);
            const employee = {
                fullName: response.data.employee_name,
                id: response.data.id,
                nationalNumber: response.data.national_number,
            };
            setLoadingEmployee(false)
        } catch (error) {
            setGetCameraError(error);
        } finally {
            setLodingCamera(false);

        }
    };



    useEffect(() => {
        getCamera()
    }, [])
    return (
        <main className="relative w-full flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <section className="relative w-full flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {
                    !lodingCamera &&
                    <SectionTitle text={`البث المباشر من الفرع ${camera.branch_name} :`} />
                }
                {
                    !lodingCamera &&
                    <div className="relative w-full flex flex-col items-end justify-end py-5 ">
                        <WebSocketImageViewer wsUrl={camera.view_url} width='100%' height='100%' />
                    </div>

                }
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                </div>
            </section>
        </main>
    );
}

export default WatchCamera;
