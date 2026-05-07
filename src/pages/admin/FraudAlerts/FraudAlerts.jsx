import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import {
  FiAlertTriangle,
  FiShield,
  FiCpu,
  FiUser,
  FiX,
  FiClock,
  FiEye,
  FiSearch,
  FiInfo,
  FiFlag,
  FiHash,
  FiActivity
} from "react-icons/fi";
import useAdminStore from "../../../store/adminStore";
import "./FraudAlerts.scss";

const riskClass = (risk) => {
  if (risk === "HIGH") return "red";
  if (risk === "MEDIUM") return "yellow";
  return "green";
};

const sourceTag = (src) => {
  if (String(src || "").startsWith("AI")) return { text: src || "AI", cls: "purple", icon: <FiCpu size={11} /> };
  if (src === "USER" || src === "USER_REPORT") return { text: "USER", cls: "blue", icon: <FiUser size={11} /> };
  if (src === "RULE") return { text: "RULE", cls: "red", icon: <FiShield size={11} /> };
  return { text: src || "N/A", cls: "gray", icon: null };
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN");
};

const normalizeStorageImageUrl = (raw) => {
  if (!raw) return "";
  const s = String(raw).trim();
  if (!s) return "";
  if (s.startsWith("http")) return s;
  return `/storage/${s.replace(/^\/+/, "")}`;
};

const firstPostImageSrc = (hinhRaw) => {
  const list = Array.isArray(hinhRaw) ? hinhRaw : hinhRaw ? [hinhRaw] : [];
  const first = list[0];
  return normalizeStorageImageUrl(first);
};

const truncateText = (str, max = 160) => {
  if (!str) return "";
  const t = String(str).trim().replace(/\s+/g, " ");
  return t.length <= max ? t : `${t.slice(0, max)}…`;
};

export default function FraudAlerts() {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [decisionNote, setDecisionNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState("");
  const [detailItems, setDetailItems] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const formatViolation = (key) => {
    if (!key) return { title: "—" };

    if (key.startsWith("content_variance_too_high")) {
      const match = key.match(/cv_(\d+(\.\d+)?)/);
      const cv = match ? parseFloat(match[1]) : null;

      const level =
        cv > 0.7 ? "Cao" :
          cv > 0.4 ? "Trung bình" : "Thấp";
      const desc = cv ? `Độ biến thiên: ${cv} (${level})` : undefined;
      return {
        title: "Nội dung biến đổi bất thường",
        desc: desc,
      };
    } if (key.startsWith("posting_frequently")) {
      return {
        title: "Đăng bài thường xuyên",
        desc: "3 bài trong 10 phút",
      };
    }

    if (key.startsWith("duplicate_content")) {
      return {
        title: "Nội dung trùng lặp",
        desc: "100%",
      };
    }
    if (key.startsWith("burst_activity")) {
      const match = key.match(/(\d+)/);
      const count = match ? match[1] : null;

      return {
        title: "Hoạt động bất thường",
        desc: count ? `${count} lần` : undefined,
      };
    } if (key.includes("same_ip")) {
      return {
        title: "Nhiều tài khoản cùng IP",
        desc: "Có dấu hiệu tạo nhiều tài khoản từ cùng địa chỉ IP",
      };
    }

    if (key.includes("activity_score")) {
      return {
        title: "Hoạt động bất thường",
        desc: "Tần suất hoạt động vượt ngưỡng bình thường",
      };
    }

    if (key.includes("donation_growth")) {
      return {
        title: "Tăng trưởng quyên góp bất thường",
        desc: "Số tiền tăng đột biến trong thời gian ngắn",
      };
    }

    if (key.includes("max_jump")) {
      return {
        title: "Biến động số tiền lớn",
        desc: "Có giao dịch tăng đột biến bất thường",
      };
    }
    const map = {
      posting_too_fast_5_in_10min: {
        title: "Đăng bài quá nhanh",
        desc: "5 bài trong 10 phút",
      },
      duplicate_content_100: {
        title: "Nội dung trùng lặp",
        desc: "100%",
      },
      spam_post: {
        title: "Spam bài đăng",
      },
      high_frequency: {
        title: "Tần suất bất thường",
      },
    };

    return map[key] || { title: key };
  };

  const {
    fraudAlerts,
    fetchFraudAlerts,
    loadingReports,
    resolveViolation,
    handleSuspendPost,
    handleSuspendCampaign,
    fetchPostViolations,
    fetchCampaignViolations,
  } = useAdminStore();

  const navigate = useNavigate();

  useEffect(() => {
    fetchFraudAlerts(true);
  }, [fetchFraudAlerts]);
  const [activeFilter, setActiveFilter] = useState(null);
  const alerts = useMemo(() => (Array.isArray(fraudAlerts) ? fraudAlerts : []), [fraudAlerts]);
  const filtered = useMemo(() => {
    let data = Array.isArray(fraudAlerts) ? fraudAlerts : [];

    // 🔍 filter theo search
    const q = keyword.trim().toLowerCase();
    if (q) {
      data = data.filter((a) => {
        const haystack = [
          a.id,
          a.source,
          a.type,
          a.target,
          a.post?.tieu_de,
          a.loai_canh_bao,
          a.ly_do,
          a.user_id,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    // 🎯 filter theo stat box
    if (activeFilter === "pending") {
      data = data.filter(a => a.trang_thai === "CHO_XU_LY");
    }

    if (activeFilter === "high") {
      data = data.filter(a => a.muc_rui_ro === "HIGH");
    }

    if (activeFilter === "ai") {
      data = data.filter(a => String(a.source || "").startsWith("AI"));
    }

    if (activeFilter === "user") {
      data = data.filter(a => a.source === "USER_REPORT");
    }

    if (activeFilter === "done") {
      data = data.filter(a => a.trang_thai !== "CHO_XU_LY");
    }

    return data;
  }, [fraudAlerts, keyword, activeFilter]);

  const selected =
    filtered.find((a) => Number(a.id) === Number(selectedId)) ||
    alerts.find(a => String(a.id) === String(selectedId)) || null;
  const hasDetail = !!selected;

  const getViolationKey = (item) => {
    const raw = String(
      item.violation_code ||
      item.loai_canh_bao ||
      item.loai_gian_lan ||
      ""
    ).toLowerCase();

    if (raw.includes("posting")) return "POSTING_TOO_FAST";
    if (raw.includes("duplicate")) return "DUPLICATE_CONTENT";
    if (raw.includes("variance")) return "CONTENT_VARIANCE";

    return raw.toUpperCase();
  };
  const relatedPreview = useMemo(() => {
    if (!selected) return null;
    const bd = selected.post;
    const cd = selected.campaign;
    const tt = String(selected.target_type || "").toUpperCase();
    const id = selected.target_id;
    if (tt === "POST" && id) {

      const title = bd?.tieu_de || `Bài đăng #${id}`;
      const bodyPreview = truncateText(
        bd?.mo_ta ?? selected.mo_ta ?? "",
        180
      );


      const img = firstPostImageSrc(bd?.hinh_anh);

      return {
        category: "POST",
        detailLabel: "Xem chi tiết bài đăng",
        titleLabel: "Tiêu đề",
        titleText: title,
        bodyLabel: "Nội dung",
        bodyText:
          bodyPreview ||
          truncateText(selected.reason_text ?? selected.mo_ta ?? "", 180) ||
          "Không có mô tả",
        thumb: img || "/default.png",
        canNavigate: true,
      };
    }
    if (tt === "CAMPAIGN" && id) {
      const title = cd?.ten || `Chiến dịch #${id}`;
      const bodyPreview = truncateText(
        selected.mo_ta ?? selected.reason_text ?? "",
        180,
      );
      return {
        category: "CAMPAIGN",
        detailLabel: "Xem chi tiết chiến dịch",
        titleLabel: "Tên chiến dịch",
        titleText: title,
        bodyLabel: "Ghi chú",
        bodyText:
          bodyPreview ||
          "Mở chiến dịch để xem đầy đủ thông tin.",
          thumb: normalizeStorageImageUrl(cd?.hinh_anh) || "/default.png",

        canNavigate: true,
      };
    }
    return null;
  }, [selected]);
  const v = formatViolation(
    selected?.violation_code ||
    selected?.loai_canh_bao ||
    selected?.loai_gian_lan
  );

  const vKey = selected ? getViolationKey(selected) : null;
  const descriptionMap = {
    POSTING_TOO_FAST: "Người dùng đăng nhiều bài trong thời gian ngắn, vượt ngưỡng cho phép.",
    DUPLICATE_CONTENT: "Nhiều bài đăng có nội dung giống nhau hoặc trùng lặp cao.",
    CONTENT_VARIANCE: "Nội dung thay đổi bất thường, có dấu hiệu spam hoặc tự động.",
  };
  const detailsDep = selected?.details;
  const aggregatedDetails = useMemo(() => {
    const raw = detailsDep;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x) => x && typeof x === "object")
      .map((x) => ({
        type: String(x.type || "").toLowerCase(),
        id: Number(x.id || 0),
      }))
      .filter((x) => (x.type === "post" || x.type === "campaign") && Number.isFinite(x.id) && x.id > 0);
  }, [detailsDep]);

  const openAggregatedPost = (postId) => {
    if (!postId) return;
    navigate("/admin/posts", { state: { openPostId: postId } });
  };

  const goToRelatedDetail = () => {
    if (!selected?.target_id) return;
    const tt = String(selected.target_type || "").toUpperCase();
    if (tt === "POST") {
      navigate("/admin/posts", { state: { openPostId: selected.target_id } });
      return;
    }
    if (tt === "CAMPAIGN") {
      navigate("/admin/projects", { state: { openCampaignId: selected.target_id } });
    }
  };

  const renderTargetLabelInTable = (item) => {
    const tt = String(item.target_type || "").toUpperCase();

    if (tt === "POST" && item.target_id) {
      return (
        <div className="target-cell">
          <div className="target-title">
            Bài đăng #{item.target_id}
          </div>
          <div className="target-sub">
            User: {item.user_name || `#${item.user_id}`}
          </div>
        </div>
      );
    }
    if (tt === "CAMPAIGN" && item.target_id) {
      return (
        <div className="target-cell">
          
          <div className="target-title">

            {item.campaign_name || `Chiến dịch #${item.target_id}`}
          </div>

          <div className="target-sub">
            Tổ chức: {item.campaign?.organization_name || "—"}
          </div>
        </div>
      );
    }

    return item.target || `${item.target_type || "item"} #${item.target_id || "?"}`;
  };
  const renderSubjectBlock = () => {
    const tt = String(selected.target_type || "").toUpperCase();
    const id = selected.target_id;
    if ((tt === "POST" || tt === "CAMPAIGN") && id) {
      return (
        <button type="button" className="frd__subject-link" onClick={goToRelatedDetail}>
          {tt === "POST"
            ? `Bài đăng #${id}`
            : `Chiến dịch #${id}`}
        </button>
      );
    }
    return (
      <strong>
        {selected.target || `${selected.target_type || "item"} #${selected.target_id ?? "?"}`}
      </strong>
    );
  };

  useEffect(() => {
    let cancelled = false;
    const loadDetail = async () => {
      if (!selected || !selected.target_id) {
        setDetailItems([]);
        return;
      }

      setLoadingDetail(true);

      try {
        let rows = [];

        if (selected.target_type === "POST") {
          const res = await fetchPostViolations(selected.target_id);
          rows = res || [];
        } else if (selected.target_type === "CAMPAIGN") {
          const res = await fetchCampaignViolations(selected.target_id);
          rows = res || [];
        } else {
          rows = [selected]; // fallback
        }

        if (!cancelled) {
          setDetailItems(Array.isArray(rows) ? rows : []);
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId, selected, fetchPostViolations, fetchCampaignViolations]);

  const pendingCount = alerts.filter((a) => a.trang_thai === "CHO_XU_LY").length;
  const highCount = alerts.filter((a) => a.muc_rui_ro === "HIGH").length;
  const aiCount = alerts.filter((a) => String(a.source || "").startsWith("AI")).length;
  const userCount = alerts.filter((a) => a.source === "USER_REPORT").length;
  const handledCount = alerts.filter((a) => a.trang_thai !== "CHO_XU_LY").length;
  const toDisplayStatus = (status) => {
    if (status === "CHO_XU_LY") return "Chờ xử lý";
    if (status === "CANH_BAO_SAI" || status === "TU_CHOI") return "Không vi phạm";
    if (status === "DA_XU_LY" || status === "DA_KIEM_TRA") return "Đã xử lý";
    return status || "—";
  };

  const mapDecisionToStatus = (item, decision) => {
    const isUserReport = item?.source === "USER_REPORT";
    if (isUserReport) {
      return {
        trang_thai: decision === "VI_PHAM" ? "DA_XU_LY" : "TU_CHOI",
      };
    }

    // Backend FraudController@updateAlert expects:
    // - trang_thai: CHO_XU_LY | DA_XU_LY (it will validate)
    // - decision: VI_PHAM | KHONG_VI_PHAM
    return {
      trang_thai: "DA_XU_LY",
      decision: decision === "VI_PHAM" ? "VI_PHAM" : "KHONG_VI_PHAM",
    };
  };
  const reasonList = String(selected?.ly_do || "")
    .split("|")
    .map(r => r.trim())
    .filter(Boolean);
  const submitDecision = async (decision) => {
    if (!selected || submittingAction) return;
    if (!decisionNote.trim()) {
      notification.warning({ message: "Vui lòng nhập ghi chú xử lý.", placement: "topRight" });
      return;
    }
    setSubmittingAction(decision);
    try {
      const statusToUpdate = mapDecisionToStatus(selected, decision);

      if (decision === "VI_PHAM" && selected.target_type === "POST" && selected.target_id && selected.source !== "USER_REPORT") {
        await handleSuspendPost(selected.target_id, decisionNote.trim() || selected.reason_text || "Tạm dừng do vi phạm");
      }
      if (decision === "VI_PHAM" && selected.target_type === "CAMPAIGN" && selected.target_id) {
        await handleSuspendCampaign(selected.target_id, decisionNote.trim() || selected.reason_text || "Tạm dừng do vi phạm");
      }

      const ok = await resolveViolation(selected, statusToUpdate);
      if (ok) {
        notification.success({ message: "Đã cập nhật xử lý cảnh báo", placement: "topRight" });
        setDecisionNote("");
        setSelectedId(null);
        await fetchFraudAlerts(true);
      } else {
        notification.error({ message: "Cập nhật xử lý thất bại", placement: "topRight" });
      }
    } finally {
      setSubmittingAction("");
    }
  };
  const grouped = {};

  (detailItems || [])
    .filter((item) => item.id !== selected?.id)
    .forEach((item) => {
      const key = getViolationKey(item);

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);
    });

  return (
    <div className="frd">
      <div className="adm-ph">
        <div>
          <h1 className="adm-ph__title">🛡️ Cảnh báo gian lận</h1>
          <p className="adm-ph__sub">Theo dõi và xử lý cảnh báo AI / USER / RULE</p>
        </div>
      </div>

      <div className="frd__stats">
        <div className={`frd__stat pending ${activeFilter === "pending" ? "active" : ""}`} onClick={() => setActiveFilter("pending")}>
          <span>Chờ xử lý</span>
          <strong>{pendingCount}</strong>
        </div>

        <div className={`frd__stat high ${activeFilter === "high" ? "active" : ""}`} onClick={() => setActiveFilter("high")}>
          <span>Mức độ cao</span>
          <strong>{highCount}</strong>
        </div>

        <div className={`frd__stat ai ${activeFilter === "ai" ? "active" : ""}`} onClick={() => setActiveFilter("ai")}>
          <span>AI phát hiện</span>
          <strong>{aiCount}</strong>
        </div>

        <div className={`frd__stat user ${activeFilter === "user" ? "active" : ""}`} onClick={() => setActiveFilter("user")}>
          <span>Báo cáo người dùng</span>
          <strong>{userCount}</strong>
        </div>

        <div className={`frd__stat done ${activeFilter === "done" ? "active" : ""}`} onClick={() => setActiveFilter("done")}>
          <span>Đã xử lý</span>
          <strong>{handledCount}</strong>
        </div>
      </div>

      <div className={`frd__layout ${hasDetail ? "has-detail" : ""}`}>
        <div className="adm-box frd__left">
          <div className="adm-box__head">
            <span className="adm-box__title">Danh sách cảnh báo gian lận</span>
            <span className="adm-box__badge">{filtered.length}</span>
            <div className="frd__search">
              <FiSearch size={14} />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm cảnh báo..."
              />
            </div>
          </div>
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nguồn</th>
                  <th>Loại cảnh báo</th>
                  <th>Đối tượng</th>
                  <th>Mức độ</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingReports ? (
                  <tr><td colSpan={7}>Đang tải...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7}>Không có cảnh báo</td></tr>
                ) : (
                  filtered.map((item) => {
                    const source = sourceTag(item.source);
                    const v = formatViolation(
                      item.violation_code || item.loai_canh_bao || item.loai_gian_lan
                    );
                    return (
                      <tr key={item.id} className={selected?.id === item.id ? "frd__row--active" : ""}>
                        <td>{item.id}</td>
                        <td>
                          <span className={`adm-tag adm-tag--${source.cls}`}>{source.icon} {source.text}</span>
                        </td>
                        <td>
                          <div className="violation-cell">
                            <div className="violation-title">{v.title}</div>
                            {v.desc && <div className="violation-desc">{v.desc}</div>}
                          </div>
                        </td>
                        <td>{renderTargetLabelInTable(item)}</td>
                        <td><span className={`adm-tag adm-tag--${riskClass(item.muc_rui_ro)}`}>{item.muc_rui_ro || "LOW"}</span></td>
                        <td>
                          <span className={`status-badge ${item.trang_thai}`}>
                            {toDisplayStatus(item.trang_thai)}
                          </span>
                        </td>
                        <td>
                          <button className="adm-btn adm-btn--ghost adm-btn--sm adm-btn--icon" onClick={() => setSelectedId(item.id)}>
                            <FiEye size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasDetail && (
          <div className="adm-box frd__right">
            <div className="frd__detail-head">
              <h3>Chi tiết cảnh báo #{selected.id}</h3>
              <button className="frd__close-btn" type="button" onClick={() => setSelectedId(null)}>
                <FiX size={16} />
              </button>
            </div>
            <div className="frd__detail-body">
              <div className={`frd__risk-badge ${riskClass(selected.muc_rui_ro)}`}>{selected.muc_rui_ro || "LOW"}</div>

              <div className="frd__grid-two">
                <div className="frd__detail-item">
                  <span className="icon purple"><FiCpu /> Nguồn</span>
                  <div className="blue">{selected.source || "—"}</div >
                </div>

                <div className="frd__detail-item">
                  <span className="icon orange"><FiActivity /> Mức điểm rủi ro</span>
                  <div className="orange">{selected.diem_rui_ro || 0} / 100</div >
                </div>

                <div className="frd__detail-item">
                  <span className="icon blue"><FiFlag /> Loại cảnh báo</span>
                  <div className="violation-cell">
                    <div className="violation-title">{v.title}</div>
                    {v.desc && <div className="violation-desc">{v.desc}</div>}
                  </div>
                </div>

                <div className="frd__detail-item">
                  <span className="icon red"><FiAlertTriangle /> Trạng thái</span>
                  <div className={selected.trang_thai === "CHO_XU_LY" ? "red" : "green"}>
                    {toDisplayStatus(selected.trang_thai)}
                  </div >
                </div>

                <div className="frd__detail-item">
                  <span className="icon cyan"><FiHash /> Đối tượng</span>
                  {renderSubjectBlock()}
                </div>

                <div className="frd__detail-item">
                  <span className="icon indigo"><FiUser /> Người dùng</span>
                  <div >{selected.user_id ? `User #${selected.user_id}` : "—"}</div >
                </div>

                <div className="frd__detail-item">
                  <span className="icon gray"><FiClock /> Thời gian</span>
                  <div >{formatDateTime(selected.created_at)}</div >
                </div>
                <div className="frd__detail-item">
                  <span className="icon gray"><FiInfo /> Mô tả</span>
                  <div >
                    {
                      truncateText(selected.reason_text ?? selected.mo_ta ?? "", 180) ||
                      descriptionMap[vKey] ||
                      "Không có mô tả"
                    }
                  </div >                </div>
              </div>

              <div className="frd__reason">
                <div className="frd__reason-title">Lý do</div>
                <ul>
                  {reasonList.map((r, i) => {
                    const vr = formatViolation(r);
                    return (
                      <li key={i}>
                        <strong >{vr.title}</strong>
                        {vr.desc && <span> ({vr.desc})</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="frd__related">
                <div className="frd__reason-title">Nội dung liên quan</div>
                {relatedPreview ? (
                  <div className="frd__related-card frd__related-card--row">
                    <div className="frd__related-thumb">
                      <img src={relatedPreview.thumb} alt="" />
                    </div>
                    <div className="frd__related-copy">
                      <div className="frd__related-line frd__related-line--title">
                        <span className="frd__related-k">{relatedPreview.titleLabel}:</span>{" "}
                        <span className="frd__related-v">{relatedPreview.titleText}</span>
                      </div>
                      <div className="frd__related-line">
                        <span className="frd__related-k">{relatedPreview.bodyLabel}:</span>{" "}
                        <span className="frd__related-v">{relatedPreview.bodyText}</span>
                      </div>
                    </div>
                    {relatedPreview.canNavigate ? (
                      <button
                        type="button"
                        className="adm-btn adm-btn--sm frd__related-open"
                        onClick={goToRelatedDetail}
                      >
                        <FiEye size={14} style={{ marginRight: 6 }} />
                        {relatedPreview.detailLabel}
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div className="frd__related-card">
                    <div className="frd__related-text">
                      <p>
                        Cảnh báo này không gắn với bài đăng hay chiến dịch cụ thể (ví dụ cảnh báo theo tài khoản).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {aggregatedDetails.length > 0 && (
                <div className="frd__related">
                  <div className="frd__reason-title">Danh sách đối tượng liên quan</div>
                  <div className="frd__related-card">
                    <div className="frd__related-text">
                      <p style={{ marginBottom: 8 }}>
                        {`Có ${aggregatedDetails.length} mục liên quan.`}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {aggregatedDetails.slice(0, 16).map((d) => {
                          if (d.type === "post") {
                            return (
                              <button
                                key={`post-${d.id}`}
                                type="button"
                                className="adm-tag adm-tag--blue"
                                style={{ border: "none", cursor: "pointer" }}
                                onClick={() => openAggregatedPost(d.id)}
                                title="Mở chi tiết bài đăng"
                              >
                                {`Post #${d.id}`}
                              </button>
                            );
                          }
                          return (
                            <span key={`${d.type}-${d.id}`} className="adm-tag adm-tag--gray">
                              {`${d.type} #${d.id}`}
                            </span>
                          );
                        })}
                        {aggregatedDetails.length > 16 ? (
                          <span className="adm-tag adm-tag--gray">{`+${aggregatedDetails.length - 16} mục`}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="frd__related">
                <div className="frd__reason-title">Lịch sử vi phạm cùng đối tượng</div>
                {loadingDetail ? (
                  <div className="frd__related-card">
                    <div className="frd__related-text">
                      <p>Đang tải chi tiết...</p>
                    </div>
                  </div>
                ) : Object.keys(grouped).length === 0 ? (
                  <div className="frd__related-card">
                    <div className="frd__related-text">
                      <p>Không có dữ liệu chi tiết.</p>
                    </div>
                  </div>

                ) : (
                  Object.entries(grouped).map(([key, items]) => {
                    const v = formatViolation(key);

                    return (
                      <div className="frd__related-card" key={key}>
                        <div className="frd__related-icon">
                          <FiAlertTriangle size={14} />
                        </div>

                        <div className="frd__related-text">
                          <strong>{v.title}</strong>

                          {/* 🔥 số lần */}
                          <p>{items.length} lần</p>

                          {/* 🔥 thời gian gần nhất */}
                          <p>
                            {toDisplayStatus(items[0].trang_thai)} •{" "}
                            {formatDateTime(items[0].created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })

                )}
              </div>

              {selected.trang_thai === "CHO_XU_LY" && (
                <>
                  <div className="frd__reason-title">Hành động</div>
                  <div className="frd__actions">
                    <button
                      className="frd__action-btn ok"
                      disabled={!!submittingAction}
                      onClick={() => submitDecision("KHONG_VI_PHAM")}
                    >
                      Không vi phạm
                    </button>
                    <button
                      className="frd__action-btn violation"
                      disabled={!!submittingAction}
                      onClick={() => submitDecision("VI_PHAM")}
                    >
                      Vi phạm
                    </button>
                    <button
                      className="frd__action-btn skip"
                      disabled={!!submittingAction}
                      onClick={() => submitDecision("KHONG_VI_PHAM")}
                    >
                      Bỏ qua
                    </button>
                  </div>
                  <textarea
                    className="adm-input frd__note"
                    placeholder="Ghi chú (bắt buộc khi xử lý)"
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
