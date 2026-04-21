import { useMemo } from "react";
import { FiAward, FiMonitor } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.scss";

export default function Menu({ items, onChange }) {
  const location = useLocation();
  const navigate = useNavigate();

  const resolvedItems = useMemo(
    () =>
      items?.length
        ? items
        : [
            { key: "/chien-dich", label: "Chiến Dịch", icon: <FiAward size={22} /> },
            { key: "/bang-tin",   label: "Bảng Tin",   icon: <FiMonitor size={22} /> },
          ],
    [items]
  );

  const currentValue = resolvedItems.find((item) =>
    location.pathname.startsWith(item.key)
  )?.key;

  function handleSelect(nextKey) {
    navigate(nextKey);
    onChange?.(nextKey);
  }

  return (
    <div className="app-menu full-bleed">
      <div className="app-menu__inner">
        <nav className="app-menu__tabs" aria-label="Menu">
          {resolvedItems.map((item) => {
            const isActive = item.key === currentValue;
            return (
              <button
                key={item.key}
                type="button"
                className={`app-menu__tab${isActive ? " is-active" : ""}`}
                onClick={() => handleSelect(item.key)}
              >
                <span className="app-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="app-menu__label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}