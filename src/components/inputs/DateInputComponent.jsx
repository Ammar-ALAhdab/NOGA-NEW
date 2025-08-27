import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PropTypes from "prop-types";
import { useState } from "react";
import { TextField, ThemeProvider, createTheme } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const newTheme = createTheme({
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          width: "250px",
          color: "#bbdefb",
        },
      },
    },
  },
});

function DateInputComponent({
  label,
  id,
  value = dayjs("2010-01-01"),
  onChange = () => {},
  onChangeEvent = () => {},
  disabled = false 
}) {
  const [selectedDate, setSelectedDate] = useState(dayjs(value));

  const handleChange = (selectedDate) => {
    setSelectedDate(selectedDate);
    onChange(selectedDate.format("YYYY-MM-DD"));
    onChangeEvent({ id, value: selectedDate.format("YYYY-MM-DD") });
  };

  return (
    <div className="flex items-center justify-end w-full">
      <div
        dir="rtl"
        className="flex items-center justify-between gap-8 w-[500px]"
      >
        <p className="text-base">{label}</p>
        <ThemeProvider theme={newTheme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => handleChange(newValue)}
              renderInput={(params) => <TextField {...params} />}
              format="YYYY-M-D"
              disabled={disabled}
            />
          </LocalizationProvider>
        </ThemeProvider>
      </div>
    </div>
  );
}

DateInputComponent.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onChangeEvent: PropTypes.func,
  disabled: PropTypes.bool,
};

export default DateInputComponent;
