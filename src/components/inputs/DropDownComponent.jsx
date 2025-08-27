import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "../../assets/icons/Buttons/ArrowDropDownIcon";
import LoadingSpinner from "../actions/LoadingSpinner";

function DropDownComponent({
  data,
  dataValue,
  dataTitle,
  label,
  id,
  ButtonText,
  value = ButtonText,
  onSelect = () => {},
  onSelectEvent = () => {},
  loading,
  error,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedValue, setSelectedValue] = useState(value);
  const [buttonTextSelected, setButtonTextSelected] = useState(ButtonText);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (theDataSelected) => {
    setSelectedValue(theDataSelected);
    onSelect(theDataSelected);
    const selectEventObj = { id, value: theDataSelected };
    onSelectEvent(selectEventObj);
    handleClose();
  };
  const menuListRef = useRef(null);
  useEffect(() => {
    setTimeout(() => {
      if (menuListRef.current) {
        menuListRef.current.children[2].classList.add("no-scrollbar");
      }

      return () => {
        if (menuListRef.current) {
          menuListRef.current.children[2].classList.remove("no-scrollbar");
        }
      };
    }, 2000);
  }, []);
  useEffect(() => {
    const text = data.find((d) => d[dataValue] == selectedValue);
    setButtonTextSelected(text?.[dataTitle]);
  }, [selectedValue]);

  const StyledMenu = styled(Menu)({
    "& .MuiPaper-root": {
      backgroundColor: "#3457D5",
      color: "white",
      borderRadius: "20px",
      overflow: "auto",
    },
    "& .MuiPaper-root MuiPaper-elevation": {
      scrollBarWidth: "none",
    },
  });

  const StyledMenuItem = styled(MenuItem)({
    "&.MuiMenuItem-root": {
      width: "250px",
      height: "40px",
      justifyContent: "center",
      "&:hover": {
        backgroundColor: "darkblue",
      },
    },
  });

  return (
    <div className={`flex items-center justify-end w-full`}>
      <div
        dir="rtl"
        className={`flex items-center justify-between gap-8 w-[500px]`}
      >
        {label && <p className="text-base">{label}</p>}
        <Button
          id="selectButton"
          aria-controls="select-menu"
          aria-haspopup="true"
          onClick={handleClick}
          sx={{
            width: "250px",
            height: "40px",
            borderRadius: "20px",
            backgroundColor: "#3457D5",
            color: "white",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            "&:hover": {
              backgroundColor: "darkblue",
            },
          }}
          endIcon={
            error ? (
              "لا توجد بيانات"
            ) : loading ? (
              <LoadingSpinner />
            ) : (
              <ArrowDropDownIcon />
            )
          }
        >
          <p className="w-full text-center">
            {buttonTextSelected || ButtonText}
          </p>
        </Button>
        <StyledMenu
          id="select-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          ref={menuListRef}
        >
          {data?.map((d, index) => (
            <StyledMenuItem
              key={d.id || `${d[dataValue]}-${index}`}
              onClick={() => handleMenuItemClick(d[dataValue])}
            >
              {d[dataTitle]}
            </StyledMenuItem>
          ))}
          {data?.length == 0 ? (
            <StyledMenuItem>لاتوجد بيانات</StyledMenuItem>
          ) : null}
        </StyledMenu>
      </div>
    </div>
  );
}

DropDownComponent.propTypes = {
  data: PropTypes.array,
  dataValue: PropTypes.string,
  dataTitle: PropTypes.string,
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.any,
  ButtonText: PropTypes.string,
  onSelect: PropTypes.func,
  onSelectEvent: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.object,
};

export default DropDownComponent;
