import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import TablePagination from "../../components/table/TablePagination";
import SectionTitle from "../../components/titles/SectionTitle";
import Title from "../../components/titles/Title";
import useToast from "../../hooks/useToast";
import useGoToBack from "../../hooks/useGoToBack";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Swal from "sweetalert2";
import DataTableEditRow from "../../components/table/DataTableEditRow";

const DETAILS_BODY_REQUEST = {
  phone_brands: "brand_name",
  cpus: "CPU_brand",
  colors: "color",
  accessories_categories: "category_name",
};

const LOADING = {
  brands: true,
  cpus: true,
  colors: true,
  accessoriesCategories: true,
};

const ERRORS = {
  brands: null,
  cpus: null,
  colors: null,
  accessoriesCategories: null,
};

function WareHouseSettings() {
  const [pageBrand, setPageBrand] = useState(1);
  const [pageCPU, setPageCPU] = useState(1);
  const [pageColor, setPageColor] = useState(1);
  const [pageCategory, setPageCategory] = useState(1);
  const [addedBrand, setAddedBrand] = useState("");
  const [addedCPU, setAddedCPU] = useState("");
  const [addedColor, setAddedColor] = useState("");
  const [addedCategory, setAddedCategory] = useState("");
  const [loading, setLoading] = useState(LOADING);
  const [error, setError] = useState(ERRORS);
  const [brands, setBrands] = useState([]);
  const [CPUS, setCPUS] = useState([]);
  const [colors, setColors] = useState([]);
  const [accessoriesCategories, setAccessoriesCategories] = useState([]);
  const [brandPaginationSettings, setBrandPaginationSettings] = useState(null);
  const [CPUsPaginationSettings, setCPUsPaginationSettings] = useState(null);
  const [colorsPaginationSettings, setColorsPaginationSettings] =
    useState(null);
  const [accessoriesPaginationSettings, setAccessoriesPaginationSettings] =
    useState(null);
  const handleClickBack = useGoToBack();
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();

  const handleChangePageBrands = (event, value) => {
    setPageBrand(value);

    getSettings(`/phone_brands?page=${value}`, "phone_brands", value);
  };

  const handleChangePageCPUs = (event, value) => {
    setPageCPU(value);

    getSettings(`/cpus?page=${value}`, "cpus", value);
  };

  const handleChangePageColors = (event, value) => {
    setPageColor(value);

    getSettings(`/colors?page=${value}`, "colors", value);
  };

  const handleChangePageAccessories = (event, value) => {
    setPageCategory(value);

    getSettings(
      `/accessories_categories?page=${value}`,
      "accessories_categories",
      value
    );
  };

  useEffect(() => {
    getSettings("/phone_brands", "phone_brands");
    getSettings("/cpus", "cpus");
    getSettings("/colors", "colors");
    getSettings("/accessories_categories", "accessories_categories");
  }, []);

  const getSettings = async (link, storeData, page = 1) => {
    try {
      if (storeData == "phone_brands") {
        setPageBrand(page);
        setLoading((prev) => ({ ...prev, brands: true }));
        setError((prev) => ({ ...prev, brands: null }));
      } else if (storeData == "cpus") {
        setPageCPU(page);
        setLoading((prev) => ({ ...prev, cpus: true }));
        setError((prev) => ({ ...prev, cpus: null }));
      } else if (storeData == "colors") {
        setPageColor(page);
        setLoading((prev) => ({ ...prev, colors: true }));
        setError((prev) => ({ ...prev, colors: null }));
      } else if (storeData == "accessories_categories") {
        setPageCategory(page);
        setLoading((prev) => ({ ...prev, accessoriesCategories: true }));
        setError((prev) => ({ ...prev, accessoriesCategories: null }));
      }
      const response = await axiosPrivate.get(link);
      if (storeData == "phone_brands") {
        setBrands(response.data.results);
        setBrandPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else if (storeData == "cpus") {
        setCPUS(response.data.results);
        setCPUsPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else if (storeData == "colors") {
        setColors(response.data.results);
        setColorsPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } else if (storeData == "accessories_categories") {
        setAccessoriesCategories(response.data.results);
        setAccessoriesPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      }
    } catch (error) {
      console.log(error);
      if (storeData == "phone_brands") {
        setError((prev) => ({ ...prev, brands: error }));
      } else if (storeData == "cpus") {
        setError((prev) => ({ ...prev, cpus: error }));
      } else if (storeData == "colors") {
        setError((prev) => ({ ...prev, colors: error }));
      } else if (storeData == "accessories_categories") {
        setError((prev) => ({ ...prev, accessoriesCategories: error }));
      }
    } finally {
      if (storeData == "phone_brands") {
        setLoading((prev) => ({ ...prev, brands: false }));
      } else if (storeData == "cpus") {
        setLoading((prev) => ({ ...prev, cpus: false }));
      } else if (storeData == "colors") {
        setLoading((prev) => ({ ...prev, colors: false }));
      } else if (storeData == "accessories_categories") {
        setLoading((prev) => ({ ...prev, accessoriesCategories: false }));
      }
    }
  };

  const updateFunction = async (updatedData, link) => {
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
        axiosPrivate
          .put(`/${link}/${updatedData.id}`, JSON.stringify(updatedData))
          .then(() => {
            getSettings(`/${link}`, link);
            Swal.fire({
              title: "تمت عملية التعديل بنجاح",
              icon: "success",
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: "خطأ في تعديل بيانات هذا الحقل",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const addFunction = async (addedJob, link) => {
    try {
      await axiosPrivate.post(
        `/${link}`,
        JSON.stringify({ [DETAILS_BODY_REQUEST[link]]: addedJob })
      );
      getSettings(`/${link}`, link);
      if (link == "phone_brands") {
        setAddedBrand("");
      } else if (link == "cpus") {
        setAddedCPU("");
      } else if (link == "colors") {
        setAddedColor("");
      } else if (link == "accessories_categories") {
        setAddedCategory("");
      }
      Toast.fire({
        icon: "success",
        title: "تمت عملية الإضافة بنجاح",
      });
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 400) {
        Toast.fire({
          icon: "error",
          title: "لا يمكن إدخال حقل موجود مسبقاً",
        });
      }
    }
  };

  const deleteFunction = async (id, link) => {
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
          .delete(`/${link}/${id}`)
          .then(() => {
            getSettings(`/${link}`, link);
            Swal.fire({
              title: "تمت عملية الحذف بنجاح",
              icon: "success",
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: "خطأ",
              text: " عذراً لا يمكنك القيام بعملية الحذف هذه",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const brandsColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "brand_name",
      headerName: "الشركة المصنعة",
      editable: true,
      flex: 1,
    },
  ];

  const cpusColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "CPU_brand",
      headerName: "المعالج",
      editable: true,
      flex: 1,
    },
  ];

  const colorsColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "color",
      headerName: "اللون",
      editable: true,
      flex: 1,
    },
  ];

  const accessoriesCategoriesColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "category_name",
      headerName: "التصنيف",
      editable: true,
      flex: 1,
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-4 ">
      <Title text="الإعدادات:" />
      <section className="flex items-center justify-center flex-col gap-16 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        <SectionTitle text="تعديل قائمة الشركات المصنعة للهواتف المحمولة:" />
        <div className="flex items-center justify-end w-full gap-8">
          <ButtonComponent
            variant={"add"}
            onClick={() => addFunction(addedBrand, "phone_brands")}
          />
          <div className="w-[500px]">
            <TextInputComponent
              label={"إضافة شركة مصنعة:"}
              onChange={setAddedBrand}
              value={addedBrand}
            />
          </div>
        </div>
        {loading.brands && brands.length ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error.brands ? (
          <NoDataError error={error.brands} />
        ) : (
          <DataTableEditRow
            columns={brandsColumns}
            rows={brands}
            updateFunction={updateFunction}
            deleteFunction={deleteFunction}
            link={"phone_brands"}
            dir="ltr"
          />
        )}
        <TablePagination
          count={brandPaginationSettings?.count}
          handleChangePage={handleChangePageBrands}
          rowsName={"الشركات المصنعة"}
          page={pageBrand}
        />
        <SectionTitle text="تعديل قائمة الشركات المصنعة للمعالجات:" />
        <div className="flex items-center justify-end w-full gap-8">
          <ButtonComponent
            variant={"add"}
            onClick={() => addFunction(addedCPU, "cpus")}
          />
          <div className="w-[500px]">
            <TextInputComponent
              label={"إضافة شركة مصنعة للمعالج:"}
              onChange={setAddedCPU}
              value={addedCPU}
            />
          </div>
        </div>
        {loading.cpus && CPUS.length ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error.brands ? (
          <NoDataError error={error.cpus} />
        ) : (
          <DataTableEditRow
            columns={cpusColumns}
            rows={CPUS}
            updateFunction={updateFunction}
            deleteFunction={deleteFunction}
            link={"cpus"}
            dir="ltr"
          />
        )}
        <TablePagination
          count={CPUsPaginationSettings?.count}
          handleChangePage={handleChangePageCPUs}
          rowsName={" أنواع المعالجات"}
          page={pageCPU}
        />
        <SectionTitle text="تعديل قائمة الألوان للهواتف المحمولة:" />
        <div className="flex items-center justify-end w-full gap-8">
          <ButtonComponent
            variant={"add"}
            onClick={() => addFunction(addedColor, "colors")}
          />
          <div className="w-[500px]">
            <TextInputComponent
              label={"إضافة لون:"}
              onChange={setAddedColor}
              value={addedColor}
            />
          </div>
        </div>
        {loading.colors && colors.length ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error.colors ? (
          <NoDataError error={error.colors} />
        ) : (
          <DataTableEditRow
            columns={colorsColumns}
            rows={colors}
            updateFunction={updateFunction}
            deleteFunction={deleteFunction}
            link={"colors"}
            dir="ltr"
          />
        )}
        <TablePagination
          count={colorsPaginationSettings?.count}
          handleChangePage={handleChangePageColors}
          rowsName={"الألوان"}
          page={pageColor}
        />
        <SectionTitle text="تعديل قائمة تصنيف الإكسسوارات:" />
        <div className="flex items-center justify-end w-full gap-8">
          <ButtonComponent
            variant={"add"}
            onClick={() => addFunction(addedCategory, "accessories_categories")}
          />
          <div className="w-[500px]">
            <TextInputComponent
              label={"إضافة تصنيف:"}
              onChange={setAddedCategory}
              value={addedCategory}
            />
          </div>
        </div>
        {loading.accessoriesCategories && accessoriesCategories.length ? (
          <div className="flex justify-center items-center h-[400px]">
            <LoadingSpinner w="64px" h="64px" />
          </div>
        ) : error.accessoriesCategories ? (
          <NoDataError error={error.accessoriesCategories} />
        ) : (
          <DataTableEditRow
            columns={accessoriesCategoriesColumns}
            rows={accessoriesCategories}
            updateFunction={updateFunction}
            deleteFunction={deleteFunction}
            link={"accessories_categories"}
            dir="ltr"
          />
        )}
        <TablePagination
          count={accessoriesPaginationSettings?.count}
          handleChangePage={handleChangePageAccessories}
          rowsName={"التصنيفات"}
          page={pageCategory}
        />

        <div className="flex items-center justify-end w-full">
          <ButtonComponent variant={"back"} onClick={handleClickBack} />
        </div>
      </section>
    </main>
  );
}

export default WareHouseSettings;
