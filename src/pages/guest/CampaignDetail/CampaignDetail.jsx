import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Button, Progress, Tabs, Carousel, Pagination } from "antd";
import {
  FiHeart,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiAward,
  FiInfo,
  FiCopy,
} from "react-icons/fi";
import { TbWorldHeart, TbLocationHeart } from "react-icons/tb";
import { PiClockUserDuotone } from "react-icons/pi";
import { LuShieldCheck } from "react-icons/lu";
import { GiCentaurHeart } from "react-icons/gi";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import { formatVnd } from "../../../utils/format";
import useCampaignStore from "../../../store/campaignStore";
import useCampaigns from "../../../hooks/useCampaigns";
import "./CampaignDetail.scss";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function CampaignDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { campaigns, loading } = useCampaigns({
    params: { page: 1, limit: 8 },
  });

  const otherCampaigns = campaigns.filter((c) => c.id !== Number(id));

  const [campaign, setCampaign] = useState(null);
  const [mainImg, setMainImg] = useState(0);
  const otherRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [donorPage, setDonorPage] = useState(1);
  const [donorPagination, setDonorPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 6,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadCampaign = async () => {
      const data = await useCampaignStore
        .getState()
        .fetchCampaignDetail(id, { page: donorPage });

      if (cancelled || !data) return;

      setCampaign((prev) => ({
        ...(prev || {}),
        id: data.id,
        title: data.ten_chien_dich,
        description: data.mo_ta,
        category: data.ten_danh_muc,
        images: data.hinh_anh,
        codebank: data.ma_noi_dung_ck,
        startday: data.ngay_bat_dau,
        endday: data.ngay_ket_thuc,
        raised: Number(data.so_tien_da_nhan),
        goal: Number(data.muc_tieu_tien),
        daysLeft: data.so_ngay_con_lai,
        location: data.vi_tri,
        lat: data.lat,
        lng: data.lng,
        status: data.trang_thai,
        total_donor: data.so_luot_ung_ho,

        org: {
          id: data.to_chuc?.id,
          name: data.to_chuc?.ten_to_chuc,
          logo: data.to_chuc?.logo,
          description: data.to_chuc?.mo_ta ? [data.to_chuc.mo_ta] : [],
          address: data.to_chuc?.dia_chi,
          email: data.to_chuc?.email,
          hotline: data.to_chuc?.so_dien_thoai,
          verified: true,
        },

        donors:
          data.danh_sach_ung_ho?.data?.map((d, i) => {
            const name = d?.ho_ten || "Ẩn danh";

            return {
              id: i,
              name,
              amount: Number(d?.so_tien),
              time: d?.created_at, 
              avatar: name.charAt(0).toUpperCase(),
            };
          }) || [],
      }));

      setDonorPagination({
        current: data.danh_sach_ung_ho.current_page,
        total: data.danh_sach_ung_ho.total,
        pageSize: data.danh_sach_ung_ho.per_page,
      });
    };

    loadCampaign();

    return () => {
      cancelled = true;
    };
  }, [id, donorPage]);

  function handleCopy() {
    navigator.clipboard.writeText(campaign.codebank);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  useEffect(() => {
    if (!campaign?.lat || !campaign?.lng) return;
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [campaign.lng, campaign.lat],
      zoom: 12,
    });

    new mapboxgl.Marker({ color: "#ff4d4f" })
      .setLngLat([campaign.lng, campaign.lat])
      .addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [campaign]);

  if (!campaign) return <div>Loading...</div>;

  const percent =
    campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;

  const tabItems = [
    {
      key: "info",
      label: (
        <span className="cd-tab__label">
          <FiInfo size={14} /> Thông tin chiến dịch
        </span>
      ),
      children: (
        <div className="cd-info">
          <div className="cd-info__grid">
            <div className="cd-info__item">
              <span className="cd-info__label">Mã chuyển khoản</span>
              <span className="cd-info__value">{campaign.codebank}</span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Danh mục</span>
              <span className="cd-info__value cd-info__value--badge">
                {campaign.category}
              </span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Bắt đầu</span>
              <span className="cd-info__value">{campaign.startday}</span>
            </div>
            <div className="cd-info__item">
              <span className="cd-info__label">Kết thúc</span>
              <span className="cd-info__value">{campaign.endday}</span>
            </div>
          </div>
          <p className="cd-info__desc">{campaign.description}</p>
        </div>
      ),
    },
    {
      key: "org",
      label: (
        <span className="cd-tab__label">
          <FiAward size={14} /> Tổ chức gây quỹ
        </span>
      ),
      children: (
        <div className="cd-org">
          <div className="cd-org__left">
            <div className="cd-org__header">
              <div className="cd-org__avatar">
                {campaign.org.logo ? (
                  <img src={campaign.org.logo} alt={campaign.org.name} />
                ) : (
                  <FiHeart size={24} />
                )}
              </div>
              <div>
                <div className="cd-org__name">{campaign.org.name}</div>
                {campaign.org.verified && (
                  <span className="cd-org__verified">
                    <LuShieldCheck size={12} /> Tổ chức xác minh
                  </span>
                )}
              </div>
            </div>
            <ul className="cd-org__desc">
              {campaign.org.description.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
          <div className="cd-org__right">
            <div className="cd-org__contact-item">
              <FiMapPin
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--red"
              />
              <span>{campaign.org.address}</span>
            </div>
            <div className="cd-org__contact-item">
              <FiPhone
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--green"
              />
              <span>Hotline: {campaign.org.hotline}</span>
            </div>
            <div className="cd-org__contact-item">
              <FiMail
                size={14}
                className="cd-org__contact-icon cd-org__contact-icon--blue"
              />
              <span>Email: {campaign.org.email}</span>
            </div>
            <Button
              className="cd-org__more-btn"
              onClick={() =>
                navigate(`/chien-dich/to-chuc/chi-tiet/${campaign.org.id}`)
              }
            >
              TÌM HIỂU THÊM
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: "donors",
      label: (
        <span className="cd-tab__label">
          <FiUsers size={14} /> Danh sách ủng hộ
        </span>
      ),
      children: (
        <div className="cd-donors">
          {campaign.donors.map((d, i) => (
            <div
              className="cd-donor-item"
              key={d.id}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="cd-donor-item__avatar"
                style={{
                  background: [
                    "#ff4d4f",
                    "#fa8c16",
                    "#52c41a",
                    "#1890ff",
                    "#722ed1",
                  ][i % 5],
                }}
              >
                {d.avatar}
              </div>
              <div className="cd-donor-item__info">
                <div className="cd-donor-item__name">{d.name}</div>
                <div className="cd-donor-item__time">{d.time}</div>
              </div>
              <div className="cd-donor-item__amount">
                +{formatVnd(d.amount)}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Pagination
              current={donorPagination.current}
              total={donorPagination.total}
              pageSize={donorPagination.pageSize}
              onChange={(page) => setDonorPage(page)}
            />
          </div>
        </div>
      ),
    },
  ];

  const getStatusLabel = (status) => {
    switch (status) {
      case "HOAT_DONG":
        return "Đang hoạt động";
      case "DA_KET_THUC":
        return "Đã kết thúc";
      case "TAM_DUNG":
        return "Tạm dừng";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="cd-page">
      {/* ── Title ── */}
      <h1 className="cd-title">{campaign.title}</h1>
      <div className="cd-divider" />

      {/* ── Main content ── */}
      <div className="cd-body">
        {/* Left: Gallery */}
        <div className="cd-gallery">
          <div className="cd-gallery__main">
            <div className="cd-gallery__main-img">
              <img src={campaign.images[mainImg]} alt={`Hình ${mainImg + 1}`} />
            </div>
          </div>

          <div className="cd-gallery__thumbs">
            {campaign.images.map((img, i) => (
              <div
                key={i}
                className={`cd-gallery__thumb${mainImg === i ? " active" : ""}`}
                onClick={() => setMainImg(i)}
              >
                <img src={img} alt={`Thumb ${i + 1}`} />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="cd-tabs-wrap">
            <Tabs items={tabItems} className="cd-tabs" />
          </div>
        </div>

        {/* Right: Stats + Action */}
        <div className="cd-stats">
          <div className="cd-stats-top">
            {/* Raised */}
            <div className="cd-stats__raised-block">
              <div className="cd-stats__raised-icon-wrap">
                <div className="cd-stats__raised-icon">
                  <FiHeart size={22} />
                </div>
                <div className="cd-stats__raised-ripple" />
                <div className="cd-stats__raised-ripple cd-stats__raised-ripple--2" />
              </div>
              <div className="cd-stats__raised-amount">
                {formatVnd(campaign.raised)}
                <div className="cd-stats__raised-sub">
                  đã đóng góp trên mục tiêu {formatVnd(campaign.goal)}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="cd-stats__progress-wrap">
              <div className="cd-stats__progress-header">
                <span className="cd-stats__progress-label">
                  {getStatusLabel(campaign.status)}
                </span>
                <span className="cd-stats__progress-pct">{percent}%</span>
              </div>
              <Progress
                percent={percent}
                showInfo={false}
                strokeColor={{ "0%": "#ff4d4f", "100%": "#fa8c16" }}
                railColor="rgba(0,0,0,0.07)"
                strokeLinecap="round"
                className="cd-stats__progress"
              />
              <div className="cd-stats__progress-labels">
                <span>{formatVnd(campaign.raised)}</span>
                <span>{formatVnd(campaign.goal)}</span>
              </div>
            </div>

            {/* Meta */}
            <div className="cd-stats__meta">
              <div className="cd-stats__meta-item">
                <div className="cd-stats__meta-icon cd-stats__meta-icon--pink">
                  <TbWorldHeart size={24} />
                  <span className="cd-stats__meta-icon-ping" />
                </div>
                <div className="cd-stats__meta-text">
                  <span className="cd-stats__meta-value">
                    {campaign.total_donor}
                  </span>
                  <span className="cd-stats__meta-label">số lượt ủng hộ</span>
                </div>
              </div>
              <div className="cd-stats__meta-divider" />
              <div className="cd-stats__meta-item">
                <div className="cd-stats__meta-icon cd-stats__meta-icon--orange">
                  <PiClockUserDuotone size={24} />
                </div>
                <div className="cd-stats__meta-text">
                  <span className="cd-stats__meta-value">
                    {campaign.daysLeft}
                  </span>
                  <span className="cd-stats__meta-label">ngày còn lại</span>
                </div>
              </div>
            </div>

            {/* Transfer content box */}
            <div className="cd-stats__bank-box">
              <div className="cd-stats__bank-header">
                <span>Mã nội dung chuyển khoản</span>
              </div>

              <div className="cd-stats__bank-content">
                <span className="cd-stats__bank-code">
                  {copied ? "Đã sao chép!" : campaign.codebank}
                </span>

                <button className="cd-stats__copy-btn" onClick={handleCopy}>
                  <FiCopy size={16} />
                </button>
              </div>

              <div className="cd-stats__bank-note">
                (Vui lòng sao chép mã này vào nội dung chuyển khoản để chúng tôi
                nhận ra ủng hộ của bạn)
              </div>
            </div>

            {/* Action button */}
            <div className="cd-stats__action">
              <div className="cd-stats__action-org-icon">
                <GiCentaurHeart size={36} />
              </div>
              <Button
                type="primary"
                danger
                size="large"
                className="cd-stats__donate-btn"
                onClick={() => navigate(`/chien-dich/ung-ho/${campaign.id}`)}
              >
                <TbLocationHeart size={20} /> ỦNG HỘ CHIẾN DỊCH
              </Button>
            </div>

            {/* Trust badges */}
            <div className="cd-stats__trust">
              <div className="cd-stats__trust-item">
                <LuShieldCheck size={13} />
                <span>Bảo mật 100%</span>
              </div>
              <div className="cd-stats__trust-sep" />
              <div className="cd-stats__trust-item">
                <FiAward size={13} />
                <span>Tổ chức xác minh</span>
              </div>
              <div className="cd-stats__trust-sep" />
              <div className="cd-stats__trust-item">
                <FiUsers size={13} />
                <span>Minh bạch</span>
              </div>
            </div>
          </div>

          {/* Support area */}
          <div className="cd-stats__support">
            <div className="cd-stats__support-header">
              <FiMapPin size={15} />
              <span>Khu vực hỗ trợ</span>
            </div>
            <div className="cd-stats__map" ref={mapContainerRef} />
          </div>
        </div>
      </div>

      {/* ── Other campaigns ── */}
      <div className="cd-others">
        <h2 className="cd-others__title">CÁC CHIẾN DỊCH KHÁC</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="cd-others__carousel-wrap">
            <Carousel
              ref={otherRef}
              dots={false}
              infinite={false}
              draggable
              slidesToShow={4}
              slidesToScroll={1}
              responsive={[
                { breakpoint: 1100, settings: { slidesToShow: 3 } },
                { breakpoint: 600, settings: { slidesToShow: 2 } },
              ]}
            >
              {otherCampaigns.map((c, i) => (
                <div key={c.id} className="cd-others__slide">
                  <CampaignCard campaign={c} index={i} />
                </div>
              ))}
            </Carousel>
            <button
              className="cd-others__nav cd-others__nav--prev"
              onClick={() => otherRef.current?.prev?.()}
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              className="cd-others__nav cd-others__nav--next"
              onClick={() => otherRef.current?.next?.()}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
