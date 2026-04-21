import api from "./authService"; 

// danh sách tổ chức
export const getOrganizations = (params) => {
  return api.get(`/organization`, {
    params: {
      keyword: params?.keyword || "",
      loai_hinh: params?.loai_hinh || "",
      page: params?.page || 1,
    },
  });
};

// chi tiết tổ chức
export const getOrganizationDetail = async (id) => {
  const res = await api.get(`/organization/${id}`);
  return res.data;
};

// đăng ký
export const registerOrganization = (formData) => {
  return api.post(`/organization/register`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// status
export const getOrganizationStatus = async () => {
  const res = await api.get(`/organization/status`);
  return res.data;
};