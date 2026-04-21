import { useState } from "react";
import {
  FiSearch,
  FiCheck,
  FiTrash2,
  FiEye,
  FiFileText,
  FiGift,
  FiPackage,
} from "react-icons/fi";
import "./Posts.scss";

const POSTS = [
  {
    id: 1,
    type: "cho",
    author: "Trần Minh Hiếu",
    title: "TẶNG XE ĐẠP CHO TRẺ EM",
    location: "Liên Chiểu, Đà Nẵng",
    likes: 13,
    status: "approved",
    reported: false,
    time: "16:46 16/03",
  },
  {
    id: 2,
    type: "nhan",
    author: "Phùng Khánh Linh",
    title: "CẦN QUẦN ÁO CHO NGƯỜI LAO ĐỘNG",
    location: "Liên Chiểu, Đà Nẵng",
    likes: 8,
    status: "pending",
    reported: false,
    time: "16:30 16/03",
  },
  {
    id: 3,
    type: "cho",
    author: "Doãn Quốc Thịnh",
    title: "TẶNG TỦ LẠNH MINI",
    location: "Hải Châu, Đà Nẵng",
    likes: 21,
    status: "approved",
    reported: true,
    time: "12:00 16/03",
  },
  {
    id: 4,
    type: "nhan",
    author: "Nguyễn Thị Mai",
    title: "CẦN XE ĐẠP CHO CON ĐI HỌC",
    location: "Liên Chiểu, Đà Nẵng",
    likes: 8,
    status: "pending",
    reported: false,
    time: "14:20 16/03",
  },
  {
    id: 5,
    type: "cho",
    author: "Lê Văn Tám",
    title: "TẶNG BỘ SÁCH GIÁO KHOA LỚP 10",
    location: "Hòa Khánh, Đà Nẵng",
    likes: 5,
    status: "approved",
    reported: false,
    time: "10:30 16/03",
  },
  {
    id: 6,
    type: "cho",
    author: "Bùi Thị Xuân",
    title: "TẶNG QUẦN ÁO TRẺ EM 3-5 TUỔI",
    location: "Hải Châu, Đà Nẵng",
    likes: 10,
    status: "pending",
    reported: false,
    time: "08:00 16/03",
  },
  {
    id: 7,
    type: "nhan",
    author: "Hoàng Phi",
    title: "CẦN TỦ LẠNH CŨ CHO SINH VIÊN",
    location: "Liên Chiểu, Đà Nẵng",
    likes: 21,
    status: "pending",
    reported: true,
    time: "09:15 16/03",
  },
  {
    id: 8,
    type: "nhan",
    author: "Đặng Văn Lâm",
    title: "CẦN SÁCH CŨ CHO THƯ VIỆN",
    location: "Sơn Trà, Đà Nẵng",
    likes: 45,
    status: "approved",
    reported: false,
    time: "07:30 16/03",
  },
];

const STATUS_MAP = {
  approved: { label: "Còn nhận", cls: "green" },
  pending: { label: "Còn tặng", cls: "yellow" },
  removed: { label: "Đã xóa", cls: "red" },
};

export default function Posts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [posts, setPosts] = useState(POSTS);

  const filtered = posts.filter((p) => {
    const m =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase());
    const f =
      filter === "all"
        ? true
        : filter === "reported"
          ? p.reported
          : filter === "pending"
            ? p.status === "pending"
            : filter === "cho"
              ? p.type === "cho"
              : filter === "nhan"
                ? p.type === "nhan"
                : true;
    return m && f;
  });


  function remove(id) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "removed" } : p)),
    );
  }

  const stats = [
    { label: "Tổng bài", val: POSTS.length, c: "#dfdbfd" },
    {
      label: "Còn nhận",
      val: POSTS.filter((p) => p.status === "approved").length,
      c: "#d6fce4",
    },
    {
      label: "Còn tặng",
      val: POSTS.filter((p) => p.status === "pending").length,
      c: "#f8ebd4",
    },
    {
      label: "Bị báo cáo",
      val: POSTS.filter((p) => p.reported).length,
      c: "#f9d0d0",
    },
  ];

  return (
    <div className="pst">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📰 Bài đăng Cho/Nhận</h1>
          <p className="adm-ph__sub">Duyệt và quản lý bài đăng cộng đồng</p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="pst__mini-stats">
        {stats.map((s, i) => (
          <div key={i} className="pst__mini-stat" style={{ "background": s.c }}>
            <div className="pst__mini-val">{s.val}</div>
            <div className="pst__mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">
            <FiFileText size={15} /> Danh sách bài đăng
            <span className="adm-box__badge">{filtered.length}</span>
          </span>
          <div className="adm-box__actions">
            <div className="pst__search">
              <FiSearch size={14} />
              <input
                placeholder="Tìm bài đăng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#e2e8f0",
                  fontSize: 13,
                  width: 150,
                }}
              />
            </div>
            <select
              className="adm-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="cho">Cho đồ</option>
              <option value="nhan">Nhận đồ</option>
              <option value="pending">Chờ duyệt</option>
              <option value="reported">Bị báo cáo</option>
            </select>
          </div>
        </div>

        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Bài đăng</th>
                <th>Loại</th>
                <th>Tác giả</th>
                <th>Trạng thái</th>
                <th>Báo cáo</th>
                <th>Thời gian</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="adm-empty">
                      <div className="adm-empty__icon">📝</div>
                      <div className="adm-empty__text">Không có bài đăng</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={p.reported ? "pst__row--reported" : ""}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td style={{ color: "#333", fontSize: 12 }}>
                      {String(p.id).padStart(3, "0")}
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(51, 51, 51, 0.6)",
                          marginTop: 2,
                        }}
                      >
                        {p.location}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`adm-tag ${p.type === "cho" ? "adm-tag--green" : "adm-tag--blue"}`}
                      >
                        {p.type === "cho" ? (
                          <>
                            <FiGift size={10} /> Cho
                          </>
                        ) : (
                          <>
                            <FiPackage size={10} /> Nhận
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {p.author}
                    </td>
                    <td>
                      <span
                        className={`adm-tag adm-tag--${STATUS_MAP[p.status]?.cls || "gray"}`}
                      >
                        {STATUS_MAP[p.status]?.label || p.status}
                      </span>
                    </td>
                    <td>
                      {p.reported ? (
                        <span className="adm-tag adm-tag--red">⚠️ Vi phạm</span>
                      ) : (
                        <span
                          style={{
                            color: "rgba(51, 51, 51, 0.25)",
                            fontSize: 13,
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: "rgba(51, 51, 51, 0.6)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.time}
                    </td>
                    <td>
                      <div className="pst__actions">
                        <button
                          className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon"
                          title="Xem"
                        >
                          <FiEye size={13} />
                        </button>
                        {p.status !== "removed" && (
                          <button
                            className="adm-btn adm-btn--danger adm-btn--sm"
                            onClick={() => remove(p.id)}
                          >
                            <FiTrash2 size={12} /> Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
