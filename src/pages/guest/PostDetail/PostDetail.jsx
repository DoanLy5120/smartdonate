import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import usePostStore from "../../../store/postStore";
import PostCard from "../../../components/PostCard";
import { formatPostTime } from "../../../utils/formatTime";

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
        loai_bai: raw.loai_bai,
        trang_thai: raw.trang_thai,
        title: raw.tieu_de,
        tieu_de: raw.tieu_de,
        desc: raw.mo_ta,
        mo_ta: raw.mo_ta,
        location: raw.dia_diem,
        dia_diem: raw.dia_diem,
        time: formatPostTime(raw.created_at),
        images: raw.hinh_anh_urls || [],
        so_luong: raw.so_luong ?? null,
        nguoi_dung_id: raw.nguoi_dung?.id,
        liked: raw.da_thich ?? false,
        so_luot_thich: raw.so_luot_thich ?? 0,
        so_binh_luan: raw.so_binh_luan ?? 0,
        user: {
          id: raw.nguoi_dung?.id,
          name: raw.nguoi_dung?.ho_ten,
          avatar: raw.nguoi_dung?.ho_ten?.charAt(0) || "?",
          avatar_url: raw.nguoi_dung?.anh_dai_dien || null,
          color: "#1890ff",
        },
      }
    : null;

  if (!ready)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          color: "#888",
        }}
      >
        Đang tải...
      </div>
    );

  if (!post)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 12,
        }}
      >
        <p>Không tìm thấy bài đăng.</p>
        <button onClick={() => navigate("/bang-tin")}>Về bảng tin</button>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Topbar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "12px 16px",
          boxShadow: "0 1px 4px rgba(0,0,0,.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          onClick={() => navigate("/bang-tin")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 15,
            color: "#333",
          }}
        >
          <FiArrowLeft size={20} /> Quay lại
        </button>
      </div>

      {/* PostCard */}
      <div style={{ maxWidth: 680, margin: "24px auto", padding: "0 16px" }}>
        <PostCard post={post} />
      </div>
    </div>
  );
}
