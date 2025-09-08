import Title from "../../components/titles/Title";
import { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
// import DataTableAccordion from "../../components/table/DataTableAccordion";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
// import TablePagination from "../../components/table/TablePagination";
import ButtonComponent from "../../components/buttons/ButtonComponent";
// import FilterDropDown from "../../components/inputs/FilterDropDown";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faX } from "@fortawesome/free-solid-svg-icons";
// import SectionTitle from "../../components/titles/SectionTitle";
// import SearchComponent from "../../components/inputs/SearchComponent";
import { useNavigate, useParams } from "react-router-dom";
// import DropDownComponent from "../../components/inputs/DropDownComponent";
import DataTable from "../../components/table/DataTable";
import Swal from "sweetalert2";
// import DataTableEditRow from "../../components/table/DataTableEditRow";
import DataTableEditRowWithoutDelete from "../../components/table/DataTableEditRowWithoutDelete";
import TextInputComponent from "../../components/inputs/TextInputComponent";

function ManageTransportation() {
  const { transportationId } = useParams();
  const navigate = useNavigate();

  // const columns = [
  //   { field: "id", headerName: "", width: 50 },
  //   {
  //     field: "idOfOrder",
  //     headerName: "معرف المناقلة",
  //     width: 200,
  //     valueGetter: (value, row) => `#${row.id}`,
  //   },
  //   { field: "date", headerName: "التاريخ", flex: 1 },
  //   {
  //     field: "source",
  //     headerName: "من",
  //     flex: 1,
  //     valueGetter: (value, row) => {
  //       if (row.source) {
  //         return row.source;
  //       } else {
  //         return "المستودع الرئيسي";
  //       }
  //     },
  //   },
  //   {
  //     field: "destination",
  //     headerName: "الى",
  //     flex: 1,
  //     valueGetter: (value, row) => {
  //       if (row.destination) {
  //         return row.destination;
  //       } else {
  //         return "المستودع الرئيسي";
  //       }
  //     },
  //   },
  //   { field: "productCount", headerName: "عدد المنتجات", flex: 1 },
  //   {
  //     field: "status",
  //     headerName: "الحالة",
  //     flex: 1,
  //     renderCell: (params) => {
  //       return (
  //         <span
  //           className="font-bold"
  //           style={{
  //             color: params.row.status == "إرسال" ? "#2DBDA8" : "#E76D3B",
  //           }}
  //         >
  //           {params.row.status}
  //         </span>
  //       );
  //     },
  //   },
  // ];

  const detailColumns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "product", headerName: "اسم المنتج", flex: 1 },
    { field: "sku", headerName: "المعرف", flex: 1 },
    {
      field: "category",
      headerName: "النوع",
      align: "center",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "الكمية",
      flex: 1,
    },
  ];
  const detailReceviedProductsColumns = [
    { field: "id", headerName: "#", width: 50 },
    { field: "product", headerName: "اسم المنتج", flex: 1 },
    { field: "sku", headerName: "المعرف", flex: 1 },
    {
      field: "category",
      headerName: "النوع",
      align: "center",
      flex: 1,
    },
    {
      field: "quantity",
      headerName: "الكمية",
      editable: true,
      flex: 1,
    },
  ];
  // const initialFilterState = {
  //   filter: false,
  //   branch: "",
  //   ordering: "",
  //   orderingType: "",
  // };

  // const formatBranches = (unFormattedData) => {
  //   const data = unFormattedData.map((d) => ({
  //     id: d.id,
  //     title: `${d.number} ${d.city_name}`,
  //   }));
  //   return data;
  // };

  // const ORDERING_FIELDS = [{ id: "date_of_process", title: "التاريخ" }];

  // const ORDERING_TYPE = [
  //   { id: 1, title: "تصاعدي" },
  //   { id: 2, title: "تنازلي" },
  // ];

  // const reducer = (state, action) => {
  //   switch (action.type) {
  //     case "SET_FIELD":
  //       return { ...state, [action.field]: action.value, filter: true };
  //     case "RESET":
  //       return initialFilterState;
  //     default:
  //       return state;
  //   }
  // };

  const [productsTransportation, setProductsTransportation] = useState([]);
  // const [paginationSettings, setPaginationSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [page, setPage] = useState(1);
  const axiosPrivate = useAxiosPrivate();
  // const [searchQuery, setSearchQuery] = useState("");
  // const [filterShow, setFilterShow] = useState(false);
  // const [filterTerms, setFilterTerms] = useState("");
  // const [state, dispatch] = useReducer(reducer, initialFilterState);
  // const [scrollTop, setScrollTop] = useState(0);
  // const [branches, setBranches] = useState([]);
  const [code, setCode] = useState("");
  // const handleFilterTerms = (e) => {
  //   const { name, value } = e.target;
  //   dispatch({ type: "SET_FIELD", field: name, value });
  // };

  // const handleFilterClick = () => {
  //     let branchFilter = state.branch ? `&branch__id=${state.branch}` : "";
  //     let orderingTypeFilter =
  //         state.orderingType == 1 || state.orderingType == "" ? "" : "-";
  //     let orderingFilter = state.ordering
  //         ? `&ordering=${orderingTypeFilter}${state.ordering}`
  //         : "";
  //     let filter = branchFilter + orderingFilter;
  //     setFilterTerms(filter);
  //     setPage(1);
  //     getProductsLog(`/products/transportations?${filter}`);
  //     handleCloseFilter();
  // };

  // const handleChangePage = (event, value) => {
  //     setPage(value);
  //     getProductsLog(
  //         `/products/transportations?page=${value}${searchQuery ? `&search=${searchQuery}` : ""
  //         }${state.filter ? `${filterTerms}` : ""}`
  //     );
  // };

  // const handleShowFilter = () => {
  //     setFilterShow(true);
  //     document.body.style.overflow = "hidden";
  //     setScrollTop(document.documentElement.scrollTop);
  //     document.documentElement.scrollTop = 0;
  // };

  // const handleSearchClick = () => {
  //     setPage(1);

  //     getProductsLog(`/products/transportations?search=${searchQuery}`);
  // };
  const updateFunction = (newRow) => {
    console.log(newRow);

    setProductsTransportation((prev) => ({
      ...prev,
      receviedProduct: prev.receviedProduct.map((row) =>
        row.id === newRow.id ? newRow : row
      ),
    }));
  };
  const handleReceviedProducts = (unFormattedData) => {
    if (unFormattedData.received_products.length > 0) {
      let rp = unFormattedData.received_products?.map((rp) => {
        delete rp.product.quantity;
        rp.product.quantity = rp.quantity;
        return rp.product;
      });
      return rp;
    } else {
      let rp = unFormattedData.transported_products?.map((tp) => {
        delete tp.product.quantity;
        tp.product.quantity = tp.quantity;
        return tp.product;
      });
      return rp;
    }
  };
  const formatting = (unFormattedData) => {
    const formattedData = {
      id: unFormattedData.id,
      idOfOrder: unFormattedData.id,
      date: unFormattedData.created_at,
      transported_at: unFormattedData.transported_at,
      received_at: unFormattedData.received_at,
      source: unFormattedData.source,
      destination: unFormattedData.destination,
      productCount: unFormattedData?.transported_products?.length,
      status: unFormattedData.transportation_status,
      // productsOrder: unFormattedData.productsOrder,
      code: unFormattedData.code,
      transportedProduct: unFormattedData.transported_products?.map((tp) => {
        delete tp.product.quantity;
        tp.product.quantity = tp.quantity;
        return tp.product;
      }),
      receviedProduct: handleReceviedProducts(unFormattedData),
    };
    return formattedData;
  };

  // const handleCloseFilter = () => {
  //   setFilterShow(false);
  //   document.body.style.overflow = "auto";
  //   setTimeout(() => {
  //     document.documentElement.scrollTop = scrollTop;
  //   }, 300);
  // };

  const getTransportation = async (
    link = `/products/transportations/${transportationId}`
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosPrivate.get(link);
      const data = formatting(response?.data);
      setProductsTransportation(data);
      console.log(response?.data);

      // setPaginationSettings({
      //     count: response?.data?.count,
      //     next: response?.data?.next,
      //     previous: response?.data?.previous,
      // });
    } catch (e) {
      console.log(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransportation();
  }, []);
  console.log(productsTransportation.receviedProduct);

  const STATUSES = {
    packaging: "red",
    transporting: "yellow",
    delivered: "orange",
    confirmed: "green",
  };
  const NEXT_STATUSE = {
    packaging: "transport",
    transporting: "receive",
    delivered: "confirm",
    confirmed: "Done",
  };

  const handleTransport = async () => {
    Swal.fire({
      title: "هل أنت متأكد من عملية نقل المنتجات",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .post(`/products/transportations/${transportationId}/transport`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الإرسال بنجاح",
              icon: "success",
            });
            getTransportation();
          })
          .catch((error) => {
            console.error(error, error.message);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ ما في إرسال المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };
  const handleRecevie = async () => {
    Swal.fire({
      title: "هل أنت متأكد من عملية استلام المنتجات",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .post(`/products/transportations/${transportationId}/receive`, {
            code: code,
          })
          .then(() => {
            Swal.fire({
              title: "تمت عملية الإرسال بنجاح",
              icon: "success",
            });
            getTransportation();
          })
          .catch((error) => {
            console.error(error, error.message);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ ما في إرسال المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };
  const handleConfirm = async () => {
    Swal.fire({
      title: "هل أنت متأكد من عملية تأكيد كمية المنتجات المستلمة",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        const received_products = productsTransportation.receviedProduct.map(
          (product) => ({
            product: product.id,
            quantity: product.quantity,
          })
        );
        axiosPrivate
          .post(`/products/transportations/${transportationId}/confirm`, {
            received_products: received_products,
          })
          .then(() => {
            Swal.fire({
              title: "تمت عملية الإرسال بنجاح",
              icon: "success",
            });
            getTransportation();
          })
          .catch((error) => {
            console.error(error, error.message);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ ما في إرسال المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };
  const handleDelete = async () => {
    Swal.fire({
      title: "هل أنت متأكد من حذف عملية النقل",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .delete(`/products/transportations/${transportationId}`)
          .then(() => {
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
            navigate(-1);
          })
          .catch((error) => {
            console.error(error, error.message);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ ما في إرسال المنتجات",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const NEXT_ACTION = {
    packaging: handleTransport,
    transporting: handleRecevie,
    delivered: handleConfirm,
    confirmed: () => {},
  };

  console.log(NEXT_ACTION[productsTransportation.status]);

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"سجل حركة المنتجات:"} />
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <div className="relative w-full flex flex-col">
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center">
                {productsTransportation.source}
              </p>
              <p className="relative text-end w-[250px]">:ارسال من فرع</p>
            </div>
            <div className="flex items-start justify-end py-5 ">
              <p className="relative text-center">
                {productsTransportation.destination}
              </p>
              <p className="relative text-end w-[250px] ">:ارسال الى فرع</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center">
                {productsTransportation.date}
              </p>
              <p className="relative text-end w-[250px]">:تاريخ الانشاء</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center">
                {productsTransportation.transported_at}
              </p>
              <p className="relative text-end w-[250px]">:تاريخ الارسل</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center">
                {productsTransportation.received_at}
              </p>
              <p className="relative text-end w-[250px]">:تاريخ التلقي</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p
                className="relative text-center"
                style={{ color: STATUSES[productsTransportation.status] }}
              >
                {productsTransportation.status}
              </p>
              <p className="relative text-end w-[250px]">:الحالة </p>
            </div>
            {productsTransportation.status == "packaging" && (
              <div className="flex items-start justify-end py-5">
                <div className="flex items-center gap-4">
                  <ButtonComponent
                    variant="show"
                    textButton="طباعة الكود"
                    onClick={() =>
                      navigate(
                        `/warehouseAdmin/productsLog/${transportationId}/print`
                      )
                    }
                  />
                  <p className="relative text-center">
                    {productsTransportation.code}
                  </p>
                </div>
                <p className="relative text-end w-[250px]">:كود التوصيل </p>
              </div>
            )}
            <div className="flex flex-col items-end justify-end py-5 ">
              <p className="relative text-end w-[250px] py-5">
                :المنتجات المرسلة{" "}
              </p>
              <DataTable
                columns={detailColumns}
                rows={productsTransportation.transportedProduct}
                detailRows={"transportedProduct"}
                titleOfTable="المناقلة"
              />
            </div>
            {productsTransportation.status == "delivered" && (
              <div className="flex flex-col items-end justify-end py-5 ">
                <p className="relative text-end w-[250px] py-5">
                  :المنتجات المستلمة{" "}
                </p>
                <DataTableEditRowWithoutDelete
                  columns={detailReceviedProductsColumns}
                  rows={productsTransportation.receviedProduct}
                  detailRows={"transportedProduct"}
                  titleOfTable="المناقلة"
                  updateFunction={updateFunction}
                  dir={"rtl"}
                />
              </div>
            )}
            {productsTransportation.status == "confirmed" && (
              <div className="flex flex-col items-end justify-end py-5 ">
                <p className="relative text-end w-[250px] py-5">
                  :المنتجات المستلمة{" "}
                </p>
                <DataTable
                  columns={detailReceviedProductsColumns}
                  rows={productsTransportation.receviedProduct}
                  detailRows={"transportedProduct"}
                  titleOfTable="المناقلة"
                />
              </div>
            )}
            {productsTransportation.status == "transporting" && (
              <div className="flex items-start justify-end py-5">
                <TextInputComponent
                  value={code}
                  onChange={(value) => setCode(value)}
                />
                <p className="relative text-end w-[250px]">
                  :كود تأكيد التوصيل{" "}
                </p>
              </div>
            )}
            <div className="relative flex justify-between">
              <ButtonComponent variant="back" onClick={() => navigate(-1)} />
              {productsTransportation.status == "packaging" && (
                <ButtonComponent variant="delete" onClick={handleDelete} />
              )}
              {productsTransportation.status != "confirmed" && (
                <ButtonComponent
                  variant={NEXT_STATUSE[productsTransportation.status]}
                  onClick={NEXT_ACTION[productsTransportation.status]}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default ManageTransportation;
