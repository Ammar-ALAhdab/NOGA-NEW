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


function AddCamera() {
    const [camera, setCamera] = useState({
        branch: null,
        camera_type: null,
        area_points: {
            "area1": [
                { "x": 12.51, "y": 47.67 },
                { "x": 87.29, "y": 48.55 },
                { "x": 87.95, "y": 99.00 },
                { "x": 13.00, "y": 99.59 }
            ],
            "area2": [
                { "x": 12.67, "y": 1.36 },
                { "x": 12.51, "y": 46.78 },
                { "x": 87.79, "y": 48.26 },
                { "x": 87.79, "y": 0.77 }
            ]
        }

    })
    const [lodingCamera, setLodingCamera] = useState(true)
    const [getCameraError, setGetCameraError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("");
    const [employee, setEmployee] = useState()
    const [loadingEmployee, setLoadingEmployee] = useState(true)
    const [errorEmployee, setErrorEmployee] = useState(null)
    const [branches, setBranches] = useState([]);


    const location = useLocation();
    const navigate = useNavigate();
    const CAMERA_TYPES = [
        { id: 1, title: "مراقبة", camera_type: "monitoring" },
        { id: 2, title: "احصائية الزوار", camera_type: "visitors" },
    ];


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
                    .put(`/employees/cameras/${cameraID}`, camera)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية التعديل بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/cameras/${cameraID}`, { replace: true })
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
    const addCamera = async () => {
        Swal.fire({
            title: "هل أنت متأكد من عملية اضافة الكاميرا",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "لا",
            confirmButtonColor: "#E76D3B",
            cancelButtonColor: "#3457D5",
            confirmButtonText: "نعم",
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPrivate
                    .post(`/branches/cameras`, camera)
                    .then(() => {
                        Swal.fire({
                            title: "تمت عملية الاضافة بنجاح",
                            icon: "success",
                        });
                        const basePath = location.pathname.split('/')[1]
                        navigate(`/${basePath}/cameras`, { replace: true })
                    })
                    .catch((error) => {
                        console.error(error, error.message);
                        Swal.fire({
                            title: "خطأ",
                            text: "حدث خطأ ما في الاضافة",
                            icon: "error",
                            confirmButtonColor: "#3457D5",
                            confirmButtonText: "حسناً",
                        });
                    });
            }
        });

    }
    // const handleEditButton = async () => {
    //     editCamera()
    // }
    const getCamera = async (link = `/employees/cameras`) => {
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
            setEmployee(employee);
            setLoadingEmployee(false)
        } catch (error) {
            setGetCameraError(error);
        } finally {
            setLodingCamera(false);

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
                console.log(camera);

                setCamera(prev => ({
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
    console.log(camera);
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
        // getCamera()
        getBranches("/branches")
    }, [])

    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="اضافة كاميرا:" />
            <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                {/* <SectionTitle text="تعديل قائمة المسميات الوظيفية:" /> */}


                <div className="relative w-full flex flex-col justify-center items-center">
                    <div className="relative w-full justify-start items-center">

                        <div className="flex flex-col items-end justify-end py-5">
                            <div className="relative py-5">
                                {/* <p className="relative text-center">{camera.name}</p> */}
                                <DropDownComponent
                                    data={branches}
                                    dataValue={"id"}
                                    dataTitle={"branchName"}
                                    ButtonText={"اختر الفرع"}
                                    label={"الفرع:"}
                                    value={camera.branch}
                                    onSelect={(value) => setCamera(prev => ({
                                        ...prev,
                                        branch: value
                                    }))}
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
                        </div>
                    </div>

                </div>

                <div className="flex items-center justify-end gap-4 w-full">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    <ButtonComponent variant={"create"} onClick={() => { addCamera() }} />
                    {/* <ButtonComponent variant={"edit"} onClick={() => { handleEditButton() }} /> */}
                </div>
            </section>
        </main>
    );
}

export default AddCamera;
