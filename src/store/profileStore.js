import { create } from "zustand";
import {
  getProfile,
  updateProfile,
  changePassword,
  updateDiaChi,
  getDonateHistory,
  getMyPosts,
  getMyCampaigns,
  getOrganizationDetail,
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
  donationsTotal: 0,
  postsTotal: 0,
  campaignsTotal: 0,

  loadingProfile: false,
  loadingDonations: false,
  loadingPosts: false,
  loadingCampaigns: false,

  isFetchedProfile: false,
  isFetchedDonations: false,
  isFetchedPosts: false,
  isFetchedCampaigns: false,

  // Pagination for myPosts
  postsPage: 1,
  postsHasMore: true,

  // Pagination for donations
  donationsPage: 1,
  donationsHasMore: true,

  // Pagination for campaigns
  campaignsPage: 1,
  campaignsHasMore: true,

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
            const orgDetail = await getOrganizationDetail(toChuc.id);
            // BE getProfile trả to_chuc.tai_khoan_gay_quy = null (do fresh().load('toChuc') không load nested)
            // Phải build taiKhoan từ orgDetail với đúng tên field mà Profile.jsx cần
            data.user.to_chuc.tai_khoan_gay_quy = {
              so_tai_khoan: orgDetail.so_tai_khoan || null,
              chu_tai_khoan: orgDetail.ten_tai_khoan || null, // orgDetail dùng ten_tai_khoan
              ngan_hang: null, // orgDetail không trả ngan_hang
              so_du: orgDetail.so_du_hien_tai ?? null, // orgDetail dùng so_du_hien_tai
              tong_thu: orgDetail.tong_thu ?? null,
              tong_chi: orgDetail.tong_chi ?? null,
            };
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
  // BE /donate/history trả: { data: { data: [...], next_page_url, ... } }
  fetchDonations: async (loadMore = false) => {
    if (!loadMore && get().isFetchedDonations) return;
    if (donatePromise) return donatePromise;
    if (get().loadingDonations) return;

    const currentPage = loadMore ? get().donationsPage + 1 : 1;
    set({ loadingDonations: true });

    donatePromise = (async () => {
      try {
        const res = await getDonateHistory(currentPage, 6);
        // res = { data: { data: [...], next_page_url, ... } }
        const newDonations = res?.data?.data || [];
        const hasMore = !!res?.data?.next_page_url;
        const total = res?.data?.total ?? 0;

        set({
          donations: loadMore
            ? [...get().donations, ...newDonations]
            : newDonations,
          loadingDonations: false,
          isFetchedDonations: true,
          donationsPage: currentPage,
          donationsHasMore: hasMore,
          donationsTotal: total,
        });

        return newDonations;
      } catch (err) {
        console.error("Lỗi fetch donations:", err);
        set({ donations: [], loadingDonations: false });
        return [];
      } finally {
        donatePromise = null;
      }
    })();

    return donatePromise;
  },

  // ===== FETCH MY POSTS =====
  // BE /posts/me trả: { data: { data: [...], next_page_url, ... } }
  fetchMyPosts: async (loadMore = false) => {
    if (!loadMore && get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;
    if (get().loadingPosts) return;

    const currentPage = loadMore ? get().postsPage + 1 : 1;
    set({ loadingPosts: true });

    postsPromise = (async () => {
      try {
        const res = await getMyPosts(currentPage, 12);
        const newPosts = res?.data?.data || [];
        const hasMore = !!res?.data?.next_page_url;
        const total = res?.data?.total ?? 0;

        set({
          myPosts: loadMore ? [...get().myPosts, ...newPosts] : newPosts,
          loadingPosts: false,
          isFetchedPosts: true,
          postsPage: currentPage,
          postsHasMore: hasMore,
          postsTotal: total,
        });

        return newPosts;
      } catch (err) {
        console.error("Lỗi fetch my posts:", err);
        set({ loadingPosts: false });
        return [];
      } finally {
        postsPromise = null;
      }
    })();

    return postsPromise;
  },

  // ===== FETCH MY CAMPAIGNS =====
  // BE /campaigns/me trả paginator trực tiếp: { data: [...], next_page_url, ... }
  fetchMyCampaigns: async (loadMore = false) => {
    if (!loadMore && get().isFetchedCampaigns) return;
    if (campaignsPromise) return campaignsPromise;
    if (get().loadingCampaigns) return;

    const currentPage = loadMore ? get().campaignsPage + 1 : 1;
    set({ loadingCampaigns: true });

    campaignsPromise = (async () => {
      try {
        const res = await getMyCampaigns(currentPage, 8);
        // res = { data: [...], next_page_url, ... } — BE trả paginator trực tiếp
        const newCampaigns = Array.isArray(res?.data) ? res.data : [];
        const hasMore = !!res?.next_page_url;
        const total = res?.total ?? 0;

        set({
          myCampaigns: loadMore
            ? [...get().myCampaigns, ...newCampaigns]
            : newCampaigns,
          loadingCampaigns: false,
          isFetchedCampaigns: true,
          campaignsPage: currentPage,
          campaignsHasMore: hasMore,
          campaignsTotal: total,
        });

        return newCampaigns;
      } catch (err) {
        console.error("Lỗi fetch campaigns:", err);
        set({
          myCampaigns: [],
          loadingCampaigns: false,
          isFetchedCampaigns: true,
        });
        return [];
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
      postsPage: 1,
      postsHasMore: true,
      donationsPage: 1,
      donationsHasMore: true,
      campaignsPage: 1,
      campaignsHasMore: true,
      donationsTotal: 0,
      postsTotal: 0,
      campaignsTotal: 0,
    });
  },
}));

export default useProfileStore;
