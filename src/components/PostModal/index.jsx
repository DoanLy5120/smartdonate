import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiMapPin,
  FiClock,
  FiMessageCircle,
  FiSend,
  FiX,
  FiChevronRight,
  FiCornerDownRight,
  FiPackage
} from "react-icons/fi";
import {
  FaHeart,
  FaRegHeart,
  FaGift,
  FaInbox,
  FaCheckCircle,
  FaRegComment,
} from "react-icons/fa";
import useComments from "../../hooks/useComments";
import useAuthStore from "../../store/authStore";
import usePostStore from "../../store/postStore";
import useChatStore from "../../store/chatStore";
import { useNavigate } from "react-router-dom";
import { notification, Popconfirm } from "antd";
import { RiRobot2Line, RiSparklingLine } from "react-icons/ri";
import "./styles.scss";
import { formatPostTime } from "../../utils/formatTime";

function CommentBubble({
  comment,
  onReply,
  onDelete,
  isReply = false,
  postOwnerId,
}) {
  const { user } = useAuthStore();
  const canDelete =
    user?.id === comment.nguoi_dung?.id || user?.id === postOwnerId;

  return (
    <div className={`pdc__comment${isReply ? " pdc__comment--reply" : ""}`}>
      <div className="pdc__comment-avatar">
        {comment.nguoi_dung?.avatar_url ? (
          <img src={comment.nguoi_dung.avatar_url} alt="avatar" />
        ) : (
          (comment.nguoi_dung?.ho_ten?.[0]?.toUpperCase() ?? "?")
        )}
      </div>
      <div className="pdc__comment-right">
        <div className="pdc__comment-bubble">
          <span className="pdc__comment-name">
            {comment.nguoi_dung?.ho_ten}
            {comment.isOwner && (
              <span className="pdc__comment-owner-badge">Tác giả</span>
            )}
          </span>
          <span className="pdc__comment-text">{comment.noi_dung}</span>
        </div>
        <div className="pdc__comment-actions">
          <span className="pdc__comment-time">
            {formatPostTime(comment.created_at)}
          </span>
          {!isReply && (
            <button
              className="pdc__comment-action-btn"
              onClick={() => onReply(comment.id, comment.nguoi_dung?.ho_ten)}
            >
              Phản hồi
            </button>
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn chắc chắn muốn xóa bình luận này?"
              onConfirm={() => onDelete(comment.id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              getPopupContainer={(trigger) => trigger.closest(".pdc")}
            >
              <button className="pdc__comment-action-btn pdc__comment-action-btn--delete">
                Xóa
              </button>
            </Popconfirm>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetailModal({ post, visible, onClose }) {
  const { toggleLike, posts } = usePostStore();
  const postFromStore = posts.find((p) => p.id === post?.id);
  const liked = postFromStore?.liked ?? false;
  const likeCount = postFromStore?.so_luot_thich ?? 0;
  const cmtCount = postFromStore?.so_binh_luan ?? 0;

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(null);

  const { user } = useAuthStore();
  const navigate = useNavigate();
  const openChatWith = useChatStore((s) => s.openChatWith);

  const {
    comments: postComments,
    createComment,
    deleteComment,
  } = useComments(post?.id);

  const rawStatus = post?.trang_thai;
  const soLuong = post?.so_luong ?? post?.quantity ?? null;
  const showQuantityTag = soLuong !== null && soLuong !== 0 && soLuong !== "";

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

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  if (!visible || !post) return null;

  const hasAiSuggestions = post.aiSuggestions?.length > 0;
  const images = Array.isArray(post.images)
    ? post.images
    : post.image
      ? [post.image]
      : [];

  const getImageGridClass = (count) => {
    if (count === 1) return "pdc__images--single";
    if (count === 2) return "pdc__images--two";
    if (count === 3) return "pdc__images--three";
    return "pdc__images--grid";
  };

  const handleLikePost = async () => {
    await toggleLike(post.id);
  };

  const handleReply = (commentId, userName) => {
    setReplyingTo({ id: commentId, name: userName });
    setCommentText(`@${userName} `);
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
    setTimeout(() => document.getElementById("pdc-comment-input")?.focus(), 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText("");
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    const text = commentText.trim();
    if (!text) return;
    try {
      await createComment({ noi_dung: text, id_cha: replyingTo?.id || null });
      setCommentText("");
      setReplyingTo(null);
      setTimeout(() => {
        document.getElementById("last-comment")?.scrollIntoView();
      }, 100);
    } catch (error) {
      console.log(error);
    }
  };

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

      if (chatId) {
        onClose();
        navigate(`/chat?cid=${chatId}`);
      }
    } catch {
      notification.error({
        message: "Lỗi chat",
        description: "Không thể tạo cuộc trò chuyện",
      });
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  return createPortal(
    <div className="pdc__overlay" onClick={onClose}>
      <div
        className={`pdc${hasAiSuggestions ? " pdc--ai" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="pdc__close-btn" onClick={onClose}>
          <FiX size={20} />
        </button>

        {/* LEFT */}
        <div className="pdc__left">
          <div className="pdc__left-scroll">
            <div className="pdc__header">
              <div
                className="pdc__avatar"
                style={{ background: post.user.color }}
              >
                {post.user.avatar}
              </div>
              <div className="pdc__user-info">
                <div className="pdc__username">{post.user.name}</div>
                <div className="pdc__meta">
                  <span className="pdc__location">
                    <FiMapPin size={11} /> {post.location}
                  </span>
                  <span className="pdc__meta-dot">·</span>
                  <span className="pdc__time">
                    <FiClock size={11} /> {post.time}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="pdc__title">{post.title}</h2>
            <p className="pdc__desc">{post.desc}</p>

            {images.length > 0 && (
              <div
                className={`pdc__images ${getImageGridClass(images.length)}`}
              >
                {images.slice(0, 4).map((src, i) => (
                  <div
                    key={i}
                    className={`pdc__image-item${
                      images.length === 3 && i === 0
                        ? " pdc__image-item--large"
                        : ""
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Ảnh ${i + 1}`}
                      onClick={() => setActiveImageIndex(i)}
                      style={{ cursor: "pointer" }}
                    />
                    {images.length > 4 && i === 3 && (
                      <div className="pdc__image-more">
                        +{images.length - 4}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Counts */}
            <div className="pdc__counts">
              <div className="pdc__counts-row">
                {likeCount > 0 && (
                  <span className="pdc__count-item">
                    <FaHeart size={13} className="pdc__count-heart" />
                    {likeCount}
                  </span>
                )}
                {cmtCount > 0 && (
                  <span className="pdc__count-item pdc__count-comment">
                    {cmtCount} bình luận
                  </span>
                )}
              </div>

              <span className="pdc__status-group">
                {showQuantityTag && (
                  <span className="pdc__quantity-tag">
                    {/* giống PostCard */}
                    {post?.loai_bai === "CHO" || post?.type === "cho" ? (
                      <>
                        <FiPackage size={11} style={{ marginRight: 3 }} />
                        Tặng: <span>{soLuong}</span>
                      </>
                    ) : (
                      <>
                        <FiPackage size={11} style={{ marginRight: 3 }} />
                        Cần: <span>{soLuong}</span>
                      </>
                    )}
                  </span>
                )}
                <span
                  className={`pdc__status-tag ${
                    isDone ? "pdc__status-tag--xong" : "pdc__status-tag--con"
                  }`}
                >
                  {statusIconMap[rawStatus]}
                  {statusLabelMap[rawStatus]}
                </span>
              </span>
            </div>

            {/* Actions */}
            <div className="pdc__actions-row">
              <button
                className={`pdc__action-btn pdc__action-btn--heart${liked ? " active" : ""}`}
                onClick={handleLikePost}
              >
                {liked ? <FaHeart size={19} /> : <FaRegHeart size={19} />}
                <span>{liked ? "Đã thích" : "Thích"}</span>
              </button>
              <button className="pdc__action-btn pdc__action-btn--comment">
                <FaRegComment size={19} />
                <span>Bình luận</span>
              </button>
              <button
                className="pdc__action-btn pdc__action-btn--mess"
                onClick={handleChat}
              >
                <FiMessageCircle size={19} />
                <span>Nhắn tin</span>
              </button>
              <button className="pdc__action-btn pdc__action-btn--share">
                <FiSend size={19} />
                <span>Chia sẻ</span>
              </button>
            </div>

            {hasAiSuggestions && (
              <>
                <div className="pdc__divider" />
                <div className="pdc__ai-box">
                  <div className="pdc__ai-box-header">
                    <div className="pdc__ai-box-title">
                      <div className="pdc__ai-robot-icon">
                        <RiRobot2Line size={15} />
                        <span className="pdc__ai-ping" />
                      </div>
                      <span>Gợi ý phù hợp cho bạn</span>
                      <RiSparklingLine size={12} className="pdc__ai-sparkle" />
                    </div>
                    <span className="pdc__ai-count">
                      {post.aiSuggestions.length} kết quả
                    </span>
                  </div>
                  <div className="pdc__ai-list">
                    {post.aiSuggestions.map((sug) => (
                      <div key={sug.id} className="pdc__ai-item">
                        <div className="pdc__ai-item-icon">{sug.icon}</div>
                        <div className="pdc__ai-item-info">
                          <div className="pdc__ai-item-title">{sug.title}</div>
                          <div className="pdc__ai-item-loc">
                            <FiMapPin size={10} /> {sug.location}
                            <span className="pdc__ai-item-score">
                              {sug.matchScore}% khớp
                            </span>
                          </div>
                        </div>
                        <button className="pdc__ai-view-btn">
                          Xem ngay <FiChevronRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT: comments */}
        <div className="pdc__right">
          <div className="pdc__comments-area">
            <div className="pdc__comments-list">
              {postComments.map((comment) => (
                <div key={comment.id} className="pdc__comment-thread">
                  <CommentBubble
                    comment={comment}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                    postOwnerId={post?.nguoi_dung_id}
                  />
                  {comment.replies.length > 0 && (
                    <div className="pdc__replies-wrap">
                      <button
                        className="pdc__toggle-replies"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        <FiCornerDownRight size={13} />
                        {expandedReplies[comment.id]
                          ? "Ẩn phản hồi"
                          : `Xem ${comment.replies.length} phản hồi`}
                      </button>
                      {expandedReplies[comment.id] && (
                        <div className="pdc__replies">
                          {comment.replies.map((reply) => (
                            <CommentBubble
                              key={reply.id}
                              comment={reply}
                              onReply={handleReply}
                              onDelete={handleDeleteComment}
                              postOwnerId={post?.nguoi_dung_id}
                              isReply
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comment input */}
          <div className="pdc__comment-input-wrap">
            {replyingTo && (
              <div className="pdc__replying-bar">
                <FiCornerDownRight size={12} />
                <span>
                  Đang trả lời <strong>{replyingTo.name}</strong>
                </span>
                <button
                  className="pdc__replying-cancel"
                  onClick={handleCancelReply}
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
            <div className="pdc__comment-input-row">
              <div className="pdc__me-avatar">
                {user?.ho_ten?.[0]?.toUpperCase() ?? "?"}
              </div>
              <input
                id="pdc-comment-input"
                className="pdc__comment-input"
                placeholder={
                  replyingTo
                    ? `Trả lời ${replyingTo.name}...`
                    : "Viết bình luận..."
                }
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <button
                className={`pdc__send-btn${
                  commentText.trim() ? " pdc__send-btn--active" : ""
                }`}
                onClick={handleSubmit}
                disabled={!commentText.trim()}
              >
                <FiSend size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeImageIndex !== null && (
        <div
          className="pdc__lightbox"
          onClick={() => setActiveImageIndex(null)}
        >
          <button
            className="pdc__lightbox-close"
            onClick={() => setActiveImageIndex(null)}
          >
            <FiX />
          </button>
          <button
            className="pdc__lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) =>
                prev > 0 ? prev - 1 : images.length - 1,
              );
            }}
          >
            ‹
          </button>
          <img
            src={images[activeImageIndex]}
            alt="preview"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="pdc__lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) =>
                prev < images.length - 1 ? prev + 1 : 0,
              );
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
