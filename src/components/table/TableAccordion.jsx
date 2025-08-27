import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { arSD } from "@mui/x-data-grid/locales";

function TableAccordion({ row, detailColumns, detailRows ,titleOfTable="الطلب"}) {
  const existingTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme({}, arSD, existingTheme, {
        direction: "rtl",
        components: {
          MuiDataGrid: {
            styleOverrides: {
              columnHeader: {
                backgroundColor: "#7049A3 !important",
                color: "white",
              },
              columnHeaderWrapper: {
                backgroundColor: "#7049A3 !important",
              },
              // Row (both even and odd) styles
              row: {
                color: "black",
                "&:nth-of-type(odd)": {
                  backgroundColor: "#ddd",
                },
                "&:nth-of-type(even)": {
                  backgroundColor: "white",
                },
              },
            },
          },
        },
      }),
    [existingTheme]
  );
  return (
    <ThemeProvider theme={theme}>
      <Stack
        sx={{ py: 2, height: "auto", boxSizing: "border-box" }}
        direction="column"
      >
        <Paper sx={{ flex: 1, mx: "auto", width: "800px" }}>
          <Stack direction="column" spacing={1}>
            <Typography variant="h6">{`${titleOfTable}: ${row.id}#`}</Typography>
            <DataGridPro
              density="compact"
              columns={detailColumns}
              rows={row[detailRows]}
              sx={{
                border: "none",
                "& .MuiDataGrid-footerContainer": {
                  border: "1px solid #7049A3 !important",
                },
                "& .MuiDataGrid-main": {
                  borderTopLeftRadius: "1px",
                  borderTopRightRadius: "1px",
                  borderBottom: "5px solid #7049A3 !important",
                },
              }}
              hideFooter
            />
          </Stack>
        </Paper>
      </Stack>
    </ThemeProvider>
  );
}

export default TableAccordion;

TableAccordion.propTypes = {
  detailColumns: PropTypes.array,
  detailRows: PropTypes.string,
  titleOfTable: PropTypes.string,
  row: PropTypes.object,
};
