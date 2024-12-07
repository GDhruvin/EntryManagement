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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  InputAdornment,
  Divider,
} from "@mui/material";
import Swal from "sweetalert2";
import { swalLoader } from "@/lib/utils";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import Cookies from "js-cookie";
import {
  addClient_API,
  deleteClient_API,
  getClient_API,
  logout_API,
  updateClient_API,
} from "@/lib/define";

const clientSchema = yup
  .object({
    name: yup.string().required("Name is required"),
    mobile: yup
      .string()
      .required("Mobile is required")
      .matches(/^\d{10}$/, "Invalid mobile number"),
    email: yup.string().email("Invalid email").required("Email is required"),
  })
  .required();

export default function Home() {
  const router = useRouter();
  const [clients, setClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const cookieData = Cookies.get("authData");
  const userId = cookieData ? JSON.parse(cookieData)?.id : null;
  const token = cookieData ? JSON.parse(cookieData)?.token : null;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
    },
  });

  const filteredClients = clients.filter((client) => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchTerms) ||
      client.mobile.toLowerCase().includes(searchTerms) ||
      client.email.toLowerCase().includes(searchTerms)
    );
  });

  const fetchClients = async () => {
    Swal.fire(swalLoader);
    await axios({
      method: "GET",
      url: getClient_API,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response, xhr) => {
        if (response.status === 200) {
          Swal.close();
          const clientList = response.data.clients;
          setClients(clientList);
        } else {
          Swal.close();
          setClients([]);
        }
      })
      .catch((_error) => {
        Swal.close();
        setClients([]);
      });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (data) => {
    const mainData = {
      name: data.name,
      mobileNumber: data.mobile,
      email: data.email,
      createdBy: userId,
    };
    Swal.fire(swalLoader);
    axios({
      method: "POST",
      url: addClient_API,
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
            fetchClients();
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(swalLoader);
        axios({
          method: "DELETE",
          url: deleteClient_API,
          data: { id },
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
                fetchClients();
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

  const handleClose = () => {
    setShowModal(false);
    reset();
  };

  const handleUpdate = (client) => {
    setEditingClient(client);
    setShowModal(true);
    setValue("name", client.name);
    setValue("mobile", client.mobileNumber);
    setValue("email", client.email);
  };

  const onUpdateSubmit = async (data) => {
    const mainData = {
      id: editingClient._id,
      name: data.name,
      mobileNumber: data.mobile,
      email: data.email,
    };
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update this client?",
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
          url: updateClient_API,
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
                fetchClients();
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

  const handleLogout = async () => {
    Swal.fire(swalLoader);
    axios({
      method: "POST",
      url: logout_API,
    })
      .then((response, xhr) => {
        if (response.status === 200) {
          Swal.close();
          Swal.fire({
            title: "Done!",
            text: response.data.message,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false,
          }).then((result) => {
            if (
              result.dismiss === Swal.DismissReason.timer ||
              result.isConfirmed
            ) {
              window.location.href = "/login";
            }
          });
        } else {
          Swal.close();
          Swal.fire({
            icon: "info",
            text: response.data.message,
          });
        }
      })
      .catch((_error) => {
        Swal.close();
        if (_error.response) {
          Swal.fire({
            icon: "error",
            text: _error.response.data.message,
          });
        } else {
          Swal.fire({
            icon: "error",
            text: "Internal Server Error",
          });
        }
      });
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
            <PersonAddIcon className="mr-2" sx={{ fontSize: "2rem" }} />
            {editingClient ? "Edit Client" : "Add Client"}
          </Typography>
        </DialogTitle>
        <form
          onSubmit={handleSubmit(editingClient ? onUpdateSubmit : onSubmit)}
        >
          <DialogContent sx={{ backgroundColor: "#3c4453" }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name ? errors.name.message : ""}
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
                />
              )}
            />

            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile"
                  fullWidth
                  error={!!errors.mobile}
                  helperText={errors.mobile ? errors.mobile.message : ""}
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
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email ? errors.email.message : ""}
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
                />
              )}
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
        <Typography variant="h4" sx={{ color: "#FBBF24" }}>
          Client Management
        </Typography>
        <Button
          onClick={handleLogout}
          sx={{
            bgcolor: "error.main",
            color: "white",
            px: 2,
            py: 1,
            "&:hover": { bgcolor: "error.dark" },
          }}
        >
          Logout
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
          placeholder="Search by name, mobile, or email..."
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
          Add Client
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
              {["Name", "Mobile", "Email", "Actions"].map((header) => (
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
            {filteredClients.map((client) => (
              <TableRow key={client._id}>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {client.name}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {client.mobileNumber}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#E2E8F0",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  {client.email}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center", verticalAlign: "middle" }}
                >
                  <Button
                    onClick={() => {
                      handleUpdate(client);
                    }}
                    sx={{
                      bgcolor: "blue.500",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      mr: 1,
                      "&:hover": { bgcolor: "blue.600" },
                    }}
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => handleDelete(client._id)}
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      px: 1,
                      py: 0.5,
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
