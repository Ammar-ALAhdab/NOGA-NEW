import ButtonComponent from "../../components/buttons/ButtonComponent";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import EmailInputComponent from "../../components/inputs/EmailInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useRef, useState } from "react";
import useSelectedImg from "../../hooks/useSelectedImg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import useLocationState from "../../hooks/useLocationState";
import useObjectReducer from "../../hooks/useObjectReducer";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { axiosPrivateEmployee } from "../../api/axios";
import useAuth from "../../auth/useAuth";

const dropDownData = [
  { id: 1, title: "ذكر", sex: true },
  { id: 2, title: "أنثى", sex: false },
];

function EmployeeDetails() {
  const handleClickBack = useGoToBack();
  const [employeeInfo] = useLocationState("employee");
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("" || undefined);
  const [jobsTypes, setJobsTypes] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  console.log(employeeInfo);
  const {
    state,
    national_number,
    first_name,
    middle_name,
    last_name,
    email,
    phone,
    address,
    salary,
    birth_date,
    gender,
    job_type,
    branch,
  } = useObjectReducer(employeeInfo, {
    id: (value) => value,
    national_number: (value) => value,
    first_name: (value) => value,
    middle_name: (value) => value,
    last_name: (value) => value,
    email: (value) => value,
    phone: (value) => value,
    address: (value) => value,
    salary: (value) => value,
    birth_date: (value) => value,
    gender: (value) => value,
    job_type: (value) => value,
    branch: (value) => value,
  });

  const { auth } = useAuth();

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

  const getJobsTypes = async (url) => {
    try {
      const response = await axiosPrivate.get(url);
      setJobsTypes((prev) => [...prev, ...response.data.results]);
      if (response.data.next) {
        getJobsTypes(response.data.next);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setBranchName(branches.find((b) => b.id == state.branch));
  }, [branches, state.branch]);

  const {
    selectedFile,
    selectedImage,
    delimgButtonFlag,
    handleImageChange,
    handleImageDelete,
    triggerFileInput,
  } = useSelectedImg(state.image);

  const deleteEmployee = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد من عملية الحذف؟",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/employees/${id}`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
            navigate(-1, { replace: true });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذا الموظف",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const updateEmployee = async (id) => {
    Swal.fire({
      title: "هل أنت متأكد من عملية تعديل البيانات؟",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        for (const key in state) {
          if (state[key] !== null) {
            formData.append(key, state[key]);
          }
        }
        formData.append("image", selectedFile);
        axiosPrivateEmployee
          .put(`employees/${id}`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          })
          .then(() => {
            Swal.fire({
              title: "تمت عملية التعديل بنجاح",
              icon: "success",
            });
            navigate(-1, { replace: true });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "خطأ في تعديل بيانات هذا الموظف",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  useEffect(() => {
    getBranches("/branches");
    getJobsTypes("/employees/job_types");
  }, []);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title
        text={`الموظف: ${employeeInfo.first_name} ${employeeInfo.middle_name} ${employeeInfo.last_name}`}
      />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <div className="w-full">
          <SectionTitle text={"المعلومات الشخصية:"} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-end justify-start gap-4">
              <div className="flex flex-col w-full items-center justify-center gap-4">
                <div className="w-fit relative z-10">
                  <img
                    src={selectedImage}
                    alt="profile"
                    width={125}
                    height={125}
                    className="rounded-[50%] border-4 border-primary"
                  />
                  {delimgButtonFlag && (
                    <button
                      className="absolute top-1 right-1 w-8 h-8 bg-halloweenOrange text-white z-100 rounded-full"
                      onClick={handleImageDelete}
                    >
                      <FontAwesomeIcon icon={faX} />
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="flex items-center justify-center w-full">
                  <ButtonComponent
                    textButton="إضافة صورة شخصية"
                    onClick={triggerFileInput}
                  />
                </div>
              </div>
              <TextInputComponent
                label={"عنوان الإقامة:"}
                id={"residence"}
                value={state.address}
                onChange={address}
              />
              <TextInputComponent
                label={"رقم الهاتف:"}
                id={"phone"}
                value={state.phone}
                onChange={phone}
                dir="ltr"
                placeholder="0912345678"
              />
              <EmailInputComponent
                label={"الإيميل:"}
                id={"email"}
                value={state.email}
                onChange={email}
              />
            </div>
            <div className="flex flex-col items-start justify-between gap-4">
              <TextInputComponent
                label={"الاسم:"}
                id={"firstName"}
                value={state.first_name}
                onChange={first_name}
              />
              <TextInputComponent
                label={"اسم الأب:"}
                id={"fatherName"}
                value={state.middle_name}
                onChange={middle_name}
              />
              <TextInputComponent
                label={"الكنية:"}
                id={"lastName"}
                value={state.last_name}
                onChange={last_name}
              />
              <TextInputComponent
                label={"الرقم الوطني:"}
                id={"nationalNumber"}
                value={state.national_number}
                onChange={national_number}
              />
              <DropDownComponent
                data={dropDownData}
                dataValue={"sex"}
                dataTitle={"title"}
                ButtonText={"اختر الجنس"}
                label={"الجنس:"}
                value={state.gender}
                onSelect={gender}
              />
              <DateInputComponent
                label={"تاريخ الميلاد:"}
                value={state.birth_date}
                onChange={birth_date}
              />
            </div>
          </div>
        </div>
        <div className="w-full">
          <SectionTitle text={"معلومات العمل:"} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center justify-start gap-4">
              <DropDownComponent
                data={jobsTypes}
                dataValue={"id"}
                dataTitle={"job_type"}
                ButtonText={employeeInfo.job_type_title}
                label={"المسمى الوظيفي:"}
                value={employeeInfo.job_type_title}
                onSelect={job_type}
              />
            </div>
            <div className="flex flex-col items-start justify-center gap-4">
              <DropDownComponent
                data={branches}
                dataValue={"id"}
                dataTitle={"branchName"}
                ButtonText={branchName?.branchName || "لا يوجد"}
                label={"فرع:"}
                value={state.branch}
                onSelect={branch}
              />
              <TextInputComponent
                label={"الراتب:"}
                id={"salary"}
                onChange={salary}
                value={state.salary}
                dir="ltr"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"delete"}
            onClick={() => deleteEmployee(state.id)}
          />
          <ButtonComponent
            variant={"edit"}
            textButton="حفظ التعديلات"
            onClick={() => updateEmployee(state.id)}
          />
        </div>
      </section>
    </main>
  );
}

export default EmployeeDetails;
