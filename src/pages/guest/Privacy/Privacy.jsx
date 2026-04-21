import { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiMenu, FiX, FiArrowUp } from "react-icons/fi";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import "./Privacy.scss";

const SECTIONS = [
  {
    id: "muc-dich-thu-thap",
    title: "Mục Đích Thu Thập Thông Tin",
    icon: "🎯",
    content: [
      {
        heading: null,
        body: `SmartDonate thu thập thông tin cá nhân của người dùng nhằm mục đích cung cấp dịch vụ tốt nhất và đảm bảo hoạt động nền tảng an toàn, minh bạch.`,
      },
      {
        heading: "Đăng ký và quản lý tài khoản",
        body: `SmartDonate thu thập họ tên, địa chỉ email, số điện thoại và mật khẩu khi bạn tạo tài khoản. Các thông tin này được dùng để xác thực danh tính, bảo mật tài khoản và cho phép bạn đăng nhập vào nền tảng.`,
      },
      {
        heading: "Xử lý giao dịch tài chính",
        body: `Để thực hiện đóng góp và rút tiền, SmartDonate thu thập thông tin thanh toán bao gồm tên chủ tài khoản ngân hàng, số tài khoản và tên ngân hàng. Thông tin thẻ tín dụng/ghi nợ được xử lý trực tiếp qua cổng thanh toán an toàn và không được SmartDonate lưu trữ.`,
      },
      {
        heading: "Xác minh tổ chức từ thiện",
        body: `Đối với các tổ chức đăng ký xác minh, SmartDonate thu thập tài liệu pháp lý bao gồm giấy phép hoạt động, thông tin người đại diện và hồ sơ tổ chức. Việc thu thập này nhằm đảm bảo tính hợp pháp và uy tín của các chiến dịch gây quỹ.`,
      },
      {
        heading: "Tối ưu hoá AI ghép nối",
        body: `Hệ thống AI của SmartDonate phân tích dữ liệu hành vi sử dụng (lịch sử đóng góp, bài đăng Cho/Nhận, khu vực địa lý) để cải thiện độ chính xác của kết quả ghép nối. Dữ liệu này được xử lý dưới dạng ẩn danh và không được dùng để nhận dạng cá nhân.`,
      },
      {
        heading: "Liên lạc và hỗ trợ",
        body: `Khi bạn liên hệ bộ phận hỗ trợ hoặc gửi phản hồi, SmartDonate thu thập nội dung cuộc trao đổi cùng thông tin liên lạc để phản hồi kịp thời và cải thiện chất lượng dịch vụ.`,
      },
      {
        heading: "Phân tích và cải tiến nền tảng",
        body: `SmartDonate thu thập dữ liệu kỹ thuật như địa chỉ IP, loại thiết bị, trình duyệt và hành vi điều hướng nhằm phân tích hiệu suất, phát hiện lỗi và liên tục nâng cấp trải nghiệm người dùng.`,
      },
    ],
  },
  {
    id: "chia-se-thong-tin",
    title: "Chia Sẻ Thông Tin Cá Nhân",
    icon: "🔗",
    content: [
      {
        heading: null,
        body: `SmartDonate cam kết không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn vì mục đích thương mại. Thông tin chỉ được chia sẻ trong các trường hợp sau:`,
      },
      {
        heading: "Đối tác cung cấp dịch vụ",
        body: `SmartDonate hợp tác với các đối tác kỹ thuật (nhà cung cấp dịch vụ thanh toán, lưu trữ đám mây, gửi email) để vận hành nền tảng. Các đối tác này chỉ được tiếp cận thông tin cần thiết và bị ràng buộc bởi hợp đồng bảo mật nghiêm ngặt.`,
      },
      {
        heading: "Tổ chức từ thiện đã xác minh",
        body: `Khi bạn đóng góp cho một chiến dịch, tên và thông tin giao dịch của bạn sẽ được chia sẻ với tổ chức nhận quỹ để xác nhận và phát hành chứng nhận đóng góp. Bạn có thể chọn ẩn danh khi đóng góp trong phần cài đặt tài khoản.`,
      },
      {
        heading: "Yêu cầu pháp lý",
        body: `SmartDonate có thể tiết lộ thông tin cá nhân khi được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam, hoặc khi cần thiết để bảo vệ quyền lợi hợp pháp của SmartDonate và cộng đồng người dùng.`,
      },
      {
        heading: "Chuyển nhượng doanh nghiệp",
        body: `Trong trường hợp sáp nhập, mua lại hoặc bán lại toàn bộ hoặc một phần SmartDonate, thông tin người dùng có thể được chuyển giao cho bên nhận. Người dùng sẽ được thông báo trước ít nhất 30 ngày và có quyền yêu cầu xóa tài khoản.`,
      },
      {
        heading: "Không chia sẻ với bên quảng cáo",
        body: `SmartDonate không chia sẻ, bán hoặc cho thuê dữ liệu cá nhân cho bất kỳ mạng quảng cáo hay bên thứ ba nào vì mục đích tiếp thị. Nền tảng hoàn toàn không hiển thị quảng cáo từ bên ngoài.`,
      },
    ],
  },
  {
    id: "thoi-gian-luu-tru",
    title: "Thời Gian Lưu Trữ Thông Tin",
    icon: "🗓️",
    content: [
      {
        heading: "Thông tin tài khoản đang hoạt động",
        body: `Toàn bộ thông tin cá nhân gắn với tài khoản đang hoạt động được SmartDonate lưu trữ trong suốt thời gian bạn sử dụng dịch vụ. Dữ liệu được bảo vệ bằng mã hóa AES-256 và sao lưu tự động mỗi 24 giờ.`,
      },
      {
        heading: "Sau khi xóa tài khoản",
        body: `Khi bạn yêu cầu xóa tài khoản, thông tin cá nhân sẽ được ẩn khỏi hệ thống ngay lập tức và xóa hoàn toàn sau 30 ngày. Thời gian 30 ngày được duy trì để hỗ trợ khôi phục tài khoản nếu bạn thay đổi quyết định.`,
      },
      {
        heading: "Dữ liệu giao dịch tài chính",
        body: `Thông tin giao dịch (lịch sử đóng góp, rút tiền, chứng nhận quyên góp) được lưu trữ tối thiểu 10 năm theo quy định pháp luật Việt Nam về kế toán và thuế. Dữ liệu này được ẩn danh hóa sau 5 năm kể từ giao dịch.`,
      },
      {
        heading: "Nhật ký hệ thống và bảo mật",
        body: `Nhật ký truy cập và nhật ký bảo mật (log) được lưu trữ trong vòng 12 tháng để phục vụ mục đích phát hiện và điều tra các hành vi gian lận hoặc vi phạm bảo mật. Sau thời hạn này, dữ liệu được xóa tự động.`,
      },
      {
        heading: "Dữ liệu phân tích ẩn danh",
        body: `Dữ liệu hành vi người dùng đã được ẩn danh hóa (không thể truy ngược lại cá nhân) được lưu trữ vô thời hạn nhằm phục vụ nghiên cứu và cải tiến hệ thống AI. Loại dữ liệu này không thuộc phạm vi quyền xóa dữ liệu cá nhân.`,
      },
    ],
  },
  {
    id: "thay-doi-thong-tin",
    title: "Thay Đổi Thông Tin Cá Nhân",
    icon: "✏️",
    content: [
      {
        heading: "Quyền truy cập và chỉnh sửa",
        body: `Bạn có toàn quyền xem và chỉnh sửa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang Cài đặt tài khoản. Các thay đổi về họ tên, địa chỉ email, số điện thoại và ảnh đại diện được áp dụng ngay lập tức.`,
      },
      {
        heading: "Xác minh danh tính khi thay đổi",
        body: `Để bảo vệ tài khoản, một số thay đổi nhạy cảm (như email đăng nhập, số điện thoại liên kết, thông tin ngân hàng) yêu cầu xác minh danh tính qua mã OTP. SmartDonate sẽ gửi mã xác nhận đến phương thức liên lạc hiện tại của bạn.`,
      },
      {
        heading: "Yêu cầu qua bộ phận hỗ trợ",
        body: `Trong trường hợp bạn không thể tự chỉnh sửa thông tin (ví dụ: mất quyền truy cập email), hãy liên hệ bộ phận hỗ trợ tại support@smartdonate.vn. SmartDonate sẽ xác minh và hỗ trợ trong vòng 3 ngày làm việc.`,
      },
      {
        heading: "Xóa dữ liệu cá nhân (Quyền bị lãng quên)",
        body: `Bạn có quyền yêu cầu SmartDonate xóa toàn bộ dữ liệu cá nhân liên quan đến mình. Yêu cầu có thể được gửi qua email legal@smartdonate.vn. SmartDonate sẽ xử lý trong vòng 30 ngày, trừ các dữ liệu phải lưu theo nghĩa vụ pháp lý.`,
      },
      {
        heading: "Phản đối xử lý dữ liệu",
        body: `Bạn có quyền phản đối việc SmartDonate xử lý dữ liệu cá nhân cho một số mục đích cụ thể (như phân tích hành vi, gửi thông báo tiếp thị). Yêu cầu phản đối có thể thực hiện trong Cài đặt tài khoản > Quyền riêng tư.`,
      },
    ],
  },
  {
    id: "thay-doi-chinh-sach",
    title: "Thay Đổi Chính Sách",
    icon: "📝",
    content: [
      {
        heading: "Quyền cập nhật chính sách",
        body: `SmartDonate có quyền cập nhật Chính sách Bảo mật này bất kỳ lúc nào khi cần thiết để phản ánh thay đổi về dịch vụ, công nghệ hoặc quy định pháp luật. Mọi phiên bản cập nhật đều được ghi rõ ngày hiệu lực.`,
      },
      {
        heading: "Thông báo thay đổi quan trọng",
        body: `Đối với các thay đổi ảnh hưởng đáng kể đến quyền lợi người dùng, SmartDonate sẽ thông báo trước ít nhất 15 ngày qua email đã đăng ký và hiển thị thông báo nổi bật trên nền tảng. Người dùng có quyền xem xét và phản hồi trước khi chính sách mới có hiệu lực.`,
      },
      {
        heading: "Thay đổi nhỏ và kỹ thuật",
        body: `Đối với các điều chỉnh nhỏ mang tính làm rõ hoặc kỹ thuật (không ảnh hưởng đến quyền lợi cốt lõi), SmartDonate sẽ cập nhật trực tiếp trên trang này và ghi chú trong mục Lịch sử thay đổi. Không cần thông báo riêng cho từng người dùng.`,
      },
      {
        heading: "Sự đồng ý của người dùng",
        body: `Việc tiếp tục sử dụng SmartDonate sau khi chính sách được cập nhật đồng nghĩa với việc bạn chấp nhận phiên bản chính sách mới nhất. Nếu không đồng ý, bạn có quyền dừng sử dụng dịch vụ và yêu cầu xóa tài khoản.`,
      },
      {
        heading: "Lịch sử phiên bản",
        body: `SmartDonate duy trì lưu trữ tất cả các phiên bản Chính sách Bảo mật trước đây. Bạn có thể yêu cầu xem bất kỳ phiên bản nào bằng cách liên hệ legal@smartdonate.vn. Phiên bản hiện tại có hiệu lực từ ngày 01/01/2025.`,
      },
    ],
  },
  {
    id: "lien-he",
    title: "Liên Hệ & Khiếu Nại",
    icon: "📬",
    content: [
      {
        heading: "Bộ phận Bảo vệ Dữ liệu",
        body: `SmartDonate có đội ngũ chuyên trách về bảo vệ dữ liệu cá nhân (DPO — Data Protection Officer). Mọi thắc mắc, yêu cầu hoặc khiếu nại liên quan đến quyền riêng tư đều được xử lý bởi bộ phận này.`,
      },
      {
        heading: "Thông tin liên hệ",
        body: `Email bảo mật: privacy@smartdonate.vn\nEmail pháp lý: legal@smartdonate.vn\nHotline: 1969 3702 (8:00 – 17:30, Thứ Hai – Thứ Sáu)\nĐịa chỉ: 123 Phan Châu Trinh, Hải Châu, Đà Nẵng\nThời gian phản hồi: trong vòng 3 ngày làm việc.`,
      },
      {
        heading: "Khiếu nại lên cơ quan nhà nước",
        body: `Nếu bạn cho rằng SmartDonate xử lý dữ liệu của bạn không đúng quy định, bạn có quyền khiếu nại đến Cục An toàn thông tin (Bộ Thông tin và Truyền thông) hoặc cơ quan bảo vệ dữ liệu cá nhân có thẩm quyền tại Việt Nam.`,
      },
    ],
  },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [showMenu, setShowMenu] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const sectionRefs = useRef({});

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      for (const s of [...SECTIONS].reverse()) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollTo(id) {
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setActiveSection(id);
    setShowMenu(false);
  }

  return (
    <>
      <Header />
      <div className="privacy-page">
        {/* Hero */}
        <div className="privacy-hero">
          <div className="privacy-hero__content">
            <h1 className="privacy-hero__title">Chính Sách Bảo Mật</h1>
            <div className="privacy-hero__sub">
              SmartDonate cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của
              bạn.
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="privacy-menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <FiX size={18} /> : <FiMenu size={18} />}
          <span>Mục lục</span>
        </button>

        <div className="privacy-layout">
          {/* Sidebar */}
          <aside className={`privacy-sidebar${showMenu ? " open" : ""}`}>
            <div className="privacy-sidebar__box">
              <div className="privacy-sidebar__title">🔐 Mục Lục</div>
              <nav className="privacy-nav">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    className={`privacy-nav__item${activeSection === s.id ? " active" : ""}${s.highlight ? " danger" : ""}`}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className="privacy-nav__icon">{s.icon}</span>
                    <span className="privacy-nav__label">{s.title}</span>
                    {activeSection === s.id && (
                      <FiChevronRight
                        size={13}
                        className="privacy-nav__arrow"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="privacy-main">
            <div className="privacy-intro">
              Chào mừng bạn đến với <strong>SmartDonate</strong>. Chính sách này
              giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ
              thông tin cá nhân của bạn khi sử dụng nền tảng. Vui lòng đọc kỹ
              trước khi tiếp tục sử dụng dịch vụ.
            </div>

            {SECTIONS.map((section, si) => (
              <div
                key={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className={`privacy-section${section.highlight ? " privacy-section--danger" : ""}`}
                style={{ animationDelay: `${si * 0.05}s` }}
              >
                <div className="privacy-section__header">
                  <span className="privacy-section__icon">{section.icon}</span>
                  <h2 className="privacy-section__title">{section.title}</h2>
                </div>

                <div className="privacy-section__body">
                  {section.content.map((block, bi) => (
                    <div key={bi} className="privacy-block">
                      {block.heading && (
                        <h3 className="privacy-block__heading">
                          <span className="privacy-block__heading-dot" />
                          {block.heading}
                        </h3>
                      )}
                      <div className="privacy-block__body">
                        {block.body.split("\n").map((line, li) => (
                          <p key={li} className="privacy-block__text">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </div>

        {showScrollTop && (
          <button
            className="privacy-scroll-top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <FiArrowUp size={18} />
          </button>
        )}
      </div>
      <Footer />
    </>
  );
}
