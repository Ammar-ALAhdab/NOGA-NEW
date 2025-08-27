import PropTypes from "prop-types";

function LoadingSpinner({ w = "32px", h = "32px" }) {
  const size = {
    width: `${w}`,
    height: `${h}`,
  };
  return (
    <div
      style={{ width: size.width, height: size.height }}
      className={`text-primary inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

LoadingSpinner.propTypes = {
  w: PropTypes.string,
  h: PropTypes.string,
};

export default LoadingSpinner;
