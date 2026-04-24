import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiX,
  FiImage,
  FiCheck,
  FiPackage,
} from "react-icons/fi";
import {
  FaHeart,
  FaRegHeart,
  FaGift,
  FaInbox,
  FaCheckCircle,
  FaRegComment,
} from "react-icons/fa";
import { BsBox2HeartFill } from "react-icons/bs";
import { SiMessenger } from "react-icons/si";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import PostModal from "../../components/PostModal/index";
import ReportSheet from "../../components/ReportSheet/index";
import usePostStore from "../../store/postStore";
import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useRelated from "../../hooks/useRelated";
import { formatPostTime } from "../../utils/formatTime";
import "./styles.scss";

export default function PostCard({ post, style, onDelete }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const { fetchPostDetail, postDetail } = usePostStore();
  const { fetchMatches, matches, matchesStatus } = usePostStore();
  const matchKey = String(post.id);
  const matchStatus = matchesStatus?.[matchKey];
  const postMatches = matches[String(post.id)] || [];
  const [aiPhase, setAiPhase] = useState("idle");
  const menuRef = useRef(null);
  const { user } = useAuthStore();
  const isMyPost = user?.id === post.user?.id;
  const aiSuggestions = postMatches.map((item) => ({
    id: item.post?.id,
    title: item.post?.tieu_de,
    location: item.post?.dia_diem,
    matchScore: Math.round(item.match_percent ?? 0),
  }));
  const hasAiSuggestions = isMyPost && aiSuggestions.length > 0;
  const { related } = useRelated(post.id);
  const hasRelated = !isMyPost && related.length > 0;
  const { toggleLike, reportPost } = usePostStore();
  const openChatWith = useChatStore((s) => s.openChatWith);

  const postState = usePostStore((s) => s.posts.find((p) => p.id === post?.id));
  const liked = postState?.liked;
  const likeCount = postState?.so_luot_thich ?? 0;
  const cmtCount = postState?.so_binh_luan ?? 0;

  const { updatePost, deletePost: deletePostStore } = usePostStore();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);
  const [relatedExpanded, setRelatedExpanded] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [editData, setEditData] = useState({
    tieu_de: "",
    mo_ta: "",
    trang_thai: "",
    dia_diem: "",
    so_luong: "",
    hinh_anh: [],
    preview: [],
    existingImages: [],
  });

  const isCho = post.loai_bai === "CHO" || post.type === "cho";

  const statusOptions = isCho
    ? [
        { label: "Còn tặng", value: "CON_TANG", icon: <FaGift /> },
        { label: "Đã tặng xong", value: "DA_TANG", icon: <FaCheckCircle /> },
      ]
    : [
        { label: "Còn nhận", value: "CON_NHAN", icon: <FaInbox /> },
        { label: "Đã nhận đủ", value: "DA_NHAN", icon: <FaCheckCircle /> },
      ];

  const images = post.images || [];
  const imgCount = images.length;

  const soLuong = post.so_luong ?? post.quantity ?? null;
  const showQuantityTag = soLuong !== null && soLuong !== 0 && soLuong !== "";
  const rawStatus = post.trang_thai;

  const isDone = rawStatus === "DA_NHAN" || rawStatus === "DA_TANG";

  const statusLabelMap = {
    CON_TANG: "Còn tặng",
    CON_NHAN: "Còn nhận",
    DA_TANG: "Đã tặng",
    DA_NHAN: "Đã nhận",
  };

  const statusIconMap = {
    CON_TANG: <FaGift style={{ marginRight: 4 }} />,
    CON_NHAN: <FaInbox style={{ marginRight: 4 }} />,
    DA_TANG: <FaCheckCircle style={{ marginRight: 4 }} />,
    DA_NHAN: <FaCheckCircle style={{ marginRight: 4 }} />,
  };

  const quantityLabel = isCho ? "Còn tặng" : "Còn cần";

  const isStatusDone = (status) => status === "DA_TANG" || status === "DA_NHAN";

  useEffect(() => {
    if (!post.id) return;
    if (!isMyPost) return;
    if (matchStatus === "empty") return;
    fetchMatches(post.id);
  }, [post.id, matchStatus]);

  useEffect(() => {
    if (!hasAiSuggestions) return;
    //setAiPhase("loading");
    const timer = setTimeout(() => setAiPhase("done"), 2500);
    return () => clearTimeout(timer);
  }, [hasAiSuggestions]);

  useEffect(() => {
    if (activePostId && activePostId !== post.id) {
      fetchPostDetail(activePostId);
    }
  }, [activePostId]);

  const fetchedPost = postDetail[String(activePostId)];
  const activePost =
    activePostId === null
      ? null
      : activePostId === post.id
        ? post
        : fetchedPost
          ? {
              id: fetchedPost.id,
              type: fetchedPost.loai_bai?.toLowerCase(),
              user: {
                id: fetchedPost.nguoi_dung?.id,
                name: fetchedPost.nguoi_dung?.ho_ten,
                avatar: fetchedPost.nguoi_dung?.ho_ten?.charAt(0) || "?",
                color: "#1890ff",
              },
              location: fetchedPost.dia_diem,
              time: formatPostTime(fetchedPost.created_at),
              title: fetchedPost.tieu_de,
              desc: fetchedPost.mo_ta,
              images: fetchedPost.hinh_anh_urls || [],
              trang_thai: fetchedPost.trang_thai,
              nguoi_dung_id: fetchedPost.nguoi_dung?.id,
              liked: fetchedPost.da_thich ?? false,
              so_luot_thich: fetchedPost.so_luot_thich ?? 0,
              aiSuggestions: [],
            }
          : null;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleChat = async (e) => {
    e.stopPropagation();
    if (!user) {
      notification.warning({ message: "Vui lòng đăng nhập để nhắn tin" });
      return;
    }
    try {
      const receiverId = post?.user?.id ?? post?.nguoi_dung_id ?? post?.user_id;
      if (!receiverId) return;

      const chatId = await openChatWith(receiverId, {
        id: receiverId,
        ho_ten: post?.user?.name ?? post?.user?.ho_ten ?? "Người dùng",
        avatar_url: post?.user?.avatar_url ?? null,
      });

      if (chatId) navigate(`/chat?cid=${chatId}`);
    } catch (err) {
      console.error("Lỗi tạo chat:", err);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      notification.warning({ message: "Vui lòng đăng nhập để thích bài" });
      return;
    }
    await toggleLike(post.id);
  };

  const handleToggleDesc = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleReport = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setReportOpen(true);
  };

  const handleSubmitReport = async (data) => {
    try {
      setReportLoading(true);
      await reportPost(post.id, data);
      setReportOpen(false);
    } finally {
      setReportLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e?.stopPropagation?.();

    try {
      const ok = await deletePostStore(post.id);
      if (ok) {
        notification.success({ message: "Đã xóa bài đăng" });
        onDelete?.(post.id);
        setConfirmDeleteOpen(false);
      } else {
        notification.error({ message: "Xóa thất bại, thử lại nhé" });
      }
    } catch {
      notification.error({ message: "Xóa thất bại, thử lại nhé" });
    }
  };

  const handleOpenEdit = (e) => {
    e.stopPropagation();
    setMenuOpen(false);

    setEditData({
      tieu_de: post.title ?? post.tieu_de ?? "",
      mo_ta: post.desc ?? post.mo_ta ?? "",
      trang_thai: post.trang_thai,
      so_luong: post.so_luong ?? post.quantity ?? "",
      dia_diem: post.dia_diem ?? post.location ?? "",
      hinh_anh: [],
      preview: [],
      existingImages: post.images ?? post.hinh_anh_urls ?? [],
    });

    setEditOpen(true);
  };

  const handleSelectImages = (files) => {
    const arr = Array.from(files);
    setEditData((prev) => ({
      ...prev,
      hinh_anh: [...prev.hinh_anh, ...arr],
      preview: [...prev.preview, ...arr.map((f) => URL.createObjectURL(f))],
    }));
  };

  const handleRemoveExisting = (idx) => {
    setEditData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveNew = (idx) => {
    setEditData((prev) => {
      const newFiles = prev.hinh_anh.filter((_, i) => i !== idx);
      const newPreviews = prev.preview.filter((_, i) => i !== idx);
      return { ...prev, hinh_anh: newFiles, preview: newPreviews };
    });
  };

  const handleUpdatePost = async () => {
    if (!editData.tieu_de.trim()) {
      notification.warning({ message: "Vui lòng nhập tiêu đề" });
      return;
    }

    try {
      setEditLoading(true);

      const formData = new FormData();
      formData.append("tieu_de", editData.tieu_de.trim());
      formData.append("mo_ta", editData.mo_ta.trim());
      formData.append("trang_thai", editData.trang_thai);
      formData.append("dia_diem", editData.dia_diem);

      if (editData.so_luong !== "" && editData.so_luong !== null) {
        formData.append("so_luong", editData.so_luong);
      }

      // ─── Gửi danh sách URL ảnh cũ cần giữ lại ─────────────────────────
      // BE sẽ dùng mảng này để biết ảnh nào không xóa
      editData.existingImages.forEach((url) => {
        formData.append("existing_images[]", url);
      });

      // ─── Gửi ảnh mới (nếu có) ─────────────────────────────────────────
      editData.hinh_anh.forEach((f) => {
        formData.append("hinh_anh[]", f);
      });

      const res = await updatePost(post.id, formData);

      if (res) {
        notification.success({ message: "Cập nhật bài đăng thành công!" });
        setEditOpen(false);
      } else {
        notification.error({ message: "Cập nhật thất bại, thử lại nhé" });
      }
    } catch {
      notification.error({ message: "Cập nhật thất bại, thử lại nhé" });
    } finally {
      setEditLoading(false);
    }
  };

  const allPreviews = [
    ...editData.existingImages.map((url, i) => ({ url, isNew: false, idx: i })),
    ...editData.preview.map((url, i) => ({ url, isNew: true, idx: i })),
  ];

  return (
    <>
      <div
        className={`post-card${hasAiSuggestions ? " post-card--ai" : ""}`}
        style={style}
      >
        {/* Header */}
        <div className="post-card__header">
          <div
            className="post-card__avatar"
            style={{ background: post.user.color }}
          >
            {post.user.avatar}
          </div>

          <div className="post-card__user-info">
            <div className="post-card__username">{post.user.name}</div>
            <div className="post-card__meta">
              <span className="post-card__location">
                <FiMapPin size={11} /> {post.location}
              </span>
              <span className="post-card__meta-dot">·</span>
              <span className="post-card__time">
                <FiClock size={11} /> {post.time}
              </span>
            </div>
          </div>

          {hasAiSuggestions && (
            <div className="post-card__ai-header-badge">
              <RiSparklingLine size={11} />
              AI hỗ trợ cho bạn
            </div>
          )}

          {!hasAiSuggestions && hasRelated && (
            <div className="post-card__ai-header-badge">
              <RiSparklingLine size={11} />
              AI gợi ý gần bạn
            </div>
          )}

          <div className="post-card__more-wrap" ref={menuRef}>
            <button className="post-card__more-btn" onClick={handleMenuToggle}>
              <FiMoreVertical size={20} />
            </button>

            {menuOpen && (
              <div
                className="post-card__dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                {isMyPost && (
                  <>
                    <button
                      className="post-card__dropdown-item"
                      onClick={handleOpenEdit}
                    >
                      <FiEdit2 size={16} />
                      Chỉnh sửa bài đăng
                    </button>
                    <div className="post-card__dropdown-sep" />
                    <button
                      className="post-card__dropdown-item post-card__dropdown-item--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      <FiTrash2 size={16} />
                      Xóa bài đăng
                    </button>
                  </>
                )}

                {!isMyPost && (
                  <button
                    className="post-card__dropdown-item"
                    onClick={handleReport}
                  >
                    <FiAlertTriangle size={16} />
                    Báo cáo bài đăng
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="post-card__body">
          <div className="post-card__title">{post.title}</div>

          <div
            className={`post-card__desc${expanded ? "" : " post-card__desc--clamped"}`}
          >
            {post.desc}
          </div>
          <button className="post-card__see-more" onClick={handleToggleDesc}>
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>

          {imgCount > 0 && (
            <div
              className={`post-card__img post-card__img--${Math.min(imgCount, 4)}`}
              onClick={(e) => {
                e.stopPropagation();
                setActivePostId(post.id);
              }}
            >
              {images.slice(0, 4).map((img, idx) => (
                <div key={idx} className="post-card__img-item">
                  <img src={img} alt={`img-${idx}`} />
                  {imgCount > 4 && idx === 3 && (
                    <div className="post-card__img-overlay">
                      +{imgCount - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div
            className="post-card__counts-row"
            onClick={(e) => {
              e.stopPropagation();
              setActivePostId(post.id);
            }}
          >
            <span className="post-card__counts-left">
              {likeCount > 0 && (
                <span className="post-card__count-item">
                  <FaHeart size={12} className="post-card__count-heart" />
                  {likeCount}
                </span>
              )}
              {cmtCount > 0 && (
                <span className="post-card__count-item post-card__count-comment">
                  {cmtCount} bình luận
                </span>
              )}
            </span>

            <span className="post-card__status-group">
              {/* ─── FIX: quantity tag với label rõ ràng ────────────────── */}
              {showQuantityTag && (
                <span className="post-card__quantity-tag">
                  <FiPackage size={11} style={{ marginRight: 3 }} />
                  {isCho ? "Tặng:" : "Cần:"}&nbsp;
                  <span>{soLuong}</span>
                </span>
              )}
              <span
                className={`post-card__status-tag ${
                  isDone
                    ? "post-card__status-tag--xong"
                    : "post-card__status-tag--con"
                }`}
              >
                {statusIconMap[rawStatus]}
                {statusLabelMap[rawStatus]}
              </span>
            </span>
          </div>

          {/* Actions */}
          <div className="post-card__actions-row">
            <button
              className={`post-card__icon-btn heart${liked ? " heart--active" : ""}`}
              onClick={handleLike}
            >
              {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
              <span>{liked ? "Đã thích" : "Thích"}</span>
            </button>

            <button
              className="post-card__icon-btn comment"
              onClick={(e) => {
                e.stopPropagation();
                setActivePostId(post.id);
              }}
            >
              <FaRegComment size={20} />
              <span>Bình luận</span>
            </button>

            {!isMyPost && (
              <button className="post-card__icon-btn mess" onClick={handleChat}>
                <SiMessenger size={20} />
                <span>Nhắn tin</span>
              </button>
            )}

            <button
              className="post-card__icon-btn share"
              onClick={(e) => e.stopPropagation()}
            >
              <FiSend size={20} />
              <span>Chia sẻ</span>
            </button>
          </div>
        </div>

        {/* AI loading spinner */}
        {hasAiSuggestions && aiPhase === "loading" && (
          <div className="post-card__ai-loading">
            <span className="post-card__ai-spinner" />
            <span className="post-card__ai-loading-text">
              AI đang phân tích...
            </span>
          </div>
        )}
        {hasAiSuggestions && aiPhase === "done" && (
          <div className="post-card__ai-box post-card__ai-box--animate">
            <div className="post-card__ai-box-header">
              <div className="post-card__ai-box-title">
                <div className="post-card__ai-robot-icon">
                  <RiRobot2Line size={15} />
                  <span className="post-card__ai-ping" />
                </div>
                <span>Gợi ý phù hợp cho bạn</span>
                <RiSparklingLine size={12} className="post-card__ai-sparkle" />
              </div>
              <button
                className={`post-card__ai-toggle${aiExpanded ? " post-card__ai-toggle--open" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setAiExpanded((p) => !p);
                }}
              >
                <span className="post-card__ai-toggle-count">
                  {aiSuggestions.length}
                </span>
                <span className="post-card__ai-toggle-label">gợi ý</span>
                <span className="post-card__ai-toggle-arrow">›</span>
              </button>
            </div>
            {aiExpanded && (
              <div className="post-card__ai-list post-card__ai-list--reveal">
                {aiSuggestions.map((sug) => (
                  <div key={sug.id} className="post-card__ai-item">
                    <div className="post-card__ai-item-icon">
                      <BsBox2HeartFill color="#096dd9" size={30} />
                    </div>
                    <div className="post-card__ai-item-info">
                      <div className="post-card__ai-item-title">
                        {sug.title}
                      </div>
                      <div className="post-card__ai-item-loc">
                        <FiMapPin size={10} /> {sug.location}
                        <span className="post-card__ai-item-score">
                          {sug.matchScore}% khớp
                        </span>
                      </div>
                    </div>
                    <button
                      className="post-card__ai-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePostId(sug.id);
                      }}
                    >
                      Xem ngay <FiChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Related — bài gần bạn */}
        {!isMyPost && hasRelated && (
          <div className="post-card__ai-box">
            <div className="post-card__ai-box-header">
              <div className="post-card__ai-box-title">
                <div className="post-card__ai-robot-icon">
                  <RiRobot2Line size={15} />
                  <span className="post-card__ai-ping" />
                </div>
                <span>Gợi ý cùng nhu cầu trong khu vực</span>
                <RiSparklingLine size={12} className="post-card__ai-sparkle" />
              </div>
              <button
                className={`post-card__ai-toggle${relatedExpanded ? " post-card__ai-toggle--open" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setRelatedExpanded((p) => !p);
                }}
              >
                <span className="post-card__ai-toggle-count">
                  {related.slice(0, 3).length}
                </span>
                <span className="post-card__ai-toggle-label">gần bạn</span>
                <span className="post-card__ai-toggle-arrow">›</span>
              </button>
            </div>
            {relatedExpanded && (
              <div className="post-card__ai-list post-card__ai-list--reveal">
                {related.slice(0, 3).map((r) => (
                  <div key={r.id} className="post-card__ai-item">
                    <div className="post-card__ai-item-icon">
                      <BsBox2HeartFill color="#096dd9" size={30} />
                    </div>
                    <div className="post-card__ai-item-info">
                      <div className="post-card__ai-item-title">
                        {r.tieu_de}
                      </div>
                      <div className="post-card__ai-item-loc">
                        <FiMapPin size={10} /> {r.dia_diem || "Không rõ"}
                        {r.distance_km != null && (
                          <span className="post-card__ai-item-dist">
                            · {r.distance_km.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="post-card__ai-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePostId(r.id);
                      }}
                    >
                      Xem <FiChevronRight size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PostModal
        post={activePost}
        visible={activePostId !== null}
        onClose={() => setActivePostId(null)}
      />
      <ReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={handleSubmitReport}
        loading={reportLoading}
      />

      {/* ─── EDIT MODAL ─────────────────────────────────────── */}
      {editOpen && (
        <div
          className="edit-modal"
          onClick={() => !editLoading && setEditOpen(false)}
        >
          <div
            className="edit-modal__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="edit-modal__head">
              <div className="edit-modal__head-title">Chỉnh sửa bài viết</div>
              <button
                className="edit-modal__close"
                onClick={() => setEditOpen(false)}
                disabled={editLoading}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Author row */}
            <div className="edit-modal__author">
              <div
                className="edit-modal__author-avatar"
                style={{ background: post.user.color }}
              >
                {post.user.avatar}
              </div>
              <div className="edit-modal__author-info">
                <div className="edit-modal__author-name">{post.user.name}</div>
              </div>
            </div>

            {/* Body */}
            <div className="edit-modal__body">
              <input
                className="edit-fb__title"
                value={editData.tieu_de}
                onChange={(e) =>
                  setEditData({ ...editData, tieu_de: e.target.value })
                }
                placeholder="Tiêu đề bài đăng..."
                maxLength={120}
              />
              <textarea
                className="edit-fb__desc"
                value={editData.mo_ta}
                onChange={(e) =>
                  setEditData({ ...editData, mo_ta: e.target.value })
                }
                placeholder="Bạn đang muốn tặng/nhận gì?"
                rows={2}
                maxLength={1000}
              />

              {/* Image preview grid */}
              {allPreviews.length > 0 && (
                <div
                  className={`edit-img-preview edit-img-preview--${Math.min(allPreviews.length, 4)}`}
                >
                  {allPreviews.slice(0, 4).map((item, i) => (
                    <div
                      key={`${item.isNew ? "new" : "old"}-${item.idx}`}
                      className="edit-img-preview__item"
                    >
                      <img src={item.url} alt="" />
                      {allPreviews.length > 4 && i === 3 && (
                        <div className="edit-img-preview__more">
                          +{allPreviews.length - 4}
                        </div>
                      )}
                      <button
                        className="edit-img-preview__remove"
                        onClick={() =>
                          item.isNew
                            ? handleRemoveNew(item.idx)
                            : handleRemoveExisting(item.idx)
                        }
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Toolbar — add photo */}
              <div className="edit-modal__toolbar">
                <span className="edit-modal__toolbar-label">
                  Thêm vào bài viết
                </span>
                <label className="edit-modal__toolbar-btn edit-modal__toolbar-btn--photo">
                  <FiImage size={20} />
                  <span>Ảnh</span>
                  <input
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={(e) => handleSelectImages(e.target.files)}
                  />
                </label>
              </div>

              {/* ── Trạng thái + Số lượng ── */}
              <div className="edit-modal__meta-section">
                {/* Status chips */}
                <div className="edit-modal__meta-row">
                  <span className="edit-modal__meta-label">Trạng thái</span>
                  <div className="edit-modal__status-row">
                    {/* ─── FIX: dùng đúng value DA_TANG / DA_NHAN ──────── */}
                    {statusOptions.map((s) => (
                      <button
                        key={s.value}
                        className={`edit-modal__status-chip${
                          editData.trang_thai === s.value ? " active" : ""
                        }${
                          isStatusDone(s.value)
                            ? " chip--done"
                            : isCho
                              ? " chip--give"
                              : " chip--receive"
                        }`}
                        onClick={() =>
                          setEditData((prev) => ({
                            ...prev,
                            trang_thai: s.value,
                            // Khi chọn "đã xong" → clear số lượng
                            so_luong: isStatusDone(s.value)
                              ? ""
                              : prev.so_luong,
                          }))
                        }
                      >
                        <span className="edit-modal__status-chip-icon">
                          {s.icon}
                        </span>
                        {s.label}
                        {editData.trang_thai === s.value && (
                          <FiCheck
                            size={11}
                            className="edit-modal__status-chip-check"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ─── FIX: Quantity input với label/hint rõ ràng ─────── */}
                <div className="edit-modal__meta-row">
                  <span className="edit-modal__meta-label">
                    <FiPackage size={13} style={{ marginRight: 5 }} />
                    {quantityLabel}
                  </span>

                  {isStatusDone(editData.trang_thai) ? (
                    <span className="edit-modal__meta-label">
                      <FaCheckCircle size={13} style={{ marginRight: 4 }} />
                      {isCho ? "Đã tặng hết" : "Đã nhận đủ"}
                    </span>
                  ) : (
                    <div className="edit-modal__qty-wrap">
                      <button
                        className="edit-modal__qty-btn"
                        onClick={() =>
                          setEditData((prev) => ({
                            ...prev,
                            so_luong: Math.max(
                              1,
                              Number(prev.so_luong || 1) - 1,
                            ),
                          }))
                        }
                        disabled={
                          !editData.so_luong || Number(editData.so_luong) <= 1
                        }
                      >
                        −
                      </button>
                      <input
                        className="edit-modal__qty-input"
                        type="number"
                        min={1}
                        value={editData.so_luong}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "" || /^\d+$/.test(v)) {
                            setEditData({
                              ...editData,
                              so_luong: v === "" ? "" : Number(v),
                            });
                          }
                        }}
                      />
                      <button
                        className="edit-modal__qty-btn"
                        onClick={() =>
                          setEditData((prev) => ({
                            ...prev,
                            so_luong: Number(prev.so_luong || 0) + 1,
                          }))
                        }
                      >
                        +
                      </button>
                      {editData.so_luong !== "" &&
                        editData.so_luong !== null && (
                          <button
                            className="edit-modal__qty-clear"
                            onClick={() =>
                              setEditData({ ...editData, so_luong: "" })
                            }
                            title="Xóa số lượng"
                          >
                            <FiX size={12} />
                          </button>
                        )}
                    </div>
                  )}
                </div>

                {/* ─── địa điểm ─────── */}
                <div className="edit-modal__meta-row">
                  <span className="edit-modal__meta-label">
                    <FiMapPin size={13} style={{ marginRight: 5 }} />
                    Địa điểm
                  </span>

                  <input
                    className="edit-modal__input"
                    type="text"
                    value={editData.dia_diem}
                    onChange={(e) =>
                      setEditData({ ...editData, dia_diem: e.target.value })
                    }
                    placeholder="Nhập địa điểm..."
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="edit-modal__footer">
              <button
                className="edit-modal__save"
                onClick={handleUpdatePost}
                disabled={editLoading || !editData.tieu_de.trim()}
              >
                {editLoading ? <span className="edit-modal__spinner" /> : null}
                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteOpen && (
        <div
          className="confirm-modal"
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="confirm-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal__icon">
              <FiAlertTriangle size={28} />
            </div>
            <div className="confirm-modal__title">Xóa bài đăng?</div>
            <div className="confirm-modal__desc">
              Hành động này không thể hoàn tác.
            </div>
            <div className="confirm-modal__actions">
              <button
                className="confirm-modal__cancel"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Hủy
              </button>
              <button className="confirm-modal__delete" onClick={handleDelete}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
