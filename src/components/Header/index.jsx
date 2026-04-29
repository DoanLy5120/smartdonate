import { useState } from "react";
import { Avatar, Badge, Input, Menu, Dropdown } from "antd";
import { FiBell, FiMessageCircle, FiSearch } from "react-icons/fi";
import logo from "../../assets/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import RequiredLoginModal from "../../components/Required/index";
import useAuthStore from "../../store/authStore";
import { logoutAPI } from "../../api/authService";
import useChatStore from "../../store/chatStore";
import NotificationDropdown from "../../components/NotificationDropdown";
import "./styles.scss";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const totalUnread = useChatStore((s) => s.totalUnread);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const { user, token } = useAuthStore();
  const isLoggedIn = !!token;
  const logoutStore = useAuthStore((state) => state.logout);
  const roles = useAuthStore((s) => s.roles);
  const isOrg = Array.isArray(roles)
    ? roles.some(
        (r) =>
          r === "TO_CHUC" ||
          r?.ten === "TO_CHUC" ||
          r?.ten_vai_tro === "TO_CHUC",
      )
    : false;
  const isAdmin = Array.isArray(roles)
    ? roles.some(
        (r) =>
          r === "ADMIN" || r?.ten === "ADMIN" || r?.ten_vai_tro === "ADMIN",
      )
    : false;

  const navbar = [
    {
      label: "Trang chủ",
      key: "/",
      children: [
        { label: "Chiến dịch", key: "/chien-dich", to: "/chien-dich" },
        { label: "Bảng tin", key: "/bang-tin", to: "/bang-tin" },
      ],
    },
    {
      label: "Bản đồ chiến dịch",
      key: "/ban-do",
      children: [
        { label: "Chiến dịch địa phương", key: "/ban-do-cd", to: "/ban-do-cd" },
      ],
    },
    {
      label: "Hỗ trợ",
      key: "ho-tro",
      children: [
        { label: "Hỏi đáp", key: "ho-tro/hoi-dap", to: "/ho-tro/hoi-dap" },
        {
          label: "Điều khoản",
          key: "ho-tro/dieu-khoan",
          to: "/ho-tro/dieu-khoan",
        },
        {
          label: "Chính sách bảo mật",
          key: "ho-tro/chinh-sach",
          to: "/ho-tro/chinh-sach",
        },
      ],
    },
  ];

  const menuItems = navbar.map((item) => ({
    label: item.label,
    key: item.key,
    children: item.children?.map((child) => ({
      key: child.key,
      label: <Link to={child.to}>{child.label}</Link>,
    })),
  }));

  const getActiveKey = () => {
    const path = location.pathname;
    for (const item of navbar) {
      if (item.children) {
        const foundChild = item.children.find(
          (c) => path === c.to || path.startsWith(c.to + "/"),
        );
        if (foundChild) return [foundChild.key];
      }
      if (path === item.key || path.startsWith(item.key + "/")) {
        return [item.key];
      }
    }
    return [];
  };

  const handleSearch = (value) => {
    if (!value.trim()) return;
    navigate(
      `/chien-dich/tim-kiem?keyword=${encodeURIComponent(value.trim())}`,
    );
  };

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (err) {
      console.log("Logout lỗi:", err);
    } finally {
      logoutStore();
      window.location.href = "/dang-nhap";
    }
  };

  const handleClick = (e) => {
    const clickedItem = navbar.find((item) => item.key === e.key);
    if (clickedItem && !clickedItem.children) {
      navigate(`/${clickedItem.key}`);
    }
  };

  const items = isAdmin
    ? [
        {
          key: "dashboard",
          label: "Trang quản trị",
          onClick: () => navigate("/admin"),
        },
        {
          key: "logout",
          label: "Đăng xuất",
          onClick: handleLogout,
        },
      ]
    : [
        {
          key: "profile",
          label: "Thông tin cá nhân",
          onClick: () => navigate("/profile"),
        },
        ...(isOrg
          ? [
              {
                key: "thong-ke",
                label: "Thống kê tổ chức",
                onClick: () => navigate("/thong-ke"),
              },
            ]
          : []),
        {
          key: "logout",
          label: "Đăng xuất",
          onClick: handleLogout,
        },
      ];

  return (
    <header className="app-header full-bleed">
      <div className="app-header__inner">
        <span className="app-header__logo">
          <img src={logo} alt="logo" className="app-header__logoImg" />
        </span>

        <div className="app-header__search">
          <Input
            placeholder="Tìm kiếm chiến dịch..."
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={() => handleSearch(searchValue)}
            suffix={
              <FiSearch
                size={18}
                style={{ cursor: "pointer" }}
                onClick={() => handleSearch(searchValue)}
              />
            }
            className="app-header__searchInput"
          />
        </div>

        <div className="app-header__nav">
          <Menu
            mode="horizontal"
            items={menuItems}
            selectedKeys={getActiveKey()}
            onClick={handleClick}
          />
        </div>

        <div className="app-header__actions">
          {isLoggedIn ? (
            <>
              <NotificationDropdown />
              <button
                type="button"
                className="app-header__iconBtn"
                aria-label="Tin nhắn"
                onClick={() => navigate("/chat", { replace: true })}
              >
                <Badge count={totalUnread} size="small" offset={[0, 4]}>
                  <FiMessageCircle size={22} />
                </Badge>
              </button>
              <Dropdown menu={{ items }}>
                <div className="app-header__user">
                  <Avatar size={34} src={user?.anh_dai_dien || undefined}>
                    {!user?.anh_dai_dien &&
                      (user?.ho_ten?.[0]?.toUpperCase() || "U")}
                  </Avatar>
                  <div className="app-header__userText">
                    <div className="app-header__userName">{user?.ho_ten}</div>
                  </div>
                </div>
              </Dropdown>
            </>
          ) : (
            <div className="app-header__auth">
              <button
                className="app-header__btn app-header__btn--orange"
                onClick={() => setOpenLoginModal(true)}
              >
                Tạo chiến dịch
              </button>
              <button
                className="app-header__btn app-header__btn--green"
                onClick={() => navigate("/dang-nhap")}
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      </div>

      <RequiredLoginModal
        openLoginModal={openLoginModal}
        setOpenLoginModal={setOpenLoginModal}
      />
    </header>
  );
}
