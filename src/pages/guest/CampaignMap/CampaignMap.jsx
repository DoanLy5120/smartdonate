import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FiSearch, FiMapPin, FiX } from "react-icons/fi";
import api from "../../../api/authService";
import { getCampaignDetail } from "../../../api/campaignService";
import useCategories from "../../../hooks/useCategories";
import Header from "../../../components/Header/index";
import "./CampaignMap.scss";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

// Vietnam center
const VN_CENTER = [108.2, 16.0];
const DEFAULT_ZOOM = 5.5;

export default function CampaignMap() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const { categories } = useCategories();

  const [points, setPoints] = useState([]); // [{id, lat, lng}]
  const [campaigns, setCampaigns] = useState([]); // chi tiết campaign
  const [selected, setSelected] = useState(null); // detail
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState(0);

  // Fetch markers từ /map/campaigns
  const fetchMapPoints = useCallback(async () => {
    try {
      const res = await api.get("/map/campaigns");
      setPoints(res.data || []);
    } catch (err) {
      console.error("Lỗi load map points:", err);
    }
  }, []);

  // Fetch campaign list để show sidebar
  const fetchCampaignList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/campaigns", {
        params: {
          keyword: keyword || undefined,
          danh_muc_id: categoryId || undefined,
          per_page: 100,
        },
      });
      const data = res.data?.data || [];
      // Chỉ lấy HOAT_DONG (BE đã filter, nhưng lọc lần nữa cho chắc)
      setCampaigns(data.filter((c) => c.trang_thai === "HOAT_DONG"));
    } catch (err) {
      console.error("Lỗi load campaigns:", err);
    } finally {
      setLoading(false);
    }
  }, [keyword, categoryId]);

  useEffect(() => {
    fetchMapPoints();
  }, [fetchMapPoints]);

  useEffect(() => {
    fetchCampaignList();
  }, [fetchCampaignList]);

  // Init map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    if (!mapboxgl.accessToken) {
      console.error("Thiếu VITE_MAPBOX_TOKEN trong .env");
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: VN_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.current.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: false }), "top-right");
    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Render markers (filter theo points + campaigns hiện có)
  useEffect(() => {
    if (!map.current || !points.length) return;

    // Clear cũ
    markers.current.forEach((m) => m.remove());
    markers.current = [];

    // Set id của campaigns đang hiện sidebar
    const visibleIds = new Set(campaigns.map((c) => c.id));

    points.forEach((p) => {
      // Chỉ render marker cho campaigns đang hiện sidebar
      if (visibleIds.size && !visibleIds.has(p.id)) return;

      const el = document.createElement("div");
      el.className = "cm-marker";
      el.innerHTML = `<div class="cm-marker__pin"></div>`;

      el.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          const detail = await getCampaignDetail(p.id);
          setSelected(detail);
          map.current.flyTo({ center: [Number(p.lng), Number(p.lat)], zoom: 14 });
        } catch (err) {
          console.error("Lỗi load chi tiết:", err);
        }
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([Number(p.lng), Number(p.lat)])
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [points, campaigns]);

  // Click item sidebar → fly to + open detail
  const handleClickSidebar = async (camp) => {
    const point = points.find((p) => p.id === camp.id);
    if (!point) return;
    try {
      const detail = await getCampaignDetail(camp.id);
      setSelected(detail);
      map.current?.flyTo({
        center: [Number(point.lng), Number(point.lat)],
        zoom: 14,
        essential: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") fetchCampaignList();
  };

  const fmtVnd = (n) => Number(n || 0).toLocaleString("vi-VN") + "đ";

  if (!mapboxgl.accessToken) {
    return (
      <>
        <Header />
        <div className="cm-error">
          <h3>⚠️ Thiếu cấu hình Mapbox</h3>
          <p>Vui lòng thêm <code>VITE_MAPBOX_TOKEN=your_token</code> vào file <code>.env</code></p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cm-page">
        {/* Sidebar list */}
        <aside className="cm-sidebar">
          <div className="cm-search">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Tìm chiến dịch theo tên..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="cm-cat-row">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="cm-cat-select"
            >
              <option value={0}>Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.ten_danh_muc}</option>
              ))}
            </select>
          </div>

          <div className="cm-count">
            <FiMapPin size={13} /> <strong>{campaigns.length}</strong> chiến dịch đang hoạt động
          </div>

          <div className="cm-list">
            {loading ? (
              <div className="cm-loading">Đang tải...</div>
            ) : campaigns.length === 0 ? (
              <div className="cm-empty">Không có chiến dịch nào</div>
            ) : (
              campaigns.map((c) => (
                <div
                  key={c.id}
                  className={`cm-item${selected?.id === c.id ? " active" : ""}`}
                  onClick={() => handleClickSidebar(c)}
                >
                  <div className="cm-item__img">
                    {c.hinh_anh ? (
                      <img src={c.hinh_anh} alt={c.ten_chien_dich} />
                    ) : (
                      <div className="cm-item__placeholder">📷</div>
                    )}
                  </div>
                  <div className="cm-item__info">
                    <div className="cm-item__name">{c.ten_chien_dich}</div>
                    <div className="cm-item__org">{c.ten_to_chuc}</div>
                    <div className="cm-item__bar">
                      <div
                        className="cm-item__fill"
                        style={{ width: `${Math.min(c.phan_tram, 100)}%` }}
                      />
                    </div>
                    <div className="cm-item__meta">
                      <span>{fmtVnd(c.so_tien_da_nhan)}</span>
                      <span>{c.phan_tram}%</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="cm-map-wrap">
          <div ref={mapContainer} className="cm-map" />
        </div>

        {/* Detail panel khi click marker */}
        {selected && (
          <div className="cm-detail">
            <button className="cm-detail__close" onClick={() => setSelected(null)}>
              <FiX size={18} />
            </button>

            {selected.hinh_anh?.[0] && (
              <div className="cm-detail__hero">
                <img src={selected.hinh_anh[0]} alt={selected.ten_chien_dich} />
              </div>
            )}

            <div className="cm-detail__body">
              <div className="cm-detail__cat">{selected.ten_danh_muc}</div>
              <h3 className="cm-detail__title">{selected.ten_chien_dich}</h3>

              <div className="cm-detail__org">
                {selected.to_chuc?.logo && (
                  <img src={selected.to_chuc.logo} alt="logo" />
                )}
                <span>{selected.to_chuc?.ten_to_chuc}</span>
              </div>

              <div className="cm-detail__loc">
                <FiMapPin size={13} /> {selected.vi_tri || "Chưa có địa chỉ"}
              </div>

              <div className="cm-detail__progress">
                <div className="cm-detail__bar">
                  <div
                    className="cm-detail__fill"
                    style={{ width: `${Math.min(selected.phan_tram, 100)}%` }}
                  />
                </div>
                <div className="cm-detail__stat">
                  <div>
                    <strong>{fmtVnd(selected.so_tien_da_nhan)}</strong>
                    <span>đã quyên góp</span>
                  </div>
                  <div className="cm-detail__pct">{selected.phan_tram}%</div>
                </div>
                <div className="cm-detail__goal">
                  Mục tiêu: <strong>{fmtVnd(selected.muc_tieu_tien)}</strong>
                </div>
                <div className="cm-detail__days">
                  Còn <strong>{selected.so_ngay_con_lai}</strong> ngày · {selected.so_luot_ung_ho || 0} lượt ủng hộ
                </div>
              </div>

              <div className="cm-detail__actions">
                <button
                  className="cm-btn cm-btn--primary"
                  onClick={() => navigate(`/chien-dich/chi-tiet/${selected.id}`)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}