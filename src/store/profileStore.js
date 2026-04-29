import { create } from "zustand";
import axiosClient from "../api/authService";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateDiaChi,
  getDonateHistory,
  getMyPosts,
  getMyCampaigns,
} from "../api/profileService";

let profilePromise = null;
let donatePromise = null;
let postsPromise = null;
let campaignsPromise = null;

const useProfileStore = create((set, get) => ({
  profile: null,
  donations: [],
  myPosts: [],
  myCampaigns: [],

  loadingProfile: false,
  loadingDonations: false,
  loadingPosts: false,
  loadingCampaigns: false,

  isFetchedProfile: false,
  isFetchedDonations: false,
  isFetchedPosts: false,
  isFetchedCampaigns: false,

  // ===== FETCH PROFILE =====
  fetchProfile: async (force = false) => {
    if (!force && get().isFetchedProfile) return;
    if (profilePromise) return profilePromise;
    set({ loadingProfile: true });
    profilePromise = (async () => {
      try {
        const data = await getProfile();

        // Nếu là tổ chức, fetch thêm tong_thu, tong_chi từ /organization/:id
        const toChuc = data?.user?.to_chuc;
        if (toChuc?.id) {
          try {
            const { getOrganizationDetail } =
              await import("../api/profileService");
            const orgDetail = await getOrganizationDetail(toChuc.id);
            // Merge tong_thu, tong_chi vào tai_khoan_gay_quy
            if (data.user.to_chuc.tai_khoan_gay_quy) {
              data.user.to_chuc.tai_khoan_gay_quy.tong_thu = orgDetail.tong_thu;
              data.user.to_chuc.tai_khoan_gay_quy.tong_chi = orgDetail.tong_chi;
            }
          } catch (err) {
            console.error("Lỗi fetch org detail:", err);
          }
        }

        set({ profile: data, loadingProfile: false, isFetchedProfile: true });
        return data;
      } catch (err) {
        console.error("Lỗi fetch profile:", err);
        set({ loadingProfile: false });
      } finally {
        profilePromise = null;
      }
    })();
    return profilePromise;
  },

  // ===== FETCH DONATE HISTORY =====
  fetchDonations: async () => {
    if (get().isFetchedDonations) return;
    if (donatePromise) return donatePromise;

    set({ loadingDonations: true });

    donatePromise = (async () => {
      try {
        const data = await getDonateHistory();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.data)
              ? data.data.data
              : [];

        set({
          donations: list,
          loadingDonations: false,
          isFetchedDonations: true,
        });
      } catch (err) {
        console.error("Lỗi fetch donations:", err);
        set({ donations: [], loadingDonations: false });
      } finally {
        donatePromise = null;
      }
    })();

    return donatePromise;
  },

  // ===== FETCH MY POSTS =====
  fetchMyPosts: async (userId) => {
    if (get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;
    set({ loadingPosts: true });
    postsPromise = (async () => {
      try {
        let posts = [];
        try {
          const data = await getMyPosts();
          posts = data?.data?.data || data?.data || data || [];
        } catch {
          const res = await axiosClient.get("/posts");
          const all = res.data?.data?.data || res.data?.data || [];
          posts = userId ? all.filter((p) => p.nguoi_dung_id === userId) : all;
        }
        set({ myPosts: posts, loadingPosts: false, isFetchedPosts: true });
      } catch (err) {
        console.error("Lỗi fetch my posts:", err);
        set({ loadingPosts: false });
      } finally {
        postsPromise = null;
      }
    })();
    return postsPromise;
  },

  // ===== FETCH MY CAMPAIGNS =====
  fetchMyCampaigns: async (force = false) => {
    if (!force && get().isFetchedCampaigns) return;
    if (campaignsPromise) return campaignsPromise;
    set({ loadingCampaigns: true });
    campaignsPromise = (async () => {
      try {
        const res = await getMyCampaigns();
        console.log("campaigns raw:", res);
        // BE trả về paginate: { current_page, data: [...], total }
        const list = res?.data || [];
        console.log("campaigns list:", list, "isArray:", Array.isArray(list));
        set({
          myCampaigns: Array.isArray(list) ? list : [],
          loadingCampaigns: false,
          isFetchedCampaigns: true,
        });
      } catch (err) {
        console.error("Lỗi fetch campaigns:", err);
        set({
          myCampaigns: [],
          loadingCampaigns: false,
          isFetchedCampaigns: true,
        });
      } finally {
        campaignsPromise = null;
      }
    })();
    return campaignsPromise;
  },

  // ===== UPDATE PROFILE =====
  handleUpdateProfile: async (formData) => {
    try {
      const data = await updateProfile(formData);
      set({ isFetchedProfile: false });
      await get().fetchProfile(true);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi update profile:", err);
      return { ok: false, err };
    }
  },

  // ===== CHANGE PASSWORD =====
  handleChangePassword: async (payload) => {
    try {
      const data = await changePassword(payload);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi đổi mật khẩu:", err);
      return { ok: false, err };
    }
  },

  // ===== UPDATE DIA CHI =====
  handleUpdateDiaChi: async (dia_chi) => {
    try {
      const data = await updateDiaChi(dia_chi);
      set({ isFetchedProfile: false });
      await get().fetchProfile(true);
      return { ok: true, data };
    } catch (err) {
      console.error("Lỗi update địa chỉ:", err);
      return { ok: false, err };
    }
  },

  reset: () => {
    set({
      profile: null,
      donations: [],
      myPosts: [],
      myCampaigns: [],
      loadingProfile: false,
      loadingDonations: false,
      loadingPosts: false,
      loadingCampaigns: false,
      isFetchedProfile: false,
      isFetchedDonations: false,
      isFetchedPosts: false,
      isFetchedCampaigns: false,
    });
  },
}));

export default useProfileStore;
