import { create } from "zustand";
import {
  getOrganizations,
  getOrganizationDetail,
  registerOrganization,
  getOrganizationStatus,
} from "../api/organizationService";

let organizationsPromise = null;
const detailPromises = {}; 

const useOrganizationStore = create((set, get) => ({
  organizations: [],
  orgTypes: [],
  pagination: {},
  total: 0,
  loadingList: false,
  organizationDetail: {},
  organizationStatus: null,
  loadingStatus: false,
  loadingRegister: false,

  loading: false,

  isFetchedOrganizations: false,

  // ===== LIST =====
  fetchOrganizations: async (params = {}) => {
    if (organizationsPromise) return organizationsPromise;

    set({ loading: true });

    organizationsPromise = getOrganizations(params);

    try {
      const res = await organizationsPromise;

      set({
        organizations: res.data.data.data,
        pagination: res.data.data,
        orgTypes: res.data.theo_loai,
        loading: false,
        isFetchedOrganizations: true,
      });
    } catch (err) {
      console.error("Lỗi fetch organizations:", err);
      set({ loading: false });
    } finally {
      organizationsPromise = null;
    }
  },

  // ===== DETAIL =====
  fetchOrganizationDetail: async (id) => {
    const sid = String(id);

    const cached = get().organizationDetail[sid];
    if (cached) return cached;

    if (detailPromises[sid]) return detailPromises[sid];

    set({ loading: true });

    detailPromises[sid] = (async () => {
      try {
        const data = await getOrganizationDetail(id);

        data.bao_cao_chi = [
          {
            ten_chien_dich:
              data.chien_dichs?.[0]?.ten_chien_dich ?? "Chiến dịch 1",
            hinh_anh: data.chien_dichs?.[0]?.hinh_anh ?? "",
            tong_chi: 900000000,
            cac_khoan_chi: [
              {
                hang_muc: "Mua lương thực, nhu yếu phẩm",
                so_tien: 320000000,
                ghi_chu: "Gạo, mì, dầu ăn",
              },
              {
                hang_muc: "Chi phí vận chuyển",
                so_tien: 85000000,
                ghi_chu: "Thuê xe tải 3 chuyến",
              },
              {
                hang_muc: "Hỗ trợ tiền mặt hộ gia đình",
                so_tien: 400000000,
                ghi_chu: "120 hộ × 3.300.000₫",
              },
              {
                hang_muc: "Chi phí điều phối",
                so_tien: 45000000,
                ghi_chu: null,
              },
              {
                hang_muc: "Thuốc men, vật tư y tế",
                so_tien: 50000000,
                ghi_chu: null,
              },
            ],
          },
          {
            ten_chien_dich:
              data.chien_dichs?.[1]?.ten_chien_dich ?? "Chiến dịch 2",
            hinh_anh: data.chien_dichs?.[1]?.hinh_anh ?? "",
            tong_chi: 215000000,
            cac_khoan_chi: [
              {
                hang_muc: "Vật liệu xây dựng đợt 1",
                so_tien: 130000000,
                ghi_chu: "Xi măng, sắt thép, gạch",
              },
              {
                hang_muc: "Nhân công thi công",
                so_tien: 60000000,
                ghi_chu: null,
              },
              {
                hang_muc: "Vận chuyển vật liệu",
                so_tien: 25000000,
                ghi_chu: "Đường núi khó đi",
              },
            ],
          },
        ];

        set({
          organizationDetail: {
            ...get().organizationDetail,
            [sid]: data,
          },
          loading: false,
        });

        return data;
      } catch (err) {
        console.error("Lỗi fetch organization detail:", err);
        set({ loading: false });
        return null;
      } finally {
        delete detailPromises[sid]; 
      }
    })();

    return detailPromises[sid];
  },

  fetchOrganizationStatus: async () => {
    if (get().loadingStatus) return;

    set({ loadingStatus: true });

    try {
      const data = await getOrganizationStatus();

      set({
        organizationStatus: data || null,
        loadingStatus: false,
      });

      return data;
    } catch (err) {
      console.error("Lỗi fetch status:", err);
      set({ loadingStatus: false });
      return null;
    }
  },

  registerOrganization: async (values) => {
    if (get().loadingRegister) return;

    set({ loadingRegister: true });

    try {
      const formData = new FormData();

      const textFields = [
        "ten_to_chuc",
        "ma_so_thue",
        "nguoi_dai_dien",
        "loai_hinh",
        "mo_ta",
        "dia_chi",
        "so_dien_thoai",
        "lat",
        "lng",
      ];

      textFields.forEach((key) => {
        if (
          values[key] !== undefined &&
          values[key] !== null &&
          values[key] !== ""
        ) {
          formData.append(key, values[key]);
        }
      });

      if (values.giay_phep) {
        formData.append(
          "giay_phep",
          values.giay_phep.originFileObj || values.giay_phep,
        );
      }

      if (values.logo) {
        formData.append("logo", values.logo.originFileObj || values.logo);
      }

      const res = await registerOrganization(formData);

      await get().fetchOrganizationStatus();
      set({ loadingRegister: false });

      return res.data;
    } catch (err) {
      console.error("Lỗi register:", err);
      set({ loadingRegister: false });
      throw err;
    }
  },
}));

export default useOrganizationStore;
