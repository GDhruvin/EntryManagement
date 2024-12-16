import Swal from "sweetalert2";
import { addClothType_API } from "./define";
import axios from "axios";

export const swalLoader = {
  title: "Loading...",
  allowOutsideClick: false,
  didOpen: () => Swal.showLoading(),
};

export const addClothtypeAPI = (clothtype, token) => {
 
};
