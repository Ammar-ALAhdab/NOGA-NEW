import Title from "../../components/titles/Title";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import useGoToBack from "../../hooks/useGoToBack";
import SectionTitle from "../../components/titles/SectionTitle";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import DataTable from "../../components/table/DataTable";
import useToast from "../../hooks/useToast";
import Swal from "sweetalert2";
import TablePagination from "../../components/table/TablePagination";

function SystemSettings() {
  const [loadingCities, setLoadingCities] = useState(true);
  const [getCitiesError, setGetCitiesError] = useState(null);
  const [cities, setCities] = useState([]);
  const [addedCity, setAddedCity] = useState("");
  const [cityPaginationSettings, setCityPaginationSettings] = useState(null);
  const [loadingJobsTypes, setLoadingJobsTypes] = useState(true);
  const [getJobsTypesError, setGetJobsTypesError] = useState(null);
  const [jobsTypes, setJobsTypes] = useState([]);
  const [addedJobType, setAddedJobType] = useState("");
  const [jobsTypesPaginationSettings, setJobsTypesPaginationSettings] =
    useState(null);
  const handleClickBack = useGoToBack();
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();
  const handleChangePageCities = (event, value) => {
    getCities(`/branches/cities?page=${value}`);
  };

  const handleChangePageJobsTypes = (event, value) => {
    getJobsTypes(`/employees/job_types?page=${value}`);
  };

  useEffect(() => {
    getCities();
    getJobsTypes();
  }, []);

  const getCities = async (link = "/branches/cities") => {
    try {
      setLoadingCities(true);
      setGetCitiesError(null);
      const response = await axiosPrivate.get(link);
      setCities(response.data.results);
      setCityPaginationSettings({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.log(error);
      setGetCitiesError(error);
    } finally {
      setLoadingCities(false);
    }
  };

  const getJobsTypes = async (link = "/employees/job_types") => {
    try {
      setLoadingJobsTypes(true);
      setGetJobsTypesError(null);
      const response = await axiosPrivate.get(link);
      setJobsTypes(response.data.results);
      setJobsTypesPaginationSettings({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (error) {
      console.log(error);
      setGetJobsTypesError(error);
    } finally {
      setLoadingJobsTypes(false);
    }
  };

  const deleteCity = async (id) => {
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
          .delete(`/branches/cities/${id}`)
          .then(() => {
            getCities();
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذه المدينة",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const deleteJobType = async (id) => {
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
          .delete(`/employees/job_types/${id}`)
          .then(() => {
            getJobsTypes();
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "لايمكن حذف هذه المسمى الوظيفي",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const addCity = async (addedCity) => {
    try {
      await axiosPrivate.post(
        `/branches/cities`,
        JSON.stringify({ city_name: addedCity })
      );
      getCities();
      setAddedCity("");
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
    } catch (error) {
      console.log(error);
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
      if (error?.response?.status === 403) {
        const errorMassage = error?.response?.data?.detail;
        Toast.fire({
          icon: "error",
          title: `${errorMassage}`,
        });
      }
    }
  };

  const addJob = async (addedJob) => {
    try {
      await axiosPrivate.post(
        `/employees/job_types`,
        JSON.stringify({ job_type: addedJob })
      );
      getJobsTypes();
      setAddedJobType("");
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
    } catch (error) {
      console.log(error);
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
      if (error?.response?.status === 403) {
        const errorMassage = error?.response?.data?.detail;
        Toast.fire({
          icon: "error",
          title: `${errorMassage}`,
        });
      }
    }
  };

  const CitiesColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "city_name",
      headerName: "المدينة",
      flex: 1,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (
          <ButtonComponent
            variant={"delete"}
            small={true}
            onClick={() => deleteCity(params.id)}
          />
        );
      },
    },
  ];

  const jobsTypesColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "job_type",
      headerName: "المسمى الوظيفي",
      flex: 1,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (
          <ButtonComponent
            variant={"delete"}
            small={true}
            onClick={() => deleteJobType(params.id)}
          />
        );
      },
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
      <Title text="إعدادات النظام:" />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <SectionTitle text="تعديل قائمة المدن:" />
          <div className="flex items-center justify-end w-full gap-8">
            <ButtonComponent
              variant={"add"}
              onClick={() => addCity(addedCity)}
            />
            <div className="w-[500px]">
              <TextInputComponent
                id="brandName"
                label={"إضافة مدينة:"}
                onChange={setAddedCity}
                value={addedCity}
              />
            </div>
          </div>
          {loadingCities ? (
            <div className="flex justify-center items-center h-[400px]">
              <LoadingSpinner w="64px" h="64px" />
            </div>
          ) : getCitiesError ? (
            <NoDataError error={getCitiesError} />
          ) : (
            <DataTable columns={CitiesColumns} rows={cities} />
          )}
          <TablePagination
            count={cityPaginationSettings?.count}
            handleChangePage={handleChangePageCities}
            rowsName={"المدن"}
          />
          <SectionTitle text="تعديل قائمة المسميات الوظيفية:" />
          <div className="flex items-center justify-end w-full gap-8">
            <ButtonComponent
              variant={"add"}
              onClick={() => addJob(addedJobType)}
            />
            <div className="w-[500px]">
              <TextInputComponent
                id="brandName"
                label={"إضافة مسمى وظيفي:"}
                onChange={setAddedJobType}
                value={addedJobType}
              />
            </div>
          </div>
          {loadingJobsTypes ? (
            <div className="flex justify-center items-center h-[400px]">
              <LoadingSpinner w="64px" h="64px" />
            </div>
          ) : getJobsTypesError ? (
            <NoDataError error={getJobsTypesError} />
          ) : (
            <DataTable columns={jobsTypesColumns} rows={jobsTypes} />
          )}
          <TablePagination
            count={jobsTypesPaginationSettings?.count}
            handleChangePage={handleChangePageJobsTypes}
            rowsName={"المسميات الوظيفية"}
          />

          <div className="flex items-center justify-end w-full">
            <ButtonComponent variant={"back"} onClick={handleClickBack} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default SystemSettings;
