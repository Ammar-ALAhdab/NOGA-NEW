import { useEffect, useReducer, useState, useCallback } from "react";
import Title from "../../components/titles/Title";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate, useParams } from "react-router-dom";
import SectionTitle from "../../components/titles/SectionTitle";
import Swal from "sweetalert2";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";

const dropDownGenderData = [
  { id: 1, title: "ذكر", sex: true },
  { id: 2, title: "أنثى", sex: false },
];

const initialState = {
  national_number: "",
  first_name: "",
  last_name: "",
  phone_number: "",
  gender: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_INITIAL_DETAILS":
      return { ...action.payload };
    case "SET_UPDATE":
      return {
        ...state,
        [action.payload.id]: action.payload.value,
      };
    default:
      return state;
  }
};

function CustomerDetails() {
  const [customerInfo, dispatch] = useReducer(reducer, initialState);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { CustomerID } = useParams();

  const handleChange = (e) => {
    const { id, value } = e.target;
    dispatch({ type: `SET_UPDATE`, payload: { id, value } });
  };

  const handleChangeGender = (e) => {
    const { id, value } = e;
    dispatch({ type: `SET_UPDATE`, payload: { id, value } });
  };

  const getCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(`/sales/customers/${CustomerID}`);
      console.log("Customer details response:", response.data);
      dispatch({ type: `SET_INITIAL_DETAILS`, payload: response.data });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate, CustomerID]);

  const updateCustomer = async () => {
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
        // Transform the data to match API expectations
        const apiData = {
          national_number: customerInfo.national_number,
          first_name: customerInfo.first_name,
          last_name: customerInfo.last_name,
          phone_number: customerInfo.phone_number,
          gender: customerInfo.gender,
        };

        console.log("Sending update data to API:", apiData);
        axiosPrivate
          .put(`/sales/customers/${CustomerID}`, JSON.stringify(apiData))
          .then(() => {
            Swal.fire({
              title: "تمت عملية التعديل بنجاح",
              icon: "success",
            });
            navigate(-1, { replace: true });
          })
          .catch((error) => {
            console.error("Error updating customer:", error);
            Swal.fire({
              title: "خطأ",
              text: "خطأ في تعديل بيانات هذا العميل",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const deleteCustomer = async () => {
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
          .delete(`/sales/customers/${CustomerID}`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
            navigate(-1, { replace: true });
          })
          .catch((error) => {
            console.error("Error deleting customer:", error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذا العميل",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  useEffect(() => {
    if (CustomerID) {
      getCustomerDetails();
    }
  }, [CustomerID, getCustomerDetails]);

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4">
        <LoadingSpinner />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4">
        <NoDataError error={error} />
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"تفاصيل العميل:"} />
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
              id={"phone_number"}
              label={"رقم الهاتف:"}
              placeholder="0912345678"
              dir="ltr"
              value={customerInfo.phone_number}
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
              id={"last_name"}
              label={"الكنية:"}
              onChangeEvent={handleChange}
              value={customerInfo.last_name}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent variant={"delete"} onClick={deleteCustomer} />
          <ButtonComponent variant={"edit"} onClick={updateCustomer} />
        </div>
      </section>
    </main>
  );
}

export default CustomerDetails;
