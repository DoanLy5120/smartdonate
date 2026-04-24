import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "antd";
import { FiSearch, FiGift, FiPackage, FiPlus } from "react-icons/fi";
import { BsBagHeartFill } from "react-icons/bs";
import { FaPeopleCarry } from "react-icons/fa";
import { MdFeed } from "react-icons/md";
import Header from "../../../components/Header/index";
import Menu from "../../../components/Menu/index.jsx"
import PostCard from "../../../components/PostCard/index.jsx";
import AddressPromptModal from "../../../components/AddressPromptModal/index.jsx";
import { shouldShowAddressPrompt } from "../../../components/AddressPromptModal/addressPromptUtils.js";
import usePosts from "../../../hooks/usePosts";
import usePostStore from "../../../store/postStore";
import useChatStore from "../../../store/chatStore";
import useAuthStore from "../../../store/authStore";
import "./NewsFeed.scss";

export default function NewsFeed() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("cho");
  const [search, setSearch] = useState("");
  const user = useAuthStore((s) => s.user);
  const [showAddressModal, setShowAddressModal] = useState(
    () => !!(user?.id && shouldShowAddressPrompt(user.id)),
  );

  const fetchMatches = usePostStore((s) => s.fetchMatches);
  const matchesMap = usePostStore((s) => s.matches);
  const fetchSearch = usePostStore((s) => s.fetchSearch);
  const myUserId = useAuthStore((s) => Number(s.user?.id || 0));
  const isLoggedIn = !!user;

  const communityStats = usePostStore((s) => s.communityStats);
  const fetchCommunityStats = usePostStore((s) => s.fetchCommunityStats);

  const chats = useChatStore((s) => s.chats);
  const totalUnread = useChatStore((s) => s.totalUnread);

  const params = useMemo(
    () => ({
      loai_bai: tab.toUpperCase(),
      keyword: search || undefined,
    }),
    [tab, search],
  );

  const { posts, loading, hasMore, loadMore } = usePosts(params);

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    if (!posts.length) return;
    posts.forEach((p) => {
      // Chỉ fetch matches cho bài của chính mình
      if (p.nguoi_dung_id === myUserId) {
        fetchMatches(p.id);
      }
    });
  }, [posts]);

  const mappedPosts = posts.map((p) => {
    return {
      id: p.id,
      type: p.loai_bai?.toLowerCase(),
      user: {
        id: p.nguoi_dung_id,
        name: p.nguoi_dung_ten,
        avatar: p.nguoi_dung_ten?.charAt(0) || "?",
        color: "#1890ff",
      },
      location: p.dia_diem,
      time: new Date(p.created_at).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      likeCount: p.so_luot_thich || 0,
      commentCount: p.so_binh_luan || 0,
      title: p.tieu_de,
      desc: p.mo_ta,
      so_luong: p.so_luong,
      images: p.hinh_anh_urls?.length
        ? p.hinh_anh_urls
        : p.hinh_anh_url
          ? [p.hinh_anh_url]
          : [],
      trang_thai: p.trang_thai,

      // Chỉ truyền matches nếu là bài của mình
      aiSuggestions:
        p.nguoi_dung_id === myUserId
          ? (matchesMap[p.id] || []).map((m) => ({
              id: m.post?.id,
              title: m.post?.tieu_de,
              location: m.post?.dia_diem || "Không rõ",
              matchScore: Math.round(m.match_percent),
              icon: "🤝",
              type: "match", // phân biệt
            }))
          : [],
    };
  });

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadMore]);

  const handleOpenChat = (conv) => {
    navigate(`/chat?cid=${conv.cuoc_tro_chuyen_id}`);
  };

  return (
    <>
    <Header />
    <Menu />
      {showAddressModal && (
        <AddressPromptModal
          userId={user.id}
          onClose={() => setShowAddressModal(false)}
        />
      )}
      <div className="nf-page">
        <div className="nf-layout">
          {/* ── Feed ── */}
          <div className="nf-feed-col">
            <div className="nf-feed">
              <div className="nf-toolbar">
                <div className="nf-toolbar__tabs">
                  <button
                    className={`nf-toolbar__tab nf-toolbar__tab--cho${tab === "cho" ? " active" : ""}`}
                    onClick={() => setTab("cho")}
                  >
                    <FiGift size={15} /> CHO ĐỒ
                  </button>
                  <button
                    className={`nf-toolbar__tab nf-toolbar__tab--nhan${tab === "nhan" ? " active" : ""}`}
                    onClick={() => setTab("nhan")}
                  >
                    <FiPackage size={15} /> NHẬN ĐỒ
                  </button>
                </div>
                <Input
                  className="nf-toolbar__search"
                  placeholder="Tìm kiếm vật dụng..."
                  prefix={<FiSearch size={15} />}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (e.target.value.trim().length >= 2) {
                      fetchSearch({
                        keyword: e.target.value.trim(),
                        loai_bai: tab.toUpperCase(),
                      });
                    }
                  }}
                  allowClear
                />
                <button
                  className="nf-toolbar__post-btn"
                  onClick={() => navigate("/bang-tin/tao-moi")}
                >
                  <FiPlus size={20} /> Đăng
                </button>
              </div>

              <div className="nf-posts">
                {mappedPosts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentTab={tab}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="nf-sidebar">
            {/* Chat Panel — chỉ hiện khi đã đăng nhập */}
            {isLoggedIn && (
              <div className="nf-chat-panel">
                <div className="nf-chat-panel__header">
                  <div className="nf-chat-panel__header-left">
                    <span className="nf-chat-panel__title">TRÒ CHUYỆN</span>
                    {totalUnread > 0 && (
                      <span className="nf-chat-panel__badge">
                        {totalUnread}
                      </span>
                    )}
                  </div>
                </div>

                <div className="nf-chat-list">
                  {chats.length === 0 ? (
                    <div className="nf-chat-empty">
                      Chưa có cuộc trò chuyện nào
                    </div>
                  ) : (
                    chats.map((conv) => {
                      const hasUnread = (conv.unread_count || 0) > 0;
                      const lastMsg = conv.tin_nhan_cuoi;
                      const otherUser = conv.nguoi_kia;

                      let preview = "Chưa có tin nhắn";
                      if (lastMsg) {
                        if (lastMsg.loai_tin === "ANH") preview = "[Ảnh]";
                        else if (lastMsg.loai_tin === "VIDEO")
                          preview = "[Video]";
                        else
                          preview =
                            lastMsg.noi_dung ||
                            lastMsg.preview ||
                            "Chưa có tin nhắn";
                      }

                      if (
                        lastMsg &&
                        Number(lastMsg.nguoi_gui_id) === myUserId
                      ) {
                        preview = `Bạn: ${preview}`;
                      }

                      const timeStr = lastMsg?.created_at
                        ? new Date(lastMsg.created_at).toLocaleTimeString(
                            "vi-VN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "";

                      return (
                        <div
                          key={conv.cuoc_tro_chuyen_id}
                          className="nf-chat-item"
                          onClick={() => handleOpenChat(conv)}
                          style={{ cursor: "pointer" }}
                        >
                          <div
                            className="nf-chat-item__avatar"
                            style={{ background: "#1890ff" }}
                          >
                            {otherUser?.ho_ten?.charAt(0) || "?"}
                          </div>

                          <div className="nf-chat-item__info">
                            <div className="nf-chat-item__name">
                              {otherUser?.ho_ten || "Người dùng"}
                            </div>
                            <div
                              className={`nf-chat-item__msg${hasUnread ? " unread" : ""}`}
                              style={
                                hasUnread
                                  ? { fontWeight: 700, color: "#111" }
                                  : {}
                              }
                            >
                              {preview}
                            </div>
                          </div>

                          <div className="nf-chat-item__right">
                            <span className="nf-chat-item__time">
                              {timeStr}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Community stats */}
            <div className="nf-community-box">
              <div className="nf-community-box__header">TÁC ĐỘNG CỘNG ĐỒNG</div>
              <div className="nf-community-stats">
                {communityStats ? (
                  <>
                    <div className="nf-community-stat">
                      <span className="nf-community-stat__icon">
                        <BsBagHeartFill size={20} color="#ff4d4f" />
                      </span>
                      <span className="nf-community-stat__text">
                        <strong>{communityStats.tong_do_da_tang ?? 0}</strong>{" "}
                        đồ dùng đã được tặng
                      </span>
                    </div>
                    <div className="nf-community-stat">
                      <span className="nf-community-stat__icon">
                        <FaPeopleCarry size={20} color="#fa8c16" />
                      </span>
                      <span className="nf-community-stat__text">
                        <strong>
                          {communityStats.so_nguoi_duoc_tang ?? 0}
                        </strong>{" "}
                        người đã nhận hỗ trợ
                      </span>
                    </div>
                    <div className="nf-community-stat">
                      <span className="nf-community-stat__icon">
                        <MdFeed size={20} color="#52c41a" />
                      </span>
                      <span className="nf-community-stat__text">
                        <strong>{communityStats.so_bai_trong_tuan ?? 0}</strong>{" "}
                        bài đăng tuần này
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    style={{ color: "#aaa", fontSize: 13, padding: "8px 0" }}
                  >
                    Đang tải...
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
