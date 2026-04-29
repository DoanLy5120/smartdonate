import api from "./authService";

// Danh sách campaign — nhận mọi params: keyword, danh_muc_id, sort, page
export const getCampaigns = async (params = {}) => {
  const res = await api.get(`/campaigns`, { params });
  return res.data;
};

// Campaign nổi bật
export const getFeaturedCampaigns = async () => {
  const res = await api.get(`/campaigns/featured`);
  return res.data;
};

// Chi tiết campaign (public)
export const getCampaignDetail = async (id, params = {}) => {
  const res = await api.get(`/campaigns/${id}`, { params });
  return res.data;
};

// Danh mục
export const getCategories = async () => {
  const res = await api.get(`/categories`);
  return res.data;
};

// Sắp kết thúc
export const getEndingCampaigns = async () => {
  const res = await api.get("/campaigns/ending-soon");
  return res.data;
};

// Tạo chiến dịch — gửi FormData vì có file ảnh
export const createCampaign = async (formData) => {
  const res = await api.post("/campaigns", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─────────── EDIT CAMPAIGN ───────────

// GET /campaigns/update/{id} — lấy data đầy đủ để chỉnh sửa
// (BE trả về danh_muc_id, vi_tri, lat, lng, hinh_anh là URL array...)
export const getCampaignForEdit = async (id) => {
  const res = await api.get(`/campaigns/update/${id}`);
  return res.data;
};

// POST /campaigns/update/{id} — cập nhật chiến dịch (FormData với anh_cu, anh_moi, xoa_anh)
export const updateCampaign = async (id, formData) => {
  const res = await api.post(`/campaigns/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ─────────── EXPENSE / WITHDRAW ───────────

// GET /campaigns/{id}/withdraw-transactions — danh sách giao dịch RÚT của chiến dịch
export const getWithdrawTransactions = async (campaignId) => {
  const res = await api.get(`/campaigns/${campaignId}/withdraw-transactions`);
  return res.data;
};

// POST /campaigns/{id}/expenses — khai báo hoạt động chi quỹ
// payload: { giao_dich_quy_id, mo_ta?, chi_tiet: [{ten_hoat_dong, so_tien}, ...] }
export const createExpense = async (campaignId, payload) => {
  const res = await api.post(`/campaigns/${campaignId}/expenses`, payload);
  return res.data;
};
