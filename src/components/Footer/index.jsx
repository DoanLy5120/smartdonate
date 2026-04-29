import { FiFacebook, FiInstagram } from "react-icons/fi";
import logo from "../../assets/logo.png";
import "./styles.scss";

export default function Footer() {
  return (
    <footer className="app-footer full-bleed">
      <div className="app-footer__inner">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <img src={logo} alt="logo" className="app-footer__logoImg" />
          </div>

          <div className="app-footer__col">
            <div className="app-footer__heading">Tổng Quan</div>
            <a className="app-footer__link" href="/chien-dich">
              Chiến dịch
            </a>
            <a className="app-footer__link" href="/bang-tin">
              Bảng tin
            </a>
          </div>

          <div className="app-footer__col">
            <div className="app-footer__heading">Bản đồ chiến dịch</div>
            <a className="app-footer__link" href="/ban-do-cd">
              Chiến dịch địa phương
            </a>
          </div>

          <div className="app-footer__col">
            <div className="app-footer__heading">Hỗ trợ</div>
            <a className="app-footer__link" href="/ho-tro/hoi-dap">
              Hỏi đáp
            </a>
            <a className="app-footer__link" href="/ho-tro/dieu-khoan">
              Điều khoản
            </a>
            <a className="app-footer__link" href="/ho-tro/chinh-sach">
              Chính sách bảo mật
            </a>
          </div>

          <div className="app-footer__col">
            <div className="app-footer__heading">Về chúng tôi</div>
            <div className="app-footer__text">Trụ sở: 123 Đà Nẵng</div>
            <div className="app-footer__text app-footer__text--nowrap">
              Email: smartdonate@gmail.com
            </div>
            <div className="app-footer__text">Hotline: 1969 3702</div>
            <div className="app-footer__social">
              <a
                className="app-footer__socialBtn"
                href="#"
                aria-label="Facebook"
              >
                <FiFacebook size={22} />
              </a>
              <a
                className="app-footer__socialBtn"
                href="#"
                aria-label="Instagram"
              >
                <FiInstagram size={22} />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
