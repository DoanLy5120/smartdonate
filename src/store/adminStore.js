import { create } from "zustand";
import {
  getAdminUsers, lockUser, unlockUser,
  getAdminPosts,
  getAdminPostReports, updateAdminPostReport,
  getAdminCampaigns, approveCampaign, rejectCampaign, pauseCampaign,
  approveOrganization, rejectOrganization, lockFundAccount,
  getFraudAlerts, updateFraudAlert, autoCheckFraud, autoCheckCampaignsFraud,
  getDashboardSummary, getDashboardFeatured, getDashboardFundraising, getDashboardActivities,
} from "../api/adminService";

let usersPromise = null;
let postsPromise = null;
let campaignsPromise = null;
let fraudPromise = null;
let dashboardPromise = null;
let reportsPromise = null;

const DEFAULT_META = { current_page: 1, per_page: 10, total: 0, last_page: 1 };

// Helper: lấy total từ nhiều shape response khác nhau (BE Laravel paginate vs custom meta)
const getTotal = (res) => res?.meta?.total ?? res?.total ?? res?.data?.total ?? 0;

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

  // Pagination meta cho từng list
  usersMeta:     { ...DEFAULT_META },
  postsMeta:     { ...DEFAULT_META },
  campaignsMeta: { ...DEFAULT_META },

  // Summary tổng thể (không phụ thuộc page hiện tại)
  usersSummary:     { total: 0, user: 0, org: 0, blocked: 0 },
  postsSummary:     { total: 0, cho: 0, nhan: 0, vi_pham: 0 },
  campaignsSummary: { total: 0, pending: 0, active: 0, completed: 0 },

  // Filter state cho từng list
  usersParams:     { page: 1, per_page: 10, search: "", role: "", status: "" },
  postsParams:     { page: 1, per_page: 10, search: "", loai_bai: "" },
  campaignsParams: { page: 1, per_page: 10, keyword: "", trang_thai: "" },

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
  fetchUsers: async (params = {}) => {
    if (usersPromise) return usersPromise;
    const merged = { ...get().usersParams, ...params };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== undefined));
    set({ loadingUsers: true, usersParams: merged });
    usersPromise = (async () => {
      try {
        const res = await getAdminUsers(cleaned);
        set({
          users: res.data || [],
          usersMeta: res.meta || { ...DEFAULT_META },
          loadingUsers: false,
        });
      } catch (err) {
        console.error("Lỗi fetch users:", err);
        set({ loadingUsers: false });
      } finally { usersPromise = null; }
    })();
    return usersPromise;
  },

  fetchUsersSummary: async () => {
    try {
      const [allRes, userRes, orgRes, blockedRes] = await Promise.all([
        getAdminUsers({ per_page: 1 }),
        getAdminUsers({ per_page: 1, role: "NGUOI_DUNG" }),
        getAdminUsers({ per_page: 1, role: "TO_CHUC" }),
        getAdminUsers({ per_page: 1, status: "BI_CAM" }),
      ]);
      set({
        usersSummary: {
          total:   getTotal(allRes),
          user:    getTotal(userRes),
          org:     getTotal(orgRes),
          blocked: getTotal(blockedRes),
        },
      });
    } catch (err) { console.error("Lỗi fetch users summary:", err); }
  },

  handleLockUser: async (id) => {
    try {
      await lockUser(id);
      set({ users: get().users.map(u => u.id === id ? { ...u, status: "BI_CAM", status_label: "Đã khóa" } : u) });
      get().fetchUsersSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleUnlockUser: async (id) => {
    try {
      await unlockUser(id);
      set({ users: get().users.map(u => u.id === id ? { ...u, status: "HOAT_DONG", status_label: "Hoạt động" } : u) });
      get().fetchUsersSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== POSTS =====
  fetchPosts: async (params = {}) => {
    if (postsPromise) return postsPromise;
    const merged = { ...get().postsParams, ...params };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== undefined));
    set({ loadingPosts: true, postsParams: merged });
    postsPromise = (async () => {
      try {
        const res = await getAdminPosts(cleaned);
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const meta = res.meta || (res.data?.current_page ? {
          current_page: res.data.current_page,
          per_page:     res.data.per_page,
          total:        res.data.total,
          last_page:    res.data.last_page,
        } : { ...DEFAULT_META });
        set({ posts: list, postsMeta: meta, loadingPosts: false });
      } catch (err) {
        console.error(err);
        set({ loadingPosts: false });
      } finally { postsPromise = null; }
    })();
    return postsPromise;
  },

  fetchPostsSummary: async () => {
    try {
      const [allRes, choRes, nhanRes, reportsRes] = await Promise.all([
        getAdminPosts({ per_page: 1 }),
        getAdminPosts({ per_page: 1, loai_bai: "CHO" }),
        getAdminPosts({ per_page: 1, loai_bai: "NHAN" }),
        getAdminPostReports({ trang_thai: "CHO_XU_LY", limit: 100 }),
      ]);
      const reports = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.data || []);
      set({
        postsSummary: {
          total:   getTotal(allRes),
          cho:     getTotal(choRes),
          nhan:    getTotal(nhanRes),
          vi_pham: reports.length,
        },
      });
    } catch (err) { console.error("Lỗi fetch posts summary:", err); }
  },

  // ===== POST REPORTS =====
  fetchPostReports: async (force = false) => {
    if (!force && get().isFetchedReports) return;
    if (reportsPromise) return reportsPromise;
    set({ loadingReports: true });
    reportsPromise = (async () => {
      try {
        const res = await getAdminPostReports();
        set({ postReports: res.data || [], loadingReports: false, isFetchedReports: true });
      } catch (err) {
        console.error(err);
        set({ loadingReports: false });
      } finally { reportsPromise = null; }
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
    } catch (err) { console.error(err); return false; }
  },

  // ===== CAMPAIGNS =====
  fetchCampaigns: async (params = {}) => {
    if (campaignsPromise) return campaignsPromise;
    const merged = { ...get().campaignsParams, ...params };
    const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== undefined));
    set({ loadingCampaigns: true, campaignsParams: merged });
    campaignsPromise = (async () => {
      try {
        const res = await getAdminCampaigns(cleaned);
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const meta = res.meta || (res.current_page ? {
          current_page: res.current_page,
          per_page:     res.per_page,
          total:        res.total,
          last_page:    res.last_page,
        } : { ...DEFAULT_META });
        set({ campaigns: list, campaignsMeta: meta, loadingCampaigns: false });
      } catch (err) {
        console.error(err);
        set({ loadingCampaigns: false });
      } finally { campaignsPromise = null; }
    })();
    return campaignsPromise;
  },

  fetchCampaignsSummary: async () => {
    try {
      const [allRes, pendingRes, activeRes, completedRes] = await Promise.all([
        getAdminCampaigns({ per_page: 1 }),
        getAdminCampaigns({ per_page: 1, trang_thai: "CHO_XU_LY" }),
        getAdminCampaigns({ per_page: 1, trang_thai: "HOAT_DONG" }),
        getAdminCampaigns({ per_page: 1, trang_thai: "HOAN_THANH" }),
      ]);
      set({
        campaignsSummary: {
          total:     getTotal(allRes),
          pending:   getTotal(pendingRes),
          active:    getTotal(activeRes),
          completed: getTotal(completedRes),
        },
      });
    } catch (err) { console.error("Lỗi fetch campaigns summary:", err); }
  },

  handleApproveCampaign: async (id) => {
    try {
      await approveCampaign(id);
      set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, trang_thai: "HOAT_DONG" } : c) });
      get().fetchCampaignsSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleRejectCampaign: async (id) => {
    try {
      await rejectCampaign(id);
      set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, trang_thai: "TU_CHOI" } : c) });
      get().fetchCampaignsSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handlePauseCampaign: async (id, ly_do = "") => {
    try {
      await pauseCampaign(id, ly_do);
      set({ campaigns: get().campaigns.map(c => c.id === id ? { ...c, trang_thai: "TAM_DUNG" } : c) });
      get().fetchCampaignsSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== ORGANIZATIONS =====
  handleApproveOrg: async (id) => {
    try {
      await approveOrganization(id);
      await get().fetchUsers();
      get().fetchUsersSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleRejectOrg: async (id, ly_do = "Không đủ điều kiện") => {
    try {
      await rejectOrganization(id, ly_do);
      await get().fetchUsers();
      get().fetchUsersSummary();
      return true;
    } catch (err) { console.error(err); return false; }
  },

  // ===== FUND ACCOUNTS =====
  handleLockFundAccount: async (id) => {
    try { await lockFundAccount(id); return true; }
    catch (err) { console.error(err); return false; }
  },

  // ===== FRAUD =====
  fetchFraudAlerts: async () => {
    if (get().isFetchedFraud) return;
    if (fraudPromise) return fraudPromise;
    set({ loadingFraud: true });
    fraudPromise = (async () => {
      try {
        const res = await getFraudAlerts();
        set({ fraudAlerts: res.data || [], loadingFraud: false, isFetchedFraud: true });
      } catch (err) {
        console.error(err);
        set({ loadingFraud: false });
      } finally { fraudPromise = null; }
    })();
    return fraudPromise;
  },

  handleUpdateFraudAlert: async (id, data) => {
    try {
      const res = await updateFraudAlert(id, data);
      set({ fraudAlerts: get().fraudAlerts.map(a => a.id === id ? { ...a, ...res.data } : a) });
      return true;
    } catch (err) { console.error(err); return false; }
  },

  handleAutoCheckFraud: async () => {
    try { await autoCheckFraud(); return true; }
    catch (err) { console.error(err); return false; }
  },

  handleAutoCheckCampaignsFraud: async () => {
    try { await autoCheckCampaignsFraud(); return true; }
    catch (err) { console.error(err); return false; }
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
      } finally { dashboardPromise = null; }
    })();
    return dashboardPromise;
  },

  refreshDashboard: async () => {
    set({ isFetchedDashboard: false });
    return get().fetchDashboard();
  },
}));

export default useAdminStore;