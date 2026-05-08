import { useState } from "react";
import {
  FiChevronRight,
  FiX,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";
import { notification } from "antd";
import "./styles.scss";

const REPORT_REASONS = [
  {
    key: "spam", 
    label: "Spam hoặc quảng cáo",
    desc: "Bài đăng nhằm mục đích thương mại hoặc gửi nội dung lặp lại.",
    subs: [
      "Bán hàng trá hình dưới dạng tặng",
      "Đăng nhiều bài giống nhau",
      "Quảng cáo sản phẩm / dịch vụ",
      "Link hoặc số điện thoại đáng ngờ",
    ],
  },
  {
    key: "lua_dao", 
    label: "Thông tin sai sự thật hoặc lừa đảo",
    desc: "Nội dung không trung thực, mô tả sai tình trạng hoặc địa điểm, có dấu hiệu lừa đảo.",
    subs: [
      "Món đồ không tồn tại",
      "Đã tặng nhưng vẫn đăng",
      "Yêu cầu tiền / phí vận chuyển ẩn",
      "Thông tin liên hệ giả mạo",
      "Ảnh không đúng với thực tế",
      "Tình trạng tệ hơn mô tả",
      "Địa chỉ không tồn tại hoặc sai khu vực",
      "Không thể liên hệ để lấy đồ",
    ],
  },
  {
    key: "noi_dung_xau", 
    label: "Nội dung không phù hợp hoặc đồ vật bị cấm",
    desc: "Ngôn ngữ, hình ảnh vi phạm tiêu chuẩn cộng đồng hoặc đồ vật không được phép.",
    subs: [
      "Ngôn ngữ thô tục / xúc phạm",
      "Hình ảnh phản cảm",
      "Kỳ thị hoặc phân biệt đối xử",
      "Thuốc hoặc thực phẩm chức năng",
      "Động vật hoang dã",
      "Vũ khí hoặc vật nguy hiểm",
      "Đồ vật vi phạm pháp luật",
    ],
  },
  {
    key: "khac", 
    label: "Lý do khác",
    desc: "Bài đăng có vấn đề nhưng không thuộc các mục trên.",
    subs: [
      "Trùng lặp bài của tôi",
      "Liên quan đến tôi cá nhân",
      "Tôi không muốn thấy nội dung này",
      "Vấn đề khác",
    ],
  },
];

export default function ReportSheet({ visible, onClose, onSubmit, loading }) {
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView("list");
      setSelected(null);
    }, 300);
  };

  const handleSelectReason = (reason) => {
    setSelected(reason);
    setView("detail");
  };

  const handleSubmit = async (subReason) => {
    if (!onSubmit || !selected) return;

    try {
      await onSubmit({
        ly_do: selected.key.toUpperCase(),
        mo_ta: subReason,
      });

      setView("success");

      notification.success({
        message: "Báo cáo thành công",
        description: "Chúng tôi đã nhận báo cáo của bạn.",
        placement: "topRight",
      });
    } catch (err) {
      console.error(err);

      setView("list");

      notification.error({
        message: "Gửi báo cáo thất bại",
        description:
          err?.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.",
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="report-overlay" onClick={handleClose}>
      <div className="report-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="report-sheet__handle" />

        {/* List view */}
        {view === "list" && (
          <>
            <div className="report-sheet__header">
              <span className="report-sheet__title">Báo cáo</span>
              <button className="report-sheet__close" onClick={handleClose}>
                <FiX size={16} />
              </button>
            </div>
            <div className="report-sheet__subtitle">
              Tại sao bạn báo cáo bài đăng này?
            </div>
            <div className="report-sheet__hint">
              Thông tin báo cáo của bạn sẽ được giữ bí mật. Nếu ai đó đang gặp
              nguy hiểm, hãy tìm ngay sự giúp đỡ trước khi báo cáo.
            </div>
            <div className="report-sheet__list">
              {REPORT_REASONS.map((r, i) => (
                <div key={r.key}>
                  <button
                    className="report-item"
                    onClick={() => handleSelectReason(r)}
                  >
                    <span className="report-item__label">{r.label}</span>
                    <FiChevronRight
                      size={18}
                      className="report-item__chevron"
                    />
                  </button>
                  {i < REPORT_REASONS.length - 1 && (
                    <div className="report-sheet__sep" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Detail view */}
        {view === "detail" && selected && (
          <>
            <div className="report-sheet__header">
              <button
                className="report-sheet__back"
                onClick={() => setView("list")}
              >
                <FiArrowLeft size={18} />
                <span>Quay lại</span>
              </button>
              <button className="report-sheet__close" onClick={handleClose}>
                <FiX size={16} />
              </button>
            </div>
            <div className="report-sheet__detail-title">{selected.label}</div>
            <div className="report-sheet__detail-desc">{selected.desc}</div>
            <div className="report-sheet__list">
              {selected.subs.map((s, i) => (
                <div key={i}>
                  <button
                    className="report-item"
                    onClick={() => handleSubmit(s)}
                    disabled={loading}
                  >
                    <span className="report-item__label">{s}</span>
                  </button>
                  {i < selected.subs.length - 1 && (
                    <div className="report-sheet__sep" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Success view */}
        {view === "success" && (
          <>
            <div className="report-sheet__header">
              <span className="report-sheet__title">Báo cáo</span>
              <button className="report-sheet__close" onClick={handleClose}>
                <FiX size={16} />
              </button>
            </div>
            <div className="report-sheet__success">
              <div className="report-sheet__success-icon">
                <FiCheckCircle size={30} />
              </div>
              <div className="report-sheet__success-title">
                Cảm ơn bạn đã báo cáo
              </div>
              <div className="report-sheet__success-desc">
                Chúng tôi sẽ xem xét bài đăng và thực hiện các biện pháp phù hợp
                theo quy định cộng đồng. Thông tin báo cáo của bạn được bảo mật
                hoàn toàn.
              </div>
              <button className="report-sheet__done-btn" onClick={handleClose}>
                Xong
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
