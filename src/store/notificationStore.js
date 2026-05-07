import { create } from "zustand";
import { notification as antdNotification } from "antd";
import {
  getNotificationsAPI,
  markAsReadAPI,
  markAllAsReadAPI,
} from "../api/notificationService";
import echo from "../socket";

let notifChannel = null;
let subscribedUserId = null;

/**
 * Echo .notification() có thể trả payload phẳng (toán tử spread từ toDatabase)
 * hoặc lồng trong `data` — chuẩn hóa giống format API /notifications.
 */
function normalizeIncomingNotification(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id;
  const type = raw.type ?? "broadcast";
  let dataLayer = {};

  if (raw.data !== undefined && raw.data !== null) {
    if (typeof raw.data === "string") {
      try {
        dataLayer = JSON.parse(raw.data);
      } catch {
        dataLayer = {};
      }
    } else if (typeof raw.data === "object" && !Array.isArray(raw.data)) {
      dataLayer = { ...raw.data };
    }
  }

  const skip = new Set(["id", "type", "data", "socket"]);
  for (const [k, v] of Object.entries(raw)) {
    if (!skip.has(k) && v !== undefined) {
      dataLayer[k] = v;
    }
  }

  return {
    id,
    type,
    data: dataLayer,
    read_at: raw.read_at ?? null,
    created_at: raw.created_at ?? new Date().toISOString(),
  };
}
export const formatViolation = (code) => {
  const map = {
    posting_too_fast_5_in_10min: {
      title: "Đăng bài quá nhanh",
      desc: "5 bài trong 10 phút",
    },

    posting_frequently_3_in_10min: {
      title: "Đăng bài thường xuyên",
      desc: "3 bài trong 10 phút",
    },

    duplicate_content_100: {
      title: "Nội dung trùng lặp",
      desc: "100%",
    },

    spam_post: {
      title: "Spam bài đăng",
      desc: "Bài đăng có dấu hiệu spam",
    },

    max_jump_abnormal: {
      title: "Biến động bất thường",
      desc: "Tăng trưởng bất thường",
    },
  };

  return (
    map[code] || {
      title: code,
      desc: "",
    }
  );
};
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await getNotificationsAPI();
      set({
        notifications: res.data.data,
        unreadCount: res.data.unread_count,
      });
    } catch (err) {
      console.error("Lỗi lấy thông báo:", err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await markAsReadAPI(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error("Lỗi đánh dấu đọc:", err);
    }
  },

  markAllAsRead: async () => {
    try {
      await markAllAsReadAPI();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error("Lỗi đánh dấu tất cả đọc:", err);
    }
  },

  subscribeNotifications: (userId) => {
    if (!userId) return;

    if (subscribedUserId && subscribedUserId !== userId) {
      echo.leave(`App.Models.User.${subscribedUserId}`);
      notifChannel = null;
    }

    if (notifChannel && subscribedUserId === userId) {
      return;
    }

    subscribedUserId = userId;
    notifChannel = echo
      .private(`App.Models.User.${userId}`)
      .notification((payload) => {
        const row = normalizeIncomingNotification(payload);
        if (!row?.id) return;

        set((state) => {
          if (state.notifications.some((n) => n.id === row.id)) {
            return state;
          }
          return {
            notifications: [row, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        });

        const d = row.data || {};
        const loai = d.loai || d.type;

        // ✅ Chỉ hiển thị TOAST cho những loại quan trọng (cảnh báo, xử lý lỗi)
        // ❌ Bỏ qua: approval, bai_dang_duoc_thich, bai_dang_duoc_binh_luan, reply_comment
        //           (những loại này chỉ hiển thị ở dropdown thôi)
        const shouldShowToast = [
          
          "post_report_resolution",
        ].includes(loai);

        if (shouldShowToast) {
          const toastTitle =
            d.message ||
            d.title ||
            d.source ||
            (loai === "admin_violation_detected"
              ? "Cảnh báo / vi phạm"
              : loai === "admin_review_required"
                ? "Cần duyệt"
                : "Cập nhật báo cáo bài đăng");
          
          antdNotification.info({
            message: toastTitle,
            description:
              typeof d.mo_ta === "string"
                ? d.mo_ta
                : typeof d.reason === "string"
                  ? d.reason
                  : undefined,
            placement: "topRight",
            duration: 5,
          });
        }
      });
  },

  unsubscribeNotifications: (userId) => {
    if (!userId) return;
    echo.leave(`App.Models.User.${userId}`);
    notifChannel = null;
    if (subscribedUserId === userId) subscribedUserId = null;
  },
}));

export default useNotificationStore;