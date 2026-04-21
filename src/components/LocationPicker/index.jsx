import { useEffect, useRef, useState } from "react";
import { Input } from "antd";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FiMapPin } from "react-icons/fi";
import "./styles.scss";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export default function LocationPicker({ value, onChange }) {
  const onChangeRef = useRef(onChange);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState([]);

  // ================= REVERSE =================
  async function reverseGeocode(lng, lat) {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      );

      const data = await res.json();
      return data.features?.[0]?.place_name || "";
    } catch {
      return "";
    }
  }

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // ================= INIT MAP =================
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [108.2022, 16.0544],
      zoom: 13,
    });

    map.on("load", () => {
      const marker = new mapboxgl.Marker({ draggable: true })
        .setLngLat([108.2022, 16.0544])
        .addTo(map);

      map.on("click", async (e) => {
        const { lng, lat } = e.lngLat;

        marker.setLngLat([lng, lat]);

        const address = await reverseGeocode(lng, lat);

        setQuery(address);
        onChangeRef.current?.({ address, lat, lng });
      });

      marker.on("dragend", async () => {
        const { lng, lat } = marker.getLngLat();

        const address = await reverseGeocode(lng, lat);

        setQuery(address);
        onChangeRef.current?.({ address, lat, lng });
      });

      mapInstance.current = map;
      markerRef.current = marker;

      map.resize();
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // ================= SEARCH =================
  const searchAddress = (q) => {
    if (!q) return setSuggestions([]);

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q,
        )}.json?access_token=${mapboxgl.accessToken}&limit=5`,
      );

      const data = await res.json();
      setSuggestions(data.features || []);
    }, 400);
  };

  // ================= SELECT =================
  function handleSelect(item) {
    const [lng, lat] = item.center;

    console.log("CLICK:", lng, lat);
    console.log("MAP:", mapInstance.current);

    if (!mapInstance.current || !markerRef.current) {
      console.log("MAP NOT READY ❌");
      return;
    }

    mapInstance.current.flyTo({
      center: [lng, lat],
      zoom: 15,
    });

    markerRef.current.setLngLat([lng, lat]);

    setQuery(item.place_name);
    setSuggestions([]);

    onChange?.({
      address: item.place_name,
      lat,
      lng,
    });
  }

  return (
    <div>
      {/* INPUT */}
      <Input
        placeholder="Nhập địa điểm..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          searchAddress(e.target.value);
        }}
        prefix={<FiMapPin />}
      />

      {/* SUGGESTIONS */}
      <div className="cc-suggest">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="cc-suggest__item"
            onClick={() => handleSelect(item)}
          >
            {item.place_name}
          </div>
        ))}
      </div>

      {/* MAP */}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: 300,
          marginTop: 12,
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </div>
  );
}
