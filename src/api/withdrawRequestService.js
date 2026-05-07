import api from "./authService";

// GET /withdraw-requests — danh sách yêu cầu rút của tổ chức mình
export const getWithdrawRequests = async () => {
  const res = await api.get("/withdraw-requests");
  return res.data;
};

// POST /withdraw-requests — tạo yêu cầu rút tiền mới
export const createWithdrawRequest = async (body) => {
  const res = await api.post("/withdraw-requests", body);
  return res.data;
};

// GET /withdraw-requests/campaigns — danh sách chiến dịch có thể rút (HOAT_DONG, có số dư)
export const getWithdrawCampaigns = async () => {
  const res = await api.get("/withdraw-requests/campaigns");
  return res.data;
};