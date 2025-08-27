import PropTypes from "prop-types";

function Title({ text }) {
  return <h1 className="w-full ar-txt font-semibold text-2xl mb-4">{text}</h1>;
}

Title.propTypes = {
  text: PropTypes.string,
};

export default Title;
