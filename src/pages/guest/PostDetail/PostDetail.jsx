// src/pages/PostDetail/index.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import usePostStore from "../../../store/postStore";
import PostModal from "../../../components/PostModal/index.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchPostDetail, postDetail } = usePostStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (id) fetchPostDetail(id).finally(() => setReady(true));
  }, [id]);

  const raw = postDetail[String(id)];
  const post = raw
    ? {
        id: raw.id,
        type: raw.loai_bai?.toLowerCase(),
        user: {
          id: raw.nguoi_dung?.id,
          name: raw.nguoi_dung?.ho_ten,
          avatar: raw.nguoi_dung?.ho_ten?.charAt(0) || "?",
          avatar_url: raw.nguoi_dung?.anh_dai_dien || null,
          color: "#1890ff",
        },
        location: raw.dia_diem,
        time: raw.created_at,
        title: raw.tieu_de,
        desc: raw.mo_ta,
        images: raw.hinh_anh_urls || [],
        trang_thai: raw.trang_thai,
        nguoi_dung_id: raw.nguoi_dung?.id,
        liked: raw.da_thich ?? false,
        so_luot_thich: raw.so_luot_thich ?? 0,
      }
    : null;

  if (!ready) return <div style={{ padding: 40, textAlign: "center" }}>Đang tải...</div>;
  if (!post) return <div style={{ padding: 40, textAlign: "center" }}>Không tìm thấy bài đăng.</div>;

  return (
    <PostModal
      post={post}
      visible={true}
      onClose={() => navigate(-1)} // quay lại trang trước
    />
  );
}