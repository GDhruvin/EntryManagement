import Swal from "sweetalert2";

export const swalLoader = {
  title: "Loading...",
  allowOutsideClick: false,
  didOpen: () => Swal.showLoading(),
};
