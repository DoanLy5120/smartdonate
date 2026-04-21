import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FiHeart,
  FiMapPin,
  FiCalendar,
  FiCopy
} from "react-icons/fi";
import { RiExchangeFundsLine } from "react-icons/ri";
import { formatVnd } from "../../utils/format";
import "./styles.scss";

export default function OrganizationCard({ organization }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/chien-dich/to-chuc/chi-tiet/${organization.id}`);
  };

  return (
    <Card className="org-card" variant="borderless">
      <div className="org-card__shimmer" />

      <div className="org-card__avatar">
        <img
          className="org-card__avatar-img"
          src={organization.logo}
          alt={organization.ten_to_chuc}
          loading="lazy"
        />
      </div>

      <div className="org-card__body">
        <div className="org-card__name">{organization.ten_to_chuc}</div>

        <div className="org-card__divider" />

        <div className="org-card__account">
          <div className="org-card__account-left">
            <span className="org-card__account-label">TK thiện nguyện</span>
            <span className="org-card__account-number">
              {organization.so_tai_khoan}
            </span>
          </div>
          <button
            className="org-card__copy-btn"
            onClick={() =>
              navigator.clipboard.writeText(organization.so_tai_khoan)
            }
          >
            <FiCopy size={13} />
          </button>
        </div>

        <div className="org-card__info-list">
          <div className="org-card__info-row">
            <div className="org-card__info-key">
              <div className="org-card__info-icon">
                <RiExchangeFundsLine size={18} />
              </div>
              Tổng gây quỹ
            </div>
            <span className="org-card__info-val">{formatVnd(organization.tong_gay_quy)}</span>
          </div>
          <div className="org-card__info-row">
            <div className="org-card__info-key">
              <div className="org-card__info-icon">
                <FiCalendar size={18} />
              </div>
              Tham gia
            </div>
            <span className="org-card__info-val">{organization.tham_gia}</span>
          </div>
          <div className="org-card__info-row">
            <div className="org-card__info-key">
              <div className="org-card__info-icon">
                <FiMapPin size={18} />
              </div>
              Khu vực
            </div>
            <span className="org-card__info-val">{organization.dia_chi}</span>
          </div>
        </div>

        <div className="org-card__divider" />

        <div className="org-card__actions">
          <Button type="primary" className="org-card__btn" onClick={handleClick}>
            <FiHeart size={18} style={{ marginRight: 3 }} /> QUAN TÂM
          </Button>
        </div>
      </div>
    </Card>
  );
}
