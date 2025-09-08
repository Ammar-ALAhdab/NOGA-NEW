import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import TextShowBlue from "../../components/inputs/TextShowBlue";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import PositionOnMapComponent from "../../components/inputs/PositionOnMapComponent";
import { useEffect, useState } from "react";
import useToast from "../../hooks/useToast";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import DropDownComponent from "../../components/inputs/DropDownComponent";
const initState = {
  city: "",
  area: "",
  street: "",
  manager: "",
  location: "34.713016581849445,36.70711612702235",
};

const formatAvailableMangers = (data) => {
  const availableMangersArray = data.map((manger) => ({
    id: manger.id,
    name: `${manger.first_name} ${manger.middle_name} ${manger.last_name}`,
  }));
  return availableMangersArray;
};

function BranchDetails() {
  const handleClickBack = useGoToBack();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [errorCities, setErrorCities] = useState(null);
  const [branchesManagers, setBranchesManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [errorManagers, setErrorManagers] = useState(null);
  const [branchInfo, setBranchInfo] = useState(initState);
  const [loadingBranchInfo, setLoadingBranchInfo] = useState(initState);
  const [errorBranchInfo, setErrorBranchInfo] = useState(initState);
  const Toast = useToast();
  const { BranchId } = useParams()
  const handleGetBranchById = async (BranchId) => {
    try {

      setErrorBranchInfo(null)
      setLoadingBranchInfo(true)
      const response = await axiosPrivate.get(`/branches/${BranchId}`);
      console.log(response);
      
      const branchData = response?.data;
      setBranchInfo(branchData)
      setBranchesManagers([{id :response.data.manager,name : response.data.manager_name}])
      setLoadingBranchInfo(false)
    } catch (error) {
      setErrorBranchInfo(error)
      setLoadingBranchInfo(false)
      console.error(error);
    }
  };
  const getCities = async (link) => {
    try {
      setLoadingCities(true);
      setErrorCities(null);
      const response = await axiosPrivate.get(link);
      setCities((prev) => [...prev, ...response.data.results]);
      if (response.data.next) {
        getCities(response.data.next);
      }
    } catch (error) {
      setErrorCities(error);
    } finally {
      setLoadingCities(false);
    }
  };

  const getAvailableMangers = async (link) => {
    try {
      setLoadingManagers(true);
      setErrorManagers(null);
      const response = await axiosPrivate.get(link);
      const availableMangers = formatAvailableMangers(response.data.results);
      setBranchesManagers((prevData) => [...prevData, ...availableMangers]);

      if (response.data.next) {
        getAvailableMangers(response.data.next);
      }
    } catch (error) {
      setErrorManagers(error);
    } finally {
      setLoadingManagers(false);
    }
  };
console.log(branchesManagers);

  useEffect(() => {
    handleGetBranchById(BranchId)
    getCities("/branches/cities");
    getAvailableMangers("/employees/available_managers");
  }, []);

  const handleCityChange = (cityId) => {
    setBranchInfo((prevBranchInfo) => ({
      ...prevBranchInfo,
      city: cityId,
    }));
  };
  const handleAreaChange = (area) => {
    setBranchInfo((prevBranchInfo) => ({ ...prevBranchInfo, area: area }));
  };
  const handleStreetChange = (street) => {
    setBranchInfo((prevBranchInfo) => ({ ...prevBranchInfo, street: street }));
  };
  const handleManagerChange = (managerID) => {
    setBranchInfo((prevBranchInfo) => ({
      ...prevBranchInfo,
      manager: managerID,
    }));
  };

  const handleEditBranch = async () => {
    try {
      await axiosPrivate.put(`/branches/${BranchId}`, JSON.stringify(branchInfo));
      Toast.fire({
        icon: "success",
        title: "تمت عملية التعديل بنجاح",
      });
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error) {
      if (error.response.status == 400) {
        Toast.fire({
          icon: "error",
          title: "عذراً، لايمكنك ترك الحقول فارغة",
        });
      }
    }
  };


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
  console.log(branchInfo.location.split(',').map(Number).every(item => typeof item === 'number' && isFinite(item)) ? branchInfo.location.split(',').map(Number) : "wrong");

  if (!branchInfo) {
    return <div>No branchInfo data available.</div>;
  }
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title
        text={`شركة نوجا تيك فرع: ${branchInfo?.city_name} ${branchInfo?.number}`}
      />
      <section className="relative w-full flex items-center justify-center flex-col gap-16 bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {
          loadingBranchInfo ?
            <div className="flex items-center justify-center w-full h-[400px]">
              <LoadingSpinner w="64px" h="64px" />
            </div>
            :
            errorBranchInfo ? (
              <NoDataError error={errorBranchInfo} />
            ) :
            <form className="relative w-full flex flex-col items-center justify-center gap-4">

            <DropDownComponent
              data={cities}
              dataValue={"id"}
              dataTitle={"city_name"}
              ButtonText={"اختر المدينة"}
              label={"مدينة:"}
              onSelect={handleCityChange}
              loading={loadingCities}
              error={errorCities}
              value={branchInfo.city}
            />
            <TextInputComponent
              label={"منطقة:"}
              onChange={handleAreaChange}
              value={branchInfo.area}
            />
            <TextInputComponent
              label={"شارع:"}
              onChange={handleStreetChange}
              value={branchInfo.street}
            />
            <DropDownComponent
              data={branchesManagers}
              dataValue={"id"}
              dataTitle={"name"}
              ButtonText={"اختر المدير"}
              label={"مدير الفرع:"}
              onSelect={handleManagerChange}
              loading={loadingManagers}
              error={errorManagers}
              value={branchInfo.manager}
              
            />
  
            <div className="relative w-full flex flex-col items-start justify-end py-5">
              <p className="relative text-end w-full py-5">:الموقع</p>
              <PositionOnMapComponent value={branchInfo.location.split(',').map(Number).every(item => typeof item === 'number' && isFinite(item)) ? branchInfo.location : [34.713016581849445, 36.70711612702235]} onChange={(value) => {
                console.log(value);
  
                setBranchInfo(prev => ({
                  ...prev,
                  location: value
                }))
              }} />
            </div>
          </form>
        }
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent
            variant={"delete"}
            textButton={"حذف الفرع"}
            onClick={handleDeleteBranch}
          />
          <ButtonComponent
            variant={"edit"}
            onClick={handleEditBranch}
          />
        </div>
      </section>
    </main>
  );
}

export default BranchDetails;
