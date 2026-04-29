import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ResetPassword.scss";

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Mật khẩu phải ít nhất 6 ký tự"); return; }
    if (form.password !== form.password_confirmation) { setError("Mật khẩu không khớp"); return; }
    alert("Đổi mật khẩu thành công!");
    navigate("/login");
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-left">
          <img src="https://www.profiledep.com/Uploads/images/logo-la-cay.jpg" alt="Smart Donate" style={{ maxWidth: "280px" }} />
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2 className="auth-title">Thay đổi mật khẩu</h2>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <div className="input-password">
                  <input type={showPass ? "text" : "password"} name="password" placeholder="Nhập mật khẩu mới" value={form.password} onChange={handleChange} required />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-password">
                  <input type={showConfirm ? "text" : "password"} name="password_confirmation" placeholder="Nhập lại mật khẩu mới" value={form.password_confirmation} onChange={handleChange} required />
                  <button type="button" className="toggle-pass" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-green" style={{ marginTop: 8 }}>Xác nhận</button>
            </form>
            <p className="auth-switch">
              Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}