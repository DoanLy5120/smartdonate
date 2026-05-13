import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Input, Button, notification, Popconfirm } from "antd";
import {
  FiX,
  FiUpload,
  FiImage,
  FiAlignLeft,
  FiType,
  FiPlus,
} from "react-icons/fi";
import { BsBox2HeartFill } from "react-icons/bs";
import { FaHandsHoldingCircle } from "react-icons/fa6";
import { MdAddLocationAlt } from "react-icons/md";
import { GoNumber } from "react-icons/go";
import usePostStore from "../../../store/postStore";
import { uploadImages } from "../../../api/postService";
import "./CreatePost.scss";

const { TextArea } = Input;

export default function CreatePost() {
  const navigate = useNavigate();
  const { createPost } = usePostStore();
  const [type, setType] = useState("cho");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);

  const SUBMIT_STEPS = [
    { icon: "🔍", label: "Kiểm tra dữ liệu..." },
    { icon: "☁️", label: "Đang tải ảnh lên..." },
    { icon: "✨", label: "AI đang tìm kiếm bài đăng gợi ý..." },
    { icon: "✅", label: "Hoàn tất!" },
  ];
  const fileRef = useRef(null);

  function handleFile(files) {
    const newImgs = Array.from(files).map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setImages((prev) => [...prev, ...newImgs]);
    if (!preview && newImgs.length) setPreview(newImgs[0].url);
  }

  const handleSubmit = async () => {
    if (!title || !desc) {
      notification.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng nhập tiêu đề và mô tả",
      });
      return;
    }

    setSubmitting(true);
    setSubmitStep(0); // Bước 0: kiểm tra dữ liệu

    const formData = new FormData();
    formData.append("tieu_de", title);
    formData.append("mo_ta", desc);
    formData.append("loai_bai", type === "cho" ? "CHO" : "NHAN");
    formData.append("dia_diem", location);
    formData.append("so_luong", quantity === "" ? 1 : Number(quantity));

    try {
      if (images.length > 0) {
        setSubmitStep(1); // Bước 1: upload ảnh
        const uploadedUrls = await uploadImages(images.map((img) => img.file));
        uploadedUrls.forEach((url) => formData.append("hinh_anh[]", url));
      }

      setSubmitStep(2); // Bước 2: AI xử lý / tạo bài
      const res = await createPost(formData);

      if (res) {
        setSubmitStep(3); // Bước 3: hoàn tất
        notification.success({
          message: "Thành công",
          description: "Bài đăng của bạn đã được tạo!",
        });
        setTimeout(() => navigate("/bang-tin"), 1200);
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);

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
        notification.error({ message: "Có lỗi xảy ra, vui lòng thử lại" });
      }
    }
  };

  function removeImage(idx) {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (preview === prev[idx].url) setPreview(next[0]?.url ?? null);
      return next;
    });
  }

  return (
    <>
    <div className="cp-page">
      <div className="cp-modal">
        <div className="cp-modal__header">
          <div className="cp-modal__title">
            <span className="cp-modal__title-icon">🪄</span>
            TẠO BÀI ĐĂNG
          </div>
        </div>

        <div className="cp-modal__body">
          {/* Loại bài đăng */}
          <div className="cp-field">
            <label className="cp-field__label">Loại bài đăng</label>
            <div className="cp-type-selector">
              <button
                className={`cp-type-btn cp-type-btn--cho${type === "cho" ? " active" : ""}`}
                onClick={() => setType("cho")}
              >
                <span className="cp-type-btn__icon">
                  <BsBox2HeartFill size={25} />
                </span>{" "}
                Cho
              </button>
              <button
                className={`cp-type-btn cp-type-btn--nhan${type === "nhan" ? " active" : ""}`}
                onClick={() => setType("nhan")}
              >
                <span className="cp-type-btn__icon">
                  <FaHandsHoldingCircle size={25} />
                </span>{" "}
                Nhận
              </button>
            </div>
          </div>

          {/* Tiêu đề */}
          <div className="cp-field">
            <label className="cp-field__label">
              <FiType size={14} /> Tiêu đề
            </label>
            <Input
              className="cp-field__input"
              placeholder="Đặt tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              showCount
            />
          </div>

          <div className="cp-field">
            <label className="cp-field__label">
              <FiImage size={14} /> Hình ảnh
              <span
                style={{
                  fontWeight: 400,
                  color: "#aaa",
                  marginLeft: 6,
                  fontSize: 12,
                }}
              >
                (không bắt buộc)
              </span>
            </label>

            {images.length === 0 ? (
              <div
                className={`cp-upload__zone${dragging ? " dragging" : ""}`}
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
                <div className="cp-upload__zone-circle">
                  <FiPlus size={24} />
                </div>
                <span className="cp-upload__zone-text">Tải ảnh lên</span>
                <span className="cp-upload__zone-hint">
                  Kéo thả hoặc click để chọn • Có thể chọn nhiều ảnh
                </span>
              </div>
            ) : (
              <div className="cp-upload__preview">
                <div className="cp-upload__preview-main">
                  <img src={preview} alt="preview" />
                  <div className="cp-upload__preview-overlay">
                    <button
                      className="cp-upload__preview-change"
                      onClick={() => fileRef.current?.click()}
                    >
                      <FiUpload size={14} /> Thêm ảnh
                    </button>
                  </div>
                </div>
                <div className="cp-upload__thumbs">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`cp-upload__thumb${preview === img.url ? " active" : ""}`}
                      onClick={() => setPreview(img.url)}
                    >
                      <img src={img.url} alt={img.name} />
                      <button
                        className="cp-upload__thumb-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(i);
                        }}
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                  <div
                    className="cp-upload__thumb cp-upload__thumb--add"
                    onClick={() => fileRef.current?.click()}
                  >
                    <FiPlus size={16} />
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files)}
            />
          </div>

          {/* Mô tả */}
          <div className="cp-field">
            <label className="cp-field__label">
              <FiAlignLeft size={14} /> Mô tả
            </label>
            <TextArea
              className="cp-field__textarea"
              placeholder="Mô tả bài đăng...."
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              showCount
              maxLength={500}
            />
          </div>

          {/* Địa điểm & Số lượng */}
          <div className="cp-field-row">
            <div className="cp-field-inline">
              <label className="cp-field-inline__label">
                <span className="cp-field-inline__icon cp-field-inline__icon--red">
                  <MdAddLocationAlt size={14} />
                </span>
                <strong>Địa điểm</strong>
              </label>
              <Input
                className="cp-field-inline__input"
                placeholder="Phường/Xã, Quận/Huyện..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="cp-field-inline">
              <label className="cp-field-inline__label">
                <span className="cp-field-inline__icon cp-field-inline__icon--brown">
                  <GoNumber size={14} />
                </span>
                <strong>Số lượng</strong>
              </label>
              <Input
                className="cp-field-inline__input"
                placeholder="Nhập số lượng..."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                type="number"
                min={1}
              />
            </div>
          </div>
        </div>

        <div className="cp-modal__footer">
          <Popconfirm
            title="Hủy bài đăng"
            description="Bạn có chắc muốn hủy? Dữ liệu có thể bị mất!"
            okText="Yes"
            cancelText="No"
            onConfirm={() => navigate("/bang-tin")}
          >
            <Button className="cp-btn cp-btn--cancel" danger>
              HỦY
            </Button>
          </Popconfirm>
          <Button
            className="cp-btn cp-btn--submit"
            type="primary"
            onClick={handleSubmit}
          >
            ĐĂNG BÀI
          </Button>
        </div>
      </div>
    </div>
    {submitting && (
        <div className="cp-submit-overlay">
          <div className="cp-submit-card">
            <div className="cp-submit-spinner" />
            <p className="cp-submit-label">{SUBMIT_STEPS[submitStep].label}</p>
            <p className="cp-submit-sub">Vui lòng không đóng trang</p>

            <div className="cp-submit-steps">
              {SUBMIT_STEPS.map((s, i) => (
                <div
                  key={i}
                  className={`cp-submit-step ${
                    i < submitStep
                      ? "done"
                      : i === submitStep
                        ? "active"
                        : "wait"
                  }`}
                >
                  <span className="cp-submit-step__dot">
                    {i < submitStep ? "✓" : s.icon}
                  </span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
