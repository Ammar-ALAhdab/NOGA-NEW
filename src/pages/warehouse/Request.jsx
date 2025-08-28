import ButtonComponent from "../../components/buttons/ButtonComponent";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import SectionTitle from "../../components/titles/SectionTitle";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import DataTable from "../../components/table/DataTable";

const formatting = (unFormattedData) => {
  const rowsData = unFormattedData.map((row) => ({
    id: row.product.id,
    profilePhoto: row.product.images.length > 0 ? row.product.images[0] : row.product.category == "phone" ? phone : accessor,
    barcode: row.product.qr_code ? row.qr_code : "لايوجد",
    productName: row.product.product,
    sku: row.product.sku,
    totalQuantity: row.product.quantity,
    wantedQuantity: row.quantity,
    toSendQuantity: row.quantity,
    product_request_status: row.product_request_status,
    options: <ButtonComponent />,
  }));
  return rowsData;
};

function Request() {

  const [status, setStatus] = useState('waiting')
  const [productsRows, setProductsRows] = useState([]);
  const [request, setRequest] = useState()
  const axiosPrivate = useAxiosPrivate();
  const { RequestId } = useParams();
  const [process, setProcess] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const getRequest = async (url = `/products/requests/${RequestId}`) => {
    try {
      const response = await axiosPrivate.get(url);
      console.log(response.data);

      const formattedData = formatting(response.data.requested_products);
      setStatus(response.data.request_status)
      setRequest(response.data)
      setProductsRows(formattedData)
    } catch (error) {
      console.error(error);
    }
  };

  const updateFunction = (newRow) => {
    setProductsRows(
      productsRows.map((row) => (row.id === newRow.id ? newRow : row))
    );
  };

  const deleteFunction = (id) => {
    const rejectThisProduct = {
      product_request_id: id,
    };
    responseToOneProduct("reject", rejectThisProduct, id);
  };

  const acceptProduct = (row) => {
    const acceptThisProduct = {
      product_request_id: row.id,
      quantity: row.wantedQuantity,
    };
    responseToOneProduct("process", acceptThisProduct, row.id);
  };

  const rejectAll = async (type) => {
    const responseToProductsRequests = (type) => {
      Swal.fire({
        title: `هل أنت متأكد من عملية رفض الطلب`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          axiosPrivate
            .post(
              `/products/requests/${RequestId}/reject-all`,
              JSON.stringify({ request_id: RequestId })
            )
            .then(() => {
              Swal.fire({
                title: "تمت عملية رفض الطلب  بنجاح",
                icon: "success",
              });
              navigate(-1);
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في معالجة كل الطلب",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    responseToProductsRequests(type);
  };

  const processRequest = async (type) => {
    const responseToProductsRequests = (type) => {
      Swal.fire({
        title: `هل أنت متأكد من عملية معالجة الطلب`,
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "لا",
        confirmButtonColor: "#E76D3B",
        cancelButtonColor: "#3457D5",
        confirmButtonText: "نعم",
      }).then((result) => {
        if (result.isConfirmed) {
          const data =
          {
            transported_products: productsRows.map(product => (
              {
                product: product.id,
                quantity: product.toSendQuantity
              }
            ))
          }
          axiosPrivate
            .post(
              `/products/requests/${RequestId}/process`,
              data
            )
            .then((res) => {
              Swal.fire({
                title: "تمت عملية معالجة الطلب  بنجاح",
                icon: "success",
              });
              setProcess(false)
              getRequest()
            })
            .catch((error) => {
              console.error(error);
              Swal.fire({
                title: "خطأ",
                text: "حدث خطأ ما في معالجة كل الطلب",
                icon: "error",
                confirmButtonColor: "#3457D5",
                confirmButtonText: "حسناً",
              });
            });
        }
      });
    };
    responseToProductsRequests(type);
  };

  // const responseToOneProduct = (type, object, id) => {
  //   Swal.fire({
  //     title: `هل أنت متأكد من عملية ${type == "process" ? "قبول" : "رفض"
  //       } هذا المنتج`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     cancelButtonText: "لا",
  //     confirmButtonColor: "#E76D3B",
  //     cancelButtonColor: "#3457D5",
  //     confirmButtonText: "نعم",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axiosPrivate
  //         .post(`/products/request/${type}`, JSON.stringify(object))
  //         .then(() => {
  //           Swal.fire({
  //             title: "تمت عملية معالجة الطلب بنجاح",
  //             icon: "success",
  //           });
  //           const updatedSelectedProducts = productsRows.filter(
  //             (p) => p.id != id
  //           );
  //           setProductsRows(updatedSelectedProducts);
  //         })
  //         .catch((error) => {
  //           console.error(error);
  //           Swal.fire({
  //             title: "خطأ",
  //             text: "حدث خطأ ما في معالجة الطلب",
  //             icon: "error",
  //             confirmButtonColor: "#3457D5",
  //             confirmButtonText: "حسناً",
  //           });
  //         });
  //     }
  //   });
  // };

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
      flex: 1,
    },
    {
      field: "sku",
      headerName: "المعرف",
      width: 200,

    },
    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      width: 150,
    },
    {
      field: "wantedQuantity",
      headerName: "الكمية المطلوبة",
      width: 150,
    },
    {
      field: "product_request_status",
      headerName: "حالة المنتج",
      width: 150,
      renderCell: (params) => {

        return (
          <div className="flex justify-center items-center h-full">
            <p className="text-center" style={{ color: STATUS[params.row.product_request_status] }}>{params.row.product_request_status}</p>
          </div>
        );
      },
    },
  ];


  const TransportationsColumns = [
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
      flex: 1,
    },
    {
      field: "sku",
      headerName: "المعرف",
      width: 200,
    },
    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      width: 100,
    },
    {
      field: "wantedQuantity",
      headerName: "الكمية المطلوبة",
      width: 200,
    },
    {
      field: "toSendQuantity",
      headerName: "الكمية المراد ارسالها",
      width: 200,
      editable: true,
    },
  ];
  // const lastColumn = {
  //   field: "process",
  //   headerName: "معالجة",
  //   width: 150,
  //   sortable: false,
  //   renderCell: (params) => {
  //     return (
  //       <ButtonComponent
  //         variant={"procedure"}
  //         textButton="قبول"
  //         small={true}
  //         onClick={() => acceptProduct(params.row)}
  //       />
  //     );
  //   },
  // };

  const STATUS = {
    'fully-approved': 'green',
    'partially-approved': 'green',
    'waiting': 'orange',
    'rejected': 'red',
  }

  useEffect(() => {
    getRequest()
  }, [])

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إدارة طلبات المنتجات:"} />
      {
        request &&
        <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
          {
            status == 'waiting' &&

            <div className="flex justify-end items-center w-full gap-4">
              <ButtonComponent
                textButton="رفض الطلب"
                variant={"reject"}
                onClick={() => rejectAll()}
              />
              {
                !process &&

                <ButtonComponent
                  textButton="معالجة الطلب"
                  variant={"accept"}
                  onClick={() => setProcess(true)}
                />
              }
              {
                process &&
                <ButtonComponent
                  textButton="الغاء"
                  variant={"reject"}
                  onClick={() => setProcess(false)}
                />
              }

            </div>
          }

          {
            (request.request_status == 'fully-approved' || request.request_status == 'partially-approved') &&
            <div className="flex justify-end items-center w-full gap-4">


              <ButtonComponent
                variant={"transport"}
                textButton="الانتقال الى عملية النقل"
                onClick={() => {
                  if (request.transportation?.id) {
                    const basePath = location.pathname.split('/')[1]
                    navigate(`/${basePath}/productsLog/${request.transportation?.id}`, { replace: true })
                  }
                }
                }
              />
            </div>
          }

          <div className="relative w-full flex flex-col">
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center">{request.branch_name}</p>
              <p className="relative text-end w-[250px]">:ارسال الى فرع</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center" style={{ color: STATUS[request.request_status] }}>{request.request_status}</p>
              <p className="relative text-end w-[250px]">:الحالة</p>
            </div>
            <div className="flex items-start justify-end py-5">
              <p className="relative text-center" >{request.created_at}</p>
              <p className="relative text-end w-[250px]">:تاريخ الارسال</p>
            </div>
          </div>
          {
            process ?
              <DataTableEditRow
                columns={TransportationsColumns}
                rows={productsRows}
                updateFunction={updateFunction}
                deleteFunction={deleteFunction}
                dir={"rtl"}
                // lastColumn={lastColumn}
                requestColumns={true}
              />
              :
              <DataTable
                columns={columns}
                rows={productsRows}
                // lastColumn={lastColumn}
                requestColumns={true}
              />

          }
          {
            process ?
              <div className="relative w-full flex justify-between items-center">
                <ButtonComponent variant="back" onClick={() => navigate(-1)} />
                <ButtonComponent
                  variant={"transport"}
                  onClick={() => { processRequest() }}
                />

              </div>
              :
              <div className="relative w-full flex justify-start items-center">
                <ButtonComponent variant="back" onClick={() => navigate(-1)} />
              </div>

          }


        </section>
      }
    </main>
  );
}

export default Request;
