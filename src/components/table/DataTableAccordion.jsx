import { useCallback, useMemo } from "react";
import { DataGridPro } from "@mui/x-data-grid-pro";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { arSD } from "@mui/x-data-grid/locales";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import PropTypes from "prop-types";
// import { LicenseInfo } from "@mui/x-license";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import TableAccordion from "./TableAccordion";

// LicenseInfo.setLicenseKey("**************");

const cacheRtl = createCache({
  key: "data-grid-rtl-demo",
  stylisPlugins: [prefixer, rtlPlugin],
});

function DataTableAccordion({
  columns,
  rows,
  detailColumns,
  detailRows,
  titleOfTable,
}) {
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

  detailColumns.forEach((element) => {
    element.headerAlign = "center";
    element.align = "center";
  });

  const getDetailPanelContent = useCallback(
    ({ row }) => {
      return (
        <TableAccordion
          row={row}
          detailColumns={detailColumns}
          detailRows={detailRows}
          titleOfTable={titleOfTable}
        />
      );
    },
    [detailColumns, detailRows, titleOfTable]
  );

  const getDetailPanelHeight = useCallback(() => "auto", []);

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div
          className="w-[900px] flex items-center justify-center min-h-[200px]"
          dir="rtl"
        >
          <DataGridPro
            rows={rows}
            columns={columns}
            getDetailPanelHeight={getDetailPanelHeight}
            getDetailPanelContent={getDetailPanelContent}
            slots={{
              detailPanelExpandIcon: () => (
                <FontAwesomeIcon
                  icon={faChevronDown}
                  size="sm"
                  className="cursor-pointer"
                />
              ),
              detailPanelCollapseIcon: () => (
                <FontAwesomeIcon
                  icon={faChevronUp}
                  size="sm"
                  className="cursor-pointer"
                />
              ),
            }}
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
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
            }}
            pageSizeOptions={[5, 10]}
            slotProps={{
              columnsManagement: {
                disableShowHideToggle: true,
                disableResetButton: true,
              },
            }}
            hideFooter={true}
          />
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

DataTableAccordion.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array,
  detailColumns: PropTypes.array,
  detailRows: PropTypes.string,
  titleOfTable: PropTypes.string,
};

export default DataTableAccordion;
