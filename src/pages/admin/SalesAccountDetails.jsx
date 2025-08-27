import { useEffect, useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import PassInputComponent from "../../components/inputs/PassInputComponent";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import useGoToBack from "../../hooks/useGoToBack";
import useSelectedImg from "../../hooks/useSelectedImg";

function SalesAccountDetails() {
  const { salesAccount } = location.state || {};
  const branchInfo = useLocationState("branch");
  const [pass, setPass] = useState(salesAccount.password);
  const [passConfirm, setPassConfirm] = useState("");
  const [passNotMatch, setPassNotMatch] = useState(true);
  const handleClickBack = useGoToBack();
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

  const {
    selectedImage,
    delimgButtonFlag,
    handleImageChange,
    handleImageDelete,
    triggerFileInput,
  } = useSelectedImg(salesAccount?.profilePhoto);
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title
        text={`حساب موظف المبيعات: ${salesAccount?.fullName} - شركة نوجا تيك فرع ${branchInfo?.city} ${branchInfo?.branchNumber}`}
      />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
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
              id="username"
              label={"اسم المستخدم:"}
              initValue={salesAccount?.username}
            />
            <PassInputComponent
              id="pass"
              label={"كلمة المرور:"}
              initValue={salesAccount?.password}
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
            <ButtonComponent
              variant={"edit"}
              textButton={"حفظ التعديلات"}
              type={"submit"}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default SalesAccountDetails;
