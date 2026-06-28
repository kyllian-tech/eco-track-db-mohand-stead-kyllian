import { useMemo, useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { getContainers, createContainer, deleteContainer } from "../api/containers";
import { getMeasurements, createMeasurement } from "../api/measurements";
import { getZones } from "../api/zones";

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const TYPES_DECHETS = [
  { value: "OMR", label: "OMR (Ordures Ménagères Résiduelles)" },
  { value: "RECYCLABLE", label: "Recyclable" },
  { value: "VERRE", label: "Verre" },
  { value: "COMPOST", label: "Compost" },
];

function getStatusFromFill(fillLevel) {
  if (fillLevel >= 90) return "Critique";
  if (fillLevel >= 70) return "Attention";
  return "Normal";
}

function getStatusClass(status) {
  if (status === "Critique") return "red";
  if (status === "Attention") return "orange";
  return "green";
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return dateStr;
  }
}

function typeLabel(type) {
  return TYPES_DECHETS.find(t => t.value === type)?.label || type || "—";
}

function Containers() {
  const { showToast } = useToast();

  const [containers, setContainers] = useState([]);
  const [zones, setZones] = useState([]);
  const [fillMap, setFillMap] = useState({}); // { container_id: { taux, timestamp } }
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sortBy, setSortBy] = useState("fill-desc");

  const [newContainer, setNewContainer] = useState({
    code: "",
    type: "OMR",
    capacite_litres: "",
    zone_id: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [containersData, zonesData, measurementsData] = await Promise.all([
          getContainers(),
          getZones(),
          getMeasurements({ limit: 500 }),
        ]);

        // Dernière mesure par conteneur (les mesures arrivent triées par timestamp desc)
        const map = {};
        for (const m of measurementsData) {
          if (!map[m.container_id]) {
            map[m.container_id] = { taux: m.taux_remplissage, timestamp: m.timestamp };
          }
        }

        setContainers(containersData);
        setZones(zonesData);
        setFillMap(map);

        // Préselectionner la première zone dans le formulaire
        if (zonesData.length > 0) {
          setNewContainer(c => ({ ...c, zone_id: zonesData[0].id }));
        }
      } catch {
        showToast("Erreur lors du chargement des données.", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getZoneName = (zone_id) => {
    const zone = zones.find(z => z.id === zone_id);
    return zone?.nom || zone?.name || zone_id?.slice(0, 8) || "—";
  };

  const enriched = useMemo(() => {
    return containers.map(c => {
      const fill = fillMap[c.id];
      const fillLevel = fill?.taux ?? 0;
      return {
        ...c,
        fillLevel,
        status: getStatusFromFill(fillLevel),
        zoneName: getZoneName(c.zone_id),
        lastUpdate: fill?.timestamp ? formatDate(fill.timestamp) : (c.derniere_maintenance ? formatDate(c.derniere_maintenance) : "Aucune mesure"),
        sensor: fill ? "Actif" : "Inactif",
      };
    });
  }, [containers, fillMap, zones]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewContainer(current => ({ ...current, [name]: value }));
  };

  const selectedZone = zones.find((z) => z.id === newContainer.zone_id);

  const coordStatus = useMemo(() => {
    const lat = parseFloat(newContainer.latitude);
    const lng = parseFloat(newContainer.longitude);
    if (!selectedZone?.center_lat || isNaN(lat) || isNaN(lng)) return null;
    const dist = haversineKm(selectedZone.center_lat, selectedZone.center_lng, lat, lng);
    return { dist: dist.toFixed(1), valid: dist <= selectedZone.rayon_km };
  }, [newContainer.latitude, newContainer.longitude, selectedZone]);

  const handleAddContainer = async (event) => {
    event.preventDefault();
    const { code, type, capacite_litres, zone_id, latitude, longitude } = newContainer;

    if (!code.trim() || !type || !capacite_litres || !zone_id || !latitude || !longitude) {
      showToast("Veuillez remplir tous les champs.", "error");
      return;
    }

    if (coordStatus && !coordStatus.valid) {
      showToast(
        `Coordonnées hors zone (${coordStatus.dist} km du centre, rayon max : ${selectedZone.rayon_km} km).`,
        "error"
      );
      return;
    }

    try {
      const created = await createContainer({
        code: code.trim(),
        type,
        capacite_litres: Number(capacite_litres),
        position: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)],
        },
        zone_id,
      });

      setContainers(current => [created, ...current]);
      setNewContainer({
        code: "",
        type: "OMR",
        capacite_litres: "",
        zone_id: zones[0]?.id || "",
        latitude: "",
        longitude: "",
      });
      showToast("Conteneur ajouté avec succès.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de l'ajout.", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContainer(id);
      setContainers(current => current.filter(c => c.id !== id));
      setFillMap(current => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      showToast("Conteneur supprimé.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la suppression.", "error");
    }
  };

  const handleSimulateUpdate = async (container) => {
    const currentFill = fillMap[container.id]?.taux ?? 0;
    const nextFill = Math.min(currentFill + 8, 100);

    try {
      const measurement = await createMeasurement({
        container_id: container.id,
        taux_remplissage: nextFill,
      });

      setFillMap(current => ({
        ...current,
        [container.id]: { taux: nextFill, timestamp: measurement?.timestamp || new Date().toISOString() },
      }));
      showToast("Mesure IoT enregistrée.", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Erreur lors de la simulation.", "error");
    }
  };

  const filteredContainers = useMemo(() => {
    const result = enriched.filter(container => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        container.code?.toLowerCase().includes(search) ||
        container.type?.toLowerCase().includes(search) ||
        container.zoneName?.toLowerCase().includes(search);
      const matchesStatus = statusFilter === "Tous" || container.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sortBy === "fill-desc") return b.fillLevel - a.fillLevel;
      if (sortBy === "fill-asc") return a.fillLevel - b.fillLevel;
      if (sortBy === "name") return (a.code || "").localeCompare(b.code || "");
      return 0;
    });
  }, [enriched, searchTerm, statusFilter, sortBy]);

  const criticalCount = enriched.filter(c => c.status === "Critique").length;
  const attentionCount = enriched.filter(c => c.status === "Attention").length;
  const averageFill = enriched.length
    ? Math.round(enriched.reduce((sum, c) => sum + c.fillLevel, 0) / enriched.length)
    : 0;

  if (loading) {
    return (
      <div className="containers-page-pro">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">Supervision IoT</span>
            <h1>Conteneurs</h1>
          </div>
        </div>
        <p style={{ padding: "2rem" }}>Chargement des données…</p>
      </div>
    );
  }

  return (
    <div className="containers-page-pro">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">Supervision IoT</span>
          <h1>Conteneurs</h1>
          <p>
            Gérez les conteneurs connectés, surveillez les niveaux de
            remplissage et identifiez les priorités de collecte.
          </p>
        </div>
      </div>

      <div className="containers-overview">
        <div className="overview-card">
          <span>Total conteneurs</span>
          <strong>{enriched.length}</strong>
        </div>

        <div className="overview-card danger">
          <span>Critiques</span>
          <strong>{criticalCount}</strong>
        </div>

        <div className="overview-card warning">
          <span>En attention</span>
          <strong>{attentionCount}</strong>
        </div>

        <div className="overview-card success">
          <span>Remplissage moyen</span>
          <strong>{averageFill}%</strong>
        </div>
      </div>

      <section className="panel-pro">
        <h2 className="section-title">Ajouter un conteneur</h2>

        <form className="manager-container-form" onSubmit={handleAddContainer}>
          <div className="form-group">
            <label>Code</label>
            <input
              type="text"
              name="code"
              placeholder="Ex : CTR-042"
              value={newContainer.code}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Type de déchet</label>
            <select name="type" value={newContainer.type} onChange={handleChange}>
              {TYPES_DECHETS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Capacité (L)</label>
            <input
              type="number"
              name="capacite_litres"
              placeholder="Ex : 1000"
              min="1"
              value={newContainer.capacite_litres}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Zone</label>
            <select name="zone_id" value={newContainer.zone_id} onChange={handleChange}>
              {zones.map(z => (
                <option key={z.id} value={z.id}>{z.nom || z.name || z.id}</option>
              ))}
              {zones.length === 0 && <option value="">Aucune zone disponible</option>}
            </select>
            {selectedZone?.center_lat && (
              <small style={{ opacity: 0.6, fontSize: "0.75rem" }}>
                Centre : {selectedZone.center_lat.toFixed(4)}, {selectedZone.center_lng.toFixed(4)} — rayon {selectedZone.rayon_km} km
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              name="latitude"
              placeholder={selectedZone?.center_lat ? `Ex : ${selectedZone.center_lat.toFixed(4)}` : "Ex : 48.8566"}
              step="any"
              value={newContainer.latitude}
              onChange={handleChange}
              style={coordStatus ? { borderColor: coordStatus.valid ? "#22c55e" : "#ef4444" } : {}}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              name="longitude"
              placeholder={selectedZone?.center_lng ? `Ex : ${selectedZone.center_lng.toFixed(4)}` : "Ex : 2.3522"}
              step="any"
              value={newContainer.longitude}
              onChange={handleChange}
              style={coordStatus ? { borderColor: coordStatus.valid ? "#22c55e" : "#ef4444" } : {}}
            />
            {coordStatus && (
              <small style={{ color: coordStatus.valid ? "#16a34a" : "#ef4444", fontSize: "0.75rem" }}>
                {coordStatus.valid
                  ? `✓ Dans la zone (${coordStatus.dist} km du centre)`
                  : `✗ Hors zone (${coordStatus.dist} km — max ${selectedZone.rayon_km} km)`}
              </small>
            )}
          </div>

          <button type="submit" className="primary-btn">
            Ajouter
          </button>
        </form>
      </section>

      <section className="panel-pro">
        <div className="panel-toolbar">
          <div className="search-box-pro">
            <span className="search-label">Recherche</span>
            <input
              type="text"
              placeholder="Code, type ou zone..."
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="select-pro"
            value={sortBy}
            onChange={event => setSortBy(event.target.value)}
          >
            <option value="fill-desc">Remplissage décroissant</option>
            <option value="fill-asc">Remplissage croissant</option>
            <option value="name">Code</option>
          </select>
        </div>

        <div className="filters-pro">
          {["Tous", "Critique", "Attention", "Normal"].map(status => (
            <button
              type="button"
              key={status}
              className={statusFilter === status ? "active" : ""}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredContainers.length === 0 ? (
          <div className="empty-state-pro">
            <h3>Aucun conteneur trouvé</h3>
            <p>Modifiez votre recherche ou vos filtres.</p>
          </div>
        ) : (
          <div className="containers-grid-pro">
            {filteredContainers.map(container => (
              <article className="container-card" key={container.id}>
                <div className="card-header">
                  <div>
                    <h3>{container.code}</h3>
                    <p>{typeLabel(container.type)}</p>
                  </div>

                  <div className="card-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleSimulateUpdate(container)}
                      title="Simuler une mesure IoT (+8%)"
                    >
                      +
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(container.id)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <span className={`status-badge ${getStatusClass(container.status)}`}>
                  {container.status}
                </span>

                <div className="container-meta-grid">
                  <div>
                    <span>Zone</span>
                    <strong>{container.zoneName}</strong>
                  </div>

                  <div>
                    <span>Capacité</span>
                    <strong>{container.capacite_litres} L</strong>
                  </div>

                  <div>
                    <span>Capteur</span>
                    <strong>{container.sensor}</strong>
                  </div>

                  <div>
                    <span>Mise à jour</span>
                    <strong>{container.lastUpdate}</strong>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Remplissage</span>
                    <strong>{container.fillLevel}%</strong>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${getStatusClass(container.status)}`}
                      style={{ width: `${container.fillLevel}%` }}
                    ></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Containers;
