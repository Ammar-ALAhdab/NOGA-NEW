import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";

function NumberInputComponent({
  label,
  value,
  onChange = () => {},
  id,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
}) {
  const [NumberValue, setNumberValue] = useState(value);
  const handleChange = (e) => {
    const newValue = e.target.value === "" ? "" : Number(e.target.value);
    if (newValue === "" || (newValue >= min && newValue <= max)) {
      setNumberValue(newValue);
      onChange({ id, value: newValue });
    }
  };

  const handleDecrement = () => {
    const updatedValue = Math.max(NumberValue - step, min);
    setNumberValue(updatedValue);
    onChange({ id, value: updatedValue });
  };

  const handleIncrement = () => {
    const updatedValue = Math.min(NumberValue + step, max);
    setNumberValue(updatedValue);
    onChange({ id, value: updatedValue });
  };

  useEffect(() => {
    setNumberValue(value);
  }, [value]);
  return (
    <div className="flex items-center justify-end w-full">
      <div
        dir="rtl"
        className="flex items-center justify-between gap-8 w-[500px]"
      >
        <label htmlFor={id} className="text-base">
          {label}
        </label>
        <div className="flex items-center justify-between gap-1 relative">
          <button
            type="button"
            onClick={handleIncrement}
            className="w-[20px] h-[20px] rounded-full absolute right-2 bg-[#3457D5] text-white flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faPlus}
              size="sm"
              className="cursor-pointer"
            />
          </button>
          <input
            id={id}
            type="number"
            value={NumberValue}
            min={min}
            max={max}
            step={step}
            onChange={handleChange}
            className="w-[250px] h-[40px] text-center outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] px-2"
          ></input>

          <button
            type="button"
            onClick={handleDecrement}
            className="w-[20px] h-[20px] rounded-full absolute left-2 bg-[#3457D5] text-white flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faMinus}
              size="sm"
              className="cursor-pointer"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

NumberInputComponent.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  initValue: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
};

export default NumberInputComponent;
