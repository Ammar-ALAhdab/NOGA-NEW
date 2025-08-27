import { useMemo } from "react";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { arSD } from "@mui/x-data-grid/locales";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import PropTypes from "prop-types";
import { DataGridPro } from "@mui/x-data-grid-pro";
// import { LicenseInfo } from "@mui/x-license";

// LicenseInfo.setLicenseKey("**************");

const cacheRtl = createCache({
  key: "data-grid-rtl-demo",
  stylisPlugins: [prefixer, rtlPlugin],
});

function DataTablePagination({ columns, rows }) {
  const existingTheme = useTheme();
  const theme = useMemo(
    () =>
      createTheme({}, arSD, existingTheme, {
        direction: "rtl",
        components: {
          MuiDataGrid: {
            styleOverrides: {
              columnHeader: {
                backgroundColor: "#3457D5",
                color: "white",
              },
              columnHeaderWrapper: {
                backgroundColor: "#3457D5",
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
  columns.forEach((element) => {
    element.headerAlign = "center";
    element.align = "center";
  });
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div
          className="md:w-[570px] lg:w-[650px]  xlg:w-[770px] 2xl:w-[900px] flex items-center justify-center min-h-[200px]"
          dir="rtl"
        >
          <DataGridPro
            rows={rows}
            columns={columns}
            pagination={true}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            sx={{
              width: "100%",
              minHeight: "200px",
              border: "none",
              "& .MuiDataGrid-filler": {
                display: "none",
              },
              "& .MuiDataGrid-footerContainer": {
                border: "1px solid #3457D5",
              },
              "& .MuiDataGrid-main": {
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
                borderBottom: "5px solid #3457D5",
              },
            }}
            slotProps={{
              columnsManagement: {
                disableShowHideToggle: true,
                disableResetButton: true,
              },
            }}
          />
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

DataTablePagination.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array,
};

export default DataTablePagination;
