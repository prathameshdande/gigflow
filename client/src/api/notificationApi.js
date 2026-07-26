import axios from "./axios";

export const getNotifications = async () => {
  const { data } = await axios.get("/notifications");
  return data;
};

export const markAsRead = async (id) => {
  const { data } = await axios.patch(`/notifications/${id}/read`);
  return data;
};

export const markAllAsRead = async () => {
  const { data } = await axios.patch("/notifications/read-all");
  return data;
};
