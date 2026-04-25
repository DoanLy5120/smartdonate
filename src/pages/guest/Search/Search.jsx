import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, Pagination } from "antd";
import {
  FiX,
  FiClock,
  FiTrendingUp,
  FiStar,
  FiSliders,
  FiChevronDown,
} from "react-icons/fi";
import { RiSparklingLine } from "react-icons/ri";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import useCampaignStore from "../../../store/campaignStore.js";
import useCategoryStore from "../../../store/categoryStore.js";
import "./Search.scss";

const { Option } = Select;

const SORT_OPTIONS = [
  { value: null, label: "Tất cả", icon: <FiStar size={13} /> },
  {
    value: "HOAT_DONG",
    label: "Đang hoạt động",
    icon: <FiTrendingUp size={13} />,
  },
  { value: "HOAN_THANH", label: "Hoàn thành", icon: <FiStar size={13} /> },
  { value: "TAM_DUNG", label: "Tạm dừng", icon: <FiClock size={13} /> },
  { value: "DA_KET_THUC", label: "Đã kết thúc", icon: <FiClock size={13} /> },
];
const PAGE_SIZE = 8;

export default function SearchCampaign() {
  const { campaigns, pagination, loading, fetchCampaigns } = useCampaignStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") ?? "";
  const [categoryId, setCategoryId] = useState(null);
  const [trangThai, setTrangThai] = useState(null);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCampaigns({
      page,
      keyword: keyword || undefined,
      danh_muc_id: categoryId || undefined,
      trang_thai: trangThai || undefined,
    });
  }, [page, keyword, categoryId, trangThai]);

  function clearAll() {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("keyword");
      return next;
    });
    setCategoryId(null);
    setTrangThai(null);
    setPage(1);
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
      clear: () => setCategoryId(null),
    },
    trangThai && {
      key: "trang_thai",
      label: SORT_OPTIONS.find((s) => s.value === trangThai)?.label,
      clear: () => {
        setTrangThai(null);
        setPage(1);
      },
    },
  ].filter(Boolean);

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
                <strong>{pagination?.total ?? 0}</strong> chiến dịch
                {keyword && (
                  <span className="sc-toolbar__query">cho "{keyword}"</span>
                )}
              </span>

              {/* Active filter tags */}
              {activeFilters.length > 0 && (
                <div className="sc-toolbar__tags">
                  {activeFilters.map((f) => (
                    <span key={f.key} className="sc-toolbar__tag">
                      {f.label}
                      <button onClick={f.clear}>
                        <FiX size={11} />
                      </button>
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
                  <span className="sc-toolbar__filter-badge">
                    {activeFilters.length}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="sc-sort">
                <Select
                  className="sc-sort__select"
                  value={trangThai}
                  onChange={(v) => {
                    setTrangThai(v);
                    setPage(1);
                  }}
                  suffixIcon={<FiChevronDown size={14} />}
                  placeholder="Trạng thái"
                >
                  {SORT_OPTIONS.map((o) => (
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
                  <button
                    className={`sc-filter-panel__pill${!categoryId ? " active" : ""}`}
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
                      className={`sc-filter-panel__pill${categoryId === cat.id ? " active" : ""}`}
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
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="sc-loading">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="sc-skeleton" />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <>
              <div className="sc-grid">
                {campaigns.map((c, i) => (
                  <div
                    key={c.id}
                    className="sc-grid__item"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <CampaignCard campaign={c} index={i} />
                  </div>
                ))}
              </div>

              {pagination?.total > PAGE_SIZE && (
                <div className="sc-pagination">
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
            <div className="sc-empty">
              <div className="sc-empty__icon">🔍</div>
              <div className="sc-empty__title">Không tìm thấy kết quả</div>
              <div className="sc-empty__sub">
                Thử tìm với từ khóa khác hoặc xóa bộ lọc để xem tất cả chiến
                dịch
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
