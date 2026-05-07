import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pagination } from "antd";
import {
  FiX,
  FiClock,
  FiTrendingUp,
  FiStar,
  FiSliders,
  FiChevronDown,
  FiUser,
  FiFileText,
  FiHeart,
  FiMapPin,
} from "react-icons/fi";
import { FaGift, FaInbox } from "react-icons/fa";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import PostCard from "../../../components/PostCard/index.jsx";
import useCampaignStore from "../../../store/campaignStore.js";
import useCategoryStore from "../../../store/categoryStore.js";
import usePostStore from "../../../store/postStore.js";
import "./Search.scss";

const TABS = [
  { key: "campaigns", label: "Chiến dịch", icon: <FiHeart size={15} /> },
  { key: "posts", label: "Bài viết", icon: <FiFileText size={15} /> },
  { key: "users", label: "Người dùng", icon: <FiUser size={15} /> },
];

const STATUS_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: "HOAT_DONG", label: "Đang hoạt động" },
  { value: "HOAN_THANH", label: "Hoàn thành" },
  { value: "TAM_DUNG", label: "Tạm dừng" },
  { value: "DA_KET_THUC", label: "Đã kết thúc" },
];

const PAGE_SIZE = 8;

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";

  const { campaigns, pagination, loading, fetchCampaigns } = useCampaignStore();
  const { fetchSearch, fetchSearchUsers, searchLoading } = usePostStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [activeTab, setActiveTab] = useState("campaigns");
  const [categoryId, setCategoryId] = useState(null);
  const [trangThai, setTrangThai] = useState(null);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [postType, setPostType] = useState("CHO");
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Campaigns
  useEffect(() => {
    if (activeTab !== "campaigns") return;
    fetchCampaigns({
      page,
      keyword: keyword || undefined,
      danh_muc_id: categoryId || undefined,
      trang_thai: trangThai || undefined,
    });
  }, [page, keyword, categoryId, trangThai, activeTab]);

  useEffect(() => {
    if (activeTab !== "posts") return;
    let cancelled = false;
    (async () => {
      setLoadingPosts(true);
      try {
        const raw = await fetchSearch({
          q: keyword,
          type: "post",
          loai_bai: postType,
        });
        const mapped = (raw || []).map((p) => ({
          ...p,
          title: p.tieu_de,
          desc: p.mo_ta,
          location: p.dia_diem,
          time: p.created_at,
          user: {
            id: p.nguoi_dung?.id,
            name: p.nguoi_dung?.ho_ten ?? "Người dùng",
            avatar: p.nguoi_dung?.ho_ten?.charAt(0)?.toUpperCase() ?? "?",
            avatar_url: p.nguoi_dung?.avatar_url ?? null,
            color: "#1890ff",
          },
          images: p.hinh_anh_urls || [],
          liked: p.da_thich ?? false,
        }));
        if (!cancelled) setPosts(mapped);
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, keyword, postType]);

  useEffect(() => {
    if (activeTab !== "users") return;
    let cancelled = false;
    (async () => {
      setLoadingUsers(true);
      try {
        const data = await fetchSearchUsers({ q: keyword });
        if (!cancelled) setUsers(data);
      } finally {
        if (!cancelled) setLoadingUsers(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, keyword]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPage(1);
    setCategoryId(null);
    setTrangThai(null);
    setShowFilter(false);
  }

  function clearAll() {
    setCategoryId(null);
    setTrangThai(null);
    setPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("keyword");
      return next;
    });
  }

  const activeFilters = [
    keyword && {
      key: "q",
      label: `"${keyword}"`,
      clear: () => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.delete("keyword");
          return next;
        });
        setPage(1);
      },
    },
    categoryId && {
      key: "cat",
      label: categories.find((c) => c.id === categoryId)?.ten_danh_muc,
      clear: () => {
        setCategoryId(null);
        setPage(1);
      },
    },
    trangThai && {
      key: "trang_thai",
      label: STATUS_OPTIONS.find((s) => s.value === trangThai)?.label,
      clear: () => {
        setTrangThai(null);
        setPage(1);
      },
    },
  ].filter(Boolean);

  const isLoadingCurrent = activeTab === "campaigns" ? loading : loadingUsers;

  return (
    <>
      <Header />
      <div className="sp-page">
        {/* ── Tabs ── */}
        <div className="sp-tabs">
          <div className="sp-tabs__inner">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`sp-tabs__btn${activeTab === tab.key ? " active" : ""}`}
                onClick={() => handleTabChange(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.key && (
                  <span className="sp-tabs__indicator" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="sp-main">
          {/* ── Toolbar — campaigns only ── */}
          {activeTab === "campaigns" && (
            <>
              <div className="sp-toolbar">
                <div className="sp-toolbar__left">
                  <span className="sp-toolbar__count">
                    <span className="sp-toolbar__dot" />
                    <strong>{pagination?.total ?? 0}</strong> chiến dịch
                  </span>
                  {activeFilters.length > 0 && (
                    <div className="sp-toolbar__tags">
                      {activeFilters.map((f) => (
                        <span key={f.key} className="sp-toolbar__tag">
                          {f.label}
                          <button onClick={f.clear}>
                            <FiX size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sp-toolbar__right">
                  <button
                    className={`sp-toolbar__filter-btn${showFilter ? " active" : ""}`}
                    onClick={() => setShowFilter((v) => !v)}
                  >
                    <FiSliders size={14} />
                    <span>Lọc</span>
                    {activeFilters.length > 0 && (
                      <span className="sp-toolbar__badge">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>
                  <div className="sp-sort">
                    <select
                      value={trangThai ?? ""}
                      onChange={(e) => {
                        setTrangThai(e.target.value || null);
                        setPage(1);
                      }}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value ?? "all"} value={o.value ?? ""}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown size={13} />
                  </div>
                </div>
              </div>

              {showFilter && (
                <div className="sp-filter">
                  <div className="sp-filter__label">Danh mục</div>
                  <div className="sp-filter__pills">
                    <button
                      className={`sp-filter__pill${!categoryId ? " active" : ""}`}
                      onClick={() => {
                        setCategoryId(null);
                        setPage(1);
                      }}
                    >
                      Tất cả
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`sp-filter__pill${categoryId === cat.id ? " active" : ""}`}
                        onClick={() => {
                          setCategoryId(cat.id);
                          setPage(1);
                        }}
                      >
                        {cat.ten_danh_muc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Content ── */}
          {isLoadingCurrent ? (
            <div
              className={`sp-skeleton-grid${activeTab === "users" ? " sp-skeleton-grid--users" : ""}`}
            >
              {Array.from({ length: activeTab === "users" ? 6 : 8 }).map(
                (_, i) => (
                  <div
                    key={i}
                    className={`sp-skeleton sp-skeleton--${activeTab === "users" ? "user" : "card"}`}
                  />
                ),
              )}
            </div>
          ) : (
            <>
              {activeTab === "campaigns" &&
                (campaigns.length > 0 ? (
                  <>
                    <div className="sp-grid">
                      {campaigns.map((c, i) => (
                        <div
                          key={c.id}
                          className="sp-grid__item"
                          style={{ animationDelay: `${i * 0.06}s` }}
                        >
                          <CampaignCard campaign={c} index={i} />
                        </div>
                      ))}
                    </div>
                    {pagination?.total > PAGE_SIZE && (
                      <div className="sp-pagination">
                        <Pagination
                          current={page}
                          pageSize={PAGE_SIZE}
                          total={pagination.total}
                          onChange={(p) => {
                            setPage(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          showSizeChanger={false}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <EmptyState keyword={keyword} onClear={clearAll} />
                ))}

              {activeTab === "posts" && (
                <div className="sp-posts-layout">
                  {/* ── Sidebar ── */}
                  <div className="sp-posts-sidebar">
                    <div className="sp-posts-sidebar__title">Loại bài</div>

                    <button
                      className={`sp-posts-sidebar__btn${postType === "CHO" ? " active" : ""}`}
                      onClick={() => setPostType("CHO")}
                    >
                      <span className="sp-posts-sidebar__icon">
                        <FaGift size={14} />
                      </span>
                      <span className="sp-posts-sidebar__label">Cho tặng</span>
                      {postType === "CHO" && (
                        <span className="sp-posts-sidebar__count">
                          {posts.length}
                        </span>
                      )}
                    </button>

                    <div className="sp-posts-sidebar__sep" />

                    <button
                      className={`sp-posts-sidebar__btn${postType === "NHAN" ? " active" : ""}`}
                      onClick={() => setPostType("NHAN")}
                    >
                      <span className="sp-posts-sidebar__icon">
                        <FaInbox size={14} />
                      </span>
                      <span className="sp-posts-sidebar__label">Cần nhận</span>
                      {postType === "NHAN" && (
                        <span className="sp-posts-sidebar__count">
                          {posts.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* ── Content ── */}
                  <div className="sp-posts-content">
                    {loadingPosts ? (
                      <div className="sp-skeleton-grid">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="sp-skeleton sp-skeleton--card"
                          />
                        ))}
                      </div>
                    ) : posts.length > 0 ? (
                      <div className="sp-posts">
                        {posts.map((p, i) => (
                          <div
                            key={p.id}
                            className="sp-posts__item"
                            style={{ animationDelay: `${i * 0.06}s` }}
                          >
                            <PostCard post={p} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState keyword={keyword} label="bài viết" />
                    )}
                  </div>
                </div>
              )}

              {activeTab === "users" &&
                (users.length > 0 ? (
                  <div className="sp-users">
                    {users.map((u, i) => (
                      <div
                        key={u.id}
                        className="sp-users__card"
                        style={{ animationDelay: `${i * 0.05}s` }}
                        onClick={() => navigate(`/bang-tin/nguoi-dung/${u.id}`)}
                      >
                        <div className="sp-users__avatar">
                          {u.anh_dai_dien ? (
                            <img src={u.anh_dai_dien} alt={u.ho_ten} />
                          ) : (
                            <span>{u.ho_ten?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="sp-users__info">
                          <div className="sp-users__name">{u.ho_ten}</div>
                          <div className="sp-users__desc">
                            <div className="sp-users__username">
                              @{u.ten_tai_khoan}
                            </div>
                            {u.dia_chi && (
                              <div className="sp-users__meta">
                                <FiMapPin size={11} />
                                {u.dia_chi}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`sp-users__status sp-users__status--${u.trang_thai === "HOAT_DONG" ? "active" : "inactive"}`}
                        >
                          <span className="sp-users__status-dot" />
                          {u.trang_thai === "HOAT_DONG"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState keyword={keyword} label="người dùng" />
                ))}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

function EmptyState({ keyword, label = "kết quả", onClear }) {
  return (
    <div className="sp-empty">
      <div className="sp-empty__icon">🔍</div>
      <div className="sp-empty__title">Không tìm thấy {label}</div>
      <div className="sp-empty__sub">
        {keyword
          ? `Không có ${label} nào khớp với "${keyword}"`
          : `Chưa có ${label} nào`}
      </div>
      {onClear && (
        <button className="sp-empty__btn" onClick={onClear}>
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
