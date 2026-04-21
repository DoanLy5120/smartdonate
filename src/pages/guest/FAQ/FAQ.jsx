import { useState } from "react";
import { Button } from "antd";
import {
  FiChevronDown,
  FiUser,
  FiAward,
  FiMail,
  FiPhone,
  FiMessageCircle,
  FiHelpCircle,
  FiHeart,
  FiShield,
  FiDollarSign,
  FiUsers,
  FiGift,
} from "react-icons/fi";
import { RiSparklingLine } from "react-icons/ri";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import "./FAQ.scss";

const FAQ_DATA = {
  user: {
    label: "Dành cho người ủng hộ",
    icon: <FiUser size={16} />,
    color: "#ff4d4f",
    items: [
      {
        id: 1,
        icon: <FiHeart size={16} />,
        q: "Làm thế nào để ủng hộ một chiến dịch từ thiện?",
        a: `Để ủng hộ một chiến dịch, bạn thực hiện các bước sau:
- Tìm kiếm chiến dịch bạn muốn ủng hộ tại trang Chiến Dịch.
- Nhấn vào chiến dịch để xem chi tiết và nhấn nút "Ủng hộ chiến dịch".
- Nhập số tiền bạn muốn đóng góp và chọn phương thức thanh toán.
- Xác nhận giao dịch — hệ thống sẽ gửi email xác nhận đến bạn.
- Bạn có thể theo dõi tiến độ chiến dịch bất kỳ lúc nào sau khi ủng hộ.`,
      },
      {
        id: 2,
        icon: <FiShield size={16} />,
        q: "Tiền ủng hộ của tôi có được sử dụng đúng mục đích không?",
        a: `SmartDonate cam kết minh bạch 100% trong việc sử dụng nguồn quỹ:
- Tất cả giao dịch đều được ghi nhận và hiển thị công khai trên hệ thống.
- Các tổ chức từ thiện phải cập nhật báo cáo tài chính định kỳ.
- Bạn có thể xem lịch sử chi tiêu của từng chiến dịch ngay trên trang chi tiết.
- Hệ thống AI của SmartDonate sẽ cảnh báo nếu phát hiện bất thường trong phân bổ quỹ.`,
      },
      {
        id: 3,
        icon: <FiGift size={16} />,
        q: "Tính năng Cho/Nhận đồ dùng hoạt động như thế nào?",
        a: `Tính năng Cho/Nhận cho phép bạn trao tặng hoặc nhận đồ dùng miễn phí từ cộng đồng:
- Chuyển sang tab "Bảng Tin" và chọn "CHO ĐỒ" hoặc "NHẬN ĐỒ".
- Đăng bài mô tả vật phẩm muốn cho hoặc cần nhận, kèm ảnh và địa điểm.
- AI SmartDonate sẽ tự động gợi ý ghép nối bài đăng phù hợp gần khu vực bạn.
- Nhắn tin trực tiếp với người cho/nhận để sắp xếp thời gian trao đổi.`,
      },
      {
        id: 4,
        icon: <FiDollarSign size={16} />,
        q: "Tôi có thể hoàn tiền nếu chiến dịch bị hủy không?",
        a: `Chính sách hoàn tiền của SmartDonate như sau:
- Nếu chiến dịch bị hủy vì 1 lí do nào đó trong thời hạn quy định, toàn bộ số tiền sẽ được hoàn lại cho người ủng hộ.
- Thời gian hoàn tiền từ 3–7 ngày làm việc tùy phương thức thanh toán.
- Bạn sẽ nhận được thông báo qua email khi quá trình hoàn tiền bắt đầu.`,
      },
      {
        id: 5,
        icon: <FiUsers size={16} />,
        q: "AI ghép nối trong SmartDonate hoạt động như thế nào?",
        a: `Hệ thống AI của SmartDonate phân tích và ghép nối thông minh:
- AI đọc nội dung bài đăng Cho/Nhận, phân tích loại vật phẩm, khu vực địa lý và nhu cầu.
- Khi bạn đăng tải một bài đăng "Tặng xe đạp", AI sẽ gợi ý ngay các bài "Cần xe đạp" gần bạn.
- Độ khớp được tính theo thang % dựa trên vật phẩm, khu vực và thời điểm đăng.`,
      },
    ],
  },
  org: {
    label: "Dành cho tổ chức gây quỹ",
    icon: <FiAward size={16} />,
    color: "#1890ff",
    items: [
      {
        id: 6,
        icon: <FiAward size={16} />,
        q: "Tổ chức của tôi cần điều kiện gì để đăng ký xác minh?",
        a: `Để trở thành tổ chức xác minh trên SmartDonate, bạn cần cung cấp:
- Giấy phép hoạt động hợp lệ do cơ quan nhà nước có thẩm quyền cấp.
- Thông tin tài khoản ngân hàng chính thức của tổ chức.
- Hồ sơ giới thiệu tổ chức và lịch sử hoạt động từ thiện (nếu có).
- Email và số điện thoại liên hệ chính thức.
Sau khi nộp hồ sơ, đội ngũ SmartDonate sẽ xét duyệt trong vòng 3–5 ngày làm việc.`,
      },
      {
        id: 7,
        icon: <FiHeart size={16} />,
        q: "Làm thế nào để tạo và quản lý một chiến dịch gây quỹ?",
        a: `Quy trình tạo chiến dịch gồm 2 bước đơn giản:
Bước 1 — Thông tin chiến dịch:
- Nhập tên, chọn danh mục, mô tả chi tiết và upload hình ảnh.

Bước 2 — Mục tiêu chiến dịch:
- Đặt mục tiêu số tiền cần đạt, thời gian kết thúc và vị trí địa lý.
- Sau khi tạo, bạn có thể theo dõi tiến độ, danh sách người ủng hộ và báo cáo tài chính ngay trên trang quản lý.`,
      },
      {
        id: 8,
        icon: <FiDollarSign size={16} />,
        q: "Phí nền tảng và quy trình rút tiền như thế nào?",
        a: `SmartDonate áp dụng mức phí minh bạch như sau:
- Phí nền tảng: 3% trên tổng số tiền quyên góp được (dùng để duy trì hệ thống).
- Rút tiền: Tổ chức có thể yêu cầu rút tiền sau khi chiến dịch kết thúc hoặc định kỳ hàng tháng.
- Thời gian xử lý: 1–3 ngày làm việc sau khi yêu cầu được duyệt.
- Toàn bộ lịch sử giao dịch được lưu trữ và có thể xuất báo cáo PDF bất kỳ lúc nào.`,
      },
      {
        id: 9,
        icon: <FiShield size={16} />,
        q: "Tổ chức có nghĩa vụ báo cáo sử dụng quỹ như thế nào?",
        a: `SmartDonate yêu cầu các tổ chức đảm bảo tính minh bạch:
- Cập nhật tiến độ thực hiện dự án ít nhất 1 lần/tháng trong suốt thời gian chiến dịch.
- Nộp báo cáo tài chính cuối chiến dịch kèm hóa đơn/chứng từ chi tiêu.
- Đăng hình ảnh và video thực tế từ dự án lên trang chiến dịch.
- Vi phạm nghĩa vụ báo cáo có thể dẫn đến tạm dừng hoạt động tài khoản tổ chức.`,
      },
      {
        id: 10,
        icon: <FiUsers size={16} />,
        q: "Tôi có thể quản lý nhiều chiến dịch cùng lúc không?",
        a: `Tài khoản tổ chức trên SmartDonate hỗ trợ quản lý đa chiến dịch:
- Tổ chức đã xác minh có thể chạy tối đa 5 chiến dịch đồng thời.
- Dashboard tổ chức hiển thị tổng quan tất cả chiến dịch: tiến độ, số tiền, lượt ủng hộ.
- Mỗi chiến dịch có trang quản lý riêng với báo cáo chi tiết.
- Hệ thống gửi thông báo tự động khi chiến dịch sắp kết thúc hoặc đạt mốc quan trọng.`,
      },
    ],
  },
};

function FAQItem({ item, color, isOpen, onToggle }) {
  return (
    <div className={`faq-item${isOpen ? " open" : ""}`} onClick={onToggle}>
      <div className="faq-item__question">
        <div
          className="faq-item__icon"
          style={{ color, background: `${color}15` }}
        >
          {item.icon}
        </div>
        <span className="faq-item__q-text">{item.q}</span>
        <div className={`faq-item__chevron${isOpen ? " open" : ""}`}>
          <FiChevronDown size={18} />
        </div>
      </div>
      <div className="faq-item__answer">
        <div className="faq-item__answer-inner">
          {item.a.split("\n").map((line, i) => (
            <p
              key={i}
              className={
                line.startsWith("•") ? "faq-item__bullet" : "faq-item__text"
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [activeTab, setActiveTab] = useState("user");
  const [openItems, setOpenItems] = useState({ 1: true });

  function toggleItem(id) {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const current = FAQ_DATA[activeTab];

  return (
    <>
      <Header />
      <div className="faq-page">
        {/* Hero */}
        <div className="faq-hero">
          <div className="faq-hero__content">
            <div className="faq-hero__icon">
              <FiHelpCircle size={28} />
              <RiSparklingLine size={16} className="faq-hero__spark" />
            </div>
            <span className="faq-hero__title">Trợ giúp & Hỗ trợ</span>
          </div>
        </div>

        <div className="faq-layout">
          {/* Sidebar */}
          <aside className="faq-sidebar">
            <div className="faq-sidebar__box">
              <div className="faq-sidebar__title">Danh mục</div>
              {Object.entries(FAQ_DATA).map(([key, val]) => (
                <button
                  key={key}
                  className={`faq-sidebar__item${activeTab === key ? " active" : ""}`}
                  style={{ "--cat-color": val.color }}
                  onClick={() => setActiveTab(key)}
                >
                  <span
                    className="faq-sidebar__item-icon"
                    style={{ color: val.color }}
                  >
                    {val.icon}
                  </span>
                  {val.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="faq-main">
            <div className="faq-main__header">
              <div
                className="faq-main__header-icon"
                style={{
                  color: current.color,
                  background: `${current.color}15`,
                }}
              >
                {current.icon}
              </div>
              <div>
                <h2 className="faq-main__title">{current.label}</h2>
                <p className="faq-main__sub">
                  {current.items.length} câu hỏi thường gặp
                </p>
              </div>
            </div>

            <div className="faq-list">
              {current.items.map((item, i) => (
                <FAQItem
                  key={item.id}
                  item={item}
                  color={current.color}
                  isOpen={!!openItems[item.id]}
                  onToggle={() => toggleItem(item.id)}
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
              ))}
            </div>
          </main>
        </div>

        {/* Contact banner */}
        <div className="faq-contact-banner">
          <div className="faq-contact-banner__inner">
            <div className="faq-contact-banner__left">
              <div className="faq-contact-banner__icon">💬</div>
              <div>
                <div className="faq-contact-banner__title">
                  Còn câu hỏi khác?
                </div>
                <div className="faq-contact-banner__sub">
                  Đội ngũ SmartDonate luôn sẵn sàng hỗ trợ bạn 24/7
                </div>
              </div>
            </div>
            <div className="faq-contact-banner__right">
              <a
                href="mailto:support@smartdonate.vn"
                className="faq-contact-banner__item"
              >
                <div className="faq-contact-banner__item-icon">
                  <FiMail size={18} />
                </div>
                <div>
                  <div className="faq-contact-banner__item-label">
                    Email hỗ trợ
                  </div>
                  <div className="faq-contact-banner__item-value">
                    support@smartdonate.vn
                  </div>
                </div>
              </a>
              <div className="faq-contact-banner__divider" />
              <a href="tel:19693702" className="faq-contact-banner__item">
                <div className="faq-contact-banner__item-icon">
                  <FiPhone size={18} />
                </div>
                <div>
                  <div className="faq-contact-banner__item-label">Hotline</div>
                  <div className="faq-contact-banner__item-value">
                    1969 3702
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
