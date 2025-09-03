import { useEffect, useRef, useState } from "react";
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
import CameraCapture from "../../../components/inputs/CameraCapture";
import TextInputComponent from "../../../components/inputs/TextInputComponent";
import SearchComponent from "../../../components/inputs/SearchComponent";
import useToast from "../../../hooks/useToast";
import Swal from "sweetalert2";


function SignInOut() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [anotherWay, setAnotherWay] = useState(false)
    const [searchQuery, setSearchQuery] = useState("");
    const [employee, setEmployee] = useState()
    const [loadingEmployee, setLoadingEmployee] = useState(true)
    const [errorEmployee, setErrorEmployee] = useState(null)
    const navigate = useNavigate();
    const Toast = useToast()
    const streamRef = useRef(null);

    useEffect(() => {
      if (!anotherWay) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            streamRef.current = stream;  // حفظ التدفق في مرجع مستقل
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.error("Error accessing camera: ", err);
          });
      } else {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, [anotherWay]);
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
    const signEmployee = async (type) => {
        console.log(type);
        console.log("test");
        try {
            const formData = new FormData();


            // Add image if selected
            if (capturedImage && !anotherWay) {
                formData.append("image", capturedImage);
            } else if (employee?.id && anotherWay) {
                formData.append("employee", employee.id);
            }
            else {

            }
            console.log("FormData contents:");
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Use axiosPrivate with proper authorization and multipart content type
            const response = await axiosPrivate.post(`employees/attendance/${type}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Success response:", response.data);

            Swal.fire({
                icon: "success",
                title: type == "check_in" ? `تمت عملية التسجيل بنجاح اهلا و سهلا بك \n${response.data.employee}` : `تمت عملية التسجيل بنجاح وداعاً \n${response.data.employee}`,

            });

            navigate(-1)
        } catch (error) {
            console.log(error?.response?.data);

            Toast.fire({
                icon: "error",
                title: error?.response?.data?.error == "unknown_person" ? "شخص غير معروف" : error?.response?.data?.error == "no_persons_found" ? "لم يتم العثور على شخص في الصورة" : error?.response?.data?.error,
            });
        }
    };
    const handleSearchClick = () => {
        getEmployee(`/employees?search=${searchQuery}`);
    };
    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // الحصول على بيانات الصورة كـ Blob (ملف خام)
            canvas.toBlob((blob) => {
                if (blob) {
                    // إنشاء ملف من blob مع اسم و نوع MIME
                    const file = new File([blob], 'photo.png', { type: 'image/png' });

                    // يمكنك استخدام الملف هنا، مثلاً تخزينه في الستيت أو رفعه للسيرفر
                    // مثال: تخزينه في الستيت
                    setCapturedImage(file);
                }
            }, 'image/png');
        }
    };



    return (
        <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
            <Title text="الحضور :" />
            <section className="flex items-center justify-center flex-col  w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
                <SectionTitle text="تسجيل الحضور" />
                {
                    !anotherWay ?
                        <>
                            <video hidden={capturedImage} ref={videoRef} autoPlay playsInline className='relative w-1/2 rounded-xl' />
                            {capturedImage &&
                                <img src={capturedImage ? URL.createObjectURL(capturedImage) : null} alt="Captured" className='relative w-1/2 rounded-xl' />
                            }
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            <div className='relative w-full flex justify-center items-center p-5'>
                                {
                                    capturedImage ?
                                        <div className="relative w-1/2 flex justify-between items-center ">
                                            <ButtonComponent onClick={() => signEmployee("check_out")} variant={'sign_out'} textButton='تسجيل خروج' />
                                            <ButtonComponent onClick={() => setCapturedImage(null)} variant={'reject'} textButton='الغاء' />
                                            <ButtonComponent onClick={() => signEmployee("check_in")} variant={'sign_in'} textButton='تسجيل دخول' />
                                        </div>
                                        :
                                        <ButtonComponent onClick={capturePhoto} textButton='التقاط الصورة' />
                                }
                            </div>
                        </>
                        :
                        <>
                            <div className="flex items-start justify-end py-5">
                                {/* <p className="relative text-center">{vecation.name}</p> */}
                                <SearchComponent
                                    onChange={setSearchQuery}
                                    value={searchQuery}
                                    onClickSearch={handleSearchClick}
                                />
                            </div>
                            {

                                !loadingEmployee ? (
                                    errorEmployee ? (

                                        <div className="flex items-center justify-center gap-4">
                                            <p className="font-bold">
                                                لا يوجد سجل للموظف المطلوب
                                            </p>
                                        </div>
                                    ) : (
                                        <>
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
                                            <div className="relative w-1/2 flex justify-between items-center py-10">
                                                <ButtonComponent onClick={() => { signEmployee("check_out") }} variant={'sign_out'} textButton='تسجيل خروج' />
                                                <ButtonComponent onClick={() => signEmployee("check_in")} variant={'sign_in'} textButton='تسجيل دخول' />
                                            </div>
                                        </>
                                    )
                                ) : null
                            }
                        </>
                }
                <div className="flex items-center justify-between gap-4 w-full pt-5">
                    <ButtonComponent variant={"back"} onClick={() => navigate(-1)} />
                    {/* <ButtonComponent variant={"delete"} onClick={() => { deleteWorkSchedule() }} /> */}
                    <ButtonComponent variant={"edit"} textButton="تسجيل دخول بطريقة ثانية" onClick={() => { setAnotherWay(prev => !prev) }} />
                </div>
                <p></p>
            </section>
        </main>
    );
}

export default SignInOut;
