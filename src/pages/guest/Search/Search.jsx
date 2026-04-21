import { useState, useMemo} from "react";
import { Input, Select, Pagination, Empty } from "antd";
import {
  FiSearch, FiFilter, FiX, FiClock,
  FiTrendingUp, FiStar, FiMapPin,
  FiSliders, FiChevronDown,
} from "react-icons/fi";
import { RiSparklingLine } from "react-icons/ri";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import "./Search.scss";

const { Option } = Select;

// ── Mock data ──────────────────────────────────────────────────────────
const ALL_CAMPAIGNS = [
  { id: 1,  title: "Giảm thiệt hại thiên tai miền Trung",    daysLeft: 3,  raised: 750000000,  goal: 1000000000, image: null, category: "Thiên tai",  location: "Đà Nẵng" },
  { id: 2,  title: "Xây trường cho trẻ em vùng cao",          daysLeft: 4,  raised: 350000000,  goal: 1000000000, image: null, category: "Giáo dục",   location: "Hà Giang" },
  { id: 3,  title: "Hội người khuyết tật Đà Nẵng",            daysLeft: 2,  raised: 750000000,  goal: 1000000000, image: null, category: "Xóa nghèo",  location: "Đà Nẵng" },
  { id: 4,  title: "Gây quỹ bữa ăn cho trẻ em",              daysLeft: 6,  raised: 120000000,  goal: 300000000,  image: null, category: "Trẻ em",     location: "TP.HCM" },
  { id: 5,  title: "Hỗ trợ người già neo đơn Hà Nội",        daysLeft: 10, raised: 200000000,  goal: 500000000,  image: null, category: "Xóa nghèo",  location: "Hà Nội" },
  { id: 6,  title: "Trồng rừng phòng hộ miền Bắc",           daysLeft: 14, raised: 80000000,   goal: 400000000,  image: null, category: "Môi trường", location: "Lào Cai" },
  { id: 7,  title: "Học bổng trẻ em vùng sâu",               daysLeft: 8,  raised: 180000000,  goal: 600000000,  image: null, category: "Giáo dục",   location: "Cà Mau" },
  { id: 8,  title: "Nước sạch cho bản làng Tây Bắc",         daysLeft: 20, raised: 95000000,   goal: 250000000,  image: null, category: "Môi trường", location: "Sơn La" },
  { id: 9,  title: "Xây cầu cho trẻ em miền núi",            daysLeft: 3,  raised: 680000000,  goal: 1000000000, image: null, category: "Trẻ em",     location: "Nghệ An" },
  { id: 10, title: "Hỗ trợ học sinh vùng lũ Quảng Nam",      daysLeft: 5,  raised: 420000000,  goal: 800000000,  image: null, category: "Thiên tai",  location: "Quảng Nam" },
  { id: 11, title: "Phẫu thuật tim miễn phí cho trẻ",        daysLeft: 7,  raised: 290000000,  goal: 500000000,  image: null, category: "Trẻ em",     location: "TP.HCM" },
  { id: 12, title: "Cứu trợ lũ lụt miền núi phía Bắc",      daysLeft: 1,  raised: 890000000,  goal: 1000000000, image: null, category: "Thiên tai",  location: "Yên Bái" },
];

const CATEGORIES = ["Tất cả", "Thiên tai", "Giáo dục", "Trẻ em", "Xóa nghèo", "Môi trường", "Giảm đói"];
const SORT_OPTIONS = [
  { value: "newest",    label: "Mới nhất",       icon: <FiClock size={13} /> },
  { value: "ending",    label: "Sắp kết thúc",   icon: <FiClock size={13} /> },
  { value: "trending",  label: "Nổi bật",         icon: <FiTrendingUp size={13} /> },
  { value: "complete",  label: "Sắp hoàn thành",  icon: <FiStar size={13} /> },
];
const RECENT_SEARCHES = ["trẻ em", "thiên tai", "giáo dục vùng cao", "nước sạch"];
const PAGE_SIZE = 6;

function sortCampaigns(list, sortKey) {
  const cloned = [...list];
  if (sortKey === "ending")   return cloned.sort((a,b) => a.daysLeft - b.daysLeft);
  if (sortKey === "trending") return cloned.sort((a,b) => (b.raised + b.goal) - (a.raised + a.goal));
  if (sortKey === "complete") return cloned.sort((a,b) => (b.raised/b.goal) - (a.raised/a.goal));
  return cloned;
}

export default function SearchCampaign() {
  const [query, setQuery]           = useState("");
  const [category, setCategory]     = useState("Tất cả");
  const [sortKey, setSortKey]       = useState("newest");
  const [page, setPage]             = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  function handleCategoryChange(cat) {
    setCategory(cat);
    setPage(1);
  }

  function clearAll() {
    setQuery(""); 
    setCategory("Tất cả"); setSortKey("newest");
    setPage(1);
  }

  const activeFilters = [
    query && { key: "q", label: `"${query}"`, clear: () => { setQuery(""); } },
    category !== "Tất cả" && { key: "cat", label: category, clear: () => setCategory("Tất cả") },
    sortKey !== "newest" && { key: "sort", label: SORT_OPTIONS.find(s => s.value === sortKey)?.label, clear: () => setSortKey("newest") },
  ].filter(Boolean);

  const filtered = useMemo(() => {
    let result = ALL_CAMPAIGNS;
    if (query) result = result.filter(c => c.title.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()));
    if (category !== "Tất cả") result = result.filter(c => c.category === category);
    return sortCampaigns(result, sortKey);
  }, [query, category, sortKey]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  return (
    <>
    <Header />
       <div className="sc-page">

      {/* ── Main ── */}
      <div className="sc-main">

        {/* Toolbar */}
        <div className="sc-toolbar">
          <div className="sc-toolbar__left">
            <span className="sc-toolbar__count">
              <span className="sc-toolbar__count-dot" />
              <strong>{filtered.length}</strong> chiến dịch
              {query && <span className="sc-toolbar__query"> cho "{query}"</span>}
            </span>

            {/* Active filter tags */}
            {activeFilters.length > 0 && (
              <div className="sc-toolbar__tags">
                {activeFilters.map(f => (
                  <span key={f.key} className="sc-toolbar__tag">
                    {f.label}
                    <button onClick={f.clear}><FiX size={11} /></button>
                  </span>
                ))}
                <button className="sc-toolbar__clear-all" onClick={clearAll}>
                  Xóa tất cả
                </button>
              </div>
            )}
          </div>

          <div className="sc-toolbar__right">
            {/* Filter toggle */}
            <button
              className={`sc-toolbar__filter-btn${showFilter ? " active" : ""}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <FiSliders size={14} /> Lọc
              {activeFilters.length > 0 && (
                <span className="sc-toolbar__filter-badge">{activeFilters.length}</span>
              )}
            </button>

            {/* Sort */}
            <div className="sc-sort">
              <Select
                className="sc-sort__select"
                value={sortKey}
                onChange={v => { setSortKey(v); setPage(1); }}
                suffixIcon={<FiChevronDown size={14} />}
              >
                {SORT_OPTIONS.map(o => (
                  <Option key={o.value} value={o.value}>
                    <span className="sc-sort__option">
                      {o.icon} {o.label}
                    </span>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilter && (
          <div className="sc-filter-panel">
            <div className="sc-filter-panel__group">
              <div className="sc-filter-panel__label">Danh mục</div>
              <div className="sc-filter-panel__pills">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`sc-filter-panel__pill${category === cat ? " active" : ""}`}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {paginated.length > 0 ? (
          <>
            <div className="sc-grid">
              {paginated.map((c, i) => (
                <div
                  key={c.id}
                  className="sc-grid__item"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <CampaignCard campaign={c} index={i} />
                </div>
              ))}
            </div>

            {filtered.length > PAGE_SIZE && (
              <div className="sc-pagination">
                <Pagination
                  current={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <div className="sc-empty">
            <div className="sc-empty__icon">🔍</div>
            <div className="sc-empty__title">Không tìm thấy kết quả</div>
            <div className="sc-empty__sub">
              Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem tất cả chiến dịch
            </div>
            <button className="sc-empty__btn" onClick={clearAll}>
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div> 
    <Footer />
    </>
    
  );
}