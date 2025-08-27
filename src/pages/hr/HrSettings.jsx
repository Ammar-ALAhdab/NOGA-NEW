import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import DataTable from "../../components/table/DataTable";
import TablePagination from "../../components/table/TablePagination";
import SectionTitle from "../../components/titles/SectionTitle";
import Title from "../../components/titles/Title";
import useToast from "../../hooks/useToast";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";

function HrSettings() {
  const [addedJobType, setAddedJobType] = useState("");
  const [loadingJobsTypes, setLoadingJobsTypes] = useState(true);
  const [getJobsTypesError, setGetJobsTypesError] = useState(null);
  const [jobsTypes, setJobsTypes] = useState([]);
  const [jobsTypesPaginationSettings, setJobsTypesPaginationSettings] =
    useState(null);
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const axiosPrivate = useAxiosPrivate();
  const handleChangePageJobsTypes = (event, value) => {
    getJobsTypes(`/employees/job_types?page=${value}`);
  };

  useEffect(() => {
    getJobsTypes();
  }, []);

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
        Toast.fire({
          icon: "error",
          title: "لا يمكن إدخال مسمى وظيفي موجود مسبقاً",
        });
      }
    }
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
      <Title text="الإعدادات:" />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <SectionTitle text="تعديل قائمة المسميات الوظيفية:" />
        <div className="flex items-center justify-end w-full gap-4 lg:gap-8">
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
      </section>
    </main>
  );
}

export default HrSettings;
