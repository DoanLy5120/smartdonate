import { create } from "zustand";
import {
  getDashboardSummary,
  getDashboardFinancial,
  getDashboardMonthly,
  getDashboardActiveCampaigns,
  getDashboardOtherCampaigns,
  getDashboardRecentActivities,
} from "../api/dashboardService";

let summaryPromise = null;
let monthlyPromise = null;
let campaignsPromise = null;
let activitiesPromise = null;

const useDashboardStore = create((set, get) => ({
  summary: null,
  financial: null,
  monthly: null,
  campaigns: [],
  otherCampaigns: [],
  activities: [],

  loading: false,
  loadingFinancial: false,
  isFetched: false,

  fetchAll: async () => {
    if (get().isFetched) return;
    if (summaryPromise) return summaryPromise;

    set({ loading: true });

    summaryPromise = (async () => {
      try {
        const [summary, monthly, campaigns, otherCampaigns, activities] = await Promise.all([
          getDashboardSummary(),
          getDashboardMonthly(),
          getDashboardActiveCampaigns(),
          getDashboardOtherCampaigns(),
          getDashboardRecentActivities(),
        ]);
        set({
          summary,
          monthly,
          campaigns: campaigns || [],
          otherCampaigns: otherCampaigns || [],
          activities: activities || [],
          loading: false,
          isFetched: true,
        });
      } catch (err) {
        console.error("Lỗi fetch dashboard:", err);
        set({ loading: false });
      } finally {
        summaryPromise = null;
      }
    })();

    return summaryPromise;
  },

  fetchFinancial: async (type = "thang") => {
    set({ loadingFinancial: true });
    try {
      const data = await getDashboardFinancial(type);
      set({ financial: data, loadingFinancial: false });
    } catch (err) {
      console.error("Lỗi fetch financial:", err);
      set({ loadingFinancial: false });
    }
  },

  reset: () => {
    set({
      summary: null, financial: null, monthly: null,
      campaigns: [], otherCampaigns: [], activities: [],
      loading: false, loadingFinancial: false, isFetched: false,
    });
  },
}));

export default useDashboardStore;