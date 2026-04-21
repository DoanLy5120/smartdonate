import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import Header from "../../../components/Header/index.jsx";
import Footer from "../../../components/Footer/index.jsx";
import RequiredLoginModal from "../../../components/Required/index.jsx";
import banner1 from "../../../assets/user/banner1.jpg";
import chonhan from "../../../assets/user/chonhan.jpg";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { Button, Row, Col, Typography, Space, Card, Image } from "antd";
import { useRef } from "react";
import { Carousel } from "antd";
import img1 from "../../../assets/user/img1.png";
import img2 from "../../../assets/user/img2.png";
import img3 from "../../../assets/user/img3.png";
import img4 from "../../../assets/user/img4.png";
import "./Home.scss";
import useCampaigns from "../../../hooks/useCampaigns.js";
import useOrganizations from "../../../hooks/useOrganizations.js";
import useCategories from "../../../hooks/useCategories.js";
import useAuthStore from "../../../store/authStore";

const { Title, Paragraph, Text } = Typography;

// ── Carousel wrapper dùng chung ───────────────────────────────────────
function CardCarousel({ children, className = "" }) {
  const ref = useRef(null);
  return (
    <div className={`home-carousel-wrap ${className}`}>
      <Carousel
        ref={ref}
        dots={false}
        infinite={false}
        draggable
        slidesToShow={4}
        responsive={[
          { breakpoint: 1200, settings: { slidesToShow: 3 } },
          { breakpoint: 640, settings: { slidesToShow: 2 } },
        ]}
      >
        {children}
      </Carousel>
      <button
        className="home-carousel__nav home-carousel__nav--prev"
        onClick={() => ref.current?.prev?.()}
        aria-label="Trước"
      >
        <FiChevronLeft size={18} />
      </button>
      <button
        className="home-carousel__nav home-carousel__nav--next"
        onClick={() => ref.current?.next?.()}
        aria-label="Sau"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────
export default function HomePage() {
  const { featured, loading } = useCampaigns({ featured: true });
  const { organizations } = useOrganizations();
  const { categories } = useCategories();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const isLoggedIn = !!token;
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const requireAuth = (callback) => {
  if (!isLoggedIn) {
    setOpenLoginModal(true);
  } else {
    callback();
  }
};

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="home-page">
      <Header />

      {/* 1. Hero Banner */}
      <section className="home-hero">
        <div className="home-hero__content">
          <img src={banner1} alt="Hero" className="home-hero__image-bg" />
          <div className="home-hero__overlay" />
          <div className="home-hero__text">
            <Typography>
              <Title level={1}>KẾT NỐI CỘNG ĐỒNG GÂY QUỸ & CHO NHẬN</Title>
              <Paragraph className="hero-desc">
                Khám phá và đóng góp cho các dự án ý nghĩa hoặc trao tặng và
                nhận quà từ cộng đồng
              </Paragraph>
              <Space size="middle" className="home-hero__btns">
                <Button type="primary" size="large" className="btn-hero-orange" onClick={() => navigate("/chien-dich")}>
                  KHÁM PHÁ CHIẾN DỊCH
                </Button>
                <Button size="large" className="btn-hero-green" onClick={() => navigate("/bang-tin")}>
                  ĐĂNG BÀI CHO/NHẬN
                </Button>
              </Space>
            </Typography>
          </div>
        </div>
      </section>

      {/* 2. Danh mục */}
      <section className="home-categories">
        <Row
          gutter={[16, 24]}
          justify="space-between"
          className="home-categories__inner"
        >
          {categories.map((cat) => (
            <Col key={cat.id} xs={12} sm={8} md={4}>
              <div className="category-item">
                <img
                  className="category-item__img"
                  src={cat.hinh_anh}
                  alt={cat.ten_danh_muc}
                />
                <Text strong className="category-item__label">
                  {cat.ten_danh_muc}
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* 3. Chiến dịch nổi bật */}
      <section className="home-campaigns-orgs">
        <div className="home-section__header">
          <h2 className="home-section__title">CHIẾN DỊCH NỔI BẬT</h2>
          <a href="/chien-dich/danh-sach" className="view-all">
            Xem tất cả <FiChevronRight />
          </a>
        </div>
        <CardCarousel>
          {featured.map((c, i) => (
            <div key={c.id} className="home-carousel__slide">
              <CampaignCard
                campaign={{
                  ...c,
                }}
                index={i}
              />
            </div>
          ))}
        </CardCarousel>
      </section>

      {/* 6. Banner cuối */}
      <section className="home-bottom-banner">
        <Carousel
          autoplay
          autoplaySpeed={2000}
          slidesToShow={2}
          slidesToScroll={1}
        >
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 1"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 2"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 3"
              />
            </div>
          </div>
          <div>
            <div className="bottom-banner-item">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop"
                alt="Banner 4"
              />
            </div>
          </div>
        </Carousel>
      </section>

      {/* 4. CTA */}
      <section className="home-cta">
        <div className="home-cta__inner">
          <Card className="cta-card cta-card--create" variant="borderless">
            <Title level={3}>Muốn tạo quỹ chiến dịch? Hãy bắt đầu ngay!</Title>
            <Row gutter={[12, 24]} className="cta-steps">
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img1} alt="Lên ý tưởng" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Lên ý tưởng
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Xác định mục tiêu và ý tưởng cho dự án
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img3} alt="Tạo & Gọi Vốn" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Tạo & Gọi Vốn
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Tạo hồ sơ tại website và kêu gọi ủng hộ
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img2} alt="Nhận đóng góp" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Nhận Đóng Góp
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Tiếp nhận đóng góp để lan tỏa yêu thương
                    </Paragraph>
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space align="start" className="cta-step">
                  <div className="cta-step__icon">
                    <img src={img4} alt="Triển khai dự án" />
                  </div>
                  <div>
                    <Text strong className="cta-step__title">
                      Triển Khai Dự Án
                    </Text>
                    <Paragraph type="secondary" className="cta-step__desc">
                      Thực hiện dự án mang lại giá trị cộng đồng
                    </Paragraph>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          <div className="cta-overlay">
            <Card
              className="cta-card cta-card--give"
              variant="borderless"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <Title level={3}>Cho/Nhận Đồ Dùng Miễn Phí Quanh Bạn</Title>
              <Row gutter={20} className="cta-give-content" align="middle">
                <Col span={14}>
                  <Paragraph type="secondary">
                    Bạn có thể nhận đồ dùng miễn phí bằng cách đăng bài hoặc
                    nhắn tin trực tiếp với người chia sẻ. Nền tảng sử dụng AI
                    giúp ghép nối và định hướng nhu cầu đến người dùng. Hãy trải
                    nghiệm!
                  </Paragraph>
                </Col>
              </Row>
              <Button
                type="primary"
                size="large"
                className="btn-cta-give"
                onClick={() => requireAuth(() => navigate("/bang-tin"))}
              >
                ĐĂNG BÀI NGAY
              </Button>
              <div className="cta-give-image">
                <Image preview={false} src={chonhan} alt="Give and Receive" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Tổ chức từ thiện */}
      <section className="home-campaigns-orgs">
        <div className="home-section__header">
          <h2 className="home-section__title">TỔ CHỨC TỪ THIỆN</h2>
          <a href="/chien-dich/to-chuc" className="view-all">
            Xem tất cả <FiChevronRight />
          </a>
        </div>
        <CardCarousel>
          {organizations.map((o, i) => (
            <div
              key={o.id}
              className="home-carousel__slide home-carousel__slide--org"
            >
              <OrganizationCard
                organization={{
                  ...o,
                }}
                index={i}
              />
            </div>
          ))}
        </CardCarousel>
      </section>
      {/* Modal đăng nhập */}
      <RequiredLoginModal
        openLoginModal={openLoginModal}
        setOpenLoginModal={setOpenLoginModal}
      />
      <Footer />
    </div>
  );
}
