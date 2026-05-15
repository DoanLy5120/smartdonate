import { useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Progress, Carousel } from "antd";
import {
  FiChevronRight,
  FiChevronLeft,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiGrid,
  FiAlertCircle,
  FiAward,
} from "react-icons/fi";
import { SiWorldhealthorganization } from "react-icons/si";
import { FaFirefoxBrowser } from "react-icons/fa";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import banner4 from "../../../assets/user/banner4.jpg";
import banner5 from "../../../assets/user/banner5.jpg";
import banner6 from "../../../assets/user/banner6.jpg";
import useCampaigns from "../../../hooks/useCampaigns";
import useCategories from "../../../hooks/useCategories";
import useOrganizations from "../../../hooks/useOrganizations";
import useCampaignStore from "../../../store/campaignStore.js";
import useOrganizationStore from "../../../store/organizationStore";
import useAuthStore from "../../../store/authStore";
import "./Campaign.scss";

function formatVnd(n) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

// ── Page ──────────────────────────────────────────────────────────────
export default function Campaign() {
  const carouselRef = useRef(null);
  const orgCarouselRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { featured, loading: campLoading } = useCampaigns({ featured: true });
  const { categories } = useCategories();
  const { organizations } = useOrganizations();
  const endingCampaigns = useCampaignStore((s) => s.endingCampaigns);
  const fetchEndingCampaigns = useCampaignStore((s) => s.fetchEndingCampaigns);

  const roles = useAuthStore((s) => s.roles);
  const isOrganization = roles.includes("TO_CHUC");
  const isUser = roles.includes("NGUOI_DUNG");

  const organizationStatus = useOrganizationStore((s) => s.organizationStatus);
  const fetchOrganizationStatus = useOrganizationStore(
    (s) => s.fetchOrganizationStatus,
  );

  const refreshCampaignData = useCampaignStore((s) => s.refreshCampaignData);

  useEffect(() => {
    if (location.state?.refresh) {
      refreshCampaignData();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  useEffect(() => {
    fetchEndingCampaigns();
  }, []);

  useEffect(() => {
    if (isUser && !isOrganization) {
      fetchOrganizationStatus();
    }
  }, [isUser, isOrganization]);

  function handleCategoryClick(cat) {
    const params = new URLSearchParams();

    if (cat.id !== 0) {
      params.set("category", cat.id);
    }

    params.set("page", 1);

    navigate(`/chien-dich/danh-sach?${params.toString()}`);
  }

  const handleClick = (campaign) => {
    const id = campaign.id || campaign.id_chien_dich;
    navigate(`/chien-dich/chi-tiet/${id}`);
  };

  const renderCTA = () => {
    // TH1: Đã là tổ chức → CTA tạo chiến dịch
    if (isOrganization) {
      return (
        <div className="sidebar__cta-box sidebar__cta-box--org">
          <div className="sidebar__cta-banner">
            <img
              src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=400&auto=format&fit=crop"
              alt="campaign"
            />
            <div className="sidebar__cta-banner-overlay">
              <span>🎯 Tạo chiến dịch gây quỹ</span>
            </div>
          </div>
          <h3 className="sidebar__cta-title">TẠO CHIẾN DỊCH MỚI</h3>
          <p className="sidebar__cta-desc">
            Bạn đã được xác minh là tổ chức từ thiện. Hãy tạo chiến dịch để kêu
            gọi sự ủng hộ từ cộng đồng!
          </p>
          <div className="sidebar__cta-divider" />
          <ul className="sidebar__cta-features">
            <li>
              <FiCheckCircle size={14} /> Đăng chiến dịch gây quỹ
            </li>
            <li>
              <FiCheckCircle size={14} /> Theo dõi tiến độ real-time
            </li>
            <li>
              <FiCheckCircle size={14} /> Báo cáo minh bạch
            </li>
          </ul>
          <div className="sidebar__cta-trust">
            <FiAward size={13} />
            <span>
              Tổ chức đã được <strong>xác minh</strong>
            </span>
          </div>
          <Button
            className="sidebar__cta-btn"
            type="primary"
            block
            onClick={() => navigate("/chien-dich/tao-moi")}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            TẠO CHIẾN DỊCH NGAY
          </Button>
        </div>
      );
    }

    // TH2: Đã đăng ký (có status) → hiện trạng thái, bấm → navigate sang trang đăng ký để xem
    if (organizationStatus) {
      // Nếu đã được duyệt → hiện CTA tạo chiến dịch luôn
      if (organizationStatus.trang_thai === "CHAP_NHAN") {
        return (
          <div className="sidebar__cta-box sidebar__cta-box--org">
            <div className="sidebar__cta-banner">
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=400&auto=format&fit=crop"
                alt="campaign"
              />
              <div className="sidebar__cta-banner-overlay">
                <span>🎯 Tạo chiến dịch gây quỹ</span>
              </div>
            </div>
            <h3 className="sidebar__cta-title">TẠO CHIẾN DỊCH MỚI</h3>
            <p className="sidebar__cta-desc">
              Bạn đã được xác minh là tổ chức từ thiện. Hãy tạo chiến dịch để
              kêu gọi sự ủng hộ từ cộng đồng!
            </p>
            <div className="sidebar__cta-divider" />
            <ul className="sidebar__cta-features">
              <li>
                <FiCheckCircle size={14} /> Đăng chiến dịch gây quỹ
              </li>
              <li>
                <FiCheckCircle size={14} /> Theo dõi tiến độ real-time
              </li>
              <li>
                <FiCheckCircle size={14} /> Báo cáo minh bạch
              </li>
            </ul>
            <div className="sidebar__cta-trust">
              <FiAward size={13} />
              <span>
                Tổ chức đã được <strong>xác minh</strong>
              </span>
            </div>
            <Button
              className="sidebar__cta-btn"
              type="primary"
              block
              onClick={() => navigate("/chien-dich/tao-moi")}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              TẠO CHIẾN DỊCH NGAY
            </Button>
          </div>
        );
      }

      // CHO_XU_LY hoặc TU_CHOI → vẫn hiện trạng thái
      const statusConfig = {
        CHO_XU_LY: {
          title: "ĐANG CHỜ XÉT DUYỆT",
          desc: "Hồ sơ đã gửi và đang chờ admin xét duyệt. Chúng tôi sẽ thông báo khi có kết quả.",
          badgeColor: "#fa8c16",
        },
        TU_CHOI: {
          title: "HỒ SƠ BỊ TỪ CHỐI",
          desc: "Hồ sơ bị từ chối. Vui lòng kiểm tra lại và đăng ký lại.",
          badgeColor: "#ff4d4f",
        },
      };

      const cfg =
        statusConfig[organizationStatus.trang_thai] || statusConfig.CHO_XU_LY;

      return (
        <div className="sidebar__cta-box">
          <div
            className="sidebar__cta-status-badge"
            style={{
              background: `${cfg.badgeColor}15`,
              color: cfg.badgeColor,
              borderColor: `${cfg.badgeColor}30`,
            }}
          >
            {cfg.title}
          </div>
          <p className="sidebar__cta-desc" style={{ marginTop: 12 }}>
            {cfg.desc}
          </p>
          {organizationStatus.ten_to_chuc && (
            <div className="sidebar__cta-org-name">
              🏢 {organizationStatus.ten_to_chuc}
            </div>
          )}
        </div>
      );
    }

    // TH3: User thường, chưa đăng ký → CTA đăng ký, navigate sang trang
    return (
      <div className="sidebar__cta-box">
        <div className="sidebar__cta-star">✨</div>
        <div className="sidebar__cta-banner">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=400&auto=format&fit=crop"
            alt="volunteer"
          />
          <div className="sidebar__cta-banner-overlay">
            <span>🤝 Cùng nhau lan tỏa yêu thương</span>
          </div>
        </div>
        <h3 className="sidebar__cta-title">TRỞ THÀNH TỔ CHỨC TỪ THIỆN</h3>
        <p className="sidebar__cta-desc">
          Nếu bạn là tổ chức, doanh nghiệp hoặc nhóm thiện nguyện, hãy đăng ký
          xác minh để tạo và quản lý chiến dịch gây quỹ
        </p>
        <div className="sidebar__cta-divider" />
        <ul className="sidebar__cta-features">
          <li>
            <FiCheckCircle size={14} /> Tạo chiến dịch gây quỹ
          </li>
          <li>
            <FiCheckCircle size={14} /> Quản lý đóng góp minh bạch
          </li>
          <li>
            <FiCheckCircle size={14} /> Nhận hỗ trợ từ cộng đồng
          </li>
        </ul>
        <div className="sidebar__cta-trust">
          <FiAward size={13} />
          <span>
            Đã xác minh bởi <strong>Bộ Công Thương</strong>
          </span>
        </div>
        <Button
          className="sidebar__cta-btn"
          type="primary"
          danger
          block
          onClick={() => navigate("/dk-to-chuc")}
        >
          ĐĂNG KÝ XÁC MINH
        </Button>
      </div>
    );
  };

  return (
    <div className="campaign-page">
      {/* ── Sidebar ── */}
      <aside className="campaign-page__sidebar">
        <div className="sidebar__category-box">
          <div className="sidebar__category-header">
            <FiGrid size={20} />
            <span>DANH MỤC</span>
            <FiChevronRight size={20} className="sidebar__chevron" />
          </div>
          <ul className="sidebar__category-list">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="sidebar__category-item"
                onClick={() => handleCategoryClick(cat)}
              >
                <img
                  className="sidebar__category-img"
                  src={cat.hinh_anh}
                  alt={cat.ten_danh_muc}
                />
                <span className="sidebar__category-label">
                  {cat.ten_danh_muc}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Box */}
        {renderCTA()}
      </aside>

      {/* ── Main ── */}
      <main className="campaign-page__main">
        <section className="camp-section">
          <div className="camp-section__banner">
            <div className="camp-section__banner-left">
              <img src={banner5} alt="campaign hero" />
            </div>
            <div className="camp-section__banner-right">
              <img src={banner4} alt="campaign hero" />
              <img src={banner6} alt="campaign hero" />
            </div>
          </div>
        </section>

        {/* Chiến dịch nổi bật */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">
              CHIẾN DỊCH NỔI BẬT <FaFirefoxBrowser color="#333" size={26} />
            </h2>
            <a href="/chien-dich/danh-sach" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>
          {campLoading ? (
            <div className="camp-sk-carousel">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="camp-sk-card">
                  <div className="camp-sk-image" />
                  <div className="camp-sk-body">
                    <div className="camp-sk-line" />
                    <div className="camp-sk-line camp-sk-line--short" />
                    <div className="camp-sk-line camp-sk-line--xshort" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="camp-section__carousel-wrap">
              <Carousel
                ref={carouselRef}
                dots={false}
                infinite={false}
                draggable
                slidesToShow={4}
                slidesToScroll={1}
                responsive={[
                  { breakpoint: 1200, settings: { slidesToShow: 3 } },
                  { breakpoint: 780, settings: { slidesToShow: 2 } },
                ]}
              >
                {featured.map((c, i) => (
                  <div key={c.id} className="camp-section__slide">
                    <CampaignCard campaign={c} index={i} />
                  </div>
                ))}
              </Carousel>
              <button
                className="camp-section__nav camp-section__nav--prev"
                onClick={() => carouselRef.current?.prev?.()}
              >
                <FiChevronLeft size={20} />
              </button>
              <button
                className="camp-section__nav camp-section__nav--next"
                onClick={() => carouselRef.current?.next?.()}
              >
                <FiChevronRight size={20} />
              </button>
            </div>
          )}
        </section>

        {/* Tổ chức từ thiện */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">
              TỔ CHỨC TỪ THIỆN{" "}
              <SiWorldhealthorganization color="#333" size={26} />
            </h2>
            <a href="chien-dich/to-chuc" className="camp-section__view-all">
              Xem tất cả <FiChevronRight size={14} />
            </a>
          </div>

          <div className="camp-section__carousel-wrap">
            <Carousel
              ref={orgCarouselRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1200, settings: { slidesToShow: 2 } },
                { breakpoint: 780, settings: { slidesToShow: 1 } },
              ]}
            >
              {organizations.map((o, i) => (
                <div
                  key={o.id}
                  className="camp-section__slide camp-section__slide--org"
                >
                  <OrganizationCard organization={o} index={i} />
                </div>
              ))}
            </Carousel>
            <button
              className="camp-section__nav camp-section__nav--prev"
              onClick={() => orgCarouselRef.current?.prev?.()}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className="camp-section__nav camp-section__nav--next"
              onClick={() => orgCarouselRef.current?.next?.()}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Chiến dịch sắp kết thúc */}
        <section className="camp-section">
          <div className="camp-section__header">
            <h2 className="camp-section__title">
              CHIẾN DỊCH SẮP KẾT THÚC
              <span className="camp-section__title-badge">
                <FiClock size={12} /> Cần ủng hộ gấp
              </span>
            </h2>
          </div>

          <div className="ending-list">
            {endingCampaigns.length === 0 ? (
              <div className="ending-empty">
                <p>Không có chiến dịch nào sắp kết thúc</p>
              </div>
            ) : (
              endingCampaigns.map((item, i) => {
                const target = Number(item.muc_tieu_tien) || 0;
                const raised = Number(item.so_tien_da_nhan) || 0;

                const pct =
                  target > 0
                    ? Math.min(100, Math.round((raised / target) * 100))
                    : 0;

                const remaining = Math.max(0, target - raised);

                return (
                  <div
                    className="ending-item"
                    key={item.id}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Thumbnail */}
                    <div className="ending-item__thumb">
                      <img
                        src={item.hinh_anh}
                        alt={item.ten_chien_dich}
                        onError={(e) =>
                          (e.target.src =
                            "https://placehold.co/150?text=No+Image")
                        }
                      />
                      <div className="ending-item__thumb-badge">#{i + 1}</div>
                    </div>

                    {/* Body */}
                    <div className="ending-item__body">
                      <div className="ending-item__top">
                        <h3 className="ending-item__title">
                          {item.ten_chien_dich}
                        </h3>

                        <span
                          className={`ending-item__days ${
                            item.so_ngay_con_lai <= 3 ? "urgent" : ""
                          }`}
                        >
                          <FiClock size={12} /> Còn {item.so_ngay_con_lai} ngày
                        </span>
                      </div>

                      {/* Fake donors UI */}
                      <div className="ending-item__donors">
                        <div className="ending-item__donor-avatars">
                          {["A", "B", "C", "D"].map((l, idx) => (
                            <div
                              key={idx}
                              className="ending-item__donor-avatar"
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
                        <span className="ending-item__donor-text">
                          <strong>+{(120 + i * 34).toLocaleString()}</strong>{" "}
                          người đã ủng hộ
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="ending-item__progress-row">
                        <Progress
                          percent={pct}
                          showInfo={false}
                          strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                          strokeLinecap="round"
                        />
                        <span className="ending-item__pct">{pct}%</span>
                      </div>

                      {/* Remaining */}
                      <div className="ending-item__remaining">
                        <FiAlertCircle size={12} />
                        Còn thiếu <strong>{formatVnd(remaining)}</strong>
                      </div>

                      {/* Footer */}
                      <div className="ending-item__footer">
                        <div className="ending-item__meta">
                          <span className="ending-item__raised">
                            <FiTrendingUp size={12} /> {formatVnd(raised)}
                          </span>
                          <span className="ending-item__goal">
                            / {formatVnd(target)}
                          </span>
                        </div>

                        <Button
                          type="primary"
                          danger
                          size="small"
                          className="ending-item__btn"
                          onClick={() => handleClick(item)}
                        >
                          ỦNG HỘ NGAY
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
