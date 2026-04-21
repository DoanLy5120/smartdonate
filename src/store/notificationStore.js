import { create } from "zustand";
import { getNotificationsAPI, markAsReadAPI, markAllAsReadAPI } from "../api/notificationService";

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
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
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
}));

export default useNotificationStore;