import API from "./axios";

export const getTimeSlots = () => API.get("/reservations/slots");
export const getMyReservations = () => API.get("/reservations/my");
export const createReservation = (data) => API.post("/reservations", data);
export const cancelMyReservation = (id) => API.delete(`/reservations/${id}/cancel`);


export const getAllReservations = (params) => API.get("/admin/reservations", { params });
export const adminUpdateReservation = (id, data) => API.patch(`/admin/reservations/${id}`, data);
export const adminCancelReservation = (id) => API.delete(`/admin/reservations/${id}/cancel`);
