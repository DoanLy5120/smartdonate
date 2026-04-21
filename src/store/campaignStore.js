import { create } from "zustand";
import {
  getCampaigns,
  getFeaturedCampaigns,
  getCampaignDetail,
  getEndingCampaigns,
  createCampaign,
} from "../api/campaignService";

let featuredPromise = null;
let endingPromise = null;
const detailPromises = {};

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  pagination: null,
  featured: [],
  campaignDetail: {},
  endingCampaigns: [],
  loading: false,
  isFetchedFeatured: false,
  isFetchedEnding: false,
  loadingCreate: false,

  fetchCampaigns: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await getCampaigns(params);
      set({
        campaigns: res.data ?? [],
        pagination: {
          current_page: res.current_page,
          last_page: res.last_page,
          total: res.total,
          per_page: res.per_page,
        },
        loading: false,
      });
    } catch (err) {
      console.error("Lỗi fetch campaigns:", err);
      set({ loading: false });
    }
  },

  // ── Fetch chiến dịch nổi bật (chỉ fetch 1 lần) ──
  fetchFeatured: async () => {
    if (get().isFetchedFeatured) return;
    if (featuredPromise) return featuredPromise;

    set({ loading: true });
    featuredPromise = (async () => {
      try {
        const res = await getFeaturedCampaigns();
        set({
          featured: Array.isArray(res) ? res : [],
          isFetchedFeatured: true,
          loading: false,
        });
      } catch (err) {
        console.error("Lỗi fetch featured:", err);
        set({ loading: false });
      } finally {
        featuredPromise = null;
      }
    })();
    return featuredPromise;
  },

  // ── Fetch chi tiết chiến dịch (cache theo id) ──
  fetchCampaignDetail: async (id, params = {}) => {
    const page = params.page || 1;
    const key = `${id}_${page}`;

    const cached = get().campaignDetail[key];
    if (cached) return cached;
    if (detailPromises[key]) return detailPromises[key];

    detailPromises[key] = (async () => {
      try {
        const res = await getCampaignDetail(id, params);

        set({
          campaignDetail: {
            ...get().campaignDetail,
            [key]: res, // 👈 cache theo page
          },
        });

        return res;
      } catch (err) {
        console.error("Lỗi fetch campaign detail:", err);
        return null;
      } finally {
        delete detailPromises[key];
      }
    })();

    return detailPromises[key];
  },

  fetchEndingCampaigns: async () => {
    if (get().isFetchedEnding) return;
    if (endingPromise) return endingPromise;

    endingPromise = (async () => {
      try {
        const res = await getEndingCampaigns();
        set({
          endingCampaigns: Array.isArray(res) ? res : [],
          isFetchedEnding: true,
        });
      } catch (err) {
        console.error("Lỗi fetch ending campaigns:", err);
      } finally {
        endingPromise = null;
      }
    })();

    return endingPromise;
  },

  createCampaign: async (formData) => {
    if (get().loadingCreate) return;
    set({ loadingCreate: true });
    try {
      const res = await createCampaign(formData);
      set({
        isFetchedFeatured: false,
        isFetchedEnding: false,
        endingCampaigns: [],
        loadingCreate: false,
      });
      return res;
    } catch (err) {
      set({ loadingCreate: false });
      throw err;
    }
  },

  refreshCampaignData: async () => {
    set({
      isFetchedFeatured: false,
      isFetchedEnding: false,
      endingCampaigns: [],
    });

    const { fetchFeatured, fetchEndingCampaigns } = get();
    await Promise.all([fetchFeatured(), fetchEndingCampaigns()]);
  },

  invalidateCampaignDetail: (id) => {
    const current = get().campaignDetail;

    const filtered = Object.keys(current)
      .filter((key) => !key.startsWith(`${id}_`))
      .reduce((acc, key) => {
        acc[key] = current[key];
        return acc;
      }, {});

    set({ campaignDetail: filtered });
  },
}));

export default useCampaignStore;
