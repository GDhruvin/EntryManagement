"use client"; // Mark this component as a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  InputAdornment,
  Divider,
  MenuItem,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  IconButton,
  Tooltip,
  Select,
} from "@mui/material";
import Swal from "sweetalert2";
import { swalLoader } from "@/lib/utils";
import SearchIcon from "@mui/icons-material/Search";
import Cookies from "js-cookie";
import {
  addClothType_API,
  addEntry_API,
  getClothTypeList_API,
  getEntry_API,
  updateClient_API,
  updateEntry_API,
  updateEntryStatus_API,
} from "@/lib/define";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import moment from "moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";

const defaultValues = {
  clothType: "",
  totalMeter: "",
  pricePerMeter: "",
};

const clientSchema = yup
  .object({
    clothType: yup.string().required("Cloth Type is required"),
    totalMeter: yup.string().required("Total Meter is required"),
    pricePerMeter: yup.string().required("Price Per Meter is required"),
  })
  .required();

const DetailsPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const params = new URLSearchParams(search);
  const id = params.get("id");
  const name = params.get("name");
  const email = params.get("email");
  const mobileNumber = params.get("mobileNumber");

  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const cookieData = Cookies.get("authData");
  const userId = cookieData ? JSON.parse(cookieData)?.id : null;
  const token = cookieData ? JSON.parse(cookieData)?.token : null;
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("DD-MM-YYYY")
  );
  const [showCustomClothType, setShowCustomClothType] = useState(false);
  const [customClothType, setCustomClothType] = useState("");
  const [clothTypeList, setClothTypeList] = useState([]);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues,
  });

  const watchTotalmeter = watch("totalMeter");
  const watchPricepermeter = watch("pricePerMeter");

  const filteredEntries = entries.filter((client) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      client.clothType.toLowerCase().includes(searchTerms) ||
      client.dueDate.toLowerCase().includes(searchTerms) ||
      client.status.toLowerCase().includes(searchTerms)
    );
  });

  const fetchEntry = async () => {
    Swal.fire(swalLoader);
    await axios({
      method: "GET",
      url: getEntry_API + id,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response, xhr) => {
        if (response.status === 200) {
          Swal.close();
          const entrylist = response.data.entries;
          setEntries(entrylist);
        } else {
          Swal.close();
          setEntries([]);
        }
      })
      .catch((_error) => {
        Swal.close();
        setEntries([]);
      });
  };

  const fetchClothType = async () => {
    Swal.fire(swalLoader);
    await axios({
      method: "GET",
      url: getClothTypeList_API,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response, xhr) => {
        if (response.status === 200) {
          Swal.close();
          const clothtypelist = response.data.clothtypes;
          setClothTypeList(clothtypelist);
        } else {
          Swal.close();
          setClothTypeList([]);
        }
      })
      .catch((_error) => {
        Swal.close();
        setClothTypeList([]);
      });
  };

  useEffect(() => {
    if (id !== null) {
      fetchEntry();
      fetchClothType();
    }
  }, [id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearch(window.location.search);
    }
  }, []);

  useEffect(() => {
    if (watchTotalmeter === "" || watchPricepermeter === "") {
      setTotalAmount(0);
    } else {
      setTotalAmount(watchTotalmeter * watchPricepermeter);
    }
  }, [watchTotalmeter, watchPricepermeter]);

  const onSubmit = async (data) => {
    const mainData = {
      clothType: data.clothType,
      totalMeter: data.totalMeter,
      pricePerMeter: data.pricePerMeter,
      totalAmount: totalAmount,
      dueDate: selectedDate,
      clientId: id,
      createdBy: userId,
      status: "pending",
    };
    Swal.fire(swalLoader);
    axios({
      method: "POST",
      url: addEntry_API,
      data: mainData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response, xhr) => {
        if (response.status === 200) {
          Swal.close();
          Swal.fire({
            icon: "success",
            title: "Success",
            text: response.data.message,
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          }).then(() => {
            fetchEntry();
            handleClose();
          });
        }
      })
      .catch((_error) => {
        if (_error.response) {
          Swal.close();
          Swal.fire({
            icon: "info",
            title: _error.response.data.message,
            allowOutsideClick: false,
          });
        } else {
          Swal.close();
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Internal Server Error",
            allowOutsideClick: false,
          });
        }
      });
  };

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const onUpdateSubmit = async (data) => {
    console.log("data", data);

    const mainData = {
      entryId: editingClient._id,
      clothType: data.clothType,
      totalMeter: data.totalMeter,
      pricePerMeter: data.pricePerMeter,
      totalAmount: totalAmount,
    };
    console.log(mainData);

    Swal.fire({
      title: "Are you sure?",
      text: "You want to update this Entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(swalLoader);
        axios({
          method: "PUT",
          url: updateEntry_API,
          data: mainData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response, xhr) => {
            if (response.status === 200) {
              Swal.close();
              Swal.fire({
                icon: "success",
                title: "Success",
                text: response.data.message,
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
              }).then(() => {
                fetchEntry();
                handleClose();
                setEditingClient(null);
              });
            }
          })
          .catch((_error) => {
            if (_error.response) {
              Swal.close();
              Swal.fire({
                icon: "info",
                title: _error.response.data.message,
                allowOutsideClick: false,
              });
            } else {
              Swal.close();
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Internal Server Error",
                allowOutsideClick: false,
              });
            }
          });
      }
    });
  };

  function getStatusDetails(status) {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "#C36241" };
      case "done":
        return { label: "Done", color: "#9ddb9d" };
      case "expire":
        return { label: "Expire", color: "#fb6363" };
    }
  }

  const handleBack = () => {
    router.push("/");
  };

  const handleChangeDate = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      setSelectedDate(newValue.format("DD-MM-YYYY"));
    }
  };

  const handleAddCustomClothType = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to add new cloth type?",
      icon: "warning",
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Add it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(swalLoader);
        axios({
          method: "POST",
          url: addClothType_API,
          data: {
            clothType: customClothType,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response, xhr) => {
            if (response.status === 200) {
              Swal.close();
              Swal.fire({
                icon: "success",
                title: "Success",
                text: response.data.message,
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
              }).then(() => {
                setShowCustomClothType(false);
                fetchClothType();
              });
            }
          })
          .catch((_error) => {
            if (_error.response) {
              Swal.close();
              Swal.fire({
                icon: "info",
                title: _error.response.data.message,
                allowOutsideClick: false,
              });
            } else {
              Swal.close();
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Internal Server Error",
                allowOutsideClick: false,
              });
            }
          });
      }
    });
  };

  const handleCancelCustomClothType = () => {
    setCustomClothType("");
    setShowCustomClothType(false);
  };

  const handleStatusChange = (id, status) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update this entry status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Update it!",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(swalLoader);
        axios({
          method: "PUT",
          url: updateEntryStatus_API,
          data: {
            entryId: id,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((response, xhr) => {
            if (response.status === 200) {
              Swal.close();
              Swal.fire({
                icon: "success",
                title: "Success",
                text: response.data.message,
                timer: 2000,
                showConfirmButton: false,
                allowOutsideClick: false,
              }).then(() => {
                fetchEntry();
              });
            }
          })
          .catch((_error) => {
            if (_error.response) {
              Swal.close();
              Swal.fire({
                icon: "info",
                title: _error.response.data.message,
                allowOutsideClick: false,
              });
            } else {
              Swal.close();
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Internal Server Error",
                allowOutsideClick: false,
              });
            }
          });
      }
    });
  };

  const handleUpdate = (entry) => {
    setEditingClient(entry);
    setShowModal(true);
    setValue("clothType", entry.clothType);
    setValue("totalMeter", entry.totalMeter);
    setValue("pricePerMeter", entry.pricePerMeter);
    setSelectedDate(entry.dueDate);
    setTotalAmount(entry.totalAmount);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#1A202C",
        padding: "16px",
      }}
    >
      <Dialog open={showModal}>
        <DialogTitle
          sx={{
            color: "#FBBF24",
            backgroundColor: "#3c4453",
          }}
        >
          <Typography
            className="text-yellow-500 mb-6 flex items-center"
            style={{ fontSize: "2rem" }}
          >
            Add Entry
          </Typography>
        </DialogTitle>
        <form
          onSubmit={handleSubmit(editingClient ? onUpdateSubmit : onSubmit)}
        >
          <DialogContent sx={{ backgroundColor: "#3c4453" }}>
            {/* Dropdown selection */}
            <Controller
              name="clothType"
              control={control}
              render={({ field }) => (
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <TextField
                    {...field}
                    label="Cloth Type"
                    select
                    fullWidth
                    error={!!errors.clothType}
                    helperText={
                      errors.clothType ? errors.clothType.message : ""
                    }
                    sx={{
                      mr: 1,
                      "& .MuiInputBase-root": {
                        color: "#FBBF24",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#FBBF24",
                        },
                        "&:hover fieldset": {
                          borderColor: "#FBBF24",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#FBBF24",
                        },
                      },
                      "& .MuiFormLabel-root": {
                        color: "#FBBF24",
                      },
                      "& .MuiFormLabel-root.Mui-focused": {
                        color: "#FBBF24",
                      },
                    }}
                    InputProps={{
                      style: {
                        color: "#FBBF24",
                      },
                    }}
                  >
                    {clothTypeList.map((clothType) => (
                      <MenuItem key={clothType._id} value={clothType.clothType}>
                        {clothType.clothType}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Tooltip title="Add Custom Cloth Type">
                    <Button
                      sx={{
                        color: "#ffff",
                        border: "1px solid #ffff",
                      }}
                      onClick={() => setShowCustomClothType(true)}
                    >
                      <AddIcon />
                    </Button>
                  </Tooltip>
                </Box>
              )}
            />
            {showCustomClothType && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TextField
                  label="Custom Cloth Type"
                  fullWidth
                  value={customClothType}
                  onChange={(e) => setCustomClothType(e.target.value)}
                  sx={{
                    mr: 1,
                    "& .MuiInputBase-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&:hover fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FBBF24",
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiFormLabel-root.Mui-focused": {
                      color: "#FBBF24",
                    },
                  }}
                  InputProps={{
                    style: {
                      color: "#FBBF24",
                    },
                  }}
                />
                <IconButton
                  onClick={handleAddCustomClothType}
                  sx={{
                    color: "#9ddb9d",
                  }}
                  size="medium"
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  onClick={handleCancelCustomClothType}
                  sx={{
                    color: "#fb6363",
                  }}
                  size="medium"
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            )}

            {/* Total meter of cloths */}
            <Controller
              name="totalMeter"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Meter"
                  type="number"
                  fullWidth
                  error={!!errors.totalMeter}
                  helperText={
                    errors.totalMeter ? errors.totalMeter.message : ""
                  }
                  sx={{
                    mb: 2,
                    "& .MuiInputBase-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&:hover fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FBBF24",
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiFormLabel-root.Mui-focused": {
                      color: "#FBBF24",
                    },
                  }}
                  InputProps={{
                    style: {
                      color: "#FBBF24",
                    },
                  }}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                />
              )}
            />

            {/* Price per meter */}
            <Controller
              name="pricePerMeter"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price per Meter"
                  type="number"
                  fullWidth
                  error={!!errors.pricePerMeter}
                  helperText={
                    errors.pricePerMeter ? errors.pricePerMeter.message : ""
                  }
                  sx={{
                    mb: 2,
                    "& .MuiInputBase-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&:hover fieldset": {
                        borderColor: "#FBBF24",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FBBF24",
                      },
                    },
                    "& .MuiFormLabel-root": {
                      color: "#FBBF24",
                    },
                    "& .MuiFormLabel-root.Mui-focused": {
                      color: "#FBBF24",
                    },
                  }}
                  InputProps={{
                    style: {
                      color: "#FBBF24",
                    },
                  }}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    field.onChange(value);
                  }}
                />
              )}
            />

            {/* Payment due date */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                inputFormat="DD-MM-YYYY" // Correct input format
                mask="____-__-__"
                value={dayjs(selectedDate, "DD-MM-YYYY")} // Convert selectedDate to dayjs object
                onChange={handleChangeDate}
                renderInput={(params) => (
                  <TextField className="datepickerCommon" {...params} />
                )}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    color: "#FBBF24",
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "#FBBF24",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FBBF24",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FBBF24",
                    },
                  },
                  "& .MuiFormLabel-root": {
                    color: "#FBBF24",
                  },
                  "& .MuiFormLabel-root.Mui-focused": {
                    color: "#FBBF24",
                  },
                }}
                InputProps={{
                  style: {
                    color: "#FBBF24",
                  },
                }}
                inputProps={{ readOnly: true }}
              />
            </LocalizationProvider>

            {/* Total amount calculation */}
            <TextField
              label="Total Amount"
              value={totalAmount}
              fullWidth
              InputProps={{
                readOnly: true,
                style: {
                  color: "#FBBF24",
                },
              }}
              sx={{
                mb: 2,
                "& .MuiInputBase-root": {
                  color: "#FBBF24",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#FBBF24",
                  },
                  "&:hover fieldset": {
                    borderColor: "#FBBF24",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FBBF24",
                  },
                },
                "& .MuiFormLabel-root": {
                  color: "#FBBF24",
                },
                "& .MuiFormLabel-root.Mui-focused": {
                  color: "#FBBF24",
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ backgroundColor: "#3c4453" }}>
            <Button
              onClick={handleClose}
              sx={{
                bgcolor: "error.main",
                color: "white",
                px: 2,
                py: 1,
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Cancel
            </Button>
            <Button type="submit" sx={{ bgcolor: "#FBBF24", color: "black" }}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <Typography variant="h4" sx={{ color: "#FBBF24" }}></Typography>
        <Typography variant="h4" sx={{ color: "#FBBF24" }}>
          {name}
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{
            bgcolor: "error.main",
            color: "white",
            px: 2,
            py: 1,
            "&:hover": { bgcolor: "error.dark" },
          }}
        >
          Back
        </Button>
      </div>
      <Divider
        sx={{ color: "#FBBF24", border: "1px solid", marginBottom: "10px" }}
      />

      <Box
        sx={{
          display: "flex",
          mb: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by cloth type, status, or due date ..."
          size="small"
          sx={{
            width: "50%",
            "& .MuiInputBase-root": {
              color: "#FBBF24",
              bgcolor: "#2D3748",
              borderRadius: "30px",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#FBBF24",
              },
              "&:hover fieldset": {
                borderColor: "#FBBF24",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#FBBF24",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#FBBF24" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          onClick={() => {
            setEditingClient(null);
            setShowModal(true);
          }}
          variant="contained"
          sx={{
            bgcolor: "#FBBF24",
            color: "black",
            px: 2,
            py: 1,
            "&:hover": { bgcolor: "#D69E2E" },
          }}
        >
          Add Entery
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          bgcolor: "#2D3748",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "70vh", // Control the height of the scrollable area
          overflowY: "auto", // Enable vertical scrolling
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          {/* Sticky Table Header */}
          <TableHead>
            <TableRow>
              {[
                "Cloth Type",
                "Total Meter",
                "Price Per Meter",
                "Total Amount",
                "Due Date",
                "Status",
                "Payment Status",
                "Entry Date",
                "Action",
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    bgcolor: "#1A202C",
                    color: "#FBBF24",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Scrollable Table Body */}
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry._id}>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {entry.clothType}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {entry.totalMeter}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {entry.pricePerMeter}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {entry.totalAmount}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {entry.dueDate}
                </TableCell>
                <TableCell
                  sx={{
                    color: getStatusDetails(entry.status).color,
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {getStatusDetails(entry.status).label}
                </TableCell>
                <TableCell
                  sx={{
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <Select
                    value={
                      entry.status === "done" ? "Received" : "Not Received"
                    }
                    disabled={entry.status === "done"}
                    style={{ width: "180px" }}
                    onChange={(e) =>
                      handleStatusChange(entry._id, e.target.value)
                    }
                    sx={{
                      color: "#E2E8F0",
                      borderRadius: "4px",
                    }}
                  >
                    <MenuItem value="Not Received">Not Received</MenuItem>
                    <MenuItem value="Received">Received</MenuItem>
                  </Select>
                </TableCell>

                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {moment(entry.createdAt).format("DD-MM-YYYY")}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", verticalAlign: "middle" }}
                >
                  <IconButton
                    sx={{
                      color: "white",
                    }}
                    onClick={() => {
                      handleUpdate(entry);
                    }}
                    aria-label="delete"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DetailsPage;
