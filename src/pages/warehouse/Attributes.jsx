import { useCallback, useEffect, useMemo, useState } from "react";
import Title from "../../components/titles/Title";
import SectionTitle from "../../components/titles/SectionTitle";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import CheckInputComponent from "../../components/inputs/CheckInputComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import DataTableEditRow from "../../components/table/DataTableEditRow";
import TablePagination from "../../components/table/TablePagination";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useToast from "../../hooks/useToast";
import Swal from "sweetalert2";

const ATTRIBUTE_TYPES = [
  { id: "number", title: "رقمي" },
  { id: "text", title: "نصي" },
];

function Attributes() {
  const axiosPrivate = useAxiosPrivate();
  const Toast = useToast();

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [paginationSettings, setPaginationSettings] = useState(null);

  // Add form state
  const [attributeName, setAttributeName] = useState("");
  const [attributeType, setAttributeType] = useState("number");
  const [isMultivalue, setIsMultivalue] = useState(false);
  const [isCategorical, setIsCategorical] = useState(false);
  const [hasUnit, setHasUnit] = useState(false);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]); // array of unit IDs

  // Units (global) state
  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState(null);
  const [unitsPage, setUnitsPage] = useState(1);
  const [unitsPaginationSettings, setUnitsPaginationSettings] = useState(null);
  const [newUnitName, setNewUnitName] = useState("");

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 60 },
      { field: "attribute", headerName: "الخاصية", editable: true, flex: 1 },
      {
        field: "attribute_type",
        headerName: "النوع",
        editable: true,
        flex: 1,
        type: "singleSelect",
        valueOptions: ATTRIBUTE_TYPES.map((t) => t.id),
      },
      {
        field: "is_multivalue",
        headerName: "متعدد القيم",
        editable: true,
        width: 140,
        type: "boolean",
      },
      {
        field: "is_categorical",
        headerName: "تصنيفي",
        editable: true,
        width: 120,
        type: "boolean",
      },
      {
        field: "has_unit",
        headerName: "يحوي وحدة",
        editable: true,
        width: 130,
        type: "boolean",
      },
      {
        field: "units_count",
        headerName: "عدد الوحدات",
        width: 130,
      },
    ],
    []
  );

  // NOTE: Attribute-level unit editing removed; units managed via /products/units

  const handleChangePage = (event, value) => {
    setPage(value);
    getAttributes(`/products/attributes?page=${value}`);
  };

  const handleChangeUnitsPage = (event, value) => {
    setUnitsPage(value);
    getUnits(`/products/units?page=${value}`);
  };

  const getAttributes = useCallback(
    async (url = "/products/attributes") => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosPrivate.get(url);
        const withCounts = response.data.results?.map((a) => ({
          ...a,
          units_count: Array.isArray(a.units) ? a.units.length : 0,
        }));
        setAttributes(withCounts);
        setPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [axiosPrivate]
  );

  // Units CRUD via /products/units
  const getUnits = useCallback(
    async (url = "/products/units") => {
      try {
        setUnitsLoading(true);
        setUnitsError(null);
        const response = await axiosPrivate.get(url);
        setUnits(response.data.results);
        setUnitsPaginationSettings({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
        });
      } catch (err) {
        console.error(err);
        setUnitsError(err);
      } finally {
        setUnitsLoading(false);
      }
    },
    [axiosPrivate]
  );

  useEffect(() => {
    getAttributes();
    getUnits();
  }, [getAttributes, getUnits]);

  const updateFunction = async (updatedRow) => {
    const payload = {
      attribute: updatedRow.attribute,
      attribute_type: updatedRow.attribute_type,
      is_multivalue: !!updatedRow.is_multivalue,
      is_categorical: !!updatedRow.is_categorical,
      has_unit: !!updatedRow.has_unit,
      // keep units as-is on simple edit; separate units editor handles them
    };
    try {
      await axiosPrivate.put(
        `/products/attributes/${updatedRow.id}`,
        JSON.stringify(payload)
      );
      Toast.fire({ icon: "success", title: "تم حفظ التعديلات" });
      getAttributes(`/products/attributes?page=${page}`);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "خطأ",
        text: "تعذر تعديل الخاصية",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
    }
  };

  const deleteFunction = async (id) => {
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
          .delete(`/products/attributes/${id}`)
          .then(() => {
            Toast.fire({ icon: "success", title: "تم حذف الخاصية" });
            getAttributes(`/products/attributes?page=${page}`);
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              title: "خطأ",
              text: "تعذر حذف الخاصية",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  const handleToggleUnit = (unitId) => {
    setSelectedUnitIds((prev) => {
      if (prev.includes(unitId)) {
        return prev.filter((id) => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };

  const handleAddAttribute = async () => {
    // Validation
    if (!attributeName.trim()) {
      Swal.fire({
        title: "خطأ",
        text: "اسم الخاصية مطلوب",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    if (hasUnit && selectedUnitIds.length === 0) {
      Swal.fire({
        title: "خطأ",
        text: "يجب اختيار وحدة واحدة على الأقل",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
      return;
    }

    const payload = {
      attribute: attributeName.trim(),
      attribute_type: attributeType,
      is_multivalue: isMultivalue,
      is_categorical: isCategorical,
      has_unit: hasUnit,
      units: hasUnit ? selectedUnitIds : [],
    };

    console.log("Adding attribute with payload:", payload);
    console.log("Payload JSON string:", JSON.stringify(payload));

    try {
      const response = await axiosPrivate.post(
        `/products/attributes`,
        JSON.stringify(payload)
      );
      console.log("Attribute added successfully:", response.data);
      Toast.fire({ icon: "success", title: "تمت إضافة الخاصية" });

      // Reset form
      setAttributeName("");
      setAttributeType("number");
      setIsMultivalue(false);
      setIsCategorical(false);
      setHasUnit(false);
      setSelectedUnitIds([]);

      // Refresh data
      getAttributes(`/products/attributes?page=${page}`);
    } catch (err) {
      console.error("Error adding attribute:", err);
      Swal.fire({
        title: "خطأ",
        text: "تعذر إضافة الخاصية",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
    }
  };

  const addUnit = async () => {
    try {
      await axiosPrivate.post(
        `/products/units`,
        JSON.stringify({ unit: newUnitName })
      );
      Toast.fire({ icon: "success", title: "تمت إضافة الوحدة" });
      setNewUnitName("");
      getUnits(`/products/units?page=${unitsPage}`);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "خطأ",
        text: "تعذر إضافة الوحدة",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
    }
  };

  const updateUnit = async (updatedRow) => {
    try {
      await axiosPrivate.put(
        `/products/units/${updatedRow.id}`,
        JSON.stringify({ unit: updatedRow.unit })
      );
      Toast.fire({ icon: "success", title: "تم حفظ التعديلات" });
      getUnits(`/products/units?page=${unitsPage}`);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "خطأ",
        text: "تعذر تعديل الوحدة",
        icon: "error",
        confirmButtonColor: "#3457D5",
        confirmButtonText: "حسناً",
      });
    }
  };

  const deleteUnit = async (id) => {
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
          .delete(`/products/units/${id}`)
          .then(() => {
            Toast.fire({ icon: "success", title: "تم حذف الوحدة" });
            getUnits(`/products/units?page=${unitsPage}`);
          })
          .catch((err) => {
            console.error(err);
            Swal.fire({
              title: "خطأ",
              text: "تعذر حذف الوحدة",
              icon: "error",
              confirmButtonColor: "#3457D5",
              confirmButtonText: "حسناً",
            });
          });
      }
    });
  };

  return (
    <main className="flex flex-col items-center justify-center w-full h-full flex-grow gap-6">
      <Title text={"إدارة خصائص المنتجات:"} />

      {/* Add attribute */}
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-6 px-4 my-box-shadow">
        <SectionTitle text={"إضافة خاصية:"} />
        <div className="grid grid-cols-2 gap-4 w-full">
          <TextInputComponent
            label={"اسم الخاصية:"}
            value={attributeName}
            onChange={setAttributeName}
            id="attribute_name"
          />
          <DropDownComponent
            data={ATTRIBUTE_TYPES}
            dataValue="id"
            dataTitle="title"
            label={"نوع الخاصية:"}
            id="attribute_type"
            ButtonText={"اختر النوع"}
            onSelectEvent={(e) => setAttributeType(e.value)}
          />
          <CheckInputComponent
            label="متعدد القيم"
            id="is_multivalue"
            value={isMultivalue}
            onChange={setIsMultivalue}
          />
          <CheckInputComponent
            label="تصنيفي"
            id="is_categorical"
            value={isCategorical}
            onChange={setIsCategorical}
          />
          <CheckInputComponent
            label="يحوي وحدة"
            id="has_unit"
            value={hasUnit}
            onChange={setHasUnit}
          />
        </div>
        {hasUnit && (
          <div className="flex flex-col items-end justify-center gap-2 w-full">
            <SectionTitle text={"اختر الوحدات:"} />
            {unitsLoading ? (
              <div className="flex justify-center items-center h-[100px]">
                <LoadingSpinner />
              </div>
            ) : unitsError ? (
              <div className="text-red-500 text-center">
                خطأ في تحميل الوحدات
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 w-full">
                {units.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-end gap-2 p-2 border rounded-lg"
                  >
                    <label className="text-sm font-medium text-gray-700">
                      {unit.unit}
                    </label>
                    <input
                      type="checkbox"
                      checked={selectedUnitIds.includes(unit.id)}
                      onChange={() => handleToggleUnit(unit.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            )}
            {selectedUnitIds.length > 0 && (
              <div className="text-sm text-gray-600 text-right w-full">
                تم اختيار {selectedUnitIds.length} وحدة
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-end w-full">
          <ButtonComponent variant={"add"} onClick={handleAddAttribute} />
        </div>
      </section>

      {/* List and edit attributes */}
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-6 px-4 my-box-shadow">
        <SectionTitle text={"قائمة الخصائص:"} />
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <NoDataError error={error} />
        ) : (
          <DataTableEditRow
            columns={columns}
            rows={attributes}
            updateFunction={updateFunction}
            deleteFunction={deleteFunction}
            dir={"rtl"}
            pagination={false}
          />
        )}
        <TablePagination
          count={paginationSettings?.count}
          handleChangePage={handleChangePage}
          rowsName={"الخصائص"}
          page={page}
        />
      </section>

      {/* Units management section */}
      <section className="flex items-center justify-center flex-col gap-4 w-full bg-white rounded-[30px] py-6 px-4 my-box-shadow">
        <SectionTitle text={"إدارة الوحدات:"} />
        <div className="flex items-center justify-end w-full gap-8">
          <ButtonComponent variant={"add"} onClick={addUnit} />
          <div className="w-[500px]">
            <TextInputComponent
              label={"إضافة وحدة:"}
              onChange={setNewUnitName}
              value={newUnitName}
            />
          </div>
        </div>
        {unitsLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <LoadingSpinner />
          </div>
        ) : unitsError ? (
          <NoDataError error={unitsError} />
        ) : (
          <DataTableEditRow
            columns={[
              { field: "id", headerName: "ID", width: 60 },
              { field: "unit", headerName: "الوحدة", editable: true, flex: 1 },
            ]}
            rows={units}
            updateFunction={updateUnit}
            deleteFunction={deleteUnit}
            dir={"rtl"}
            pagination={false}
          />
        )}
        <TablePagination
          count={unitsPaginationSettings?.count}
          handleChangePage={handleChangeUnitsPage}
          rowsName={"الوحدات"}
          page={unitsPage}
        />
      </section>
    </main>
  );
}

export default Attributes;
