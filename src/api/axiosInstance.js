import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8181/v1/api", // Base URL for all requests
  headers: {
    "Content-type": "application/json", // Default headers
  },
  timeout: 10000, // Timeout after 10 seconds
  withCredentials: true, // Allow sending cookies when cross-origin requests
});

// Function to add token to request header
const addTokenToRequest = (config) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add Authorization header with Bearer token
  }
  return config;
};

// Interceptor to add token to each request
http.interceptors.request.use(addTokenToRequest);

// Interceptor to handle response errors from server
http.interceptors.response.use(
  (response) => {
    // Handle successful responses before returning data
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Handle HTTP errors (status code other than 2xx)
      // console.error("Response error:", error.response.data);

      throw error.response.data;
    } else if (error.request) {
      // Handle when no response received from server
      console.error("Request error:", error.request);
    } else {
      // Handle errors during request sending
      console.error("Error:", error.message);
    }
    return Promise.reject(error); // Let the next interceptor handle it
  }
);

// Function to refresh token
const refreshToken = () => {
  // Implement logic here to fetch a new token from the server
  // return http.post('/refresh-token', { refreshToken });
};

const HTTP = {
  get: (url, config = {}) => http.get(url, config),
  post: (url, data, config = {}) => http.post(url, data, config),
  put: (url, data, config = {}) => http.put(url, data, config),
  delete: (url, config = {}) => http.delete(url, config),
};

export default HTTP;
