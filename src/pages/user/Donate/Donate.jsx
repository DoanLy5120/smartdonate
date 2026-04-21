import { useState } from "react";
import { notification } from "antd";
import { useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiUser,
  FiMessageSquare,
  FiDollarSign,
  FiCheckCircle,
  FiExternalLink,
} from "react-icons/fi";
import { RiSparklingLine } from "react-icons/ri";
import momo from "../../../assets/user/momo.png";
import vnpay from "../../../assets/user/vnpay.jpg";
import useDonateStore from "../../../store/donateStore";
import useUserStore from "../../../store/authStore";
import "./Donate.scss";

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const STEPS = [
  { id: 1, label: "Phương thức" },
  { id: 2, label: "Thông tin" },
];

function formatVnd(n) {
  return Number(n).toLocaleString("vi-VN");
}

export default function DonatePage() {
  const { id } = useParams();
  const { handleDonate, loading } = useDonateStore();
  const { user } = useUserStore();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("momo");
  const [amount, setAmount] = useState(200000);
  const [customAmt, setCustomAmt] = useState("200.000");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const donor = user?.ho_ten || "";

  function selectPreset(val) {
    setAmount(val);
    setCustomAmt(val.toLocaleString("vi-VN"));
  }

  function handleCustomChange(e) {
    const raw = e.target.value.replace(/\D/g, "");

    const num = Number(raw);

    if (!raw) {
      setCustomAmt("");
      setAmount(0);
      return;
    }

    setCustomAmt(num.toLocaleString("vi-VN"));
    setAmount(num);
  }

  function validateStep2() {
    const e = {};
    if (!amount || amount < 10000) e.amount = "Số tiền tối thiểu là 10.000 VNĐ";
    if (!donor) e.donor = "Không lấy được tên người dùng";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function next() {
    // STEP 1
    if (step === 1) {
      setErrors({});
      setStep(2);
      return;
    }

    // STEP 2
    if (step === 2) {
      if (!validateStep2()) return;
      setErrors({});

      try {
        const res = await handleDonate({
          chien_dich_gay_quy_id: id,
          so_tien: amount,
          phuong_thuc_thanh_toan: payMethod,
          noi_dung: message,
        });

        const url = res?.payment_url || res?.data?.payment_url;

        if (url) {
          notification.info({
            message: "Đang chuyển đến cổng thanh toán...",
          });

          setTimeout(() => {
            window.location.href = url;
          }, 500);
        } else {
          notification.error({
            message: "Không lấy được link thanh toán",
          });
        }
      } catch (err) {
        notification.error({
          message: "Lỗi ủng hộ",
          description: err?.response?.data?.message || "Có lỗi xảy ra",
        });
      }

      return;
    }
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
  }

  return (
    <div className="dp-page">
      <div className="dp-card">
        <div className="dp-card__hero">
          <h1 className="dp-card__title">Quyên góp</h1>
          <p className="dp-card__sub">
            <RiSparklingLine size={13} /> Mỗi đóng góp đều tạo nên sự khác biệt
          </p>
        </div>

        {/* Stepper */}
        <div className="dp-stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="dp-stepper__item">
              {i > 0 && (
                <div className={`dp-stepper__line${step > i ? " done" : ""}`} />
              )}
              <div
                className={`dp-stepper__dot${step === s.id ? " active" : ""}${step > s.id ? " done" : ""}`}
              >
                {step > s.id ? <FiCheck size={13} /> : s.id}
              </div>
              <span
                className={`dp-stepper__label${step === s.id ? " active" : ""}`}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`dp-stepper__line${step > s.id ? " done" : ""}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="dp-body">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="dp-step dp-step--1">
              <div className="dp-section-label">
                Chọn phương thức thanh toán
              </div>

              <div className="dp-method-select">
                <button
                  className={`dp-method-card${payMethod === "momo" ? " active" : ""}`}
                  onClick={() => setPayMethod("momo")}
                >
                  <div className="dp-method-card__icon">
                    <img src={momo} />
                  </div>
                  <div className="dp-method-card__body">
                    <div className="dp-method-card__name">MoMo</div>
                    <div className="dp-method-card__desc">
                      Thanh toán qua ví MoMo
                    </div>
                  </div>
                  <div
                    className={`dp-method-card__radio${payMethod === "momo" ? " checked" : ""}`}
                  >
                    {payMethod === "momo" && (
                      <div className="dp-method-card__radio-dot" />
                    )}
                  </div>
                </button>

                <button
                  className={`dp-method-card${payMethod === "vnpay" ? " active" : ""}`}
                  onClick={() => setPayMethod("vnpay")}
                >
                  <div className="dp-method-card__icon dp-method-card__icon--vnpay">
                    <img src={vnpay} />
                  </div>
                  <div className="dp-method-card__body">
                    <div className="dp-method-card__name">VNPay</div>
                    <div className="dp-method-card__desc">
                      Thanh toán qua cổng VNPay / thẻ nội địa
                    </div>
                  </div>
                  <div
                    className={`dp-method-card__radio${payMethod === "vnpay" ? " checked" : ""}`}
                  >
                    {payMethod === "vnpay" && (
                      <div className="dp-method-card__radio-dot" />
                    )}
                  </div>
                </button>
              </div>

              <div
                className={`dp-method-badge${payMethod === "vnpay" ? " vnpay" : ""}`}
              >
                {payMethod === "momo" ? (
                  <>
                    <FiExternalLink size={14} /> Bạn sẽ được chuyển đến ví MoMo
                    để thanh toán
                  </>
                ) : (
                  <>
                    <FiExternalLink size={14} /> Bạn sẽ được chuyển đến trang
                    VNPay để thanh toán
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="dp-step dp-step--2">
              <div className="dp-section-label">Thông tin chuyển khoản</div>

              <div className="dp-presets">
                {PRESET_AMOUNTS.map((v) => (
                  <button
                    key={v}
                    className={`dp-preset${amount === v ? " active" : ""}`}
                    onClick={() => selectPreset(v)}
                  >
                    {formatVnd(v)}đ
                  </button>
                ))}
              </div>

              <div className="dp-field">
                <label className="dp-field__label">Số tiền quyên góp</label>
                <div className="dp-field__wrap">
                  <FiDollarSign size={16} className="dp-field__icon" />
                  <input
                    className={`dp-field__input${errors.amount ? " error" : ""}`}
                    value={customAmt}
                    onChange={handleCustomChange}
                    placeholder="Nhập số tiền..."
                  />
                  <span className="dp-field__suffix">VNĐ</span>
                </div>
                {errors.amount && (
                  <span className="dp-field__error">{errors.amount}</span>
                )}
              </div>

              <div className="dp-field">
                <label className="dp-field__label">
                  Tên người chuyển khoản
                </label>
                <div className="dp-field__wrap">
                  <FiUser size={16} className="dp-field__icon" />
                  <input className="dp-field__input" value={donor} readOnly />
                </div>
                {errors.donor && (
                  <span className="dp-field__error">{errors.donor}</span>
                )}
              </div>

              <div className="dp-field">
                <label className="dp-field__label">
                  Nội dung chuyển khoản{" "}
                  <span className="dp-field__optional">
                    (nhập mã đã lấy trong chiến dịch)
                  </span>
                </label>
                <div className="dp-field__wrap">
                  <FiMessageSquare size={16} className="dp-field__icon" />
                  <input
                    className="dp-field__input"
                    placeholder="Lời nhắn hoặc để trống dùng mã tự động"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
              </div>

              {amount >= 10000 && (
                <div className="dp-amount-preview">
                  <span>Bạn sẽ quyên góp</span>
                  <strong>{formatVnd(amount)} VNĐ</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="dp-actions">
          <button
            className="dp-btn dp-btn--primary"
            onClick={next}
            disabled={loading}
          >
            {step === 2 ? (
              <>
                {loading ? "Đang chuyển hướng..." : "Thanh toán"}{" "}
                <FiExternalLink size={16} />
              </>
            ) : (
              <>
                Tiếp tục <FiArrowRight size={16} />
              </>
            )}
          </button>
          {step > 1 && (
            <button className="dp-btn dp-btn--ghost" onClick={back}>
              <FiArrowLeft size={14} /> Quay lại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
