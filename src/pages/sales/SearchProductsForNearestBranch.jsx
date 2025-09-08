import { useEffect, useState } from "react";
import Title from "../../components/titles/Title";
import ProductsTable from "../../components/table/ProductsTable";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import NearestBranchProductsTable from "../../components/table/NearestBranchProductsTable";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import NumberInputComponent from "../../components/inputs/NumberInputComponent";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import PositionOnMapComponent from "../../components/inputs/PositionOnMapComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import TextShowBlue from "../../components/inputs/TextShowBlue";
import PositionOnMapComponentNearestBranch from "../../components/inputs/PositionOnMapComponentNearestBranch";

function SearchProductsForNearestBranch() {
  const [branches, setBranches] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null)
  const [selectedCurrentBranch, setSelectedCurrentBranch] = useState()
  const [rowSelectionID, setRowSelectionID] = useState([]);
  const [nearestBranch, setNearestBranch] = useState()
  const [loadingNearrestBranch, setLoadingNearestBranch] = useState()
  const [errorNearrestBranch, setErrorNearestBranch] = useState()
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const getNearestBranch = async (url) => {
    try {
      setLoadingNearestBranch(true)
      setNearestBranch(null);
      setErrorNearestBranch(null)
      const response = await axiosPrivate.get(url);
      console.log(response.data);

      setNearestBranch(response.data);
      setLoadingNearestBranch(false)
      setErrorNearestBranch(null)

    } catch (error) {
      setLoadingNearestBranch(false)
      setErrorNearestBranch(error)
      setNearestBranch(null);
      console.error(error);
    }
  }
  useEffect(() => {
    if (product && quantity && selectedCurrentBranch) {
      getNearestBranch(`/branches/find_nearest_branch?current_branch=${selectedCurrentBranch}&product=${product}&quantity=${quantity}`)
    } else {

    }
  }, [product])
  const handleSelectProduct = (newRowSelectionModel) => {
    setRowSelectionID(newRowSelectionModel);
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
      field: "productName",
      headerName: "اسم المنتج",
      width: 150,
    },
    {
      field: "sku",
      headerName: "اسم المنتج",
      flex: 1,
    },
    {
      field: "type",
      headerName: "النوع",
      flex: 1,
    },
    {
      field: "wholesalePrice",
      headerName: "سعر التكلفة",
      width: 150,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
      width: 150,
    },
    {
      field: "options",
      headerName: "خيارات",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        // params.id corresponds to variant id from /products/variants
        return (
          <div className="flex items-center justify-center gap-2 h-full">
            <ButtonComponent
              variant={"show"}
              textButton="بحث اقرب فرع"
              small={true}
              onClick={() => setProduct(params.id)}
            />
          </div>
        );
      },
    },
  ];
  const formatBranches = (unFormattedData) => {
    const data = unFormattedData.map((d) => ({
      id: d.id,
      title: `${d.number} ${d.city_name}`,
      location : d.location
    }));
    return data;
  };

  const getBranches = async (url = "/branches") => {
    try {
      const response = await axiosPrivate.get(url);
      const formattedData = formatBranches(response.data.results);
      setBranches((prev) => [...prev, ...formattedData]);
      if (response.data.next) {
        getBranches(response.data.next);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDestinationSelect = (e) => {
    const { value } = e;
    setSelectedCurrentBranch(value);
  };

  const handleProductQuantity = (e) => {
    const { value } = e;
    setQuantity(value);
  };

  console.log("nearestBranch : \n\n\n\n\n" , nearestBranch);

  useEffect(() => {
    getBranches()
  }, [])
  console.log("selectedCurrentBranch" ,  branches.filter(b => b.id == selectedCurrentBranch)[0]?.location);

  return (
    product ?

      <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
        <Title text={"اقرب فرع يحتوي المنتج : "} />
        <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
          {
            loadingNearrestBranch ?
              <LoadingSpinner />
              :
              errorNearrestBranch ?
                <NoDataError error={{
                  message: errorNearrestBranch?.response?.data?.message
                }
                } />
                :
                nearestBranch &&
                // "done"
                <div className="relative w-full flex flex-col items-center justify-center gap-4">
                  <TextShowBlue label={"مدينة:"} value={nearestBranch.nearest_branch.city} />
                  <TextInputComponent
                    label={"منطقة:"}
                    value={nearestBranch.nearest_branch.area}
                    disabled={true}
                  />
                  <TextInputComponent
                    label={"شارع:"}
                    value={nearestBranch.nearest_branch.street}
                    disabled={true}
                  />
                  <TextInputComponent
                    label={"المسافة:"}
                    value={` ${nearestBranch.nearest_branch.distance_km} KM`}
                    disabled={true}
                  />
                  <TextShowBlue label={"المدير:"} value={nearestBranch.nearest_branch.manager} />
                  <div className="relative w-full flex flex-col items-start justify-end py-5">
                    <p className="relative text-end w-full py-5">:الموقع</p>
                    <PositionOnMapComponentNearestBranch
                      title={nearestBranch.nearest_branch.city + nearestBranch.nearest_branch.number + " " + nearestBranch.nearest_branch.area + " " + nearestBranch.nearest_branch.street}
                      disabled={true}
                      value={
                        nearestBranch.nearest_branch.location
                      }
                      value2={
                        branches.filter(b => b.id == selectedCurrentBranch)[0].location
                      }
                    />
                  </div>
                </div>

          }
          <ButtonComponent variant={"back"} onClick={() => setProduct(null)} />
        </section>
      </main>

      :

      <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
        <Title text={" قائمة منتجات المستودع المركزي:"} />
        <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
          <div className="w-full flex items-center flex-row-reverse gap-2 mb-4">
            <div className="flex items-start justify-center p-5">

              <DropDownComponent
                data={branches}
                label={"الفرع الحالي:"}
                ButtonText={"الفرع"}
                id={"destination"}
                dataValue="id"
                dataTitle="title"
                onSelectEvent={handleDestinationSelect}
              />
            </div>
            <div className="flex items-start justify-center p-5">
              <NumberInputComponent
                label={"الكمية:"}
                id={"quantity"}
                value={quantity}
                onChange={handleProductQuantity}
                min={1}
              />
            </div>
            {/* <ButtonComponent variant={"add"} onClick={handleClickAdd} /> */}
            {/* <ButtonComponent
            textButton="عرض المنتجات الرئيسية"
            variant={"show"}
            onClick={() => navigate("/warehouseAdmin/mainProducts")}
          /> */}
            {rowSelectionID.length > 0 && (
              <ButtonComponent
                textButton="البحث عن المنتج في اقرب فرع"
                variant={"edit"}
                onClick={() => {
                  navigate("editProducts", {
                    state: { productsIDs: rowSelectionID },
                  });
                }}
              />
            )}
          </div>
          <NearestBranchProductsTable
            handleSelectProduct={handleSelectProduct}
            rowSelectionID={rowSelectionID}
            columns={columns}
          />
        </section>
      </main>


  );
}

export default SearchProductsForNearestBranch;
