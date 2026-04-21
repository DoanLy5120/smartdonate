import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Popconfirm, notification } from "antd";
import {
  FiX,
  FiUpload,
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiImage,
  FiAlignLeft,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";
import LocationPicker from "../../../components/LocationPicker/index";
import useOrganizationStore from "../../../store/organizationStore";
import "./RegisterOrg.scss";

const LOAI_HINH_OPTIONS = [
  {
    value: "NHA_NUOC",
    label: "Tổ chức nhà nước",
    desc: "Cơ quan, đơn vị nhà nước",
    color: "#1890ff",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m4-14h1m4 0h1m-6 4h1m4 0h1m-5 10v-5h4v5" />
      </svg>
    ),
  },
  {
    value: "QUY_TU_THIEN",
    label: "Quỹ từ thiện",
    desc: "Tổ chức phi lợi nhuận",
    color: "#52c41a",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    value: "DOANH_NGHIEP",
    label: "Doanh nghiệp",
    desc: "Công ty, tập đoàn",
    color: "#fa8c16",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
];

export default function RegisterOrg({ onClose }) {
  const navigate = useNavigate();
  const registerOrganization = useOrganizationStore(
    (s) => s.registerOrganization,
  );
  const fetchStatus = useOrganizationStore((s) => s.fetchOrganizationStatus);
  const status = useOrganizationStore((s) => s.organizationStatus);
  const loadingStatus = useOrganizationStore((s) => s.loadingStatus);
  const loadingRegister = useOrganizationStore((s) => s.loadingRegister);
  const fileRef = useRef(null);
  const logoRef = useRef(null);

  const [form, setForm] = useState({
    ten_to_chuc: "",
    ma_so_thue: "",
    nguoi_dai_dien: "",
    loai_hinh: "",
    mo_ta: "", 
    dia_chi: "", 
    so_dien_thoai: "", 
    lng: null, 
    lat: null, 
  });

  const [file, setFile] = useState(null);
  const [logo, setLogo] = useState(null); 
  const [logoPreview, setLogoPreview] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function handleFile(files) {
    const f = files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setError("File không được vượt quá 10MB");
      return;
    }
    setFile(f);
    setError("");
  }

  function handleLogo(files) {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      notification.warning({ message: "Logo phải là file ảnh!" });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      notification.warning({ message: "Logo không được vượt quá 5MB" });
      return;
    }
    setLogo(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  async function handleSubmit() {
    if (
      !form.ten_to_chuc ||
      !form.ma_so_thue ||
      !form.nguoi_dai_dien ||
      !form.loai_hinh
    ) {
      notification.warning({
        message: "Vui lòng điền đầy đủ các trường bắt buộc!",
      });
      return;
    }
    if (!file) {
      notification.warning({
        message: "Vui lòng tải lên giấy phép hoạt động!",
      });
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerOrganization({
        ...form,
        giay_phep: file,
        logo: logo || undefined
      });
      notification.success({
        message: "Đăng ký thành công! Vui lòng chờ admin duyệt.",
      });
      navigate("/chien-dich");
      onClose();
    } catch (e) {
      const errors = e?.response?.data?.errors;
      if (errors) {
        Object.entries(errors).forEach(([field, errArr]) => {
          notification.warning({
            message: `Lỗi: ${field}`,
            description: errArr[0],
          });
        });
      } else {
        setError(
          e.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  if (loadingStatus) return <div className="rom-modal" />;

  if (status) {
    // ... giữ nguyên phần hiển thị trạng thái
  }

  return (
    <div
      className="rom-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="rom-modal">
        {/* Header — giữ nguyên */}
        <div className="rom-modal__header">
          <div className="rom-modal__header-left">
            <div>
              <div className="rom-modal__header-title">
                Đăng ký tổ chức từ thiện
              </div>
              <div className="rom-modal__header-sub">
                Hoàn tất hồ sơ để được xác minh
              </div>
            </div>
          </div>
        </div>

        <div className="rom-modal__body">
          {/* Steps — cập nhật thành 4 bước */}
          <div className="rom-steps">
            <div className="rom-steps__item rom-steps__item--active">
              <span>1</span> Loại hình
            </div>
            <div className="rom-steps__line" />
            <div
              className={`rom-steps__item${form.loai_hinh ? " rom-steps__item--active" : ""}`}
            >
              <span>2</span> Thông tin
            </div>
            <div className="rom-steps__line" />
            <div
              className={`rom-steps__item${form.dia_chi ? " rom-steps__item--active" : ""}`}
            >
              <span>3</span> Liên hệ
            </div>
            <div className="rom-steps__line" />
            <div
              className={`rom-steps__item${file ? " rom-steps__item--active" : ""}`}
            >
              <span>4</span> Hồ sơ
            </div>
          </div>

          {/* Section 1: Loại hình — giữ nguyên */}
          <div className="rom-section">
            <div className="rom-section__title">
              <div
                className="rom-section__title-bar"
                style={{ background: "#1890ff" }}
              />
              LOẠI HÌNH TỔ CHỨC <span className="rom-required">*</span>
            </div>
            <div className="rom-type-grid">
              {LOAI_HINH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`rom-type-card${form.loai_hinh === opt.value ? " active" : ""}`}
                  style={{ "--c": opt.color }}
                  onClick={() => {
                    setForm({ ...form, loai_hinh: opt.value });
                    setError("");
                  }}
                >
                  <div
                    className="rom-type-card__icon"
                    style={{ background: `${opt.color}15`, color: opt.color }}
                  >
                    {opt.icon}
                  </div>
                  <div className="rom-type-card__info">
                    <div className="rom-type-card__label">{opt.label}</div>
                    <div className="rom-type-card__desc">{opt.desc}</div>
                  </div>
                  {form.loai_hinh === opt.value && (
                    <div
                      className="rom-type-card__check"
                      style={{ background: opt.color }}
                    >
                      <FiCheck size={10} color="#fff" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rom-divider" />

          {/* Section 2: Thông tin + Logo */}
          <div className="rom-section">
            <div className="rom-section__title">
              <div
                className="rom-section__title-bar"
                style={{ background: "#1890ff" }}
              />
              THÔNG TIN TỔ CHỨC
            </div>

            {/* Logo upload */}
            <div className="rom-field">
              <label className="rom-field__label">
                <FiImage size={14} /> Logo tổ chức
                <span
                  style={{
                    color: "#aaa",
                    fontWeight: 400,
                    marginLeft: 6,
                    fontSize: 12,
                  }}
                >
                  (không bắt buộc)
                </span>
              </label>
              <div
                className="rom-logo-upload"
                onClick={() => logoRef.current?.click()}
              >
                {logoPreview ? (
                  <div className="rom-logo-upload__preview">
                    <img src={logoPreview} alt="logo" />
                    <button
                      type="button"
                      className="rom-logo-upload__remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogo(null);
                        setLogoPreview(null);
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="rom-logo-upload__placeholder">
                    <FiImage size={22} />
                    <span>Tải logo lên</span>
                  </div>
                )}
              </div>
              <input
                ref={logoRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleLogo(e.target.files)}
              />
            </div>

            <div className="rom-field">
              <label className="rom-field__label">
                Tên tổ chức <span className="rom-required">*</span>
              </label>
              <input
                className="rom-field__input"
                name="ten_to_chuc"
                value={form.ten_to_chuc}
                onChange={handleChange}
                placeholder="VD: Quỹ từ thiện Ánh Sáng"
              />
            </div>

            <div className="rom-grid-2">
              <div className="rom-field">
                <label className="rom-field__label">
                  Mã số thuế <span className="rom-required">*</span>
                </label>
                <input
                  className="rom-field__input"
                  name="ma_so_thue"
                  value={form.ma_so_thue}
                  onChange={handleChange}
                  placeholder="VD: 1234567899"
                />
              </div>
              <div className="rom-field">
                <label className="rom-field__label">
                  Người đại diện <span className="rom-required">*</span>
                </label>
                <input
                  className="rom-field__input"
                  name="nguoi_dai_dien"
                  value={form.nguoi_dai_dien}
                  onChange={handleChange}
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>
            </div>

            {/* Mô tả */}
            <div className="rom-field">
              <label className="rom-field__label">
                <FiAlignLeft size={14} /> Mô tả tổ chức
              </label>
              <textarea
                className="rom-field__input rom-field__textarea"
                name="mo_ta"
                value={form.mo_ta}
                onChange={handleChange}
                placeholder="Giới thiệu ngắn về tổ chức..."
                rows={3}
              />
            </div>
          </div>

          <div className="rom-divider" />

          {/* Section 3: Liên hệ & Địa chỉ */}
          <div className="rom-section">
            <div className="rom-section__title">
              <div
                className="rom-section__title-bar"
                style={{ background: "#52c41a" }}
              />
              LIÊN HỆ & ĐỊA CHỈ
            </div>

            {/* Số điện thoại */}
            <div className="rom-field">
              <label className="rom-field__label">
                <FiPhone size={14} /> Số điện thoại
              </label>
              <input
                className="rom-field__input"
                name="so_dien_thoai"
                value={form.so_dien_thoai}
                onChange={handleChange}
                placeholder="VD: 0901234567"
                type="tel"
              />
            </div>

            {/* Địa chỉ */}
            <div className="rom-field">
              <label className="rom-field__label">
                <FiMapPin size={14} /> Địa chỉ
              </label>
              <LocationPicker
                value={
                  form.dia_chi
                    ? { address: form.dia_chi, lat: form.lat, lng: form.lng }
                    : null
                }
                onChange={({ address, lat, lng }) =>
                  setForm((prev) => ({ ...prev, dia_chi: address, lat, lng }))
                }
              />
              {form.lat && form.lng && (
                <div className="rom-coords">
                  <FiCheck size={12} color="#52c41a" />
                  {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          <div className="rom-divider" />

          {/* Section 4: Giấy phép — giữ nguyên */}
          <div className="rom-section">
            <div className="rom-section__title">
              <div
                className="rom-section__title-bar"
                style={{ background: "#fa8c16" }}
              />
              GIẤY PHÉP HOẠT ĐỘNG <span className="rom-required">*</span>
            </div>

            {!file ? (
              <div
                className={`rom-upload${dragging ? " dragging" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  handleFile(e.dataTransfer.files);
                }}
              >
                <div className="rom-upload__icon">
                  <FiUpload size={26} />
                </div>
                <div className="rom-upload__text">
                  Kéo thả hoặc nhấn để tải lên
                </div>
                <div className="rom-upload__hint">
                  PDF, JPG, PNG — Tối đa 10MB
                </div>
              </div>
            ) : (
              <div className="rom-file">
                <div className="rom-file__icon">
                  <FiFile size={20} color="#1890ff" />
                </div>
                <div className="rom-file__info">
                  <div className="rom-file__name">{file.name}</div>
                  <div className="rom-file__size">
                    {(file.size / 1024).toFixed(0)} KB
                  </div>
                </div>
                <button
                  type="button"
                  className="rom-file__remove"
                  onClick={() => setFile(null)}
                >
                  <FiX size={14} />
                </button>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files)}
            />

            <div className="rom-upload__info">
              <div className="rom-upload__info-item">
                <FiCheck size={12} color="#52c41a" /> Giấy phép thành lập hoặc
                hoạt động
              </div>
              <div className="rom-upload__info-item">
                <FiCheck size={12} color="#52c41a" /> Quyết định của cơ quan có
                thẩm quyền
              </div>
            </div>
          </div>

          {error && (
            <div className="rom-error">
              <FiAlertCircle size={15} /> {error}
            </div>
          )}
        </div>

        {/* Footer — giữ nguyên */}
        <div className="rom-modal__footer">
          <Popconfirm
            title="Hủy đăng ký tổ chức"
            description="Bạn có chắc muốn hủy? Dữ liệu có thể bị mất!"
            okText="Yes"
            cancelText="No"
            onConfirm={() => navigate("/chien-dich")}
          >
            <button className="rom-btn rom-btn--cancel" onClick={onClose}>
              Hủy
            </button>
          </Popconfirm>
          <button
            className="rom-btn rom-btn--submit"
            onClick={handleSubmit}
            disabled={loadingRegister || loading}
          >
            {loading ? (
              <span className="rom-btn__loading">
                <span className="rom-btn__spinner" /> Đang gửi...
              </span>
            ) : (
              <>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
                Gửi đăng ký
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
