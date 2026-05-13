import api from "./authService";

// lấy danh sách bài đăng (có filter)
export const getPosts = async (params = {}) => {
  const res = await api.get(`/posts`, { params });
  return res.data;
};

// chi tiết bài đăng
export const getPostDetail = async (id) => {
  const res = await api.get(`/posts/${id}`);
  return res.data;
};

// tạo bài đăng (FormData)
export const createPost = async (formData) => {
  const res = await api.post(`/posts`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};
// upload ảnh trước
export const uploadImages = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("hinh_anh[]", file));

  const res = await api.post("/upload-image", formData, {
    // ← đổi axiosInstance thành api
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.urls;
};

// cập nhật bài đăng
export const updatePost = async (id, formData) => {
  const res = await api.post(`/posts/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// xoá bài đăng
export const deletePost = async (id) => {
  const res = await api.delete(`/posts/${id}`);
  return res.data;
};

// AI matching
export const getPostMatches = async (id) => {
  const res = await api.get(`/posts/${id}/matches`);
  return res.data;
};

// ===== LIKE =====
export const toggleLikePost = async (id) => {
  const res = await api.post(`/posts/${id}/like`);
  return res.data;
};

// ===== COMMENTS =====
export const getPostComments = async (id, params = {}) => {
  const res = await api.get(`/posts/${id}/comments`, { params });
  return res.data;
};

export const createPostComment = async (id, data) => {
  const res = await api.post(`/posts/${id}/comments`, data);
  return res.data;
};

export const deletePostComment = async (id) => {
  const res = await api.post(`/comments/${id}`);
  return res.data;
};

// ===== REPORT =====
export const reportPost = async (id, data) => {
  const res = await api.post(`/posts/${id}/report`, data);
  return res.data;
};

// ===== SEARCH =====
export const searchPosts = async (params = {}) => {
  const res = await api.get(`/posts/search`, { params });
  return res.data;
};

// Thêm sau searchPosts
export const searchUsers = async (params = {}) => {
  const res = await api.get(`/posts/search`, {
    params: { ...params, type: "people" },
  });
  return res.data;
};

// ===== RELATED (bài gần vị trí) =====
export const getRelatedPosts = async (id) => {
  const res = await api.get(`/posts/${id}/related`);
  return res.data;
};

// ===== DASHBOARD =====
export const getCommunityStats = async () => {
  const res = await api.get(`/dashboard/community-stats`);
  return res.data;
};
