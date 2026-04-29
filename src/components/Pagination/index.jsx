import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Pagination.scss";

/**
 * Pagination
 * Props:
 *   meta: { current_page, last_page, total, per_page }
 *   onChange: (newPage) => void
 *   loading?: boolean
 */
export default function Pagination({ meta, onChange, loading = false }) {
  const current = meta?.current_page || 1;
  const last    = meta?.last_page    || 1;
  const total   = meta?.total        || 0;
  const perPage = meta?.per_page     || 10;

  if (last <= 1) {
    return total > 0 ? (
      <div className="adm-pag adm-pag--single">
        Tổng <strong>{total}</strong> mục
      </div>
    ) : null;
  }

  // Tính range hiển thị (max 5 nút page)
  const maxButtons = 5;
  let start = Math.max(1, current - Math.floor(maxButtons / 2));
  let end   = Math.min(last, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const goTo = (p) => {
    if (loading) return;
    if (p < 1 || p > last || p === current) return;
    onChange?.(p);
  };

  const from = (current - 1) * perPage + 1;
  const to   = Math.min(current * perPage, total);

  return (
    <div className="adm-pag">
      <div className="adm-pag__info">
        Hiển thị <strong>{from}–{to}</strong> / <strong>{total}</strong> mục
      </div>
      <div className="adm-pag__controls">
        <button
          className="adm-pag__btn adm-pag__btn--nav"
          disabled={current === 1 || loading}
          onClick={() => goTo(current - 1)}
          title="Trang trước"
        >
          <FiChevronLeft size={14} />
        </button>

        {start > 1 && (
          <>
            <button className="adm-pag__btn" onClick={() => goTo(1)}>1</button>
            {start > 2 && <span className="adm-pag__dots">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={`adm-pag__btn${p === current ? " adm-pag__btn--active" : ""}`}
            onClick={() => goTo(p)}
            disabled={loading}
          >
            {p}
          </button>
        ))}

        {end < last && (
          <>
            {end < last - 1 && <span className="adm-pag__dots">…</span>}
            <button className="adm-pag__btn" onClick={() => goTo(last)}>{last}</button>
          </>
        )}

        <button
          className="adm-pag__btn adm-pag__btn--nav"
          disabled={current === last || loading}
          onClick={() => goTo(current + 1)}
          title="Trang sau"
        >
          <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}