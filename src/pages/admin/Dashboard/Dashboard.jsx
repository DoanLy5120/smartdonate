import { useEffect } from "react";
import { FiUsers, FiAward, FiDollarSign, FiAlertCircle, FiArrowUp, FiArrowDown, FiRefreshCw, FiFolder } from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import "./Dashboard.scss";

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

// Format số tiền
const formatMoney = (num) => {
  if (!num) return "0";
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)} tỷ`;
  if (num >= 1000000) return `${Math.round(num / 1000000)}tr`;
  if (num >= 1000) return `${Math.round(num / 1000)}k`;
  return num.toLocaleString();
};

// Format thời gian
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000 / 60);
  if (diff < 1) return "Vừa xong";
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
};

// Màu cho activity type
const getActivityColor = (type) => {
  const colors = {
    donation: "#22c55e",
    campaign: "#7c6df0",
    user: "#3b82f6",
    organization: "#f59e0b",
    violation: "#ef4444",
  };
  return colors[type] || "#888";
};

export default function Dashboard() {
  const {
    dashboardSummary,
    dashboardFeatured,
    dashboardFundraising,
    dashboardActivities,
    loadingDashboard,
    fetchDashboard,
    refreshDashboard,
  } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Build stats từ API
  const summary = dashboardSummary || {};
  const stats = [
    { 
      label: "Tổng người dùng", 
      value: summary.total_nguoi_dung?.toLocaleString() || "0", 
      trend: `${summary.phan_tram_thay_doi_nguoi_dung >= 0 ? "+" : ""}${summary.phan_tram_thay_doi_nguoi_dung || 0}%`, 
      up: (summary.phan_tram_thay_doi_nguoi_dung || 0) >= 0, 
      icon: <FiUsers size={18} />, 
      c: "#7c6df0" 
    },
    { 
      label: "Tổ chức từ thiện", 
      value: summary.total_to_chuc?.toLocaleString() || "0", 
      trend: `${summary.phan_tram_thay_doi_to_chuc >= 0 ? "+" : ""}${summary.phan_tram_thay_doi_to_chuc || 0}%`, 
      up: (summary.phan_tram_thay_doi_to_chuc || 0) >= 0, 
      icon: <FiAward size={18} />, 
      c: "#22c55e" 
    },
    { 
      label: "Tổng quỹ gây được", 
      value: formatMoney(summary.total_tien_gay_quy), 
      trend: `${summary.phan_tram_thay_doi_tien_gay_quy >= 0 ? "+" : ""}${summary.phan_tram_thay_doi_tien_gay_quy || 0}%`, 
      up: (summary.phan_tram_thay_doi_tien_gay_quy || 0) >= 0, 
      icon: <FiDollarSign size={18} />, 
      c: "#f59e0b" 
    },
    { 
      label: "Chiến dịch", 
      value: summary.total_chien_dich?.toLocaleString() || "0", 
      trend: `${summary.phan_tram_thay_doi_chien_dich >= 0 ? "+" : ""}${summary.phan_tram_thay_doi_chien_dich || 0}%`, 
      up: (summary.phan_tram_thay_doi_chien_dich || 0) >= 0, 
      icon: <FiFolder size={18} />, 
      c: "#3b82f6" 
    },
  ];

  // Build chart data từ API
  const fundraisingData = dashboardFundraising || {};
  const monthsData = fundraisingData.months || [];
  const bars = MONTHS.map((_, i) => {
    const monthData = monthsData.find(m => m.month === i + 1);
    return monthData?.total || 0;
  });
  const maxBar = Math.max(...bars, 1);

  // Build activities từ API
  const activities = Array.isArray(dashboardActivities) ? dashboardActivities : [];

  // Build featured campaigns từ API
  const featuredCampaigns = Array.isArray(dashboardFeatured) ? dashboardFeatured : [];

  return (
    <div className="dash">
      {/* Page header */}
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">📊 Dashboard</h1>
          <p className="adm-ph__sub">Tổng quan hệ thống SmartDonate</p>
        </div>
        <div className="adm-ph__actions">
          <button 
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={refreshDashboard}
            disabled={loadingDashboard}
          >
            <FiRefreshCw size={13} className={loadingDashboard ? "spin" : ""} /> Làm mới
          </button>
        </div>
      </div>

      {/* Loading */}
      {loadingDashboard && !dashboardSummary && (
        <div className="adm-empty">
          <div className="adm-empty__text">Đang tải dữ liệu...</div>
        </div>
      )}

      {/* Stats */}
      <div className="adm-stats">
        {stats.map((s, i) => (
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
            <span className="adm-box__year">{fundraisingData.year || new Date().getFullYear()}</span>
          </div>
          <div className="dash__chart">
            {bars.map((v, i) => (
              <div key={i} className="dash__bar-col">
                <div
                  className="dash__bar"
                  style={{ height: `${(v / maxBar) * 100}%` }}
                  title={`${formatMoney(v)} VNĐ`}
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
            {activities.length === 0 ? (
              <div className="adm-empty" style={{ padding: "20px" }}>
                <div className="adm-empty__text">Chưa có hoạt động</div>
              </div>
            ) : (
              activities.map((a, i) => (
                <div key={i} className="dash__act-item" style={{animationDelay:`${i*0.07}s`}}>
                  <div className="dash__act-dot" style={{background: getActivityColor(a.type)}} />
                  <div>
                    <div className="dash__act-text">
                      <strong>{a.user}</strong> {a.title.toLowerCase()} {a.amount ? `${formatMoney(a.amount)} đ` : ""}
                    </div>
                    <div className="dash__act-detail">{a.detail}</div>
                    <div className="dash__act-time">{formatTime(a.time)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top campaigns */}
      <div className="adm-box">
        <div className="adm-box__head">
          <span className="adm-box__title">🎯 Chiến dịch nổi bật</span>
        </div>
        <div style={{padding:"12px 20px 20px"}}>
          {featuredCampaigns.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty__text">Chưa có chiến dịch nổi bật</div>
            </div>
          ) : (
            featuredCampaigns.map((c, i) => (
              <div key={c.id || i} className="dash__camp-item" style={{animationDelay:`${i*0.08}s`}}>
                <div className="dash__camp-info">
                  <div className="dash__camp-name">{c.title}</div>
                  <div className="dash__camp-org">{c.organization}</div>
                  <div className="dash__camp-meta">{formatMoney(c.raised)} / {formatMoney(c.goal)}</div>
                </div>
                <div className="dash__camp-bar-wrap">
                  <div className="dash__camp-bar">
                    <div className="dash__camp-fill" style={{width:`${Math.min(c.progress_percent, 100)}%`}} />
                  </div>
                  <span className="dash__camp-pct">{c.progress_percent}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}