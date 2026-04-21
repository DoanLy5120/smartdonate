import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Form, Input, Button, Checkbox, notification } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { FcGoogle } from "react-icons/fc";
import { loginAPI, loginGoogleAPI } from "../../../api/authService";
import useAuthStore from "../../../store/authStore";
import logo from "../../../assets/logo.png";
import { API_URL } from "../../../api/config";
import "./Login.scss";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const hasVerified = useRef(false);

  useEffect(() => {
    const token = params.get("verify_token");

    if (!token || hasVerified.current) return;

    hasVerified.current = true;

    const verify = async () => {
      try {
        await axios.get(`${API_URL}/verify-register?token=${token}`);

        sessionStorage.setItem("verify_success", "true");

        window.location.replace("/dang-nhap");
      } catch (err) {
        notification.error({
          title: "Xác minh thất bại!",
          description: err.response?.data?.message || "Token không hợp lệ",
        });
      }
    };

    verify();
  }, [params]);

  useEffect(() => {
    const isVerified = sessionStorage.getItem("verify_success");

    if (isVerified) {
      notification.success({
        title: "Xác minh thành công!",
        description: "Bạn có thể đăng nhập ngay bây giờ",
      });

      sessionStorage.removeItem("verify_success");
    }
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const res = await loginAPI({
        email: values.email,
        password: values.password,
      });

      const remember = values.remember;

      if (remember) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("roles", JSON.stringify(res.data.roles));
      } else {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("user", JSON.stringify(res.data.user));
        sessionStorage.setItem("roles", JSON.stringify(res.data.roles));
      }

      setAuth(res.data);

      notification.success({
        message: "Đăng nhập thành công!",
      });

      navigate("/bang-tin");
    } catch (err) {
      notification.error({
        message: "Đăng nhập thất bại!",
        description:
          err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-background">
        <div className="bg-circle bg-circle--1" />
        <div className="bg-circle bg-circle--2" />
        <div className="bg-circle bg-circle--3" />
      </div>

      <div className="auth-container">
        <div className="auth-left">
          <img src={logo} alt="EcoLife Logo" className="logo-image" />
        </div>

        <div className="auth-right">
          <div className="form-card">
            <div className="form-header">
              <span className="form-title">ĐĂNG NHẬP</span>
              <p className="form-subtitle">Nhập thông tin để tiếp tục</p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập địa chỉ email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <div className="remember-row">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Ghi nhớ tôi</Checkbox>
                  </Form.Item>
                  <a href="/quen-mat-khau" className="forgot-link">
                    Quên mật khẩu?
                  </a>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  className="submit-btn"
                >
                  Đăng Nhập
                </Button>
              </Form.Item>

              <div className="divider-text">hoặc</div>

              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  block
                  size="large"
                  className="google-btn"
                  onClick={loginGoogleAPI}
                >
                  <FcGoogle />
                  Đăng nhập bằng tài khoản Google
                </Button>
              </Form.Item>

              <div className="form-footer">
                <span>Bạn chưa có tài khoản? </span>
                <a href="/dang-ky" className="link-highlight">
                  Đăng ký ngay
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
