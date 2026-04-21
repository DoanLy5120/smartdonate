import { FiUsers, FiAward, FiDollarSign, FiAlertCircle, FiArrowUp, FiArrowDown, FiRefreshCw } from "react-icons/fi";
import "./Dashboard.scss";

const STATS = [
  { label: "Tổng người dùng",   value: "12,847", trend: "+8.2%",  up: true,  icon: <FiUsers size={18} />,       c: "#7c6df0" },
  { label: "Tổ chức từ thiện",  value: "320",    trend: "+3.1%",  up: true,  icon: <FiAward size={18} />,       c: "#22c55e" },
  { label: "Tổng quỹ gây được", value: "8.4 tỷ", trend: "+12.5%", up: true,  icon: <FiDollarSign size={18} />, c: "#f59e0b" },
  { label: "Báo cáo vi phạm",   value: "47",     trend: "-5.3%",  up: false, icon: <FiAlertCircle size={18} />, c: "#ef4444" },
];

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
const BARS   = [42,68,55,80,73,95,88,110,98,125,115,140];

const ACTIVITIES = [
  { c:"#22c55e", text:"Tổ chức Hội Chữ Thập Đỏ được duyệt xác minh",              time:"5 phút trước" },
  { c:"#7c6df0", text:"Chiến dịch 'Xây trường vùng cao' đạt mục tiêu 1 tỷ VNĐ",   time:"18 phút trước" },
  { c:"#ef4444", text:"Báo cáo #R-2847 được xử lý — khóa tài khoản",              time:"1 giờ trước" },
  { c:"#f59e0b", text:"284 người dùng mới đăng ký hôm nay",                        time:"2 giờ trước" },
  { c:"#3b82f6", text:"Bài đăng #P-9921 được duyệt tự động bởi AI",               time:"3 giờ trước" },
];

const TOP_CAMPS = [
  { name:"Giảm thiệt hại thiên tai miền Trung", raised:"890tr", goal:"1 tỷ",  pct:89 },
  { name:"Xây trường cho trẻ em vùng cao",       raised:"750tr", goal:"1 tỷ",  pct:75 },
  { name:"Nước sạch Tây Bắc",                    raised:"320tr", goal:"500tr", pct:64 },
];

const max = Math.max(...BARS);

export default function Dashboard() {
  return (
    <div className="dash">
      {/* Page header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📊 Dashboard</h1>
          <p className="adm-ph__sub">Tổng quan hệ thống SmartDonate</p>
        </div>
        <div className="adm-ph__actions">
          <button className="adm-btn adm-btn--ghost adm-btn--sm">
            <FiRefreshCw size={13} /> Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="adm-stats">
        {STATS.map((s, i) => (
          <div key={i} className="adm-stat" style={{"--c": s.c, animationDelay:`${i*0.07}s`}}>
            <div className="adm-stat__head">
              <div className="adm-stat__icon">{s.icon}</div>
              <span className={`adm-stat__trend adm-stat__trend--${s.up?"up":"down"}`}>
                {s.up ? <FiArrowUp size={11}/> : <FiArrowDown size={11}/>} {s.trend}
              </span>
            </div>
            <div className="adm-stat__val">{s.value}</div>
            <div className="adm-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="dash__mid">
        {/* Bar chart */}
        <div className="adm-box dash__chart-box">
          <div className="adm-box__head">
            <span className="adm-box__title">📈 Quỹ gây được theo tháng</span>
            <select className="adm-select" style={{padding:"4px 10px",fontSize:12}}>
              <option>2025</option><option>2024</option>
            </select>
          </div>
          <div className="dash__chart">
            {BARS.map((v, i) => (
              <div key={i} className="dash__bar-col">
                <div
                  className="dash__bar"
                  style={{ height:`${(v/max)*100}%` }}
                  title={`${v * 10}tr VNĐ`}
                />
                <span className="dash__bar-label">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="adm-box dash__activity-box">
          <div className="adm-box__head">
            <span className="adm-box__title">🕐 Hoạt động gần đây</span>
          </div>
          <div className="dash__activity">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="dash__act-item" style={{animationDelay:`${i*0.07}s`}}>
                <div className="dash__act-dot" style={{background:a.c}} />
                <div>
                  <div className="dash__act-text">{a.text}</div>
                  <div className="dash__act-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top campaigns */}
      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">🎯 Chiến dịch nổi bật</span>
        </div>
        <div style={{padding:"12px 20px 20px"}}>
          {TOP_CAMPS.map((c, i) => (
            <div key={i} className="dash__camp-item" style={{animationDelay:`${i*0.08}s`}}>
              <div className="dash__camp-info">
                <div className="dash__camp-name">{c.name}</div>
                <div className="dash__camp-meta">{c.raised} / {c.goal}</div>
              </div>
              <div className="dash__camp-bar-wrap">
                <div className="dash__camp-bar">
                  <div className="dash__camp-fill" style={{width:`${c.pct}%`}} />
                </div>
                <span className="dash__camp-pct">{c.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}