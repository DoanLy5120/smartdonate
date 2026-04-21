import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Pagination, Dropdown } from "antd";
import {
  FiChevronRight,
  FiGrid,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";
import tatca from "../../../assets/user/tatca.png";
import CampaignCard from "../../../components/CampaignCard/index.jsx";
import useCampaignStore from "../../../store/campaignStore";
import useCategories from "../../../hooks/useCategories";
import "./CampaignList.scss";

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
  { key: "newest", label: "Mới nhất", icon: <FiChevronRight size={13} /> },
  { key: "ending_soon", label: "Sắp kết thúc", icon: <FiClock size={13} /> },
  {
    key: "almost_done",
    label: "Sắp hoàn thành",
    icon: <FiTrendingUp size={13} />,
  },
];

export default function CampaignList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useCategories();

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const queryCategory = Number(searchParams.get("category") ?? 0);
  const page = Number(searchParams.get("page") ?? 1);
  const sortKey = searchParams.get("sort") ?? "newest";

  const campaigns = useCampaignStore((s) => s.campaigns);
  const pagination = useCampaignStore((s) => s.pagination);
  const isLoading = useCampaignStore((s) => s.loading);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);

  const allCategories = useMemo(
    () => [{ id: 0, ten_danh_muc: "Tất cả", hinh_anh: tatca }, ...categories],
    [categories],
  );

  const navigateWithParams = (newParams) => {
    const params = new URLSearchParams(location.search);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === 0) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    navigate(`?${params.toString()}`);
  };

  const params = useMemo(() => {
    const p = {
      sort: sortKey,
      page,
    };

    if (queryCategory !== 0) {
      p.danh_muc_id = queryCategory;
    }

    return p;
  }, [sortKey, page, queryCategory]);

  useEffect(() => {
    fetchCampaigns(params);
  }, [params]);

  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey);

  const dropdownItems = {
    items: SORT_OPTIONS.map((o) => ({
      key: o.key,
      label: (
        <span className={`cl-sort-option${o.key === sortKey ? " active" : ""}`}>
          {o.icon} {o.label}
        </span>
      ),
    })),
    onClick: ({ key }) => {
      navigateWithParams({
        sort: key,
        page: 1,
      });
    },
  };

  function handleCategoryChange(id) {
    navigateWithParams({
      category: id === 0 ? null : id,
      page: 1,
    });
  }

  return (
    <div className="cl-page">
      {/* Sidebar */}
      <aside className="cl-sidebar">
        <div className="cl-category-box">
          <div className="cl-category-header">
            <FiGrid size={18} />
            <span>DANH MỤC</span>
          </div>
          <ul className="cl-category-list">
            {allCategories.map((cat) => (
              <li
                key={cat.id}
                className={`cl-category-item${queryCategory === cat.id ? " active" : ""}`}
                onClick={() => handleCategoryChange(cat.id)}
              >
                <img src={cat.hinh_anh} className="cl-category-icon" />
                <span className="cl-category-label">{cat.ten_danh_muc}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main */}
      <main key={queryCategory} className="cl-main">
        <div className="cl-toolbar">
          <span className="cl-toolbar__count">
            <FiCheckCircle size={14} />
            <strong>{pagination?.total ?? 0}</strong> chiến dịch
          </span>

          <Dropdown
            menu={dropdownItems}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button className="cl-sort-btn">
              Hiển thị: <strong>{currentSort?.label}</strong>
              <FiChevronDown size={14} />
            </Button>
          </Dropdown>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="cl-skeleton">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="cl-skeleton__item" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="cl-grid">
            {campaigns.map((c, i) => (
              <div key={c.id} className="cl-grid__item">
                <CampaignCard campaign={c} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="cl-empty">
            Không có chiến dịch nào trong danh mục này
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > PAGE_SIZE && (
          <div className="cl-pagination">
            <Pagination
              current={pagination.current_page || 1}
              pageSize={PAGE_SIZE}
              total={pagination.total}
              onChange={(p) =>
                navigateWithParams({
                  page: p,
                })
              }
              showSizeChanger={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
