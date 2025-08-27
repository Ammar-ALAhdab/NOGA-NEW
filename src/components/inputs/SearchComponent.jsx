import PropTypes from "prop-types";
import ButtonComponent from "../buttons/ButtonComponent";

function SearchComponent({
  onChange = () => {},
  onClickSearch = () => {},
  value,
}) {
  const handleChange = (event) => {
    onChange(event.target.value);
  };
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onClickSearch();
      }
    };
  return (
    <div className="flex items-center justify-between gap-8" dir="rtl">
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={"بحث..."}
        className="w-[250px] h-[40px] outline-none border-2 border-primary focus:ring-2 focus:ring-blue-300 rounded-[20px] px-4"
      />
      <ButtonComponent variant={"search"} onClick={onClickSearch} />
    </div>
  );
}

SearchComponent.propTypes = {
  onChange: PropTypes.func,
  onClickSearch: PropTypes.func,
  value: PropTypes.any,
};

export default SearchComponent;
