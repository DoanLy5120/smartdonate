import api from "./authService";

// tạo hoặc lấy cuộc trò chuyện
export const createOrGetChat = async (nguoi_nhan_id) => {
  const res = await api.post(`/tro-chuyen/tao-hoac-lay`, {
    nguoi_nhan_id,
  });
  return res.data;
};

// danh sách chat
export const getChats = async () => {
  const res = await api.get(`/tro-chuyen`);
  return res.data;
};

// lấy tin nhắn
export const getMessages = async (chatId, params = {}) => {
  const res = await api.get(`/tro-chuyen/${chatId}/tin-nhan`, {
    params,
  });
  return res.data;
};

// gửi tin nhắn
export const sendMessage = async (chatId, payload) => {
  const isFormData = payload instanceof FormData;

  const res = await api.post(
    `/tro-chuyen/${chatId}/tin-nhan`,
    payload,
    isFormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {}
  );

  return res.data;
};

// đánh dấu đã xem
export const markAsRead = async (chatId) => {
  const res = await api.post(`/tro-chuyen/${chatId}/da-xem`);
  return res.data;
};

// thu hồi tin nhắn (POST /{id}/tin-nhan/{tinNhanId})
export const recallMessage = async (chatId, tinNhanId) => {
  const res = await api.post(`/tro-chuyen/${chatId}/tin-nhan/${tinNhanId}`);
  return res.data;
};
 
// xóa hết lịch sử phía mình (DELETE /{id}/tin-nhan)
export const deleteAllMessages = async (chatId) => {
  const res = await api.delete(`/tro-chuyen/${chatId}/tin-nhan`);
  return res.data;
};