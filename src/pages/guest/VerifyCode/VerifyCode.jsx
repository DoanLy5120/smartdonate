import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifyCode.scss";

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Verify:", code);
    navigate("/reset-password");
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-left">
          <img src="https://www.profiledep.com/Uploads/images/logo-la-cay.jpg" alt="Smart Donate" style={{ maxWidth: "280px" }} />
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2 className="auth-title">Xác nhận tài khoản</h2>
            <p className="auth-desc">
              Chúng tôi đã gửi mã qua email. Hãy nhập mã đó để xác nhận tài khoản
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" placeholder="Nhập mã xác thực" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
              <button type="submit" className="btn-green" style={{ marginBottom: 12 }}>tiếp tục</button>
              <button type="button" className="btn-outline">nhận lại mã</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}