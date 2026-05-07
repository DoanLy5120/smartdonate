import api from "./authService";

// GET /user/profile
export const getProfile = async () => {
  const res = await api.get("/user/profile");
  return res.data;
};

// POST /user/profile
export const updateProfile = async (formData) => {
  const res = await api.post("/user/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// POST /user/change-password
export const changePassword = async (data) => {
  const res = await api.post("/user/change-password", data);
  return res.data;
};

// POST /user/update-diachi
export const updateDiaChi = async (dia_chi) => {
  const res = await api.post("/user/update-diachi", { dia_chi });
  return res.data;
};

// GET /donate/history — BE trả { data: paginator }
export const getDonateHistory = async (page = 1, perPage = 6) => {
  const res = await api.get("/donate/history", {
    params: { page, per_page: perPage },
  });
  return res.data; // { data: { data: [...], next_page_url, ... } }
};

// GET /posts/me — BE trả { data: paginator }
export const getMyPosts = async (page = 1, perPage = 12) => {
  const res = await api.get("/posts/me", {
    params: { page, per_page: perPage },
  });
  return res.data; // { data: { data: [...], next_page_url, ... } }
};

// GET /campaigns/me — BE trả paginator trực tiếp (không bọc { data: })
export const getMyCampaigns = async (page = 1, perPage = 8) => {
  const res = await api.get("/campaigns/me", {
    params: { page, per_page: perPage },
  });
  return res.data; // { data: [...], next_page_url, ... }
};

// GET /profile/:id — xem profile người khác
export const getUserPublicProfile = async (id) => {
  const res = await api.get(`/profile/${id}`);
  return res.data;
};

// GET /organization/:id — lấy chi tiết tổ chức (có tong_thu, tong_chi)
export const getOrganizationDetail = async (id) => {
  const res = await api.get(`/organization/${id}`);
  return res.data;
};