import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import map from "../../assets/map.jpg";
import { markAddressPromptSeen } from "./addressPromptUtils";
import "./styles.scss";

export default function AddressPromptModal({ userId, onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSkip = () => {
    markAddressPromptSeen(userId);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleGoProfile = () => {
    markAddressPromptSeen(userId);
    setVisible(false);
    setTimeout(() => {
      onClose();
      navigate("/profile"); 
    }, 300);
  };

  return (
    <div className={`apm-overlay${visible ? " apm-overlay--in" : ""}`}>
      <div className={`apm-modal${visible ? " apm-modal--in" : ""}`}>
        {/* Icon */}
        <div className="apm-icon-wrap">
          <img src={map} alt="map"/>
        </div>

        <h2 className="apm-title">Bạn đang ở đâu?</h2>
        <p className="apm-desc">
          Thêm địa chỉ của bạn để chúng tôi gợi ý những bài đăng{" "}
          <strong>gần bạn nhất</strong> — tặng đồ &amp; nhận đồ dễ dàng hơn!
        </p>

        <div className="apm-actions">
          <button
            className="apm-btn apm-btn--primary"
            onClick={handleGoProfile}
          >
            Thêm địa chỉ ngay
          </button>
          <button className="apm-btn apm-btn--ghost" onClick={handleSkip}>
            Bỏ qua, để sau
          </button>
        </div>

        <button className="apm-close" onClick={handleSkip} aria-label="Đóng">
          ✕
        </button>
      </div>
    </div>
  );
}
