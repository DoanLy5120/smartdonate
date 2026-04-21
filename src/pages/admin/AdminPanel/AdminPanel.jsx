import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBell,
  FiSearch,
  FiLogOut,
  FiChevronRight,
  FiGrid,
  FiUsers,
  FiFolder,
  FiFileText,
} from "react-icons/fi";
import Dashboard from "../Dashboard/Dashboard";
import Users from "../Users/Users";
import Projects from "../Projects/Projects";
import Posts from "../Posts/Posts";
import "./AdminPanel.scss";

const NAV_ITEMS = [
  {
    section: "Tổng quan",
    items: [
      {
        key: "dashboard",
        icon: <FiGrid size={20} />,
        label: "Dashboard",
        path: "/admin/dashboard",
      },
    ],
  },
  {
    section: "Quản lý",
    items: [
      { key: "users", icon: <FiUsers size={20} />, label: "Người dùng", path: "/admin/users" },
      {
        key: "projects",
        icon: <FiFolder size={20} />,
        label: "Chiến dịch",
        path: "/admin/projects",
        badge: 4,
      },
      {
        key: "posts",
        icon: <FiFileText size={20} />,
        label: "Bài đăng",
        path: "/admin/posts",
        badge: 6,
      },
    ],
  },
];

const COMPONENTS = {
  dashboard: Dashboard,
  users: Users,
  projects: Projects,
  posts: Posts,
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const FLAT_NAV = NAV_ITEMS.flatMap((section) => section.items);

  const currentKey = location.pathname.split("/")[2] || "dashboard";

  const activeKey = currentKey;

  const activeLabel =
    FLAT_NAV.find((item) => item.key === activeKey)?.label || "Dashboard";

  const CurrentComponent = COMPONENTS[activeKey] || Dashboard;

  useEffect(() => {
    if (location.pathname === "/admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, []);

  function handleNav(path) {
    navigate(path);
    setSidebarOpen(false);
  }

  return (
    <div className="adm">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="adm__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`adm__sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Logo */}
        <div className="adm__logo">
          <div className="adm__logo-icon">🎯</div>
          <div>
            <div className="adm__logo-name">SmartDonate</div>
            <div className="adm__logo-sub">Admin Panel</div>
          </div>
          <button
            className="adm__logo-close"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="adm__nav">
          <div className="adm__nav-label">MENU CHÍNH</div>
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="adm__nav-label">{section.section}</div>

              {section.items.map((item) => (
                <button
                  key={item.key}
                  className={`adm__nav-item${activeKey === item.key ? " active" : ""}`}
                  onClick={() => handleNav(item.path)}
                >
                  <span className="adm__nav-icon">{item.icon}</span>
                  <span className="adm__nav-label-text">{item.label}</span>

                  {item.badge && (
                    <span className="adm__nav-badge">{item.badge}</span>
                  )}

                  {activeKey === item.key && (
                    <FiChevronRight size={13} className="adm__nav-arrow" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="adm__sidebar-footer">
          <div className="adm__user">
            <div className="adm__user-avatar">A</div>
            <div className="adm__user-info">
              <div className="adm__user-name">Admin</div>
              <div className="adm__user-role">Super Admin</div>
            </div>
            <button className="adm__user-logout" title="Đăng xuất">
              <FiLogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="adm__main">
        {/* Header */}
        <header className="adm__header">
          <button
            className="adm__header-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu size={20} />
          </button>

          <div className="adm__header-breadcrumb">
            <span>Admin</span>
            <FiChevronRight size={13} className="adm__header-sep" />
            <span className="adm__header-current">{activeLabel}</span>
          </div>

          <div className="adm__header-search">
            <FiSearch size={15} />
            <input placeholder="Tìm kiếm..." />
          </div>

          <div className="adm__header-actions">
            <button className="adm__header-btn">
              <FiBell size={18} />
              <span className="adm__header-notif" />
            </button>
            <div className="adm__header-avatar">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="adm__content">
          <CurrentComponent />
        </main>
      </div>
    </div>
  );
}
