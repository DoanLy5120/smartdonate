import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiSearch,
  FiLogOut,
  FiChevronRight,
  FiGrid,
  FiUsers,
  FiFolder,
  FiFileText,
  FiHome,
  FiShield,
  FiDollarSign,
} from "react-icons/fi";
import useAuthStore from "../../../store/authStore";
import { logoutAPI } from "../../../api/authService";
import Dashboard from "../Dashboard/Dashboard";
import Users from "../Users/Users";
import Projects from "../Projects/Projects";
import Posts from "../Posts/Posts";
import Withdrawals from "../Withdrawals/Withdrawals";
import FraudAlerts from "../FraudAlerts/FraudAlerts";
import NotificationDropdown from "../../../components/NotificationDropdown";
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
      {
        key: "users",
        icon: <FiUsers size={20} />,
        label: "Người dùng",
        path: "/admin/users",
      },
      {
        key: "projects",
        icon: <FiFolder size={20} />,
        label: "Chiến dịch",
        path: "/admin/projects",
      },
      {
        key: "posts",
        icon: <FiFileText size={20} />,
        label: "Bài đăng",
        path: "/admin/posts",
      },
      {
        key: "fraud-alerts",
        icon: <FiShield size={20} />,
        label: "Cảnh báo gian lận",
        path: "/admin/fraud-alerts",
      },
    ],
  },
  {
    section: "Tài chính",
    items: [
      {
        key: "withdrawals",
        icon: <FiDollarSign size={20} />,
        label: "Yêu cầu rút tiền",
        path: "/admin/withdrawals",
      },
    ],
  },
];

const COMPONENTS = {
  dashboard: Dashboard,
  users: Users,
  projects: Projects,
  posts: Posts,
  withdrawals: Withdrawals,
  "fraud-alerts": FraudAlerts,
};

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: logoutStore } = useAuthStore();
  const storeRoles = useAuthStore((s) => s.roles);

  const FLAT_NAV = NAV_ITEMS.flatMap((s) => s.items);
  const currentKey = location.pathname.split("/")[2] || "dashboard";
  const activeKey = currentKey;
  const activeLabel =
    FLAT_NAV.find((i) => i.key === activeKey)?.label || "Dashboard";
  const CurrentComponent = COMPONENTS[activeKey] || Dashboard;
  const displayName = user?.ho_ten || "Admin";

  const isAdmin = Array.isArray(storeRoles)
    ? storeRoles.some(
        (r) =>
          r === "ADMIN" || r?.ten === "ADMIN" || r?.ten_vai_tro === "ADMIN",
      )
    : false;

  // Bảo vệ route: non-admin bị redirect về trang chủ
  useEffect(() => {
    if (storeRoles.length > 0 && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, storeRoles]);

  useEffect(() => {
    if (location.pathname === "/admin")
      navigate("/admin/dashboard", { replace: true });
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logoutAPI();
    } catch (_) {}
    logoutStore();
    window.location.href = "/dang-nhap";
  }

  function handleNav(path) {
    navigate(path);
    setSidebarOpen(false);
  }

  return (
    <div className="adm">
      {sidebarOpen && (
        <div className="adm__overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`adm__sidebar${sidebarOpen ? " open" : ""}`}>
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
                  {activeKey === item.key && (
                    <FiChevronRight size={13} className="adm__nav-arrow" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="adm__sidebar-footer">
          <div className="adm__user">
            <div className="adm__user-avatar">
              {displayName[0]?.toUpperCase()}
            </div>
            <div className="adm__user-info">
              <div className="adm__user-name">{displayName}</div>
              <div className="adm__user-role">Super Admin</div>
            </div>
            <button
              className="adm__user-logout"
              title="Đăng xuất"
              onClick={handleLogout}
            >
              <FiLogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="adm__main">
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
            <NotificationDropdown triggerClassName="adm__header-btn" />

            {/* Avatar dropdown */}
            <div className="adm__avatar-wrap" ref={avatarRef}>
              <div
                className="adm__header-avatar"
                onClick={() => setAvatarMenuOpen((v) => !v)}
                style={{ cursor: "pointer" }}
              >
                {displayName[0]?.toUpperCase()}
              </div>
              {avatarMenuOpen && (
                <div className="adm__avatar-menu">
                  <div className="adm__avatar-menu__name">{displayName}</div>
                  <div className="adm__avatar-menu__role">Super Admin</div>
                  <div className="adm__avatar-menu__divider" />
                  <button
                    className="adm__avatar-menu__item"
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    <FiHome size={14} /> Về trang chủ
                  </button>
                  <button
                    className="adm__avatar-menu__item adm__avatar-menu__item--danger"
                    onClick={handleLogout}
                  >
                    <FiLogOut size={14} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="adm__content">
          <CurrentComponent />
        </main>
      </div>
    </div>
  );
}
