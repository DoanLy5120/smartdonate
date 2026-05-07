import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiMessageSquare, FiArrowRight } from "react-icons/fi";
import Header from "../../../components/Header/index";
import useUserProfileStore from "../../../store/userProfileStore";
import PostCard from "../../../components/PostCard";
import useAuthStore from "../../../store/authStore";
import useChatStore from "../../../store/chatStore";
import "./UserProfile.scss";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const openChatWith = useChatStore((s) => s.openChatWith);

  const { profiles, posts, loading, loadingPosts, fetchUserProfile } =
    useUserProfileStore();

  const sid = String(id);
  const profileData = profiles[sid] || null;
  const userPosts = posts[sid] || [];
  const isLoading = loading[sid] || false;
  const isLoadingPosts = loadingPosts[sid] || false;

  useEffect(() => {
    if (currentUser?.id && String(currentUser.id) === String(id)) {
      navigate("/profile", { replace: true });
      return;
    }
    if (!id) return;
    fetchUserProfile(id);
  }, [id, currentUser]);

  const handleChat = async () => {
    if (!currentUser) {
      navigate("/dang-nhap");
      return;
    }
    const u = profileData?.nguoi_dung;
    if (!u) return;
    // Signature giống PostCard: openChatWith(receiverId, info) → return chatId
    const receiverId = Number(id);
    const info = {
      id: receiverId,
      ho_ten: u.ho_ten,
      avatar_url: profileData?.to_chuc?.logo || u.anh_dai_dien || null,
    };
    const chatId = await openChatWith(receiverId, info);
    if (chatId) {
      navigate(`/chat?cid=${chatId}`);
    } else {
      navigate("/chat");
    }
  };

  const handleViewOrg = () => {
    const orgId = profileData?.to_chuc?.id;
    if (orgId) navigate(`/chien-dich/to-chuc/chi-tiet/${orgId}`);
  };

  if (isLoading) {
    return (
      <div className="up-loading">
        <div className="up-loading__spinner" />
        <span>Đang tải...</span>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="up-empty">
        <div className="up-empty__icon">👤</div>
        <p>Không tìm thấy người dùng</p>
      </div>
    );
  }

  const nguoiDung = profileData.nguoi_dung;
  const toChuc = profileData.to_chuc;
  const isOrg = !!toChuc;
  const displayName = nguoiDung?.ho_ten || `Người dùng #${id}`;
  const username = nguoiDung?.ten_tai_khoan || `user${id}`;
  const avatarUrl = nguoiDung?.anh_dai_dien || null;
  const orgName = toChuc?.ten_to_chuc || "Tổ chức";
  const loaiHinhLabel =
    toChuc?.loai_hinh === "QUY_TU_THIEN"
      ? "Quỹ từ thiện"
      : toChuc?.loai_hinh === "DOANH_NGHIEP"
        ? "Doanh nghiệp"
        : toChuc?.loai_hinh === "TO_CHUC_NHA_NUOC"
          ? "Tổ chức nhà nước"
          : "Tổ chức";

  return (
    <>
      <Header />
      <div className="up-page">
        <div className="up-card">
          {/* Top */}
          <div className="up-top">
            <div className="up-top__left">
              <div className={`up-avatar${isOrg ? " up-avatar--org" : ""}`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} />
                ) : (
                  <span>{displayName[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="up-info">
                <div className="up-info__name">
                  {displayName}
                  {isOrg && (
                    <span className="up-badge up-badge--org">🏢 Tổ chức</span>
                  )}
                </div>
                <div className="up-info__sub">@{username}</div>
              </div>
            </div>

            <div className="up-top__actions">
              <div className="up-top-stats">
                <div className="up-top-stats__item">
                  <strong>{userPosts.length}</strong>
                  <span>Bài đăng</span>
                </div>
              </div>
              <button className="up-btn up-btn--msg" onClick={handleChat}>
                <FiMessageSquare size={14} /> Nhắn tin
              </button>
            </div>
          </div>

          {/* Bio — chỉ tổ chức */}
          {isOrg && toChuc?.mo_ta && (
            <div className="up-bio">{toChuc.mo_ta}</div>
          )}

          {/* Org strip | Impact card */}
          {isOrg ? (
            <div className="up-org-strip">
              <div className="up-org-strip__logo">
                {toChuc?.logo ? <img src={toChuc.logo} alt="" /> : "🏢"}
              </div>
              <div className="up-org-strip__info">
                <div className="up-org-strip__role">Chủ tổ chức</div>
                <div className="up-org-strip__name">{orgName}</div>
                <div className="up-org-strip__meta">
                  {loaiHinhLabel} · Đã xác minh ✓
                </div>
              </div>
              {toChuc?.id && (
                <button className="up-btn up-btn--org" onClick={handleViewOrg}>
                  Xem tổ chức <FiArrowRight size={12} />
                </button>
              )}
            </div>
          ) : (
            <div className="up-impact">
              <div className="up-impact__icon">💚</div>
              <div className="up-impact__body">
                <div className="up-impact__title">Tổng tác động cộng đồng</div>
                <div className="up-impact__sub">
                  Qua ủng hộ + bài đăng cho/nhận
                </div>
              </div>
              <div className="up-impact__num">{userPosts.length}</div>
            </div>
          )}

          {/* Bài đăng */}
          <div className="up-posts">
            <div className="up-posts__header">
              <span>📋</span> Bài đăng gần đây
            </div>
            {isLoadingPosts ? (
              <div className="up-posts__loading">Đang tải bài đăng...</div>
            ) : userPosts.length === 0 ? (
              <div className="up-posts__empty">
                <div>📝</div>
                <p>Chưa có bài đăng nào</p>
              </div>
            ) : (
              userPosts.map((item) => (
                <PostCard
                  key={item.id}
                  post={{
                    id: item.id,
                    nguoi_dung_id: nguoiDung?.id,
                    loai_bai: item.loai_bai,
                    user: {
                      id: nguoiDung?.id,
                      name: item.nguoi_dung_ten,
                      avatar: item.nguoi_dung_ten?.[0]?.toUpperCase(),
                      anh_dai_dien: avatarUrl ?? null,
                      color: "rgb(24, 144, 255)",
                    },
                    title: item.tieu_de,
                    desc: item.mo_ta,
                    likeCount: item.so_luot_thich || 0,
                    liked: item.da_thich ?? false,
                    commentCount: item.so_binh_luan || 0,
                    location: item.dia_diem,
                    time: item.ngay_dang,
                    images: item.hinh_anh_urls?.length
                      ? item.hinh_anh_urls
                      : item.hinh_anh_url
                        ? [item.hinh_anh_url]
                        : [],
                    so_luong: item.so_luong,
                    trang_thai: item.trang_thai,
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}