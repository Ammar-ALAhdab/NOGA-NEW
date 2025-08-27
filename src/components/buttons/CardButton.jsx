import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

function CardButton({ text, color, link, data }) {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(link, {
      state: { branch: data },
    });
  };
  return (
    <button
      style={{ backgroundColor: color }}
      className={`w-[250px] h-[40px] outline-none rounded-[20px] px-2 text-white`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}

CardButton.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  link: PropTypes.string,
  data: PropTypes.object,
};

export default CardButton;
