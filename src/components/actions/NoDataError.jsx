import noData from "../../assets/general/no_data.svg";
import PropTypes from "prop-types";

function NoDataError({ error }) {
  return (
    <div className="flex items-center justify-center flex-col">
      <img src={noData} alt="No Data" width={300} height={300}/>
      <h1 className="text-3xl pb-8">{error.message}</h1>
    </div>
  );
}

NoDataError.propTypes = {
  error: PropTypes.object,
};


export default NoDataError;
