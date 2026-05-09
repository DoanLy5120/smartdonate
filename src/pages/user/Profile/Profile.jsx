import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import useAuthStore from "../../../store/authStore";
import useProfile from "../../../hooks/useProfile";
import useCategories from "../../../hooks/useCategories";
import useCampaigns from "../../../hooks/useCampaigns";
import LocationPicker from "../../../components/LocationPicker/index";
import banner from "../../../assets/canhbao.png";
import Header from "../../../components/Header/index.jsx";
import Footer from "../../../components/Footer/index.jsx";
import PostCard from "../../../components/PostCard";
import "./Profile.scss";
import useWithdrawRequestStore from "../../../store/withdrawRequestStore";

export default function ProfilePage() {
  const sentinelRef = useRef(null);
  const { user } = useAuthStore();
  const storeRoles = useAuthStore((s) => s.roles);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("history");
  const [likedMap, setLikedMap] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(null); // campaign object
  const [withdrawForm, setWithdrawForm] = useState({ so_tien: "", mo_ta: "" });
  const [rawWithdrawAmount, setRawWithdrawAmount] = useState("");
  const { createRequest, submitting: submittingWithdraw } =
    useWithdrawRequestStore();
  const [expenseModalCampaign, setExpenseModalCampaign] = useState(null);
  const [editModalCampaign, setEditModalCampaign] = useState(null);

  const {
    profile,
    donations,
    myPosts,
    myCampaigns,
    loading,
    loadingDonations,
    loadingPosts,
    donationsHasMore,
    postsHasMore,
    loadMoreDonations,
    loadMorePosts,
    loadingCampaigns,
    campaignsHasMore,
    loadMoreCampaigns,
    handleUpdateProfile,
    handleChangePassword,
    donationsTotal,
    postsTotal,
    campaignsTotal,
  } = useProfile();

  const isOrganization = Array.isArray(storeRoles)
    ? storeRoles.some(
        (r) =>
          r === "TO_CHUC" ||
          r?.ten === "TO_CHUC" ||
          r?.ten_vai_tro === "TO_CHUC",
      )
    : false;

  const profileUser = profile?.user;
  const avatarUrl = profileUser?.anh_dai_dien || null;
  const displayName = profileUser?.ho_ten || user?.ho_ten || "User";
  const toChuc = profileUser?.to_chuc || null;
  const taiKhoan = toChuc?.tai_khoan_gay_quy || null;
  const stk = taiKhoan?.so_tai_khoan || "";

  // Đóng menu 3 chấm khi click ra ngoài
  useEffect(() => {
    if (openMenuId === null) return;
    const handleClick = (e) => {
      if (
        !e.target.closest(".pcd-card__menu") &&
        !e.target.closest(".pcd-card__menu-btn")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  // Infinite scroll for posts and donations tabs
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (activeTab === "posts" && postsHasMore && !loadingPosts)
          loadMorePosts();
        if (activeTab === "history" && donationsHasMore && !loadingDonations)
          loadMoreDonations();
        if (activeTab === "projects" && campaignsHasMore && !loadingCampaigns)
          loadMoreCampaigns();
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [
    activeTab,
    postsHasMore,
    loadingPosts,
    loadMorePosts,
    donationsHasMore,
    loadingDonations,
    loadMoreDonations,
    campaignsHasMore,
    loadingCampaigns,
    loadMoreCampaigns,
  ]);

  const handleWithdrawRequest = (campaign, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setWithdrawForm({ so_tien: "", mo_ta: "" });
    setRawWithdrawAmount("");
    setWithdrawModal(campaign);
  };

  const handleWithdrawSubmit = async () => {
    const amount = Number(withdrawForm.so_tien);
    if (!amount || amount < 100000) {
      notification.warning({
        message: "Số tiền tối thiểu 100.000đ!",
        placement: "topRight",
      });
      return;
    }
    if (!withdrawForm.mo_ta.trim()) {
      notification.warning({
        message: "Vui lòng nhập lý do rút!",
        placement: "topRight",
      });
      return;
    }
    const { ok, err } = await createRequest({
      chien_dich_id: withdrawModal.id,
      so_tien: String(amount),
      mo_ta: withdrawForm.mo_ta,
    });
    if (ok) {
      notification.success({
        message: "Gửi yêu cầu rút tiền thành công!",
        placement: "topRight",
      });
      setWithdrawModal(null);
    } else {
      notification.error({
        message: "Gửi yêu cầu thất bại",
        description: err?.response?.data?.message || err?.message,
        placement: "topRight",
      });
    }
  };

  const handleEditCampaign = (campaign, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (campaign.trang_thai !== "CHO_XU_LY") {
      notification.error({
        message: "Không thể chỉnh sửa",
        description: "Chiến dịch đã được duyệt, bạn không được phép chỉnh sửa.",
        placement: "topRight",
      });
      return;
    }
    setEditModalCampaign(campaign);
  };

  const handleExpenseActivity = (campaign, e) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (campaign.trang_thai === "CHO_XU_LY") {
      notification.warning({
        message: "Không thể thực hiện sao kê",
        description:
          "Chiến dịch đang được xét duyệt, bạn không thể thực hiện sao kê.",
        placement: "topRight",
      });
      return;
    }
    if (campaign.trang_thai === "TU_CHOI") {
      notification.error({
        message: "Không thể thực hiện sao kê",
        description: "Chiến dịch đã bị từ chối, không thể thực hiện sao kê.",
        placement: "topRight",
      });
      return;
    }
    setExpenseModalCampaign(campaign);
  };

  const toPostCard = (item) => ({
    id: item.id,
    nguoi_dung_id: item.nguoi_dung_id,
    user: {
      id: item.nguoi_dung_id,
      name: item.nguoi_dung_ten,
      avatar: (item.nguoi_dung_ten?.[0] || "U").toUpperCase(),
      anh_dai_dien: item.avatar_url ?? null,
      color: "rgb(24, 144, 255)",
    },
    location: item.dia_diem,
    time: new Date(item.created_at).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    images: item.hinh_anh_urls?.length
      ? item.hinh_anh_urls
      : item.hinh_anh_url
        ? [item.hinh_anh_url]
        : [],
    title: item.tieu_de,
    desc: item.mo_ta,
    so_luong: item.so_luong,
    likeCount: item.so_luot_thich || 0,
    trang_thai: item.trang_thai,
    type: item.loai_bai === "CHO" ? "cho" : "nhan",
    aiSuggestions: [],
    commentCount: item.so_binh_luan || 0,
  });

  const tabs = [
    { key: "history", label: "Lịch sử ủng hộ" },
    { key: "posts", label: "Bài đăng" },
    isOrganization
      ? { key: "projects", label: "Chiến dịch đã tạo" }
      : { key: "register", label: "Trở thành tổ chức" },
  ];

  if (loading && !profile) {
    return (
      <>
        <Header />
        <div className="profile-page profile-page--loading">
          <div className="profile-loading">
            <div className="profile-loading__spinner" />
            <span>Đang tải...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-header__left">
            <div className="profile-header__actions">
              <div className="profile-avatar">
                <div className="profile-avatar__circle">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" />
                  ) : (
                    <span>{displayName[0]?.toUpperCase()}</span>
                  )}
                </div>
                {isOrganization && (
                  <div
                    className="profile-avatar__org-badge"
                    title="Tổ chức xác minh"
                  >
                    ✓
                  </div>
                )}
              </div>
              <div className="profile-info">
                <div className="profile-info__name">
                  <h2>{displayName}</h2>
                  <span
                    className={`profile-badge${isOrganization ? " profile-badge--org" : ""}`}
                  >
                    {isOrganization ? "🏢 Tổ chức" : "Verified"}
                  </span>
                </div>
                <p className="profile-info__username">
                  @
                  {profileUser?.ten_tai_khoan ||
                    user?.email?.split("@")[0] ||
                    "user"}
                </p>
                {isOrganization && toChuc?.ten_to_chuc && (
                  <p className="profile-info__org">{toChuc.ten_to_chuc}</p>
                )}
                {profileUser?.dia_chi && (
                  <p className="profile-info__address">{profileUser.dia_chi}</p>
                )}
              </div>
            </div>
            <div className="profile-actions">
              <button
                className="profile-btn profile-btn--green"
                onClick={() => setShowEditModal(true)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Chỉnh sửa hồ sơ
              </button>
              <button
                className="profile-btn profile-btn--outline"
                onClick={() => setShowPasswordModal(true)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Đổi mật khẩu
              </button>
            </div>
          </div>

          <div className="profile-header__right">
            {isOrganization && toChuc && (
              <div className="profile-bank">
                <div className="profile-bank__header">
                  <div className="profile-bank__header-left">
                    <div
                      className={`profile-bank__logo${toChuc?.logo ? " profile-bank__logo--has-img" : ""}`}
                    >
                      {toChuc?.logo ? (
                        <img src={toChuc.logo} alt="logo" />
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.5"
                        >
                          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3>{toChuc?.ten_to_chuc || "Tổ chức"}</h3>
                      <p>{taiKhoan?.so_tai_khoan || "---"}</p>
                    </div>
                  </div>
                  {stk && (
                    <div className="profile-bank__qr">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=STK:${stk}`}
                        alt="QR"
                      />
                    </div>
                  )}
                </div>
                <div className="profile-bank__balance-label">
                  Số dư hiện tại
                </div>
                <div className="profile-bank__balance">
                  {taiKhoan?.so_du != null
                    ? Number(taiKhoan.so_du).toLocaleString("vi-VN") + " đ"
                    : "---"}
                </div>
                <div className="profile-bank__row">
                  <div className="profile-bank__col">
                    <span className="profile-bank__col-label">↑ Tổng thu</span>
                    <span className="profile-bank__col-value profile-bank__col-value--green">
                      {taiKhoan?.tong_thu != null
                        ? Number(taiKhoan.tong_thu).toLocaleString("vi-VN") +
                          " đ"
                        : "---"}
                    </span>
                  </div>
                  <div className="profile-bank__col">
                    <span className="profile-bank__col-label">↓ Tổng chi</span>
                    <span className="profile-bank__col-value profile-bank__col-value--red">
                      {taiKhoan?.tong_chi != null
                        ? Number(taiKhoan.tong_chi).toLocaleString("vi-VN") +
                          " đ"
                        : "---"}
                    </span>
                  </div>
                </div>
                {stk && (
                  <div className="profile-bank__stk">
                    STK: {stk} ·{" "}
                    {taiKhoan?.chu_tai_khoan || toChuc?.ten_to_chuc || "---"}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="profile-stats">
          <div className="profile-stats__item">
            <span>Tổng donate</span>
            <strong>
              {Number(profile?.tong_tien_ung_ho || 0).toLocaleString("vi-VN")}{" "}
              vnđ
            </strong>
          </div>
          <div className="profile-stats__sep" />
          <div className="profile-stats__item">
            <span>Bài đăng</span>
            <strong>{postsTotal} bài</strong>
          </div>
          <div className="profile-stats__sep" />
          <div className="profile-stats__item">
            <span>{isOrganization ? "Chiến dịch" : "Lịch sử ủng hộ"}</span>
            <strong>{isOrganization ? campaignsTotal : donationsTotal}</strong>
          </div>
        </div>

        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`profile-tabs__tab${activeTab === tab.key ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="profile-content">
          {activeTab === "history" && (
            <div className="dh">
              <div className="dh-header">
                <h3 className="dh-header__title">
                  <span className="dh-header__icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </span>
                  Lịch sử ủng hộ
                </h3>
                <span className="dh-header__total">
                  {donationsTotal} lần ủng hộ
                </span>
              </div>
              {donations.length === 0 ? (
                <div className="profile-empty">
                  <div className="profile-empty__icon">💝</div>
                  <p>Chưa có lịch sử ủng hộ</p>
                </div>
              ) : (
                <div className="dh-timeline">
                  {donations.map((item, i) => (
                    <div key={item.id || i} className="dh-card">
                      <div className="dh-card__cover">
                        <img
                          src={item.anh || item.chien_dich?.anh_bia || banner}
                          alt={item.ten_chien_dich || "campaign"}
                        />
                      </div>
                      <div className="dh-card__body">
                        <div className="dh-card__head">
                          <h4 className="dh-card__title">
                            {item.ten_chien_dich ||
                              item.chien_dich?.ten_chien_dich ||
                              "Chiến dịch"}
                          </h4>
                          <div className="dh-card__amount-badge">
                            +{" "}
                            {Number(item.so_tien || 0).toLocaleString("vi-VN")}{" "}
                            đ
                          </div>
                        </div>

                        <div className="dh-card__meta">
                          <span className="dh-card__meta-item">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {(item.ngay_ung_ho || item.created_at)?.substring(
                              0,
                              10,
                            )}
                          </span>
                          {item.trang_thai === "THANH_CONG" && (
                            <span className="dh-card__status dh-card__status--success">
                              ✓ Thành công
                            </span>
                          )}
                          {item.trang_thai === "DANG_XU_LY" && (
                            <span className="dh-card__status dh-card__status--pending">
                              ⏳ Đang xử lý
                            </span>
                          )}
                          {item.trang_thai === "THAT_BAI" && (
                            <span className="dh-card__status dh-card__status--failed">
                              ✗ Thất bại
                            </span>
                          )}
                        </div>

                        <div className="dh-card__footer">
                          <span className="dh-card__hint">
                            💚 Cảm ơn bạn đã ủng hộ chiến dịch
                          </span>
                          <button
                            className="dh-view-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/chien-dich/chi-tiet/${item.chien_dich_id}`,
                              );
                            }}
                          >
                            Xem chiến dịch
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M7 17L17 7M17 7H7M17 7v10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {donationsHasMore && (
                <div
                  ref={sentinelRef}
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {loadingDonations ? "Đang tải..." : ""}
                </div>
              )}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="profile-posts">
              <div className="profile-posts__action">
                <button
                  className="profile-empty__btn"
                  onClick={() => navigate("/bang-tin/tao-moi")}
                >
                  + Tạo bài đăng
                </button>
              </div>
              {myPosts.length > 0 ? (
                myPosts.map((item) => (
                  <PostCard
                    key={item.id}
                    post={toPostCard(item)}
                    liked={!!likedMap[item.id]}
                    onLike={() =>
                      setLikedMap((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                  />
                ))
              ) : (
                <div className="profile-empty">
                  <div className="profile-empty__icon">📝</div>
                  <p>Chưa có bài đăng nào</p>
                  <p className="profile-empty__hint">
                    Tạo bài đăng cho/nhận đồ để AI gợi ý ghép nối người phù hợp
                  </p>
                </div>
              )}
              {postsHasMore && (
                <div
                  ref={sentinelRef}
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "var(--color-text-tertiary)",
                  }}
                >
                  {loadingPosts ? "Đang tải..." : ""}
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && isOrganization && (
            <div className="profile-tab-content">
              <div className="pcd-header">
                <button
                  className="pcd-create-btn"
                  onClick={() => navigate("/chien-dich/tao-moi")}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Tạo chiến dịch mới
                </button>
              </div>
              {!myCampaigns || myCampaigns.length === 0 ? (
                <div className="profile-empty">
                  <div className="profile-empty__icon">📂</div>
                  <p>Chưa có chiến dịch nào</p>
                  <p className="profile-empty__hint">
                    Tạo chiến dịch gây quỹ để bắt đầu
                  </p>
                </div>
              ) : (
                <div className="profile-campaigns">
                  {myCampaigns.map((c) => {
                    const pct =
                      c.muc_tieu_tien > 0
                        ? Math.round(
                            (c.so_tien_da_nhan / c.muc_tieu_tien) * 100,
                          )
                        : 0;
                    const conThieu = Math.max(
                      0,
                      (c.muc_tieu_tien || 0) - (c.so_tien_da_nhan || 0),
                    );
                    const isPending = c.trang_thai === "CHO_XU_LY";
                    const isRejected = c.trang_thai === "TU_CHOI";
                    const statusBadge = (() => {
                      if (isPending)
                        return {
                          text: "⏳ Chờ duyệt",
                          cls: "pcd-card__badge--pending",
                        };
                      if (c.trang_thai === "TU_CHOI")
                        return {
                          text: "✗ Từ chối",
                          cls: "pcd-card__badge--rejected",
                        };
                      if (c.trang_thai === "HOAN_THANH")
                        return {
                          text: "✓ Hoàn thành",
                          cls: "pcd-card__badge--success",
                        };
                      if (c.trang_thai === "TAM_DUNG")
                        return {
                          text: "⏸ Tạm dừng",
                          cls: "pcd-card__badge--paused",
                        };
                      if (c.trang_thai === "DA_KET_THUC")
                        return {
                          text: "🏁 Đã kết thúc",
                          cls: "pcd-card__badge--ended",
                        };
                      return {
                        text: `⏰ Còn ${c.so_ngay_con_lai || 0} ngày`,
                        cls: "pcd-card__badge--days",
                      };
                    })();
                    return (
                      <div key={c.id} className="pcd-card">
                        <div className="pcd-card__cover">
                          {c.hinh_anh ? (
                            <img src={c.hinh_anh} alt={c.ten_chien_dich} />
                          ) : (
                            <div className="pcd-card__no-img">📷</div>
                          )}
                        </div>
                        <div className="pcd-card__body">
                          <div className="pcd-card__head">
                            <h4 className="pcd-card__title">
                              {c.ten_chien_dich}
                            </h4>
                            <div className="pcd-card__head-right">
                              <span
                                className={`pcd-card__badge ${statusBadge.cls}`}
                              >
                                {statusBadge.text}
                              </span>
                              <button
                                className="pcd-card__menu-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === c.id ? null : c.id,
                                  );
                                }}
                              >
                                ⋮
                              </button>
                              {openMenuId === c.id && (
                                <div
                                  className="pcd-card__menu"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {isPending && (
                                    <button
                                      className="pcd-card__menu-item"
                                      onClick={(e) => handleEditCampaign(c, e)}
                                    >
                                      <span
                                        className="pcd-card__menu-icon"
                                        style={{ color: "#2db872" }}
                                      >
                                        ✎
                                      </span>
                                      Chỉnh sửa chiến dịch
                                    </button>
                                  )}
                                  <button
                                    className={`pcd-card__menu-item${isPending || isRejected ? " pcd-card__menu-item--disabled" : " pcd-card__menu-item--accent"}`}
                                    onClick={(e) => handleExpenseActivity(c, e)}
                                  >
                                    <span className="pcd-card__menu-icon">
                                      📊
                                    </span>
                                    Hoạt động chi quỹ
                                    {(isPending || isRejected) && (
                                      <span className="pcd-card__menu-badge">
                                        {isRejected ? "từ chối" : "khóa"}
                                      </span>
                                    )}
                                  </button>
                                  {c.trang_thai === "HOAT_DONG" && (
                                    <button
                                      className="pcd-card__menu-item pcd-card__menu-item--withdraw"
                                      onClick={(e) =>
                                        handleWithdrawRequest(c, e)
                                      }
                                    >
                                      <span className="pcd-card__menu-icon">
                                        💸
                                      </span>
                                      Yêu cầu rút tiền
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pcd-card__progress-row">
                            <div className="pcd-card__progress-bar">
                              <div
                                className="pcd-card__progress-fill"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="pcd-card__pct">{pct}%</span>
                          </div>

                          {conThieu > 0 && (
                            <div className="pcd-card__shortage">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              Còn thiếu{" "}
                              {Number(conThieu).toLocaleString("vi-VN")} đ
                            </div>
                          )}

                          <div className="pcd-card__bottom">
                            <div className="pcd-card__amounts">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                              </svg>
                              <strong>
                                {Number(c.so_tien_da_nhan || 0).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                đ
                              </strong>
                              <span className="pcd-card__amounts-sep"> / </span>
                              <span className="pcd-card__amounts-target">
                                {Number(c.muc_tieu_tien || 0).toLocaleString(
                                  "vi-VN",
                                )}{" "}
                                đ
                              </span>
                            </div>
                            <button
                              className="pcd-card__view-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/chien-dich/chi-tiet/${c.id}`);
                              }}
                            >
                              Xem chi tiết
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M7 17L17 7M17 7H7M17 7v10" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {campaignsHasMore && (
                    <div
                      ref={sentinelRef}
                      style={{
                        textAlign: "center",
                        padding: "16px",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      {loadingCampaigns ? "Đang tải..." : ""}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* ── Modal Yêu cầu rút tiền ── */}
          {withdrawModal && (
            <div className="wr-overlay" onClick={() => setWithdrawModal(null)}>
              <div className="wr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="wr-modal__header">
                  <div>
                    <div className="wr-modal__title">💸 Yêu cầu rút tiền</div>
                    <div className="wr-modal__sub">
                      {withdrawModal.ten_chien_dich}
                    </div>
                  </div>
                  <button
                    className="wr-modal__close"
                    onClick={() => setWithdrawModal(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="wr-modal__body">
                  <div className="wr-modal__field">
                    <label className="wr-modal__label">
                      Số tiền muốn rút *
                    </label>
                    <div className="wr-modal__input-wrap">
                      <input
                        className="wr-modal__input"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={
                          rawWithdrawAmount
                            ? Number(rawWithdrawAmount).toLocaleString("vi-VN")
                            : ""
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setRawWithdrawAmount(raw);
                          setWithdrawForm((f) => ({ ...f, so_tien: raw }));
                        }}
                      />
                      <span className="wr-modal__suffix">đ</span>
                    </div>
                    {rawWithdrawAmount &&
                      Number(rawWithdrawAmount) >= 100000 && (
                        <div className="wr-modal__hint">
                          = {Number(rawWithdrawAmount).toLocaleString("vi-VN")}đ
                        </div>
                      )}
                  </div>
                  <div className="wr-modal__field">
                    <label className="wr-modal__label">Lý do rút tiền *</label>
                    <textarea
                      className="wr-modal__textarea"
                      placeholder="Mô tả mục đích sử dụng số tiền (chi phí hoạt động, mua vật tư...)"
                      value={withdrawForm.mo_ta}
                      onChange={(e) =>
                        setWithdrawForm((f) => ({
                          ...f,
                          mo_ta: e.target.value,
                        }))
                      }
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                </div>
                <div className="wr-modal__footer">
                  <button
                    className="wr-modal__btn wr-modal__btn--ghost"
                    onClick={() => setWithdrawModal(null)}
                  >
                    Hủy
                  </button>
                  <button
                    className="wr-modal__btn wr-modal__btn--primary"
                    onClick={handleWithdrawSubmit}
                    disabled={submittingWithdraw}
                  >
                    {submittingWithdraw ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "register" && !isOrganization && (
            <div className="profile-tab-content">
              <div className="profile-empty">
                <div className="profile-empty__icon">🏢</div>
                <p>
                  Trở thành <strong>Tổ chức từ thiện</strong> để tạo chiến dịch
                </p>
                <p className="profile-empty__hint">
                  Đăng ký để tạo và quản lý chiến dịch gây quỹ, tiếp cận hàng
                  nghìn nhà hảo tâm
                </p>
                <button
                  className="profile-empty__btn"
                  onClick={() => navigate("/dk-to-chuc")}
                >
                  Đăng ký tổ chức
                </button>
              </div>
            </div>
          )}
        </div>

        {showEditModal && (
          <EditProfileModal
            user={user}
            profileUser={profileUser}
            toChuc={toChuc}
            avatarUrl={avatarUrl}
            isOrganization={isOrganization}
            onUpdateProfile={handleUpdateProfile}
            onClose={() => setShowEditModal(false)}
          />
        )}
        {showPasswordModal && (
          <ChangePasswordModal
            profileUser={profileUser}
            onChangePassword={handleChangePassword}
            onClose={() => setShowPasswordModal(false)}
          />
        )}
        {expenseModalCampaign && (
          <ExpenseActivityModal
            campaign={expenseModalCampaign}
            toChuc={toChuc}
            onClose={() => setExpenseModalCampaign(null)}
            onSuccess={() => setExpenseModalCampaign(null)}
          />
        )}
        {editModalCampaign && (
          <EditCampaignModal
            campaign={editModalCampaign}
            onClose={() => setEditModalCampaign(null)}
            onSuccess={() => {
              setEditModalCampaign(null);
              window.location.reload();
            }}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

/* ===================== Modal: Chỉnh sửa chiến dịch ===================== */
function EditCampaignModal({ campaign, onClose, onSuccess }) {
  const fileRef = useRef(null);
  const { categories } = useCategories();
  const { fetchCampaignForEdit, handleUpdateCampaign, loadingUpdate } =
    useCampaigns();

  const [oldImages, setOldImages] = useState([]); // URL ảnh hiện tại (giữ lại)
  const [removedImages, setRemovedImages] = useState([]); // URL ảnh xóa
  const [newFiles, setNewFiles] = useState([]); // File ảnh mới
  const [newPreviews, setNewPreviews] = useState([]); // Preview URL của ảnh mới

  const [form, setForm] = useState({
    ten_chien_dich: "",
    danh_muc_id: "",
    mo_ta: "",
    muc_tieu_tien: "",
    ngay_ket_thuc: "",
    vi_tri: "",
    lat: null,
    lng: null,
  });
  const [fetching, setFetching] = useState(true);

  // Lấy data đầy đủ qua hook (store sẽ gọi /campaigns/update/{id})
  useEffect(() => {
    (async () => {
      const { ok, data, err } = await fetchCampaignForEdit(campaign.id);
      if (!ok) {
        notification.error({
          message: "Không tải được chi tiết chiến dịch",
          description: err?.response?.data?.message || err?.message,
          placement: "topRight",
        });
        setFetching(false);
        return;
      }
      setForm({
        ten_chien_dich: data.ten_chien_dich || "",
        danh_muc_id: data.danh_muc_id || "",
        mo_ta: data.mo_ta || "",
        muc_tieu_tien: data.muc_tieu_tien || "",
        ngay_ket_thuc: (data.ngay_ket_thuc || "").substring(0, 10),
        vi_tri: data.vi_tri || "",
        lat: data.lat ?? null,
        lng: data.lng ?? null,
      });
      setOldImages(Array.isArray(data.hinh_anh) ? data.hinh_anh : []);
      setFetching(false);
    })();
  }, [campaign.id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const handleRemoveOldImage = (url) => {
    setOldImages((prev) => prev.filter((u) => u !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const handleRemoveNewImage = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    // Validate
    if (!form.ten_chien_dich.trim()) {
      notification.warning({
        message: "Vui lòng nhập tên chiến dịch!",
        placement: "topRight",
      });
      return;
    }
    if (!form.danh_muc_id) {
      notification.warning({
        message: "Vui lòng chọn danh mục!",
        placement: "topRight",
      });
      return;
    }
    if (!form.mo_ta.trim()) {
      notification.warning({
        message: "Vui lòng nhập mô tả!",
        placement: "topRight",
      });
      return;
    }
    const target = Number(String(form.muc_tieu_tien).replace(/\D/g, ""));
    if (!target || target < 10000) {
      notification.warning({
        message: "Mục tiêu tiền tối thiểu 10.000đ!",
        placement: "topRight",
      });
      return;
    }
    if (!form.ngay_ket_thuc) {
      notification.warning({
        message: "Vui lòng chọn ngày kết thúc!",
        placement: "topRight",
      });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(form.ngay_ket_thuc) <= today) {
      notification.warning({
        message: "Ngày kết thúc phải sau hôm nay!",
        placement: "topRight",
      });
      return;
    }
    if (!form.vi_tri.trim() || form.lat == null || form.lng == null) {
      notification.warning({
        message: "Vui lòng chọn vị trí trên bản đồ!",
        placement: "topRight",
      });
      return;
    }
    if (oldImages.length + newFiles.length === 0) {
      notification.warning({
        message: "Phải có ít nhất 1 hình ảnh!",
        placement: "topRight",
      });
      return;
    }

    const fd = new FormData();
    fd.append("ten_chien_dich", form.ten_chien_dich);
    fd.append("danh_muc_id", form.danh_muc_id);
    fd.append("mo_ta", form.mo_ta);
    fd.append("muc_tieu_tien", target);
    fd.append("ngay_ket_thuc", form.ngay_ket_thuc);
    fd.append("vi_tri", form.vi_tri);
    fd.append("lat", form.lat);
    fd.append("lng", form.lng);
    oldImages.forEach((url) => fd.append("anh_cu[]", url));
    removedImages.forEach((url) => fd.append("xoa_anh[]", url));
    newFiles.forEach((file) => fd.append("anh_moi[]", file));

    const { ok, err } = await handleUpdateCampaign(campaign.id, fd);
    if (ok) {
      notification.success({
        message: "Cập nhật chiến dịch thành công!",
        placement: "topRight",
      });
      onSuccess();
    } else {
      const errors = err?.response?.data?.errors;
      const firstErr = errors ? Object.values(errors)[0]?.[0] : null;
      notification.error({
        message: "Cập nhật thất bại",
        description: firstErr || err?.response?.data?.message || err?.message,
        placement: "topRight",
      });
    }
  };

  return (
    <div
      className="ep-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ep-modal" style={{ maxWidth: 640 }}>
        <div className="ep-modal__header" style={{ background: "#2db872" }}>
          <span>Chỉnh sửa chiến dịch</span>
          <button className="ep-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ep-modal__body">
          {fetching ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "#888",
              }}
            >
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              {/* Ảnh */}
              <div className="ec-images-label">
                Hình ảnh chiến dịch <span className="ep-required">*</span>
                <span className="ec-images-hint">
                  {" "}
                  (giữ lại {oldImages.length}, thêm mới {newFiles.length})
                </span>
              </div>
              <div className="ec-images-grid">
                {oldImages.map((url) => (
                  <div key={url} className="ec-image-tile">
                    <img src={url} alt="cover" />
                    <button
                      type="button"
                      className="ec-image-remove"
                      onClick={() => handleRemoveOldImage(url)}
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newPreviews.map((preview, idx) => (
                  <div
                    key={preview}
                    className="ec-image-tile ec-image-tile--new"
                  >
                    <img src={preview} alt="new" />
                    <button
                      type="button"
                      className="ec-image-remove"
                      onClick={() => handleRemoveNewImage(idx)}
                      title="Bỏ ảnh mới"
                    >
                      ✕
                    </button>
                    <span className="ec-image-badge">Mới</span>
                  </div>
                ))}
                <button
                  type="button"
                  className="ec-image-add"
                  onClick={() => fileRef.current?.click()}
                >
                  <span>+</span>
                  <small>Thêm ảnh</small>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  multiple
                  style={{ display: "none" }}
                  onChange={handleAddImages}
                />
              </div>

              <div className="ep-divider" />

              <div className="ep-field">
                <label>
                  Tên chiến dịch <span className="ep-required">*</span>
                </label>
                <input
                  className="ep-input ep-input--text"
                  name="ten_chien_dich"
                  value={form.ten_chien_dich}
                  onChange={handleChange}
                  placeholder="Vd: Chung tay cứu trợ vùng lũ"
                  maxLength={255}
                />
              </div>

              <div className="ep-field">
                <label>
                  Danh mục <span className="ep-required">*</span>
                </label>
                <select
                  className="ep-input ep-input--text"
                  name="danh_muc_id"
                  value={form.danh_muc_id}
                  onChange={handleChange}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.ten_danh_muc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ep-field">
                <label>
                  Mô tả chiến dịch <span className="ep-required">*</span>
                </label>
                <textarea
                  className="ep-input ep-input--textarea"
                  name="mo_ta"
                  value={form.mo_ta}
                  onChange={handleChange}
                  placeholder="Mô tả chi tiết mục đích, đối tượng được hỗ trợ, cách sử dụng quỹ..."
                  rows={4}
                />
              </div>

              <div className="ep-grid-2">
                <div className="ep-field">
                  <label>
                    Mục tiêu tiền (đ) <span className="ep-required">*</span>
                  </label>
                  <input
                    className="ep-input ep-input--text"
                    name="muc_tieu_tien"
                    value={
                      form.muc_tieu_tien
                        ? Number(
                            String(form.muc_tieu_tien).replace(/\D/g, ""),
                          ).toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        muc_tieu_tien: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="500.000.000"
                  />
                </div>
                <div className="ep-field">
                  <label>
                    Ngày kết thúc <span className="ep-required">*</span>
                  </label>
                  <input
                    className="ep-input ep-input--text"
                    type="date"
                    name="ngay_ket_thuc"
                    value={form.ngay_ket_thuc}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ep-field">
                <label>
                  Vị trí <span className="ep-required">*</span>
                </label>
                <LocationPicker
                  value={{ address: form.vi_tri, lat: form.lat, lng: form.lng }}
                  onChange={({ address, lat, lng }) =>
                    setForm((p) => ({ ...p, vi_tri: address, lat, lng }))
                  }
                />
                {form.lat && form.lng && (
                  <div className="ec-coords-hint">
                    Đã chọn: {Number(form.lat).toFixed(5)},{" "}
                    {Number(form.lng).toFixed(5)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="ep-modal__footer">
          <button
            className="ep-footer-btn ep-footer-btn--cancel"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="ep-footer-btn"
            style={{ background: "#2db872", color: "#fff" }}
            onClick={handleSubmit}
            disabled={loadingUpdate || fetching}
          >
            {loadingUpdate ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Modal: Hoạt động chi quỹ ===================== */
function ExpenseActivityModal({ campaign, toChuc, onClose, onSuccess }) {
  const {
    fetchWithdrawTransactions,
    fetchWithdrawWithExpenses,
    handleCreateExpense,
    loadingExpense,
  } = useCampaigns();

  const [withdrawList, setWithdrawList] = useState([]);
  const [expenseMap, setExpenseMap] = useState({}); // giao_dich_id → { mo_ta, chi_tieu[] }
  const [fetching, setFetching] = useState(true);
  const [selectedId, setSelectedId] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [items, setItems] = useState([
    { ten: "", so_tien: "" },
    { ten: "", so_tien: "" },
  ]);

  // Lấy danh sách giao dịch RÚT + chi tiêu đã khai báo
  useEffect(() => {
    (async () => {
      // Gọi cả 2 API song song
      const [txRes, expRes] = await Promise.all([
        fetchWithdrawTransactions(campaign.id),
        fetchWithdrawWithExpenses(campaign.id),
      ]);

      if (!txRes.ok) {
        notification.error({
          message: "Không tải được danh sách giao dịch rút",
          description: txRes.err?.response?.data?.message || txRes.err?.message,
          placement: "topRight",
        });
      }

      const list = txRes.data || [];
      setWithdrawList(list);

      // Build expenseMap: { giao_dich_id → { mo_ta, chi_tieu[] } }
      const map = {};
      (expRes.data || []).forEach((gd) => {
        map[String(gd.giao_dich_id)] = {
          mo_ta: gd.mo_ta || "",
          chi_tieu: Array.isArray(gd.chi_tieu) ? gd.chi_tieu : [],
        };
      });
      setExpenseMap(map);

      // Auto-select giao dịch đầu tiên + load chi tiêu
      if (list.length > 0) {
        const firstId = String(list[0].id);
        setSelectedId(firstId);
        loadExpenseForId(firstId, map);
      }

      setFetching(false);
    })();
  }, [campaign.id]);

  // Load chi tiêu đã có vào form khi chọn giao dịch
  const loadExpenseForId = (id, map) => {
    const existing = (map || expenseMap)[String(id)];
    if (existing?.chi_tieu?.length > 0) {
      setGhiChu(existing.mo_ta || "");
      setItems(
        existing.chi_tieu.map((ct) => ({
          ten: ct.ten_hoat_dong || "",
          so_tien: String(ct.so_tien || ""),
          id: ct.chi_tieu_id, // giữ id nếu cần update sau này
        })),
      );
    } else {
      // Chưa có chi tiêu → reset về 2 ô trống
      setGhiChu("");
      setItems([
        { ten: "", so_tien: "" },
        { ten: "", so_tien: "" },
      ]);
    }
  };

  const selectedWithdraw = withdrawList.find(
    (w) => String(w.id) === selectedId,
  );
  const requiredAmount = Number(selectedWithdraw?.so_tien || 0);

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
  };
  const handleAddItem = () =>
    setItems((prev) => [...prev, { ten: "", so_tien: "" }]);
  const handleRemoveItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const tongChi = items.reduce(
    (sum, it) => sum + (Number(String(it.so_tien).replace(/\D/g, "")) || 0),
    0,
  );
  const diff = tongChi - requiredAmount;
  const isMatch = requiredAmount > 0 && diff === 0;

  const handleSubmit = async () => {
    if (!selectedId) {
      notification.warning({
        message: "Vui lòng chọn giao dịch rút!",
        placement: "topRight",
      });
      return;
    }
    const validItems = items
      .map((it) => ({
        ten_hoat_dong: it.ten.trim(),
        so_tien: Number(String(it.so_tien).replace(/\D/g, "")) || 0,
      }))
      .filter((it) => it.ten_hoat_dong && it.so_tien >= 1000);
    if (validItems.length === 0) {
      notification.warning({
        message: "Vui lòng nhập ít nhất 1 khoản chi (tối thiểu 1.000đ)!",
        placement: "topRight",
      });
      return;
    }
    const total = validItems.reduce((s, x) => s + x.so_tien, 0);
    if (total !== requiredAmount) {
      notification.warning({
        message: "Tổng chi phải bằng số tiền đã rút",
        description: `Đã nhập ${total.toLocaleString("vi-VN")}đ, cần ${requiredAmount.toLocaleString("vi-VN")}đ.`,
        placement: "topRight",
      });
      return;
    }

    const { ok, err } = await handleCreateExpense(campaign.id, {
      giao_dich_quy_id: Number(selectedId),
      mo_ta: ghiChu.trim() || null,
      chi_tiet: validItems,
    });
    if (ok) {
      notification.success({
        message: "Lưu hoạt động chi quỹ thành công!",
        placement: "topRight",
      });
      onSuccess?.();
      onClose();
    } else {
      const errors = err?.response?.data?.errors;
      const firstErr = errors ? Object.values(errors)[0]?.[0] : null;
      notification.error({
        message: "Lưu thất bại",
        description: firstErr || err?.response?.data?.message || err?.message,
        placement: "topRight",
      });
    }
  };

  return (
    <div
      className="ep-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ea-modal">
        <div className="ea-modal__header">
          <span>Hoạt động chi quỹ</span>
          <button className="ea-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ea-modal__body">
          <div className="ea-info">
            <div className="ea-info__label">QUỸ</div>
            <div className="ea-info__name">
              {toChuc?.ten_to_chuc || "Tổ chức"}
            </div>
            <div className="ea-info__label">CHIẾN DỊCH</div>
            <div className="ea-info__campaign">
              {campaign?.ten_chien_dich || "---"}
            </div>
          </div>

          {fetching ? (
            <div
              style={{ padding: "20px 0", textAlign: "center", color: "#888" }}
            >
              Đang tải danh sách giao dịch rút...
            </div>
          ) : withdrawList.length === 0 ? (
            <div className="ea-empty">
              <div style={{ fontSize: 32, marginBottom: 6 }}>💸</div>
              <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
                Chiến dịch chưa có giao dịch rút tiền nào.
              </p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                Bạn chỉ có thể khai báo chi tiêu sau khi rút tiền từ tài khoản
                gây quỹ.
              </p>
            </div>
          ) : (
            <>
              <div className="ea-field">
                <label>
                  Chọn giao dịch rút <span style={{ color: "#f44336" }}>*</span>
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    loadExpenseForId(e.target.value, null);
                  }}
                >
                  {withdrawList.map((w) => (
                    <option key={w.id} value={w.id}>
                      -{Number(w.so_tien).toLocaleString("vi-VN")}đ ·{" "}
                      {w.thoi_gian}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ea-required-box">
                <span>Số tiền cần khai báo</span>
                <strong>{requiredAmount.toLocaleString("vi-VN")} đ</strong>
              </div>

              <div className="ea-field">
                <label>Ghi chú chung</label>
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Vd: Chi phí cứu trợ đợt 2 tháng 4/2026"
                  maxLength={1000}
                />
              </div>

              <div className="ea-items-label">Các khoản chi tiết</div>
              {items.map((item, idx) => (
                <div key={idx} className="ea-item-row">
                  <input
                    type="text"
                    value={item.ten}
                    onChange={(e) =>
                      handleItemChange(idx, "ten", e.target.value)
                    }
                    placeholder="Tên khoản chi..."
                    maxLength={255}
                  />
                  <input
                    type="text"
                    className="ea-amount"
                    value={
                      item.so_tien
                        ? Number(
                            String(item.so_tien).replace(/\D/g, ""),
                          ).toLocaleString("vi-VN")
                        : ""
                    }
                    onChange={(e) =>
                      handleItemChange(
                        idx,
                        "so_tien",
                        e.target.value.replace(/\D/g, ""),
                      )
                    }
                    placeholder="Số tiền (đ)"
                  />
                  {items.length > 1 && (
                    <button
                      className="ea-item-remove"
                      onClick={() => handleRemoveItem(idx)}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                className="ea-add-item"
                onClick={handleAddItem}
                type="button"
              >
                <span>+</span> Thêm khoản
              </button>

              <div
                className={`ea-total ${isMatch ? "ea-total--match" : tongChi > 0 ? "ea-total--mismatch" : ""}`}
              >
                <span>Tổng chi</span>
                <strong>{tongChi.toLocaleString("vi-VN")} đ</strong>
              </div>
              {requiredAmount > 0 && diff !== 0 && tongChi > 0 && (
                <div className="ea-diff-hint">
                  {diff > 0
                    ? `Thừa ${diff.toLocaleString("vi-VN")}đ — vui lòng giảm bớt`
                    : `Còn thiếu ${Math.abs(diff).toLocaleString("vi-VN")}đ`}
                </div>
              )}
            </>
          )}
        </div>
        <div className="ea-modal__footer">
          <button className="ea-btn ea-btn--cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className="ea-btn ea-btn--save"
            onClick={handleSubmit}
            disabled={loadingExpense || fetching || withdrawList.length === 0}
          >
            {loadingExpense ? "Đang lưu..." : "Lưu hoạt động"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Edit Profile Modal (giữ nguyên) ===================== */
function EditProfileModal({
  user,
  profileUser,
  toChuc,
  avatarUrl,
  isOrganization,
  onUpdateProfile,
  onClose,
}) {
  const fileRef = useRef(null);
  const logoRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl || null);
  const [logoPreview, setLogoPreview] = useState(toChuc?.logo || null);
  const [form, setForm] = useState({
    ho_ten: profileUser?.ho_ten || user?.ho_ten || "",
    dia_chi_user: profileUser?.dia_chi || user?.dia_chi || "",
    so_dien_thoai: toChuc?.so_dien_thoai || "",
    email_to_chuc: toChuc?.email || "",
    dia_chi: toChuc?.dia_chi || "",
    mo_ta: toChuc?.mo_ta || "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("ho_ten", form.ho_ten);
    formData.append("dia_chi_user", form.dia_chi_user);
    if (fileRef.current?.files[0])
      formData.append("anh_dai_dien", fileRef.current.files[0]);
    if (isOrganization) {
      if (form.so_dien_thoai)
        formData.append("so_dien_thoai", form.so_dien_thoai);
      if (form.email_to_chuc) formData.append("email", form.email_to_chuc);
      if (form.dia_chi) formData.append("dia_chi", form.dia_chi);
      if (form.mo_ta) formData.append("mo_ta", form.mo_ta);
      if (logoRef.current?.files[0])
        formData.append("logo", logoRef.current.files[0]);
    }
    const { ok } = await onUpdateProfile(formData);
    setLoading(false);
    if (ok) {
      notification.success({
        message: "Lưu thay đổi thành công!",
        placement: "topRight",
      });
      onClose();
    } else {
      notification.error({
        message: "Lưu thất bại, thử lại!",
        placement: "topRight",
      });
    }
  };

  return (
    <div
      className="ep-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ep-modal">
        <div className="ep-modal__header">
          <span>Chỉnh sửa hồ sơ</span>
          <button className="ep-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ep-modal__body">
          <div className="ep-avatar-row">
            <div className="ep-avatar">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <span>{(form.ho_ten || "U")[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="ep-avatar-actions">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatar}
              />
              <button
                className="ep-btn-sm ep-btn-sm--green"
                onClick={() => fileRef.current?.click()}
              >
                Chọn ảnh
              </button>
              <button
                className="ep-btn-sm ep-btn-sm--red"
                onClick={() => setAvatarPreview(null)}
              >
                Xóa
              </button>
            </div>
            <div className="ep-locked-fields">
              <div className="ep-field">
                <label>Tên đăng nhập</label>
                <div className="ep-input ep-input--locked">
                  <span>
                    {profileUser?.ten_tai_khoan ||
                      user?.email?.split("@")[0] ||
                      "user"}
                  </span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
              <div className="ep-field">
                <label>Email</label>
                <div className="ep-input ep-input--locked">
                  <span>{profileUser?.email || user?.email || "---"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ep-divider" />
          <div className="ep-section-title">
            <span className="ep-section-title__bar" />
            THÔNG TIN CÁ NHÂN
          </div>
          <div className="ep-field">
            <label>
              Họ và tên <span className="ep-required">*</span>
            </label>
            <input
              className="ep-input ep-input--text"
              name="ho_ten"
              value={form.ho_ten}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="ep-field">
            <label>Địa chỉ</label>
            <input
              className="ep-input ep-input--text"
              name="dia_chi_user"
              value={form.dia_chi_user}
              onChange={handleChange}
              placeholder="123 Nguyễn Văn Linh, Đà Nẵng"
            />
          </div>

          {isOrganization && (
            <>
              <div className="ep-divider" />
              <div className="ep-section-title">
                <span className="ep-section-title__bar" />
                TỔ CHỨC
              </div>
              <div className="ep-avatar-row" style={{ marginBottom: 12 }}>
                <div className="ep-avatar">
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" />
                  ) : (
                    <span>
                      {(toChuc?.ten_to_chuc || "T")[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ep-avatar-actions">
                  <input
                    ref={logoRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogo}
                  />
                  <button
                    className="ep-btn-sm ep-btn-sm--green"
                    onClick={() => logoRef.current?.click()}
                    type="button"
                  >
                    Chọn logo
                  </button>
                  <button
                    className="ep-btn-sm ep-btn-sm--red"
                    onClick={() => {
                      setLogoPreview(null);
                      if (logoRef.current) logoRef.current.value = "";
                    }}
                    type="button"
                  >
                    Xóa
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 12,
                    color: "#888",
                    marginLeft: 16,
                  }}
                >
                  Logo tổ chức (jpg/png, tối đa 2MB)
                </div>
              </div>
              <div className="ep-field">
                <label>Tên tổ chức</label>
                <div className="ep-input ep-input--locked">
                  <span>{toChuc?.ten_to_chuc || "Tên tổ chức"}</span>
                  <span className="ep-lock-badge">khóa</span>
                </div>
              </div>
              <div className="ep-grid-2">
                <div className="ep-field">
                  <label>Số điện thoại</label>
                  <input
                    className="ep-input ep-input--text"
                    name="so_dien_thoai"
                    value={form.so_dien_thoai}
                    onChange={handleChange}
                    placeholder="0236 123 456"
                  />
                </div>
                <div className="ep-field">
                  <label>Địa chỉ tổ chức</label>
                  <input
                    className="ep-input ep-input--text"
                    name="dia_chi"
                    value={form.dia_chi}
                    onChange={handleChange}
                    placeholder="123 Nguyễn Văn Linh, ĐN"
                  />
                </div>
              </div>
              <div className="ep-field">
                <label>Email tổ chức</label>
                <input
                  className="ep-input ep-input--text"
                  name="email_to_chuc"
                  value={form.email_to_chuc}
                  onChange={handleChange}
                  placeholder="email@tochuc.com"
                />
              </div>
              <div className="ep-field">
                <label>Mô tả</label>
                <textarea
                  className="ep-input ep-input--textarea"
                  name="mo_ta"
                  value={form.mo_ta}
                  onChange={handleChange}
                  placeholder="Mô tả về tổ chức..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
        <div className="ep-modal__footer">
          <button
            className="ep-footer-btn ep-footer-btn--cancel"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="ep-footer-btn ep-footer-btn--save"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================== Change Password Modal (giữ nguyên) ===================== */
function ChangePasswordModal({ profileUser, onChangePassword, onClose }) {
  const isGoogleUser = !!profileUser?.google_id;
  const [form, setForm] = useState({ old: "", new: "", confirm: "" });
  const [show, setShow] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });

  const handleSubmit = async () => {
    if (!isGoogleUser && !form.old) {
      notification.warning({
        message: "Vui lòng điền đầy đủ!",
        placement: "topRight",
      });
      return;
    }
    if (!form.new || !form.confirm) {
      notification.warning({
        message: "Vui lòng điền đầy đủ!",
        placement: "topRight",
      });
      return;
    }
    if (form.new !== form.confirm) {
      notification.warning({
        message: "Mật khẩu mới không khớp!",
        placement: "topRight",
      });
      return;
    }
    if (form.new.length < 6) {
      notification.warning({
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
        placement: "topRight",
      });
      return;
    }
    setLoading(true);
    const payload = isGoogleUser
      ? { new_password: form.new, confirm_password: form.confirm }
      : {
          current_password: form.old,
          new_password: form.new,
          confirm_password: form.confirm,
        };
    const { ok, err } = await onChangePassword(payload);
    setLoading(false);
    if (ok) {
      notification.success({
        message: isGoogleUser
          ? "Tạo mật khẩu thành công!"
          : "Đổi mật khẩu thành công!",
        placement: "topRight",
      });
      onClose();
    } else {
      notification.error({
        message: err?.response?.data?.message || "Thất bại!",
        placement: "topRight",
      });
    }
  };

  const EyeIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  const themeColor = isGoogleUser ? "#f59e0b" : "#E24B4A";
  const themeBgLight = isGoogleUser ? "#fef3c7" : "#fff0f0";
  const fields = isGoogleUser
    ? [
        { label: "Mật khẩu mới", name: "new" },
        { label: "Xác nhận mật khẩu", name: "confirm" },
      ]
    : [
        { label: "Mật khẩu hiện tại", name: "old" },
        { label: "Mật khẩu mới", name: "new" },
        { label: "Xác nhận mật khẩu", name: "confirm" },
      ];

  return (
    <div
      className="ep-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ep-modal" style={{ maxWidth: 420 }}>
        <div className="ep-modal__header" style={{ background: themeColor }}>
          <span>{isGoogleUser ? "Tạo mật khẩu" : "Đổi mật khẩu"}</span>
          <button className="ep-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="ep-modal__body">
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: themeBgLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={themeColor}
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
              {isGoogleUser
                ? "Bạn đăng nhập bằng Google"
                : "Nhập mật khẩu cũ và mật khẩu mới để thay đổi"}
            </p>
          </div>
          {fields.map((f) => (
            <div key={f.name} className="ep-field" style={{ width: "100%" }}>
              <label>
                {f.label} <span className="ep-required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="ep-input ep-input--text"
                  type={show[f.name] ? "text" : "password"}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  autoComplete="new-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => toggleShow(f.name)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#aaa",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {show[f.name] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="ep-modal__footer">
          <button
            className="ep-footer-btn ep-footer-btn--cancel"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="ep-footer-btn"
            style={{ background: themeColor, color: "#fff" }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : isGoogleUser
                ? "Tạo mật khẩu"
                : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}
