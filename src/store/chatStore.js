import { create } from "zustand";
import {
  createOrGetChat,
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
  recallMessage,
  deleteAllMessages,
} from "../api/chatService";
import useAuthStore from "./authStore";
import echo from "../socket";

const messagePromises = {};
const activeChannels = new Map();

const useChatStore = create((set, get) => ({
  chats: [],
  messages: {},
  loadingChats: false,
  loadingMessages: false,
  sending: false,
  totalUnread: 0,
  activeChatId: null,
  pendingChat: null,

  // ─── setActiveChatId ──────────────────────────────────────────────────────
  // Nếu rời khỏi pendingChat mà chưa gửi tin → tự xóa pending
  setActiveChatId: (id) => {
    const pending = get().pendingChat;
    // Chỉ xóa pending khi navigate sang chatId khác (không phải khi id === null — tức là unmount)
    if (pending && id !== null && pending.cuoc_tro_chuyen_id !== id) {
      set({ pendingChat: null });
    }
    set({ activeChatId: id });
  },

  // ─── _subscribeChannel: helper subscribe 1 channel ───────────────────────
  _subscribeChannel: (chatId) => {
    const cid = Number(chatId);
    if (activeChannels.has(cid)) return;

    const channel = echo.private(`cuoc-tro-chuyen.${cid}`);

    channel.listen(".TinNhanMoi", (e) => {
      const myUserId = Number(useAuthStore.getState().user?.id || 0);
      if (Number(e.nguoi_gui_id) === myUserId) return;
      get().appendIncomingMessage(cid, e);
    });

    channel.listen(".TinNhanDaXem", (e) => {
      get().applySeenByEvent(cid, e.tin_nhan_ids);
    });

    channel.listen(".TinNhanBiThuHoi", (e) => {
      get().applyRecallMessage(cid, e.tin_nhan_id);
    });

    channel.listen(".TinNhanBiXoaHet", (e) => {
      const myUserId = Number(useAuthStore.getState().user?.id || 0);
      if (Number(e.nguoi_dung_id) === myUserId) {
        set((state) => ({
          messages: { ...state.messages, [cid]: [] },
        }));
      }
    });

    activeChannels.set(cid, channel);
  },

  _fetchChatsQuiet: async () => {
    try {
      const res = await getChats();
      const freshData = res?.data || [];
      const totalUnread = res?.total_unread ?? 0;
      set((state) => {
        const currentMap = new Map(
          state.chats.map((c) => [c.cuoc_tro_chuyen_id, c]),
        );
        freshData.forEach((c) => currentMap.set(c.cuoc_tro_chuyen_id, c));
        return {
          chats: Array.from(currentMap.values()),
          totalUnread: Math.max(state.totalUnread, totalUnread),
        };
      });
      return freshData;
    } catch (err) {
      console.error("Lỗi fetch chats quiet:", err);
      return [];
    }
  },

  // ─── startRealtime ────────────────────────────────────────────────────────
  startRealtime: () => {
    const { chats, syncSubscriptions } = get();
    syncSubscriptions(chats);

    const myUserId = useAuthStore.getState().user?.id;
    if (!myUserId) return;

    const userChannel = echo.private(`user.${myUserId}`);

    userChannel.listen(".ConversationListUpdated", async (e) => {
      const newChatId = Number(e.cuoc_tro_chuyen_id);

      if (newChatId && !activeChannels.has(newChatId)) {
        get()._subscribeChannel(newChatId);
      }

      const data = await get()._fetchChatsQuiet();
      get().syncSubscriptions(data);

      if (newChatId) {
        delete messagePromises[newChatId];
        set((state) => ({
          messages: { ...state.messages, [newChatId]: undefined },
        }));
        await get().fetchMessages(newChatId);
      }
    });
  },

  syncSubscriptions: (chats) => {
    chats.forEach((conv) => {
      get()._subscribeChannel(conv.cuoc_tro_chuyen_id);
    });
  },

  stopRealtime: () => {
    const myUserId = useAuthStore.getState().user?.id;
    activeChannels.forEach((_, chatId) => {
      echo.leave(`cuoc-tro-chuyen.${chatId}`);
    });
    activeChannels.clear();
    if (myUserId) echo.leave(`user.${myUserId}`);
    set({ chats: [], messages: {}, totalUnread: 0 });
  },

  // ─── openChatWith: gọi từ PostCard / PostModal ───────────────────────────
  openChatWith: async (nguoiNhanId, nguoiNhanInfo) => {
    try {
      const res = await createOrGetChat(nguoiNhanId);
      const chatId = res?.data?.cuoc_tro_chuyen_id ?? res?.cuoc_tro_chuyen_id;
      if (!chatId) return null;

      const cid = Number(chatId);
      const exists = get().chats.some((c) => c.cuoc_tro_chuyen_id === cid);

      if (!exists) {
        set({
          pendingChat: {
            cuoc_tro_chuyen_id: cid,
            nguoi_kia: {
              id: nguoiNhanInfo.id,
              ho_ten: nguoiNhanInfo.ho_ten,
              avatar_url: nguoiNhanInfo.avatar_url ?? null,
            },
            tin_nhan_cuoi: null,
            unread_count: 0,
            updated_at: new Date().toISOString(),
            _isPending: true,
          },
        });
      }

      return cid;
    } catch (err) {
      console.error("Lỗi openChatWith:", err);
      return null;
    }
  },

  // ─── fetchChats ───────────────────────────────────────────────────────────
  fetchChats: async () => {
    set({ loadingChats: true });
    try {
      const res = await getChats();
      const data = res?.data || [];
      const totalUnread = res?.total_unread ?? 0;
      set({ chats: data, totalUnread, loadingChats: false });
      return data;
    } catch (err) {
      if (err?.response?.status !== 403) {
        console.error("Lỗi fetch chats:", err);
      }
      set({ loadingChats: false });
      return [];
    }
  },

  fetchMessages: async (chatId, params = {}) => {
    const cid = Number(chatId);
    if (messagePromises[cid]) return messagePromises[cid];

    set({ loadingMessages: true });
    messagePromises[cid] = (async () => {
      try {
        const res = await getMessages(cid, params);
        const data = res?.data || [];
        set((state) => ({
          messages: { ...state.messages, [cid]: data },
          loadingMessages: false,
        }));
        return data;
      } catch (err) {
        console.error("Lỗi fetch messages:", err);
        set({ loadingMessages: false });
        return [];
      } finally {
        delete messagePromises[cid];
      }
    })();
    return messagePromises[cid];
  },

  appendIncomingMessage: (chatId, payload) => {
    const cid = Number(chatId);
    const msg = {
      id: payload.tin_nhan_id,
      cuoc_tro_chuyen_id: payload.cuoc_tro_chuyen_id,
      nguoi_gui_id: payload.nguoi_gui_id,
      noi_dung: payload.noi_dung,
      loai_tin: payload.loai_tin,
      tep_dinh_kem: payload.tep_dinh_kem,
      created_at: payload.created_at,
      da_xem: false,
    };

    const current = get().messages[cid] || [];
    if (current.some((m) => Number(m.id) === Number(msg.id))) return;

    const preview =
      payload.loai_tin === "ANH"
        ? "[Ảnh]"
        : payload.loai_tin === "VIDEO"
          ? "[Video]"
          : payload.noi_dung || "";

    const chatExists = get().chats.some((c) => c.cuoc_tro_chuyen_id === cid);

    const currentChat = get().chats.find((c) => c.cuoc_tro_chuyen_id === cid);
    const isFirstUnread = !currentChat || (currentChat.unread_count || 0) === 0;

    set((state) => ({
      messages: { ...state.messages, [cid]: [...current, msg] },
      chats: chatExists
        ? state.chats.map((c) =>
            c.cuoc_tro_chuyen_id === cid
              ? {
                  ...c,
                  tin_nhan_cuoi: { ...payload, preview },
                  unread_count: (c.unread_count || 0) + 1,
                }
              : c,
          )
        : [
            {
              cuoc_tro_chuyen_id: cid,
              nguoi_kia: {
                id: payload.nguoi_gui_id,
                ho_ten: "...",
                avatar_url: null,
              },
              tin_nhan_cuoi: { ...payload, preview },
              unread_count: 1,
              updated_at: payload.created_at,
              _isSkeletonPending: true,
            },
            ...state.chats,
          ],
      totalUnread: state.totalUnread + (isFirstUnread ? 1 : 0),
    }));

    if (!chatExists) {
      get()._fetchChatsQuiet();
    }

    if (get().activeChatId === cid) {
      get().markAsRead(cid);
    }
  },

  applySeenByEvent: (chatId, messageIds) => {
    const cid = Number(chatId);
    const ids = new Set((messageIds || []).map((id) => Number(id)));
    if (!ids.size) return;
    const current = get().messages[cid] || [];
    set({
      messages: {
        ...get().messages,
        [cid]: current.map((m) =>
          ids.has(Number(m.id)) ? { ...m, da_xem: true } : m,
        ),
      },
    });
  },

  applyRecallMessage: (chatId, tinNhanId) => {
    const cid = Number(chatId);
    const mid = Number(tinNhanId);
    const current = get().messages[cid] || [];

    const updatedMessages = current.map((m) =>
      Number(m.id) === mid
        ? {
            ...m,
            da_thu_hoi: true,
            noi_dung: null,
            tep_dinh_kem: null,
            loai_tin: "VAN_BAN",
          }
        : m,
    );

    const chats = get().chats.map((c) => {
      if (c.cuoc_tro_chuyen_id !== cid) return c;
      const lastMsg = c.tin_nhan_cuoi;
      if (lastMsg && Number(lastMsg.id) === mid) {
        return {
          ...c,
          tin_nhan_cuoi: {
            ...lastMsg,
            da_thu_hoi: true,
            noi_dung: null,
            preview: "[Đã thu hồi]",
          },
        };
      }
      return c;
    });

    set({ messages: { ...get().messages, [cid]: updatedMessages }, chats });
  },

  recallMessage: async (chatId, tinNhanId) => {
    try {
      await recallMessage(Number(chatId), Number(tinNhanId));
      get().applyRecallMessage(chatId, tinNhanId);
      return true;
    } catch (err) {
      console.error("Lỗi thu hồi:", err);
      return false;
    }
  },

  deleteAllMessages: async (chatId) => {
    const cid = Number(chatId);
    try {
      await deleteAllMessages(cid);
      set((state) => ({
        chats: state.chats.filter((c) => c.cuoc_tro_chuyen_id !== cid),
        messages: { ...state.messages, [cid]: [] },
        activeChatId: state.activeChatId === cid ? null : state.activeChatId,
      }));
      return true;
    } catch (err) {
      console.error("Lỗi xóa lịch sử:", err);
      return false;
    }
  },

  // ─── sendMessage ──────────────────────────────────────────────────────────
  sendMessage: async (chatId, payload) => {
    const cid = Number(chatId);
    set({ sending: true });
    try {
      const res = await sendMessage(cid, payload);
      const newMsg = res?.data;

      if (newMsg) {
        const preview =
          newMsg.loai_tin === "ANH"
            ? "[Ảnh]"
            : newMsg.loai_tin === "VIDEO"
              ? "[Video]"
              : newMsg.noi_dung || "";

        const isPending = get().pendingChat?.cuoc_tro_chuyen_id === cid;

        if (isPending) {
          const pending = get().pendingChat;
          set((state) => ({
            chats: [
              {
                ...pending,
                _isPending: false,
                tin_nhan_cuoi: { ...newMsg, preview },
                updated_at: new Date().toISOString(),
              },
              ...state.chats,
            ],
            pendingChat: null,
            messages: {
              ...state.messages,
              [cid]: [...(state.messages[cid] || []), newMsg],
            },
          }));
          get()._subscribeChannel(cid);
        } else {
          const chatExists = get().chats.some(
            (c) => c.cuoc_tro_chuyen_id === cid,
          );
          set((state) => ({
            messages: {
              ...state.messages,
              [cid]: [...(state.messages[cid] || []), newMsg],
            },
            chats: state.chats.map((c) =>
              c.cuoc_tro_chuyen_id === cid
                ? { ...c, tin_nhan_cuoi: { ...newMsg, preview } }
                : c,
            ),
          }));
          if (!chatExists) {
            const data = await get().fetchChats();
            get().syncSubscriptions(data);
          }
        }
      }

      set({ sending: false });
      return newMsg;
    } catch (err) {
      console.error("Lỗi send message:", err);
      set({ sending: false });
      return null;
    }
  },

  markAsRead: async (chatId) => {
    const cid = Number(chatId);
    try {
      await markAsRead(cid);
      const chat = get().chats.find((c) => c.cuoc_tro_chuyen_id === cid);
      const prevUnread = chat?.unread_count ?? 0;
      set((state) => ({
        chats: state.chats.map((c) =>
          c.cuoc_tro_chuyen_id === cid ? { ...c, unread_count: 0 } : c,
        ),
        totalUnread: Math.max(0, state.totalUnread - prevUnread),
      }));
    } catch (err) {
      console.error("Lỗi mark as read:", err);
    }
  },
}));

export default useChatStore;
