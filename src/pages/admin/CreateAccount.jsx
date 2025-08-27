import { useEffect, useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import PassInputComponent from "../../components/inputs/PassInputComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import useGoToBack from "../../hooks/useGoToBack";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useToast from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function CreateAccount({ userType }) {
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [passNotMatch, setPassNotMatch] = useState(true);
  const [employeeData, setEmployeeData] = useState({});
  const employeeInfo = useLocationState("employee");
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();
  const navigate = useNavigate();

  const handleClickBack = useGoToBack();

  const handleUsername = (u) => {
    setUsername(u);
  };

  const handlePass = (p) => {
    setPass(p);
  };

  const handlePassConfirm = (pc) => {
    setPassConfirm(pc);
  };

  useEffect(() => {
    if (pass.toString() != passConfirm.toString()) {
      setPassNotMatch(true);
    } else {
      setPassNotMatch(false);
    }
  }, [pass, passConfirm]);

  useEffect(() => {
    const getEmployeeID = async (national_number) => {
      try {
        const response = await axiosPrivate.get(
          `/employees?national_number=${Number(national_number)}`
        );
        console.log(response);
        setEmployeeData(response?.data?.results[0]);
      } catch (error) {
        console.error(error);
      }
    };
    getEmployeeID(employeeInfo.info.national_number);
  }, []);

  const createAccount = async () => {
    try {
      await axiosPrivate.post(
        "/employees/register",
        JSON.stringify({
          username: username,
          password: pass,
          confirm_password: passConfirm,
          employee: employeeData.id,
        })
      );
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإنشاء بنجاح",
      });
      setTimeout(() => {
        navigate(`/${userType}/manageEmployees`);
      }, 3000);
    } catch (error) {
      console.log(error);
      console.log(employeeData);
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
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title
        text={`إنشاء حساب ${employeeData?.job_type_title} للموظف: ${employeeInfo.info.first_name} ${employeeInfo.info.last_name}`}
      />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <form className="flex flex-col items-center justify-center gap-4">
            <TextInputComponent
              id="username"
              label={"اسم المستخدم:"}
              initValue={username}
              onChange={handleUsername}
            />
            <PassInputComponent
              id="pass"
              label={"كلمة المرور:"}
              initValue={pass}
              onChange={handlePass}
              flag={passNotMatch}
            />
            <PassInputComponent
              id="passConfirm"
              label={"تأكيد كلمة المرور:"}
              onChange={handlePassConfirm}
              flag={passNotMatch}
            />
          </form>
          <div className="flex items-center justify-end gap-4  w-full">
            <ButtonComponent variant={"back"} onClick={handleClickBack} />
            <ButtonComponent variant={"add"} onClick={createAccount} />
          </div>
        </div>
      </section>
    </main>
  );
}

CreateAccount.propTypes = {
  userType: PropTypes.string,
};

export default CreateAccount;
