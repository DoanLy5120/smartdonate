import { useState, useEffect } from "react";
import { notification } from "antd";
import {
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiShield,
  FiUser,
  FiX,
  FiMail,
  FiCalendar,
  FiAlertTriangle,
  FiHome,
  FiTag,
  FiFile,
} from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import { getPendingOrgLicense } from "../../../api/adminService";
import Pagination from "../../../components/Pagination";
import "./Users.scss";

const STATUS_MAP = {
  HOAT_DONG: { label: "Hoạt động", cls: "green" },
  BI_CAM: { label: "Đã khóa", cls: "red" },
};

const ROLE_MAP = {
  NGUOI_DUNG: { label: "Người dùng", cls: "blue" },
  TO_CHUC: { label: "Tổ chức", cls: "purple" },
  ADMIN: { label: "Admin", cls: "red" },
};

const LOAI_HINH_MAP = {
  DOANH_NGHIEP: "Doanh nghiệp",
  NHA_NUOC: "Nhà nước",
  QUY_TU_THIEN: "Quỹ từ thiện",
};

// Một user được coi là "chờ duyệt TC" khi BE trả status_label = "Chờ duyệt"
// (BE check: nếu user có XacMinhToChuc với trang_thai = CHO_XU_LY thì hiển thị "Chờ duyệt")
const isPendingOrg = (u) => u.status_label === "Chờ duyệt";

export default function Users() {
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("all"); // all | org | user | blocked | pending
  const [selected, setSelected] = useState(null);
  const [orgDetail, setOrgDetail] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    users,
    usersMeta,
    usersParams,
    usersSummary,
    loadingUsers,
    fetchUsers,
    fetchUsersSummary,
    handleLockUser,
    handleUnlockUser,
    handleApproveOrg,
    handleRejectOrg,
  } = useAdminStore();

  // Fetch lần đầu
  useEffect(() => {
    fetchUsers({ page: 1 });
    fetchUsersSummary();
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== usersParams.search) {
        fetchUsers({ page: 1, search: searchInput });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Khi filter đổi → gọi lại với role/status
  useEffect(() => {
    let role = "",
      status = "";
    if (filter === "org") role = "TO_CHUC";
    if (filter === "user") role = "NGUOI_DUNG";
    if (filter === "blocked") status = "BI_CAM";
    if (filter !== "pending") {
      fetchUsers({ page: 1, role, status });
    } else {
      fetchUsers({ page: 1, role: "", status: "" });
    }
  }, [filter]);

  // Filter "Chờ duyệt" client-side (vì BE chưa có param riêng cho org status)
  const visibleUsers =
    filter === "pending" ? users.filter(isPendingOrg) : users;

  async function handleSelect(u) {
    setSelected(u);
    setOrgDetail(null);
    if (u.role === "TO_CHUC" || isPendingOrg(u)) {
      setLoadingOrg(true);
      try {
        // Endpoint showLicense lookup theo nguoi_dung_id, trả full hồ sơ xác minh
        // → dùng được cho cả TC chờ duyệt + TC đã duyệt
        const res = await getPendingOrgLicense(u.id);
        setOrgDetail(res.data || res);
      } catch (e) {
        console.error("Lỗi lấy thông tin tổ chức:", e);
      } finally {
        setLoadingOrg(false);
      }
    }
  }

  async function toggleBlock(id, status) {
    if (status === "BI_CAM") {
      const ok = await handleUnlockUser(id);
      if (ok)
        notification.success({
          message: "Mở khóa thành công",
          placement: "topRight",
        });
      else
        notification.error({
          message: "Mở khóa thất bại",
          placement: "topRight",
        });
    } else {
      const ok = await handleLockUser(id);
      if (ok)
        notification.success({
          message: "Khóa tài khoản thành công",
          placement: "topRight",
        });
      else
        notification.error({
          message: "Khóa tài khoản thất bại",
          placement: "topRight",
        });
    }
  }

  async function approveOrg(id) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const ok = await handleApproveOrg(id);
      if (ok) {
        notification.success({
          message: "Duyệt tổ chức thành công",
          placement: "topRight",
        });
        setSelected(null);
      } else {
        notification.error({
          message: "Duyệt tổ chức thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function rejectOrg(id) {
    if (submitting) return;
    const ly_do = window.prompt("Nhập lý do từ chối:");
    if (!ly_do?.trim()) return;
    setSubmitting(true);
    try {
      const ok = await handleRejectOrg(id, ly_do.trim());
      if (ok) {
        notification.success({
          message: "Đã từ chối tổ chức",
          placement: "topRight",
        });
        setSelected(null);
      } else {
        notification.error({
          message: "Từ chối thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const getFileName = (url) => {
    if (!url) return "";
    return url.split("/").pop();
  };

  return (
    <div className="usr">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">👥 Người dùng</h1>
          <p className="adm-ph__sub">
            {usersSummary.total} tài khoản trong hệ thống
          </p>
        </div>
      </div>

      <div className="usr__mini-stats">
        {[
          {
            label: "Tổng",
            val: usersSummary.total,
            c: "#dfdbfd",
            filter: "all",
          },
          {
            label: "Người dùng",
            val: usersSummary.user,
            c: "#dbeafe",
            filter: "user",
          },
          {
            label: "Tổ chức",
            val: usersSummary.org,
            c: "#ede9fe",
            filter: "org",
          },
          {
            label: "Chờ duyệt",
            val: users.filter(isPendingOrg).length,
            c: "#fef9c3",
            filter: "pending",
          },
          {
            label: "Đã khóa",
            val: usersSummary.blocked,
            c: "#fee2e2",
            filter: "blocked",
          },
        ].map((s, i) => (
          <button
            key={i}
            className={`usr__mini-stat${filter === s.filter ? " usr__mini-stat--active" : ""}`}
            style={{ background: s.c }}
            onClick={() => setFilter(s.filter)}
          >
            <div className="usr__mini-val">{s.val}</div>
            <div className="usr__mini-label">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiUser size={15} /> Danh sách tài khoản
          </span>
          <div className="adm-box__actions">
            <div className="usr__search">
              <FiSearch size={14} />
              <input
                className="adm-input"
                placeholder="Tìm theo tên, email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  border: "none",
                  background: "none",
                  outline: "none",
                  color: "#333",
                  fontSize: 13,
                  width: 160,
                }}
              />
            </div>
            <select
              className="adm-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="user">Người dùng</option>
              <option value="org">Tổ chức</option>
              <option value="pending">Chờ duyệt TC</option>
              <option value="blocked">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          {loadingUsers ? (
            <div className="adm-empty">
              <div className="adm-empty__text">Đang tải...</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Tham gia</th>
                  <th>Vi phạm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="adm-empty">
                        <div className="adm-empty__icon">👤</div>
                        <div className="adm-empty__text">
                          Không tìm thấy người dùng
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((u, i) => {
                    const role = ROLE_MAP[u.role] || {
                      label: u.role_label || u.role,
                      cls: "blue",
                    };
                    const status = STATUS_MAP[u.status] || {
                      label: u.status_label || u.status,
                      cls: "green",
                    };
                    const pending = isPendingOrg(u);
                    return (
                      <tr key={u.id} style={{ animationDelay: `${i * 0.05}s` }}>
                        <td style={{ color: "#333", fontSize: 12 }}>
                          {String(u.id).padStart(3, "0")}
                        </td>
                        <td>
                          <div className="usr__user-cell">
                            <div
                              className="adm-avatar"
                              style={{
                                background:
                                  u.role === "TO_CHUC"
                                    ? "linear-gradient(135deg,#7c6df0,#f43f5e)"
                                    : "linear-gradient(135deg,#3b82f6,#22c55e)",
                              }}
                            >
                              {(u.name || "U")[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                                {u.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--adm-text-sub)",
                                }}
                              >
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`adm-tag adm-tag--${role.cls}`}>
                            {role.label}
                          </span>
                        </td>
                        <td>
                          {pending ? (
                            <span className="adm-tag adm-tag--yellow">
                              ⏳ Chờ duyệt TC
                            </span>
                          ) : (
                            <span className={`adm-tag adm-tag--${status.cls}`}>
                              {status.label}
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            fontSize: 12.5,
                            color: "var(--adm-text-sub)",
                          }}
                        >
                          {u.joined_at?.substring(0, 10)}
                        </td>
                        <td>
                          {(u.violation_count || 0) > 0 ? (
                            <span className="adm-tag adm-tag--red">
                              {u.violation_count} lần
                            </span>
                          ) : (
                            <span
                              style={{
                                color: "var(--adm-text-sub)",
                                fontSize: 13,
                              }}
                            >
                              —
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="usr__actions">
                            <button
                              className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon"
                              title="Xem chi tiết"
                              onClick={() => handleSelect(u)}
                            >
                              <FiEye size={13} />
                            </button>
                            {u.role !== "ADMIN" && !pending && (
                              <button
                                className={`adm-btn adm-btn--sm ${u.status === "BI_CAM" ? "adm-btn--success" : "adm-btn--danger"}`}
                                onClick={() => toggleBlock(u.id, u.status)}
                              >
                                {u.status === "BI_CAM" ? (
                                  <>
                                    <FiUserCheck size={12} /> Mở
                                  </>
                                ) : (
                                  <>
                                    <FiUserX size={12} /> Khóa
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {filter !== "pending" && (
          <Pagination
            meta={usersMeta}
            loading={loadingUsers}
            onChange={(page) => fetchUsers({ page })}
          />
        )}
      </div>

      {selected && (
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
              maxWidth: 480,
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
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background:
                      selected.role === "TO_CHUC" ? "#f3f0ff" : "#f0f7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 600,
                    color: selected.role === "TO_CHUC" ? "#7c3aed" : "#3b82f6",
                  }}
                >
                  {(selected.name || "U")[0]}
                </div>
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}
                  >
                    {selected.name}
                  </div>
                  <div style={{ fontSize: 13, color: "#888" }}>
                    {selected.email}
                  </div>
                </div>
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
                }}
              >
                <FiX size={16} />
              </button>
            </div>

            <div
              style={{
                padding: "12px 22px 0",
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              <span
                className={`adm-tag adm-tag--${(ROLE_MAP[selected.role] || { cls: "blue" }).cls}`}
              >
                {selected.role_label || selected.role}
              </span>
              {isPendingOrg(selected) ? (
                <span className="adm-tag adm-tag--yellow">⏳ Chờ duyệt TC</span>
              ) : (
                <span
                  className={`adm-tag adm-tag--${(STATUS_MAP[selected.status] || { cls: "green" }).cls}`}
                >
                  {selected.status_label || selected.status}
                </span>
              )}
            </div>

            <div
              style={{
                padding: "16px 22px",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {(selected.violation_count || 0) > 0 && (
                <div
                  style={{
                    background: "#fef2f2",
                    borderRadius: 10,
                    padding: "12px 14px",
                    border: "1px solid #fecaca",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#fee2e2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiAlertTriangle size={16} color="#ef4444" />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#dc2626",
                      }}
                    >
                      Có {selected.violation_count} lần vi phạm
                    </div>
                    <div style={{ fontSize: 12, color: "#ef4444" }}>
                      Tài khoản này đã bị báo cáo vi phạm
                    </div>
                  </div>
                </div>
              )}

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
                  THÔNG TIN CÁ NHÂN
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
                      icon: <FiMail size={13} />,
                      label: "Email",
                      value: selected.email,
                    },
                    {
                      icon: <FiCalendar size={13} />,
                      label: "Tham gia",
                      value: selected.joined_at?.substring(0, 10),
                    },
                    {
                      icon: <FiAlertTriangle size={13} />,
                      label: "Vi phạm",
                      value:
                        (selected.violation_count || 0) > 0
                          ? `${selected.violation_count} lần`
                          : "Không có",
                      valueColor:
                        (selected.violation_count || 0) > 0
                          ? "#ef4444"
                          : "#16a34a",
                    },
                  ].map((row, i) => (
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
                      <span style={{ fontSize: 13, color: "#888", width: 80 }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: row.valueColor || "#1a1a1a",
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(selected.role === "TO_CHUC" || isPendingOrg(selected)) && (
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#7c3aed",
                      marginBottom: 10,
                      letterSpacing: "0.5px",
                    }}
                  >
                    THÔNG TIN TỔ CHỨC
                  </div>
                  {loadingOrg ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#888",
                        fontSize: 13,
                        padding: 12,
                      }}
                    >
                      Đang tải...
                    </div>
                  ) : orgDetail ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          borderRadius: 10,
                          overflow: "hidden",
                          border: "1px solid #ede9fe",
                        }}
                      >
                        {[
                          {
                            icon: <FiHome size={13} />,
                            label: "Tên tổ chức",
                            value: orgDetail.ten_to_chuc,
                          },
                          {
                            icon: <FiShield size={13} />,
                            label: "Mã số thuế",
                            value: orgDetail.ma_so_thue,
                          },
                          {
                            icon: <FiUser size={13} />,
                            label: "Người đại diện",
                            value: orgDetail.nguoi_dai_dien,
                          },
                          {
                            icon: <FiTag size={13} />,
                            label: "Loại hình",
                            value:
                              LOAI_HINH_MAP[orgDetail.loai_hinh] ||
                              orgDetail.loai_hinh,
                          },
                          {
                            icon: <FiMail size={13} />,
                            label: "Email TC",
                            value: orgDetail.email,
                          },
                          {
                            icon: <FiHome size={13} />,
                            label: "Địa chỉ",
                            value: orgDetail.dia_chi,
                          },
                        ]
                          .filter((r) => r.value)
                          .map((row, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                padding: "11px 14px",
                                background: "#faf8ff",
                                gap: 10,
                                borderBottom: "1px solid #ede9fe",
                              }}
                            >
                              <span
                                style={{
                                  color: "#7c3aed",
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
                                  width: 100,
                                  flexShrink: 0,
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
                      {orgDetail.mo_ta && (
                        <div
                          style={{
                            marginTop: 10,
                            background: "#faf8ff",
                            borderRadius: 10,
                            padding: "12px 14px",
                            border: "1px solid #ede9fe",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 500,
                              color: "#7c3aed",
                              marginBottom: 6,
                            }}
                          >
                            Mô tả
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#444",
                              lineHeight: 1.5,
                            }}
                          >
                            {orgDetail.mo_ta}
                          </div>
                        </div>
                      )}
                      {orgDetail.giay_phep && (
                        <div
                          style={{
                            marginTop: 10,
                            background: "#f0fdf4",
                            borderRadius: 10,
                            padding: "12px 14px",
                            border: "1px solid #bbf7d0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <FiFile size={16} color="#16a34a" />
                            <div>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#15803d",
                                }}
                              >
                                Giấy phép hoạt động
                              </div>
                              <div style={{ fontSize: 12, color: "#22c55e" }}>
                                {getFileName(orgDetail.giay_phep)}
                              </div>
                            </div>
                          </div>
                          <button
                            style={{
                              background: "#22c55e",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 14px",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                            onClick={() =>
                              window.open(`${orgDetail.giay_phep}`, "_blank")
                            }
                          >
                            <FiEye size={12} /> Xem
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#888",
                        fontSize: 13,
                        padding: 12,
                      }}
                    >
                      Không có thông tin tổ chức
                    </div>
                  )}
                </div>
              )}

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
                {isPendingOrg(selected) && orgDetail?.id && (
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
                      onClick={() => approveOrg(orgDetail.id)}
                    >
                      <FiShield size={13} />{" "}
                      {submitting ? "Đang xử lý..." : "Duyệt tổ chức"}
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
                      onClick={() => rejectOrg(orgDetail.id)}
                    >
                      <FiX size={13} /> Từ chối
                    </button>
                  </>
                )}
                {selected.role !== "ADMIN" && !isPendingOrg(selected) && (
                  <button
                    className={`adm-btn ${selected.status === "BI_CAM" ? "adm-btn--success" : "adm-btn--danger"}`}
                    style={{
                      padding: "10px 22px",
                      borderRadius: 8,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={() => {
                      toggleBlock(selected.id, selected.status);
                      setSelected(null);
                    }}
                  >
                    {selected.status === "BI_CAM" ? (
                      <>
                        <FiUserCheck size={13} /> Mở khóa
                      </>
                    ) : (
                      <>
                        <FiUserX size={13} /> Khóa tài khoản
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}