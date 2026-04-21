import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, DatePicker, notification } from "antd";
import {
  FiChevronRight,
  FiChevronLeft,
  FiCheck,
  FiImage,
  FiUpload,
  FiX,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
} from "react-icons/fi";
import LocationPicker from "../../../components/LocationPicker/index";
import useCategories from "../../../hooks/useCategories"; 
import useCampaignStore from "../../../store/campaignStore";
import "./CreateCampaign.scss";

const { TextArea } = Input;

const STEPS = [
  { id: 1, label: "Thông tin" },
  { id: 2, label: "Mục tiêu" },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);

  const { categories } = useCategories();
  const createCampaign = useCampaignStore((s) => s.createCampaign);
  const loadingCreate = useCampaignStore((s) => s.loadingCreate);

  const [form, setForm] = useState({
    ten_chien_dich: "",
    danh_muc_id: "",
    mo_ta: "",
    muc_tieu_tien: "",
    ngay_ket_thuc: null,
    vi_tri: "",
    lat: null,
    lng: null,
  });

  // ── Images ──
  function handleFile(e) {
    const files = Array.from(e.target.files);
    const newImgs = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((prev) => [...prev, ...newImgs]);
    if (!previewImg && newImgs.length) setPreviewImg(newImgs[0].url);
  }

  function removeImage(idx) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (previewImg === prev[idx].url) setPreviewImg(next[0]?.url ?? null);
      return next;
    });
  }

  // ── Validate step 1 ──
  function handleNext() {
    if (!form.ten_chien_dich.trim()) {
      notification.warning({ message: "Vui lòng nhập tên chiến dịch!" });
      return;
    }
    if (!form.danh_muc_id) {
      notification.warning({ message: "Vui lòng chọn danh mục!" });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Submit ──
  async function handleSubmit() {
    if (!form.muc_tieu_tien || Number(form.muc_tieu_tien) <= 0) {
      notification.warning({ message: "Vui lòng nhập mục tiêu tiền hợp lệ!" });
      return;
    }
    if (!form.ngay_ket_thuc) {
      notification.warning({ message: "Vui lòng chọn ngày kết thúc!" });
      return;
    }
    if (!form.lat || !form.lng) {
      notification.warning({ message: "Vui lòng chọn vị trí trên bản đồ!" });
      return;
    }
    if (images.length === 0) {
      notification.warning({ message: "Vui lòng tải lên ít nhất 1 ảnh!" });
      return;
    }

    const formData = new FormData();
    formData.append("ten_chien_dich", form.ten_chien_dich);
    formData.append("danh_muc_id", form.danh_muc_id);
    formData.append("mo_ta", form.mo_ta);
    formData.append("muc_tieu_tien", form.muc_tieu_tien);
    formData.append("ngay_ket_thuc", form.ngay_ket_thuc.format("YYYY-MM-DD")); 
    formData.append("vi_tri", form.vi_tri);
    formData.append("lat", form.lat);
    formData.append("lng", form.lng);
    images.forEach((img) => {
      if (img.file) formData.append("hinh_anh[]", img.file);
    });

    try {
      await createCampaign(formData);
      notification.success({
        message: "Tạo chiến dịch thành công! 🎉",
        description: "Chiến dịch đang chờ admin xét duyệt.",
      });
      navigate("/chien-dich");
    } catch (err) {
      const errors = err?.response?.data?.errors;
      const message = err?.response?.data?.message;
      if (errors) {
        Object.entries(errors).forEach(([field, errArr]) => {
          notification.warning({
            message: `Lỗi: ${field}`,
            description: errArr[0],
          });
        });
      } else if (message) {
        notification.error({ message });
      } else {
        notification.error({
          message: "Tạo chiến dịch thất bại, vui lòng thử lại!",
        });
      }
    }
  }

  return (
    <div className="cc-page">
      <div className="cc-page__header">
        <div className="cc-page__title-wrap">
          <span className="cc-page__title">Tạo Chiến Dịch Từ Thiện</span>
          <span className="cc-page__title-icon">✨</span>
        </div>
        <p className="cc-page__subtitle">
          Chia sẻ yêu thương — Lan tỏa giá trị nhân văn đến cộng đồng
        </p>
      </div>

      {/* Stepper — giữ nguyên */}
      <div className="cc-stepper">
        <div className="cc-stepper__edge" />
        {STEPS.map((s, i) => (
          <div key={s.id} className="cc-stepper__item">
            {i > 0 && (
              <div className={`cc-stepper__line${step > i ? " done" : ""}`} />
            )}
            <div
              className={`cc-stepper__dot${step === s.id ? " active" : ""}${step > s.id ? " done" : ""}`}
            >
              {step > s.id ? <FiCheck size={14} /> : s.id}
            </div>
            <span
              className={`cc-stepper__label${step === s.id ? " active" : ""}`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`cc-stepper__line${step > s.id ? " done" : ""}`}
              />
            )}
          </div>
        ))}
        <div className="cc-stepper__edge" />
      </div>

      <div className="cc-card">
        <div className="cc-card__step-header">
          <span className="cc-card__step-num">Step {step}:</span>
          <span className="cc-card__step-title">
            {step === 1 ? "Thông tin chiến dịch" : "Mục tiêu chiến dịch"}
          </span>
        </div>
        <div className="cc-card__step-desc">
          {step === 1
            ? "Nhập thông tin cơ bản cho chiến dịch từ thiện của bạn"
            : "Đặt mục tiêu quyên góp và thời gian kết thúc cho chiến dịch"}
        </div>
        <div className="cc-card__divider" />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="cc-form cc-form--step1">
            <div className="cc-field">
              <label className="cc-field__label">
                Tên chiến dịch <span className="cc-field__required">*</span>
              </label>
              <Input
                className="cc-field__input"
                placeholder="Nhập tên chiến dịch..."
                value={form.ten_chien_dich}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ten_chien_dich: e.target.value }))
                }
                prefix={<FiInfo size={15} className="cc-field__prefix-icon" />}
              />
            </div>

            {/* Danh mục từ API — render dạng grid card như RegisterOrg */}
            <div className="cc-field">
              <label className="cc-field__label">
                Danh mục <span className="cc-field__required">*</span>
              </label>
              <div className="cc-category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`cc-category-card${form.danh_muc_id === cat.id ? " active" : ""}`}
                    onClick={() =>
                      setForm((p) => ({ ...p, danh_muc_id: cat.id }))
                    }
                  >
                    {cat.hinh_anh && (
                      <img
                        src={cat.hinh_anh}
                        alt={cat.ten_danh_muc}
                        className="cc-category-card__img"
                      />
                    )}
                    <span className="cc-category-card__label">
                      {cat.ten_danh_muc}
                    </span>
                    {form.danh_muc_id === cat.id && (
                      <div className="cc-category-card__check">
                        <FiCheck size={10} color="#fff" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="cc-field">
              <label className="cc-field__label">Mô tả</label>
              <TextArea
                className="cc-field__textarea"
                placeholder="Mô tả chiến dịch..."
                rows={4}
                value={form.mo_ta}
                onChange={(e) =>
                  setForm((p) => ({ ...p, mo_ta: e.target.value }))
                }
                showCount
                maxLength={500}
              />
            </div>

            <div className="cc-field">
              <label className="cc-field__label">
                Hình ảnh <span className="cc-field__required">*</span>
              </label>
              {previewImg ? (
                <div className="cc-upload__preview">
                  <img src={previewImg} alt="preview" />
                  <div className="cc-upload__preview-thumbs">
                    {images.map((img, i) => (
                      <div
                        key={i}
                        className={`cc-upload__thumb${previewImg === img.url ? " active" : ""}`}
                        onClick={() => setPreviewImg(img.url)}
                      >
                        <img src={img.url} alt={img.name} />
                        <button
                          className="cc-upload__thumb-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(i);
                          }}
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                    <div
                      className="cc-upload__thumb cc-upload__thumb--add"
                      onClick={() => fileRef.current?.click()}
                    >
                      <FiUpload size={16} />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="cc-upload__zone"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("dragging");
                  }}
                  onDragLeave={(e) =>
                    e.currentTarget.classList.remove("dragging")
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("dragging");
                    const files = Array.from(e.dataTransfer.files);
                    const newImgs = files.map((f) => ({
                      file: f,
                      url: URL.createObjectURL(f),
                      name: f.name,
                    }));
                    setImages((prev) => [...prev, ...newImgs]);
                    if (newImgs.length) setPreviewImg(newImgs[0].url);
                  }}
                >
                  <div className="cc-upload__zone-icon">
                    <FiImage size={32} />
                  </div>
                  <div className="cc-upload__zone-text">Tải ảnh lên</div>
                  <div className="cc-upload__zone-hint">
                    Kéo thả hoặc click để chọn ảnh
                  </div>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleFile}
              />
            </div>

            <div className="cc-form__actions cc-form__actions--right">
              <Button
                type="primary"
                size="large"
                className="cc-btn cc-btn--next"
                onClick={handleNext}
              >
                Tiếp theo <FiChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="cc-form cc-form--step2">
            <div className="cc-field">
              <label className="cc-field__label">
                Mục tiêu cần đạt <span className="cc-field__required">*</span>
              </label>
              <Input
                className="cc-field__input"
                placeholder="Nhập số tiền cần đạt..."
                value={form.muc_tieu_tien}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    muc_tieu_tien: e.target.value.replace(/\D/g, ""),
                  }))
                }
                prefix={
                  <FiDollarSign size={15} className="cc-field__prefix-icon" />
                }
                suffix={<span className="cc-field__suffix">VNĐ</span>}
                type="number"
                min={1}
              />
              {form.muc_tieu_tien && (
                <div className="cc-field__hint">
                  ≈ {Number(form.muc_tieu_tien).toLocaleString("vi-VN")} đồng
                </div>
              )}
            </div>

            <div className="cc-field">
              <label className="cc-field__label">
                Thời gian kết thúc <span className="cc-field__required">*</span>
              </label>
              <DatePicker
                className="cc-field__datepicker"
                placeholder="Chọn thời gian"
                format="DD/MM/YYYY"
                suffixIcon={<FiCalendar size={15} />}
                disabledDate={(d) => d && d.isBefore(new Date(), "day")}
                onChange={(v) => setForm((p) => ({ ...p, ngay_ket_thuc: v }))}
              />
            </div>

            <div className="cc-field">
              <label className="cc-field__label">
                <FiMapPin size={14} /> Vị trí chiến dịch{" "}
                <span className="cc-field__required">*</span>
              </label>
              <LocationPicker
                value={{ address: form.vi_tri, lat: form.lat, lng: form.lng }}
                onChange={({ address, lat, lng }) =>
                  setForm((p) => ({ ...p, vi_tri: address, lat, lng }))
                }
              />
              {form.lat && form.lng && (
                <div className="cc-field__hint" style={{ color: "#52c41a" }}>
                  <FiCheck size={12} /> Đã chọn: {form.lat.toFixed(5)},{" "}
                  {form.lng.toFixed(5)}
                </div>
              )}
            </div>

            <div className="cc-form__actions cc-form__actions--split">
              <Button
                size="large"
                className="cc-btn cc-btn--back"
                onClick={handleBack}
              >
                <FiChevronLeft size={16} /> Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                className="cc-btn cc-btn--finish"
                onClick={handleSubmit}
                loading={loadingCreate}
                disabled={loadingCreate}
              >
                Hoàn tất <FiChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
