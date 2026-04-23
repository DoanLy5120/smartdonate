import { create } from "zustand";
import { donate, getDonateDetail } from "../api/donateService";

let donatePromise = null;

const useDonateStore = create((set) => ({
  donateData: null,
  donateDetail: null,
  loading: false,

  // ===== ỦNG HỘ =====
  handleDonate: async (payload) => {
    if (donatePromise) return donatePromise;

    set({ loading: true });

    donatePromise = (async () => {
      try {
        const res = await donate(payload);

        set({
          donateData: res,
          loading: false,
        });

        return res;
      } catch (err) {
        console.error("Lỗi donate:", err);
        set({ loading: false });
        throw err;
      } finally {
        donatePromise = null;
      }
    })();

    return donatePromise;
  },

  // ===== LẤY CHI TIẾT =====
  fetchDonateDetail: async (id) => {
    try {
      set({ loading: true });

      const res = await getDonateDetail(id);

      set({
        donateDetail: res.data, // BE trả { data: ... }
        loading: false,
      });

      return res.data;
    } catch (err) {
      console.error("Lỗi lấy chi tiết donate:", err);
      set({ loading: false });
      throw err;
    }
  },

  resetDonate: () => {
    set({
      donateData: null,
      donateDetail: null,
    });
  },
}));

export default useDonateStore;
