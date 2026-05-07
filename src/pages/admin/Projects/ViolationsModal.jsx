import { useEffect, useState } from "react";
import { notification } from "antd";
import { FiX, FiCheck, FiAlertTriangle, FiUser, FiCpu } from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";

export default function ViolationsModal({ target, onClose }) {
  // target: { id, ten, type: 'campaign' | 'post' }
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const {
    fetchCampaignViolations,
    fetchPostViolations,
    resolveViolation,
  } = useAdminStore();

  const load = async () => {
    setLoading(true);
    const fn = target.type === "post" ? fetchPostViolations : fetchCampaignViolations;
    const data = await fn(target.id);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.id, target.type]);

  const handleResolve = async (item, decision) => {
    if (submittingId) return;
    setSubmittingId(item.id);
    try {
      const ok = await resolveViolation(item, decision);
      if (ok) {
        // remove khỏi list
        setItems((prev) => prev.filter((x) => x.id !== item.id));
        notification.success({
          message: decision === "DA_XU_LY" ? "Đã duyệt vi phạm" : "Đã từ chối vi phạm",
          placement: "topRight",
        });
      } else {
        notification.error({ message: "Xử lý thất bại", placement: "topRight" });
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const sourceLabel = (src) => {
    if (src === "USER_REPORT") return { txt: "Người dùng tố cáo", icon: <FiUser size={11} />, cls: "blue" };
    if (src === "AI_POST") return { txt: "AI - Bài đăng", icon: <FiCpu size={11} />, cls: "purple" };
    if (src === "AI_CAMPAIGN") return { txt: "AI - Chiến dịch", icon: <FiCpu size={11} />, cls: "purple" };
    if (src === "AI_USER") return { txt: "AI - Người dùng", icon: <FiCpu size={11} />, cls: "purple" };
    return { txt: src, icon: null, cls: "gray" };
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleString("vi-VN"); } catch { return iso; }
  };

  return (
    <div className="vio-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vio-modal">
        <div className="vio-modal__header">
          <div>
            <div className="vio-modal__title">
              <FiAlertTriangle size={16} /> Danh sách vi phạm
            </div>
            <div className="vio-modal__sub">{target.ten}</div>
          </div>
          <button className="vio-modal__close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="vio-modal__body">
          {loading ? (
            <div className="vio-empty">Đang tải...</div>
          ) : items.length === 0 ? (
            <div className="vio-empty">
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              Không còn vi phạm nào chờ xử lý
            </div>
          ) : (
            <div className="vio-list">
              {items.map((it) => {
                const src = sourceLabel(it.source);
                const isSubmitting = submittingId === it.id;
                return (
                  <div key={it.id} className="vio-item">
                    <div className="vio-item__head">
                      <span className={`vio-tag vio-tag--${src.cls}`}>
                        {src.icon} {src.txt}
                      </span>
                      <span className="vio-item__date">{fmtDate(it.created_at)}</span>
                    </div>

                    <div className="vio-item__title">{it.reason_title || it.reason_code || "Vi phạm"}</div>
                    {it.reason_text && it.reason_text !== it.reason_title && (
                      <div className="vio-item__desc">{it.reason_text}</div>
                    )}
                    {it.mo_ta && (
                      <div className="vio-item__note">
                        <strong>Mô tả:</strong> {it.mo_ta}
                      </div>
                    )}
                    {it.nguoi_to_cao && (
                      <div className="vio-item__reporter">
                        <FiUser size={11} /> Người tố cáo: <strong>{it.nguoi_to_cao.ho_ten}</strong> ({it.nguoi_to_cao.email})
                      </div>
                    )}

                    <div className="vio-item__actions">
                      <button
                        className="vio-btn vio-btn--success"
                        disabled={isSubmitting}
                        onClick={() => handleResolve(it, "DA_XU_LY")}
                      >
                        <FiCheck size={12} /> {isSubmitting ? "Đang xử lý..." : "Duyệt"}
                      </button>
                      <button
                        className="vio-btn vio-btn--ghost"
                        disabled={isSubmitting}
                        onClick={() => handleResolve(it, "TU_CHOI")}
                      >
                        <FiX size={12} /> Từ chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="vio-modal__footer">
          <button className="vio-btn vio-btn--ghost" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}