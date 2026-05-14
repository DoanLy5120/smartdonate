import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import map from "../../assets/map.jpg";
import { hideAddressPopupAPI } from "../../api/authService";
import useAuthStore from "../../store/authStore";
import "./styles.scss";

export default function AddressPromptModal({ onClose }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const dismiss = async (callback) => {
    await hideAddressPopupAPI();
    setUser({ ...user, can_show_address_popup: false }, roles);
    setVisible(false);
    setTimeout(() => {
      onClose();
      callback?.();
    }, 300);
  };

  return (
    <div className={`apm-overlay${visible ? " apm-overlay--in" : ""}`}>
      <div className={`apm-modal${visible ? " apm-modal--in" : ""}`}>
        <div className="apm-icon-wrap">
          <img src={map} alt="map" />
        </div>
        <h2 className="apm-title">Bạn đang ở đâu?</h2>
        <p className="apm-desc">
          Thêm địa chỉ của bạn để chúng tôi gợi ý những bài đăng{" "}
          <strong>gần bạn nhất</strong> — tặng đồ &amp; nhận đồ dễ dàng hơn!
        </p>
        <div className="apm-actions">
          <button
            className="apm-btn apm-btn--primary"
            onClick={() => dismiss(() => navigate("/profile"))}
          >
            Thêm địa chỉ ngay
          </button>
          <button className="apm-btn apm-btn--ghost" onClick={() => dismiss()}>
            Bỏ qua, để sau
          </button>
        </div>
        <button
          className="apm-close"
          onClick={() => dismiss()}
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
