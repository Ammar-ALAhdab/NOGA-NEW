import { useEffect, useMemo, useState } from "react";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { arSD } from "@mui/x-data-grid/locales";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import PropTypes from "prop-types";
import {
  DataGridPro,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons,
} from "@mui/x-data-grid-pro";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
// import { LicenseInfo } from "@mui/x-license";

// LicenseInfo.setLicenseKey("**************");

const cacheRtl = createCache({
  key: "data-grid-rtl-demo",
  stylisPlugins: [prefixer, rtlPlugin],
});

function DataTableEditRowWithoutDelete({
  columns,
  rows,
  updateFunction,
  deleteFunction,
  link,
  dir,
  pagination = false,
  lastColumn = {},
  requestColumns = false,
}) {
  const [visualRows, setVisualRows] = useState(rows);
  const [rowModesModel, setRowModesModel] = useState({});

  useEffect(() => {
    setVisualRows(rows);
  }, [rows]);

  const visualColumns = [
    ...columns,
    {
      field: "actions",
      type: "actions",
      headerName: "خيارات",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={"save"}
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "#7049A3",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={"Cancel"}
              icon={<CancelIcon />}
              label="Cancel"
              sx={{
                color: "#E76D3B",
              }}
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={"Edit"}
            icon={<EditIcon />}
            label="Edit"
            sx={{
              color: "#D9A322",
            }}
            onClick={handleEditClick(id)}
          />,
          
        ];
      },
    },
  ];

  if (requestColumns == true) {
    visualColumns.push(lastColumn);
  }

  console.log(visualColumns);

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setVisualRows(
      visualRows.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    updateFunction(newRow, link);
    return updatedRow;
  };

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    // setVisualRows(visualRows.filter((row) => row.id !== id));
    deleteFunction(id, link);
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = visualRows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setVisualRows(visualRows.filter((row) => row.id !== id));
    }
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

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
  visualColumns.forEach((element) => {
    element.headerAlign = "center";
    element.align = "center";
  });
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <div
          className="md:w-[570px] lg:w-[650px]  xlg:w-[770px] 2xl:w-[900px] flex items-center justify-center min-h-[200px]"
          dir={dir}
        >
          <DataGridPro
            rows={visualRows}
            columns={visualColumns}
            pagination={pagination}
            hideFooter={!pagination}
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
              pagination: { paginationModel: { pageSize: 5 } },
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            slotProps={{
              columnsManagement: {
                disableShowHideToggle: true,
                disableResetButton: true,
              },
            }}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={handleRowModesModelChange}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
          />
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
}

DataTableEditRowWithoutDelete.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array,
  updateFunction: PropTypes.func,
  deleteFunction: PropTypes.func,
  pagination: PropTypes.bool,
  requestColumns: PropTypes.bool,
  link: PropTypes.string,
  dir: PropTypes.string,
  lastColumn: PropTypes.object,
};

export default DataTableEditRowWithoutDelete;
