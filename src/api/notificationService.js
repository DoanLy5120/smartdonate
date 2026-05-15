import axiosClient from "./authService";

export const getNotificationsAPI = () => {
  return axiosClient.get("/notifications");
};

export const markAsReadAPI = (id) => {
  return axiosClient.post(`/notifications/${id}/read`);
};

export const markAllAsReadAPI = () => {
  return axiosClient.post("/notifications/read-all");
};