import { useState, useRef, useEffect } from "react";
import { FiChevronRight, FiMenu, FiX, FiArrowUp } from "react-icons/fi";
import Header from "../../../components/Header/index";
import Footer from "../../../components/Footer/index";
import "./Terms.scss";

const SECTIONS = [
  {
    id: "giai-thich",
    title: "Giải Thích Khái Niệm",
    icon: "📖",
    content: [
      {
        heading: null,
        body: `Trong Điều khoản Sử dụng này, các khái niệm dưới đây được hiểu như sau:`,
      },
      {
        heading: "SmartDonate",
        body: `Là nền tảng công nghệ kết nối cộng đồng gây quỹ từ thiện và trao đổi đồ dùng miễn phí, được vận hành bởi Công ty SmartDonate Việt Nam. Nền tảng sử dụng trí tuệ nhân tạo (AI) để phân tích, ghép nối nhu cầu hỗ trợ với nguồn đóng góp phù hợp.`,
      },
      {
        heading: "Người dùng",
        body: `Là bất kỳ cá nhân, tổ chức nào truy cập và sử dụng các tính năng của SmartDonate, bao gồm: Người ủng hộ (cá nhân đóng góp tiền hoặc vật phẩm), Tổ chức từ thiện (đã được xác minh hoặc chưa), và Người dùng thông thường tham gia tính năng Cho/Nhận.`,
      },
      {
        heading: "Chiến dịch gây quỹ",
        body: `Là dự án từ thiện được tạo ra bởi tổ chức đã xác minh trên nền tảng SmartDonate, nhằm kêu gọi đóng góp tài chính từ cộng đồng để thực hiện mục tiêu nhân đạo cụ thể.`,
      },
      {
        heading: "Tính năng Cho/Nhận",
        body: `Là chức năng cho phép người dùng đăng bài trao tặng hoặc nhận đồ dùng miễn phí trong cộng đồng. AI SmartDonate sẽ tự động phân tích và ghép nối các bài đăng phù hợp dựa trên khu vực địa lý và loại vật phẩm.`,
      },
      {
        heading: "Tổ chức xác minh",
        body: `Là tổ chức từ thiện, doanh nghiệp hoặc nhóm thiện nguyện đã hoàn tất quy trình xác minh danh tính và được SmartDonate cấp huy hiệu xác minh chính thức.`,
      },
    ],
  },
  {
    id: "nguyen-tac",
    title: "Nguyên Tắc Hoạt Động",
    icon: "⚖️",
    content: [
      {
        heading: "Minh bạch và trung thực",
        body: `Tất cả thông tin về chiến dịch, tổ chức, mục tiêu sử dụng quỹ và kết quả thực hiện phải được cung cấp trung thực, chính xác. SmartDonate cam kết công khai toàn bộ giao dịch tài chính trên nền tảng.`,
      },
      {
        heading: "Tôn trọng quyền riêng tư",
        body: `SmartDonate thu thập và xử lý dữ liệu cá nhân theo Chính sách Bảo mật riêng biệt, tuân thủ quy định pháp luật Việt Nam về bảo vệ dữ liệu cá nhân. Người dùng có quyền yêu cầu xem, chỉnh sửa hoặc xóa dữ liệu của mình.`,
      },
      {
        heading: "Trách nhiệm cộng đồng",
        body: `Mọi hoạt động trên SmartDonate phải hướng đến mục đích nhân đạo, không vụ lợi. Người dùng có trách nhiệm sử dụng nền tảng một cách có đạo đức và tôn trọng các thành viên khác trong cộng đồng.`,
      },
      {
        heading: "Ứng dụng AI có trách nhiệm",
        body: `Hệ thống AI của SmartDonate được thiết kế để hỗ trợ, không thay thế quyết định của con người. Mọi đề xuất ghép nối hay phân tích từ AI chỉ mang tính tham khảo; người dùng hoàn toàn tự quyết định các hành động của mình.`,
      },
      {
        heading: "Không phân biệt đối xử",
        body: `SmartDonate không cho phép bất kỳ hình thức phân biệt đối xử nào dựa trên giới tính, tôn giáo, dân tộc, độ tuổi, hoặc hoàn cảnh kinh tế. Mọi người đều có quyền tiếp cận và sử dụng nền tảng bình đẳng.`,
      },
    ],
  },
  {
    id: "hanh-vi-bi-cam",
    title: "Các Hành Vi Bị Cấm",
    icon: "🚫",
    highlight: true,
    content: [
      {
        heading: "Gian lận và lừa đảo",
        body: `Nghiêm cấm việc tạo chiến dịch gây quỹ với mục đích gian lận, cung cấp thông tin sai lệch về tổ chức hoặc mục tiêu sử dụng quỹ, mạo danh tổ chức từ thiện khác, hoặc sử dụng hình ảnh và nội dung giả mạo.`,
      },
      {
        heading: "Lạm dụng tính năng Cho/Nhận",
        body: `Cấm đăng bài nhằm mục đích thương mại, buôn bán đồ vật lấy tiền, hoặc thu phí dưới bất kỳ hình thức nào. Tính năng Cho/Nhận chỉ dành cho việc trao tặng và nhận đồ dùng hoàn toàn miễn phí.`,
      },
      {
        heading: "Nội dung vi phạm pháp luật",
        body: `Cấm đăng tải nội dung kích động thù hận, phân biệt chủng tộc, khiêu dâm, bạo lực, hoặc bất kỳ nội dung nào vi phạm pháp luật Việt Nam. SmartDonate có quyền xóa nội dung và khóa tài khoản vi phạm mà không cần thông báo trước.`,
      },
      {
        heading: "Thao túng hệ thống AI",
        body: `Cấm cố tình cung cấp thông tin sai lệch nhằm thao túng kết quả ghép nối của AI, tạo tài khoản ảo để tăng uy tín giả tạo, hoặc sử dụng bot/phần mềm tự động để tương tác với nền tảng.`,
      },
      {
        heading: "Vi phạm quyền riêng tư",
        body: `Cấm thu thập, chia sẻ hoặc sử dụng thông tin cá nhân của người dùng khác mà không có sự đồng ý. Cấm chụp ảnh màn hình cuộc trò chuyện riêng tư để chia sẻ công khai.`,
      },
    ],
  },
  {
    id: "chien-dich",
    title: "Chiến Dịch Gây Quỹ",
    icon: "🎯",
    content: [
      {
        heading: "Điều kiện tạo chiến dịch",
        body: `Chỉ tổ chức đã hoàn tất xác minh danh tính mới được tạo chiến dịch gây quỹ. Mỗi tài khoản tổ chức được phép chạy tối đa 5 chiến dịch đồng thời. Thông tin chiến dịch phải đầy đủ, trung thực và có thể kiểm chứng.`,
      },
      {
        heading: "Phí nền tảng",
        body: `SmartDonate thu phí vận hành 3% trên tổng số tiền quyên góp được. Phí này được dùng để duy trì hệ thống, phát triển tính năng và đảm bảo an toàn giao dịch. Toàn bộ phí nền tảng được công khai minh bạch trong báo cáo tài chính hàng năm.`,
      },
      {
        heading: "Quy trình rút tiền",
        body: `Tổ chức có thể yêu cầu rút tiền sau khi chiến dịch kết thúc hoặc định kỳ hàng tháng. Thời gian xử lý từ 1–3 ngày làm việc. SmartDonate có quyền tạm giữ thanh toán nếu phát hiện dấu hiệu gian lận trong chiến dịch.`,
      },
      {
        heading: "Chính sách hoàn tiền",
        body: `Nếu chiến dịch không đạt mục tiêu trong thời hạn quy định, 100% tiền ủng hộ sẽ được hoàn lại cho người đóng góp trong vòng 3–7 ngày làm việc. Nếu chiến dịch bị hủy bởi tổ chức, quy trình hoàn tiền tương tự được áp dụng.`,
      },
      {
        heading: "Báo cáo và minh bạch",
        body: `Tổ chức có nghĩa vụ cập nhật tiến độ dự án ít nhất 1 lần/tháng, nộp báo cáo tài chính cuối chiến dịch kèm chứng từ chi tiêu, và đăng hình ảnh thực tế từ dự án. Vi phạm nghĩa vụ báo cáo dẫn đến tạm dừng tài khoản.`,
      },
    ],
  },
  {
    id: "cho-nhan",
    title: "Tính Năng Cho/Nhận",
    icon: "🎁",
    content: [
      {
        heading: "Nguyên tắc sử dụng",
        body: `Tính năng Cho/Nhận được cung cấp hoàn toàn miễn phí nhằm thúc đẩy tinh thần sẻ chia trong cộng đồng. Mọi giao dịch vật phẩm phải được thực hiện miễn phí, không thu bất kỳ khoản tiền nào từ người nhận.`,
      },
      {
        heading: "Trách nhiệm của người đăng bài",
        body: `Người đăng bài có trách nhiệm mô tả trung thực tình trạng vật phẩm, cung cấp hình ảnh thực tế, và thực hiện đúng cam kết trao tặng. Không đăng bài rồi bỏ qua liên hệ từ người nhận quan tâm.`,
      },
      {
        heading: "Vai trò của AI SmartDonate",
        body: `Hệ thống AI phân tích nội dung bài đăng, khu vực địa lý và loại vật phẩm để gợi ý ghép nối phù hợp. Điểm khớp được hiển thị dưới dạng phần trăm (%) mang tính tham khảo. SmartDonate không đảm bảo tính chính xác tuyệt đối của AI.`,
      },
      {
        heading: "Giải quyết tranh chấp",
        body: `SmartDonate đóng vai trò trung gian hỗ trợ giải quyết tranh chấp giữa người cho và người nhận. Tuy nhiên, SmartDonate không chịu trách nhiệm pháp lý về chất lượng, an toàn của vật phẩm được trao tặng.`,
      },
    ],
  },
  {
    id: "to-chuc",
    title: "Dành Cho Tổ Chức Từ Thiện",
    icon: "🏛️",
    content: [
      {
        heading: "Quy trình xác minh",
        body: `Để được cấp huy hiệu tổ chức xác minh, cần nộp: Giấy phép hoạt động hợp lệ, thông tin tài khoản ngân hàng chính thức, hồ sơ giới thiệu tổ chức. Đội ngũ SmartDonate xét duyệt trong 3–5 ngày làm việc.`,
      },
      {
        heading: "Quyền và trách nhiệm",
        body: `Tổ chức xác minh có quyền tạo chiến dịch gây quỹ, tiếp cận báo cáo phân tích nâng cao, và nhận hỗ trợ ưu tiên từ đội ngũ SmartDonate. Đổi lại, tổ chức phải tuân thủ nghĩa vụ báo cáo và duy trì uy tín hoạt động.`,
      },
      {
        heading: "Chấm dứt xác minh",
        body: `SmartDonate có quyền thu hồi trạng thái xác minh nếu tổ chức vi phạm điều khoản, không nộp báo cáo đúng hạn, hoặc có khiếu nại nghiêm trọng từ cộng đồng. Quyết định này có thể kháng nghị trong vòng 15 ngày làm việc.`,
      },
      {
        heading: "Bảo vệ thương hiệu",
        body: `Tổ chức không được sử dụng logo, tên thương hiệu SmartDonate cho mục đích ngoài nền tảng mà không có sự cho phép bằng văn bản. SmartDonate bảo lưu mọi quyền sở hữu trí tuệ liên quan đến nền tảng.`,
      },
    ],
  },
  {
    id: "nguoi-ung-ho",
    title: "Dành Cho Người Ủng Hộ",
    icon: "❤️",
    content: [
      {
        heading: "Quyền của người ủng hộ",
        body: `Người ủng hộ có quyền: Theo dõi tiến độ sử dụng quỹ sau khi đóng góp, yêu cầu hoàn tiền theo chính sách quy định, báo cáo chiến dịch có dấu hiệu gian lận, và nhận thông báo định kỳ về kết quả chiến dịch đã ủng hộ.`,
      },
      {
        heading: "Bảo mật thanh toán",
        body: `Mọi giao dịch trên SmartDonate được mã hóa theo tiêu chuẩn SSL/TLS. SmartDonate không lưu trữ thông tin thẻ ngân hàng của người dùng. Mọi khoản thanh toán được xử lý thông qua cổng thanh toán được cấp phép.`,
      },
      {
        heading: "Giới hạn trách nhiệm",
        body: `SmartDonate đóng vai trò là nền tảng trung gian kết nối. Trong trường hợp tổ chức gây quỹ vi phạm cam kết, SmartDonate sẽ hỗ trợ tối đa trong khả năng để bảo vệ quyền lợi người ủng hộ, bao gồm hỗ trợ hoàn tiền và báo cáo cơ quan chức năng.`,
      },
      {
        heading: "Chứng nhận đóng góp",
        body: `Sau mỗi lần ủng hộ, SmartDonate cấp chứng nhận đóng góp điện tử có thể tải về. Chứng nhận này ghi rõ số tiền, tên chiến dịch, tổ chức nhận và thời gian giao dịch, có thể sử dụng cho mục đích khai thuế (nếu phù hợp quy định pháp luật).`,
      },
    ],
  },
  {
    id: "duy-tri",
    title: "Duy Trì Dịch Vụ",
    icon: "⚙️",
    content: [
      {
        heading: "Tính khả dụng của dịch vụ",
        body: `SmartDonate cam kết duy trì dịch vụ hoạt động 99.5% thời gian trong năm. Các đợt bảo trì định kỳ sẽ được thông báo trước ít nhất 24 giờ. SmartDonate không chịu trách nhiệm về thiệt hại phát sinh do sự cố ngoài tầm kiểm soát (thiên tai, tấn công mạng quy mô lớn).`,
      },
      {
        heading: "Cập nhật và thay đổi",
        body: `SmartDonate có quyền cập nhật, thay đổi hoặc ngừng cung cấp bất kỳ tính năng nào với thông báo trước 7 ngày. Các thay đổi quan trọng về điều khoản sẽ được thông báo qua email và hiển thị nổi bật trên nền tảng.`,
      },
      {
        heading: "Sao lưu và khôi phục dữ liệu",
        body: `Dữ liệu người dùng được sao lưu tự động hàng ngày và lưu trữ trong vòng 90 ngày. Trong trường hợp mất dữ liệu do lỗi hệ thống, SmartDonate cam kết khôi phục dữ liệu tối đa có thể trong vòng 48 giờ.`,
      },
      {
        heading: "Chấm dứt tài khoản",
        body: `SmartDonate có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản sử dụng. Người dùng có quyền tự xóa tài khoản bất kỳ lúc nào. Dữ liệu cá nhân sẽ được xóa hoàn toàn sau 30 ngày kể từ ngày yêu cầu, trừ dữ liệu giao dịch phải lưu theo quy định pháp luật.`,
      },
    ],
  },
  {
    id: "quy-dinh-khac",
    title: "Quy Định Khác",
    icon: "📋",
    content: [
      {
        heading: "Luật áp dụng",
        body: `Điều khoản Sử dụng này được điều chỉnh và giải thích theo pháp luật Việt Nam. Mọi tranh chấp phát sinh từ việc sử dụng SmartDonate sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Thành phố Đà Nẵng.`,
      },
      {
        heading: "Sở hữu trí tuệ",
        body: `Toàn bộ nội dung, giao diện, mã nguồn, thuật toán AI và thương hiệu SmartDonate thuộc quyền sở hữu của Công ty SmartDonate Việt Nam. Người dùng không được sao chép, phân phối hoặc sử dụng bất kỳ tài sản trí tuệ nào của SmartDonate mà không có phép.`,
      },
      {
        heading: "Điều khoản có thể tách rời",
        body: `Nếu bất kỳ điều khoản nào trong văn bản này bị tuyên bố vô hiệu bởi cơ quan có thẩm quyền, các điều khoản còn lại vẫn có hiệu lực đầy đủ. SmartDonate sẽ thay thế điều khoản vô hiệu bằng điều khoản hợp lệ tương đương gần nhất.`,
      },
      {
        heading: "Liên hệ và khiếu nại",
        body: `Mọi thắc mắc, khiếu nại liên quan đến Điều khoản Sử dụng vui lòng liên hệ: Email: legal@smartdonate.vn | Hotline: 1969 3702 | Địa chỉ: 123 Phan Châu Trinh, Hải Châu, Đà Nẵng. Thời gian phản hồi: trong vòng 3 ngày làm việc.`,
      },
      {
        heading: "Hiệu lực",
        body: `Điều khoản Sử dụng này có hiệu lực từ ngày 01/01/2025 và thay thế toàn bộ các phiên bản trước đó. Bằng cách tiếp tục sử dụng SmartDonate sau khi điều khoản được cập nhật, bạn đồng ý ràng buộc bởi phiên bản điều khoản mới nhất.`,
      },
    ],
  },
];

export default function Terms() {
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
      <div className="terms-page">
        {/* Hero */}
        <div className="terms-hero">
          <div className="terms-hero__content">
           <h1 className="terms-hero__title">Điều Khoản Sử Dụng</h1>
            <div className="terms-hero__notice">
              Bằng cách sử dụng SmartDonate, bạn đồng ý với toàn bộ các điều
              khoản dưới đây.
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="terms-menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? <FiX size={18} /> : <FiMenu size={18} />}
          <span>Mục lục</span>
        </button>

        <div className="terms-layout">
          {/* Sidebar */}
          <aside className={`terms-sidebar${showMenu ? " open" : ""}`}>
            <div className="terms-sidebar__box">
              <div className="terms-sidebar__title">📑 Mục Lục</div>
              <nav className="terms-nav">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    className={`terms-nav__item${activeSection === s.id ? " active" : ""}${s.highlight ? " danger" : ""}`}
                    onClick={() => scrollTo(s.id)}
                  >
                    <span className="terms-nav__icon">{s.icon}</span>
                    <span className="terms-nav__label">{s.title}</span>
                    {activeSection === s.id && (
                      <FiChevronRight size={13} className="terms-nav__arrow" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="terms-main">
            <div className="terms-intro">
              Chào mừng bạn đến với <strong>SmartDonate</strong> — nền tảng kết
              nối cộng đồng gây quỹ từ thiện và trao đổi đồ dùng miễn phí, ứng
              dụng AI để tối ưu hóa việc phân bổ nguồn lực thiện nguyện. Vui
              lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng dịch vụ.
            </div>

            {SECTIONS.map((section, si) => (
              <div
                key={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className={`terms-section${section.highlight ? " terms-section--danger" : ""}`}
                style={{ animationDelay: `${si * 0.05}s` }}
              >
                <div className="terms-section__header">
                  <span className="terms-section__icon">{section.icon}</span>
                  <h2 className="terms-section__title">{section.title}</h2>
                </div>

                <div className="terms-section__body">
                  {section.content.map((block, bi) => (
                    <div key={bi} className="terms-block">
                      {block.heading && (
                        <h3 className="terms-block__heading">
                          <span className="terms-block__heading-dot" />
                          {block.heading}
                        </h3>
                      )}
                      <div className="terms-block__body">
                        {block.body.split("\n").map((line, li) => (
                          <p
                            key={li}
                            className={
                              line.startsWith("•")
                                ? "terms-block__bullet"
                                : "terms-block__text"
                            }
                          >
                            {line.startsWith("•") ? (
                              <>
                                <span className="terms-block__bullet-dot">
                                  •
                                </span>
                                {line.slice(1)}
                              </>
                            ) : (
                              line
                            )}
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

        {/* Scroll to top */}
        {showScrollTop && (
          <button
            className="terms-scroll-top"
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
