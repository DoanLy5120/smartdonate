import api from "./authService";

// tạo ủng hộ
export const donate = async (data) => {
  const res = await api.post("/donate", data);
  return res.data;
};
