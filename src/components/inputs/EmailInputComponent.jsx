import PropTypes from "prop-types";

function EmailInputComponent({ label, onChange = () => {}, value = "", id }) {
  const handleChange = (event) => {
    onChange(event.target.value);
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
          dir="ltr"
          type="email"
          placeholder="emailInfo@mail.com"
          maxLength={"100"}
          minLength={"10"}
          value={value}
          onChange={handleChange}
          className="w-[250px] h-[40px] outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] px-4"
        ></input>
      </div>
    </div>
  );
}

export default EmailInputComponent;

EmailInputComponent.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  id: PropTypes.string,
};
