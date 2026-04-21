import axiosClient from "./authService";

export const getNotificationsAPI = () => {
  return axiosClient.get("/notifications");
};

export const markAsReadAPI = (id) => {
  return axiosClient.patch(`/notifications/${id}/read`);
};

export const markAllAsReadAPI = () => {
  return axiosClient.patch("/notifications/read-all");
};