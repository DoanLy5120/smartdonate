import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import {
  FiSearch,
  FiEye,
  FiFileText,
  FiPause,
  FiGift,
  FiPackage,
  FiX,
  FiUser,
  FiMapPin,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import { getAdminPostDetail } from "../../../api/adminService";
import Pagination from "../../../components/Pagination";
import ViolationsModal from "../Projects/ViolationsModal";
import SuspendModal from "../Projects/SuspendModal";
import "./Posts.scss";

const STATUS_MAP = {
  CON_NHAN: { label: "Còn nhận", cls: "green" },
  CON_TANG: { label: "Còn tặng", cls: "yellow" },
  DA_NHAN: { label: "Đã nhận", cls: "blue" },
  DA_TANG: { label: "Đã tặng", cls: "blue" },
  HET_HAN: { label: "Hết hạn", cls: "red" },
  TAM_DUNG: { label: "Tạm dừng", cls: "yellow" },
};

export default function Posts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [violationsTarget, setViolationsTarget] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);

  const {
    allPosts,
    loadingPosts,
    fetchPosts,
    handleSuspendPost,
    postViolationSet,
    fetchViolationSets,
  } = useAdminStore();

  useEffect(() => {
    fetchPosts();
    fetchViolationSets();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter, searchInput]);

  function openSuspendModal(p) {
    setSuspendTarget({ id: p.id, ten: p.tieu_de });
  }

  async function handleSuspendSubmit(ly_do) {
    if (!suspendTarget || submitting) return;
    setSubmitting(true);
    try {
      const ok = await handleSuspendPost(suspendTarget.id, ly_do);
      if (ok) {
        notification.success({
          message: "Tạm dừng bài đăng thành công",
          placement: "topRight",
        });
        setSelected(null);
        setSuspendTarget(null);
      } else {
        notification.error({
          message: "Tạm dừng bài đăng thất bại",
          placement: "topRight",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    let list = allPosts;
    if (filter === "cho") list = list.filter((p) => p.loai_bai === "CHO");
    if (filter === "nhan") list = list.filter((p) => p.loai_bai === "NHAN");
    if (filter === "vi_pham")
      list = list.filter((p) => postViolationSet.has(p.id));
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      list = list.filter(
        (p) =>
          p.tieu_de?.toLowerCase().includes(q) ||
          p.dia_diem?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allPosts, filter, searchInput, postViolationSet]);

  const postsSummary = useMemo(
    () => ({
      total: allPosts.length,
      cho: allPosts.filter((p) => p.loai_bai === "CHO").length,
      nhan: allPosts.filter((p) => p.loai_bai === "NHAN").length,
      vi_pham: allPosts.filter((p) => postViolationSet.has(p.id)).length,
    }),
    [allPosts, postViolationSet],
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const visiblePosts = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page],
  );

  async function openDetail(p) {
    setSelected(p);
    setDetail(null);
    setLoadingDetail(true);
    try {
      const res = await getAdminPostDetail(p.id);
      setDetail(res.data || res);
    } catch (e) {
      console.error("Lỗi lấy chi tiết bài đăng:", e);
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    const openPostId = location.state?.openPostId;
    if (!openPostId) return;
    navigate("/admin/posts", { replace: true, state: {} });
    (async () => {
      setSelected({ id: openPostId });
      setDetail(null);
      setLoadingDetail(true);
      try {
        const res = await getAdminPostDetail(openPostId);
        setDetail(res.data || res);
      } catch (e) {
        console.error("Lỗi lấy chi tiết bài đăng:", e);
      } finally {
        setLoadingDetail(false);
      }
    })();
  }, [location.state?.openPostId, navigate]);

  const stats = [
    { label: "Tổng bài", val: postsSummary.total, c: "#dfdbfd", filter: "all" },
    { label: "Cho đồ", val: postsSummary.cho, c: "#d6fce4", filter: "cho" },
    { label: "Nhận đồ", val: postsSummary.nhan, c: "#f8ebd4", filter: "nhan" },
    {
      label: "Vi phạm",
      val: postsSummary.vi_pham,
      c: "#fee2e2",
      filter: "vi_pham",
    },
  ];

  return (
    <div className="pst">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📰 Bài đăng Cho/Nhận</h1>
          <p className="adm-ph__sub">Duyệt và quản lý bài đăng cộng đồng</p>
        </div>
      </div>

      <div className="pst__mini-stats">
        {stats.map((s, i) => (
          <button
            key={i}
            className={`pst__mini-stat${filter === s.filter ? " pst__mini-stat--active" : ""}`}
            style={{ background: s.c }}
            onClick={() => setFilter(s.filter)}
          >
            <div className="pst__mini-val">{s.val}</div>
            <div className="pst__mini-label">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiFileText size={15} /> Danh sách bài đăng
          </span>
          <div className="adm-box__actions">
            <div className="pst__search">
              <FiSearch size={14} />
              <input
                placeholder="Tìm bài đăng..."
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
              <option value="cho">Cho đồ</option>
              <option value="nhan">Nhận đồ</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          {loadingPosts ? (
            <div className="adm-empty">
              <div className="adm-empty__text">Đang tải...</div>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Bài đăng</th>
                  <th>Loại</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Báo cáo</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {visiblePosts.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="adm-empty">
                        <div className="adm-empty__icon">📝</div>
                        <div className="adm-empty__text">Không có bài đăng</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visiblePosts.map((p, i) => {
                    const status = STATUS_MAP[p.trang_thai] || {
                      label: p.trang_thai,
                      cls: "green",
                    };
                    return (
                      <tr key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                        <td style={{ color: "#333", fontSize: 12 }}>
                          {String(p.id).padStart(3, "0")}
                        </td>
                        <td style={{ maxWidth: 240 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {p.tieu_de}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "rgba(51,51,51,0.6)",
                              marginTop: 2,
                            }}
                          >
                            {p.dia_diem}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`adm-tag ${p.loai_bai === "CHO" ? "adm-tag--green" : "adm-tag--blue"}`}
                          >
                            {p.loai_bai === "CHO" ? (
                              <>
                                <FiGift size={10} /> Cho
                              </>
                            ) : (
                              <>
                                <FiPackage size={10} /> Nhận
                              </>
                            )}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                          {p.nguoi_dung_ten || "—"}
                        </td>
                        <td>
                          <span className={`adm-tag adm-tag--${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td>
                          {postViolationSet?.has(p.id) ? (
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
                                  ten: p.tieu_de,
                                  type: "post",
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
                        <td
                          style={{
                            fontSize: 12,
                            color: "rgba(51,51,51,0.6)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {p.created_at?.substring(0, 10)}
                        </td>
                        <td>
                          <div className="pst__actions">
                            <button
                              className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon"
                              title="Xem"
                              onClick={() => openDetail(p)}
                            >
                              <FiEye size={13} />
                            </button>
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

        <Pagination
          meta={{
            current_page: page,
            last_page: totalPages,
            total: filtered.length,
            per_page: PER_PAGE,
          }}
          loading={loadingPosts}
          onChange={(p) => setPage(p)}
        />
      </div>

      {selected &&
        (() => {
          const view = detail || selected;
          const status = STATUS_MAP[view.trang_thai] || {
            label: view.trang_thai,
            cls: "green",
          };
          const images = Array.isArray(view.hinh_anh)
            ? view.hinh_anh
            : Array.isArray(view.hinh_anhs)
              ? view.hinh_anhs
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background:
                          view.loai_bai === "CHO" ? "#f0fdf4" : "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {view.loai_bai === "CHO" ? (
                        <FiGift size={18} color="#22c55e" />
                      ) : (
                        <FiPackage size={18} color="#3b82f6" />
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#1a1a1a",
                        }}
                      >
                        {view.tieu_de}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {view.dia_diem}
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
                  style={{ padding: "12px 22px 0", display: "flex", gap: 6 }}
                >
                  <span
                    className={`adm-tag ${view.loai_bai === "CHO" ? "adm-tag--green" : "adm-tag--blue"}`}
                  >
                    {view.loai_bai === "CHO" ? "Cho đồ" : "Nhận đồ"}
                  </span>
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
                        background: "#f9fafb",
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
                        }}
                      >
                        MÔ TẢ
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#333",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {view.mo_ta}
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
                      THÔNG TIN BÀI ĐĂNG
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
                          icon: <FiUser size={13} />,
                          label: "Tác giả",
                          value:
                            view.nguoi_dung_ten ||
                            view.nguoi_dung?.ho_ten ||
                            "—",
                        },
                        {
                          icon: <FiMapPin size={13} />,
                          label: "Địa điểm",
                          value: view.dia_diem || "—",
                        },
                        {
                          icon: <FiClock size={13} />,
                          label: "Thời gian",
                          value: view.created_at?.substring(0, 10),
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
                          <span
                            style={{ fontSize: 13, color: "#888", width: 80 }}
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
                    {view.trang_thai !== "TAM_DUNG" && (
                      <button
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
                        <FiPause size={13} /> Tạm dừng bài đăng
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
          type="post"
          submitting={submitting}
          onSubmit={handleSuspendSubmit}
          onClose={() => setSuspendTarget(null)}
        />
      )}
    </div>
  );
}
