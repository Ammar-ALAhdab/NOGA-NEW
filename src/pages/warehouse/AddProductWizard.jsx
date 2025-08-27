import ButtonComponent from "../../components/buttons/ButtonComponent";
import DropDownComponent from "../../components/inputs/DropDownComponent";
import TextInputComponent from "../../components/inputs/TextInputComponent";
import NumberInputComponent from "../../components/inputs/NumberInputComponent";
import CheckInputComponent from "../../components/inputs/CheckInputComponent";
import SectionTitle from "../../components/titles/SectionTitle";
import Title from "../../components/titles/Title";
import useGoToBack from "../../hooks/useGoToBack";
import useToast from "../../hooks/useToast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../auth/useAuth";
import { axiosPrivateEmployee } from "../../api/axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function AddProductWizard() {
  const handleClickBack = useGoToBack();
  const Toast = useToast();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();

  const [step, setStep] = useState(1);

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Attributes + units
  const [attributes, setAttributes] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(false);
  // const [attributesError, setAttributesError] = useState(null);
  const [units, setUnits] = useState([]);

  // Create category modal
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedAttributeIdsForCategory, setSelectedAttributeIdsForCategory] =
    useState([]);

  // Quick add attribute
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [attributeDraft, setAttributeDraft] = useState({
    attribute: "",
    attribute_type: "number",
    is_multivalue: false,
    is_categorical: false,
    has_unit: false,
    units: [],
  });

  // Product
  const [productName, setProductName] = useState("");
  const [createdProductId, setCreatedProductId] = useState(null);

  // Variant
  const [quantity, setQuantity] = useState(1);
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [images, setImages] = useState([]);

  // Variant attribute values: attributeId -> { value, unitId }
  const [variantOptions, setVariantOptions] = useState({});
  const [optionsCache, setOptionsCache] = useState({}); // attributeId -> options

  const ATTRIBUTE_TYPES = useMemo(
    () => [
      { id: "number", title: "رقمي" },
      { id: "text", title: "نصي" },
    ],
    []
  );

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const res = await axiosPrivate.get(`/products/categories`);
      setCategories(res.data.results || []);
    } catch (err) {
      setCategoriesError(err);
      console.error(err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAttributes = async () => {
    try {
      setAttributesLoading(true);
      // reset attributes error if tracked
      const res = await axiosPrivate.get(`/products/attributes`);
      setAttributes(res.data.results || []);
    } catch (err) {
      // handle error silently; toast handled at call sites if needed
      console.error(err);
    } finally {
      setAttributesLoading(false);
    }
  };

  const loadUnits = async () => {
    try {
      const res = await axiosPrivate.get(`/products/units`);
      setUnits(res.data.results || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadAttributes();
    loadUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectCategory = (e) => {
    setSelectedCategoryId(e.value);
    try {
      const cat = categories.find((c) => String(c.id) === String(e.value));
      if (cat && Array.isArray(cat.attributes)) {
        setSelectedAttributeIdsForCategory(
          cat.attributes.map((a) => (typeof a === "object" ? a.id : a))
        );
      }
    } catch (err) {
      // ignore mapping errors; user can still proceed
    }
  };

  useEffect(() => {
    // Reset variant values and loaded options when switching category
    setVariantOptions({});
    setOptionsCache({});
  }, [selectedCategoryId]);
  const toggleCreateCategory = () => setShowCreateCategory((v) => !v);
  const toggleAddAttribute = () => setShowAddAttribute((v) => !v);

  const handleToggleAttributeInCategory = (attrId, checked) => {
    setSelectedAttributeIdsForCategory((prev) => {
      if (checked) return [...new Set([...prev, attrId])];
      return prev.filter((id) => id !== attrId);
    });
  };

  const handleAttributeDraftUnitAdd = () =>
    setAttributeDraft((p) => ({ ...p, units: [...p.units, ""] }));
  const handleAttributeDraftUnitChange = (i, val) =>
    setAttributeDraft((p) => ({
      ...p,
      units: p.units.map((u, idx) => (idx === i ? val : u)),
    }));
  const handleAttributeDraftUnitRemove = (i) =>
    setAttributeDraft((p) => ({
      ...p,
      units: p.units.filter((_, idx) => idx !== i),
    }));

  const createAttributeQuick = async () => {
    const payload = {
      attribute: attributeDraft.attribute,
      attribute_type: attributeDraft.attribute_type,
      is_multivalue: !!attributeDraft.is_multivalue,
      is_categorical: !!attributeDraft.is_categorical,
      has_unit: !!attributeDraft.has_unit,
      units: attributeDraft.has_unit
        ? attributeDraft.units
            .map((u) => (typeof u === "string" ? u.trim() : ""))
            .filter((u) => u.length > 0)
            .map((u) => ({ unit: u }))
        : [],
    };
    try {
      await axiosPrivate.post(`/products/attributes`, JSON.stringify(payload));
      Toast.fire({ icon: "success", title: "تمت إضافة الخاصية" });
      setAttributeDraft({
        attribute: "",
        attribute_type: "number",
        is_multivalue: false,
        is_categorical: false,
        has_unit: false,
        units: [],
      });
      setShowAddAttribute(false);
      loadAttributes();
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "تعذر إضافة الخاصية" });
    }
  };

  const createCategory = async () => {
    const payload = {
      category: newCategoryName,
      attributes: selectedAttributeIdsForCategory,
    };
    try {
      await axiosPrivate.post(`/products/categories`, JSON.stringify(payload));
      Toast.fire({ icon: "success", title: "تمت إضافة التصنيف" });
      setNewCategoryName("");
      setSelectedAttributeIdsForCategory([]);
      setShowCreateCategory(false);
      loadCategories();
    } catch (err) {
      console.error(err);
      Toast.fire({ icon: "error", title: "تعذر إضافة التصنيف" });
    }
  };

  const goNextFromCategory = () => {
    if (!selectedCategoryId) {
      Toast.fire({ icon: "error", title: "يرجى اختيار تصنيف" });
      return;
    }
    setStep(2);
  };

  const createProduct = async () => {
    try {
      if (!productName || !selectedCategoryId) {
        Toast.fire({ icon: "error", title: "أدخل اسم المنتج واختر التصنيف" });
        return;
      }
      const payload = {
        product_name: productName,
        category: Number(selectedCategoryId),
      };
      const res = await axiosPrivate.post(
        `/products/`,
        JSON.stringify(payload)
      );
      const newId = res?.data?.id;
      if (!newId)
        Toast.fire({
          icon: "warning",
          title: "تم إنشاء المنتج بدون إرجاع رقم",
        });
      setCreatedProductId(newId || null);
      Toast.fire({ icon: "success", title: "تم إنشاء المنتج" });
      setStep(3);
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const errors = [];
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            errors.push(`${key}: ${val.join(" ")}`);
          } else if (typeof val === "string") {
            errors.push(`${key}: ${val}`);
          } else if (typeof val === "object") {
            errors.push(`${key}: ${JSON.stringify(val)}`);
          }
        });
        Toast.fire({
          icon: "error",
          title: errors.join(" | ") || "تعذر إنشاء المنتج",
        });
      } else {
        const msg = data || "تعذر إنشاء المنتج";
        Toast.fire({
          icon: "error",
          title: `${typeof msg === "string" ? msg : "تعذر إنشاء المنتج"}`,
        });
      }
    }
  };

  const ensureOptionsLoaded = async (attribute) => {
    const attributeId = attribute.id;
    if (optionsCache[attributeId]) return;
    try {
      const resp = await axiosPrivate.get(
        `/products/options?attribute=${encodeURIComponent(attribute.attribute)}`
      );
      setOptionsCache((prev) => ({
        ...prev,
        [attributeId]: resp.data.results || [],
      }));
    } catch (err) {
      console.error(err);
      setOptionsCache((prev) => ({ ...prev, [attributeId]: [] }));
    }
  };

  const renderAttributeValueInput = (attribute) => {
    const current = variantOptions[attribute.id] || { value: "", unitId: null };
    const setCurrent = (updater) =>
      setVariantOptions((prev) => ({
        ...prev,
        [attribute.id]: { ...current, ...updater },
      }));

    let allowedUnits = Array.isArray(attribute.units)
      ? attribute.units
          .map((u) =>
            typeof u === "object"
              ? u
              : units.find((x) => String(x.id) === String(u))
          )
          .filter(Boolean)
      : units;
    if (attribute.has_unit && (!allowedUnits || allowedUnits.length === 0)) {
      allowedUnits = units;
    }

    // Show dropdown ONLY for categorical non-numeric attributes.
    if (attribute.is_categorical && attribute.attribute_type !== "number") {
      const opts = optionsCache[attribute.id] || [];
      return (
        <div className="flex flex-col items-start justify-center gap-2 w-full">
          <DropDownComponent
            data={opts}
            dataValue={"id"}
            dataTitle={"option"}
            label={attribute.attribute}
            ButtonText={"اختر"}
            value={current.value}
            onSelect={(val) => setCurrent({ value: val })}
            onSelectEvent={() => {}}
            loading={!optionsCache[attribute.id] && attributesLoading}
          />
          <TextInputComponent
            label={"قيمة أخرى:"}
            id={`attr-custom-${attribute.id}`}
            dir="ltr"
            value={typeof current.value === "string" ? current.value : ""}
            onChange={(val) => setCurrent({ value: val })}
          />
          {attribute.has_unit && (
            <DropDownComponent
              data={units}
              dataValue={"id"}
              dataTitle={"unit"}
              label={"الوحدة"}
              ButtonText={"الوحدة"}
              value={current.unitId}
              onSelect={(val) => setCurrent({ unitId: val })}
              onSelectEvent={() => {}}
            />
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start justify-center gap-2 w-full">
        <TextInputComponent
          label={attribute.attribute}
          id={`attr-${attribute.id}`}
          dir="ltr"
          value={current.value}
          onChange={(val) => setCurrent({ value: val })}
        />
        {attribute.has_unit && (
          <DropDownComponent
            data={allowedUnits}
            dataValue={"id"}
            dataTitle={"unit"}
            label={"الوحدة"}
            ButtonText={"الوحدة"}
            value={current.unitId}
            onSelect={(val) => setCurrent({ unitId: val })}
            onSelectEvent={() => {}}
          />
        )}
      </div>
    );
  };

  const chosenAttributes = useMemo(
    () =>
      attributes.filter((a) => selectedAttributeIdsForCategory.includes(a.id)),
    [attributes, selectedAttributeIdsForCategory]
  );

  useEffect(() => {
    if (step === 3) {
      chosenAttributes.forEach((attr) => {
        if (attr.is_categorical) ensureOptionsLoaded(attr);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, chosenAttributes]);

  const buildFormDataForVariant = () => {
    const fd = new FormData();
    if (createdProductId) fd.append("product", String(createdProductId));
    fd.append("quantity", String(quantity));
    fd.append("wholesale_price", String(wholesalePrice));
    fd.append("selling_price", String(sellingPrice));

    const attributesForVariant = chosenAttributes;
    let optionIndex = 0;
    attributesForVariant.forEach((attr) => {
      const picked = variantOptions[attr.id];
      if (
        !picked ||
        picked.value === "" ||
        picked.value === null ||
        picked.value === undefined
      )
        return;
      if (attr.has_unit && (!picked.unitId || String(picked.unitId) === "")) {
        // Skip sending value without unit if unit is required
        return;
      }
      fd.append(`options[${optionIndex}]attribute`, String(attr.id));
      let optionValueToSend = picked.value;
      if (attr.is_categorical && attr.attribute_type !== "number") {
        const opts = optionsCache[attr.id] || [];
        const match = opts.find((o) => String(o.id) === String(picked.value));
        if (match && match.option != null) {
          optionValueToSend = match.option;
        }
      }
      fd.append(`options[${optionIndex}]option`, String(optionValueToSend));
      if (attr.has_unit && picked.unitId)
        fd.append(`options[${optionIndex}]unit`, String(picked.unitId));
      optionIndex += 1;
    });

    const files = Array.from(images || []);
    for (let i = 0; i < files.length; i++) fd.append("images", files[i]);

    return fd;
  };

  const createVariant = async () => {
    try {
      if (!createdProductId) {
        Toast.fire({ icon: "error", title: "قم بإنشاء المنتج أولاً" });
        return;
      }
      const fd = buildFormDataForVariant();
      await axiosPrivateEmployee.post(`/products/variants`, fd, {
        headers: { Authorization: `Bearer ${auth?.accessToken}` },
      });
      Toast.fire({ icon: "success", title: "تم إنشاء النسخة" });
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const errors = [];
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            const parts = val.map((item) =>
              typeof item === "object" ? JSON.stringify(item) : String(item)
            );
            errors.push(`${key}: ${parts.join(" | ")}`);
          } else if (typeof val === "object") {
            errors.push(`${key}: ${JSON.stringify(val)}`);
          } else if (typeof val === "string") {
            errors.push(`${key}: ${val}`);
          } else {
            errors.push(`${key}: ${String(val)}`);
          }
        });
        Toast.fire({
          icon: "error",
          title: errors.join(" | ") || "تعذر إنشاء النسخة",
        });
      } else {
        const msg = data || "تعذر إنشاء النسخة";
        Toast.fire({
          icon: "error",
          title: `${typeof msg === "string" ? msg : "تعذر إنشاء النسخة"}`,
        });
      }
    }
  };

  return (
    <main className="flex flex-col items-center justify-between w-full h-full flex-grow gap-4">
      <Title text={"إضافة منتج:"} />
      <section className="flex items-center justify-center flex-col gap-6 w-full bg-white rounded-[30px] py-8 px-4 my-box-shadow">
        {step === 1 && (
          <div className="w-full">
            <SectionTitle text={"التصنيف:"} />
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center justify-start gap-4">
                <ButtonComponent
                  textButton={"إضافة تصنيف جديد"}
                  onClick={toggleCreateCategory}
                />
              </div>
              <div className="flex flex-col items-start justify-center gap-4">
                <DropDownComponent
                  data={categories}
                  dataTitle={"category"}
                  dataValue={"id"}
                  label={"اختر التصنيف:"}
                  ButtonText={"التصنيف"}
                  value={selectedCategoryId}
                  onSelectEvent={handleSelectCategory}
                  loading={categoriesLoading}
                  error={categoriesError}
                />
              </div>
            </div>

            <div
              className="absolute my-filter-box flex flex-col items-center justify-center w-full h-full p-4 z-[200]"
              style={{
                opacity: showCreateCategory ? 1 : 0,
                visibility: showCreateCategory ? "visible" : "hidden",
              }}
            >
              <div className="flex flex-col items-center justify-start gap-4 relative w-fit pl-8 pr-8 pb-8 pt-4 rounded-3xl bg-white my-box-shadow">
                <SectionTitle text={"إنشاء تصنيف جديد"} />
                <div className="flex flex-row-reverse items-center justify-start gap-2 w-full">
                  <TextInputComponent
                    label={"اسم التصنيف:"}
                    value={newCategoryName}
                    onChange={setNewCategoryName}
                    id="new_category_name"
                  />
                </div>
                <div className="flex flex-col items-end justify-center gap-2 w-full">
                  <SectionTitle text={"اختر الخصائص:"} />
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-auto w-full pr-2">
                    {attributes.map((attr) => (
                      <CheckInputComponent
                        key={attr.id}
                        label={`${attr.attribute}`}
                        id={`attr-${attr.id}`}
                        value={selectedAttributeIdsForCategory.includes(
                          attr.id
                        )}
                        onChange={(checked) =>
                          handleToggleAttributeInCategory(attr.id, checked)
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <ButtonComponent
                    textButton={"إضافة خاصية"}
                    onClick={toggleAddAttribute}
                  />
                  <div className="flex items-center gap-2">
                    <ButtonComponent
                      variant={"back"}
                      onClick={toggleCreateCategory}
                    />
                    <ButtonComponent variant={"add"} onClick={createCategory} />
                  </div>
                </div>

                {showAddAttribute && (
                  <div className="flex flex-col items-end justify-center gap-3 w-full border-t pt-4">
                    <SectionTitle text={"إضافة خاصية:"} />
                    <TextInputComponent
                      label={"اسم الخاصية:"}
                      value={attributeDraft.attribute}
                      onChange={(v) =>
                        setAttributeDraft((p) => ({ ...p, attribute: v }))
                      }
                      id="attr_name"
                    />
                    <DropDownComponent
                      data={ATTRIBUTE_TYPES}
                      dataValue="id"
                      dataTitle="title"
                      label={"نوع الخاصية:"}
                      id="attribute_type"
                      ButtonText={"اختر النوع"}
                      value={attributeDraft.attribute_type}
                      onSelectEvent={(e) =>
                        setAttributeDraft((p) => ({
                          ...p,
                          attribute_type: e.value,
                        }))
                      }
                    />
                    <CheckInputComponent
                      label="متعدد القيم"
                      id="is_multivalue"
                      value={attributeDraft.is_multivalue}
                      onChange={(v) =>
                        setAttributeDraft((p) => ({ ...p, is_multivalue: v }))
                      }
                    />
                    <CheckInputComponent
                      label="تصنيفي"
                      id="is_categorical"
                      value={attributeDraft.is_categorical}
                      onChange={(v) =>
                        setAttributeDraft((p) => ({ ...p, is_categorical: v }))
                      }
                    />
                    <CheckInputComponent
                      label="يحوي وحدة"
                      id="has_unit"
                      value={attributeDraft.has_unit}
                      onChange={(v) =>
                        setAttributeDraft((p) => ({ ...p, has_unit: v }))
                      }
                    />
                    {attributeDraft.has_unit && (
                      <div className="flex flex-col items-end justify-center gap-2 w-full">
                        {attributeDraft.units.map((u, i) => (
                          <div
                            key={`unit-${i}`}
                            className="flex items-center gap-2 w-full"
                          >
                            <div className="w-[500px]">
                              <TextInputComponent
                                label={`وحدة #${i + 1}`}
                                value={u}
                                onChange={(val) =>
                                  handleAttributeDraftUnitChange(i, val)
                                }
                              />
                            </div>
                            <ButtonComponent
                              variant={"delete"}
                              small={true}
                              onClick={() => handleAttributeDraftUnitRemove(i)}
                            />
                          </div>
                        ))}
                        <ButtonComponent
                          variant={"add"}
                          onClick={handleAttributeDraftUnitAdd}
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2 w-full">
                      <ButtonComponent
                        variant={"back"}
                        onClick={toggleAddAttribute}
                      />
                      <ButtonComponent
                        variant={"add"}
                        onClick={createAttributeQuick}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 w-full mt-4">
              <ButtonComponent variant={"back"} onClick={handleClickBack} />
              <ButtonComponent variant={"add"} onClick={goNextFromCategory} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full">
            <SectionTitle text={"معلومات المنتج:"} />
            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="flex flex-col items-start justify-center gap-4">
                <TextInputComponent
                  label={"اسم المنتج:"}
                  id="product_name"
                  value={productName}
                  onChange={setProductName}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 w-full mt-4">
              <ButtonComponent variant={"back"} onClick={() => setStep(1)} />
              <ButtonComponent variant={"add"} onClick={createProduct} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full">
            <SectionTitle text={"إنشاء نسخة المنتج:"} />
            <div className="grid grid-cols-1 gap-4 w-full">
              <div className="flex flex-col items-end justify-start gap-4">
                <NumberInputComponent
                  label={"الكمية:"}
                  id={"quantity"}
                  value={quantity}
                  min={1}
                  onChange={(e) => setQuantity(e.value)}
                />
                <TextInputComponent
                  label={"سعر التكلفة:"}
                  id={"wholesale_price"}
                  dir="ltr"
                  value={wholesalePrice}
                  onChange={setWholesalePrice}
                />
                <TextInputComponent
                  label={"سعر المبيع:"}
                  id={"selling_price"}
                  dir="ltr"
                  value={sellingPrice}
                  onChange={setSellingPrice}
                />
                <div className="flex items-center justify-between gap-8 w-[500px]">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                    className="w-[250px] h-[40px]"
                  />
                  <label className="text-base">:الصور</label>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-4">
                <SectionTitle text={"قيم الخصائص:"} />
                {chosenAttributes.length === 0 ? (
                  <p className="text-sm">لم يتم تحديد خصائص لهذا التصنيف.</p>
                ) : (
                  chosenAttributes.map((attr) => (
                    <div key={attr.id} className="w-full">
                      {renderAttributeValueInput(attr)}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 w-full mt-4">
              <ButtonComponent variant={"back"} onClick={() => setStep(2)} />
              <ButtonComponent variant={"add"} onClick={createVariant} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default AddProductWizard;
