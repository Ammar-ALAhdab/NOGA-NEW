import PropTypes from "prop-types";

function FilterInputComponent({
  value,
  name,
  placeholder,
  onChange = () => {},
}) {
  return (
    <input
      dir="rtl"
      type="search"
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-[250px] h-[40px] outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] px-4 block"
    />
  );
}

FilterInputComponent.propTypes = {
  value: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterInputComponent;
