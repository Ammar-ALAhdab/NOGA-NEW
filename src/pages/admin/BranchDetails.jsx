import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import TextShowBlue from "../../components/inputs/TextShowBlue";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function BranchDetails() {
  const branchInfo = useLocationState("branch");
  const handleClickBack = useGoToBack();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const handleDeleteBranch = async () => {
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
          .delete(`/branches/${branchInfo.id}`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
            navigate(-2, { replace: true });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذا الفرع",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  if (!branchInfo) {
    return <div>No branchInfo data available.</div>;
  }
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title
        text={`شركة نوجا تيك فرع: ${branchInfo?.city_name} ${branchInfo?.number}`}
      />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <div className="flex flex-col items-center justify-center gap-4">
          <TextShowBlue label={"مدينة:"} value={branchInfo.city_name} />
          <TextInputComponent
            label={"منطقة:"}
            value={branchInfo.area}
            disabled={true}
          />
          <TextInputComponent
            label={"شارع:"}
            value={branchInfo.street}
            disabled={true}
          />
          <TextShowBlue label={"المدير:"} value={branchInfo.manager_name} />
        </div>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"delete"}
            textButton={"حذف الفرع"}
            onClick={handleDeleteBranch}
          />
        </div>
      </section>
    </main>
  );
}

export default BranchDetails;
