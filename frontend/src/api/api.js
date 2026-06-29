import axios from "axios";

const api = axios.create({
  baseURL: "https://reworkiq-backend.onrender.com/api",
});

export default api;