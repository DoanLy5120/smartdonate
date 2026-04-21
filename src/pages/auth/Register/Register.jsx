import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, notification } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { registerAPI, sendOtpAPI } from "../../../api/authService";
import logo from "../../../assets/logo.png";
import "./Register.scss";

export default function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const handleSendOtp = async () => {
    try {
      const values = await form.validateFields(["ho_ten", "e_m", "m_k", "x_n"]);

      setLoadingSendOtp(true);

      await sendOtpAPI({
        ho_ten: values.ho_ten,
        email: values.e_m,
        password: values.m_k,
        confirm_password: values.x_n,
      });

      notification.success({
        message: "Gửi mã thành công",
        description: "Vui lòng kiểm tra email để lấy OTP",
      });
    } catch (err) {
      if (err.errorFields) {
        return;
      }

      notification.error({
        message: "Gửi mã thất bại",
        description: err.response?.data?.message || "Lỗi!",
      });
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoadingRegister(true);

      await registerAPI({
        email: values.e_m,
        otp: values.x_code,
      });

      notification.success({
        message: "Đăng ký thành công",
      });

      setTimeout(() => {
        navigate("/dang-nhap");
      }, 1000);

      form.resetFields();
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại!",
        description: err.response?.data?.message || "Lỗi!",
      });
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div className="auth-page register-page">
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
              <span className="form-title">ĐĂNG KÝ</span>
              <p className="form-subtitle">
                Tham gia cộng đồng thiện nguyện cùng chúng tôi!
              </p>
            </div>

            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="auth-form"
            >
              <Form.Item
                name="ho_ten"
                label="Tên đăng ký"
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng nhập tên đăng ký!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng ký"
                  size="large"
                  autoComplete="new-name"
                />
              </Form.Item>

              <Form.Item
                name="e_m"
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
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="m_k"
                label="Mật khẩu"
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  autoComplete="new-mk"
                />
              </Form.Item>

              <Form.Item
                name="x_n"
                label="Xác nhận mật khẩu"
                dependencies={["m_k"]}
                autoComplete="off"
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("m_k") === value)
                        return Promise.resolve();
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<SafetyOutlined />}
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  autoComplete="new-mk"
                />
              </Form.Item>

              <Form.Item label="Mã xác nhận" required>
                <Input.Group compact style={{ display: "flex" }}>
                  <Form.Item
                    name="x_code"
                    noStyle
                    rules={[
                      { required: true, message: "Vui lòng nhập mã xác nhận!" },
                    ]}
                  >
                    <Input
                      prefix={<KeyOutlined />}
                      placeholder="Nhập mã từ email"
                      size="large"
                      style={{ flex: 3 }}
                      maxLength={8}
                      inputMode="numeric"
                    />
                  </Form.Item>
                  <Button
                    size="large"
                    style={{ flex: 1 }}
                    className="send-code-btn-outline"
                    onClick={handleSendOtp}
                    loading={loadingSendOtp}
                  >
                    Gửi mã
                  </Button>
                </Input.Group>
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject("Bạn phải đồng ý điều khoản!"),
                  },
                ]}
              >
                <Checkbox>
                  Tôi đồng ý với{" "}
                  <a href="/ho-tro/dieu-khoan">Điều khoản dịch vụ</a> và{" "}
                  <a href="/ho-tro/chinh-sach">Chính sách bảo mật</a>
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loadingRegister}
                  className="submit-btn"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              <div className="form-footer">
                <span>Bạn đã có tài khoản? </span>
                <a href="/dang-nhap" className="link-highlight">
                  Đăng nhập
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
