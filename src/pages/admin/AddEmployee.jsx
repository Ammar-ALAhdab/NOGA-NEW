import ButtonComponent from "../../components/buttons/ButtonComponent";
import DateInputComponent from "../../components/inputs/DateInputComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import EmailInputComponent from "../../components/inputs/EmailInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useState } from "react";
import useSelectedImg from "../../hooks/useSelectedImg";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import useObjectReducer from "../../hooks/useObjectReducer";
import dayjs from "dayjs";
import useToast from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import noProfilePhoto from "../../assets/demo/no_profile_img.jpg";

const dropDownGenderData = [
  { id: 1, title: "ذكر", sex: true },
  { id: 2, title: "أنثى", sex: false },
];

const employeeInfo = {
  national_number: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  salary: "",
  address: "",
  date_of_employment: "",
  birth_date: null,
  gender: "false",
  job_type: null,
  branch: null,
  phone: "",
};

const employeesAccount = [
  "CEO",
  "HR",
  "Manager",
  "Warehouse Administrator",
  "Sales Officer",
];

const THE_JOB = "";

function AddEmployee({ userType }) {
  const [branches, setBranches] = useState([]);
  const [jobsTypes, setJobsTypes] = useState([]);
  const [goToAccountPage, setGoToAccountPage] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();
  const handleClickBack = useGoToBack();
  const navigate = useNavigate();

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
    date_of_employment,
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
    date_of_employment: (value) => value,
    gender: (value) => value,
    job_type: (value) => value,
    branch: (value) => value,
  });

  const getCurrentDate = () => {
    const currentDate = dayjs().format("YYYY-MM-DD");
    date_of_employment(currentDate);
  };

  const {
    selectedFile,
    setSelectedFile,
    selectedImage,
    delimgButtonFlag,
    handleImageChange,
    handleImageDelete,
    triggerFileInput,
  } = useSelectedImg(noProfilePhoto);

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

  const getJobsTypes = async (url = "/employees/job_types") => {
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

  const addEmployee = async () => {
    try {
      const formData = new FormData();

      // Add all form fields to FormData
      for (const key in state) {
        if (
          state[key] !== null &&
          state[key] !== undefined &&
          state[key] !== ""
        ) {
          formData.append(key, state[key]);
        }
      }

      // Add image if selected
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      console.log("State object:", state);

      // Use axiosPrivate with proper authorization and multipart content type
      const response = await axiosPrivate.post("employees/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Success response:", response.data);

      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });

      setTimeout(() => {
        goToAccountPage
          ? navigate(`/${userType}/manageEmployees/createAccount`, {
              state: { employee: { info: state, job: THE_JOB } },
            })
          : navigate(-1);
      }, 3000);
    } catch (error) {
      console.error("Error details:", error);
      console.error("Response data:", error?.response?.data);
      console.error("Response status:", error?.response?.status);

      if (error?.response?.status === 400) {
        const errorMassage = error?.response?.data;
        const arr = [];
        Object.entries(errorMassage).forEach(([fieldName, messages]) => {
          const errorMessage = fieldName + " " + messages.join(" ");
          arr.push(errorMessage);
        });
        Toast.fire({
          icon: "error",
          title: `${arr.join(" ")}`,
        });
      } else if (error?.response?.status === 403) {
        const errorMassage = error?.response?.data?.detail;
        Toast.fire({
          icon: "error",
          title: `${errorMassage}`,
        });
      } else if (error?.response?.status === 500) {
        Toast.fire({
          icon: "error",
          title: "خطأ في الخادم. يرجى المحاولة مرة أخرى",
        });
      } else {
        Toast.fire({
          icon: "error",
          title: "حدث خطأ غير متوقع",
        });
      }
    }
  };

  //for set default photo -------------
  const fetchDefaultImage = async () => {
    const defaultImageURL = noProfilePhoto;
    const response = await fetch(defaultImageURL);
    const blob = await response.blob();
    const file = new File([blob], "defaultImage.jpg", {
      type: "image/jpeg",
    });
    setSelectedFile(file);
  };
  // -----------------------------------

  useEffect(() => {
    getBranches("/branches");
    getJobsTypes();
    getCurrentDate();
    fetchDefaultImage();
  }, []);

  useEffect(() => {
    const THE_JOB = jobsTypes.find((j) => j.id == state.job_type);
    setGoToAccountPage(employeesAccount.includes(THE_JOB?.job_type));
  }, [jobsTypes, state.job_type]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إضافة موظف:"} />
      {/* <input type="file" onChange={handleFileChange} /> */}
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
                placeholder="0912345678"
                dir="ltr"
                value={state.phone}
                onChange={phone}
              />
              <EmailInputComponent
                label={"الإيميل:"}
                value={state.email}
                onChange={email}
                id={"email"}
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
                dir="ltr"
                value={state.national_number}
                onChange={national_number}
              />
              <DropDownComponent
                data={dropDownGenderData}
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
                ButtonText={"اختر المسمى"}
                label={"المسمى الوظيفي:"}
                value={state.job_type}
                onSelect={job_type}
              />
            </div>
            <div className="flex flex-col items-start justify-center gap-4">
              <DropDownComponent
                data={branches}
                dataValue={"id"}
                dataTitle={"branchName"}
                ButtonText={"اختر الفرع"}
                label={"الفرع:"}
                value={state.branch}
                onSelect={branch}
              />
              <TextInputComponent
                label={"الراتب:"}
                id={"salary"}
                dir="ltr"
                value={state.salary}
                onChange={salary}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent variant={"add"} onClick={addEmployee} />
        </div>
      </section>
    </main>
  );
}

AddEmployee.propTypes = {
  userType: PropTypes.string,
};

export default AddEmployee;
