import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Loader from "../components/Loader";
import { getContainers } from "../api/containers";
import { getMeasurements } from "../api/measurements";
import { getZones } from "../api/zones";
import { useToast } from "../context/ToastContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TYPE_LABELS = { OMR: "Ordures ménagères", RECYCLABLE: "Recyclable", VERRE: "Verre", COMPOST: "Compost" };
const DEFAULT_CENTER = [46.6, 2.3];

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371, r = (d) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fillColor(pct) {
  if (pct >= 90) return "#ef4444";
  if (pct >= 70) return "#f59e0b";
  return "#22c55e";
}

function fillLabel(pct) {
  if (pct >= 90) return "Critique";
  if (pct >= 70) return "Attention";
  return "Normal";
}

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,0.45);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function parseEWKBHex(hex) {
  try {
    const le = hex.slice(0, 2) === "01";
    const typeInt = le
      ? parseInt(hex.slice(2, 10).match(/../g).reverse().join(""), 16)
      : parseInt(hex.slice(2, 10), 16);
    const hasSRID = (typeInt & 0x20000000) !== 0;
    const offset = 10 + (hasSRID ? 8 : 0);
    const toDouble = (h) => {
      const buf = new ArrayBuffer(8), view = new DataView(buf);
      for (let i = 0; i < 8; i++) view.setUint8(i, parseInt(h.slice(i * 2, i * 2 + 2), 16));
      return view.getFloat64(0, le);
    };
    const lng = toDouble(hex.slice(offset, offset + 16));
    const lat = toDouble(hex.slice(offset + 16, offset + 32));
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  } catch { return null; }
}

function parseCoords(raw) {
  if (!raw) return null;
  if (typeof raw === "object" && raw.type === "Point" && Array.isArray(raw.coordinates)) {
    const [lng, lat] = raw.coordinates;
    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
  }
  if (typeof raw === "string" && raw.startsWith("{")) {
    try {
      const g = JSON.parse(raw);
      if (g?.type === "Point") { const [lng, lat] = g.coordinates; return [lat, lng]; }
    } catch { }
  }
  if (typeof raw === "string" && raw.length >= 42) return parseEWKBHex(raw);
  return null;
}

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [60, 60] });
    else if (points.length === 1) map.setView(points[0], 13);
  }, [points, map]);
  return null;
}

function ZoneCircle({ zone, active, onClick, containerCount }) {
  const color = zone.couleur || "#22c55e";
  return (
    <Circle
      center={[zone.center_lat, zone.center_lng]}
      radius={(zone.rayon_km || 30) * 1000}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: active ? 0.18 : 0.07,
        weight: active ? 2.5 : 1.5,
        dashArray: active ? null : "6 4",
      }}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div style={{ minWidth: 160 }}>
          <strong style={{ fontSize: "1rem" }}>{zone.nom}</strong>
          {zone.description && <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", opacity: 0.7 }}>{zone.description}</p>}
          <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem" }}>
            <strong>{containerCount}</strong> conteneur{containerCount !== 1 ? "s" : ""}
          </p>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", opacity: 0.6 }}>
            Rayon : {zone.rayon_km} km
          </p>
        </div>
      </Popup>
    </Circle>
  );
}

export default function MapView() {
  const { showToast } = useToast();
  const [containers, setContainers] = useState([]);
  const [zones, setZones] = useState([]);
  const [fillMap, setFillMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeZone, setActiveZone] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    Promise.all([getContainers(), getMeasurements({ limit: 500 }), getZones()])
      .then(([ctrs, measures, zns]) => {
        setContainers(Array.isArray(ctrs) ? ctrs : []);
        setZones(Array.isArray(zns) ? zns.filter(z => z.center_lat && z.center_lng) : []);
        const latest = {};
        for (const m of (Array.isArray(measures) ? measures : [])) {
          if (!latest[m.container_id] || m.timestamp > latest[m.container_id].timestamp)
            latest[m.container_id] = m;
        }
        setFillMap(latest);
      })
      .catch(() => showToast("Erreur chargement carte.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const withCoords = containers.filter((c) => parseCoords(c.position));

  const visibleContainers = withCoords.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (activeZone) {
      const coords = parseCoords(c.position);
      if (!coords) return false;
      const zone = zones.find((z) => z.id === activeZone);
      if (!zone) return false;
      return haversineKm(zone.center_lat, zone.center_lng, coords[0], coords[1]) <= zone.rayon_km;
    }
    return true;
  });

  const sidebarContainers = containers.filter((c) => {
    if (typeFilter !== "all" && c.type !== typeFilter) return false;
    if (activeZone) return c.zone_id === activeZone;
    return true;
  });

  const markerPoints = visibleContainers.map((c) => parseCoords(c.position)).filter(Boolean);
  const zonePoints = zones.map((z) => [z.center_lat, z.center_lng]);
  const fitPoints = markerPoints.length > 0 ? markerPoints : zonePoints;

  const critiques = Object.values(fillMap).filter((m) => m.taux_remplissage >= 90).length;
  const attention = Object.values(fillMap).filter((m) => m.taux_remplissage >= 70 && m.taux_remplissage < 90).length;

  if (loading) return <Loader />;

  return (
    <div className="map-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Vue géographique</span>
          <h1>Carte des conteneurs</h1>
          <p>Zones de collecte, conteneurs IoT et niveaux de remplissage en temps réel.</p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Conteneurs</span>
          <strong>{containers.length}</strong>
        </div>
        <div className="overview-card danger">
          <span>Critiques (≥ 90%)</span>
          <strong>{critiques}</strong>
        </div>
        <div className="overview-card warning">
          <span>Attention (70–89%)</span>
          <strong>{attention}</strong>
        </div>
        <div className="overview-card">
          <span>Zones actives</span>
          <strong>{zones.length}</strong>
        </div>
      </div>

      <div className="map-layout">
        <div className="map-panel" style={{ display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden", height: 560 }}>
          {/* Barre de contrôle */}
          <div style={{ background: "#fff", padding: "0.5rem 0.75rem", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Filtre type */}
            {[{ key: "all", label: "Tous types" }, ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ key: k, label: v }))].map(({ key, label }) => (
              <button key={key} onClick={() => setTypeFilter(key)} style={{
                fontSize: "0.76rem", padding: "0.2rem 0.65rem", borderRadius: "20px",
                border: "1px solid", cursor: "pointer",
                borderColor: typeFilter === key ? "#374151" : "#d1d5db",
                background: typeFilter === key ? "#374151" : "#fff",
                color: typeFilter === key ? "#fff" : "#374151",
              }}>{label}</button>
            ))}
            <div style={{ width: 1, height: 18, background: "#e5e7eb", margin: "0 0.25rem" }} />
            {/* Filtre zones */}
            {zones.map((z) => (
              <button key={z.id} onClick={() => setActiveZone(activeZone === z.id ? null : z.id)} style={{
                fontSize: "0.76rem", padding: "0.2rem 0.65rem", borderRadius: "20px",
                border: `1.5px solid ${z.couleur || "#22c55e"}`, cursor: "pointer",
                background: activeZone === z.id ? (z.couleur || "#22c55e") : "#fff",
                color: activeZone === z.id ? "#fff" : (z.couleur || "#22c55e"),
                fontWeight: 600,
              }}>{z.nom}</button>
            ))}
            {activeZone && (
              <button onClick={() => setActiveZone(null)} style={{ fontSize: "0.76rem", padding: "0.2rem 0.5rem", borderRadius: "20px", border: "1px solid #d1d5db", background: "#f3f4f6", cursor: "pointer" }}>
                Tout afficher ✕
              </button>
            )}
          </div>

          <MapContainer center={DEFAULT_CENTER} zoom={6} style={{ flex: 1 }} scrollWheelZoom>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {fitPoints.length > 0 && <FitBounds points={fitPoints} />}

            {/* Cercles de zones */}
            {zones.map((z) => (
              <ZoneCircle
                key={z.id}
                zone={z}
                active={activeZone === z.id}
                onClick={() => setActiveZone(activeZone === z.id ? null : z.id)}
                containerCount={containers.filter((c) => c.zone_id === z.id).length}
              />
            ))}

            {/* Marqueurs conteneurs */}
            {visibleContainers.map((c) => {
              const coords = parseCoords(c.position);
              if (!coords) return null;
              const measure = fillMap[c.id];
              const pct = measure?.taux_remplissage ?? 0;
              const color = measure ? fillColor(pct) : "#6b7280";
              return (
                <Marker key={c.id} position={coords} icon={makeIcon(color)}>
                  <Popup>
                    <div style={{ minWidth: 170 }}>
                      <strong style={{ fontSize: "0.95rem" }}>{c.code}</strong>
                      <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "#6b7280" }}>{TYPE_LABELS[c.type] ?? c.type}</p>
                      {measure ? (
                        <p style={{ margin: "0.2rem 0", fontSize: "0.85rem" }}>
                          <span style={{ color }}>●</span> <strong>{pct}%</strong> — {fillLabel(pct)}
                        </p>
                      ) : (
                        <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.5 }}>Aucune mesure IoT</p>
                      )}
                      <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", opacity: 0.6 }}>
                        {c.capacite_litres ? `Capacité : ${c.capacite_litres} L` : ""}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="map-sidebar">
          {/* Zones summary */}
          {zones.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <h3 style={{ margin: "0 0 0.6rem", fontSize: "0.9rem" }}>Zones</h3>
              {zones.map((z) => {
                const count = containers.filter((c) => c.zone_id === z.id).length;
                const isActive = activeZone === z.id;
                return (
                  <div key={z.id} onClick={() => setActiveZone(isActive ? null : z.id)} style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.5rem 0.6rem", borderRadius: "8px", marginBottom: "0.4rem",
                    background: isActive ? "#f0f9ff" : "#f9fafb",
                    border: `1.5px solid ${isActive ? (z.couleur || "#22c55e") : "#e5e7eb"}`,
                    cursor: "pointer",
                  }}>
                    <span style={{ width: 12, height: 12, borderRadius: "50%", background: z.couleur || "#22c55e", flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: "0.85rem", fontWeight: 600 }}>{z.nom}</span>
                    <span style={{ fontSize: "0.8rem", opacity: 0.6 }}>{count} ctr.</span>
                  </div>
                );
              })}
            </div>
          )}

          <h2 style={{ marginBottom: "0.6rem" }}>
            Conteneurs ({sidebarContainers.length})
            {activeZone && zones.find(z => z.id === activeZone) && (
              <span style={{ fontSize: "0.75rem", fontWeight: 400, opacity: 0.6, marginLeft: "0.4rem" }}>
                — {zones.find(z => z.id === activeZone)?.nom}
              </span>
            )}
          </h2>

          <div className="map-list" style={{ maxHeight: "360px", overflowY: "auto" }}>
            {sidebarContainers.length === 0 && (
              <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Aucun conteneur dans cette sélection.</p>
            )}
            {sidebarContainers.map((c) => {
              const measure = fillMap[c.id];
              const pct = measure?.taux_remplissage ?? null;
              const hasCoords = Boolean(parseCoords(c.position));
              return (
                <div className="map-list-item" key={c.id}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "0.88rem" }}>
                      {c.code}
                      {!hasCoords && <span style={{ fontSize: "0.68rem", opacity: 0.4, marginLeft: "0.3rem" }}>(sans GPS)</span>}
                    </h3>
                    <p style={{ margin: "0.1rem 0 0", fontSize: "0.76rem", opacity: 0.55 }}>
                      {TYPE_LABELS[c.type] ?? c.type}
                    </p>
                  </div>
                  {pct !== null ? (
                    <span style={{
                      fontSize: "0.82rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                      borderRadius: "12px", background: pct >= 90 ? "#fee2e2" : pct >= 70 ? "#fef3c7" : "#dcfce7",
                      color: pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e",
                    }}>{pct}%</span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", opacity: 0.35 }}>—</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="map-legend" style={{ marginTop: "1rem" }}>
            <h3>Remplissage</h3>
            <p><span className="legend-dot normal" /> Normal (&lt; 70%)</p>
            <p><span className="legend-dot warning" /> Attention (70–89%)</p>
            <p><span className="legend-dot critical" /> Critique (≥ 90%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
