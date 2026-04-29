import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import useDashboardStore from "../../../store/dashboardStore";
import Header from "../../../components/Header/index";
import "./OrgDashboard.scss";

const FILTER_OPTIONS = [
  { key: "tuan",  label: "7 ngày" },
  { key: "thang", label: "Tháng này" },
  { key: "quy",   label: "3 tháng" },
  { key: "nam",   label: "Năm nay" },
];

const STATUS_MAP = {
  CHO_XU_LY:   { label: "Chờ duyệt",  cls: "yellow" },
  HOAT_DONG:   { label: "Đang chạy",  cls: "green"  },
  HOAN_THANH:  { label: "Hoàn thành", cls: "blue"   },
  TU_CHOI:     { label: "Từ chối",    cls: "red"    },
  TAM_DUNG:    { label: "Tạm dừng",   cls: "orange" },
  DA_KET_THUC: { label: "Đã kết thúc",cls: "gray"   },
};

function fmtVnd(n) {
  if (!n) return "0đ";
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(".0","") + " tỷ";
  if (n >= 1_000_000)     return Math.round(n / 1_000_000) + "tr";
  return Number(n).toLocaleString("vi-VN") + "đ";
}

export default function OrgDashboard() {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [filter, setFilter] = useState("thang");
  const [exporting, setExporting] = useState(false);

  const {
    summary, financial, monthly, campaigns, otherCampaigns, activities,
    loading, loadingFinancial,
    fetchAll, fetchFinancial,
  } = useDashboardStore();

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    fetchFinancial(filter);
  }, [filter]);

  // Bỏ dấu tiếng Việt cho jspdf (default font không full Unicode)
  const removeVnAccent = (str) => {
    if (!str) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const fmtMoney = (n) => Number(n || 0).toLocaleString("vi-VN") + " VND";

  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const FILTER_LABEL = { tuan: "7 ngay", thang: "Thang nay", quy: "3 thang", nam: "Nam nay" };
      const STATUS = {
        CHO_XU_LY: "Cho duyet", HOAT_DONG: "Dang chay", HOAN_THANH: "Hoan thanh",
        TU_CHOI: "Tu choi", TAM_DUNG: "Tam dung", DA_KET_THUC: "Da ket thuc",
      };

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      // Tiêu đề
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("BAO CAO THONG KE TO CHUC", pageWidth / 2, 18, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`To chuc: ${removeVnAccent(summary?.ten_to_chuc || "---")}`, 14, 28);
      doc.text(`Ngay xuat: ${new Date().toLocaleString("vi-VN")}`, 14, 34);

      // Đường line phân cách
      doc.setLineWidth(0.3);
      doc.line(14, 38, pageWidth - 14, 38);

      let y = 44;

      // 1. Tổng quan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("1. TONG QUAN", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["Chi so", "Gia tri"]],
        body: [
          ["Tong tien nhan", fmtMoney(summary?.tong_tien_nhan)],
          ["Tong chien dich", String(summary?.tong_chien_dich || 0)],
          ["Chien dich dang chay", String(summary?.tong_chien_dich_hd || 0)],
          ["So luot ung ho", String(summary?.tong_luot_ung_ho || 0)],
        ],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      });

      // 2. Tài chính theo kỳ
      y = doc.lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`2. TAI CHINH THEO KY: ${FILTER_LABEL[filter] || filter}`, 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["Loai", "So tien"]],
        body: [
          ["Tien nhan", fmtMoney(financial?.tien_nhan)],
          ["Tien chi", fmtMoney(financial?.tien_chi)],
          ["So du quy", fmtMoney(financial?.so_du)],
        ],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      });

      // 3. Chiến dịch đang chạy
      y = doc.lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("3. CHIEN DICH DANG CHAY", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["#", "Ten chien dich", "Da nhan", "Muc tieu", "%", "Con (ngay)"]],
        body: campaigns.length > 0
          ? campaigns.map((c, i) => [
              i + 1,
              removeVnAccent(c.ten_chien_dich),
              fmtMoney(c.so_tien_da_nhan),
              fmtMoney(c.muc_tieu_tien),
              `${c.phan_tram}%`,
              c.so_ngay_con_lai,
            ])
          : [["", "Khong co chien dich nao", "", "", "", ""]],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      });

      // 4. Chiến dịch khác
      y = doc.lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("4. CHIEN DICH KHAC", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["#", "Ten chien dich", "Trang thai", "Da nhan", "Muc tieu", "%"]],
        body: otherCampaigns.length > 0
          ? otherCampaigns.map((c, i) => [
              i + 1,
              removeVnAccent(c.ten_chien_dich),
              STATUS[c.trang_thai] || c.trang_thai,
              fmtMoney(c.so_tien_da_nhan),
              fmtMoney(c.muc_tieu_tien),
              `${c.phan_tram}%`,
            ])
          : [["", "Khong co chien dich nao", "", "", "", ""]],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      });

      // 5. Hoạt động gần đây
      y = doc.lastAutoTable.finalY + 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("5. HOAT DONG GAN DAY", 14, y);
      autoTable(doc, {
        startY: y + 3,
        head: [["Nguoi", "Chien dich", "Loai", "So tien", "Thoi gian"]],
        body: activities.length > 0
          ? activities.map((a) => [
              removeVnAccent(a.ten || "---"),
              removeVnAccent(a.chien_dich || ""),
              a.loai === "UNG_HO" ? "Ung ho" : a.loai === "RUT" ? "Rut" : a.loai,
              (a.loai === "UNG_HO" ? "+" : "-") + fmtMoney(a.so_tien),
              removeVnAccent(a.thoi_gian),
            ])
          : [["", "Khong co hoat dong nao", "", "", ""]],
        theme: "grid",
        headStyles: { fillColor: [60, 60, 60], textColor: 255, fontSize: 10 },
        styles: { fontSize: 9, cellPadding: 2.5 },
        margin: { left: 14, right: 14 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.text(`Trang ${i}/${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
        doc.text("Smart Donate - He thong gay quy thien nguyen", 14, doc.internal.pageSize.getHeight() - 8);
      }

      const fileName = `bao-cao-${removeVnAccent(summary?.ten_to_chuc || "to-chuc").replace(/\s+/g, "-")}-${Date.now()}.pdf`;
      doc.save(fileName);
      notification.success({ message: "Xuất PDF thành công" });
    } catch (err) {
      console.error(err);
      notification.error({ message: "Lỗi xuất PDF", description: "Cần cài: npm i jspdf jspdf-autotable" });
    } finally {
      setExporting(false);
    }
  };

  // Vẽ biểu đồ Chart.js
  useEffect(() => {
    if (!monthly || !chartRef.current) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: monthly.labels,
          datasets: [
            { label: "Tiền nhận", data: monthly.tien_nhan, backgroundColor: "#7c6df0", borderRadius: 5, borderSkipped: false },
            { label: "Tiền chi",  data: monthly.tien_chi,  backgroundColor: "#ef4444", borderRadius: 5, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { font: { size: 10 }, color: "#888" }, grid: { display: false }, border: { display: false } },
            y: { ticks: { font: { size: 10 }, color: "#888", callback: (v) => fmtVnd(v) }, grid: { color: "rgba(0,0,0,0.04)" }, border: { display: false } },
          },
        },
      });
    };
    if (!window.Chart) document.head.appendChild(script);
    else script.onload();
  }, [monthly]);

  if (loading) {
    return (
      <div className="od-loading">
        <div className="od-loading__spinner" />
        <span>Đang tải...</span>
      </div>
    );
  }

  return (
    <>
    <Header />
    <div className="od">
      {/* Header */}
      <div className="od-ph">
        <div>
          <div className="od-ph__title">📊 Thống kê tổ chức</div>
          <div className="od-ph__sub">
            <span className="od-ph__dot" />
            {summary?.ten_to_chuc || "Tổ chức"} · Cập nhật hôm nay
          </div>
        </div>
        <button className="od-btn od-btn--export" onClick={handleExportPdf} disabled={exporting}>
          {exporting ? "Đang xuất..." : "📥 Xuất báo cáo PDF"}
        </button>
      </div>

      {/* Row 1: 4 thẻ cố định */}
      <div className="od-stats4">
        {[
          { icon: "💰", label: "Tổng tiền nhận",       val: fmtVnd(summary?.tong_tien_nhan),                          c: "#7c6df0" },
          { icon: "📂", label: "Tổng chiến dịch",      val: summary?.tong_chien_dich ?? 0,                            c: "#3b82f6" },
          { icon: "▶️", label: "Chiến dịch đang chạy", val: summary?.tong_chien_dich_hd ?? 0,                         c: "#22c55e" },
          { icon: "🤝", label: "Số lượt ủng hộ",       val: (summary?.tong_luot_ung_ho ?? 0).toLocaleString("vi-VN"), c: "#f59e0b" },
        ].map((s, i) => (
          <div key={i} className="od-stat" style={{ "--c": s.c }}>
            <div className="od-stat__head"><div className="od-stat__icon">{s.icon}</div></div>
            <div className="od-stat__val">{s.val}</div>
            <div className="od-stat__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bộ lọc kỳ */}
      <div className="od-filter">
        <div className="od-filter__label">Lọc theo kỳ:</div>
        <div className="od-filter__tabs">
          {FILTER_OPTIONS.map((o) => (
            <button
              key={o.key}
              className={`od-filter__btn${filter === o.key ? " active" : ""}`}
              onClick={() => setFilter(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: 3 thẻ theo kỳ */}
      <div className="od-stats3">
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(34,197,94,0.1)" }}>📥</div>
          <div>
            <div className="od-stat2__label">Tiền nhận</div>
            <div className="od-stat2__val" style={{ color: "#22c55e" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.tien_nhan)}
            </div>
          </div>
        </div>
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(239,68,68,0.1)" }}>📤</div>
          <div>
            <div className="od-stat2__label">Tiền chi</div>
            <div className="od-stat2__val" style={{ color: "#ef4444" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.tien_chi)}
            </div>
          </div>
        </div>
        <div className="od-stat2">
          <div className="od-stat2__icon" style={{ background: "rgba(59,130,246,0.1)" }}>💳</div>
          <div>
            <div className="od-stat2__label">Số dư quỹ</div>
            <div className="od-stat2__val" style={{ color: "#3b82f6" }}>
              {loadingFinancial ? "..." : fmtVnd(financial?.so_du)}
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ + hoạt động */}
      <div className="od-row2">
        <div className="od-card">
          <div className="od-card__title"><span>📈</span> Tiền nhận &amp; chi theo tháng</div>
          <div className="od-legend">
            <span><span className="od-dot" style={{ background: "#7c6df0" }} />Tiền nhận</span>
            <span><span className="od-dot" style={{ background: "#ef4444" }} />Tiền chi</span>
          </div>
          <div className="od-chart-wrap">
            <canvas ref={chartRef} role="img" aria-label="Biểu đồ tiền nhận và chi" />
          </div>
        </div>

        <div className="od-card">
          <div className="od-card__title"><span>⚡</span> Hoạt động gần đây</div>
          <div className="od-act-list od-act-list--scroll">
            {activities.length === 0 ? (
              <div className="od-empty">Chưa có hoạt động</div>
            ) : activities.map((a, i) => (
              <div key={i} className="od-act">
                <div className={`od-act__icon ${a.loai === "UNG_HO" ? "green" : a.loai === "RUT" ? "red" : "purple"}`}>
                  {a.loai === "UNG_HO" ? "💚" : a.loai === "RUT" ? "❤️" : "💜"}
                </div>
                <div className="od-act__body">
                  <div className="od-act__name">{a.ten}{a.chien_dich ? ` · ${a.chien_dich}` : ""}</div>
                  <div className="od-act__time">{a.thoi_gian}</div>
                </div>
                <div className={`od-act__amt ${a.loai === "UNG_HO" ? "green" : "red"}`}>
                  {a.loai === "UNG_HO" ? "+" : "-"}{fmtVnd(a.so_tien)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chiến dịch: Đang chạy (trái) + Khác (phải) */}
      <div className="od-row2">
        <div className="od-card">
          <div className="od-card__title"><span>🏆</span> Chiến dịch đang chạy</div>
          {campaigns.length === 0 ? (
            <div className="od-empty">
              Chưa có chiến dịch nào đang chạy
              <button className="od-btn od-btn--sm" onClick={() => navigate("/chien-dich/tao-moi")}>
                + Tạo chiến dịch
              </button>
            </div>
          ) : (
            <div className="od-camp-list od-camp-list--scroll">
              {campaigns.map((c) => (
                <div key={c.id} className="od-camp">
                  <div className="od-camp__top">
                    <div className="od-camp__name">{c.ten_chien_dich}</div>
                    <div className="od-camp__pct">{c.phan_tram}%</div>
                  </div>
                  <div className="od-camp__bar">
                    <div className="od-camp__fill" style={{ width: `${Math.min(c.phan_tram, 100)}%` }} />
                  </div>
                  <div className="od-camp__meta">
                    {fmtVnd(c.so_tien_da_nhan)} / {fmtVnd(c.muc_tieu_tien)} · còn {c.so_ngay_con_lai} ngày
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="od-card">
          <div className="od-card__title"><span>📁</span> Chiến dịch khác</div>
          {otherCampaigns.length === 0 ? (
            <div className="od-empty">Chưa có chiến dịch nào khác</div>
          ) : (
            <div className="od-camp-list od-camp-list--scroll">
              {otherCampaigns.map((c) => {
                const st = STATUS_MAP[c.trang_thai] || { label: c.trang_thai, cls: "gray" };
                return (
                  <div key={c.id} className="od-camp">
                    <div className="od-camp__top">
                      <div className="od-camp__name">
                        {c.ten_chien_dich}
                        <span className={`od-tag od-tag--${st.cls}`}>{st.label}</span>
                      </div>
                      <div className="od-camp__pct">{c.phan_tram}%</div>
                    </div>
                    <div className="od-camp__bar">
                      <div className="od-camp__fill" style={{ width: `${Math.min(c.phan_tram, 100)}%` }} />
                    </div>
                    <div className="od-camp__meta">
                      {fmtVnd(c.so_tien_da_nhan)} / {fmtVnd(c.muc_tieu_tien)} · còn {c.so_ngay_con_lai} ngày
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}