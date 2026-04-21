import { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import {
  MailOutlined,
  SafetyOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import logo from "../../../assets/logo.png";
import useAuthStore from "../../../store/authStore";
import "./Forgot.scss";

const STEPS = ["Nhập email", "Xác nhận mã", "Đặt mật khẩu"];

export default function ForgotPassword() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const { forgotPassword, resetPassword } = useAuthStore();

  const handleStep0 = async (values) => {
    try {
      setLoading(true);

      await forgotPassword(values.email);

      notification.success({
        message: "Thành công",
        description: "Đã gửi mã OTP qua email, vui lòng kiểm tra",
      });

      setEmail(values.email);
      setStep(1);
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.response?.data?.message || "Gửi OTP thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStep1 = async (values) => {
    setOtp(values.otp);
    setStep(2);
  };

  const handleStep2 = async (values) => {
    try {
      setLoading(true);

      if (values.newPassword !== values.confirmPassword) {
        notification.error({
          message: "Lỗi",
          description: "Mật khẩu không khớp",
        });
        return;
      }

      await resetPassword({
        email,
        otp,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      });

      setStep(3);
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.response?.data?.message || "Đặt lại mật khẩu thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await forgotPassword(email);
      notification.success({ message: "Đã gửi lại mã" });
    } catch (err) {
      notification.error({
        message: err.response?.data?.message || "Lỗi",
      });
    }
  };

  const stepConfigs = [
    {
      title: "Quên mật khẩu",
      subtitle:
        "Nhập địa chỉ email của bạn. Chúng tôi sẽ gửi cho bạn mã xác thực để truy cập lại vào tài khoản",
    },
    {
      title: "Xác nhận tài khoản",
      subtitle: `Chúng tôi đã gửi mã qua email. Hãy nhập mã đó để xác nhận tài khoản`,
    },
    {
      title: "Thay đổi mật khẩu",
      subtitle: "Đặt mật khẩu mới cho tài khoản của bạn",
    },
  ];

  const config = step < 3 ? stepConfigs[step] : null;

  return (
    <div className="auth-page forgot-page">
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
            {step < 3 ? (
              <>
                <div className="form-header">
                  <div className="form-badge">{config.badge}</div>
                  <h1 className="form-title">{config.title}</h1>
                  <p className="form-subtitle">{config.subtitle}</p>
                </div>

                {step === 0 && (
                  <Form
                    onFinish={handleStep0}
                    layout="vertical"
                    className="auth-form"
                  >
                    <Form.Item
                      name="email"
                      label="Địa chỉ email"
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
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        loading={loading}
                        className="submit-btn"
                      >
                        Tiếp tục
                      </Button>
                    </Form.Item>
                  </Form>
                )}

                {step === 1 && (
                  <Form
                    onFinish={handleStep1}
                    layout="vertical"
                    className="auth-form"
                  >
                    <div className="email-hint">
                      <MailOutlined />
                      <span>
                        Đã gửi mã đến <strong>{email}</strong>
                      </span>
                    </div>
                    <Form.Item
                      name="otp"
                      label="Mã xác thực"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mã xác thực!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<SafetyOutlined />}
                        placeholder="Nhập mã xác thực"
                        size="large"
                        maxLength={6}
                      />
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
                        Tiếp tục
                      </Button>
                    </Form.Item>
                    <div className="resend-row">
                      Không nhận được mã?{" "}
                      <button
                        type="button"
                        className="resend-btn"
                        onClick={handleResend}
                      >
                        nhận lại mã
                      </button>
                    </div>
                  </Form>
                )}

                {step === 2 && (
                  <Form
                    onFinish={handleStep2}
                    layout="vertical"
                    className="auth-form"
                    autoComplete="new-password"
                  >
                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu mới!",
                        },
                        { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Nhập mật khẩu mới"
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      name="confirmPassword"
                      label="Xác nhận mật khẩu"
                      dependencies={["newPassword"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận mật khẩu!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            )
                              return Promise.resolve();
                            return Promise.reject(
                              new Error("Mật khẩu không khớp!"),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Nhập lại mật khẩu mới"
                        size="large"
                      />
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
                        Xác nhận
                      </Button>
                    </Form.Item>
                  </Form>
                )}
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon">
                  <CheckCircleOutlined />
                </div>
                <h2>Thành công!</h2>
                <p>
                  Mật khẩu của bạn đã được thay đổi thành công. Bạn có thể đăng
                  nhập ngay bây giờ.
                </p>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="submit-btn"
                  onClick={() => (window.location.href = "/dang-nhap")}
                >
                  Đăng nhập ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
