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
import WebSocketImageViewerTwoQuadrilateralRegions from "../../../components/WebSocketImageViewerTwoQuadrilateralRegions";

const CAMERA_TYPES = [
    { id: 1, title: "مراقبة", camera_type: "monitoring" },
    { id: 2, title: "احصائية الزوار", camera_type: "visitors" },
];


function Camera() {
    const [camera, setCamera] = useState()
    const [lodingCamera, setLodingCamera] = useState(true)
    const [getCameraError, setGetCameraError] = useState(null)
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(
        {

        }
    )

    const { CameraId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();


    const editCamera = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية تعديل الكاميرا",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .put(`/branches/cameras/${CameraId}`, camera)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية التعديل بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/cameras/${CameraId}`, { replace: true })
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
    const deleteCamera = async () => {
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
                    .delete(`/branches/cameras/${CameraId}`)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الحذف بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/cameras`, { replace: true })
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
        editCamera()
    }
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

    const getBranches = async (url) => {
        try {
            const response = await axiosPrivate.get(url);
            const fetchedBranches = response.data.results?.map((branch) => {
                return {
                    id: branch.id,
                    branchName: `${branch.city_name} ${branch.number}`,
                };
            });
            setBranches((prevBranches) => [...prevBranches, ...fetchedBranches]);
            if (response.data.next) {
                getBranches(response.data.next);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getBranches("/branches")
        getCamera()
    }, [])
    // console.log("camera.area_points\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n" , camera?.area_points);
    
    return (
        <main className="relative w-full flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الاجازات:" />
            <section className="relative w-full flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {/* <SectionTitle text="تعديل قائمة المسميات الوظيفية:" /> */}

                {
                    !lodingCamera &&
                    <div className="relative w-full flex flex-col items-end justify-end py-5">

                        <div className="relative py-5">
                            {/* <p className="relative text-center">{camera.name}</p> */}
                            <DropDownComponent
                                data={branches}
                                dataValue={"id"}
                                dataTitle={"branchName"}
                                ButtonText={"اختر الفرع"}
                                label={"الفرع:"}
                                value={camera.branch}
                                onSelect={(value) => {
                                    setCamera(prev => ({
                                        ...prev,
                                        branch: value
                                    }))
                                }
                                }
                            />
                        </div>
                        <div className="relative py-5">
                            <DropDownComponent
                                data={CAMERA_TYPES}
                                dataValue={"camera_type"}
                                dataTitle={"title"}
                                ButtonText={"اختر نوع الكاميرا"}
                                label={"نوع الكاميرا:"}
                                value={camera.camera_type}
                                onSelect={value => setCamera(prev => ({
                                    ...prev,
                                    camera_type: value
                                }))} />
                        </div>
                        {
                            camera.camera_type == "visitors"
                            ?
                            <WebSocketImageViewerTwoQuadrilateralRegions area_points={camera.area_points} wsUrl={camera.view_url} width='100%' height='100%' onChange={(value) => {
                                setCamera(prev => ({
                                    ...prev,
                                    area_points : value
                                }))
                                
                            }}/>

                            :

                        <div className="flex items-start justify-end py-5">
                            <WebSocketImageViewer wsUrl={camera.view_url} width='100%' height='100%' />
                            <p className="relative text-end w-[250px]">:البث المياشر </p>
                        </div>

                        }

                    </div>
                }
                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"delete"} onClick={() => { deleteCamera() }} />
                    <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} />
                </div>
            </section>
        </main>
    );
}

export default Camera;
