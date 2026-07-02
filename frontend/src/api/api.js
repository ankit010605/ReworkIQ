import axios from "axios";

const api = axios.create({
  baseURL: "https://reworkiq-backend.onrender.com/api",
});
// const api = axios.create({
//   baseURL: "http://127.0.0.1:5000/api",
// });


export default api;