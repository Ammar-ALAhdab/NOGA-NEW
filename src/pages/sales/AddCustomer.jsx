import { useReducer } from "react";
import Title from "../../components/titles/Title";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useToast from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import SectionTitle from "../../components/titles/SectionTitle";

const dropDownGenderData = [
  { id: 1, title: "ذكر", sex: true },
  { id: 2, title: "أنثى", sex: false },
];

const initialState = {
  national_number: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  phone: "",
  gender: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_UPDATE":
      return {
        ...state,
        [action.payload.id]: action.payload.value,
      };
    default:
      return state;
  }
};

function AddCustomer() {
  const [customerInfo, dispatch] = useReducer(reducer, initialState);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    dispatch({ type: `SET_UPDATE`, payload: { id, value } });
  };

  const handleChangeGender = (e) => {
    const { id, value } = e;
    dispatch({ type: `SET_UPDATE`, payload: { id, value } });
  };

  const handleAddCustomer = async () => {
    try {
      await axiosPrivate.post("/customers", JSON.stringify(customerInfo));
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      console.log(error);
      if (error.response.status == 400) {
        Toast.fire({
          icon: "error",
          title: "عذراً، لايمكنك ترك الحقول فارغة",
        });
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إنشاء سجل زبون:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] pb-8 px-4 my-box-shadow">
        <SectionTitle text={"المعلومات الشخصية:"} />
        <div className="grid lg:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col items-end justify-start gap-4">
            <TextInputComponent
              id={"national_number"}
              label={"الرقم الوطني:"}
              onChangeEvent={handleChange}
              value={customerInfo.national_number}
            />
            <TextInputComponent
              id={"phone"}
              label={"رقم الهاتف:"}
              placeholder="0912345678"
              dir="ltr"
              value={customerInfo.phone}
              onChangeEvent={handleChange}
            />
            <DropDownComponent
              data={dropDownGenderData}
              dataValue={"sex"}
              dataTitle={"title"}
              ButtonText={"اختر الجنس"}
              label={"الجنس:"}
              value={customerInfo.gender}
              id={"gender"}
              onSelectEvent={handleChangeGender}
            />
          </div>
          <div className="flex flex-col items-end justify-start gap-4">
            <TextInputComponent
              id={"first_name"}
              label={"الاسم:"}
              onChangeEvent={handleChange}
              value={customerInfo.first_name}
            />
            <TextInputComponent
              id={"middle_name"}
              label={"اسم الأب:"}
              onChangeEvent={handleChange}
              value={customerInfo.middle_name}
            />
            <TextInputComponent
              id={"last_name"}
              label={"الكنية:"}
              onChangeEvent={handleChange}
              value={customerInfo.last_name}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent variant={"add"} onClick={handleAddCustomer} />
        </div>
      </section>
    </main>
  );
}

export default AddCustomer;
