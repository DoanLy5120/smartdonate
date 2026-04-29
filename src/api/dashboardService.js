import api from "./authService";

export const getDashboardSummary = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getDashboardFinancial = async (type = "thang") => {
  const res = await api.get(`/dashboard/financial-summary?type=${type}`);
  return res.data;
};

export const getDashboardMonthly = async () => {
  const res = await api.get("/dashboard/monthly-statistics");
  return res.data;
};

export const getDashboardActiveCampaigns = async () => {
  const res = await api.get("/dashboard/active-campaigns");
  return res.data;
};

export const getDashboardOtherCampaigns = async () => {
  const res = await api.get("/campaigns/others");
  return res.data;
};

export const getDashboardRecentActivities = async () => {
  const res = await api.get("/dashboard/recent-activities");
  return res.data;
};