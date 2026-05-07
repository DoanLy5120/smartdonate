import { useState, useEffect } from "react";
import { FiX, FiPause, FiCheck } from "react-icons/fi";
import { getViolationReasons } from "../../../api/adminService";

export default function SuspendModal({ target, type = "campaign", submitting, onSubmit, onClose }) {
  // type: 'campaign' | 'post'
  const [reasons, setReasons] = useState([]);
  const [loadingReasons, setLoadingReasons] = useState(true);
  const [selectedCode, setSelectedCode] = useState(null);
  const [customText, setCustomText] = useState("");

  const labelType = type === "campaign" ? "chiến dịch" : "bài đăng";

  // Lấy lý do từ BE
  useEffect(() => {
    const load = async () => {
      setLoadingReasons(true);
      try {
        const res = await getViolationReasons();
        const data = res?.data || {};
        // Post dùng user_report, campaign dùng ai_campaign
        const list = type === "post"
          ? (data.user_report || [])
          : (data.ai_campaign || []);
        setReasons(list);
      } catch (err) {
        console.error("Lỗi lấy lý do vi phạm:", err);
        setReasons([]);
      } finally {
        setLoadingReasons(false);
      }
    };
    load();
  }, [type]);

  const selectedReason = reasons.find((r) => r.code === selectedCode);
  const needCustomText = selectedReason?.require_mo_ta || selectedReason?.code === "KHAC";

  // Tính lý do cuối cùng gửi lên BE
  const getFinalReason = () => {
    if (!selectedReason) return customText.trim();
    if (needCustomText && customText.trim()) {
      return `${selectedReason.title}: ${customText.trim()}`;
    }
    return selectedReason.title;
  };

  const canSubmit =
    selectedCode !== null &&
    (!needCustomText || customText.trim().length > 0);

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    onSubmit(getFinalReason());
  };

  return (
    <div className="sus-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sus-modal">
        <div className="sus-modal__header">
          <div>
            <div className="sus-modal__title">
              <FiPause size={16} /> Tạm dừng {labelType}
            </div>
            <div className="sus-modal__sub">{target.ten}</div>
          </div>
          <button className="sus-modal__close" onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>

        <div className="sus-modal__body">
          <div className="sus-section">
            <div className="sus-section__title">Chọn lý do tạm dừng *</div>

            {loadingReasons ? (
              <div className="sus-loading">Đang tải lý do...</div>
            ) : reasons.length === 0 ? (
              /* Fallback: không lấy được từ BE thì gõ tay */
              <textarea
                className="sus-textarea"
                placeholder="Nhập lý do tạm dừng..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={4}
                maxLength={255}
                autoFocus
              />
            ) : (
              <>
                <div className="sus-reasons">
                  {reasons.map((r) => (
                    <button
                      key={r.code}
                      className={`sus-reason-chip${selectedCode === r.code ? " sus-reason-chip--active" : ""}`}
                      onClick={() => {
                        setSelectedCode(r.code);
                        setCustomText("");
                      }}
                    >
                      {selectedCode === r.code && <FiCheck size={12} />}
                      {r.title}
                    </button>
                  ))}
                </div>

                {/* Mô tả lý do được chọn */}
                {selectedReason?.description && (
                  <div className="sus-reason-desc">
                    💡 {selectedReason.description}
                  </div>
                )}

                {/* Textarea thêm nếu chọn "Lý do khác" hoặc require_mo_ta */}
                {needCustomText && (
                  <textarea
                    className="sus-textarea sus-textarea--mt"
                    placeholder="Mô tả chi tiết lý do..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    rows={3}
                    maxLength={255}
                    autoFocus
                  />
                )}
              </>
            )}

            <div className="sus-hint">
              Lý do sẽ được gửi đến chủ {labelType} qua thông báo realtime.
            </div>
          </div>
        </div>

        <div className="sus-modal__footer">
          <button className="sus-btn sus-btn--ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button
            className="sus-btn sus-btn--warning"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            <FiPause size={12} /> {submitting ? "Đang xử lý..." : "Xác nhận tạm dừng"}
          </button>
        </div>
      </div>
    </div>
  );
}