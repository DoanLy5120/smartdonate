import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Progress, Pagination } from "antd";
import {
  FiMapPin,
  FiHeart,
  FiArrowUpRight,
  FiArrowDownRight,
  FiInfo,
  FiFileText,
} from "react-icons/fi";
import { LuShieldCheck } from "react-icons/lu";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { FiGift, FiStar } from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import { BsBalloonHeartFill } from "react-icons/bs";
import { MdOutlineMarkEmailRead, MdOutlinePhoneInTalk } from "react-icons/md";
import { formatVnd } from "../../../utils/format";
import banner3 from "../../../assets/user/banner3.jpg";
import useOrganizationStore from "../../../store/organizationStore";
import "./OrganizationDetail.scss";

const PAGE_SIZE = 3;

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("campaigns");
  const organizationDetail = useOrganizationStore(
    (state) => state.organizationDetail,
  );

  const fetchOrganizationDetail = useOrganizationStore(
    (state) => state.fetchOrganizationDetail,
  );

  const loading = useOrganizationStore((state) => state.loading);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (id) {
      fetchOrganizationDetail(id);
    }
  }, [id]);

  const ORG = organizationDetail[id];
  const campaigns = ORG?.chien_dichs || [];

  const start = (page - 1) * PAGE_SIZE;
  const paginated = campaigns.slice(start, start + PAGE_SIZE);

  const getStateConfig = (c) => {
    // Hoàn thành
    if (c.trang_thai === "HOAN_THANH" || c.phan_tram >= 100) {
      return {
        type: "success",
        icon: <FiCheckCircle size={14} />,
        label: "Hoàn thành",
      };
    }

    // Đang hoạt động → hiển thị số ngày
    if (c.trang_thai === "HOAT_DONG") {
      const days = c.so_ngay_con_lai ?? 0;

      return {
        type: "processing",
        icon: <FiClock size={14} />,
        label: days > 0 ? `Còn ${days} ngày` : "Sắp kết thúc",
      };
    }

    // Tạm dừng
    if (c.trang_thai === "TAM_DUNG") {
      return {
        type: "danger",
        icon: <FiInfo size={14} />,
        label: "Tạm dừng",
      };
    }

    if (c.trang_thai === "KET_THUC") {
      return {
        type: "danger",
        icon: <FiInfo size={14} />,
        label: "Kết thúc",
      };
    }

    // fallback (tránh crash)
    return {
      type: "danger",
      icon: <FiInfo size={14} />,
      label: "Chờ duyệt",
    };
  };

  if (loading && !ORG) {
    return <div style={{ padding: 40 }}>Đang tải...</div>;
  }

  if (!ORG) {
    return <div style={{ padding: 40 }}>Đang tải...</div>;
  }

  return (
    <div className="od-page">
      <div className="od-layout">
        {/* ── Left ── */}
        <div className="od-left">
          {/* Org header */}
          <div className="od-header">
            <div className="od-header__avatar">
              <img src={ORG.logo} alt={ORG.ten_to_chuc} />
              <div className="od-header__avatar-ring" />
            </div>
            <div className="od-header__info">
              <div className="od-header__name">{ORG.ten_to_chuc}</div>
              <div className="od-header__meta">
                <div className="od-header__meta-left">
                  <span className="od-header__badge">
                    <LuShieldCheck size={13} /> Tổ chức xác minh
                  </span>
                  <p className="od-header__desc">{ORG.mo_ta}</p>
                </div>
                <div className="od-header__meta-right">
                  <span className="od-header__address">
                    <FiMapPin size={18} color="#ff4d4f" /> {ORG.dia_chi}
                  </span>
                  <span className="od-header__hotline">
                    <MdOutlinePhoneInTalk size={18} color="#52c41a" />{" "}
                    {ORG.so_dien_thoai}
                  </span>
                  <span className="od-header__email">
                    <MdOutlineMarkEmailRead size={18} color="#1890ff" />{" "}
                    {ORG.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="od-divider" />
          {/* ── Tabs ── */}
          <div className="od-tabs">
            <button
              className={`od-tab-btn${activeTab === "campaigns" ? " is-active" : ""}`}
              onClick={() => setActiveTab("campaigns")}
            >
              <MdCampaign size={20} />
              Chiến dịch
            </button>
            <button
              className={`od-tab-btn${activeTab === "saoke" ? " is-active" : ""}`}
              onClick={() => setActiveTab("saoke")}
            >
              <FiFileText size={15} />
              Sao kê
            </button>
          </div>

          {/* ── Tab: Chiến dịch ── */}
          {activeTab === "campaigns" && (
            <>
              <div className="od-campaigns">
                {paginated.map((c, i) => {
                  const pct = c.phan_tram;
                  const stateConfig = getStateConfig(c);
                  return (
                    <div
                      key={c.id}
                      className="od-camp-item"
                      style={{ animationDelay: `${i * 0.08}s` }}
                      onClick={() => navigate(`/chien-dich/chi-tiet/${c.id}`)}
                    >
                      <div className="od-camp-item__thumb">
                        <img src={c.hinh_anh} alt={c.ten_chien_dich} />
                      </div>
                      <div className="od-camp-item__body">
                        <div className="od-camp-item__title">
                          {c.ten_chien_dich}
                        </div>
                        <div className="od-camp-item__progress">
                          <Progress
                            percent={pct}
                            showInfo={false}
                            strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                            railColor="rgba(0,0,0,0.07)"
                            strokeLinecap="round"
                          />
                          <span className="od-camp-item__pct-badge">
                            {pct}%
                          </span>
                        </div>
                        <div className="od-camp-item__meta">
                          <span className="od-camp-item__raised">
                            {formatVnd(c.so_tien_da_nhan)}
                          </span>
                          <span className="od-camp-item__goal">
                            {formatVnd(c.muc_tieu_tien)}
                          </span>
                        </div>
                        <div className="od-camp-item__donors">
                          <div className="od-camp-item__donor-avatars">
                            {["A", "B", "C", "D"].map((l, idx) => (
                              <div
                                key={idx}
                                className="od-camp-item__donor-avatar"
                                style={{
                                  background: [
                                    "#ff4d4f",
                                    "#fa8c16",
                                    "#52c41a",
                                    "#1890ff",
                                  ][idx],
                                }}
                              >
                                {l}
                              </div>
                            ))}
                          </div>
                          <span className="od-camp-item__donor-text">
                            <strong>+{c.so_luot_ung_ho}</strong> người đã ủng hộ
                          </span>
                        </div>
                      </div>
                      <div
                        className={`od-camp-item__state is-${stateConfig.type}`}
                      >
                        <span className="od-camp-item__state-icon">
                          {stateConfig.icon}
                        </span>
                        <span>{stateConfig.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {campaigns.length > PAGE_SIZE && (
                <div className="od-pagination">
                  <Pagination
                    current={page}
                    pageSize={PAGE_SIZE}
                    total={campaigns.length}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}

          {/* ── Tab: Sao kê ── */}
          {activeTab === "saoke" && (
            <div className="od-saoke">
              {/* Tổng quan */}
              <div className="od-sk-summary">
                <div className="od-sk-stat">
                  <span className="od-sk-stat__label">Tổng thu</span>
                  <span className="od-sk-stat__value is-green">
                    {formatVnd(ORG.tong_thu)}
                  </span>
                </div>
                <div className="od-sk-stat">
                  <span className="od-sk-stat__label">Tổng chi</span>
                  <span className="od-sk-stat__value is-red">
                    {formatVnd(ORG.tong_chi)}
                  </span>
                </div>
                <div className="od-sk-stat">
                  <span className="od-sk-stat__label">Số dư còn lại</span>
                  <span className="od-sk-stat__value">
                    {formatVnd(ORG.so_du_hien_tai)}
                  </span>
                </div>
              </div>

              {/* Chi theo chiến dịch */}
              <div className="od-sk-section-title">Chi theo chiến dịch</div>
              <div className="od-sk-breakdown">
                {(ORG.bao_cao_chi || []).map((report, i) => (
                  <div key={i} className="od-sk-report-block">
                    <div className="od-sk-report-block__header">
                      <img
                        src={report.hinh_anh}
                        alt={report.ten_chien_dich}
                        className="od-sk-report-block__thumb"
                      />
                      <div className="od-sk-report-block__meta">
                        <span className="od-sk-report-block__name">
                          {report.ten_chien_dich}
                        </span>
                        <span className="od-sk-report-block__total">
                          Tổng chi:{" "}
                          <strong>{formatVnd(report.tong_chi)}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="od-sk-report-block__items">
                      {report.cac_khoan_chi.map((item, j) => (
                        <div key={j} className="od-sk-report-item">
                          <div className="od-sk-report-item__left">
                            <span className="od-sk-report-item__dot" />
                            <span className="od-sk-report-item__label">
                              {item.hang_muc}
                            </span>
                          </div>
                          <div className="od-sk-report-item__right">
                            <span className="od-sk-report-item__amount">
                              {formatVnd(item.so_tien)}
                            </span>
                            {item.ghi_chu && (
                              <span className="od-sk-report-item__note">
                                {item.ghi_chu}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lịch sử giao dịch */}
              <div className="od-sk-section-title">
                Lịch sử giao dịch gần đây
              </div>
              <div className="od-sk-transactions">
                {(ORG.lich_su_giao_dich || []).map((tx, i) => (
                  <div key={i} className="od-sk-tx">
                    <div
                      className={`od-sk-tx__icon ${tx.loai === "CHI" ? "is-out" : "is-in"}`}
                    >
                      {tx.loai === "CHI" ? (
                        <FiArrowUpRight size={16} />
                      ) : (
                        <FiArrowDownRight size={16} />
                      )}
                    </div>
                    <div className="od-sk-tx__info">
                      <div className="od-sk-tx__name">{tx.mo_ta}</div>
                      <div className="od-sk-tx__meta">
                        <span>{tx.ngay}</span>
                        <span>·</span>
                        <span>{tx.chien_dich}</span>
                      </div>
                    </div>
                    <span
                      className={`od-sk-tx__amount ${tx.loai === "CHI" ? "is-out" : "is-in"}`}
                    >
                      {tx.loai === "CHI" ? "−" : "+"}
                      {formatVnd(tx.so_tien)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* ── Right ── */}
        <div className="od-right">
          {/* Bank card */}
          <div className="od-bank-card">
            <div className="od-bank-card__shimmer" />
            <div className="od-bank-card__balance-label">
              Tên tài khoản:
              <div
                className="od-bank-card__balance"
                style={{ color: "#515050" }}
              >
                {ORG.ten_tai_khoan}
              </div>
            </div>
            <div className="od-bank-card__balance-label">
              Số tài khoản:
              <div
                className="od-bank-card__balance"
                style={{ color: "#515050" }}
              >
                {ORG.so_tai_khoan}
              </div>
            </div>
            <div className="od-bank-card__balance-label">
              Số dư hiện tại:
              <div
                className="od-bank-card__balance"
                style={{ color: "#ff4d4f" }}
              >
                {formatVnd(ORG.so_du_hien_tai)}
              </div>
            </div>

            <div className="od-bank-card__flows">
              <div className="od-bank-card__flow od-bank-card__flow--in">
                <FiArrowUpRight size={26} />
                <div>
                  <div className="od-bank-card__flow-label">Tổng thu</div>
                  <div className="od-bank-card__flow-value">
                    {formatVnd(ORG.tong_thu)}
                  </div>
                </div>
              </div>
              <div className="od-bank-card__flow-divider" />
              <div className="od-bank-card__flow od-bank-card__flow--out">
                <FiArrowDownRight size={26} />
                <div>
                  <div className="od-bank-card__flow-label">Tổng chi</div>
                  <div className="od-bank-card__flow-value">
                    {formatVnd(ORG.tong_chi)}
                  </div>
                </div>
              </div>
            </div>
            {/* QR */}
            <div className="od-qr-card">
              <img src={ORG.qr_code} alt="QR" className="od-qr-card__img" />
            </div>
          </div>

          {/* Stats */}
          <div className="od-stats-card">
            {/* Banner */}
            <div className="od-stats-card__banner">
              <img
                src={banner3}
                alt="banner"
                className="od-stats-card__banner-img"
              />

              <FiHeart className="od-banner-float icon-1" />
              <FiGift className="od-banner-float icon-2" />
              <FiStar className="od-banner-float icon-3" />

              {/* overlay */}
              <div className="od-stats-card__banner-overlay">
                <div className="od-stats-card__banner-content">
                  <span className="od-stats-card__banner-label">
                    🎯 Đã vận động
                  </span>
                  <span className="od-stats-card__banner-value">
                    {formatVnd(ORG.tong_thu)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stat items */}
            <div className="od-stats-card__items">
              <div className="od-stats-card__item">
                <div className="od-stats-card__item-icon od-stats-card__item-icon--orange">
                  <MdCampaign size={30} />
                </div>
                <div className="od-stats-card__item-info">
                  <span className="od-stats-card__item-value">
                    {ORG.tong_chien_dich}
                  </span>
                  <span className="od-stats-card__item-label">chiến dịch</span>
                </div>
              </div>
              <div className="od-stats-card__item-divider" />
              <div className="od-stats-card__item">
                <div className="od-stats-card__item-icon od-stats-card__item-icon--red">
                  <BsBalloonHeartFill size={24} />
                </div>
                <div className="od-stats-card__item-info">
                  <span className="od-stats-card__item-value">
                    {ORG.tong_luot_ung_ho}
                  </span>
                  <span className="od-stats-card__item-label">lượt ủng hộ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
