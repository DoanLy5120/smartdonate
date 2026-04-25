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
} from "react-icons/fi";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import PostCard from "../../../components/PostCard/index.jsx";
import useCampaignStore from "../../../store/campaignStore.js";
import useCategoryStore from "../../../store/categoryStore.js";
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

// ── Mock data (thay bằng API thật sau) ───────────────────────────────
const MOCK_POSTS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Bài viết số ${i + 1}`,
  content: "Nội dung bài viết...",
  created_at: new Date().toISOString(),
}));

const MOCK_USERS = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  ho_ten: `Người dùng ${i + 1}`,
  avatar: null,
  email: `user${i + 1}@example.com`,
  chien_dich_count: Math.floor(Math.random() * 10),
}));

// ── Async mock fetchers ───────────────────────────────────────────────
async function fetchMockPosts(keyword) {
  await new Promise((r) => setTimeout(r, 400));
  return keyword
    ? MOCK_POSTS.filter((p) => p.title.includes(keyword))
    : MOCK_POSTS;
}

async function fetchMockUsers(keyword) {
  await new Promise((r) => setTimeout(r, 400));
  return keyword
    ? MOCK_USERS.filter((u) => u.ho_ten.includes(keyword))
    : MOCK_USERS;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";

  const { campaigns, pagination, loading, fetchCampaigns } = useCampaignStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [activeTab, setActiveTab] = useState("campaigns");
  const [categoryId, setCategoryId] = useState(null);
  const [trangThai, setTrangThai] = useState(null);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

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
        const data = await fetchMockPosts(keyword);
        if (!cancelled) setPosts(data);
      } finally {
        if (!cancelled) setLoadingPosts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab, keyword]);

  useEffect(() => {
    if (activeTab !== "users") return;
    let cancelled = false;
    (async () => {
      setLoadingUsers(true);
      try {
        const data = await fetchMockUsers(keyword);
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

  const isLoadingCurrent =
    activeTab === "campaigns"
      ? loading
      : activeTab === "posts"
        ? loadingPosts
        : loadingUsers;

  return (
    <>
      <Header />
      <div className="sp-page">
        {/* ── Hero search header ── */}
        {keyword && (
          <div className="sp-hero">
            <div className="sp-hero__inner">
              <p className="sp-hero__label">Kết quả tìm kiếm</p>
              <h1 className="sp-hero__keyword">"{keyword}"</h1>
            </div>
          </div>
        )}

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
                      <button className="sp-toolbar__clear" onClick={clearAll}>
                        Xóa tất cả
                      </button>
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

              {activeTab === "posts" &&
                (posts.length > 0 ? (
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
                ))}

              {activeTab === "users" &&
                (users.length > 0 ? (
                  <div className="sp-users">
                    {users.map((u, i) => (
                      <div
                        key={u.id}
                        className="sp-users__card"
                        style={{ animationDelay: `${i * 0.05}s` }}
                        onClick={() => navigate(`/nguoi-dung/${u.id}`)}
                      >
                        <div className="sp-users__avatar">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.ho_ten} />
                          ) : (
                            <span>{u.ho_ten?.[0]?.toUpperCase()}</span>
                          )}
                        </div>
                        <div className="sp-users__info">
                          <div className="sp-users__name">{u.ho_ten}</div>
                          <div className="sp-users__meta">{u.email}</div>
                        </div>
                        <div className="sp-users__stat">
                          <span className="sp-users__stat-num">
                            {u.chien_dich_count}
                          </span>
                          <span className="sp-users__stat-label">
                            chiến dịch
                          </span>
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
