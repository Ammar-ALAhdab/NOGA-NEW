import PropTypes from "prop-types";

function TextShowBlue({
  label,
  value,
  id,
}) {


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
          value={value}
          disabled={true}
          className="w-[250px] h-[40px] outline-none text-white border-2 border-primary bg-primary text-center rounded-[20px] px-4"
        ></input>
      </div>
    </div>
  );
}

export default TextShowBlue;

TextShowBlue.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  id: PropTypes.string,
};
