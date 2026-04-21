import { Card, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiClock, FiTarget, FiTrendingUp } from "react-icons/fi";
import { LiaHeartbeatSolid } from "react-icons/lia";
import { formatVnd } from "../../utils/format";
import "./styles.scss";

function clampPercent(value) {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function CampaignCard({ campaign }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const navigate = useNavigate();
  const goal = Number(campaign.muc_tieu_tien) || 0;
  const raised = Number(campaign.so_tien_da_nhan) || 0;
  const percent = clampPercent(goal > 0 ? (raised / goal) * 100 : 0);

  const isNear = campaign.so_ngay_con_lai <= 3;

  const handleClick = () => {
    navigate(`/chien-dich/chi-tiet/${campaign.id || campaign.id_chien_dich}`);
  };

  return (
    <Card
      className={`campaign-card fade-load ${imgLoaded ? "loaded" : ""}`}
      variant="borderless"
      onClick={handleClick}
    >
      {/* ── Cover ── */}
      <div className="campaign-card__cover">
        <img
          className={`campaign-card__img fade-load ${imgLoaded ? "loaded" : ""}`}
          src={campaign.hinh_anh}
          alt={campaign.ten_chien_dich}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Overlay gradient */}
        <div className="campaign-card__cover-overlay" />

        {/* Badges */}
        <div className="campaign-card__badges">
          <span
            className={`campaign-card__badge ${
              isNear
                ? "campaign-card__badge--urgent"
                : "campaign-card__badge--days"
            }`}
          >
            <FiClock size={11} />
            {campaign.so_ngay_con_lai} ngày
          </span>
        </div>

        {/* Percent pill nổi trên cover */}
        <div className="campaign-card__percent-pill">
          {Math.round(percent)}%
        </div>
      </div>

      {/* ── Body ── */}
      <div className="campaign-card__body">
        <div
          className={`campaign-card__title fade-load ${imgLoaded ? "loaded" : ""}`}
        >
          {campaign.ten_chien_dich}
        </div>

        {/* Progress */}
        <div
          className={`campaign-card__progress-wrap fade-load ${imgLoaded ? "loaded" : ""}`}
        >
          <Progress
            className="campaign-card__progress"
            percent={percent}
            showInfo={false}
            strokeColor={{
              "0%": "#ff4d4f",
              "100%": "#fa8c16",
            }}
            railColor="rgba(0,0,0,0.07)"
            strokeLinecap="round"
          />
        </div>

        {/* Meta */}
        <div className="campaign-card__meta">
          <div className="campaign-card__meta-item">
            <FiTrendingUp size={13} className="campaign-card__meta-icon" />
            <span>
              Đã đạt:{" "}
              <span className="campaign-card__money">{formatVnd(raised)}</span>
            </span>
          </div>
          <div className="campaign-card__meta-item">
            <FiTarget size={13} className="campaign-card__meta-icon" />
            <span>
              Mục tiêu:{" "}
              <span className="campaign-card__goal">{formatVnd(goal)}</span>
            </span>
          </div>
          <div className="campaign-card__float-icon">
            <LiaHeartbeatSolid size={34} />
          </div>
        </div>
      </div>
    </Card>
  );
}
