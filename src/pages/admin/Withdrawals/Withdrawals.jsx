import { useState, useEffect } from "react";
import { notification } from "antd";
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCheck,
  FiX,
  FiDollarSign,
  FiBriefcase,
  FiCalendar,
  FiHash,
  FiAlertCircle,
} from "react-icons/fi";
import {
  getAdminWithdrawRequests,
  confirmWithdrawRequest,
  rejectWithdrawRequest,
} from "../../../api/adminService";
import "./Withdrawals.scss";

const STATUS_TABS = [
  {
    key: "CHO_DUYET",
    label: "Chờ duyệt",
    icon: <FiClock size={14} />,
    cls: "yellow",
  },
  {
    key: "DA_DUYET",
    label: "Đã duyệt",
    icon: <FiCheckCircle size={14} />,
    cls: "green",
  },
  {
    key: "TU_CHOI",
    label: "Từ chối",
    icon: <FiXCircle size={14} />,
    cls: "red",
  },
];

function fmtVnd(n) {
  if (!n && n !== 0) return "—";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

// Lấy local datetime theo format YYYY-MM-DDTHH:MM (không bị UTC)
const getLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 16);
};

export default function Withdrawals() {
  const [tab, setTab] = useState("CHO_DUYET");
  const [loading, setLoading] = useState(false);
  const [allList, setAllList] = useState([]);

  // Modal
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confirm form
  const [confirmForm, setConfirmForm] = useState({
    ma_giao_dich_ngan_hang: "",
    ngay_giao_dich: getLocalDateTime(),
    ghi_chu_admin: "",
  });
  const [rejectReason, setRejectReason] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAdminWithdrawRequests();
      setAllList(res?.data || []);
    } catch (err) {
      notification.error({
        message: "Không tải được danh sách",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const list = allList.filter((r) => r.trang_thai === tab);
  const counts = {
    CHO_DUYET: allList.filter((r) => r.trang_thai === "CHO_DUYET").length,
    DA_DUYET: allList.filter((r) => r.trang_thai === "DA_DUYET").length,
    TU_CHOI: allList.filter((r) => r.trang_thai === "TU_CHOI").length,
  };

  const openConfirm = (item) => {
    setConfirmForm({
      ma_giao_dich_ngan_hang: "",
      ngay_giao_dich: getLocalDateTime(),
      ghi_chu_admin: "",
    });
    setConfirmTarget(item);
  };

  const openReject = (item) => {
    setRejectReason("");
    setRejectTarget(item);
  };

  const handleConfirm = async () => {
    if (!confirmForm.ma_giao_dich_ngan_hang.trim()) {
      notification.warning({
        message: "Vui lòng nhập mã giao dịch ngân hàng!",
        placement: "topRight",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...confirmForm,
        ngay_giao_dich: confirmForm.ngay_giao_dich + ":00+07:00",
      };
      await confirmWithdrawRequest(confirmTarget.id, payload);
      notification.success({
        message: "Đã xác nhận giao dịch!",
        placement: "topRight",
      });
      setConfirmTarget(null);
      setAllList((prev) =>
        prev.map((r) =>
          r.id === confirmTarget.id
            ? { ...r, trang_thai: "DA_DUYET", ...confirmForm }
            : r,
        ),
      );
    } catch (err) {
      notification.error({
        message: "Xác nhận thất bại",
        description: err?.response?.data?.message || err?.message,
        placement: "topRight",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      notification.warning({
        message: "Vui lòng nhập lý do từ chối!",
        placement: "topRight",
      });
      return;
    }
    setSubmitting(true);
    try {
      await rejectWithdrawRequest(rejectTarget.id, {
        ghi_chu_admin: rejectReason,
      });
      notification.success({
        message: "Đã từ chối yêu cầu!",
        placement: "topRight",
      });
      setRejectTarget(null);
      setAllList((prev) =>
        prev.map((r) =>
          r.id === rejectTarget.id
            ? { ...r, trang_thai: "TU_CHOI", ghi_chu_admin: rejectReason }
            : r,
        ),
      );
    } catch (err) {
      notification.error({
        message: "Từ chối thất bại",
        description: err?.response?.data?.message || err?.message,
        placement: "topRight",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adw">
      {/* Header */}
      <div className="adw-ph">
        <div>
          <div className="adw-ph__title">💸 Quản lý yêu cầu rút tiền</div>
          <div className="adw-ph__sub">
            Xác nhận hoặc từ chối các yêu cầu rút tiền từ tổ chức gây quỹ
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="adw-tabs">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            className={`adw-tab adw-tab--${t.cls}${tab === t.key ? " adw-tab--active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
            <span className="adw-tab__count">{counts[t.key] || 0}</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="adw-list-wrap">
        {loading ? (
          <div className="adw-loading">
            <div className="adw-loading__spinner" />
            <span>Đang tải...</span>
          </div>
        ) : list.length === 0 ? (
          <div className="adw-empty">
            <div className="adw-empty__icon">📭</div>
            <p>Không có yêu cầu nào trong trạng thái này</p>
          </div>
        ) : (
          <div className="adw-list">
            {list.map((r) => (
              <div key={r.id} className="adw-item">
                <div className="adw-item__main">
                  <div className="adw-item__header">
                    <div className="adw-item__org">
                      <FiBriefcase size={14} /> {r.ten_to_chuc}
                    </div>
                    <div className="adw-item__amount">{fmtVnd(r.so_tien)}</div>
                  </div>

                  <div className="adw-item__campaign">{r.ten_chien_dich}</div>
                  <div className="adw-item__reason">{r.mo_ta}</div>

                  <div className="adw-item__meta">
                    <span>
                      <FiCalendar size={11} /> Yêu cầu: {r.thoi_gian}
                    </span>
                    {r.trang_thai === "DA_DUYET" &&
                      r.ma_giao_dich_ngan_hang && (
                        <span className="adw-item__bank">
                          <FiHash size={11} /> Mã GD:{" "}
                          <strong>{r.ma_giao_dich_ngan_hang}</strong>
                        </span>
                      )}
                    {r.trang_thai === "DA_DUYET" && r.ngay_giao_dich && (
                      <span>📅 NH xử lý: {r.ngay_giao_dich}</span>
                    )}
                  </div>

                  {r.trang_thai === "TU_CHOI" && r.ghi_chu_admin && (
                    <div className="adw-item__reject">
                      <FiAlertCircle size={12} />{" "}
                      <strong>Lý do từ chối:</strong> {r.ghi_chu_admin}
                    </div>
                  )}
                </div>

                {r.trang_thai === "CHO_DUYET" && (
                  <div className="adw-item__actions">
                    <button
                      className="adw-btn adw-btn--success"
                      onClick={() => openConfirm(r)}
                    >
                      <FiCheck size={13} /> Xác nhận
                    </button>
                    <button
                      className="adw-btn adw-btn--danger"
                      onClick={() => openReject(r)}
                    >
                      <FiX size={13} /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Xác nhận */}
      {confirmTarget && (
        <div
          className="adw-overlay"
          onClick={(e) =>
            e.target === e.currentTarget && setConfirmTarget(null)
          }
        >
          <div className="adw-modal">
            <div className="adw-modal__header">
              <div>
                <div className="adw-modal__title">
                  <FiCheck size={16} /> Xác nhận giao dịch ngân hàng
                </div>
                <div className="adw-modal__sub">
                  {confirmTarget.ten_chien_dich}
                </div>
              </div>
              <button
                className="adw-modal__close"
                onClick={() => setConfirmTarget(null)}
              >
                ✕
              </button>
            </div>
            <div className="adw-modal__body">
              <div className="adw-modal__highlight">
                <FiDollarSign size={14} /> Số tiền:{" "}
                <strong>{fmtVnd(confirmTarget.so_tien)}</strong>
              </div>

              <div className="adw-modal__field">
                <label>Mã giao dịch ngân hàng *</label>
                <input
                  type="text"
                  placeholder="VD: MB202605061234"
                  value={confirmForm.ma_giao_dich_ngan_hang}
                  onChange={(e) =>
                    setConfirmForm((f) => ({
                      ...f,
                      ma_giao_dich_ngan_hang: e.target.value,
                    }))
                  }
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div className="adw-modal__field">
                <label>Ngày giờ ngân hàng thực hiện *</label>
                <input
                  type="datetime-local"
                  value={confirmForm.ngay_giao_dich}
                  onChange={(e) =>
                    setConfirmForm((f) => ({
                      ...f,
                      ngay_giao_dich: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="adw-modal__field">
                <label>Ghi chú thêm (tùy chọn)</label>
                <textarea
                  placeholder="Ghi chú nội bộ về giao dịch này..."
                  value={confirmForm.ghi_chu_admin}
                  onChange={(e) =>
                    setConfirmForm((f) => ({
                      ...f,
                      ghi_chu_admin: e.target.value,
                    }))
                  }
                  rows={2}
                  maxLength={500}
                />
              </div>
            </div>
            <div className="adw-modal__footer">
              <button
                className="adw-btn adw-btn--ghost"
                onClick={() => setConfirmTarget(null)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="adw-btn adw-btn--success"
                onClick={handleConfirm}
                disabled={submitting}
              >
                <FiCheck size={13} />{" "}
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Từ chối */}
      {rejectTarget && (
        <div
          className="adw-overlay"
          onClick={(e) => e.target === e.currentTarget && setRejectTarget(null)}
        >
          <div className="adw-modal">
            <div className="adw-modal__header">
              <div>
                <div className="adw-modal__title">
                  <FiX size={16} /> Từ chối yêu cầu rút tiền
                </div>
                <div className="adw-modal__sub">
                  {rejectTarget.ten_chien_dich}
                </div>
              </div>
              <button
                className="adw-modal__close"
                onClick={() => setRejectTarget(null)}
              >
                ✕
              </button>
            </div>
            <div className="adw-modal__body">
              <div className="adw-modal__highlight adw-modal__highlight--danger">
                <FiAlertCircle size={14} /> Số tiền yêu cầu:{" "}
                <strong>{fmtVnd(rejectTarget.so_tien)}</strong>
              </div>

              <div className="adw-modal__field">
                <label>Lý do từ chối *</label>
                <textarea
                  placeholder="Mô tả lý do từ chối yêu cầu này (sẽ được gửi đến tổ chức)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  autoFocus
                />
                <div className="adw-modal__charcount">
                  {rejectReason.length}/500
                </div>
              </div>
            </div>
            <div className="adw-modal__footer">
              <button
                className="adw-btn adw-btn--ghost"
                onClick={() => setRejectTarget(null)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button
                className="adw-btn adw-btn--danger"
                onClick={handleReject}
                disabled={submitting}
              >
                <FiX size={13} /> {submitting ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
