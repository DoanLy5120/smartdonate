import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import {
  FiSearch,
  FiCheck,
  FiX,
  FiEye,
  FiPause,
  FiFolder,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTarget,
  FiUser,
  FiCalendar,
  FiTrendingUp,
  FiHome,
} from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import {
  getAdminCampaignDetail,
  getAdminCampaigns,
} from "../../../api/adminService";
import Pagination from "../../../components/Pagination";
import ViolationsModal from "./ViolationsModal";
import SuspendModal from "./SuspendModal";
import "./Projects.scss";

const STATUS_MAP = {
  CHO_XU_LY: { label: "Chờ duyệt", cls: "yellow" },
  HOAT_DONG: { label: "Đang chạy", cls: "green" },
  TAM_DUNG: { label: "Tạm dừng", cls: "yellow" },
  DA_KET_THUC: { label: "Đã kết thúc", cls: "blue" },
  HOAN_THANH: { label: "Hoàn thành", cls: "green" },
  TU_CHOI: { label: "Từ chối", cls: "red" },
};

export default function Projects() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  // Modal states
  const [violationsTarget, setViolationsTarget] = useState(null); // { id, ten, type }
  const [suspendTarget, setSuspendTarget] = useState(null); // { id, ten }

  const {
    allCampaigns,
    loadingCampaigns,
    fetchCampaigns,
    handleApproveCampaign,
    handleRejectCampaign,
    handleSuspendCampaign,
    campaignViolationSet,
    fetchViolationSets,
  } = useAdminStore();

  useEffect(() => {
    fetchCampaigns();
    fetchViolationSets();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, searchInput]);

  const filtered = useMemo(() => {
    let list = allCampaigns;
    if (filter === "violations") {
      list = list.filter(
        (c) => c.trang_thai !== "CHO_XU_LY" && campaignViolationSet.has(c.id),
      );
    } else if (filter !== "all") {
      list = list.filter((c) => c.trang_thai === filter);
    }
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      list = list.filter((c) => c.ten_chien_dich?.toLowerCase().includes(q));
    }
    return list;
  }, [allCampaigns, filter, searchInput, campaignViolationSet]);

  const campaignsSummary = useMemo(
    () => ({
      total: allCampaigns.length,
      pending: allCampaigns.filter((c) => c.trang_thai === "CHO_XU_LY").length,
      active: allCampaigns.filter((c) => c.trang_thai === "HOAT_DONG").length,
      completed: allCampaigns.filter((c) => c.trang_thai === "HOAN_THANH")
        .length,
    }),
    [allCampaigns],
  );

  const violationCount = useMemo(
    () =>
      allCampaigns.filter(
        (c) => c.trang_thai !== "CHO_XU_LY" && campaignViolationSet.has(c.id),
      ).length,
    [allCampaigns, campaignViolationSet],
  );

  const visibleCampaigns = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page],
  );

  const stats = [
    { label: "Tổng", val: campaignsSummary.total, c: "#dfdbfd", filter: "all" },
    {
      label: "Chờ duyệt",
      val: campaignsSummary.pending,
      c: "#fef9c3",
      filter: "CHO_XU_LY",
    },
    {
      label: "Đang chạy",
      val: campaignsSummary.active,
      c: "#d6fce4",
      filter: "HOAT_DONG",
    },
    {
      label: "Hoàn thành",
      val: campaignsSummary.completed,
      c: "#dbeafe",
      filter: "HOAN_THANH",
    },
    {
      label: "Vi phạm",
      val: violationCount,
      c: "#fecaca",
      filter: "violations",
    },
  ];

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  async function approve(id) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ok = await handleApproveCampaign(id);
      if (ok) {
        notification.success({
          message: "Duyệt chiến dịch thành công",
          placement: "topRight",
        });
        fetchCampaigns();
        setSelected(null);
      } else {
        notification.error({
          message: "Duyệt chiến dịch thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function reject(id) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ok = await handleRejectCampaign(id);
      if (ok) {
        notification.success({
          message: "Từ chối chiến dịch thành công",
          placement: "topRight",
        });
        fetchCampaigns();
        setSelected(null);
      } else {
        notification.error({
          message: "Từ chối chiến dịch thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function openSuspendModal(c) {
    setSuspendTarget({ id: c.id, ten: c.ten_chien_dich });
  }

  async function handleSuspendSubmit(ly_do) {
    if (!suspendTarget || submitting) return;
    setSubmitting(true);
    try {
      const ok = await handleSuspendCampaign(suspendTarget.id, ly_do);
      if (ok) {
        notification.success({
          message: "Tạm dừng chiến dịch thành công",
          placement: "topRight",
        });
        fetchCampaigns();
        setSelected(null);
        setSuspendTarget(null);
      } else {
        notification.error({
          message: "Tạm dừng chiến dịch thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function openDetail(c) {
    setSelected(c);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const res = await getAdminCampaignDetail(c.id);
      setDetail(res.data || res);
    } catch (e) {
      console.error("Lỗi lấy chi tiết chiến dịch:", e);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    const openCampaignId = location.state?.openCampaignId;
    if (!openCampaignId) return;
    navigate("/admin/projects", { replace: true, state: {} });
    (async () => {
      setSelected({ id: openCampaignId });
      setDetail(null);
      setLoadingDetail(true);
      try {
        const res = await getAdminCampaignDetail(openCampaignId);
        setDetail(res.data || res);
      } catch (e) {
        console.error("Lỗi lấy chi tiết chiến dịch:", e);
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [location.state?.openCampaignId, navigate]);

  return (
    <div className="prj">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📂 Chiến dịch</h1>
          <p className="adm-ph__sub">Quản lý và duyệt chiến dịch gây quỹ</p>
        </div>
      </div>

      <div className="prj__mini-stats">
        {stats.map((s, i) => (
          <button
            key={i}
            className={`prj__mini-stat${filter === s.filter ? " prj__mini-stat--active" : ""}`}
            style={{ background: s.c }}
            onClick={() => setFilter(s.filter)}
          >
            <div className="prj__mini-val">{s.val}</div>
            <div className="prj__mini-label">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiFolder size={15} /> Danh sách chiến dịch
          </span>
          <div className="adm-box__actions">
            <div className="prj__search">
              <FiSearch size={14} />
              <input
                placeholder="Tìm chiến dịch..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#333",
                  fontSize: 13,
                  width: 150,
                }}
              />
            </div>
            <select
              className="adm-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="violations">Vi phạm</option>
              <option value="CHO_XU_LY">Chờ duyệt</option>
              <option value="HOAT_DONG">Đang chạy</option>
              <option value="TAM_DUNG">Tạm dừng</option>
              <option value="HOAN_THANH">Hoàn thành</option>
              <option value="DA_KET_THUC">Đã kết thúc</option>
              <option value="TU_CHOI">Từ chối</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          {loadingCampaigns ? (
            <div className="adm-empty">
              <div className="adm-empty__text">Đang tải...</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chiến dịch</th>
                  <th>Tổ chức</th>
                  <th>Tiến độ</th>
                  <th>Còn lại</th>
                  <th>Vi phạm</th>
                  <th>Trạng thái</th>
                  <th>Xem</th>
                </tr>
              </thead>
              <tbody>
                {visibleCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="adm-empty">
                        <div className="adm-empty__icon">📂</div>
                        <div className="adm-empty__text">
                          Không có chiến dịch
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleCampaigns.map((p, i) => {
                    const pct =
                      p.muc_tieu_tien > 0
                        ? Math.round(
                            ((p.so_tien_da_nhan || 0) * 100) / p.muc_tieu_tien,
                          )
                        : 0;
                    const status = STATUS_MAP[p.trang_thai] || {
                      label: p.trang_thai,
                      cls: "green",
                    };
                    const isPending = p.trang_thai === "CHO_XU_LY";
                    const orgName =
                      p.to_chuc?.ten_to_chuc || p.ten_to_chuc || null;
                    return (
                      <tr key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                        <td style={{ color: "#333", fontSize: 12 }}>
                          {String(p.id).padStart(3, "0")}
                        </td>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13.5,
                              marginBottom: 3,
                            }}
                          >
                            {p.ten_chien_dich}
                          </div>
                        </td>
                        <td style={{ minWidth: 140 }}>
                          {orgName ? (
                            <div
                              style={{
                                display: "flex",
                                fontWeight: 700,
                                alignItems: "center",
                                gap: 6,
                                fontSize: 13.5,
                                color: "#333",
                              }}
                            >
                              <span
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 140,
                                }}
                              >
                                {orgName}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#bbb", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td style={{ minWidth: 160 }}>
                          <div className="prj__progress">
                            <div className="prj__progress-bar">
                              <div
                                className="prj__progress-fill"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="prj__progress-pct">{pct}%</span>
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "rgba(51,51,51,0.6)",
                              marginTop: 4,
                            }}
                          >
                            {Number(p.so_tien_da_nhan || 0).toLocaleString()} /{" "}
                            {Number(p.muc_tieu_tien || 0).toLocaleString()} đ
                          </div>
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 13,
                            }}
                          >
                            <FiClock size={12} style={{ color: "#f59e0b" }} />
                            {p.so_ngay_con_lai || 0} ngày
                          </div>
                        </td>
                        <td>
                          {!isPending && campaignViolationSet?.has(p.id) ? (
                            <button
                              type="button"
                              className="adm-tag adm-tag--red"
                              style={{
                                border: "none",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                padding: "4px 10px",
                              }}
                              title="Xem danh sách vi phạm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViolationsTarget({
                                  id: p.id,
                                  ten: p.ten_chien_dich,
                                  type: "campaign",
                                });
                              }}
                            >
                              <FiAlertTriangle size={11} /> Vi phạm
                            </button>
                          ) : (
                            <span style={{ color: "#bbb", fontSize: 12 }}>
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`adm-tag adm-tag--${status.cls}`}>
                            {status.label}
                          </span>
                        </td>

                        <td>
                          <button
                            className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon"
                            title="Xem chi tiết"
                            onClick={() => openDetail(p)}
                          >
                            <FiEye size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          meta={{
            current_page: page,
            last_page: totalPages,
            total: filtered.length,
            per_page: PER_PAGE,
          }}
          loading={loadingCampaigns}
          onChange={(p) => setPage(p)}
        />
      </div>

      {selected &&
        (() => {
          const view = detail || selected;
          const pct =
            view.muc_tieu_tien > 0
              ? Math.round(
                  ((view.so_tien_da_nhan || 0) * 100) / view.muc_tieu_tien,
                )
              : 0;
          const status = STATUS_MAP[view.trang_thai] || {
            label: view.trang_thai,
            cls: "green",
          };
          const orgName = view.to_chuc?.ten_to_chuc || view.ten_to_chuc;
          const images = Array.isArray(view.hinh_anh)
            ? view.hinh_anh
            : view.hinh_anh
              ? [view.hinh_anh]
              : [];

          return (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={(e) => e.target === e.currentTarget && setSelected(null)}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  width: "100%",
                  maxWidth: 540,
                  maxHeight: "90vh",
                  overflowY: "auto",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
                }}
              >
                <div
                  style={{
                    padding: "20px 22px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        lineHeight: 1.4,
                      }}
                    >
                      {view.ten_chien_dich}
                    </div>
                    {orgName && (
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#7c6df0",
                          marginTop: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FiHome size={12} /> {orgName}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "#f5f5f5",
                      border: "none",
                      borderRadius: "50%",
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#888",
                      flexShrink: 0,
                    }}
                  >
                    <FiX size={16} />
                  </button>
                </div>

                <div
                  style={{ padding: "12px 22px 0", display: "flex", gap: 6 }}
                >
                  <span className={`adm-tag adm-tag--${status.cls}`}>
                    {status.label}
                  </span>
                </div>

                <div
                  style={{
                    padding: "16px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {loadingDetail && (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#888",
                        fontSize: 13,
                        padding: 8,
                      }}
                    >
                      Đang tải chi tiết...
                    </div>
                  )}

                  {images[0] && (
                    <img
                      src={images[0]}
                      alt=""
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        maxHeight: 220,
                        objectFit: "cover",
                      }}
                    />
                  )}

                  {view.mo_ta && (
                    <div
                      style={{
                        background: "#fafafa",
                        borderRadius: 10,
                        padding: "12px 14px",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#888",
                          marginBottom: 6,
                          letterSpacing: "0.5px",
                        }}
                      >
                        MÔ TẢ
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#444",
                          lineHeight: 1.5,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {view.mo_ta}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      background: "#fffbeb",
                      borderRadius: 10,
                      padding: "12px 14px",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#92400e",
                        marginBottom: 8,
                        letterSpacing: "0.5px",
                      }}
                    >
                      TIẾN ĐỘ GÂY QUỸ
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#78350f" }}>
                        Đã gây được
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#d97706",
                        }}
                      >
                        {Number(view.so_tien_da_nhan || 0).toLocaleString()} /{" "}
                        {Number(view.muc_tieu_tien || 0).toLocaleString()} đ
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#fde68a",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min(pct, 100)}%`,
                          background: "#f59e0b",
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#d97706",
                        marginTop: 4,
                      }}
                    >
                      {pct}%
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#888",
                        marginBottom: 10,
                        letterSpacing: "0.5px",
                      }}
                    >
                      THÔNG TIN CHI TIẾT
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        borderRadius: 10,
                        overflow: "hidden",
                        border: "1px solid #f0f0f0",
                      }}
                    >
                      {[
                        {
                          icon: <FiTarget size={13} />,
                          label: "Mục tiêu",
                          value:
                            Number(view.muc_tieu_tien || 0).toLocaleString() +
                            " đ",
                        },
                        {
                          icon: <FiTrendingUp size={13} />,
                          label: "Đã nhận",
                          value:
                            Number(view.so_tien_da_nhan || 0).toLocaleString() +
                            " đ",
                        },
                        {
                          icon: <FiUser size={13} />,
                          label: "Lượt ủng hộ",
                          value: view.so_luot_ung_ho || 0,
                        },
                        {
                          icon: <FiClock size={13} />,
                          label: "Còn lại",
                          value: `${view.so_ngay_con_lai || 0} ngày`,
                        },
                        {
                          icon: <FiCalendar size={13} />,
                          label: "Ngày kết thúc",
                          value: view.ngay_ket_thuc?.substring(0, 10),
                        },
                      ]
                        .filter(
                          (r) => r.value !== undefined && r.value !== null,
                        )
                        .map((row, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "11px 14px",
                              background: "#fafafa",
                              gap: 10,
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <span
                              style={{
                                color: "#888",
                                width: 18,
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {row.icon}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: "#888",
                                width: 110,
                              }}
                            >
                              {row.label}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#1a1a1a",
                              }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "center",
                      marginTop: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      style={{
                        padding: "10px 22px",
                        border: "1px solid #e0e0e0",
                        borderRadius: 8,
                        background: "none",
                        fontSize: 13,
                        color: "#888",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelected(null)}
                    >
                      Đóng
                    </button>
                    {view.trang_thai === "CHO_XU_LY" && (
                      <>
                        <button
                          className="adm-btn adm-btn--success"
                          disabled={submitting}
                          style={{
                            padding: "10px 22px",
                            borderRadius: 8,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                          }}
                          onClick={() => approve(view.id)}
                        >
                          <FiCheck size={13} />{" "}
                          {submitting ? "Đang xử lý..." : "Duyệt chiến dịch"}
                        </button>
                        <button
                          className="adm-btn adm-btn--danger"
                          disabled={submitting}
                          style={{
                            padding: "10px 22px",
                            borderRadius: 8,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            opacity: submitting ? 0.6 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                          }}
                          onClick={() => reject(view.id)}
                        >
                          <FiX size={13} /> Từ chối
                        </button>
                      </>
                    )}
                    {view.trang_thai === "HOAT_DONG" && (
                      <button
                        className="adm-btn adm-btn--warning"
                        disabled={submitting}
                        style={{
                          padding: "10px 22px",
                          borderRadius: 8,
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          opacity: submitting ? 0.6 : 1,
                          cursor: submitting ? "not-allowed" : "pointer",
                          background: "#f59e0b",
                          color: "#fff",
                          border: "none",
                        }}
                        onClick={() => openSuspendModal(view)}
                      >
                        <FiPause size={13} />{" "}
                        {submitting ? "Đang xử lý..." : "Tạm dừng chiến dịch"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {violationsTarget && (
        <ViolationsModal
          target={violationsTarget}
          onClose={() => {
            setViolationsTarget(null);
            fetchViolationSets();
          }}
        />
      )}

      {suspendTarget && (
        <SuspendModal
          target={suspendTarget}
          type="campaign"
          submitting={submitting}
          onSubmit={handleSuspendSubmit}
          onClose={() => setSuspendTarget(null)}
        />
      )}
    </div>
  );
}
