import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import LoadingSpinner from "../../components/actions/LoadingSpinner";
import NoDataError from "../../components/actions/NoDataError";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import DataTable from "../../components/table/DataTable";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faArrowLeft,
  faTimes,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

function ProductVariants() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [formData, setFormData] = useState({
    quantity: "",
    wholesale_price: "",
    selling_price: "",
    options: [],
  });
  const [errors, setErrors] = useState({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterData, setFilterData] = useState({
    minPrice: null,
    maxPrice: null,
    minQuantity: null,
  });
  const [filteredVariants, setFilteredVariants] = useState([]);

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/products/${productId}`);
      setProductData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      const result = await Swal.fire({
        title: "هل أنت متأكد من حذف هذا النسخة؟",
        text: "لا يمكن التراجع عن هذا الإجراء!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "نعم، احذف!",
        cancelButtonText: "إلغاء",
      });

      if (result.isConfirmed) {
        await axiosPrivate.delete(`/products/variants/${variantId}`);
        Swal.fire("تم الحذف!", "تم حذف النسخة بنجاح.", "success");
        fetchProductData(); // Refresh data
      }
    } catch (err) {
      Swal.fire("خطأ!", "حدث خطأ أثناء حذف النسخة.", "error");
    }
  };

  // const handleEditVariant = (variant) => {
  //   setEditingVariant(variant);
  //   setShowAddVariant(false);
  // };

  const handleAddVariant = () => {
    console.log("=== ADD VARIANT BUTTON CLICKED ===");
    console.log("Current formData:", formData);
    console.log("Current errors:", errors);
    console.log("Current showAddVariant:", showAddVariant);
    console.log("Current editingVariant:", editingVariant);

    setEditingVariant(null);
    setShowAddVariant(true);

    console.log("After setting showAddVariant to true");
  };

  const handleBackToProducts = () => {
    navigate("/warehouseAdmin/mainProducts");
  };

  const handleBackToVariants = () => {
    setEditingVariant(null);
    setShowAddVariant(false);
    setFormData({
      quantity: "",
      wholesale_price: "",
      selling_price: "",
      options: [],
    });
    setErrors({});
  };

  // Filter handling functions
  const handleFilterChange = (key, value) => {
    setFilterData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = productData.variants || [];

    if (filterData.minPrice !== null && filterData.minPrice !== "") {
      filtered = filtered.filter(
        (variant) => variant.selling_price >= parseFloat(filterData.minPrice)
      );
    }
    if (filterData.maxPrice !== null && filterData.maxPrice !== "") {
      filtered = filtered.filter(
        (variant) => variant.selling_price <= parseFloat(filterData.maxPrice)
      );
    }
    if (filterData.minQuantity !== null && filterData.minQuantity !== "") {
      filtered = filtered.filter(
        (variant) => variant.quantity >= parseInt(filterData.minQuantity)
      );
    }

    // Apply attribute filters
    Object.entries(filterData).forEach(([key, value]) => {
      if (
        key !== "minPrice" &&
        key !== "maxPrice" &&
        key !== "minQuantity" &&
        value &&
        value !== ""
      ) {
        const attribute = productData.category?.attributes?.find(
          (attr) => attr.attribute === key
        );
        if (attribute) {
          filtered = filtered.filter((variant) => {
            const option = variant.options?.find(
              (opt) => opt.attribute === attribute.id
            );
            return option?.option === value;
          });
        }
      }
    });

    setFilteredVariants(filtered);
    setShowFilterModal(false);
  };

  const resetFilters = () => {
    setFilterData({
      minPrice: null,
      maxPrice: null,
      minQuantity: null,
    });
    setFilteredVariants([]);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilterData({
      minPrice: null,
      maxPrice: null,
      minQuantity: null,
    });
    setFilteredVariants([]);
  };

  const handleInputChange = (field, value) => {
    console.log(`=== INPUT CHANGE: ${field} = ${value} ===`);
    console.log("Previous formData:", formData);

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [field]: value,
      };
      console.log("New formData:", newFormData);
      return newFormData;
    });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    console.log("=== ADDING NEW OPTION ===");
    console.log("Product data:", productData);
    console.log("Product category:", productData?.category);
    console.log("Category attributes:", productData?.category?.attributes);

    try {
      // Check if we have category and attributes
      if (!productData?.category) {
        console.error("No category found in product data");
        Swal.fire({
          title: "خطأ!",
          text: "لا توجد فئة للمنتج",
          icon: "error",
        });
        return;
      }

      if (
        !productData.category.attributes ||
        productData.category.attributes.length === 0
      ) {
        console.error("No attributes found in category");
        Swal.fire({
          title: "خطأ!",
          text: "لا توجد خصائص متاحة لهذه الفئة",
          icon: "error",
        });
        return;
      }

      // Get the first available attribute
      const firstAttribute = productData.category.attributes[0];
      console.log("First attribute:", firstAttribute);

      const newOption = {
        attribute: firstAttribute.id,
        option: "",
        unit:
          firstAttribute.units && firstAttribute.units.length > 0
            ? firstAttribute.units[0].id
            : null,
      };

      console.log("New option to add:", newOption);

      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption],
      }));

      console.log("Option added successfully");
    } catch (error) {
      console.error("Error in addOption:", error);
      Swal.fire({
        title: "خطأ!",
        text: "حدث خطأ أثناء إضافة الخاصية",
        icon: "error",
      });
    }
  };

  const removeOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    console.log("=== VALIDATION STARTED ===");
    console.log("Validating formData:", JSON.stringify(formData, null, 2));

    const newErrors = {};

    console.log(
      "Checking quantity:",
      formData.quantity,
      "Type:",
      typeof formData.quantity
    );
    if (
      formData.quantity === "" ||
      formData.quantity === undefined ||
      formData.quantity === null ||
      (typeof formData.quantity === "number" && formData.quantity < 0)
    ) {
      newErrors.quantity = "الكمية مطلوبة ويجب أن تكون أكبر من أو تساوي 0";
      console.log("Quantity validation failed");
    } else {
      console.log("Quantity validation passed");
    }

    console.log(
      "Checking wholesale_price:",
      formData.wholesale_price,
      "Type:",
      typeof formData.wholesale_price
    );
    if (
      formData.wholesale_price === "" ||
      formData.wholesale_price === undefined ||
      formData.wholesale_price === null ||
      (typeof formData.wholesale_price === "number" &&
        formData.wholesale_price < 0)
    ) {
      newErrors.wholesale_price =
        "سعر الجملة مطلوب ويجب أن يكون أكبر من أو يساوي 0";
      console.log("Wholesale price validation failed");
    } else {
      console.log("Wholesale price validation passed");
    }

    console.log(
      "Checking selling_price:",
      formData.selling_price,
      "Type:",
      typeof formData.selling_price
    );
    if (
      formData.selling_price === "" ||
      formData.selling_price === undefined ||
      formData.selling_price === null ||
      (typeof formData.selling_price === "number" && formData.selling_price < 0)
    ) {
      newErrors.selling_price =
        "سعر البيع مطلوب ويجب أن يكون أكبر من أو يساوي 0";
      console.log("Selling price validation failed");
    } else {
      console.log("Selling price validation passed");
    }

    console.log(
      "Checking if selling_price >= wholesale_price:",
      formData.selling_price,
      ">=",
      formData.wholesale_price
    );
    if (
      typeof formData.selling_price === "number" &&
      typeof formData.wholesale_price === "number" &&
      formData.selling_price < formData.wholesale_price
    ) {
      newErrors.selling_price =
        "سعر البيع يجب أن يكون أكبر من أو يساوي سعر الجملة";
      console.log("Price comparison validation failed");
    } else {
      console.log("Price comparison validation passed");
    }

    setErrors(newErrors);
    console.log("Final validation errors:", JSON.stringify(newErrors, null, 2));
    const isValid = Object.keys(newErrors).length === 0;
    console.log("Form is valid:", isValid);
    return isValid;
  };

  const handleSubmitVariant = async (e) => {
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Event:", e);
    console.log("Event type:", e.type);
    console.log("Event target:", e.target);

    e.preventDefault();
    console.log("Form submitted! preventDefault called");

    console.log("=== VALIDATING FORM ===");
    const isValid = validateForm();
    console.log("Form validation result:", isValid);

    if (!isValid) {
      console.log("Form validation failed - returning early");
      return;
    }

    console.log("=== FORM VALIDATION PASSED ===");
    console.log(
      "Form data before processing:",
      JSON.stringify(formData, null, 2)
    );
    console.log("Product data:", productData);
    console.log("Product ID:", productId);

    try {
      console.log("=== BUILDING NEW VARIANT ===");

      // Build the new variant data for POST /products/variants
      console.log(
        "Product ID from URL params:",
        productId,
        "type:",
        typeof productId
      );

      const newVariantData = {
        product: parseInt(productId), // Use the product ID from URL params
        quantity: parseInt(formData.quantity) || 0,
        wholesale_price: parseFloat(formData.wholesale_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        options: formData.options.map((opt, index) => {
          console.log(`Processing option ${index}:`, opt);
          const processedOption = {
            attribute: parseInt(opt.attribute), // attribute ID
            option: opt.option, // option value
            unit: opt.unit ? parseInt(opt.unit) : null, // unit ID
          };
          console.log(`Processed option ${index}:`, processedOption);
          return processedOption;
        }),
      };

      console.log(
        "New variant data for POST:",
        JSON.stringify(newVariantData, null, 2)
      );
      console.log("=== FINAL VALIDATION ===");
      console.log(
        "Product ID:",
        newVariantData.product,
        "type:",
        typeof newVariantData.product
      );
      console.log("Options count:", newVariantData.options.length);
      newVariantData.options.forEach((opt, idx) => {
        console.log(`Final option ${idx}:`, {
          attribute: opt.attribute,
          option: opt.option,
          unit: opt.unit,
        });
      });
      console.log("Sending POST request to:", `/products/variants`);

      console.log("=== MAKING API CALL ===");
      const response = await axiosPrivate.post(
        `/products/variants`,
        newVariantData
      );
      console.log("API response:", response);
      console.log("API response data:", JSON.stringify(response.data, null, 2));

      console.log("=== SUCCESS - SHOWING SUCCESS MESSAGE ===");
      Swal.fire({
        title: "تم الإضافة بنجاح!",
        text: "تم إضافة النسخة الجديدة للمنتج",
        icon: "success",
      });

      // Refresh the product data
      console.log("=== REFRESHING DATA ===");
      fetchProductData();
      handleBackToVariants();
    } catch (err) {
      console.error("=== ERROR OCCURRED ===");
      console.error("Error details:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);

      Swal.fire({
        title: "خطأ!",
        text: err.response?.data?.message || "حدث خطأ أثناء إضافة النسخة",
        icon: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <NoDataError error={error} />;
  }

  if (!productData) {
    return <NoDataError error={{ message: "No product data found" }} />;
  }

  // Get variants to display (filtered or all)
  const variantsToDisplay =
    filteredVariants.length > 0 ? filteredVariants : productData.variants || [];

  const handleClickGotoVariant = (variantId) => {
    navigate(`/warehouseAdmin/products/variant/${variantId}`);
  };

  // Define columns for variants table
  const variantColumns = [
    { field: "id", headerName: "#", width: 80 },
    { field: "sku", headerName: "SKU", width: 160 },
    { field: "quantity", headerName: "الكمية", width: 160 },
    { field: "wholesale_price", headerName: "سعر الجملة", width: 160 },
    { field: "selling_price", headerName: "سعر البيع", width: 160 },
    { field: "total", headerName: "السعر الإجمالي", width: 160 },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 300,
      renderCell: (params) => (
        <div className="flex gap-2 justify-center py-1">
          <ButtonComponent
            variant={"show"}
            onClick={() => handleClickGotoVariant(params.id)}
          />
          <ButtonComponent
            variant="delete"
            onClick={() => handleDeleteVariant(params.row.id)}
            icon={<FontAwesomeIcon icon={faTrash} />}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 rounded-2xl">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        {/* Navigation and Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <ButtonComponent
              variant="back"
              onClick={handleBackToProducts}
              icon={<FontAwesomeIcon icon={faArrowLeft} />}
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {productData.product_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {productData.category?.category} - إدارة نسخ المنتج
              </p>
            </div>
          </div>

          <ButtonComponent
            variant="add"
            textButton="إضافة نسخة جديدة"
            onClick={handleAddVariant}
            icon={<FontAwesomeIcon icon={faPlus} />}
          />
        </div>

        {/* Product Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  إجمالي النسخ
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {productData.variants?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  إجمالي الكمية
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {productData.variants?.reduce(
                    (sum, variant) => sum + variant.quantity,
                    0
                  ) || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">متوسط السعر</p>
                <p className="text-2xl font-bold text-gray-900">
                  {productData.variants?.length > 0
                    ? `${(
                        productData.variants.reduce(
                          (sum, variant) => sum + variant.selling_price,
                          0
                        ) / productData.variants.length
                      ).toFixed(0)} ل.س`
                    : "0 ل.س"}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Variants Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-gray-800">
              {productData.product_name} إدارة جميع نسخ{" "}
            </h2>
            <div className="flex items-center gap-3">
              {filteredVariants.length > 0 && (
                <span className="text-sm text-gray-600">
                  {filteredVariants.length} من{" "}
                  {productData.variants?.length || 0} نتيجة
                </span>
              )}
              <ButtonComponent
                variant="filter"
                textButton="تصفية"
                onClick={() => setShowFilterModal(true)}
                icon={<FontAwesomeIcon icon={faFilter} />}
                small={true}
              />
              {filteredVariants.length > 0 && (
                <ButtonComponent
                  variant="back"
                  textButton="مسح التصفية"
                  onClick={clearFilters}
                  small={true}
                />
              )}
            </div>
          </div>

          <DataTable
            columns={variantColumns}
            rows={variantsToDisplay.map((variant) => ({
              ...variant,
              wholesale_price: `${variant.wholesale_price} ل.س`,
              selling_price: `${variant.selling_price} ل.س`,
              total: `${variant.total} ل.س`,
            }))}
            titleOfTable="نسخ المنتج"
          />
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  تصفية المنتجات
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Dynamic attribute filters */}
                {/* {productData.category?.attributes?.map((attr) => (
                  <div key={attr.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {attr.attribute}
                    </label>
                    <select
                      value={filterData[attr.attribute] || ""}
                      onChange={(e) =>
                        handleFilterChange(attr.attribute, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">جميع القيم</option>
                      {productData.variants
                        ?.map((variant) => {
                          const option = variant.options?.find(
                            (opt) => opt.attribute === attr.id
                          );
                          return option ? (
                            <option
                              key={`${variant.id}-${option.option}`}
                              value={option.option}
                            >
                              {option.option}{" "}
                              {option.unit ? `(${option.unit})` : ""}
                            </option>
                          ) : null;
                        })
                        .filter(Boolean)}
                    </select>
                  </div>
                ))} */}

                {/* Price range filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأدنى لسعر البيع
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filterData.minPrice || ""}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحد الأقصى لسعر البيع
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filterData.maxPrice || ""}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Quantity filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للكمية
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filterData.minQuantity || ""}
                    onChange={(e) =>
                      handleFilterChange("minQuantity", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <ButtonComponent
                  variant="back"
                  textButton="إلغاء"
                  onClick={resetFilters}
                />
                <ButtonComponent
                  variant="filter"
                  textButton="تطبيق التصفية"
                  onClick={applyFilters}
                />
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Variant Modal */}
        {console.log("=== RENDERING MODAL ===", {
          showAddVariant,
          editingVariant,
        })}
        {(showAddVariant || editingVariant) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingVariant ? "تعديل النسخة" : "إضافة نسخة جديدة"}
                </h3>
                <button
                  onClick={handleBackToVariants}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {console.log("=== RENDERING FORM ===", { formData, errors })}
              <form onSubmit={handleSubmitVariant} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الكمية <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        handleInputChange(
                          "quantity",
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value) || ""
                        )
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.quantity ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="أدخل الكمية"
                    />
                    {errors.quantity && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر الجملة <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.wholesale_price}
                        onChange={(e) =>
                          handleInputChange(
                            "wholesale_price",
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value) || ""
                          )
                        }
                        className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.wholesale_price
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        ل.س
                      </span>
                    </div>
                    {errors.wholesale_price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.wholesale_price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر البيع <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.selling_price}
                        onChange={(e) =>
                          handleInputChange(
                            "selling_price",
                            e.target.value === ""
                              ? ""
                              : parseFloat(e.target.value) || ""
                          )
                        }
                        className={`w-full pl-12 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.selling_price
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="0.00"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                        ل.س
                      </span>
                    </div>
                    {errors.selling_price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.selling_price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Options section for attributes */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      الخصائص
                    </label>
                    <ButtonComponent
                      variant="add"
                      textButton="إضافة خاصية"
                      onClick={addOption}
                      icon={<FontAwesomeIcon icon={faPlus} />}
                      small={true}
                    />
                  </div>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <select
                          value={option.attribute}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              "attribute",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {productData.category?.attributes?.map((attr) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.attribute}
                            </option>
                          ))}
                        </select>

                        <input
                          type="text"
                          value={option.option}
                          onChange={(e) =>
                            handleOptionChange(index, "option", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أدخل القيمة"
                        />

                        {productData.category?.attributes?.find(
                          (attr) => attr.id == option.attribute
                        )?.has_unit && (
                          <select
                            value={option.unit || ""}
                            onChange={(e) =>
                              handleOptionChange(index, "unit", e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">اختر الوحدة</option>
                            {productData.category?.attributes
                              ?.find((attr) => attr.id == option.attribute)
                              ?.units?.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.unit}
                                </option>
                              ))}
                          </select>
                        )}

                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}

                    {formData.options.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        لا توجد خصائص محددة. اضغط إضافة خاصية لإضافة خصائص
                        للمنتج.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <ButtonComponent
                    variant="back"
                    textButton="إلغاء"
                    onClick={handleBackToVariants}
                  />
                  <ButtonComponent
                    variant="add"
                    textButton={editingVariant ? "تحديث" : "إضافة"}
                    type="submit"
                    onClick={() => {
                      console.log("Submit button clicked!");
                      console.log("Form data:", formData);
                      console.log("Errors:", errors);
                    }}
                  />
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductVariants;
