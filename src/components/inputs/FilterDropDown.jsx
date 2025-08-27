import PropTypes from "prop-types";

function FilterDropDown({
  data,
  dataTitle,
  value,
  label,
  name,
  onChange = () => {},
}) {
  return (
    <div className="custom-select">
      <select name={name} value={value} onChange={onChange}>
        <option value="" dir="rtl">
          {label}
        </option>
        {data?.map((d, index) => (
          <option key={d.id || `${d.id}-${index}`} value={d.id}>
            {d[dataTitle]}
          </option>
        ))}
      </select>
    </div>
  );
}

FilterDropDown.propTypes = {
  data: PropTypes.array,
  dataTitle: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterDropDown;
