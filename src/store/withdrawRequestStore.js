import { create } from "zustand";
import {
  getWithdrawRequests,
  createWithdrawRequest,
  getWithdrawCampaigns,
} from "../api/withdrawRequestService";

const useWithdrawRequestStore = create((set) => ({
  requests: [],
  campaigns: [], // danh sách chiến dịch có thể rút
  loading: false,
  submitting: false,

  fetchRequests: async () => {
    set({ loading: true });
    try {
      const res = await getWithdrawRequests();
      set({ requests: res?.data || [] });
    } catch (err) {
      console.error("Lỗi fetch withdraw requests:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchCampaigns: async () => {
    try {
      const res = await getWithdrawCampaigns();
      set({ campaigns: res?.data || [] });
    } catch (err) {
      console.error("Lỗi fetch campaigns for withdraw:", err);
    }
  },

  createRequest: async (form) => {
    set({ submitting: true });
    try {
      await createWithdrawRequest({
        chien_dich_gay_quy_id: form.chien_dich_id,
        so_tien: Number(form.so_tien),
        mo_ta: form.mo_ta,
      });
      // Refresh danh sách sau khi tạo
      const res = await getWithdrawRequests();
      set({ requests: res?.data || [] });
      return { ok: true };
    } catch (err) {
      console.error("Lỗi tạo withdraw request:", err);
      return { ok: false, err };
    } finally {
      set({ submitting: false });
    }
  },
}));

export default useWithdrawRequestStore;