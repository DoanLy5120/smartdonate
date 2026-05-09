import { create } from "zustand";
import {
  getAdminUsers,
  lockUser,
  unlockUser,
  getAdminPosts,
  getAdminPostReports,
  updateAdminPostReport,
  getAdminCampaigns,
  approveCampaign,
  rejectCampaign,
  suspendCampaign,
  suspendPost,
  getCampaignViolations,
  getPostViolations,
  approveOrganization,
  rejectOrganization,
  lockFundAccount,
  getFraudAlerts,
  updateFraudAlert,
  autoCheckFraud,
  autoCheckCampaignsFraud,
  getDashboardSummary,
  getDashboardFeatured,
  getDashboardFundraising,
  getDashboardActivities,
} from "../api/adminService";

let usersPromise = null;
let postsPromise = null;
let campaignsPromise = null;
let fraudPromise = null;
let dashboardPromise = null;
let reportsPromise = null;

const DEFAULT_META = { current_page: 1, per_page: 10, total: 0, last_page: 1 };

// Helper: lấy total từ nhiều shape response khác nhau (BE Laravel paginate vs custom meta)
const getTotal = (res) =>
  res?.meta?.total ?? res?.total ?? res?.data?.total ?? 0;

const useAdminStore = create((set, get) => ({
  // ===== STATE =====
  users: [],
  posts: [],
  campaigns: [],
  fraudAlerts: [],
  postReports: [],
  dashboardSummary: null,
  dashboardFeatured: [],
  dashboardFundraising: null,
  dashboardActivities: [],
  allUsers: [],
  allPosts: [],
  allCampaigns: [],
  isFetchedUsers: false,
  isFetchedPosts: false,
  isFetchedCampaigns: false,

  loadingUsers: false,
  loadingPosts: false,
  loadingCampaigns: false,
  loadingFraud: false,
  loadingDashboard: false,
  loadingReports: false,

  isFetchedFraud: false,
  isFetchedDashboard: false,
  isFetchedReports: false,

  // ===== USERS =====
  fetchUsers: async (force = false) => {
    if (!force && get().isFetchedUsers) return;
    if (usersPromise) return usersPromise;
    set({ loadingUsers: true });
    usersPromise = (async () => {
      try {
        const res = await getAdminUsers({ per_page: 500 });
        set({
          allUsers: res.data || [],
          isFetchedUsers: true,
          loadingUsers: false,
        });
      } catch (err) {
        console.error("Lỗi fetch users:", err);
        set({ loadingUsers: false });
      } finally {
        usersPromise = null;
      }
    })();
    return usersPromise;
  },

  handleLockUser: async (id) => {
    try {
      await lockUser(id);
      set({
        allUsers: get().allUsers.map((u) =>
          u.id === id ? { ...u, status: "BI_CAM", status_label: "Đã khóa" } : u,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleUnlockUser: async (id) => {
    try {
      await unlockUser(id);
      set({
        allUsers: get().allUsers.map((u) =>
          u.id === id
            ? { ...u, status: "HOAT_DONG", status_label: "Hoạt động" }
            : u,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== POSTS =====
  fetchPosts: async (force = false) => {
    if (!force && get().isFetchedPosts) return;
    if (postsPromise) return postsPromise;
    set({ loadingPosts: true });
    postsPromise = (async () => {
      try {
        const res = await getAdminPosts({ per_page: 500 });
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        set({ allPosts: list, isFetchedPosts: true, loadingPosts: false });
      } catch (err) {
        console.error(err);
        set({ loadingPosts: false });
      } finally {
        postsPromise = null;
      }
    })();
    return postsPromise;
  },

  // ===== POST REPORTS =====
  fetchPostReports: async (force = false) => {
    if (!force && get().isFetchedReports) return;
    if (reportsPromise) return reportsPromise;
    set({ loadingReports: true });
    reportsPromise = (async () => {
      try {
        const res = await getAdminPostReports();
        set({
          postReports: res.data || [],
          loadingReports: false,
          isFetchedReports: true,
        });
      } catch (err) {
        console.error(err);
        set({ loadingReports: false });
      } finally {
        reportsPromise = null;
      }
    })();
    return reportsPromise;
  },

  handleUpdatePostReport: async (id, trang_thai) => {
    try {
      await updateAdminPostReport(id, trang_thai);
      set({ isFetchedReports: false });
      await get().fetchPostReports(true);
      get().fetchPostsSummary();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== CAMPAIGNS =====
  fetchCampaigns: async (force = false) => {
    if (!force && get().isFetchedCampaigns) return;
    if (campaignsPromise) return campaignsPromise;
    set({ loadingCampaigns: true });
    campaignsPromise = (async () => {
      try {
        const res = await getAdminCampaigns({ per_page: 500 });
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        set({
          allCampaigns: list,
          isFetchedCampaigns: true,
          loadingCampaigns: false,
        });
      } catch (err) {
        console.error(err);
        set({ loadingCampaigns: false });
      } finally {
        campaignsPromise = null;
      }
    })();
    return campaignsPromise;
  },

  handleApproveCampaign: async (id) => {
    try {
      await approveCampaign(id);
      set({
        allCampaigns: get().allCampaigns.map((c) =>
          c.id === id ? { ...c, trang_thai: "HOAT_DONG" } : c,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleRejectCampaign: async (id) => {
    try {
      await rejectCampaign(id);
      set({
        allCampaigns: get().allCampaigns.map((c) =>
          c.id === id ? { ...c, trang_thai: "TU_CHOI" } : c,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleSuspendCampaign: async (id, ly_do) => {
    try {
      await suspendCampaign(id, ly_do);
      set({
        allCampaigns: get().allCampaigns.map((c) =>
          c.id === id ? { ...c, trang_thai: "TAM_DUNG" } : c,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleSuspendPost: async (id, ly_do) => {
    try {
      await suspendPost(id, ly_do);
      set({
        allPosts: get().allPosts.map((p) =>
          p.id === id ? { ...p, trang_thai: "TAM_DUNG" } : p,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== VIOLATION SETS (build từ /admin/post-reports để biết row nào có vi phạm CHO_XU_LY) =====
  campaignViolationSet: new Set(),
  postViolationSet: new Set(),

  fetchViolationSets: async () => {
    try {
      const res = await getAdminPostReports({
        trang_thai: "CHO_XU_LY",
        limit: 1000,
      });
      const items = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      const campSet = new Set();
      const postSet = new Set();
      items.forEach((it) => {
        if (it.target_type === "CAMPAIGN" && it.target_id)
          campSet.add(Number(it.target_id));
        if (it.target_type === "POST" && it.target_id)
          postSet.add(Number(it.target_id));
      });
      set({ campaignViolationSet: campSet, postViolationSet: postSet });
    } catch (err) {
      console.error(err);
    }
  },

  // ===== VIOLATIONS DETAIL (Modal hiện list vi phạm) =====
  fetchCampaignViolations: async (id) => {
    try {
      const res = await getCampaignViolations(id);
      return res?.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  fetchPostViolations: async (id) => {
    try {
      const res = await getPostViolations(id);
      return res?.data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  // Duyệt 1 vi phạm: USER_REPORT dùng updateAdminPostReport, AI alert dùng updateFraudAlert
  resolveViolation: async (item, decision = "DA_XU_LY") => {
    try {
      const payload =
        decision && typeof decision === "object"
          ? decision
          : { trang_thai: decision };

      if (item.source === "USER_REPORT" && item.report_id) {
        await updateAdminPostReport(item.report_id, payload.trang_thai);
      } else {
        const alertId =
          item.alert_id ?? (typeof item.id === "number" ? item.id : null);
        if (!alertId) return false;

        const data = {
          trang_thai: payload.trang_thai,
        };

        if (payload.decision) {
          data.decision = payload.decision;
        }

        await updateFraudAlert(alertId, data);
      }
      // Refresh violation sets
      await get().fetchViolationSets();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== ORGANIZATIONS =====
  handleApproveOrg: async (id) => {
    try {
      await approveOrganization(id);
      set({ isFetchedUsers: false });
      await get().fetchUsers(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleRejectOrg: async (id, ly_do = "Không đủ điều kiện") => {
    try {
      await rejectOrganization(id, ly_do);
      set({ isFetchedUsers: false });
      await get().fetchUsers(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== FUND ACCOUNTS =====
  handleLockFundAccount: async (id) => {
    try {
      await lockFundAccount(id);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== FRAUD =====
  fetchFraudAlerts: async (force = false) => {
    if (!force && get().isFetchedFraud) return;

    if (fraudPromise) return fraudPromise;

    set({ loadingFraud: true });

    fraudPromise = (async () => {
      try {
        const res = await getFraudAlerts();

        set({
          fraudAlerts: res.data || [],
          loadingFraud: false,
          isFetchedFraud: true,
        });
      } catch (err) {
        console.error(err);
        set({ loadingFraud: false });
      } finally {
        fraudPromise = null;
      }
    })();

    return fraudPromise;
  },

  handleUpdateFraudAlert: async (id, data) => {
    try {
      const res = await updateFraudAlert(id, data);
      set({
        fraudAlerts: get().fraudAlerts.map((a) =>
          a.id === id ? { ...a, ...res.data } : a,
        ),
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleAutoCheckFraud: async () => {
    try {
      await autoCheckFraud();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  handleAutoCheckCampaignsFraud: async () => {
    try {
      await autoCheckCampaignsFraud();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  // ===== DASHBOARD =====
  fetchDashboard: async () => {
    if (get().isFetchedDashboard) return;
    if (dashboardPromise) return dashboardPromise;
    set({ loadingDashboard: true });
    dashboardPromise = (async () => {
      try {
        const [summary, featured, fundraising, activities] = await Promise.all([
          getDashboardSummary(),
          getDashboardFeatured(),
          getDashboardFundraising(),
          getDashboardActivities(),
        ]);
        set({
          dashboardSummary: summary.data || summary,
          dashboardFeatured: featured.data || featured,
          dashboardFundraising: fundraising.data || fundraising,
          dashboardActivities: activities.data || activities,
          loadingDashboard: false,
          isFetchedDashboard: true,
        });
      } catch (err) {
        console.error(err);
        set({ loadingDashboard: false });
      } finally {
        dashboardPromise = null;
      }
    })();
    return dashboardPromise;
  },

  refreshDashboard: async () => {
    set({ isFetchedDashboard: false });
    return get().fetchDashboard();
  },
}));

export default useAdminStore;
