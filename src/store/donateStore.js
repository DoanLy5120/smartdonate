import { create } from "zustand";
import { donate } from "../api/donateService";

let donatePromise = null;

const useDonateStore = create((set) => ({
  donateData: null,
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

  resetDonate: () => {
    set({
      donateData: null,
    });
  },
}));

export default useDonateStore;
