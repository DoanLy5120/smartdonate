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

// Chi tiết campaign
export const getCampaignDetail = async (id, params = {}) => {
  const res = await api.get(`/campaigns/${id}`, { params });
  return res.data;
};

// Danh mục
export const getCategories = async () => {
  const res = await api.get(`/categories`);
  return res.data;
};

//sắp kết thúc
export const getEndingCampaigns = async () => {
  const res = await api.get("/campaigns/ending-soon");
  return res.data; 
};

// Tạo chiến dịch — gửi FormData vì có file ảnh
export const createCampaign = async (formData) => {
  const res = await api.post("/campaigns", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
