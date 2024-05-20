import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8080/v1/api",
  headers: {
    "Content-type": "application/json",
  },
});

const addTokenToRequest = (config) => {
  // const token = JSON.parse(localStorage.getItem("token"));
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

http.interceptors.request.use(addTokenToRequest);

export default http;
