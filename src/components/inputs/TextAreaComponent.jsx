import { useState } from "react";
import PropTypes from "prop-types";

function TextAreaComponent({value,  onChange, id , disabled = false}) {
  const [text, setText] = useState(value);
  const handleTextChange = (e) => {
    setText(e.target.value);
    onChange(e);
  };
  return (
    <textarea
      id={id}
      value={text}
      onChange={handleTextChange}
      dir="rtl"
      disabled={disabled}
      className="w-[500px] h-[200px] outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] p-2 resize-none"
    ></textarea>
  );
}

TextAreaComponent.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
};

export default TextAreaComponent;
