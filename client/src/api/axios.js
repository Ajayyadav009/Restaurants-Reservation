import axios from "axios";

const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL) {
    return envURL.endsWith("/api") ? envURL : `${envURL.replace(/\/$/, "")}/api`;
  }
  return "https://restaurants-reservation.onrender.com/api";
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("rrs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rrs_token");
      localStorage.removeItem("rrs_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
