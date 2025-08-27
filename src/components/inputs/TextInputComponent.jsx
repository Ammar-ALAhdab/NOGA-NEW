import PropTypes from "prop-types";

function TextInputComponent({
  label,
  onChange = () => {},
  onChangeEvent = () => {},
  value,
  id = label,
  dir = "rtl",
  disabled = false,
  placeholder = "",
}) {
  const handleChange = (event) => {
    onChange(event.target.value);
    onChangeEvent(event);
  };

  return (
    <div className="flex items-center justify-end w-full">
      <div
        dir="rtl"
        className="flex items-center justify-between gap-8 w-[500px]"
      >
        <label htmlFor={id} className="text-base">
          {label}
        </label>
        <input
          id={id}
          dir={dir}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          className="w-[250px] h-[40px] outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] px-4"
        />
      </div>
    </div>
  );
}

export default TextInputComponent;

TextInputComponent.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  onChangeEvent: PropTypes.func,
  value: PropTypes.any,
  id: PropTypes.string,
  dir: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};
