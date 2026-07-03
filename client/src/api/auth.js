import API from "./axios";

export const register = (data) => API.post("/auth/register", data);
export const registerAdmin = (data) => API.post("/auth/register-admin", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");
export const logout = () => API.post("/auth/logout");
