import React, { useState } from "react";
import PropTypes from "prop-types";
import { DataGrid } from "@mui/x-data-grid";
import { Box, IconButton, TextField } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import currencyFormatting from "../../util/currencyFormatting";

const BranchSelectedProductsTable = ({
  columns,
  rows,
  updateFunction,
  deleteFunction,
  dir = "rtl",
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEditClick = (id) => {
    const row = rows.find((r) => r.id === id);
    setEditingId(id);
    setEditData({
      sendQuantity: row.sendQuantity || 0,
    });
  };

  const handleSaveClick = (id) => {
    const updatedRow = rows.find((r) => r.id === id);
    const updatedData = {
      ...updatedRow,
      ...editData,
    };
    console.log(
      "BranchSelectedProductsTable: Saving updated data:",
      updatedData
    );
    console.log("BranchSelectedProductsTable: Previous row data:", updatedRow);
    console.log("BranchSelectedProductsTable: Edit data:", editData);

    updateFunction(updatedData);
    setEditingId(null);
    setEditData({});
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDeleteClick = (id) => {
    deleteFunction(id);
  };

  const handleInputChange = (field, value) => {
    console.log(
      "BranchSelectedProductsTable: Input change - field:",
      field,
      "value:",
      value
    );
    setEditData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      console.log("BranchSelectedProductsTable: Updated editData:", newData);
      return newData;
    });
  };

  // Define columns for branch selected products
  const branchColumns = [
    { field: "id", headerName: "ID", width: 50 },
    {
      field: "profilePhoto",
      headerName: "",
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center items-center h-full">
          <img
            src={params.row.profilePhoto}
            alt="profile"
            width={60}
            height={60}
            className="rounded-[50%] border-2 border-primary"
          />
        </div>
      ),
    },
    {
      field: "productName",
      headerName: "اسم المنتج",
      width: 150,
    },
    {
      field: "sku",
      headerName: "المعرف",
      width: 150,
    },
    {
      field: "type",
      headerName: "النوع",
      flex: 1,
    },
    {
      field: "wholesalePrice",
      headerName: "سعر التكلفة",
      width: 150,
    },
    {
      field: "sellingPrice",
      headerName: "سعر المبيع",
      width: 150,
    },
    {
      field: "totalQuantity",
      headerName: "الكمية المتوفرة",
      width: 150,
    },
    {
      field: "sendQuantity",
      headerName: "الكمية المراد إرسالها",
      width: 150,
      renderCell: (params) => {
        if (editingId === params.row.id) {
          console.log(
            "BranchSelectedProductsTable: Rendering TextField for row:",
            params.row.id,
            "editData:",
            editData
          );
          return (
            <TextField
              type="number"
              value={editData.sendQuantity || 0}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                console.log(
                  "BranchSelectedProductsTable: TextField onChange - value:",
                  value
                );
                handleInputChange("sendQuantity", value);
              }}
              size="small"
              inputProps={{ min: 0, max: params.row.totalQuantity }}
              sx={{ width: "80px" }}
            />
          );
        }
        return params.row.sendQuantity || 0;
      },
    },
    {
      field: "actions",
      headerName: "الإجراءات",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        if (editingId === params.row.id) {
          return (
            <div className="flex gap-1">
              <IconButton
                size="small"
                onClick={() => handleSaveClick(params.row.id)}
                sx={{ color: "green" }}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancelClick}
                sx={{ color: "orange" }}
              >
                <CancelIcon />
              </IconButton>
            </div>
          );
        }
        return (
          <div className="flex gap-1">
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row.id)}
              sx={{ color: "blue" }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.id)}
              sx={{ color: "red" }}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        );
      },
    },
  ];

  console.log("BranchSelectedProductsTable: Rendering with rows:", rows);
  console.log(
    "BranchSelectedProductsTable: Checking for missing IDs:",
    rows.filter((row) => !row.id)
  );

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={branchColumns}
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        disableSelectionOnClick
        getRowId={(row) => {
          console.log("getRowId called with row:", row);
          if (!row.id) {
            console.error("Row missing ID:", row);
          }
          return row.id || `temp-${Math.random()}`;
        }}
        sx={{
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e0e0e0",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f5f5f5",
            borderBottom: "2px solid #e0e0e0",
          },
          direction: dir,
        }}
      />
    </Box>
  );
};

BranchSelectedProductsTable.propTypes = {
  columns: PropTypes.array,
  rows: PropTypes.array.isRequired,
  updateFunction: PropTypes.func.isRequired,
  deleteFunction: PropTypes.func.isRequired,
  dir: PropTypes.string,
};

export default BranchSelectedProductsTable;
