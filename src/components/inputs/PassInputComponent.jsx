import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { useState } from "react";

function PassInputComponent({ label, onChange, initValue = "", id, flag }) {
  const [inputValue, setInputValue] = useState(initValue);
  const [showPassword, setShowPassword] = useState(false);

  const handleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const handleChange = (event) => {
    setInputValue(event.target.value);
    onChange(event.target.value);
  };

  return (
    <div
      dir="rtl"
      className="flex items-center justify-between gap-8 w-[500px] relative"
    >
      <label htmlFor={id} className="text-base">
        {label}
      </label>
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        value={inputValue}
        onChange={handleChange}
        className={`w-[250px] h-[40px] outline-none border-2 rounded-[20px] px-2 relative my-show-pass ${
          flag
            ? "border-red-500 focus:ring-2 focus:ring-red-300"
            : "border-primary focus:ring-2 focus:ring-blue-300"
        }`}
      />
      <FontAwesomeIcon
        icon={showPassword ? faEyeSlash : faEye}
        onClick={handleShowPassword}
        className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-primary"
      />
    </div>
  );
}

export default PassInputComponent;

PassInputComponent.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  initValue: PropTypes.string,
  id: PropTypes.string,
  flag: PropTypes.bool,
};
