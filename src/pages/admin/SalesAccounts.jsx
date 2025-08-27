import { useEffect, useState } from "react";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DataTable from "../../components/table/DataTable";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import Title from "../../components/titles/Title";
import { useNavigate } from "react-router-dom";
import useLocationState from "../../hooks/useLocationState";
import useGoToBack from "../../hooks/useGoToBack";

function SalesAccounts() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const branchData = useLocationState();
  const navigateToSalesByID = useNavigate();
  const handleClickBack = useGoToBack();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://localhost:3000/salesAccounts");
        if (!response.ok) {
          throw new Error("!حدث خطأ في جلب البيانات");
        }
        const json = await response.json();
        setData(json);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchSalesById = async (salesId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/salesAccounts/${salesId}`
      );
      if (!response.ok) {
        new Error("Server responded with status:", response.status);
      } else {
        const salesData = await response.json();
        navigateToSalesByID(`${salesId}`, {
          state: { branch: branchData, salesAccount: salesData },
        });
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  const handleClickFetchSalesById = (salesId) => {
    fetchSalesById(salesId);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "profilePhoto",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <img
              src={params.row.profilePhoto}
              alt="profile"
              width={60}
              height={60}
              className="rounded-[50%] border-2 border-primary"
            />
          </div>
        );
      },
    },
    {
      field: "fullName",
      headerName: "الاسم",
      flex: 1,
    },
    {
      field: "username",
      headerName: "اسم المستخدم",
      flex: 1,
    },
    {
      field: "options",
      headerName: "خيارات",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center gap-2 h-full">
            <ButtonComponent
              variant={"show"}
              small={true}
              onClick={() => handleClickFetchSalesById(params.id)}
            />
            <ButtonComponent
              variant={"delete"}
              small={true}
              onClick={() => {}}
            />
          </div>
        );
      },
    },
  ];
  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title
        text={` إدارة حسابات موظفين المبيعات - شركة نوجا تيك: فرع ${branchData?.city} ${branchData?.branchNumber}`}
      />
      <section className="flex flex-col items-center justify-center gap-8 w-full bg-white rounded-[30px] p-4 my-box-shadow">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <DataTable columns={columns} rows={data} />
        )}
        <div className="flex items-center justify-end w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
        </div>
      </section>
    </main>
  );
}

export default SalesAccounts;
