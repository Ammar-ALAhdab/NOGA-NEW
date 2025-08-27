import PropTypes from "prop-types";
import CardButton from "../buttons/CardButton";

function CardBox({ icon, color, text, link, data }) {
  return (
    <div
    style={{borderColor : color}}
      className={`w-[300px] h-[300px] bg-white rounded-[50px] my-box-shadow flex flex-col items-center justify-between p-4 border-l-0 border-b-0 border-t-4 border-r-4`}
    >
      <img src={icon} alt="Branch Statistics" />
      <CardButton text={text} color={color} link={link} data={data} />
    </div>
  );
}

CardBox.propTypes = {
  icon: PropTypes.string,
  text: PropTypes.string,
  color: PropTypes.string,
  link: PropTypes.string,
  data: PropTypes.object,
};

export default CardBox;
