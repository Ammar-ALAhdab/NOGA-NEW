import ButtonComponent from "../../components/buttons/ButtonComponent";
import Title from "../../components/titles/Title";
import useLocationState from "../../hooks/useLocationState";
import phone from "../../assets/warehouse admin/phone.jpg";
import accessor from "../../assets/warehouse admin/accessor.png";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";
import SectionTitle from "../../components/titles/SectionTitle";
import TextAreaComponent from "../../components/inputs/TextAreaComponent";
import DataTableEditRow from "../../components/table/DataTableEditRow";

const formatting = (unFormattedData) => {
  const rowsData = unFormattedData.map((row) => ({
    id: row.id,
    profilePhoto: row.product.category_name == "Phone" ? phone : accessor,
    barcode: row.product.qr_code ? row.qr_code : "لايوجد",
    productName: row.product.product_name,
    totalQuantity: row.product.quantity,
    wantedQuantity: row.quantity,
    options: <ButtonComponent />,
  }));
  return rowsData;
};

function Request() {
  const products = useLocationState("products");
  const note = useLocationState("note");
  const [productsRows, setProductsRows] = useState(formatting(products));
  const axiosPrivate = useAxiosPrivate();
  const { RequestId } = useParams();

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
    console.log(row);
    const acceptThisProduct = {
      product_request_id: row.id,
      quantity: row.wantedQuantity,
    };
    responseToOneProduct("process", acceptThisProduct, row.id);
  };

  const acceptOrRejectAll = async (type) => {
    const responseToProductsRequests = (type) => {
      Swal.fire({
        title: `هل أنت متأكد من عملية ${
          type == "accept-all" ? "قبول" : "رفض"
        } كل طلبات المنتجات`,
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
              `/products/request/${type}`,
              JSON.stringify({ request_id: RequestId })
            )
            .then(() => {
              Swal.fire({
                title: "تمت عملية معالجة الطلب  بنجاح",
                icon: "success",
              });
              setProductsRows([]);
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

  const responseToOneProduct = (type, object, id) => {
    Swal.fire({
      title: `هل أنت متأكد من عملية ${
        type == "process" ? "قبول" : "رفض"
      } هذا المنتج`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا",
      confirmButtonColor: "#E76D3B",
      cancelButtonColor: "#3457D5",
      confirmButtonText: "نعم",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPrivate
          .post(`/products/request/${type}`, JSON.stringify(object))
          .then(() => {
            Swal.fire({
              title: "تمت عملية معالجة الطلب بنجاح",
              icon: "success",
            });
            const updatedSelectedProducts = productsRows.filter(
              (p) => p.id != id
            );
            setProductsRows(updatedSelectedProducts);
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "حدث خطأ ما في معالجة الطلب",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
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
      flex: 1,
    },
    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      width: 200,
    },
    {
      field: "wantedQuantity",
      headerName: "الكمية المطلوبة",
      width: 200,
      editable: true,
    },
  ];

  const lastColumn = {
    field: "process",
    headerName: "معالجة",
    width: 150,
    sortable: false,
    renderCell: (params) => {
      return (
        <ButtonComponent
          variant={"procedure"}
          textButton="قبول"
          small={true}
          onClick={() => acceptProduct(params.row)}
        />
      );
    },
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow">
      <Title text={"إدارة طلبات المنتجات:"} />
      <section className="flex flex-col items-center justify-center w-full bg-white rounded-[30px] p-4 my-box-shadow gap-8">
        <div className="flex justify-end items-center w-full gap-4">
          <ButtonComponent
            textButton="رفض الكل"
            variant={"reject"}
            onClick={() => acceptOrRejectAll("reject-all")}
          />
          <ButtonComponent
            textButton="قبول الكل"
            variant={"accept"}
            onClick={() => acceptOrRejectAll("accept-all")}
          />
        </div>
        <DataTableEditRow
          columns={columns}
          rows={productsRows}
          updateFunction={updateFunction}
          deleteFunction={deleteFunction}
          dir={"rtl"}
          lastColumn={lastColumn}
          requestColumns={true}
        />
        <div className="w-full">
          <SectionTitle text={"الملاحظة المرفقة:"} />
          <div className="flex items-center justify-end w-full">
            <TextAreaComponent id={"description"} value={note} />
          </div>
        </div>
      </section>
    </main>
  );
}

export default Request;
