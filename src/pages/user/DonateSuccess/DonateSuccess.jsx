import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiShare2, FiHome, FiCheckCircle, FiX } from "react-icons/fi";
import useDonateStore from "../../../store/donateStore";
import "./DonateSuccess.scss";

function formatVnd(n) {
  return Number(n || 0).toLocaleString("vi-VN");
}

function formatDate(str) {
  if (str) return str;
  const now = new Date();
  return `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} - ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export default function DonateSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [realStatus, setRealStatus] = useState(null);
  const [donateDetail, setDonateDetail] = useState(null);
  const { fetchDonateDetail } = useDonateStore();

  const orderId = searchParams.get("orderId") || searchParams.get("vnp_TxnRef");
  const resultCode = searchParams.get("resultCode");
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");

  const amount = donateDetail?.so_tien || 0;
  const donor = donateDetail?.ho_ten || "Ẩn danh";
  const methodLabel =
    donateDetail?.phuong_thuc_thanh_toan === "momo" ? "MoMo" : "VNPay";
  const txId =
    donateDetail?.gateway_transaction_id ||
    searchParams.get("vnp_TransactionNo") ||
    orderId;
  const campaignId = donateDetail?.chien_dich_id;
  const campaignName = donateDetail?.ten_chien_dich || "—";
  const orgName = donateDetail?.ten_to_chuc || "—";
  const thoiGian = donateDetail?.created_at;

  useEffect(() => {
    async function fetchData() {
      // ===== VNPAY =====
      if (vnpResponseCode) {
        if (vnpResponseCode === "00") {
          try {
            // retry giống MoMo (do BE có thể chưa update kịp)
            for (let i = 0; i < 5; i++) {
              try {
                const data = await fetchDonateDetail(orderId);

                if (data) {
                  setDonateDetail(data);
                  setRealStatus("success");
                  setLoading(false);
                  return;
                }
              } catch {
                // retry
              }

              await new Promise((r) => setTimeout(r, 1000));
            }

            // fallback nếu chưa có data
            setRealStatus("pending");
            setLoading(false);
          } catch {
            setRealStatus("failed");
            setLoading(false);
          }
        } else {
          setRealStatus("failed");
          setLoading(false);
        }

        return;
      }

      // ===== MOMO =====
      if (resultCode) {
        if (resultCode === "0") {
          // thành công → gọi API lấy chi tiết
          try {
            for (let i = 0; i < 5; i++) {
              try {
                const data = await fetchDonateDetail(orderId);

                if (data) {
                  setDonateDetail(data);
                  setRealStatus("success");
                  setLoading(false);
                  return;
                }
              } catch {
                // chưa THANH_CONG → retry
              }

              await new Promise((r) => setTimeout(r, 1000));
            }

            setRealStatus("pending");
            setLoading(false);
          } catch {
            setRealStatus("failed");
            setLoading(false);
          }
        } else {
          setRealStatus("failed");
          setLoading(false);
        }

        return;
      }
    }

    fetchData();
  }, []);

  if (realStatus === "failed") {
    return (
      <div className="ds-page">
        <div className="ds-card">
          <div className="ds-header ds-header--failed">
            <div className="ds-header__icon-wrap">
              <div className="ds-header__icon-circle ds-header__icon-circle--failed">
                <FiX size={24} />
              </div>
            </div>
            <div className="ds-header__title">Thanh toán thất bại</div>
            <div className="ds-header__sub">
              Giao dịch không thành công hoặc đã bị huỷ
            </div>
          </div>
          <div className="ds-actions" style={{ padding: "24px" }}>
            <button
              className="ds-btn ds-btn--outline"
              onClick={() => {
                if (campaignId) {
                  navigate(`/chien-dich/${campaignId}`);
                } else {
                  navigate("/chien-dich");
                }
              }}
            >
              <FiHome size={15} /> Về chiến dịch
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (realStatus === "pending") {
    return (
      <div className="ds-page">
        <div className="ds-card">
          <div className="ds-header">
            <div className="ds-header__title">Đang xử lý giao dịch</div>
            <div className="ds-header__sub">
              Hệ thống đang xác nhận thanh toán, vui lòng chờ thêm
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ds-page">
        <div className="ds-card">
          <div className="ds-header">
            <div className="ds-header__title">Đang xác nhận thanh toán...</div>
            <div className="ds-header__sub">Vui lòng chờ trong giây lát</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-page">
      <div className="ds-card">
        {/* Header */}
        <div className="ds-header">
          <div className="ds-header__icon-wrap">
            <div className="ds-header__ring" />
            <div className="ds-header__ring ds-header__ring--2" />
            <div className="ds-header__icon-circle">
              <FiCheckCircle size={26} />
            </div>
          </div>
          <div className="ds-header__title">Quyên góp thành công</div>
          <div className="ds-header__sub">
            Cảm ơn bạn đã chung tay với cộng đồng
          </div>
        </div>

        {/* Amount */}
        <div className="ds-amount">
          <div className="ds-amount__label">Số tiền đã quyên góp</div>
          <div className="ds-amount__val">
            {formatVnd(amount)}
            <span className="ds-amount__unit">VNĐ</span>
          </div>
          <div className="ds-amount__shimmer" />
        </div>

        <div className="ds-dashed" />

        {/* Thông tin chiến dịch */}
        <div className="ds-section">
          <div className="ds-section__label">Thông tin chiến dịch</div>
          <div className="ds-row">
            <span className="ds-row__key">Chiến dịch</span>
            <span className="ds-row__val">{campaignName}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Tổ chức</span>
            <span className="ds-row__val">{orgName}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Trạng thái</span>
            <span className="ds-row__val">
              <span className="ds-badge ds-badge--success">Đã xác nhận</span>
            </span>
          </div>
        </div>

        <div className="ds-dashed" />

        {/* Thông tin giao dịch */}
        <div className="ds-section">
          <div className="ds-section__label">Thông tin giao dịch</div>
          <div className="ds-row">
            <span className="ds-row__key">Người quyên góp</span>
            <span className="ds-row__val">{donor}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Phương thức</span>
            <span className="ds-row__val">
              <span className="ds-badge ds-badge--info">{methodLabel}</span>
            </span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Mã giao dịch</span>
            <span className="ds-row__val ds-row__val--mono">{txId}</span>
          </div>
          <div className="ds-row">
            <span className="ds-row__key">Thời gian</span>
            <span className="ds-row__val">{formatDate(thoiGian)}</span>
          </div>
        </div>

        <div className="ds-dashed" />

        {/* Thank you */}
        <div className="ds-thank">
          <p className="ds-thank__quote">
            "Mỗi đồng bạn góp hôm nay có thể là bữa cơm ấm, là quyển sách mới,
            là nụ cười của một đứa trẻ ở nơi xa. SmartDonate trân trọng tấm lòng
            của bạn."
          </p>
          <p className="ds-thank__name">— Đội ngũ SmartDonate</p>
        </div>

        {/* Actions */}
        <div className="ds-actions">
          <button
            className="ds-btn ds-btn--outline"
            onClick={() =>
              navigate("/chien-dich", { state: { refresh: true } })
            }
          >
            <FiHome size={15} /> Về trang chủ
          </button>
          <button className="ds-btn ds-btn--primary">
            <FiShare2 size={15} /> Chia sẻ
          </button>
        </div>

        <button className="ds-share-sub">
          <FiShare2 size={13} /> Lan tỏa để thêm nhiều người cùng góp tay
        </button>
      </div>
    </div>
  );
}
