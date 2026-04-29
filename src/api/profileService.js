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

// GET /donate/history
export const getDonateHistory = async () => {
  const res = await api.get("/donate/history");
  return res.data;
};

// GET /posts/me — bài đăng của chính mình (đúng route BE)
export const getMyPosts = async () => {
  const res = await api.get("/posts/me");
  return res.data;
};

// GET /campaigns/me — chiến dịch của tổ chức
export const getMyCampaigns = async () => {
  const res = await api.get("/campaigns/me");
  return res.data;
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