import { useState, useMemo } from "react";
import { Pagination, Input } from "antd";
import { FiGrid, FiUsers, FiFilter, FiSearch, FiMapPin, FiHome, FiBriefcase } from "react-icons/fi";
import OrganizationCard from "../../../components/OrganizationCard/index.jsx";
import useOrganizations from "../../../hooks/useOrganizations";
import useOrganizationStore from "../../../store/organizationStore";
import "./OrganizationList.scss";

export default function OrganizationList() {
  const [activeType, setActiveType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      keyword: search,
      loai_hinh: activeType === "ALL" ? null : activeType,
      page,
    }),
    [search, activeType, page],
  );

  const { organizations, orgTypes } = useOrganizations(params);

  const pagination = useOrganizationStore((s) => s.pagination);

  const ORG_TYPES = useMemo(() => {
    const mapConfig = {
      NHA_NUOC: {
        label: "Tổ chức nhà nước",
        icon: <FiUsers size={16} />,
        color: "#1890ff",
      },
      QUY_TU_THIEN: {
        label: "Quỹ từ thiện",
        icon: <FiHome size={16} />,
        color: "#52c41a",
      },
      DOANH_NGHIEP: {
        label: "Doanh nghiệp",
        icon: <FiBriefcase size={16} />,
        color: "#fa8c16",
      },
    };

    const base = [
      {
        id: "ALL",
        label: "Tất cả",
        icon: <FiGrid size={16} />,
        color: "#ff4d4f",
        count: pagination?.total || 0,
      },
    ];

    const dynamic = (orgTypes || []).map((t) => {
      const config = mapConfig[t.loai_hinh] || {};

      return {
        id: t.loai_hinh,
        label: config.label || t.loai_hinh,
        icon: config.icon || <FiUsers size={16} />,
        color: config.color || "#999",
        count: t.total,
      };
    });

    return [...base, ...dynamic];
  }, [orgTypes, pagination]);

  function handleTypeChange(id) {
    setActiveType(id);
    setPage(1);
  }

  return (
    <div className="ol-page">
      {/* ── Sidebar ── */}
      <aside className="ol-sidebar">
        <div className="ol-region-box">
          <div className="ol-region-header">
            <FiFilter size={17} />
            <span>LOẠI HÌNH</span>
          </div>
          <ul className="ol-region-list">
            {ORG_TYPES.map((t) => (
              <li
                key={t.id}
                className={`ol-region-item${activeType === t.id ? " active" : ""}`}
                onClick={() => handleTypeChange(t.id)}
                style={{ "--item-color": t.color }}
              >
                <span
                  className="ol-region-icon"
                  style={{ background: t.color }}
                >
                  {t.icon}
                </span>
                <span className="ol-region-label">{t.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info box */}
        <div className="ol-info-box">
          <div className="ol-info-box__icon">🏆</div>
          <h3 className="ol-info-box__title">TỔ CHỨC UY TÍN</h3>
          <p className="ol-info-box__desc">
            Tất cả tổ chức đều được xác minh và hoạt động minh bạch dưới sự giám
            sát của cộng đồng.
          </p>
          <div className="ol-info-box__stats">
            <div className="ol-info-box__stat">
              <span className="ol-info-box__stat-value">
                {pagination?.total || 0}+
              </span>
              <span className="ol-info-box__stat-label">Tổ chức</span>
            </div>
            <div className="ol-info-box__stat-divider" />
            <div className="ol-info-box__stat">
              <span className="ol-info-box__stat-value">34</span>
              <span className="ol-info-box__stat-label">Tỉnh thành</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="ol-main">
        {/* Toolbar */}
        <div className="ol-toolbar">
          <Input
            className="ol-toolbar__search"
            placeholder="Tìm kiếm tổ chức..."
            prefix={<FiSearch size={20} className="ol-toolbar__search-icon" />}
            allowClear
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Grid */}
        {organizations.length > 0 ? (
          <div className="ol-grid">
            {organizations.map((o, i) => (
              <div
                key={o.id}
                className="ol-grid__item"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <OrganizationCard organization={o} index={i} />
              </div>
            ))}
          </div>
        ) : (
          <div className="ol-empty">
            <FiMapPin size={32} />
            <p>Không có tổ chức nào trong khu vực này</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="ol-pagination">
            <Pagination
              current={pagination.current_page}
              pageSize={pagination.per_page}
              total={pagination.total}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              showSizeChanger={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
