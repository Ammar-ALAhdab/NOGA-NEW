import { useState, useEffect } from "react";
import ButtonComponent from "../buttons/ButtonComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

function VariantForm({
  variant = null,
  productData,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    quantity: variant?.quantity || 0,
    wholesale_price: variant?.wholesale_price || 0,
    selling_price: variant?.selling_price || 0,
    sku: variant?.sku || "",
    options: variant?.options || [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (variant) {
      setFormData({
        quantity: variant.quantity || 0,
        wholesale_price: variant.wholesale_price || 0,
        selling_price: variant.selling_price || 0,
        sku: variant.sku || "",
        options: variant.options || [],
      });
    }
  }, [variant]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
    if (productData.category?.attributes) {
      const newOption = {
        attribute: productData.category.attributes[0]?.id,
        option: "",
        unit: productData.category.attributes[0]?.units?.[0]?.id || null,
      };
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption],
      }));
    }
  };

  const removeOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || formData.quantity < 0) {
      newErrors.quantity = "الكمية مطلوبة ويجب أن تكون أكبر من 0";
    }

    if (!formData.wholesale_price || formData.wholesale_price < 0) {
      newErrors.wholesale_price = "سعر الجملة مطلوب ويجب أن يكون أكبر من 0";
    }

    if (!formData.selling_price || formData.selling_price < 0) {
      newErrors.selling_price = "سعر البيع مطلوب ويجب أن يكون أكبر من 0";
    }

    if (formData.selling_price < formData.wholesale_price) {
      newErrors.selling_price = "سعر البيع يجب أن يكون أكبر من سعر الجملة";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU مطلوب";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const submitData = {
        ...formData,
        product: productData.id,
        options: formData.options.map((opt) => ({
          attribute: parseInt(opt.attribute),
          option: opt.option,
          unit: opt.unit ? parseInt(opt.unit) : null,
        })),
      };

      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
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
              handleInputChange("quantity", parseInt(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.quantity ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="أدخل الكمية"
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => handleInputChange("sku", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.sku ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="أدخل SKU"
          />
          {errors.sku && (
            <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.wholesale_price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            <span className="absolute left-3 top-2 text-gray-500">ل.س</span>
          </div>
          {errors.wholesale_price && (
            <p className="text-red-500 text-sm mt-1">
              {errors.wholesale_price}
            </p>
          )}
        </div>

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
                  parseFloat(e.target.value) || 0
                )
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.selling_price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
            />
            <span className="absolute left-3 top-2 text-gray-500">ل.س</span>
          </div>
          {errors.selling_price && (
            <p className="text-red-500 text-sm mt-1">{errors.selling_price}</p>
          )}
        </div>
      </div>

      {/* Attributes/Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            الخصائص والخصائص
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
                  handleOptionChange(index, "attribute", e.target.value)
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
              لا توجد خصائص محددة. اضغط "إضافة خاصية" لإضافة خصائص للمنتج.
            </p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <ButtonComponent variant="back" textButton="إلغاء" onClick={onCancel} />
        <ButtonComponent
          variant="add"
          textButton={isEditing ? "تحديث النسخة" : "إضافة النسخة"}
          type="submit"
        />
      </div>
    </form>
  );
}

export default VariantForm;
