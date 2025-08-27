import { useEffect, useState } from "react";
import ButtonComponent from "../buttons/ButtonComponent";
import TextInputComponent from "../inputs/TextInputComponent";
import PassInputComponent from "../inputs/PassInputComponent";
import Title from "../titles/Title";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import LoadingSpinner from "../actions/LoadingSpinner";
import NoDataError from "../actions/NoDataError";
import useSelectedImg from "../../hooks/useSelectedImg";

function SystemAccountsUsers({ userType }) {
  const [accountData, setAccountData] = useState(null);
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passConfirm, setPassConfirm] = useState("");
  const [passNotMatch, setPassNotMatch] = useState(true);
  const navigate = useNavigate();
  function handleClickBack() {
    navigate(-1);
  }
  function handlePass(p) {
    setPass(p);
  }
  function handlePassConfirm(pc) {
    setPassConfirm(pc);
  }
  useEffect(() => {
    if (pass.toString() != passConfirm.toString()) {
      setPassNotMatch(true);
    } else {
      setPassNotMatch(false);
    }
  }, [pass, passConfirm]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:3000/${userType}`);
        if (!response.ok) {
          throw new Error("!حدث خطأ في جلب البيانات");
        }
        const data = await response.json();
        setAccountData(data);
        setPass(data.password);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userType]);

  const {
    selectedImage,
    delimgButtonFlag,
    handleImageChange,
    handleImageDelete,
    triggerFileInput,
  } = useSelectedImg(accountData?.profilePhoto);
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={`${accountData?.role.toUpperCase()} Account:`} />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-8 w-full">
            <div className="flex flex-col w-full items-center justify-center gap-8">
              <img
                src={selectedImage}
                alt="profile"
                width={125}
                height={125}
                className="rounded-[50%] border-4 border-primary"
              />
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="flex items-center justify-center gap-4 w-full">
                <ButtonComponent
                  textButton="إضافة صورة شخصية"
                  onClick={triggerFileInput}
                />
                {delimgButtonFlag && (
                  <ButtonComponent
                    variant={"delete"}
                    onClick={handleImageDelete}
                  />
                )}
              </div>
            </div>
            <form className="flex flex-col items-center justify-center gap-4">
              <TextInputComponent
                id="fname"
                label={"الاسم:"}
                initValue={accountData?.fname}
              />
              <TextInputComponent
                id="lname"
                label={"الكنية:"}
                initValue={accountData?.lname}
              />
              <TextInputComponent
                id="username"
                label={"اسم المستخدم:"}
                initValue={accountData?.username}
              />
              <PassInputComponent
                id="pass"
                label={"كلمة المرور:"}
                initValue={accountData?.password}
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
            <div className="flex items-center justify-end gap-4 w-full">
              <ButtonComponent variant={"back"} onClick={handleClickBack} />
              <ButtonComponent
                variant={"edit"}
                textButton={"حفظ التعديلات"}
                type={"submit"}
              />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

SystemAccountsUsers.propTypes = {
  userType: PropTypes.string,
};

export default SystemAccountsUsers;
