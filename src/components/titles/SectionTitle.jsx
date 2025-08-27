import PropTypes from "prop-types";

function SectionTitle({ text }) {
  return <h1 className="w-full ar-txt font-semibold text-xl my-4">{text}</h1>;
}

SectionTitle.propTypes = {
  text: PropTypes.string,
};

export default SectionTitle;
