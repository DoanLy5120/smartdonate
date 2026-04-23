import api from "./authService";

// tạo ủng hộ
export const donate = async (data) => {
  const res = await api.post("/donate", data);
  return res.data;
};

// lấy chi tiết ủng hộ
export const getDonateDetail = async (id) => {
  const res = await api.get(`/donate/${id}`);
  return res.data;
};