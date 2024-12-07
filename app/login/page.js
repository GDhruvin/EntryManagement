"use client"; // Mark this component as a Client Component

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation"; // Updated import
import { TextField, Button, Typography, InputAdornment } from "@mui/material"; // Import InputAdornment
import LockIcon from "@mui/icons-material/Lock"; // Import the Lock icon
import Swal from "sweetalert2"; // Import SweetAlert2
import { swalLoader } from "@/lib/utils";
import { login_API } from "@/lib/define";

const schema = yup
  .object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

export default function Login() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: "", // Set default value for username
      password: "", // Set default value for password
    },
  });

  const onSubmit = (data) => {
    Swal.fire(swalLoader);
    axios({
      method: "POST",
      url: login_API,
      data: data,
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
            router.push("/");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-12 rounded shadow-md w-96" // Increased width of the form (e.g., w-96)
      >
        <Typography
          variant="h4"
          className="text-yellow-500 mb-6 flex items-center"
          style={{ fontSize: "2rem" }}
        >
          <LockIcon className="mr-2" /> {/* Icon added here */}
          Login
        </Typography>

        <div className="mb-6">
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                fullWidth
                variant="outlined"
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ""}
                InputLabelProps={{ className: "text-yellow-500" }}
                InputProps={{
                  style: { height: "56px", color: "#FBBF24" },
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
            )}
          />
        </div>

        <div className="mb-6">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                error={!!errors.password}
                helperText={errors.password ? errors.password.message : ""}
                InputLabelProps={{ className: "text-yellow-500" }}
                InputProps={{
                  style: { height: "56px", color: "#FBBF24" },
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
            )}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          style={{
            height: "48px",
            backgroundColor: "rgb(234 179 8)",
            color: "black",
          }}
        >
          Login
        </Button>
      </form>
    </div>
  );
}
