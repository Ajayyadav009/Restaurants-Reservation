import API from "./axios";

export const getTables = (params) => API.get("/tables", { params });
export const getAllTablesAdmin = () => API.get("/admin/tables");
export const createTable = (data) => API.post("/admin/tables", data);
export const updateTable = (id, data) => API.patch(`/admin/tables/${id}`, data);
export const deactivateTable = (id) => API.delete(`/admin/tables/${id}`);
