import { useState, useEffect } from "react";
import Title from "../../components/titles/Title";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useToast from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import PositionOnMapComponent from "../../components/inputs/PositionOnMapComponent";

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

function AddBranch() {
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [errorCities, setErrorCities] = useState(null);
  const [branchesManagers, setBranchesManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [errorManagers, setErrorManagers] = useState(null);
  const [branchInfo, setBranchInfo] = useState(initState);
  const axiosPrivate = useAxiosPrivate();
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const navigate = useNavigate();

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
      console.log(error);
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
      console.log(response);

      if (response.data.next) {
        getAvailableMangers(response.data.next);
      }
    } catch (error) {
      setErrorManagers(error);
    } finally {
      setLoadingManagers(false);
    }
  };

  useEffect(() => {
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
  console.log(branchInfo);

  const handleAddBranch = async () => {
    try {
      await axiosPrivate.post("/branches/", JSON.stringify(branchInfo));
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
      <Title text={"إضافة فرع:"} />
      <section className="relative w-full flex items-center justify-center flex-col gap-16 bg-white rounded-[30px] py-8 px-4 my-box-shadow">
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
          />

          <div className="relative w-full flex flex-col items-start justify-end py-5">
            <p className="relative text-end w-full py-5">:الموقع</p>
            <PositionOnMapComponent value={branchInfo.location.split(',').map(Number).every(item => typeof item === 'number' && isFinite(item)) ? branchInfo.location.split(',').map(Number).every(item => typeof item === 'number' && isFinite(item)) : [34.713016581849445, 36.70711612702235]} onChange={(value) => {
              console.log(value);

              setBranchInfo(prev => ({
                ...prev,
                location: value.join(',')
              }))
            }} />
          </div>
        </form>
        <div className="flex items-center justify-end gap-4 w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
          <ButtonComponent variant={"add"} onClick={handleAddBranch} />
        </div>
      </section>
    </main>
  );
}

export default AddBranch;
