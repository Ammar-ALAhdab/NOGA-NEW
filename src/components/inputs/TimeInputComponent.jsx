import { DatePicker, TimePicker } from "@mui/x-date-pickers";
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
          width: "150px",
          color: "#bbdefb",
        },
      },
    },
  },
});

function DateInputComponent({
  label,
  id,
  value = dayjs('12:00:00', 'HH:mm:ss'),
  onChange = () => { },
  onChangeEvent = () => { },
  disabled = false
}) {
  const [selectedDate, setSelectedDate] = useState(dayjs(value));

  const handleChange = (selectedDate) => {
    console.log("handleChange : " , selectedDate);
    
    setSelectedDate(selectedDate);
    onChange(selectedDate.format("HH:mm:ss"));
    onChangeEvent({ id, value: selectedDate.format("HH:mm:ss") });
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
            <TimePicker
            
              value={selectedDate}
              onChange={(newValue) => handleChange(newValue)}
              ampm={false}
              // renderInput={(params) => {
              //   console.log(params);

              //   return (
              //     <TextField {...params} />
              //   )
              // }}
              format="HH:mm:ss"
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
