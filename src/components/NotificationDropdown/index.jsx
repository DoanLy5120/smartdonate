import { useEffect, useState } from "react";
import { Badge, Dropdown, Spin, Empty } from "antd";
import {
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiMessageSquare,
  FiCheckCircle,
  FiXCircle,
  FiLock,
} from "react-icons/fi";
import { formatPostTime } from "../../utils/formatTime";
import { getPostDetail } from "../../api/postService";
import PostDetailModal from "../PostModal/index";
import useNotificationStore from "../../store/notificationStore";
import "./styles.scss";

/* ------------------------------------------------------------------ */
/*  Helper: meta (icon, màu) theo loại thông báo                       */
/* ------------------------------------------------------------------ */
const getNotificationMeta = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "bai_dang_duoc_thich":
      return { icon: <FiHeart size={18} />, color: "#e0245e", bg: "#fce8ef" };
    case "bai_dang_duoc_binh_luan":
      return {
        icon: <FiMessageCircle size={18} />,
        color: "#1877f2",
        bg: "#e7f0fd",
      };
    case "reply_comment":
      return {
        icon: <FiMessageSquare size={18} />,
        color: "#17a2b8",
        bg: "#e3f6f9",
      };
    default:
      if (data.message?.includes("được duyệt"))
        return {
          icon: <FiCheckCircle size={18} />,
          color: "#28a745",
          bg: "#eaf6ec",
        };
      if (data.message?.includes("bị từ chối"))
        return {
          icon: <FiXCircle size={18} />,
          color: "#dc3545",
          bg: "#fdecea",
        };
      if (data.message?.includes("bị khóa"))
        return { icon: <FiLock size={18} />, color: "#fd7e14", bg: "#fff3e0" };
      return { icon: <FiBell size={18} />, color: "#6c757d", bg: "#f0f0f0" };
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: build nội dung text hiển thị theo từng loại                */
/* ------------------------------------------------------------------ */
const getNotificationText = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    case "bai_dang_duoc_thich":
      return {
        main: (
          <>
            <strong>{data.nguoi_thich_ten}</strong> đã thích bài đăng của bạn
          </>
        ),
        sub: data.tieu_de_bai ? `"${data.tieu_de_bai}"` : null,
      };

    case "bai_dang_duoc_binh_luan":
      return {
        main: (
          <>
            <strong>{data.nguoi_binh_luan_ten}</strong> đã bình luận bài đăng
            của bạn
          </>
        ),
        sub: data.noi_dung_preview
          ? `💬 "${data.noi_dung_preview}"`
          : data.tieu_de_bai
            ? `Bài: "${data.tieu_de_bai}"`
            : null,
      };

    case "reply_comment":
      return {
        main: (
          <>
            <strong>{data.nguoi_reply_ten}</strong> đã trả lời bình luận của bạn
          </>
        ),
        sub: data.noi_dung ? `💬 "${data.noi_dung}"` : null,
      };

    default:
      return {
        main: data.message || "Thông báo mới",
        sub: data.ly_do ? `Lý do: ${data.ly_do}` : null,
      };
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: URL điều hướng khi click                                   */
/* ------------------------------------------------------------------ */
const getNavigatePath = (notification) => {
  const data = notification.data || {};
  const loai = data.loai || data.type;

  switch (loai) {
    // Bình luận hoặc reply → mở modal bài đăng, trỏ vào comment
    case "bai_dang_duoc_binh_luan":
    case "reply_comment":
      if (data.bai_dang_id) {
        return `/bang-tin?post=${data.bai_dang_id}&comment=${data.binh_luan_id || ""}`;
      }
      return null;

    // Thích → mở modal bài đăng
    case "bai_dang_duoc_thich":
      if (data.bai_dang_id) {
        return `/bang-tin?post=${data.bai_dang_id}`;
      }
      return null;

    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/*  Helper: format thời gian                                           */
/* ------------------------------------------------------------------ */
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};

/* ------------------------------------------------------------------ */
/*  Component chính                                                     */
/* ------------------------------------------------------------------ */
export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClickNotif = async (notif) => {
    if (!notif.read_at) await markAsRead(notif.id);

    const data = notif.data || {};
    const loai = data.loai || data.type;

    const postRelated = [
      "bai_dang_duoc_binh_luan",
      "reply_comment",
      "bai_dang_duoc_thich",
    ];

    if (postRelated.includes(loai) && data.bai_dang_id) {
      try {
        const res = await getPostDetail(data.bai_dang_id);
        const p = res?.data;

        const mappedPost = {
          id: p.id,
          type: p.loai_bai?.toLowerCase(),
          user: {
            id: p.nguoi_dung?.id,
            name: p.nguoi_dung?.ho_ten,
            avatar: p.nguoi_dung?.ho_ten?.charAt(0) || "?",
            color: "#1890ff",
          },
          location: p.dia_diem,
          time: formatPostTime(p.created_at),
          title: p.tieu_de,
          desc: p.mo_ta,
          images: p.hinh_anh_urls || [],
          trang_thai: p.trang_thai,
          nguoi_dung_id: p.nguoi_dung?.id,
          liked: p.da_thich ?? false,
          so_luot_thich: p.so_luot_thich ?? 0,
          aiSuggestions: [],

          // 👇 bonus
          highlightCommentId: data.binh_luan_id,
        };

        setSelectedPost(mappedPost);
        setModalVisible(true);
      } catch (err) {
        console.error("Không tìm thấy bài đăng:", err);
      }
    }
  };

  const dropdownContent = (
    <div className="notif-dropdown">
      <div className="notif-dropdown__header">
        <span className="notif-dropdown__title">Thông báo</span>
        {unreadCount > 0 && (
          <button className="notif-dropdown__markAll" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="notif-dropdown__list">
        {loading && notifications.length === 0 ? (
          <div className="notif-dropdown__center">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-dropdown__center">
            <Empty
              description="Không có thông báo"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          notifications.map((notif) => {
            const { icon, color, bg } = getNotificationMeta(notif);
            const { main, sub } = getNotificationText(notif);
            const isUnread = !notif.read_at;
            const hasLink = !!getNavigatePath(notif);

            return (
              <div
                key={notif.id}
                className={[
                  "notif-item",
                  isUnread ? "notif-item--unread" : "",
                  hasLink ? "notif-item--clickable" : "",
                ].join(" ")}
                onClick={() => handleClickNotif(notif)}
              >
                {/* Icon trái */}
                <div
                  className="notif-item__icon"
                  style={{ background: bg, color }}
                >
                  {icon}
                </div>

                {/* Nội dung */}
                <div className="notif-item__body">
                  <p className="notif-item__msg">{main}</p>
                  {sub && <p className="notif-item__sub">{sub}</p>}
                  <span className="notif-item__time">
                    {timeAgo(notif.created_at)}
                  </span>
                </div>

                {/* Chấm xanh nếu chưa đọc */}
                {isUnread && <span className="notif-item__dot" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        dropdownRender={() => dropdownContent}
        trigger={["click"]}
        placement="bottomRight"
      >
        <button
          type="button"
          className="app-header__iconBtn"
          aria-label="Thông báo"
        >
          <Badge count={unreadCount} size="small" offset={[0, 4]}>
            <FiBell size={22} />
          </Badge>
        </button>
      </Dropdown>
      {/* Modal bài đăng mở từ thông báo */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
}
