import api from "./authService";

// ===== USERS =====
// params: { page, per_page, search, role, status }
export const getAdminUsers = async (params = {}) => {
  const res = await api.get("/admin/users", { params });
  return res.data;
};

export const lockUser = async (id) => {
  const res = await api.post(`/admin/users/${id}/lock`);
  return res.data;
};

export const unlockUser = async (id) => {
  const res = await api.post(`/admin/users/${id}/unlock`);
  return res.data;
};

// ===== ORGANIZATIONS =====
export const getAdminOrganizations = async (params = {}) => {
  const res = await api.get("/admin/organizations", { params });
  return res.data;
};

export const getAdminOrganizationDetail = async (id) => {
  const res = await api.get(`/admin/organizations/${id}`);
  return res.data;
};

// Lấy hồ sơ xác minh TC đang chờ duyệt (giấy phép, mã số thuế, người đại diện...)
export const getPendingOrgLicense = async (userId) => {
  const res = await api.get(`/admin/users/organizations/pending/${userId}`);
  return res.data;
};

export const approveOrganization = async (id) => {
  const res = await api.post(`/admin/organization/${id}/approve`);
  return res.data;
};

// BE bắt buộc ly_do khi reject tổ chức
export const rejectOrganization = async (id, ly_do) => {
  const res = await api.post(`/admin/organization/${id}/reject`, { ly_do });
  return res.data;
};

// ===== FUND ACCOUNTS =====
export const lockFundAccount = async (id) => {
  const res = await api.post(`/admin/fund-accounts/${id}/lock`);
  return res.data;
};

// ===== POSTS =====
// params: { page, per_page, search, loai_bai }
export const getAdminPosts = async (params = {}) => {
  const res = await api.get("/admin/posts", { params });
  return res.data;
};

export const getAdminPostDetail = async (id) => {
  const res = await api.get(`/admin/posts/${id}`);
  return res.data;
};

// ===== POST REPORTS =====
export const getAdminPostReports = async (params = { limit: 100 }) => {
  const res = await api.get("/admin/post-reports", { params });
  return res.data;
};

// trang_thai: CHO_XU_LY | DA_XU_LY | TU_CHOI
export const updateAdminPostReport = (id, data) =>
  api.post(`/admin/post-reports/${id}`, data);

// ===== CAMPAIGNS =====
// params: { page, per_page, keyword, trang_thai, danh_muc_id }
export const getAdminCampaigns = async (params = {}) => {
  const res = await api.get("/admin/campaigns", { params });
  return res.data;
};

export const getAdminCampaignDetail = async (id) => {
  const res = await api.get(`/admin/campaigns/${id}`);
  return res.data;
};

export const approveCampaign = async (id) => {
  const res = await api.post(`/admin/campaigns/${id}/approve`);
  return res.data;
};

export const rejectCampaign = async (id) => {
  const res = await api.post(`/admin/campaigns/${id}/reject`);
  return res.data;
};

// Tạm dừng chiến dịch (BE: POST /admin/campaigns/{id}/suspend, body { ly_do })
export const suspendCampaign = async (id, ly_do = "") => {
  const res = await api.post(`/admin/campaigns/${id}/suspend`, { ly_do });
  return res.data;
};

// Tạm dừng bài đăng (BE: POST /admin/posts/{id}/suspend, body { ly_do })
export const suspendPost = async (id, ly_do = "") => {
  const res = await api.post(`/admin/posts/${id}/suspend`, { ly_do });
  return res.data;
};

// Danh sách vi phạm 1 chiến dịch (cho modal)
export const getCampaignViolations = async (
  id,
  params = { trang_thai: "CHO_XU_LY", limit: 100 },
) => {
  const res = await api.get(`/admin/campaigns/${id}/violations`, { params });
  return res.data;
};

// Danh sách vi phạm 1 bài đăng (cho modal)
export const getPostViolations = async (
  id,
  params = { trang_thai: "CHO_XU_LY", limit: 100 },
) => {
  const res = await api.get(`/admin/posts/${id}/violations`, { params });
  return res.data;
};

// ===== FRAUD =====
export const getFraudAlerts = async () => {
  const res = await api.get("/admin/fraud-alerts");
  return res.data;
};

export const updateFraudAlert = async (id, data) => {
  const res = await api.post(`/admin/fraud-alerts/${id}`, data);
  return res.data;
};

export const autoCheckFraud = async () => {
  const res = await api.post("/admin/fraud-check/auto");
  return res.data;
};

export const autoCheckCampaignsFraud = async () => {
  const res = await api.post("/admin/fraud-check/campaigns/auto");
  return res.data;
};

// ===== DASHBOARD =====
export const getDashboardSummary = async () => {
  const res = await api.get("/admin/dashboard/summary");
  return res.data;
};

export const getDashboardFeatured = async () => {
  const res = await api.get("/admin/dashboard/featured-campaigns");
  return res.data;
};

export const getDashboardFundraising = async () => {
  const res = await api.get("/admin/dashboard/fundraising-by-month");
  return res.data;
};

export const getDashboardActivities = async () => {
  const res = await api.get("/admin/dashboard/recent-activities");
  return res.data;
};
// ===== VIOLATION REASONS =====
// GET /admin/violation-reasons — danh sách lý do vi phạm chuẩn từ BE
export const getViolationReasons = async () => {
  const res = await api.get("/admin/violation-reasons");
  return res.data;
};

// ===== WITHDRAW REQUESTS (Admin) =====
// GET /admin/withdraw-requests?trang_thai=CHO_DUYET — danh sách yêu cầu rút
export const getAdminWithdrawRequests = async (trang_thai) => {
  const params = trang_thai ? { trang_thai } : {};
  const res = await api.get("/admin/withdraw-requests", { params });
  return res.data;
};

// PUT /admin/withdraw-requests/{id}/confirm — xác nhận giao dịch
export const confirmWithdrawRequest = async (id, body) => {
  const res = await api.put(`/admin/withdraw-requests/${id}/confirm`, body);
  return res.data;
};

// PUT /admin/withdraw-requests/{id}/reject — từ chối yêu cầu
export const rejectWithdrawRequest = async (id, body) => {
  const res = await api.put(`/admin/withdraw-requests/${id}/reject`, body);
  return res.data;
};
